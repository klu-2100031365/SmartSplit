export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED';

export interface UserData {
    id: string;
    name: string;
    email: string;
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
