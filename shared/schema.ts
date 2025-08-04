import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar").notNull(),
  color: text("color").notNull(),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shoppingItems = pgTable("shopping_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listId: varchar("list_id").notNull().references(() => shoppingLists.id),
  name: text("name").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const longTermPurchases = pgTable("long_term_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  neededBy: timestamp("needed_by"),
  alexShare: decimal("alex_share", { precision: 10, scale: 2 }).notNull(),
  mayaShare: decimal("maya_share", { precision: 10, scale: 2 }).notNull(),
  isPurchased: boolean("is_purchased").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidById: varchar("paid_by_id").notNull().references(() => users.id),
  splitBetween: text("split_between").array().notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  cleaningFrequencyDays: integer("cleaning_frequency_days").notNull(),
  lastCleanedAt: timestamp("last_cleaned_at"),
  lastCleanedById: varchar("last_cleaned_by_id").references(() => users.id),
});

export const plants = pgTable("plants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  wateringFrequencyDays: integer("watering_frequency_days").notNull(),
  lastWateredAt: timestamp("last_watered_at"),
  lastWateredById: varchar("last_watered_by_id").references(() => users.id),
  notes: text("notes"),
});

// Household Inventory
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'bathroom', 'kitchen', 'cleaning', 'personal'
  currentStock: integer("current_stock").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(1),
  unit: text("unit").notNull(), // 'rolls', 'bottles', 'boxes', 'pieces'
  lastRestockedAt: timestamp("last_restocked_at"),
  lastRestockedBy: varchar("last_restocked_by").references(() => users.id),
  autoAddToShopping: boolean("auto_add_to_shopping").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  relatedId: varchar("related_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({ id: true, createdAt: true });
export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({ id: true, createdAt: true });
export const insertLongTermPurchaseSchema = createInsertSchema(longTermPurchases).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true });
export const insertPlantSchema = createInsertSchema(plants).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;
export type LongTermPurchase = typeof longTermPurchases.$inferSelect;
export type InsertLongTermPurchase = z.infer<typeof insertLongTermPurchaseSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
