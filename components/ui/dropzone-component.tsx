"use client";
import { cn } from "@/lib/utils";
import React, { HTMLAttributes, useCallback } from "react";
import { Accept, useDropzone } from "react-dropzone";

type DropzoneComponentProps = HTMLAttributes<HTMLInputElement> & {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: Accept;
  maxFiles?: number;
  description?: string;
};

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  className,
  onFilesSelected,
  acceptedFileTypes,
  maxFiles,
  description = "Drag and drop your file here.",
  ...props
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("ACCEPTED FILE:", acceptedFiles); // TODO: remove this
      onFilesSelected(acceptedFiles); // Call the passed callback function
    },
    [onFilesSelected],
  );
  // TODO: implement handler on error, for example: file not accepted, too many files etc.

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles,
    accept: acceptedFileTypes,
  });

  return (
    <div
      {...getRootProps()}
      className={cn("rounded-lg border px-2 py-5 text-center", className)}
    >
      <input {...getInputProps()} {...props} />
      <div>{description}</div>
    </div>
  );
};

export default DropzoneComponent;
