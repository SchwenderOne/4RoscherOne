import { 
  type User, type InsertUser,
  type ShoppingList, type InsertShoppingList,
  type ShoppingItem, type InsertShoppingItem,
  type LongTermPurchase, type InsertLongTermPurchase,
  type Transaction, type InsertTransaction,
  type Room, type InsertRoom,
  type Plant, type InsertPlant,
  type Activity, type InsertActivity,
  type InventoryItem, type InsertInventoryItem
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

  // Inventory
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItemsByCategory(category: string): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string): Promise<boolean>;
  getLowStockItems(): Promise<InventoryItem[]>;
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
  private inventoryItems: Map<string, InventoryItem>;

  constructor() {
    this.users = new Map();
    this.shoppingLists = new Map();
    this.shoppingItems = new Map();
    this.longTermPurchases = new Map();
    this.transactions = new Map();
    this.rooms = new Map();
    this.plants = new Map();
    this.activities = new Map();
    this.inventoryItems = new Map();

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
      lastCleanedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (overdue)
      lastCleanedById: maya.id,
    };

    const bathroom: Room = {
      id: randomUUID(),
      name: "Bathroom", 
      icon: "bath",
      cleaningFrequencyDays: 7,
      lastCleanedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (due tomorrow)
      lastCleanedById: alex.id,
    };

    const livingRoom: Room = {
      id: randomUUID(),
      name: "Living Room",
      icon: "sofa",
      cleaningFrequencyDays: 14,
      lastCleanedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // exactly due today
      lastCleanedById: maya.id,
    };

    this.rooms.set(kitchen.id, kitchen);
    this.rooms.set(bathroom.id, bathroom);
    this.rooms.set(livingRoom.id, livingRoom);

    // Create default shopping list
    const groceryList: ShoppingList = {
      id: randomUUID(),
      name: "Weekly Groceries",
      isActive: true,
      createdAt: new Date(),
    };

    this.shoppingLists.set(groceryList.id, groceryList);

    // Create shopping items
    const shoppingItems = [
      {
        id: randomUUID(),
        listId: groceryList.id,
        name: "Milk",
        cost: "3.50",
        assignedToId: alex.id,
        isCompleted: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: randomUUID(),
        listId: groceryList.id,
        name: "Bread",
        cost: "2.80",
        assignedToId: maya.id,
        isCompleted: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        id: randomUUID(),
        listId: groceryList.id,
        name: "Eggs",
        cost: "4.20",
        assignedToId: alex.id,
        isCompleted: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: randomUUID(),
        listId: groceryList.id,
        name: "Apples",
        cost: "5.60",
        assignedToId: null,
        isCompleted: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      }
    ];

    shoppingItems.forEach(item => this.shoppingItems.set(item.id, item));

    // Create long-term purchases
    const longTermPurchases = [
      {
        id: randomUUID(),
        name: "New Couch",
        totalCost: "800.00",
        neededBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        alexShare: "400.00",
        mayaShare: "400.00",
        isPurchased: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        id: randomUUID(),
        name: "Dishwasher",
        totalCost: "450.00",
        neededBy: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        alexShare: "180.00",
        mayaShare: "270.00",
        isPurchased: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      }
    ];

    longTermPurchases.forEach(purchase => this.longTermPurchases.set(purchase.id, purchase));

    // Create transactions
    const transactions = [
      {
        id: randomUUID(),
        description: "Rent Payment",
        amount: "1200.00",
        paidById: alex.id,
        splitBetween: [alex.id, maya.id],
        category: "Housing",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: randomUUID(),
        description: "Electricity Bill",
        amount: "85.50",
        paidById: maya.id,
        splitBetween: [alex.id, maya.id],
        category: "Utilities",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: randomUUID(),
        description: "Groceries - Whole Foods",
        amount: "67.80",
        paidById: alex.id,
        splitBetween: [alex.id, maya.id],
        category: "Food",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: randomUUID(),
        description: "Internet Bill",
        amount: "45.00",
        paidById: maya.id,
        splitBetween: [alex.id, maya.id],
        category: "Utilities",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: randomUUID(),
        description: "Takeout Pizza",
        amount: "28.50",
        paidById: alex.id,
        splitBetween: [alex.id, maya.id],
        category: "Food",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      }
    ];

    transactions.forEach(transaction => this.transactions.set(transaction.id, transaction));

    // Create default plants
    const spiderPlant: Plant = {
      id: randomUUID(),
      name: "Spider Plant",
      location: "Living Room Window",
      imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      wateringFrequencyDays: 3,
      lastWateredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (overdue)
      lastWateredById: maya.id,
      notes: "Bright indirect light, easy to propagate",
    };

    const jadePlant: Plant = {
      id: randomUUID(),
      name: "Jade Plant", 
      location: "Desk Corner",
      imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      wateringFrequencyDays: 7,
      lastWateredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (due tomorrow)
      lastWateredById: alex.id,
      notes: "Drought tolerant succulent",
    };

    const monstera: Plant = {
      id: randomUUID(),
      name: "Monstera Deliciosa",
      location: "Bedroom Corner",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      wateringFrequencyDays: 5,
      lastWateredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // exactly due today
      lastWateredById: maya.id,
      notes: "Loves humidity, fenestrated leaves",
    };

    this.plants.set(spiderPlant.id, spiderPlant);
    this.plants.set(jadePlant.id, jadePlant);
    this.plants.set(monstera.id, monstera);

    // Create activity entries
    const activities = [
      {
        id: randomUUID(),
        userId: alex.id,
        type: "expense_added",
        description: "Added expense: Takeout Pizza (€28.50)",
        relatedId: null,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: randomUUID(),
        userId: maya.id,
        type: "shopping_item_completed",
        description: "Marked 'Bread' as completed",
        relatedId: null,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        id: randomUUID(),
        userId: alex.id,
        type: "shopping_item_added",
        description: "Added 'Eggs' to shopping list",
        relatedId: null,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: randomUUID(),
        userId: maya.id,
        type: "plant_watered",
        description: "Watered Monstera Deliciosa",
        relatedId: null,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: randomUUID(),
        userId: alex.id,
        type: "shopping_item_added",
        description: "Added 'Apples' to shopping list",
        relatedId: null,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      }
    ];

    activities.forEach(activity => this.activities.set(activity.id, activity));

    // Create default inventory items
    const toiletPaper: InventoryItem = {
      id: randomUUID(),
      name: "Toilet Paper",
      category: "bathroom",
      currentStock: 2,
      minStockLevel: 4,
      unit: "rolls",
      lastRestockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastRestockedBy: alex.id,
      autoAddToShopping: true,
      createdAt: new Date(),
    };

    const toothpaste: InventoryItem = {
      id: randomUUID(),
      name: "Toothpaste",
      category: "bathroom",
      currentStock: 1,
      minStockLevel: 2,
      unit: "tubes",
      lastRestockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastRestockedBy: maya.id,
      autoAddToShopping: true,
      createdAt: new Date(),
    };

    const dishSoap: InventoryItem = {
      id: randomUUID(),
      name: "Dish Soap",
      category: "kitchen",
      currentStock: 0,
      minStockLevel: 1,
      unit: "bottles",
      lastRestockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      lastRestockedBy: alex.id,
      autoAddToShopping: true,
      createdAt: new Date(),
    };

    const laundryDetergent: InventoryItem = {
      id: randomUUID(),
      name: "Laundry Detergent",
      category: "cleaning",
      currentStock: 3,
      minStockLevel: 1,
      unit: "bottles",
      lastRestockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastRestockedBy: maya.id,
      autoAddToShopping: true,
      createdAt: new Date(),
    };

    this.inventoryItems.set(toiletPaper.id, toiletPaper);
    this.inventoryItems.set(toothpaste.id, toothpaste);
    this.inventoryItems.set(dishSoap.id, dishSoap);
    this.inventoryItems.set(laundryDetergent.id, laundryDetergent);
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

  // Inventory Methods
  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).sort((a, b) => 
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  }

  async getInventoryItemsByCategory(category: string): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values())
      .filter(item => item.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const item: InventoryItem = { 
      ...insertItem, 
      id, 
      createdAt: new Date() 
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values())
      .filter(item => item.currentStock <= item.minStockLevel)
      .sort((a, b) => (a.currentStock - a.minStockLevel) - (b.currentStock - b.minStockLevel));
  }
}

export const storage = new MemStorage();
