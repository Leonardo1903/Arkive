import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull(),
  parentId: uuid("parent_id"),

  path: text("path").notNull(),

  name: text("name").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  folderId: uuid("folder_id"),
  imageKitId: text("imagekit_id"),
  ownerId: text("owner_id").notNull(),

  name: text("name").notNull(),

  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  type: text("type").notNull(),
  size: integer("size").notNull(),

  width: integer("width"),
  height: integer("height"),

  isStarred: boolean("is_starred").default(false).notNull(),
  isTrashed: boolean("is_trashed").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const foldersRelations = relations(folders, ({ many }) => ({
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}));
