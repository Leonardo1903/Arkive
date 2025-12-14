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

const fileExtensionExpr = sql`LOWER(substring(${files.name} from '\\.([^.]*)$'))`;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${files.size}::bigint), 0)`,
      })
      .from(files)
      .where(
        and(eq(files.ownerId, userId), eq(files.isTrashed, false))
      );

    const totalUsed = Number(totalResult[0]?.total) || 0;
    const percentageUsed = STORAGE_LIMIT > 0
      ? Math.min(100, Number(((totalUsed / STORAGE_LIMIT) * 100).toFixed(1)))
      : 0;

    const categories = await Promise.all([
      db
        .select({
          total: sql<number>`COALESCE(SUM(${files.size}::bigint), 0)`,
          lastUpdate: sql<string>`TO_CHAR(MAX(${files.createdAt}) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
        })
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, false),
            sql`(${fileExtensionExpr} IN (${sql.join(FILE_CATEGORIES.documents.map((t) => sql`${t}`), sql`, `)}) OR LOWER(${files.type}) LIKE 'application/%')`
          )
        ),

      db
        .select({
          total: sql<number>`COALESCE(SUM(${files.size}::bigint), 0)`,
          lastUpdate: sql<string>`TO_CHAR(MAX(${files.createdAt}) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
        })
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, false),
            sql`(${fileExtensionExpr} IN (${sql.join(FILE_CATEGORIES.images.map((t) => sql`${t}`), sql`, `)}) OR LOWER(${files.type}) LIKE 'image/%')`
          )
        ),

      db
        .select({
          total: sql<number>`COALESCE(SUM(${files.size}::bigint), 0)`,
          lastUpdate: sql<string>`TO_CHAR(MAX(${files.createdAt}) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
        })
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, false),
            sql`(${fileExtensionExpr} IN (${sql.join(FILE_CATEGORIES.videos.map((t) => sql`${t}`), sql`, `)}) OR LOWER(${files.type}) LIKE 'video/%')`
          )
        ),

      db
        .select({
          total: sql<number>`COALESCE(SUM(${files.size}::bigint), 0)`,
          lastUpdate: sql<string>`TO_CHAR(MAX(${files.createdAt}) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
        })
        .from(files)
        .where(
          and(
            eq(files.ownerId, userId),
            eq(files.isTrashed, false),
            sql`(${fileExtensionExpr} IN (${sql.join(FILE_CATEGORIES.audio.map((t) => sql`${t}`), sql`, `)}) OR LOWER(${files.type}) LIKE 'audio/%')`
          )
        ),
    ]);

    const documentsSize = Number(categories[0][0]?.total) || 0;
    const imagesSize = Number(categories[1][0]?.total) || 0;
    const videosSize = Number(categories[2][0]?.total) || 0;
    const audioSize = Number(categories[3][0]?.total) || 0;

    const categorizedTotal = documentsSize + imagesSize + videosSize + audioSize;
    const othersSize = Math.max(0, totalUsed - categorizedTotal);

    const others = await db
      .select({
        lastUpdate: sql<string>`TO_CHAR(MAX(${files.createdAt}) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
      })
      .from(files)
      .where(
        and(
          eq(files.ownerId, userId),
          eq(files.isTrashed, false),
          sql`NOT (${fileExtensionExpr} IN (${sql.join(FILE_CATEGORIES.documents.map((t) => sql`${t}`), sql`, `)})
                OR ${fileExtensionExpr} IN (${sql.join(FILE_CATEGORIES.images.map((t) => sql`${t}`), sql`, `)})
                OR ${fileExtensionExpr} IN (${sql.join(FILE_CATEGORIES.videos.map((t) => sql`${t}`), sql`, `)})
                OR ${fileExtensionExpr} IN (${sql.join(FILE_CATEGORIES.audio.map((t) => sql`${t}`), sql`, `)}))`
        )
      );

    const videoLast = categories[2][0]?.lastUpdate || null;
    const audioLast = categories[3][0]?.lastUpdate || null;
    const combinedVA = videoLast && audioLast
      ? (videoLast > audioLast ? videoLast : audioLast)
      : videoLast || audioLast || null;

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
          lastUpdate: combinedVA,
        },
        {
          type: "others",
          name: "Others",
          size: othersSize,
          lastUpdate: others[0]?.lastUpdate || null,
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
