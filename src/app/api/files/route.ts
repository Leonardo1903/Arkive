import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryOwnerId = searchParams.get("ownerId");
    const folderId = searchParams.get("folderId");

    // Verify the user is requesting their own files
    if (!queryOwnerId || queryOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch files from database based on folderId
    let userFiles;
    if (folderId) {
      // Fetch files within a specific folder
      userFiles = await db
        .select()
        .from(files)
        .where(and(eq(files.ownerId, userId), eq(files.folderId, folderId)));
    } else {
      // Fetch root-level files (where folderId is null)
      userFiles = await db
        .select()
        .from(files)
        .where(and(eq(files.ownerId, userId), isNull(files.folderId)));
    }

    return NextResponse.json(userFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}