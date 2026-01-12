import { UserData, Trip, Participant, Expense, ChangeLog, SharePermission, Settlement } from '../types';

export const generateId = () => Math.random().toString(36).substring(2, 15);

export function calculateSettlements(participants: Participant[], expenses: Expense[]) {
    const balances: Record<string, number> = {};
    const stats: Record<string, { paid: number, share: number }> = {};

    participants.forEach(p => {
        balances[p.id] = 0;
        stats[p.id] = { paid: 0, share: 0 };
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

        return { user: { id: newUser.id, name, email }, token: 'mock-token' };
    }

    async login(email: string, pass: string): Promise<{ user: UserData, token: string }> {
        await new Promise(r => setTimeout(r, 800));
        const users = this.get<UserData & { pass: string }>('users');
        const user = users.find(u => u.email === email && u.pass === pass);

        if (!user) throw new Error("Invalid credentials.");

        return { user: { id: user.id, name: user.name, email: user.email }, token: 'mock-token' };
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
}

export const api = new MockBackend();
