export interface NotificationData {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: NotificationAction[];
}

export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('Notifications or Service Workers not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async sendNotification(data: NotificationData): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const options: NotificationOptions = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-72x72.png',
      tag: data.tag,
      data: data.data,
      actions: data.actions,
      vibrate: [100, 50, 100],
      requireInteraction: false,
    };

    try {
      await this.registration.showNotification(data.title, options);
    } catch (error) {
      console.error('Failed to show notification:', error);
      // Fallback to regular notification
      new Notification(data.title, options);
    }
  }

  // Schedule notifications for tasks
  async scheduleTaskReminders(): Promise<void> {
    // This would typically integrate with your backend to get upcoming tasks
    // For now, we'll create some example reminders
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Check if we can schedule notifications (this would require backend integration)
    console.log('Task reminders would be scheduled for:', tomorrow);
  }

  // Notification templates for different types
  static createCleaningReminder(roomName: string, daysOverdue: number = 0): NotificationData {
    const isOverdue = daysOverdue > 0;
    return {
      title: isOverdue ? '🧽 Cleaning Overdue!' : '🧽 Time to Clean',
      body: isOverdue 
        ? `${roomName} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue for cleaning`
        : `${roomName} needs cleaning today`,
      tag: `cleaning-${roomName}`,
      data: { type: 'cleaning', roomName, daysOverdue },
      actions: [
        { action: 'mark-done', title: 'Mark as Done' },
        { action: 'remind-later', title: 'Remind Later' }
      ]
    };
  }

  static createPlantReminder(plantName: string, daysOverdue: number = 0): NotificationData {
    const isOverdue = daysOverdue > 0;
    return {
      title: isOverdue ? '🌱 Plant Care Overdue!' : '🌱 Time to Water',
      body: isOverdue 
        ? `${plantName} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue for watering`
        : `${plantName} needs watering today`,
      tag: `plant-${plantName}`,
      data: { type: 'plant', plantName, daysOverdue },
      actions: [
        { action: 'mark-watered', title: 'Mark as Watered' },
        { action: 'remind-later', title: 'Remind Later' }
      ]
    };
  }

  static createExpenseNotification(amount: number, description: string): NotificationData {
    return {
      title: '💰 New Expense Added',
      body: `€${amount.toFixed(2)} - ${description}`,
      tag: 'expense-added',
      data: { type: 'expense', amount, description },
      actions: [
        { action: 'view-finances', title: 'View Finances' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };
  }

  static createBalanceAlert(balance: number, owedTo: string): NotificationData {
    return {
      title: balance > 0 ? '💸 You owe money' : '💰 Money owed to you',
      body: balance > 0 
        ? `You owe €${Math.abs(balance).toFixed(2)} to ${owedTo}`
        : `${owedTo} owes you €${Math.abs(balance).toFixed(2)}`,
      tag: 'balance-alert',
      data: { type: 'balance', balance, owedTo },
      actions: [
        { action: 'view-finances', title: 'View Finances' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };
  }
}