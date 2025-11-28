import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { folders } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(request: NextRequest, props: { params: Promise<{ folderId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { folderId } = await props.params;
    if (!folderId) {
      return NextResponse.json(
        { error: "Folder ID is required" },
        { status: 400 }
      );
    }

    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folderId), eq(folders.ownerId, userId)));

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const updatedFolders = await db
      .update(folders)
      .set({ isTrashed: !folder.isTrashed })
      .where(and(eq(folders.id, folderId), eq(folders.ownerId, userId)))
      .returning();

    const updatedFolder = updatedFolders[0];

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Error updating folder trash status:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}