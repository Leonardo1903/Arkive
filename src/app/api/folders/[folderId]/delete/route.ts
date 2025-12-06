import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import ImageKit from "imagekit";
import { db } from "@/lib";
import { files, folders } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ folderId: string }> }
) {
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
      .where(
        and(
            eq(folders.id, folderId), 
            eq(folders.ownerId, userId)));

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const folderFiles = await db
      .select()
      .from(files)
      .where(
        and(
            eq(files.folderId, folderId), 
            eq(files.ownerId, userId)));

    for (const file of folderFiles) {
      if (file.imageKitId) {
        try {
          await imagekit.deleteFile(file.imageKitId);
        } catch (err) {
          console.error(`Failed to delete ImageKit file ${file.imageKitId}:`, err);
        }
      }
    }


    await db
      .delete(files)
      .where(
        and(
            eq(files.folderId, folderId), 
            eq(files.ownerId, userId)));


    const deletedFolder = await db
      .delete(folders)
      .where(
        and(
            eq(folders.id, folderId), 
            eq(folders.ownerId, userId)))
      .returning();

    return NextResponse.json({ folder: deletedFolder[0] });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}