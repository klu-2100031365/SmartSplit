import { UserData, Trip, Participant, Expense, ChangeLog, SharePermission, Settlement, DailyExpense, DailyCategory } from '../types';

export const generateId = () => Math.random().toString(36).substring(2, 15);

export function calculateSettlements(participants: Participant[], expenses: Expense[]): {
    settlements: Settlement[],
    stats: Record<string, { paid: number, share: number, received: number }>,
    balances: Record<string, number>
} {
    const balances: Record<string, number> = {};
    const stats: Record<string, { paid: number, share: number, received: number }> = {};

    participants.forEach(p => {
        balances[p.id] = 0;
        stats[p.id] = { paid: 0, share: 0, received: 0 };
    });

    expenses.forEach(exp => {
        if (!exp.paidBy) return;
        const splitAmong = exp.splitAmong || [];
        const payer = exp.paidBy;
        const amount = exp.amount || 0;
        const splitCount = splitAmong.length;

        if (exp.isPayment && splitCount === 1) {
            const receiver = splitAmong[0];
            if (balances[payer] !== undefined) {
                balances[payer] += amount;
                stats[payer].paid += amount;
            }
            if (balances[receiver] !== undefined) {
                balances[receiver] -= amount;
                stats[receiver].received += amount;
            }
            return;
        }

        if (splitCount === 0) return;
        const splitAmount = amount / splitCount;

        if (balances[payer] !== undefined) {
            balances[payer] += amount;
            stats[payer].paid += amount;
        }

        splitAmong.forEach(pid => {
            if (balances[pid] !== undefined) {
                balances[pid] -= splitAmount;
                stats[pid].share += splitAmount;
            }
        });
    });

    const debtors: { id: string, amount: number }[] = [];
    const creditors: { id: string, amount: number }[] = [];

    Object.entries(balances).forEach(([id, amount]) => {
        const val = Math.round(amount * 100) / 100;
        if (val < -0.01) debtors.push({ id, amount: val });
        if (val > 0.01) creditors.push({ id, amount: val });
    });

    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements: Settlement[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        const debtorName = participants.find(p => p.id === debtor.id)?.name || 'Unknown';
        const creditorName = participants.find(p => p.id === creditor.id)?.name || 'Unknown';

        settlements.push({ from: debtorName, fromId: debtor.id, to: creditorName, toId: creditor.id, amount });

        debtor.amount += amount;
        creditor.amount -= amount;

        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return { settlements, stats, balances };
}

class MockBackend {
    private get<T>(key: string): T[] {
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    private set<T>(key: string, data: T[]): void {
        localStorage.setItem(key, JSON.stringify(data));
    }

    async register(name: string, email: string, pass: string): Promise<{ user: UserData, token: string }> {
        await new Promise(r => setTimeout(r, 800));
        const users = this.get<UserData & { pass: string }>('users');

        if (users.find(u => u.email === email)) throw new Error("Email already exists.");

        const newUser = { id: generateId(), name, email, pass };
        users.push(newUser);
        this.set('users', users);

        return { user: { id: newUser.id, name, email, monthlySalary: undefined }, token: 'mock-token' };
    }

    async login(email: string, pass: string): Promise<{ user: UserData, token: string }> {
        await new Promise(r => setTimeout(r, 800));
        const users = this.get<UserData & { pass: string }>('users');
        const user = users.find(u => u.email === email && u.pass === pass);

        if (!user) throw new Error("Invalid credentials.");

        return { user: { id: user.id, name: user.name, email: user.email, monthlySalary: user.monthlySalary }, token: 'mock-token' };
    }

    async getTrips(userId: string): Promise<Trip[]> {
        const trips = this.get<Trip>('trips');
        return trips.filter(t => t.ownerId === userId).reverse();
    }

    async deleteTrip(userId: string, tripId: string): Promise<void> {
        const trips = this.get<Trip>('trips');
        this.set('trips', trips.filter(t => !(t.id === tripId && t.ownerId === userId)));
    }

    async createTrip(userId: string, name: string, icon: string = 'plane', customImage?: string): Promise<Trip> {
        await new Promise(r => setTimeout(r, 600));
        const trips = this.get<Trip>('trips');
        const newTrip = {
            id: generateId(),
            name,
            ownerId: userId,
            createdAt: new Date().toISOString(),
            icon,
            customImage
        };
        trips.push(newTrip);
        this.set('trips', trips);

        const users = this.get<UserData>('users');
        const currentUser = users.find(u => u.id === userId);
        if (currentUser) {
            await this.addParticipant(newTrip.id, currentUser.name);
        }

        return newTrip;
    }

    async updateTrip(userId: string, tripId: string, name: string, icon: string, customImage?: string): Promise<void> {
        await new Promise(r => setTimeout(r, 600));
        const trips = this.get<Trip>('trips');
        const idx = trips.findIndex(t => t.id === tripId && t.ownerId === userId);
        if (idx !== -1) {
            trips[idx] = { ...trips[idx], name, icon, customImage };
            this.set('trips', trips);
        }
    }

    async getTripDetails(tripId: string) {
        const trips = this.get<Trip>('trips');
        const trip = trips.find(t => t.id === tripId);
        if (!trip) throw new Error("Trip not found");

        const participants = this.get<Participant>('participants').filter(p => p.tripId === tripId);
        const expenses = this.get<Expense>('expenses').filter(e => e.tripId === tripId);
        const logs = this.get<ChangeLog>('logs').filter(l => l.tripId === tripId).reverse();

        return { trip, participants, expenses, logs };
    }

    async addParticipant(tripId: string, name: string): Promise<Participant> {
        const participants = this.get<Participant>('participants');
        const newP = { id: generateId(), tripId, name };
        participants.push(newP);
        this.set('participants', participants);
        return newP;
    }

    async removeParticipant(id: string, tripId: string): Promise<void> {
        const participants = this.get<Participant>('participants');
        const expenses = this.get<Expense>('expenses').filter(e => e.tripId === tripId);

        const isUsed = expenses.some(e => e.paidBy === id || (e.splitAmong || []).includes(id));
        if (isUsed) throw new Error("Cannot remove participant involved in expenses.");

        this.set('participants', participants.filter(p => p.id !== id));
    }

    async updateParticipant(id: string, name: string): Promise<void> {
        const participants = this.get<Participant>('participants');
        const p = participants.find(p => p.id === id);
        if (p) {
            p.name = name;
            this.set('participants', participants);
        }
    }

    async addExpense(tripId: string, expense: Omit<Expense, 'id' | 'tripId'>, actor?: { id: string, name: string }): Promise<Expense> {
        await new Promise(r => setTimeout(r, 600));
        const trips = this.get<Trip>('trips');
        const trip = trips.find(t => t.id === tripId);

        const expenses = this.get<Expense>('expenses');
        const newExpense = { ...expense, id: generateId(), tripId };
        expenses.push(newExpense);
        this.set('expenses', expenses);

        if (trip && actor && actor.id !== trip.ownerId) {
            this.logChange(tripId, actor.name, 'add', 'expense', newExpense.id, `Added "${newExpense.description}"`, newExpense);
        }

        return newExpense;
    }

    async updateExpense(tripId: string, expenseId: string, data: Partial<Expense>, actor?: { id: string, name: string }): Promise<void> {
        const expenses = this.get<Expense>('expenses');
        const idx = expenses.findIndex(e => e.id === expenseId);
        if (idx !== -1) {
            const previous = { ...expenses[idx] };
            expenses[idx] = { ...expenses[idx], ...data };
            this.set('expenses', expenses);

            const trips = this.get<Trip>('trips');
            const trip = trips.find(t => t.id === tripId);
            if (trip && actor && actor.id !== trip.ownerId) {
                this.logChange(tripId, actor.name, 'update', 'expense', expenseId, `Updated "${expenses[idx].description}"`, expenses[idx], previous);
            }
        }
    }

    async deleteExpense(tripId: string, expenseId: string, actor?: { id: string, name: string }): Promise<void> {
        const expenses = this.get<Expense>('expenses');
        const expense = expenses.find(e => e.id === expenseId);
        if (!expense) return;

        this.set('expenses', expenses.filter(e => e.id !== expenseId));

        const trips = this.get<Trip>('trips');
        const trip = trips.find(t => t.id === tripId);
        if (trip && actor && actor.id !== trip.ownerId) {
            this.logChange(tripId, actor.name, 'delete', 'expense', expenseId, `Deleted "${expense.description}"`, null, expense);
        }
    }

    private logChange(tripId: string, actorName: string, action: 'add' | 'update' | 'delete', itemType: 'expense' | 'participant', itemId: string, description: string, current: unknown, previous?: unknown) {
        const logs = this.get<ChangeLog>('logs');
        logs.push({
            id: generateId(),
            tripId,
            actorName,
            action,
            itemType,
            itemId,
            description,
            timestamp: new Date().toISOString(),
            previousData: previous,
            currentData: current
        });
        this.set('logs', logs);
    }

    async getTripByShareToken(token: string) {
        const trips = this.get<Trip>('trips');
        const trip = trips.find(t => t.shareToken === token);
        if (!trip) throw new Error("Invalid or expired link");
        return this.getTripDetails(trip.id);
    }

    async generateShareLink(tripId: string, permission: SharePermission) {
        const trips = this.get<Trip>('trips');
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
            trip.shareToken = generateId().substring(0, 8);
            trip.sharePermission = permission;
            this.set('trips', trips);
            return trip.shareToken;
        }
    }

    async revertChange(logId: string) {
        const logs = this.get<ChangeLog>('logs');
        const log = logs.find(l => l.id === logId);
        if (!log) return;

        if (log.itemType === 'expense') {
            const expenses = this.get<Expense>('expenses');
            if (log.action === 'add') {
                this.set('expenses', expenses.filter(e => e.id !== log.itemId));
            } else if (log.action === 'delete') {
                expenses.push(log.previousData as Expense);
                this.set('expenses', expenses);
            } else if (log.action === 'update') {
                const idx = expenses.findIndex(e => e.id === log.itemId);
                if (idx !== -1) {
                    expenses[idx] = log.previousData as Expense;
                    this.set('expenses', expenses);
                }
            }
        }
        this.set('logs', logs.filter(l => l.id !== logId));
    }

    async revertAllChanges(tripId: string) {
        const logs = this.get<ChangeLog>('logs').filter(l => l.tripId === tripId);
        for (const log of logs) {
            await this.revertChange(log.id);
        }
    }

    async getUserStats(userId: string) {
        const trips = this.get<Trip>('trips').filter(t => t.ownerId === userId);
        const expenses = this.get<Expense>('expenses').filter(e => trips.some(t => t.id === e.tripId) && !e.isPayment);
        const totalTracked = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        return { totalTracked, tripCount: trips.length };
    }

    async getUserProfileData(userId: string) {
        const trips = this.get<Trip>('trips').filter(t => t.ownerId === userId);
        const expenses = this.get<Expense>('expenses')
            .filter(e => trips.some(t => t.id === e.tripId) && e.paidBy === userId && !e.isPayment)
            .map(e => ({ ...e, tripName: trips.find(t => t.id === e.tripId)?.name }));

        return { trips, expenses };
    }

    // Daily Expenses
    async getDailyExpenses(userId: string): Promise<DailyExpense[]> {
        const expenses = this.get<DailyExpense>('daily_expenses');
        return expenses.filter(e => e.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    async addDailyExpense(userId: string, expense: Omit<DailyExpense, 'id' | 'userId'>): Promise<DailyExpense> {
        await new Promise(r => setTimeout(r, 400));
        const expenses = this.get<DailyExpense>('daily_expenses');
        const newExpense = { ...expense, id: generateId(), userId };
        expenses.push(newExpense);
        this.set('daily_expenses', expenses);
        return newExpense;
    }

    async updateDailyExpense(userId: string, expenseId: string, data: Partial<DailyExpense>): Promise<void> {
        const expenses = this.get<DailyExpense>('daily_expenses');
        const idx = expenses.findIndex(e => e.id === expenseId && e.userId === userId);
        if (idx !== -1) {
            expenses[idx] = { ...expenses[idx], ...data };
            this.set('daily_expenses', expenses);
        }
    }

    async deleteDailyExpense(userId: string, expenseId: string): Promise<void> {
        const expenses = this.get<DailyExpense>('daily_expenses');
        this.set('daily_expenses', expenses.filter(e => !(e.id === expenseId && e.userId === userId)));
    }

    // Daily Categories
    async getDailyCategories(userId: string): Promise<DailyCategory[]> {
        const categories = this.get<DailyCategory>('daily_categories');
        const defaults: DailyCategory[] = [
            { id: '1', userId: 'system', name: 'Food & Dining', icon: 'Pizza', color: 'orange', isCustom: false },
            { id: '2', userId: 'system', name: 'Transport', icon: 'Car', color: 'blue', isCustom: false },
            { id: '3', userId: 'system', name: 'Bills & Utilities', icon: 'Zap', color: 'yellow', isCustom: false },
            { id: '4', userId: 'system', name: 'Rent/Housing', icon: 'Home', color: 'purple', isCustom: false },
            { id: '5', userId: 'system', name: 'Entertainment', icon: 'Frown', color: 'pink', isCustom: false },
            { id: '6', userId: 'system', name: 'Healthcare', icon: 'Heart', color: 'red', isCustom: false },
            { id: '7', userId: 'system', name: 'Shopping', icon: 'ShoppingBag', color: 'green', isCustom: false },
            { id: '8', userId: 'system', name: 'Others', icon: 'MoreHorizontal', color: 'gray', isCustom: false },
        ];
        return [...defaults, ...categories.filter(c => c.userId === userId)];
    }

    async addDailyCategory(userId: string, category: Omit<DailyCategory, 'id' | 'userId' | 'isCustom'>): Promise<DailyCategory> {
        const categories = this.get<DailyCategory>('daily_categories');
        const newCat = { ...category, id: generateId(), userId, isCustom: true };
        categories.push(newCat);
        this.set('daily_categories', categories);
        return newCat;
    }

    async getDailyStats(userId: string) {
        const expenses = await this.getDailyExpenses(userId);
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

        const categoryBreakdown: Record<string, number> = {};
        expenses.forEach(e => {
            categoryBreakdown[e.categoryId] = (categoryBreakdown[e.categoryId] || 0) + e.amount;
        });

        return { totalSpent, expenseCount: expenses.length, categoryBreakdown };
    }

    async updateMonthlySalary(userId: string, salary: number): Promise<void> {
        const users = this.get<UserData & { pass: string }>('users');
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
            users[idx].monthlySalary = salary;
            this.set('users', users);
        }
    }

    async getMonthlySalary(userId: string): Promise<number | undefined> {
        const users = this.get<UserData & { pass: string }>('users');
        const user = users.find(u => u.id === userId);
        return user?.monthlySalary;
    }

    async syncTripExpenses(userId: string, sources: string[] = ['trip']): Promise<number> {
        const users = this.get<UserData & { pass: string }>('users');
        const user = users.find(u => u.id === userId);
        if (!user) return 0;

        const allParticipants = this.get<Participant>('participants');
        const userParticipantIds = new Set(allParticipants.filter(p => p.name === user.name).map(p => p.id));

        const trips = this.get<Trip>('trips');
        const tripExpenses = this.get<Expense>('expenses').filter(e =>
            userParticipantIds.has(e.paidBy) && !e.isPayment
        );

        const dailyExpenses = this.get<DailyExpense>('daily_expenses');
        const existingSourceIds = new Set(dailyExpenses.filter(e => e.userId === userId && e.sourceId).map(e => e.sourceId));
        const categories = await this.getDailyCategories(userId);

        let count = 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        if (sources.includes('trip')) {
            tripExpenses.forEach(te => {
                const expDate = new Date(te.date);
                if (expDate.getMonth() === thisMonth && expDate.getFullYear() === thisYear && !existingSourceIds.has(te.id)) {
                    let catId = '8';
                    const matchingCat = categories.find(c => c.name.toLowerCase().includes(te.category.toLowerCase()) || te.category.toLowerCase().includes(c.name.toLowerCase()));
                    if (matchingCat) catId = matchingCat.id;

                    dailyExpenses.push({
                        id: generateId(),
                        userId,
                        description: te.description,
                        amount: te.amount,
                        date: te.date,
                        categoryId: catId,
                        paymentMethod: 'UPI',
                        notes: `Synced from trip: ${trips.find(t => t.id === te.tripId)?.name || 'Unknown Trip'}`,
                        sourceId: te.id,
                        sourceType: 'trip'
                    });
                    count++;
                }
            });
        }

        // Mock additional sources if requested
        ['dining', 'play', 'entertainment', 'investments'].forEach(source => {
            if (sources.includes(source)) {
                // For demo purposes, we generate some mock data if it doesn't exist and sync it
                // In a real app, these would be separate tables/APIs
                const mockKey = `${source}_expenses`;
                let mockItems = this.get<any>(mockKey);
                if (mockItems.length === 0) {
                    // Seed some data for this month
                    mockItems = [
                        { id: `m-${source}-1`, description: `Mock ${source} 1`, amount: 450, date: now.toISOString(), category: source },
                        { id: `m-${source}-2`, description: `Mock ${source} 2`, amount: 1200, date: now.toISOString(), category: source },
                    ];
                    this.set(mockKey, mockItems);
                }

                mockItems.forEach(item => {
                    const expDate = new Date(item.date);
                    if (expDate.getMonth() === thisMonth && expDate.getFullYear() === thisYear && !existingSourceIds.has(item.id)) {
                        dailyExpenses.push({
                            id: generateId(),
                            userId,
                            description: item.description,
                            amount: item.amount,
                            date: item.date,
                            categoryId: '8',
                            paymentMethod: 'Card',
                            notes: `Synced from ${source} module`,
                            sourceId: item.id,
                            sourceType: source as any
                        });
                        count++;
                    }
                });
            }
        });

        if (count > 0) {
            this.set('daily_expenses', dailyExpenses);
        }
        return count;
    }
}

export const api = new MockBackend();
