import { 
  type User, type InsertUser,
  type ShoppingList, type InsertShoppingList,
  type ShoppingItem, type InsertShoppingItem,
  type LongTermPurchase, type InsertLongTermPurchase,
  type Transaction, type InsertTransaction,
  type Room, type InsertRoom,
  type Plant, type InsertPlant,
  type Activity, type InsertActivity
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Shopping Lists
  getShoppingLists(): Promise<ShoppingList[]>;
  getActiveShoppingList(): Promise<ShoppingList | undefined>;
  createShoppingList(list: InsertShoppingList): Promise<ShoppingList>;
  
  // Shopping Items
  getShoppingItemsByListId(listId: string): Promise<ShoppingItem[]>;
  createShoppingItem(item: InsertShoppingItem): Promise<ShoppingItem>;
  updateShoppingItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem | undefined>;
  deleteShoppingItem(id: string): Promise<boolean>;

  // Long Term Purchases
  getLongTermPurchases(): Promise<LongTermPurchase[]>;
  createLongTermPurchase(purchase: InsertLongTermPurchase): Promise<LongTermPurchase>;
  updateLongTermPurchase(id: string, updates: Partial<LongTermPurchase>): Promise<LongTermPurchase | undefined>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Rooms
  getRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined>;

  // Plants
  getPlants(): Promise<Plant[]>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | undefined>;

  // Activities
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private shoppingLists: Map<string, ShoppingList>;
  private shoppingItems: Map<string, ShoppingItem>;
  private longTermPurchases: Map<string, LongTermPurchase>;
  private transactions: Map<string, Transaction>;
  private rooms: Map<string, Room>;
  private plants: Map<string, Plant>;
  private activities: Map<string, Activity>;

  constructor() {
    this.users = new Map();
    this.shoppingLists = new Map();
    this.shoppingItems = new Map();
    this.longTermPurchases = new Map();
    this.transactions = new Map();
    this.rooms = new Map();
    this.plants = new Map();
    this.activities = new Map();

    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default users
    const alex: User = {
      id: "alex-id",
      username: "alex",
      displayName: "Alex",
      avatar: "A",
      color: "hsl(207, 90%, 54%)",
    };
    
    const maya: User = {
      id: "maya-id", 
      username: "maya",
      displayName: "Maya",
      avatar: "M",
      color: "hsl(142, 71%, 45%)",
    };

    this.users.set(alex.id, alex);
    this.users.set(maya.id, maya);

    // Create default rooms
    const kitchen: Room = {
      id: randomUUID(),
      name: "Kitchen",
      icon: "utensils",
      cleaningFrequencyDays: 3,
      lastCleanedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastCleanedById: maya.id,
    };

    const bathroom: Room = {
      id: randomUUID(),
      name: "Bathroom", 
      icon: "bath",
      cleaningFrequencyDays: 7,
      lastCleanedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastCleanedById: alex.id,
    };

    this.rooms.set(kitchen.id, kitchen);
    this.rooms.set(bathroom.id, bathroom);

    // Create default shopping list
    const groceryList: ShoppingList = {
      id: randomUUID(),
      name: "Weekly Groceries",
      isActive: true,
      createdAt: new Date(),
    };

    this.shoppingLists.set(groceryList.id, groceryList);

    // Create default plants
    const spiderPlant: Plant = {
      id: randomUUID(),
      name: "Spider Plant",
      location: "Living Room Window",
      imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      wateringFrequencyDays: 3,
      lastWateredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastWateredById: maya.id,
      notes: "Bright indirect light, easy to propagate",
    };

    const jadePlant: Plant = {
      id: randomUUID(),
      name: "Jade Plant", 
      location: "Desk Corner",
      imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      wateringFrequencyDays: 7,
      lastWateredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastWateredById: alex.id,
      notes: "Drought tolerant succulent",
    };

    this.plants.set(spiderPlant.id, spiderPlant);
    this.plants.set(jadePlant.id, jadePlant);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getShoppingLists(): Promise<ShoppingList[]> {
    return Array.from(this.shoppingLists.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getActiveShoppingList(): Promise<ShoppingList | undefined> {
    return Array.from(this.shoppingLists.values()).find(list => list.isActive);
  }

  async createShoppingList(insertList: InsertShoppingList): Promise<ShoppingList> {
    const id = randomUUID();
    const list: ShoppingList = { 
      ...insertList, 
      id, 
      createdAt: new Date() 
    };
    this.shoppingLists.set(id, list);
    return list;
  }

  async getShoppingItemsByListId(listId: string): Promise<ShoppingItem[]> {
    return Array.from(this.shoppingItems.values())
      .filter(item => item.listId === listId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createShoppingItem(insertItem: InsertShoppingItem): Promise<ShoppingItem> {
    const id = randomUUID();
    const item: ShoppingItem = { 
      ...insertItem, 
      id, 
      createdAt: new Date() 
    };
    this.shoppingItems.set(id, item);
    return item;
  }

  async updateShoppingItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem | undefined> {
    const item = this.shoppingItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.shoppingItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteShoppingItem(id: string): Promise<boolean> {
    return this.shoppingItems.delete(id);
  }

  async getLongTermPurchases(): Promise<LongTermPurchase[]> {
    return Array.from(this.longTermPurchases.values()).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async createLongTermPurchase(insertPurchase: InsertLongTermPurchase): Promise<LongTermPurchase> {
    const id = randomUUID();
    const purchase: LongTermPurchase = { 
      ...insertPurchase, 
      id, 
      createdAt: new Date() 
    };
    this.longTermPurchases.set(id, purchase);
    return purchase;
  }

  async updateLongTermPurchase(id: string, updates: Partial<LongTermPurchase>): Promise<LongTermPurchase | undefined> {
    const purchase = this.longTermPurchases.get(id);
    if (!purchase) return undefined;
    
    const updatedPurchase = { ...purchase, ...updates };
    this.longTermPurchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = { ...insertRoom, id };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async getPlants(): Promise<Plant[]> {
    return Array.from(this.plants.values());
  }

  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const id = randomUUID();
    const plant: Plant = { ...insertPlant, id };
    this.plants.set(id, plant);
    return plant;
  }

  async updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | undefined> {
    const plant = this.plants.get(id);
    if (!plant) return undefined;
    
    const updatedPlant = { ...plant, ...updates };
    this.plants.set(id, updatedPlant);
    return updatedPlant;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date() 
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
