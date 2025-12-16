"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Breadcrumb as BreadcrumbType } from "@/types";

type BreadcrumbsProps = {
  currentFolderId: string | null;
  userId?: string;
};

export default function Breadcrumbs({
  currentFolderId,
  userId,
}: BreadcrumbsProps) {
  const router = useRouter();
  const [crumbs, setCrumbs] = useState<BreadcrumbType[]>([
    { id: null, name: "My Files" },
  ]);

  const fetchFolderById = useCallback(
    async (id: string) => {
      const res = await axios.get("/api/folders", {
        params: { ownerId: userId, folderId: id },
      });
      return res.data;
    },
    [userId]
  );

  const buildCrumbs = useCallback(async () => {
    if (!userId) return;
    if (!currentFolderId) {
      setCrumbs([{ id: null, name: "My Files" }]);
      return;
    }

    const chain: BreadcrumbType[] = [];
    let walker: string | null = currentFolderId;

    while (walker) {
      try {
        const folder = await fetchFolderById(walker);
        chain.unshift({ id: folder.id, name: folder.name });
        walker = folder.parentId;
      } catch (error) {
        console.error("Error fetching folder:", error);
        break;
      }
    }

    setCrumbs([{ id: null, name: "My Files" }, ...chain]);
  }, [userId, currentFolderId, fetchFolderById]);

  useEffect(() => {
    buildCrumbs();
  }, [buildCrumbs]);

  const handleCrumbClick = (id: string | null, index: number) => {
    if (index === 0 || !id) {
      router.push("/my-files");
      return;
    }
    router.push(`/my-files?folderId=${id}`);
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <div key={`${crumb.id ?? "root"}`} className="contents">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer"
                    onClick={() => handleCrumbClick(crumb.id, idx)}
                  >
                    {crumb.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
