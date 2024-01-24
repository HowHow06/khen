"use client";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

type Props = {};

const ThemeSwitcher = ({
  className,
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle Theme"
      className={cn(className)}
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};

export default ThemeSwitcher;
