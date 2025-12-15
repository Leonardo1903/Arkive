"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  FileText,
  Loader2,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";

type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt?: string;
  isTrashed: boolean;
};

type FileItem = {
  id: string;
  name: string;
  type: string;
  folderId: string | null;
  createdAt: string;
  size?: number;
  isTrashed: boolean;
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return format(date, "dd MMM yyyy, h:mm a");
};

const baseName = (name: string) => {
  if (!name) return "";
  const parts = name.split(/[/\\]/);
  return parts[parts.length - 1];
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "--";
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1024 / 1024;
  if (mb >= 0.1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
};

export default function TrashPage() {
  const { user } = useUser();
  const router = useRouter();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [filesData, setFilesData] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emptyingTrash, setEmptyingTrash] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const [foldersRes, filesRes] = await Promise.all([
        axios.get<FolderItem[]>("/api/folders", {
          params: { ownerId: user.id, trashed: "true" },
        }),
        axios.get<FileItem[]>("/api/files", {
          params: { ownerId: user.id, trashed: "true" },
        }),
      ]);

      setFolders(foldersRes.data || []);
      setFilesData(filesRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load trash items");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user?.id, fetchData]);

  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener("files:updated", handler);
    return () => window.removeEventListener("files:updated", handler);
  }, [fetchData]);

  const handleFolderRestore = async (folderId: string) => {
    try {
      await axios.patch(`/api/folders/${folderId}/trash`);
      fetchData();
    } catch (err) {
      console.error("Failed to restore folder", err);
    }
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      await axios.delete(`/api/folders/${folderId}/delete`);
      fetchData();
    } catch (err) {
      console.error("Failed to permanently delete folder", err);
    }
  };

  const handleRestore = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/trash`);
      fetchData();
    } catch (err) {
      console.error("Failed to restore file", err);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await axios.delete(`/api/files/${fileId}/delete`);
      fetchData();
    } catch (err) {
      console.error("Failed to permanently delete file", err);
    }
  };

  const handleEmptyTrash = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete all items in trash? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setEmptyingTrash(true);
      await axios.delete("/api/empty-trash");
      fetchData();
    } catch (err) {
      console.error("Failed to empty trash", err);
      setError("Failed to empty trash");
    } finally {
      setEmptyingTrash(false);
    }
  };

  const empty =
    !loading && !error && folders.length === 0 && filesData.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Trash</h1>
        {!empty && (
          <Button
            variant="destructive"
            onClick={handleEmptyTrash}
            disabled={emptyingTrash}
          >
            {emptyingTrash ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Emptying...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Empty Trash
              </>
            )}
          </Button>
        )}
      </div>

      <Card className="p-5 rounded-2xl border-none bg-transparent shadow-none">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="group p-4 rounded-lg border border-border/60 bg-transparent shadow-none hover:bg-muted/60 hover:shadow-none transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate" title={folder.name}>
                      {folder.name}
                    </div>
                    <div className="text-xs text-muted-foreground">Folder</div>
                    {folder.createdAt && (
                      <div className="text-[11px] text-muted-foreground">
                        Created {formatTime(folder.createdAt)}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">Folder options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleFolderRestore(folder.id)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFolderDelete(folder.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Forever
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}

            {folders.length > 0 && filesData.length > 0 && (
              <div className="col-span-full h-px bg-border" aria-hidden />
            )}

            {filesData.map((file) => (
              <Card
                key={file.id}
                className="group p-4 rounded-lg border border-border/60 bg-white/70 shadow-sm hover:shadow-md hover:bg-white transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="font-semibold truncate" title={file.name}>
                      {baseName(file.name)}
                    </div>
                    {baseName(file.name) !== file.name && (
                      <div
                        className="text-[11px] text-muted-foreground truncate"
                        title={file.name}
                      >
                        {file.name}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Modified {formatTime(file.createdAt)}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">File options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleRestore(file.id)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(file.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Forever
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {empty && !loading && !error && (
          <div className="text-sm text-muted-foreground text-center py-8">
            Trash is empty.
          </div>
        )}
      </Card>
    </div>
  );
}
