import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { folders } from "@/lib/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, ownerId: bodyOwnerId, parentId = null } = body;

    if (bodyOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }


    let parentFolder;
    if (parentId) {
      [parentFolder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, parentId),
            eq(folders.ownerId, userId)
          )
        );
      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }
    }
    
    const folderId = uuidv4();
    const folderData = {
      id: folderId,
      ownerId: userId,
      parentId,
      path: parentId && parentFolder ? `${parentFolder.path}/${folderId}` : `/folders/${userId}/${folderId}`,
      name: name.trim(),

    };


    const [newFolder] = await db.insert(folders).values(folderData).returning();

    return NextResponse.json({
      success: true,
      message: "Folder created successfully",
      folder: newFolder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}