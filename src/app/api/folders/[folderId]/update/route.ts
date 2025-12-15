
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { folders } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let folderId: string | null = null;
    type RequestWithParams = NextRequest & { params?: { folderId?: string } };
    const reqWithParams = request as RequestWithParams;
    if (typeof reqWithParams.params === "object" && reqWithParams.params?.folderId) {
      folderId = reqWithParams.params.folderId;
    } else {
      const match = request.url.match(/\/folders\/([^\/]+)\/update/);
      if (match) folderId = match[1];
    }

    const body = await request.json();
    const { name, parentId = null } = body;

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
    }

    if (name && (typeof name !== "string" || name.trim() === "")) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
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
    interface UpdateData {
      name?: string;
      parentId?: string | null;
      path?: string;
    }
    const updateData: UpdateData = {};
    if (name) updateData.name = name.trim();
    if (parentId !== undefined) updateData.parentId = parentId;
    if (parentId && parentFolder) {
      updateData.path = `${parentFolder.path}/${folderId}`;
    }

    const [updatedFolder] = await db
      .update(folders)
      .set(updateData)
      .where(and(eq(folders.id, folderId), eq(folders.ownerId, userId)))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Folder updated successfully",
      folder: updatedFolder,
    });
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}