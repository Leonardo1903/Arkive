import { FileCategory } from "./models";

export type FileSearchResult = {
  id: string;
  name: string;
  type: string;
  folderId: string | null;
};

export type FolderSearchResult = {
  id: string;
  name: string;
};

export type SearchResponse = {
  files: FileSearchResult[];
  folders: FolderSearchResult[];
};

export type StorageCategory = {
  type: FileCategory;
  name: string;
  size: number;
  lastUpdate: string | null;
};

export type StorageResponse = {
  totalUsed: number;
  totalAvailable: number;
  percentageUsed: number;
  categories: StorageCategory[];
};

export type FolderOption = {
  id: string;
  name: string;
};

export type Breadcrumb = {
  id: string | null;
  name: string;
};
