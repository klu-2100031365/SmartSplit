import { ChangeLog, DailyCategory, DailyExpense, Expense, Participant, RecurringItem, Settlement, SharePermission, Trip, UserData } from '../../types';

export type { Trip, Participant, Expense, ChangeLog, Settlement, DailyExpense, DailyCategory, RecurringItem, UserData, SharePermission };

export type ChartSlice = { label: string; value: number; color: string };
export type ChartBar = { label: string; value: number };

export type SettlementSummary = {
    settlements: Settlement[];
    stats: Record<string, { paid: number; share: number; received: number }>;
    balances: Record<string, number>;
};

export type DailyBalancePoint = { date: string; balances: Record<string, number> };
export type GroupedExpenses = [string, Expense[]][];

export type CategoryStatsItem = {
    category: string;
    total: number;
    involved: Record<string, number>;
};

export type TotalPayerStat = {
    id: string;
    name: string;
    amount: number;
    categories: [string, number][];
};

export type IndividualShareStat = {
    participant: Participant;
    total: number;
    categories: [string, number][];
};

export type AnalyticsData = {
    participantStats: ChartSlice[];
    dailyStats: ChartBar[];
    categoryStats: CategoryStatsItem[];
    totalTripCost: number;
    totalPayerStats: TotalPayerStat[];
    individualShareStats: IndividualShareStat[];
};

export type TripDetailsView = {
    trip: Trip;
    participants: Participant[];
    expenses: Expense[];
    logs: ChangeLog[];
    settlementData: SettlementSummary;
    dailyBalances: DailyBalancePoint[];
    groupedExpenses: GroupedExpenses;
    analyticsData: AnalyticsData;
    userShare: number;
    shareToken?: string;
    sharePermission?: SharePermission;
};

export type AuthResponse = { user: UserData; token: string };

export type UserStats = { totalTracked: number; tripCount: number };

export type UserProfileData = { trips: Trip[]; expenses: (Expense & { tripName?: string })[] };

export type DailyStats = {
    totalSpent: number;
    monthlySpent: number;
    avgDaily: number;
    categoryBreakdown: Record<string, number>;
    categoryBreakdownItems?: { categoryId: string; amount: number; percentage: number }[];
    spentVsSalaryPercent?: number;
    salaryStatus?: 'safe' | 'caution' | 'overspending';
    salaryMessage?: string;
    remainingSalary?: number;
};

export type RecurringOverview = {
    items: RecurringItem[];
    monthlyTotals: { bills: number; subs: number; total: number };
    upcoming: {
        item: RecurringItem;
        dueDate: string;
        daysUntilDue: number;
        reminderDate: string;
        daysUntilReminder: number;
    }[];
};

export type ShareTripResponse = { trip: Trip; participants: Participant[] };
