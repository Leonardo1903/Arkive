"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useClerk, useUser } from "@clerk/nextjs";
import axios from "axios";
import UploadModal from "@/components/UploadModal";

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
  const [query, setQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [results, setResults] = useState<{
    files: FileResult[];
    folders: FolderResult[];
  }>({
    files: [],
    folders: [],
  });

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/sign-in" });
    toast.success("Signed out successfully");
  };

  const handleSearch = async () => {
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
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

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
                      <span className="text-xs text-muted-foreground">
                        {file.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.folders?.length > 0 && (
                <div className="pt-1">
                  <div className="text-xs text-muted-foreground px-2 py-1">
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
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6"
          onClick={() => setUploadModalOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
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
        onUploaded={handleUploaded}
      />
    </div>
  );
}
