"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { FileText, Image, Video, Folder } from "lucide-react";
import {
  FileCategory,
  StorageResponse,
  StorageCategory,
  formatSize,
  formatDateTime,
} from "@/types";

const iconMap: Record<FileCategory, typeof FileText> = {
  documents: FileText,
  images: Image,
  videos: Video,
  others: Folder,
};

const colorMap: Record<FileCategory, string> = {
  documents: "bg-primary/10 text-primary",
  images: "bg-chart-4/20 text-chart-4",
  videos: "bg-chart-2/20 text-chart-2",
  others: "bg-chart-5/20 text-chart-5",
};

export default function Overview() {
  const [data, setData] = useState<StorageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStorage = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<StorageResponse>("/api/storage");
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load storage data");
      toast.error("Failed to load storage data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorage();
  }, [fetchStorage]);

  useEffect(() => {
    const handler = () => fetchStorage();
    window.addEventListener("files:updated", handler);
    return () => window.removeEventListener("files:updated", handler);
  }, [fetchStorage]);

  const percentageUsed = data?.percentageUsed ?? 0;
  const totalUsed = data ? formatSize(data.totalUsed) : "--";
  const totalAvailable = data ? formatSize(data.totalAvailable) : "--";

  const categories = useMemo(() => {
    if (!data?.categories) return [] as StorageCategory[];
    return data.categories;
  }, [data]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-2xl border-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold mb-2">
              {loading ? "--" : `${percentageUsed}%`}
            </div>
            <div className="text-primary-foreground/80 text-xs">Space used</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold mb-1">Available Storage</div>
            <div className="text-primary-foreground/80 text-sm">
              {loading ? "--" : `${totalUsed} / ${totalAvailable}`}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="12"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="12"
              strokeDasharray="251.2"
              strokeDashoffset={
                loading ? 251.2 : 251.2 * (1 - percentageUsed / 100)
              }
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {loading && (
          <div className="text-sm text-muted-foreground col-span-2">
            Loading storage...
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-destructive col-span-2">{error}</div>
        )}
        {!loading &&
          !error &&
          categories.map((category) => {
            const Icon = iconMap[category.type] ?? Folder;
            const color = colorMap[category.type] ?? "bg-muted text-foreground";
            return (
              <Card
                key={category.type}
                className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div
                      className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-right">
                      {formatSize(category.size)}
                    </div>
                  </div>

                  <div className="text-foreground font-semibold text-sm">
                    {category.name}
                  </div>

                  <div className="border-t border-border pt-2">
                    <div className="text-muted-foreground text-xs text-center">
                      Last update
                    </div>
                    <div className="text-foreground text-xs text-center font-medium mt-0.5">
                      {formatDateTime(category.lastUpdate)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
