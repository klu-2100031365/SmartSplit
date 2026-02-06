export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED';

export interface UserData {
    id: string;
    name: string;
    email: string;
    monthlySalary?: number;
}

export interface Participant {
    id: string;
    tripId: string;
    name: string;
}

export interface Expense {
    id: string;
    tripId: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    paidBy: string;
    splitAmong?: string[];
    isPayment?: boolean;
}

export type SharePermission = 'view' | 'edit';

export interface Trip {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    icon?: string;
    customImage?: string;
    shareToken?: string;
    sharePermission?: SharePermission;
    type?: 'trip' | 'dining' | 'movies' | 'play';
    currency?: Currency;
}

export interface ChangeLog {
    id: string;
    tripId: string;
    actorName: string;
    action: 'add' | 'update' | 'delete' | 'revert';
    itemType: 'expense' | 'participant';
    itemId: string;
    description: string;
    timestamp: string;
    previousData?: unknown;
    currentData?: unknown;
}

export interface Settlement {
    from: string;
    fromId: string;
    to: string;
    toId: string;
    amount: number;
}

export interface DailyCategory {
    id: string;
    userId: string;
    name: string;
    icon: string;
    color: string;
    isCustom: boolean;
}

export interface DailyExpense {
    id: string;
    userId: string;
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Other';
    notes?: string;
    sourceId?: string;
    sourceType?: 'trip' | 'dining' | 'movies' | 'play' | 'entertainment' | 'investments' | 'manual';
    metadata?: any;
}

export type RecurringItemKind = 'bill' | 'subscription';

export type RecurringItemCategory =
    | 'wifi'
    | 'electricity'
    | 'water'
    | 'mobile'
    | 'rent'
    | 'emi'
    | 'insurance'
    | 'netflix'
    | 'prime'
    | 'spotify'
    | 'hotstar'
    | 'youtube'
    | 'other';

export interface RecurringItem {
    id: string;
    userId: string;
    name: string;
    kind: RecurringItemKind;
    category: RecurringItemCategory;
    amount: number;
    dueDay: number;
    reminderDaysBefore: number;
    autoPayEnabled: boolean;
    isActive: boolean;
    notes?: string;
}
