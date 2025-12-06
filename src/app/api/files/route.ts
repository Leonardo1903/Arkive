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

    if (!queryOwnerId || queryOwnerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    let userFiles;
    if (folderId) {
      userFiles = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId), 
            eq(files.folderId, folderId)));
    } else {

      userFiles = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId), 
            isNull(files.folderId)));
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