import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files } from "@/lib/schema";
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
      .where(and(eq(files.ownerId, userId), eq(files.isTrashed, true)));

    if (trashedFiles.length === 0) {
      return NextResponse.json(
        { message: "No files in trash" },
        { status: 200 }
      );
    }

    const deletePromises = trashedFiles.map(async (file) => {
      if (file.imageKitId) {
        try {
          await imagekit.deleteFile(file.imageKitId);
        } catch (error) {
          console.error(`Error deleting file ${file.id} from ImageKit:`, error);
        }
      }
    });

    await Promise.allSettled(deletePromises);

    const deletedFiles = await db
      .delete(files)
      .where(and(eq(files.ownerId, userId), eq(files.isTrashed, true)))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedFiles.length} files from trash`,
    });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json(
      { error: "Failed to empty trash" },
      { status: 500 }
    );
  }
}