import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files, folders } from "@/lib/schema";
import { eq, and, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ files: [], folders: [] });
    }

    const searchTerm = `%${query}%`;

    const searchedFiles = await db
      .select({
        id: files.id,
        name: files.name,
        folderId: files.folderId,
        type: files.type,
        isStarred: files.isStarred,
        createdAt: files.createdAt,
        url: files.url,
      })
      .from(files)
      .where(
        and(
          eq(files.ownerId, userId),
          eq(files.isTrashed, false),
          like(files.name, searchTerm)
        )
      );

    const searchedFolders = await db
      .select({
        id: folders.id,
        name: folders.name,
        parentId: folders.parentId,
        path: folders.path,
        isStarred: folders.isStarred,
        createdAt: folders.createdAt,
      })
      .from(folders)
      .where(
        and(
          eq(folders.ownerId, userId),
          eq(folders.isTrashed, false),
          like(folders.name, searchTerm)
        )
      );

    return NextResponse.json({
      files: searchedFiles,
      folders: searchedFolders,
    });
  } catch (error) {
    console.error("Error searching files and folders:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
