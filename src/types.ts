export type Category = 'Food' | 'Transport' | 'Accommodation' | 'Activities' | 'Shopping' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: Category;
  description: string;
  date: string;
}

export interface Transportation {
  id: string;
  type: 'Flight' | 'Train' | 'Bus' | 'Car' | 'Other';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  confirmationNumber?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  time: string;
  location: string;
  title: string;
  notes?: string;
  naverMapUrl?: string;
  imageUrl?: string;
}

export interface DayPlan {
  id: string;
  date: string;
  activities: Activity[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  itinerary: DayPlan[];
  expenses: Expense[];
  transportation: Transportation[];
  preparation?: ChecklistItem[];
  shoppingList?: ChecklistItem[];
}
