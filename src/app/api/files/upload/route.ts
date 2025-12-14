import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files,folders } from "@/lib/schema";
import { Buffer } from "buffer";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";


const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const formOwnerId = formData.get("ownerId") as string;
    const folderId = (formData.get("folderId") as string) || null;

    
    if (formOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

   
    let parentFolder;
    if (folderId) {
      [parentFolder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, folderId),
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

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const originalFilename = file.name;
    const fileExtension = originalFilename.split(".").pop() || "";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    const folderPath = folderId
      ? `/arkive/${userId}/folders/${folderId}`
      : `/arkive/${userId}`;

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFilename,
      folder: folderPath,
      useUniqueFileName: false,
    });

    const derivedSize = typeof file.size === "number" && file.size > 0
      ? file.size
      : fileBuffer.byteLength;

    const derivedType = file.type || `application/${fileExtension || "octet-stream"}`;

    const fileData = {
      folderId,
      imageKitId: uploadResponse.fileId,
      ownerId: userId,
      name: originalFilename,
      url: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      type: derivedType,
      size: derivedSize,
      width: uploadResponse.width || null,
      height: uploadResponse.height || null,
      isStarred: false,
      isTrashed: false,
    };

    const [newFile] = await db.insert(files).values(fileData).returning();

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}