import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files, folders } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trashedFiles = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.ownerId, userId), 
          eq(files.isTrashed, true)));

    const trashedFolders = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.ownerId, userId), 
          eq(folders.isTrashed, true)));

    if (trashedFiles.length === 0 && trashedFolders.length === 0) {
      return NextResponse.json(
        { message: "No files or folders in trash" },
        { status: 200 }
      );
    }


    const deleteFilePromises = trashedFiles.map(async (file) => {
      if (file.imageKitId) {
        try {
          await imagekit.deleteFile(file.imageKitId);
        } catch (error) {
          console.error(`Error deleting file ${file.id} from ImageKit:`, error);
        }
      }
    });
    await Promise.allSettled(deleteFilePromises);

    const deletedFiles = await db
      .delete(files)
      .where(
        and(
          eq(files.ownerId, userId), 
          eq(files.isTrashed, true)))
      .returning();

    const deletedFolders = [];
    const trashedFolderIds = trashedFolders.map(f => f.id);
    const foldersToDelete = [...trashedFolderIds];
    while (foldersToDelete.length > 0) {
      const deleted = await db
        .delete(folders)
        .where(
          and(
            eq(folders.ownerId, userId), 
            eq(folders.isTrashed, true), 
            eq(folders.id, foldersToDelete[0])))
        .returning();
      deletedFolders.push(...deleted);

      const childFolders = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.ownerId, userId), 
            eq(folders.isTrashed, true), 
            eq(folders.parentId, foldersToDelete[0])));
      foldersToDelete.shift();
      foldersToDelete.push(...childFolders.map(f => f.id));
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedFiles.length} files and ${deletedFolders.length} folders from trash`,
    });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json(
      { error: "Failed to empty trash" },
      { status: 500 }
    );
  }
}