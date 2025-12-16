import { format } from "date-fns";
import { FileIcon } from "./models";


export const formatSize = (bytes?: number): string => {
  if (!bytes) return "--";
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1024 / 1024;
  if (mb >= 0.1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
};


export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return format(date, "dd MMM yyyy, h:mm a");
};


export const formatShortTime = (iso: string): string => {
  const date = new Date(iso);
  return format(date, "hh:mma, dd MMM");
};


export const formatDateTime = (iso: string | null): string => {
  if (!iso) return "--";
  const date = new Date(iso);
  return format(date, "dd MMM yyyy, h:mm a");
};


export const baseName = (name: string): string => {
  if (!name) return "";
  const parts = name.split(/[/\\]/);
  return parts[parts.length - 1];
};


export const iconForExtension = (ext: string): FileIcon => {
  const lowered = ext.toLowerCase();
  if (
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "heic"].includes(
      lowered
    )
  ) {
    return "image";
  }
  if (
    ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v"].includes(lowered)
  ) {
    return "video";
  }
  return "document";
};


export const colorForIcon: Record<FileIcon, string> = {
  document: "bg-primary/10 text-primary",
  image: "bg-chart-4/20 text-chart-4",
  video: "bg-chart-2/20 text-chart-2",
  other: "bg-chart-5/20 text-chart-5",
};
