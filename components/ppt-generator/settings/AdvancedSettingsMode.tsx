"use client";

import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PptSettingsStateType } from "@/lib/types";
import { cn } from "@/lib/utils/general";
import { combineWithDefaultSettings } from "@/lib/utils/ppt-generator/settings-generator";
import {
  AlertCircle,
  Check,
  Code2,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Terminal,
  Upload,
  Zap,
} from "lucide-react";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

// Custom font imports via Google Fonts (JetBrains Mono for code)
const MONO_FONT = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";

type ValidationResult = {
  isValid: boolean;
  error?: string;
  errorLine?: number;
};

const AdvancedSettingsMode = () => {
  const { form, settingsValues } = usePptGeneratorFormContext();
  const { reset } = form;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [jsonText, setJsonText] = useState("");
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cursorLine, setCursorLine] = useState(1);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);

  // Initialize JSON from current settings
  useEffect(() => {
    const settingsJson = JSON.stringify(settingsValues, null, 2);
    setJsonText(settingsJson);
    setHasUnsavedChanges(false);
  }, []);

  // Validate JSON on change
  const validateJson = useCallback((text: string): ValidationResult => {
    if (!text.trim()) {
      return { isValid: false, error: "JSON cannot be empty" };
    }

    try {
      JSON.parse(text);
      return { isValid: true };
    } catch (e) {
      if (e instanceof SyntaxError) {
        // Try to extract line number from error message
        const match = e.message.match(/position (\d+)/);
        let errorLine = 1;
        if (match) {
          const position = parseInt(match[1], 10);
          const textUpToError = text.substring(0, position);
          errorLine = (textUpToError.match(/\n/g) || []).length + 1;
        }
        return {
          isValid: false,
          error: e.message,
          errorLine,
        };
      }
      return { isValid: false, error: "Invalid JSON" };
    }
  }, []);

  // Handle text change
  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setJsonText(newText);
      setValidation(validateJson(newText));
      setHasUnsavedChanges(true);
    },
    [validateJson]
  );

  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Track cursor line
  const handleSelect = useCallback(() => {
    if (textareaRef.current) {
      const text = textareaRef.current.value;
      const selectionStart = textareaRef.current.selectionStart;
      const textUpToCursor = text.substring(0, selectionStart);
      const line = (textUpToCursor.match(/\n/g) || []).length + 1;
      setCursorLine(line);
    }
  }, []);

  // Calculate line numbers
  const lineCount = useMemo(() => {
    return jsonText.split("\n").length;
  }, [jsonText]);

  // Apply settings
  const applySettings = useCallback(() => {
    if (!validation.isValid) {
      toast.error("Cannot apply invalid JSON");
      return;
    }

    try {
      const parsed = JSON.parse(jsonText) as PptSettingsStateType;
      const mergedSettings = combineWithDefaultSettings(parsed);
      reset(mergedSettings);
      setHasUnsavedChanges(false);

      // Success animation
      setShowSuccessFlash(true);
      setTimeout(() => setShowSuccessFlash(false), 600);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      toast.success("Settings applied successfully", {
        description: "Your JSON configuration has been loaded",
      });
    } catch (e) {
      toast.error("Failed to apply settings");
    }
  }, [jsonText, validation.isValid, reset]);

  // Reset to current form values
  const resetToFormValues = useCallback(() => {
    const settingsJson = JSON.stringify(settingsValues, null, 2);
    setJsonText(settingsJson);
    setValidation({ isValid: true });
    setHasUnsavedChanges(false);
    toast.info("Reset to current settings");
  }, [settingsValues]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(jsonText);
    toast.success("Copied to clipboard");
  }, [jsonText]);

  // Format/prettify JSON
  const formatJson = useCallback(() => {
    if (!validation.isValid) {
      toast.error("Cannot format invalid JSON");
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      toast.success("JSON formatted");
    } catch {
      toast.error("Failed to format JSON");
    }
  }, [jsonText, validation.isValid]);

  // Export to file
  const exportToFile = useCallback(() => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `khen-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Settings exported");
  }, [jsonText]);

  // Import from file
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        // Validate before setting
        const validationResult = validateJson(text);
        if (validationResult.isValid) {
          // Try to format it nicely
          const parsed = JSON.parse(text);
          const formatted = JSON.stringify(parsed, null, 2);
          setJsonText(formatted);
          setValidation({ isValid: true });
          setHasUnsavedChanges(true);
          toast.success("File imported successfully");
        } else {
          setJsonText(text);
          setValidation(validationResult);
          setHasUnsavedChanges(true);
          toast.warning("File imported but contains invalid JSON");
        }
      } catch {
        toast.error("Failed to read file");
      }

      e.target.value = "";
    },
    [validateJson]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="relative mb-4 overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        {/* Animated background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Glow effect */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-lg bg-cyan-500/20 blur-md" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-slate-900/80">
                <Terminal className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight text-slate-100">
                Advanced Mode
              </h3>
              <p className="text-xs text-slate-400">
                Direct JSON configuration editor
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                Unsaved
              </span>
            )}
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all duration-300",
                validation.isValid
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border border-red-500/30 bg-red-500/10 text-red-400"
              )}
            >
              {validation.isValid ? (
                <>
                  <Check className="h-3 w-3" />
                  Valid
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Invalid
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={applySettings}
                disabled={!validation.isValid || !hasUnsavedChanges}
                className={cn(
                  "gap-1.5 border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300",
                  isAnimating && "animate-pulse"
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                Apply
              </Button>
            </TooltipTrigger>
            <TooltipContent>Apply JSON to settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToFormValues}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset to current settings</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatJson}
                disabled={!validation.isValid}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Format
              </Button>
            </TooltipTrigger>
            <TooltipContent>Prettify JSON</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy to clipboard</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImportClick}
                className="gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Import
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import from file</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportToFile}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export to file</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>

      {/* Error display */}
      {!validation.isValid && validation.error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <div className="flex items-start gap-2 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="font-medium">Syntax Error</span>
              {validation.errorLine && (
                <span className="ml-1 text-red-400/70">
                  (line {validation.errorLine})
                </span>
              )}
              <p className="mt-0.5 text-xs text-red-400/80">
                {validation.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        className={cn(
          "relative flex-1 overflow-hidden rounded-xl border transition-all duration-300",
          validation.isValid
            ? "border-slate-700/50 bg-slate-950"
            : "border-red-500/30 bg-slate-950",
          showSuccessFlash && "ring-2 ring-emerald-500/50"
        )}
      >
        {/* Editor header bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-slate-500" />
            <span
              className="text-xs text-slate-500"
              style={{ fontFamily: MONO_FONT }}
            >
              settings.json
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span style={{ fontFamily: MONO_FONT }}>
              Ln {cursorLine}, Col 1
            </span>
            <span style={{ fontFamily: MONO_FONT }}>{lineCount} lines</span>
          </div>
        </div>

        {/* Code editor with line numbers */}
        <div className="relative flex h-[calc(100%-40px)]">
          {/* Line numbers */}
          <div
            ref={lineNumbersRef}
            className="pointer-events-none w-12 shrink-0 select-none overflow-hidden border-r border-slate-800 bg-slate-900/30 py-3 text-right"
            style={{ fontFamily: MONO_FONT }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i + 1}
                className={cn(
                  "px-2 text-xs leading-[1.625rem]",
                  cursorLine === i + 1
                    ? "bg-slate-800/50 text-cyan-400"
                    : "text-slate-600",
                  validation.errorLine === i + 1 &&
                    "bg-red-500/20 text-red-400"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <ScrollArea className="flex-1">
            <textarea
              ref={textareaRef}
              value={jsonText}
              onChange={handleTextChange}
              onScroll={handleScroll}
              onSelect={handleSelect}
              onKeyUp={handleSelect}
              onClick={handleSelect}
              spellCheck={false}
              className={cn(
                "h-full min-h-[400px] w-full resize-none bg-transparent p-3 text-sm leading-[1.625rem] text-slate-200 outline-none",
                "placeholder:text-slate-600"
              )}
              style={{
                fontFamily: MONO_FONT,
                tabSize: 2,
              }}
              placeholder="Paste or type your JSON settings here..."
            />
          </ScrollArea>
        </div>

        {/* Subtle gradient overlay at bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      {/* Footer tips */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">
          Ctrl+V
        </span>
        <span>to paste</span>
        <span className="text-slate-700">|</span>
        <span>Changes are not saved until you click Apply</span>
      </div>
    </div>
  );
};

export default AdvancedSettingsMode;
