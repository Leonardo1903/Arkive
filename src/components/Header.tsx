"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LogOut, Plus, FolderPlus, FileUp } from "lucide-react";
import { toast } from "sonner";
import { useClerk, useUser } from "@clerk/nextjs";
import axios from "axios";
import UploadModal from "@/components/UploadModal";
import CreateFolderModal from "@/components/CreateFolderModal";

type FileResult = {
  id: string;
  name: string;
  type: string;
  folderId: string | null;
};

type FolderResult = {
  id: string;
  name: string;
};

export default function Header() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");
  const [query, setQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<{
    files: FileResult[];
    folders: FolderResult[];
  }>({
    files: [],
    folders: [],
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setNewMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/sign-in" });
    toast.success("Signed out successfully");
  };

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) {
      setResults({ files: [], folders: [] });
      return;
    }

    try {
      const res = await axios.get("/api/search", { params: { q } });
      setResults({
        files: res.data?.files ?? [],
        folders: res.data?.folders ?? [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    }
  }, [query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, handleSearch]);

  const handleNavigate = (
    item: FileResult | FolderResult,
    type: "file" | "folder"
  ) => {
    if (type === "file") {
      const file = item as FileResult;
      if (file.folderId) {
        router.push(`/folders/${file.folderId}?file=${file.id}`);
      } else {
        router.push(`/files/${file.id}`);
      }
    } else {
      const folder = item as FolderResult;
      router.push(`/folders/${folder.id}`);
    }
    setResults({ files: [], folders: [] });
    setQuery("");
  };

  const hasResults = useMemo(
    () => (results.files?.length || 0) + (results.folders?.length || 0) > 0,
    [results]
  );

  const handleUploaded = () => {
    window.dispatchEvent(new Event("files:updated"));
  };

  const handleNewFolder = () => {
    setNewMenuOpen(false);
    setCreateFolderModalOpen(true);
  };

  const handleCreateFolder = (name: string) => {
    axios
      .post("/api/folders/create", {
        name,
        ownerId: user?.id,
        parentId: currentFolderId,
      })
      .then(() => {
        toast.success("Folder created");
        window.dispatchEvent(new Event("files:updated"));
      })
      .catch((err) => {
        console.error(err);
        const message =
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response.data.error
            : "Failed to create folder";
        toast.error(message);
      });
  };

  const handleFileUpload = () => {
    setUploadModalOpen(true);
    setNewMenuOpen(false);
  };

  const handleFolderUpload = () => {
    setNewMenuOpen(false);
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.multiple = true;

    input.onchange = async (e: any) => {
      const files: File[] = Array.from(e.target.files);
      if (files.length === 0) return;

      const folderName = files[0].webkitRelativePath.split("/")[0];
      toast.loading(`Uploading folder "${folderName}"...`);

      try {
        const formData = new FormData();
        formData.append("ownerId", user?.id || "");
        if (currentFolderId) {
          formData.append("parentFolderId", currentFolderId);
        }

        // Add files with their full relative paths (including root folder)
        files.forEach((file) => {
          const fullPath = file.webkitRelativePath;
          if (fullPath) {
            formData.append(fullPath, file);
          }
        });

        const response = await axios.post("/api/folders/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.success) {
          toast.dismiss();
          toast.success(
            `Uploaded "${folderName}" with ${response.data.filesUploaded} files`
          );

          // Trigger files:updated event to refresh UI
          window.dispatchEvent(new Event("files:updated"));
        }
      } catch (error) {
        toast.dismiss();
        const message =
          axios.isAxiosError(error) && error.response?.data?.error
            ? error.response.data.error
            : "Failed to upload folder";
        toast.error(message);
      }
    };

    input.click();
  };

  return (
    <div className="flex items-center justify-between mb-8 h-10">
      <div className="relative w-64">
        <Input
          type="search"
          placeholder="Search files and folders"
          className="px-4 py-2 rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-ring"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => toast.message("Type to search")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        {hasResults && (
          <Card className="absolute mt-2 w-full shadow-md z-20 max-h-72 overflow-auto">
            <div className="p-2 space-y-1">
              {results.files?.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    Files
                  </div>
                  {results.files.map((file) => (
                    <button
                      key={`file-${file.id}`}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted flex items-center justify-between"
                      onClick={() => handleNavigate(file, "file")}
                    >
                      <span className="text-sm text-foreground truncate">
                        {file.name}
                      </span>
                    </button>
                  ))}
                  {results.folders.length > 0 && (
                    <>
                      <div className="text-xs text-muted-foreground px-2 py-1 mt-2">
                        Folders
                      </div>
                      {results.folders.map((folder) => (
                        <button
                          key={`folder-${folder.id}`}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted"
                          onClick={() => handleNavigate(folder, "folder")}
                        >
                          <span className="text-sm text-foreground truncate">
                            {folder.name}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6"
            onClick={() => setNewMenuOpen(!newMenuOpen)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
          {newMenuOpen && (
            <Card className="absolute top-full mt-2 right-0 w-48 shadow-lg z-30">
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 rounded-t-lg"
                onClick={handleNewFolder}
              >
                <FolderPlus className="w-4 h-4" />
                <span className="text-sm">New folder</span>
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                onClick={handleFileUpload}
              >
                <FileUp className="w-4 h-4" />
                <span className="text-sm">File upload</span>
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 rounded-b-lg"
                onClick={handleFolderUpload}
              >
                <FolderPlus className="w-4 h-4" />
                <span className="text-sm">Folder upload</span>
              </button>
            </Card>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        ownerId={user?.id}
        folderId={currentFolderId ?? null}
        onUploaded={handleUploaded}
      />

      <CreateFolderModal
        open={createFolderModalOpen}
        onOpenChange={setCreateFolderModalOpen}
        onConfirm={handleCreateFolder}
      />
    </div>
  );
}
