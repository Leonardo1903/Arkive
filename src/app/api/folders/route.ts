import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { folders } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryOwnerId = searchParams.get("ownerId");
    const parentId = searchParams.get("parentId");

    // Verify the user is requesting their own folders
    if (!queryOwnerId || queryOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch folders from database based on parentId
    let userFolders;
    if (parentId) {
      // Fetch folders within a specific parent folder
      userFolders = await db
        .select()
        .from(folders)
        .where(and(eq(folders.ownerId, userId), eq(folders.parentId, parentId)));
    } else {
      // Fetch root-level folders (where parentId is null)
      userFolders = await db
        .select()
        .from(folders)
        .where(and(eq(folders.ownerId, userId), isNull(folders.parentId)));
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