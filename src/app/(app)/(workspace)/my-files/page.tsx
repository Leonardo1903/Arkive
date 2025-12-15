"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
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
  MoveRight,
  Star,
  Trash2,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import MoveModal from "@/components/MoveModal";

type FolderItem = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt?: string;
};

type FileItem = {
  id: string;
  name: string;
  type: string;
  folderId: string | null;
  createdAt: string;
  size?: number;
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

export default function MyFilesPage() {
  const { user } = useUser();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [filesData, setFilesData] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [moveItemType, setMoveItemType] = useState<"file" | "folder" | null>(
    null
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentFolderId = searchParams.get("folderId");

  const fetchData = useCallback(
    async (folderId: string | null) => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);

        const [foldersRes, filesRes] = await Promise.all([
          axios.get<FolderItem[]>("/api/folders", {
            params: { ownerId: user.id, parentId: folderId ?? undefined },
          }),
          axios.get<FileItem[]>("/api/files", {
            params: { ownerId: user.id, folderId: folderId ?? undefined },
          }),
        ]);

        setFolders(foldersRes.data || []);
        setFilesData(filesRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load files");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id) return;
    fetchData(currentFolderId);
  }, [user?.id, currentFolderId, fetchData]);

  useEffect(() => {
    const handler = () => fetchData(currentFolderId);
    window.addEventListener("files:updated", handler);
    return () => window.removeEventListener("files:updated", handler);
  }, [fetchData, currentFolderId]);

  const handleOpenFolder = (folder: FolderItem) => {
    router.push(`/my-files?folderId=${folder.id}`);
  };

  const handleFolderStar = async (folderId: string) => {
    try {
      await axios.patch(`/api/folders/${folderId}/star`);
      fetchData(currentFolderId);
    } catch (err) {
      console.error("Failed to star folder", err);
    }
  };

  const handleFolderTrash = async (folderId: string) => {
    try {
      await axios.patch(`/api/folders/${folderId}/trash`);
      fetchData(currentFolderId);
    } catch (err) {
      console.error("Failed to trash folder", err);
    }
  };

  const handleFolderMove = (folderId: string) => {
    setMoveItemId(folderId);
    setMoveItemType("folder");
    setMoveModalOpen(true);
  };

  const handleStar = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/star`);
      fetchData(currentFolderId);
    } catch (err) {
      console.error("Failed to star file", err);
    }
  };

  const handleTrash = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/trash`);
      fetchData(currentFolderId);
    } catch (err) {
      console.error("Failed to trash file", err);
    }
  };

  const handleMove = (fileId: string) => {
    setMoveItemId(fileId);
    setMoveItemType("file");
    setMoveModalOpen(true);
  };

  const empty =
    !loading && !error && folders.length === 0 && filesData.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs currentFolderId={currentFolderId} userId={user?.id} />
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
                className="group p-4 rounded-lg border border-border/60 bg-transparent shadow-none hover:bg-muted/60 hover:shadow-none transition cursor-pointer"
                onClick={() => handleOpenFolder(folder)}
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
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span className="sr-only">Folder options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderStar(folder.id);
                          }}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Star
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderTrash(folder.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Trash
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderMove(folder.id);
                          }}
                        >
                          <MoveRight className="w-4 h-4 mr-2" />
                          Move
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
                        <DropdownMenuItem onClick={() => handleStar(file.id)}>
                          <Star className="w-4 h-4 mr-2" />
                          Star
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTrash(file.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Trash
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMove(file.id)}>
                          <MoveRight className="w-4 h-4 mr-2" />
                          Move
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
            Nothing here yet. Upload a file or create a folder to get started.
          </div>
        )}
      </Card>

      {moveItemId && moveItemType && (
        <MoveModal
          isOpen={moveModalOpen}
          onClose={() => {
            setMoveModalOpen(false);
            setMoveItemId(null);
            setMoveItemType(null);
          }}
          itemId={moveItemId}
          itemType={moveItemType}
          currentFolderId={currentFolderId}
          userId={user?.id}
          onMoveSuccess={() => fetchData(currentFolderId)}
        />
      )}
    </div>
  );
}
