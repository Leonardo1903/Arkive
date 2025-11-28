import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imagekit, userId: bodyUserId } = body;

    if (bodyUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!imagekit || !imagekit.url) {
      return NextResponse.json(
        { error: "Invalid file upload data" },
        { status: 400 }
      );
    }

    const fileData = {
      folderId: null,
      imageKitId: imagekit.id || null,
      ownerId: userId,
      name: imagekit.name,
      url: imagekit.url,
      thumbnailUrl: imagekit.thumbnailUrl || null,
      type: imagekit.fileType,
      size: imagekit.size,
      width: imagekit.width || null,
      height: imagekit.height || null,
      isStarred: false,
      isTrashed: false,
    };

    const [newFile] = await db.insert(files).values(fileData).returning();

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json(
      { error: "Failed to save file information" },
      { status: 500 }
    );
  }
}