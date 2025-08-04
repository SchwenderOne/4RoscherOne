import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and, lte, sql as sqlOp } from "drizzle-orm";
import {
  users,
  shoppingLists,
  shoppingItems,
  longTermPurchases,
  transactions,
  rooms,
  plants,
  activities,
  inventoryItems,
  type User,
  type InsertUser,
  type ShoppingList,
  type InsertShoppingList,
  type ShoppingItem,
  type InsertShoppingItem,
  type LongTermPurchase,
  type InsertLongTermPurchase,
  type Transaction,
  type InsertTransaction,
  type Room,
  type InsertRoom,
  type Plant,
  type InsertPlant,
  type Activity,
  type InsertActivity,
  type InventoryItem,
  type InsertInventoryItem,
} from "@shared/schema";
import { IStorage } from "./storage";

export class DrizzleStorage implements IStorage {
  private db;
  private sql;

  constructor(databaseUrl: string) {
    this.sql = postgres(databaseUrl);
    this.db = drizzle(this.sql);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  // Shopping Lists
  async getShoppingLists(): Promise<ShoppingList[]> {
    return await this.db.select().from(shoppingLists).orderBy(desc(shoppingLists.createdAt));
  }

  async getActiveShoppingList(): Promise<ShoppingList | undefined> {
    const result = await this.db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.isActive, true))
      .limit(1);
    return result[0];
  }

  async createShoppingList(list: InsertShoppingList): Promise<ShoppingList> {
    // Deactivate other lists if this one is active
    if (list.isActive) {
      await this.db
        .update(shoppingLists)
        .set({ isActive: false })
        .where(eq(shoppingLists.isActive, true));
    }
    const result = await this.db.insert(shoppingLists).values(list).returning();
    return result[0];
  }

  // Shopping Items
  async getShoppingItemsByListId(listId: string): Promise<ShoppingItem[]> {
    return await this.db
      .select()
      .from(shoppingItems)
      .where(eq(shoppingItems.listId, listId))
      .orderBy(desc(shoppingItems.createdAt));
  }

  async createShoppingItem(item: InsertShoppingItem): Promise<ShoppingItem> {
    const result = await this.db.insert(shoppingItems).values(item).returning();
    return result[0];
  }

  async updateShoppingItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem | undefined> {
    const result = await this.db
      .update(shoppingItems)
      .set(updates)
      .where(eq(shoppingItems.id, id))
      .returning();
    return result[0];
  }

  async deleteShoppingItem(id: string): Promise<boolean> {
    const result = await this.db.delete(shoppingItems).where(eq(shoppingItems.id, id)).returning();
    return result.length > 0;
  }

  // Long Term Purchases
  async getLongTermPurchases(): Promise<LongTermPurchase[]> {
    return await this.db.select().from(longTermPurchases).orderBy(desc(longTermPurchases.createdAt));
  }

  async createLongTermPurchase(purchase: InsertLongTermPurchase): Promise<LongTermPurchase> {
    const result = await this.db.insert(longTermPurchases).values(purchase).returning();
    return result[0];
  }

  async updateLongTermPurchase(id: string, updates: Partial<LongTermPurchase>): Promise<LongTermPurchase | undefined> {
    const result = await this.db
      .update(longTermPurchases)
      .set(updates)
      .where(eq(longTermPurchases.id, id))
      .returning();
    return result[0];
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return await this.db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await this.db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    return await this.db.select().from(rooms);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const result = await this.db.insert(rooms).values(room).returning();
    return result[0];
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const result = await this.db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, id))
      .returning();
    return result[0];
  }

  // Plants
  async getPlants(): Promise<Plant[]> {
    return await this.db.select().from(plants);
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    const result = await this.db.insert(plants).values(plant).returning();
    return result[0];
  }

  async updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | undefined> {
    const result = await this.db
      .update(plants)
      .set(updates)
      .where(eq(plants.id, id))
      .returning();
    return result[0];
  }

  // Activities
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return await this.db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await this.db.insert(activities).values(activity).returning();
    return result[0];
  }

  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await this.db.select().from(inventoryItems).orderBy(inventoryItems.name);
  }

  async getInventoryItemsByCategory(category: string): Promise<InventoryItem[]> {
    return await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.category, category))
      .orderBy(inventoryItems.name);
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const result = await this.db.insert(inventoryItems).values(item).returning();
    return result[0];
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const result = await this.db
      .update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, id))
      .returning();
    return result[0];
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const result = await this.db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning();
    return result.length > 0;
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await this.db
      .select()
      .from(inventoryItems)
      .where(lte(inventoryItems.currentStock, inventoryItems.minStockLevel))
      .orderBy(inventoryItems.name);
  }
}