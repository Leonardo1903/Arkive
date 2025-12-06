import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import ImageKit from "imagekit";
import { db } from "@/lib";
import { files } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const [file] = await db
      .select()
      .from(files)
      .where(
        and(
            eq(files.id, fileId), 
            eq(files.ownerId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!file.imageKitId) {
      return NextResponse.json(
        { error: "File cannot be deleted: missing ImageKit id" },
        { status: 400 }
      );
    }

    await imagekit.deleteFile(file.imageKitId);

    const deleted = await db
      .delete(files)
      .where(
        and(
            eq(files.id, fileId), 
            eq(files.ownerId, userId)))
      .returning();

    return NextResponse.json({ file: deleted[0] });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}