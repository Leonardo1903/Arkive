import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files, folders } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let fileId: string | null = null;
    type RequestWithParams = NextRequest & { params?: { fileId?: string } };
    const reqWithParams = request as RequestWithParams;
    if (typeof reqWithParams.params === "object" && reqWithParams.params?.fileId) {
      fileId = reqWithParams.params.fileId;
    } else {
      const match = request.url.match(/\/files\/([^\/]+)\/update/);
      if (match) fileId = match[1];
    }

    const body = await request.json();
    const { parentId = null, ownerId: bodyOwnerId } = body;

    if (bodyOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const [file] = await db
      .select()
      .from(files)
      .where(
        and(
            eq(files.id, fileId), 
            eq(files.ownerId, userId))
        );

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    let parentFolder;
    if (parentId) {
      [parentFolder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, parentId), 
            eq(folders.ownerId, userId))
        );
      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }
    }

    interface UpdateData {
      folderId?: string | null;
    }
    const updateData: UpdateData = {};
    if (parentId !== undefined) updateData.folderId = parentId;

    const [updatedFile] = await db
      .update(files)
      .set(updateData)
      .where(
        and(
            eq(files.id, fileId), 
            eq(files.ownerId, userId))
        )
      .returning();

    return NextResponse.json({
      success: true,
      message: "File updated successfully",
      file: updatedFile,
    });
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}
