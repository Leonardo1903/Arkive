import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { folders } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryOwnerId = searchParams.get("ownerId");
    const parentId = searchParams.get("parentId");
    const folderId = searchParams.get("folderId");
    const starred = searchParams.get("starred");
    const trashed = searchParams.get("trashed");

    if (!queryOwnerId || queryOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (folderId) {
      const [folder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.ownerId, userId), 
            eq(folders.id, folderId))
        );

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }

      return NextResponse.json(folder);
    }

    // If starred filter is requested
    if (starred === "true") {
      const userFolders = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.ownerId, userId),
            eq(folders.isStarred, true),
            eq(folders.isTrashed, false)
          )
        );
      return NextResponse.json(userFolders);
    }

    // If trashed filter is requested
    if (trashed === "true") {
      const userFolders = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.ownerId, userId),
            eq(folders.isTrashed, true)
          )
        );
      return NextResponse.json(userFolders);
    }

    let userFolders;
    if (parentId) {
      userFolders = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.ownerId, userId), 
            eq(folders.parentId, parentId),
            eq(folders.isTrashed, false)
          )
        );
    } else {
      userFolders = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.ownerId, userId), 
            isNull(folders.parentId),
            eq(folders.isTrashed, false)
          )
        );
    }

    return NextResponse.json(userFolders);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}