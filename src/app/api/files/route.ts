import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryOwnerId = searchParams.get("ownerId");
    const folderId = searchParams.get("folderId");
    const starred = searchParams.get("starred");
    const trashed = searchParams.get("trashed");

    if (!queryOwnerId || queryOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If starred filter is requested
    if (starred === "true") {
      const userFiles = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isStarred, true),
            eq(files.isTrashed, false)
          )
        );
      return NextResponse.json(userFiles);
    }

    // If trashed filter is requested
    if (trashed === "true") {
      const userFiles = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, true)
          )
        );
      return NextResponse.json(userFiles);
    }

    let userFiles;
    if (folderId) {
      userFiles = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId), 
            eq(files.folderId, folderId),
            eq(files.isTrashed, false)
          )
        );
    } else {

      userFiles = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId), 
            isNull(files.folderId),
            eq(files.isTrashed, false)
          )
        );
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