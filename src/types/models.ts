import { files, folders } from "@/lib/schema";

export type Folder = typeof folders.$inferSelect;
export type File = typeof files.$inferSelect;

export type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt?: string;
  isStarred?: boolean;
  isTrashed?: boolean;
};

export type FileItem = {
  id: string;
  name: string;
  type: string;
  folderId: string | null;
  createdAt: string;
  size?: number;
  url?: string;
  thumbnailUrl?: string;
  isStarred?: boolean;
  isTrashed?: boolean;
};

export type RecentFile = {
  id: string;
  folderId: string | null;
  name: string;
  type: string;
  createdAt: string;
};

export type FileCategory = "documents" | "images" | "videos" | "others";

export type FileIcon = "document" | "image" | "video" | "other";
