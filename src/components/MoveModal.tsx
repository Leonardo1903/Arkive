"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FolderOption } from "@/types";

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: "file" | "folder";
  currentFolderId: string | null;
  userId?: string;
  onMoveSuccess?: () => void;
}

export default function MoveModal({
  isOpen,
  onClose,
  itemId,
  itemType,
  userId,
  onMoveSuccess,
}: MoveModalProps) {
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<
    string | null | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchFolders = async () => {
      setFetching(true);
      try {
        const res = await axios.get<FolderOption[]>("/api/folders", {
          params: { ownerId: userId, parentId: null },
        });
        setFolders(res.data || []);
        setSelectedFolder(null);
      } catch (err) {
        console.error("Failed to fetch folders:", err);
        toast.error("Failed to load folders");
      } finally {
        setFetching(false);
      }
    };

    fetchFolders();
  }, [isOpen, userId]);

  const handleMove = async () => {
    if (selectedFolder === undefined) {
      toast.error("Please select a destination folder");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        itemType === "file"
          ? `/api/files/${itemId}/update`
          : `/api/folders/${itemId}/update`;

      await axios.patch(endpoint, {
        parentId: selectedFolder,
      });

      toast.success(
        `${itemType === "file" ? "File" : "Folder"} moved successfully`
      );
      onMoveSuccess?.();
      onClose();
    } catch (err) {
      console.error(`Failed to move ${itemType}:`, err);
      toast.error(`Failed to move ${itemType}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Move {itemType === "file" ? "File" : "Folder"}
          </DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div
              className={`p-3 rounded-lg border cursor-pointer transition ${
                selectedFolder === null
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
              }`}
              onClick={() => setSelectedFolder(null)}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span className="text-sm font-medium">My Files</span>
              </div>
            </div>

            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedFolder === folder.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  <span className="text-sm font-medium">{folder.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={loading || fetching}>
            {loading ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
