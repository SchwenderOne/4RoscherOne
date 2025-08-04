import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShoppingItemSchema, insertTransactionSchema, insertActivitySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Users
  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Shopping Lists
  app.get("/api/shopping-lists", async (req, res) => {
    const lists = await storage.getShoppingLists();
    res.json(lists);
  });

  app.get("/api/shopping-lists/active", async (req, res) => {
    const activeList = await storage.getActiveShoppingList();
    res.json(activeList);
  });

  // Shopping Items
  app.get("/api/shopping-lists/:listId/items", async (req, res) => {
    const items = await storage.getShoppingItemsByListId(req.params.listId);
    res.json(items);
  });

  app.post("/api/shopping-items", async (req, res) => {
    try {
      const validatedData = insertShoppingItemSchema.parse(req.body);
      const item = await storage.createShoppingItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.post("/api/shopping-lists/:listId/items", async (req, res) => {
    try {
      const validatedData = insertShoppingItemSchema.parse({
        ...req.body,
        listId: req.params.listId
      });
      const item = await storage.createShoppingItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Shopping item creation error:", error);
      res.status(400).json({ error: "Invalid data", details: error.message });
    }
  });

  app.patch("/api/shopping-items/:id", async (req, res) => {
    const item = await storage.updateShoppingItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  });

  app.delete("/api/shopping-items/:id", async (req, res) => {
    const success = await storage.deleteShoppingItem(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(204).send();
  });

  // Long Term Purchases
  app.get("/api/long-term-purchases", async (req, res) => {
    const purchases = await storage.getLongTermPurchases();
    res.json(purchases);
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Rooms
  app.get("/api/rooms", async (req, res) => {
    const rooms = await storage.getRooms();
    res.json(rooms);
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const room = await storage.createRoom(req.body);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.patch("/api/rooms/:id", async (req, res) => {
    const room = await storage.updateRoom(req.params.id, req.body);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  });

  // Plants
  app.get("/api/plants", async (req, res) => {
    const plants = await storage.getPlants();
    res.json(plants);
  });

  app.post("/api/plants", async (req, res) => {
    try {
      const plant = await storage.createPlant(req.body);
      res.status(201).json(plant);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.patch("/api/plants/:id", async (req, res) => {
    const plant = await storage.updatePlant(req.params.id, req.body);
    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }
    res.json(plant);
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const activities = await storage.getRecentActivities(limit);
    res.json(activities);
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", async (req, res) => {
    const users = await storage.getAllUsers();
    const transactions = await storage.getTransactions();
    const rooms = await storage.getRooms();
    const plants = await storage.getPlants();
    const activities = await storage.getRecentActivities(5);

    // Calculate balances
    const alex = users.find(u => u.username === 'alex');
    const maya = users.find(u => u.username === 'maya');
    
    let alexBalance = 0;
    let mayaBalance = 0;
    
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const splitCount = transaction.splitBetween.length;
      const perPersonAmount = amount / splitCount;
      
      if (transaction.paidById === alex?.id) {
        alexBalance += amount - perPersonAmount;
      } else if (transaction.paidById === maya?.id) {
        mayaBalance += amount - perPersonAmount;
      }
      
      transaction.splitBetween.forEach(userId => {
        if (userId === alex?.id && transaction.paidById !== alex?.id) {
          alexBalance -= perPersonAmount;
        } else if (userId === maya?.id && transaction.paidById !== maya?.id) {
          mayaBalance -= perPersonAmount;
        }
      });
    });

    // Calculate urgent and today's tasks
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const urgentTasks: any[] = [];
    const todayTasks: any[] = [];

    // Check overdue plants
    plants.forEach(plant => {
      if (plant.lastWateredAt) {
        const nextWateringDate = new Date(plant.lastWateredAt);
        nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringFrequencyDays);
        
        if (nextWateringDate < now) {
          const daysOverdue = Math.floor((now.getTime() - nextWateringDate.getTime()) / (1000 * 60 * 60 * 24));
          urgentTasks.push({
            id: plant.id,
            title: `Water ${plant.name}`,
            type: 'plant',
            daysOverdue: `${daysOverdue} days overdue`
          });
        } else if (nextWateringDate <= new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)) {
          todayTasks.push({
            id: plant.id,
            title: `Water ${plant.name}`,
            type: 'plant',
            category: 'Plants'
          });
        }
      }
    });

    // Check overdue room cleaning
    rooms.forEach(room => {
      if (room.lastCleanedAt) {
        const nextCleaningDate = new Date(room.lastCleanedAt);
        nextCleaningDate.setDate(nextCleaningDate.getDate() + room.cleaningFrequencyDays);
        
        if (nextCleaningDate < now) {
          const daysOverdue = Math.floor((now.getTime() - nextCleaningDate.getTime()) / (1000 * 60 * 60 * 24));
          urgentTasks.push({
            id: room.id,
            title: `Clean ${room.name}`,
            type: 'cleaning',
            daysOverdue: `${daysOverdue} days overdue`
          });
        } else if (nextCleaningDate <= new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)) {
          todayTasks.push({
            id: room.id,
            title: `Clean ${room.name}`,
            type: 'cleaning',
            category: 'Cleaning'
          });
        }
      }
    });

    res.json({
      balance: {
        alex: alexBalance,
        maya: mayaBalance
      },
      urgentTasks,
      todayTasks,
      taskCount: urgentTasks.length + todayTasks.length,
      recentActivities: activities
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
