import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const recentFiles = await db
      .select({
        id: files.id,
        folderId: files.folderId,
        name: files.name,
        type: files.type,
        size: files.size,
        url: files.url,
        thumbnailUrl: files.thumbnailUrl,
        createdAt: files.createdAt,
        isStarred: files.isStarred,
      })
      .from(files)
      .where(
        and(
          eq(files.ownerId, userId), 
          eq(files.isTrashed, false)))
      .orderBy(desc(files.createdAt))
      .limit(10);

    return NextResponse.json({ files: recentFiles });
  } catch (error) {
    console.error("Error fetching recent files:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent files" },
      { status: 500 }
    );
  }
}
