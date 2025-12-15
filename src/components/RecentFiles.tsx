"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Image,
  Video,
  MoreVertical,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type FileIcon = "document" | "image" | "video" | "other";

type RecentFile = {
  id: string;
  folderId: string | null;
  name: string;
  type: string;
  createdAt: string;
};

const iconForExtension = (ext: string): FileIcon => {
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

const colorForIcon: Record<FileIcon, string> = {
  document: "bg-primary/10 text-primary",
  image: "bg-chart-4/20 text-chart-4",
  video: "bg-chart-2/20 text-chart-2",
  other: "bg-chart-5/20 text-chart-5",
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return format(date, "hh:mma, dd MMM");
};

const getFileIcon = (type: string, colorClass: string) => {
  switch (type) {
    case "document":
      return (
        <div
          className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}
        >
          <FileText className="w-5 h-5" />
        </div>
      );
    case "image":
      return (
        <div
          className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}
        >
          <Image className="w-5 h-5" />
        </div>
      );
    case "video":
      return (
        <div
          className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}
        >
          <Video className="w-5 h-5" />
        </div>
      );
    default:
      return (
        <div
          className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}
        >
          <FileText className="w-5 h-5" />
        </div>
      );
  }
};

export default function RecentFiles() {
  const router = useRouter();
  const [filesData, setFilesData] = useState<RecentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/files/recent");
      setFilesData(res.data?.files ?? []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load recent files");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleShowLocation = (file: RecentFile) => {
    if (file.folderId) {
      router.push(`/my-files?folderId=${file.folderId}`);
      return;
    }

    router.push("/my-files");
  };

  const handleStar = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/star`);
      fetchRecent();
    } catch (err) {
      console.error("Failed to star file:", err);
    }
  };

  const handleTrash = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/trash`);
      fetchRecent();
    } catch (err) {
      console.error("Failed to trash file:", err);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  useEffect(() => {
    const handler = () => fetchRecent();
    window.addEventListener("files:updated", handler);
    return () => window.removeEventListener("files:updated", handler);
  }, [fetchRecent]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="text-xs text-muted-foreground">
          Loading recent files...
        </div>
      );
    }
    if (error) {
      return <div className="text-xs text-destructive">{error}</div>;
    }
    if (!filesData.length) {
      return (
        <div className="text-xs text-muted-foreground">
          No recent files available
        </div>
      );
    }

    return filesData.map((file) => {
      const ext = file.name.split(".").pop() || "";
      const icon = iconForExtension(ext);
      const color = colorForIcon[icon];
      return (
        <div
          key={file.id}
          className="flex items-center justify-between py-1.5 hover:bg-muted/50 rounded-lg px-2 transition-colors"
        >
          <div className="flex items-center gap-2">
            {getFileIcon(icon, color)}
            <div>
              <div className="text-xs font-medium">{file.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatTime(file.createdAt)}
              </div>
            </div>
          </div>
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
              <DropdownMenuItem onClick={() => handleShowLocation(file)}>
                <MapPin className="w-4 h-4 mr-2" />
                Show location
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStar(file.id)}>
                <Star className="w-4 h-4 mr-2" />
                Star
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTrash(file.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    });
  }, [error, filesData, loading]);

  return (
    <Card className="p-4 rounded-xl border bg-card h-full">
      <h2 className="text-lg font-semibold">Recent files uploaded</h2>
      <Separator className="mb-2" />
      <div className="space-y-2">{content}</div>
    </Card>
  );
}
