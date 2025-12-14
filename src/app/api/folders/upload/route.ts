import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files, folders } from "@/lib/schema";
import { Buffer } from "buffer";
import { eq, and, isNull } from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});


async function createFolderPath(
  userId: string,
  pathParts: string[],
  parentId: string | null = null,
  basePath: string = `/arkive/${userId}`
): Promise<string> {

  let currentParentId = parentId;
  let currentPath = basePath;

  for (const folderName of pathParts) {
    currentPath = currentPath.endsWith("/")
      ? `${currentPath}${folderName}`
      : `${currentPath}/${folderName}`;

    const [existingFolder] = await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.ownerId, userId),
          eq(folders.name, folderName),
          currentParentId ? eq(folders.parentId, currentParentId) : isNull(folders.parentId)
        )
      );

    if (existingFolder) {
      currentParentId = existingFolder.id;
    } else {

      const [newFolder] = await db
        .insert(folders)
        .values({
          ownerId: userId,
          parentId: currentParentId,
          name: folderName,
          path: currentPath,
          isTrashed: false,
          isStarred: false,
        })
        .returning();

      currentParentId = newFolder.id;
    }
  }

  if (!currentParentId) {
    throw new Error("Failed to resolve or create folder path: currentParentId is null");
  }
  return currentParentId;
}

async function uploadFileToFolder(
  userId: string,
  file: File,
  folderId: string
): Promise<typeof files.$inferSelect> {
  if (!file || !(file instanceof File)) {
    throw new Error(`Invalid file object: ${typeof file}`);
  }

  if (!file.name) {
    throw new Error("File has no name");
  }

  if (file.size === 0) {
    throw new Error(`File "${file.name}" is empty (size: ${file.size})`);
  }

  const buffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);

  if (fileBuffer.length === 0) {
    throw new Error(`Buffer is empty for file "${file.name}" (reported size: ${file.size}, buffer length: ${fileBuffer.length})`);
  }

  const fileExtension = file.name.split(".").pop() || "";
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;

  const imagekitFolderPath = `/arkive/${userId}/folders/${folderId}`;

  const uploadResponse = await imagekit.upload({
    file: fileBuffer,
    fileName: uniqueFilename,
    folder: imagekitFolderPath,
    useUniqueFileName: false,
  });

  const derivedSize = fileBuffer.byteLength;
  const derivedType = file.type || `application/${fileExtension || "octet-stream"}`;

  const [newFile] = await db
    .insert(files)
    .values({
      folderId,
      imageKitId: uploadResponse.fileId,
      ownerId: userId,
      name: file.name,
      url: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      type: derivedType,
      size: derivedSize,
      width: uploadResponse.width || null,
      height: uploadResponse.height || null,
      isStarred: false,
      isTrashed: false,
    })
    .returning();

  return newFile;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const formOwnerId = formData.get("ownerId") as string;
    const parentFolderId = (formData.get("parentFolderId") as string) || null;

    if (formOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (parentFolderId) {
      const [parentFolder] = await db
        .select()
        .from(folders)
        .where(
          and(
            eq(folders.id, parentFolderId), 
            eq(folders.ownerId, userId))
        );

      if (!parentFolder) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 }
        );
      }
    }

    const uploadedFiles: typeof files.$inferSelect[] = [];
    const folderCache = new Map<string, string>(); 
    const fileList: Array<{ filePath: string; file: File }> = [];

    for (const [filePath, value] of formData.entries()) {
      if (!(value instanceof File)) {
        continue;
      }

      const file = value as File;
      
      if (!file.name || file.size === 0) {
        console.warn(`Skipping invalid file: name="${file.name}", size=${file.size}`);
        continue;
      }

      const parts = filePath.split("/").filter(p => p.length > 0);
      if (parts.length === 0) continue;

      fileList.push({ filePath, file });
    }

    if (fileList.length === 0) {
      return NextResponse.json(
        { error: "No valid files provided" },
        { status: 400 }
      );
    }

    for (const { filePath, file } of fileList) {
      const parts = filePath.split("/").filter(p => p.length > 0);
      const folderParts = parts.slice(0, -1);

      let targetFolderId: string;

      if (folderParts.length === 0) {
        targetFolderId = parentFolderId || "";
      } else {

        const folderPathKey = folderParts.join("/");
        
        if (folderCache.has(folderPathKey)) {
          targetFolderId = folderCache.get(folderPathKey)!;
        } else {
          targetFolderId = await createFolderPath(
            userId,
            folderParts,
            parentFolderId,
            parentFolderId
              ? `/arkive/${userId}/folders/${parentFolderId}`
              : `/arkive/${userId}`
          );
          folderCache.set(folderPathKey, targetFolderId);
        }
      }

      if (targetFolderId) {
        try {
          const uploadedFile = await uploadFileToFolder(
            userId,
            file,
            targetFolderId
          );
          uploadedFiles.push(uploadedFile);
        } catch (error) {
          console.error(`Failed to upload file "${file.name}":`, error);
          throw error;
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "No files could be uploaded" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      foldersCreated: folderCache.size,
      filesUploaded: uploadedFiles.length,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading folder:", error);
    return NextResponse.json(
      { error: "Failed to upload folder" },
      { status: 500 }
    );
  }
}