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

    let userFolders;
    if (parentId) {
      userFolders = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.ownerId, userId), 
            eq(folders.parentId, parentId))
        );
    } else {
      userFolders = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.ownerId, userId), 
            isNull(folders.parentId))
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