export const USERS = {
  ALEX: {
    id: 'alex-id',
    username: 'alex',
    displayName: 'Alex',
    avatar: 'A',
    color: 'hsl(207, 90%, 54%)'
  },
  MAYA: {
    id: 'maya-id',
    username: 'maya', 
    displayName: 'Maya',
    avatar: 'M',
    color: 'hsl(142, 71%, 45%)'
  }
} as const;

export const ROUTES = {
  DASHBOARD: '/',
  SHOPPING: '/shopping',
  FINANCES: '/finances',
  CLEANING: '/cleaning',
  PLANTS: '/plants'
} as const;

export const ACTIVITY_TYPES = {
  SHOPPING_ITEM_ADDED: 'shopping_item_added',
  SHOPPING_ITEM_COMPLETED: 'shopping_item_completed',
  EXPENSE_ADDED: 'expense_added',
  ROOM_CLEANED: 'room_cleaned',
  PLANT_WATERED: 'plant_watered'
} as const;
