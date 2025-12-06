import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib";
import { files } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

const STORAGE_LIMIT = 2 * 1024 * 1024 * 1024;


const FILE_CATEGORIES = {
  documents: ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx", "csv"],
  images: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "heic"],
  videos: ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v"],
  audio: ["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma"],
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${files.size}), 0)`,
      })
      .from(files)
      .where(and(
        eq(files.ownerId, userId), 
        eq(files.isTrashed, false)
    ));

    const totalUsed = Number(totalResult[0]?.total) || 0;
    const percentageUsed = Math.round((totalUsed / STORAGE_LIMIT) * 100);

    const categories = await Promise.all([

      db
        .select({
          total: sql<number>`COALESCE(SUM(${files.size}), 0)`,
          lastUpdate: sql<string>`MAX(${files.updatedAt})`,
        })
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, false),
            sql`LOWER(${files.type}) IN (${sql.join(FILE_CATEGORIES.documents.map((t) => sql`${t}`), sql`, `)})`
          )
        ),


      db
        .select({
          total: sql<number>`COALESCE(SUM(${files.size}), 0)`,
          lastUpdate: sql<string>`MAX(${files.updatedAt})`,
        })
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, false),
            sql`LOWER(${files.type}) IN (${sql.join(FILE_CATEGORIES.images.map((t) => sql`${t}`), sql`, `)})`
          )
        ),


      db
        .select({
          total: sql<number>`COALESCE(SUM(${files.size}), 0)`,
          lastUpdate: sql<string>`MAX(${files.updatedAt})`,
        })
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, false),
            sql`LOWER(${files.type}) IN (${sql.join(FILE_CATEGORIES.videos.map((t) => sql`${t}`), sql`, `)})`
          )
        ),


      db
        .select({
          total: sql<number>`COALESCE(SUM(${files.size}), 0)`,
          lastUpdate: sql<string>`MAX(${files.updatedAt})`,
        })
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, false),
            sql`LOWER(${files.type}) IN (${sql.join(FILE_CATEGORIES.audio.map((t) => sql`${t}`), sql`, `)})`
          )
        ),
    ]);

    const documentsSize = Number(categories[0][0]?.total) || 0;
    const imagesSize = Number(categories[1][0]?.total) || 0;
    const videosSize = Number(categories[2][0]?.total) || 0;
    const audioSize = Number(categories[3][0]?.total) || 0;

    const categorizedTotal = documentsSize + imagesSize + videosSize + audioSize;
    const othersSize = totalUsed - categorizedTotal;

    return NextResponse.json({
      totalUsed,
      totalAvailable: STORAGE_LIMIT,
      percentageUsed,
      categories: [
        {
          type: "documents",
          name: "Documents",
          size: documentsSize,
          lastUpdate: categories[0][0]?.lastUpdate || null,
        },
        {
          type: "images",
          name: "Images",
          size: imagesSize,
          lastUpdate: categories[1][0]?.lastUpdate || null,
        },
        {
          type: "videos",
          name: "Videos, Audio",
          size: videosSize + audioSize,
          lastUpdate:
            categories[2][0]?.lastUpdate > categories[3][0]?.lastUpdate
              ? categories[2][0]?.lastUpdate
              : categories[3][0]?.lastUpdate,
        },
        {
          type: "others",
          name: "Others",
          size: othersSize,
          lastUpdate: null,
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching storage data:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage data" },
      { status: 500 }
    );
  }
}
