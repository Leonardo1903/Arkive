"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type UploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId?: string;
  folderId?: string | null;
  onUploaded?: () => void;
};

export default function UploadModal({
  open,
  onOpenChange,
  ownerId,
  folderId,
  onUploaded,
}: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const truncateFileName = (name: string, maxLength: number = 50) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop() || "";
    const nameWithoutExt = name.slice(0, name.lastIndexOf("."));
    const truncatedName = nameWithoutExt.slice(
      0,
      maxLength - extension.length - 4
    );
    return `${truncatedName}...${extension}`;
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false,
  });

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    try {
      setUploading(true);
      let successCount = 0;
      let failCount = 0;

      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          if (ownerId) formData.append("ownerId", ownerId);
          if (folderId) formData.append("folderId", folderId);

          await axios.post("/api/files/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} file${
            successCount > 1 ? "s" : ""
          } uploaded successfully`
        );
        onUploaded?.();
      }
      if (failCount > 0) {
        toast.error(
          `${failCount} file${failCount > 1 ? "s" : ""} failed to upload`
        );
      }

      onOpenChange(false);
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Drag and drop your file or click to browse
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-primary"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-sm text-center text-muted-foreground">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file${
                    selectedFiles.length > 1 ? "s" : ""
                  } selected`
                : "Drag and drop files or click to upload"}
            </p>
          </div>

          {/* Preview Area */}
          <div className="border rounded-lg p-4 bg-muted/30 max-h-60 overflow-y-auto">
            {selectedFiles.length > 0 ? (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium break-words"
                        title={file.name}
                      >
                        {truncateFileName(file.name)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.type || "Unknown type"} ·{" "}
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                No files selected
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedFiles([]);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
