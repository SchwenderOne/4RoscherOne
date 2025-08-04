import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  shoppingLists,
  shoppingItems,
  rooms,
  plants,
  inventoryItems,
  transactions,
  activities,
} from "@shared/schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Please check your .env file.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create users
    console.log("Creating users...");
    const alexUser = await db.insert(users).values({
      id: "alex-id",
      username: "alex",
      displayName: "Alex",
      avatar: "A",
      color: "hsl(207, 90%, 54%)",
    }).onConflictDoNothing().returning();

    const mayaUser = await db.insert(users).values({
      id: "maya-id",
      username: "maya",
      displayName: "Maya",
      avatar: "M",
      color: "hsl(142, 71%, 45%)",
    }).onConflictDoNothing().returning();

    console.log("✓ Users created");

    // Create shopping list
    console.log("Creating shopping list...");
    const activeList = await db.insert(shoppingLists).values({
      name: "Weekly Groceries",
      isActive: true,
    }).returning();

    if (activeList[0]) {
      // Add some shopping items
      await db.insert(shoppingItems).values([
        {
          listId: activeList[0].id,
          name: "Milk",
          cost: "4.99",
          assignedToId: "alex-id",
          isCompleted: false,
        },
        {
          listId: activeList[0].id,
          name: "Bread",
          cost: "3.49",
          assignedToId: "maya-id",
          isCompleted: false,
        },
        {
          listId: activeList[0].id,
          name: "Eggs",
          cost: "5.99",
          assignedToId: null,
          isCompleted: false,
        },
      ]).onConflictDoNothing();
    }
    console.log("✓ Shopping list created");

    // Create rooms
    console.log("Creating rooms...");
    await db.insert(rooms).values([
      {
        name: "Living Room",
        icon: "🛋️",
        cleaningFrequencyDays: 7,
        lastCleanedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        lastCleanedById: "alex-id",
      },
      {
        name: "Kitchen",
        icon: "🍳",
        cleaningFrequencyDays: 3,
        lastCleanedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        lastCleanedById: "maya-id",
      },
      {
        name: "Bathroom",
        icon: "🚿",
        cleaningFrequencyDays: 5,
        lastCleanedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago - overdue!
        lastCleanedById: "alex-id",
      },
      {
        name: "Bedroom (Alex)",
        icon: "🛏️",
        cleaningFrequencyDays: 7,
        lastCleanedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastCleanedById: "alex-id",
      },
      {
        name: "Bedroom (Maya)",
        icon: "🛏️",
        cleaningFrequencyDays: 7,
        lastCleanedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        lastCleanedById: "maya-id",
      },
    ]).onConflictDoNothing();
    console.log("✓ Rooms created");

    // Create plants
    console.log("Creating plants...");
    await db.insert(plants).values([
      {
        name: "Monstera",
        location: "Living Room",
        wateringFrequencyDays: 7,
        lastWateredAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        lastWateredById: "maya-id",
        notes: "Likes indirect sunlight",
      },
      {
        name: "Snake Plant",
        location: "Bedroom",
        wateringFrequencyDays: 14,
        lastWateredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastWateredById: "alex-id",
        notes: "Very low maintenance",
      },
      {
        name: "Pothos",
        location: "Kitchen",
        wateringFrequencyDays: 5,
        lastWateredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        lastWateredById: "maya-id",
        notes: "Keep soil slightly moist",
      },
      {
        name: "Fiddle Leaf Fig",
        location: "Living Room",
        wateringFrequencyDays: 10,
        lastWateredAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // Overdue!
        lastWateredById: "alex-id",
        notes: "Needs bright, filtered light",
      },
    ]).onConflictDoNothing();
    console.log("✓ Plants created");

    // Create inventory items
    console.log("Creating inventory items...");
    await db.insert(inventoryItems).values([
      // Bathroom items
      {
        name: "Toilet Paper",
        category: "bathroom",
        currentStock: 2,
        minStockLevel: 4,
        unit: "rolls",
        autoAddToShopping: true,
      },
      {
        name: "Hand Soap",
        category: "bathroom",
        currentStock: 3,
        minStockLevel: 2,
        unit: "bottles",
        autoAddToShopping: true,
      },
      {
        name: "Shampoo",
        category: "bathroom",
        currentStock: 1,
        minStockLevel: 1,
        unit: "bottles",
        autoAddToShopping: true,
      },
      // Kitchen items
      {
        name: "Paper Towels",
        category: "kitchen",
        currentStock: 6,
        minStockLevel: 4,
        unit: "rolls",
        autoAddToShopping: true,
      },
      {
        name: "Dish Soap",
        category: "kitchen",
        currentStock: 2,
        minStockLevel: 1,
        unit: "bottles",
        autoAddToShopping: true,
      },
      {
        name: "Sponges",
        category: "kitchen",
        currentStock: 8,
        minStockLevel: 4,
        unit: "pieces",
        autoAddToShopping: true,
      },
      // Cleaning supplies
      {
        name: "All-Purpose Cleaner",
        category: "cleaning",
        currentStock: 1,
        minStockLevel: 2,
        unit: "bottles",
        autoAddToShopping: true,
      },
      {
        name: "Laundry Detergent",
        category: "cleaning",
        currentStock: 1,
        minStockLevel: 1,
        unit: "bottles",
        autoAddToShopping: true,
      },
      {
        name: "Trash Bags",
        category: "cleaning",
        currentStock: 15,
        minStockLevel: 10,
        unit: "bags",
        autoAddToShopping: true,
      },
    ]).onConflictDoNothing();
    console.log("✓ Inventory items created");

    // Create some sample transactions
    console.log("Creating sample transactions...");
    await db.insert(transactions).values([
      {
        description: "Groceries - Whole Foods",
        amount: "87.42",
        paidById: "alex-id",
        splitBetween: ["alex-id", "maya-id"],
        category: "groceries",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        description: "Internet Bill",
        amount: "65.00",
        paidById: "maya-id",
        splitBetween: ["alex-id", "maya-id"],
        category: "utilities",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        description: "Cleaning Supplies",
        amount: "32.18",
        paidById: "alex-id",
        splitBetween: ["alex-id", "maya-id"],
        category: "household",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        description: "Pizza Night",
        amount: "45.00",
        paidById: "maya-id",
        splitBetween: ["alex-id", "maya-id"],
        category: "dining",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]).onConflictDoNothing();
    console.log("✓ Transactions created");

    // Create some activities
    console.log("Creating sample activities...");
    await db.insert(activities).values([
      {
        userId: "alex-id",
        type: "cleaning",
        description: "Cleaned Living Room",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: "maya-id",
        type: "plant",
        description: "Watered Monstera",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        userId: "maya-id",
        type: "cleaning",
        description: "Cleaned Kitchen",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: "alex-id",
        type: "shopping",
        description: "Completed shopping for Milk",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]).onConflictDoNothing();
    console.log("✓ Activities created");

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seed().then(async () => {
  console.log("🎉 Seed complete!");
  await sql.end();
  process.exit(0);
}).catch(async (error) => {
  console.error("Failed to seed:", error);
  await sql.end();
  process.exit(1);
});