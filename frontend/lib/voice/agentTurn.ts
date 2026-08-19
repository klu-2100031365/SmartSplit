import { api } from '../api';
import type { UserData } from '../../types';
import {
    HELP_SCRIPT,
    friendlyVoiceError,
    isValidEmail,
    normalizeSpokenCommand,
    normalizeSpokenEmail,
    normalizeSpokenSecret,
    parseAmount,
    parseIntent,
    parseRemovePeople,
    peelTripName,
    splitPeopleNames,
    type VoiceIntent,
} from './intents';

export type AgentMode =
    | 'command'
    | 'login_email'
    | 'login_password'
    | 'register_name'
    | 'register_email'
    | 'register_password'
    | 'trip_name'
    | 'people_names'
    | 'people_trip'
    | 'remove_names'
    | 'remove_trip'
    | 'expense_amount'
    | 'expense_payer';

export type AgentState = {
    mode: AgentMode;
    draft: {
        email: string;
        password: string;
        name: string;
        names: string[];
        expenseDesc: string;
        expenseAmount: number;
        expensePayer: string;
        expenseEveryone: boolean;
    };
};

export const emptyAgentState = (): AgentState => ({
    mode: 'command',
    draft: {
        email: '',
        password: '',
        name: '',
        names: [],
        expenseDesc: '',
        expenseAmount: 0,
        expensePayer: '',
        expenseEveryone: true,
    },
});

export type AgentRuntime = {
    isAuthenticated: boolean;
    pathname: string;
    theme: string;
    channel: 'text' | 'voice';
    login: (user: UserData, token: string) => void;
    logout: () => void;
    go: (path: string) => void;
    toggleTheme: () => void;
    user?: { id: string; name: string } | null;
};

const GUEST_HELP_TEXT =
    'I can log you in or create an account. After you sign in, I can open dashboard, trips, daily expenses, bills, activities, dining, movies, play, SIPs, and profile.';

const SIGNED_IN_HELP =
    'I can open every part of the app: Dashboard, Trips, Daily expenses, Bills, Activities, Dining, Movies, Play, SIPs, and Profile. You can also say New trip, Add people named Ada, Bob, Add expense 250 for coffee, My trips, or My stats.';

function emailFromInput(raw: string) {
    const trimmed = raw.trim();
    if (isValidEmail(trimmed)) return trimmed.toLowerCase();
    return normalizeSpokenEmail(trimmed);
}

function passwordFromInput(raw: string, channel: 'text' | 'voice') {
    if (channel === 'text') return raw.trim();
    return normalizeSpokenSecret(raw);
}

function skipSpokenNorm(mode: AgentMode) {
    return mode === 'login_password' || mode === 'register_password' || mode === 'login_email' || mode === 'register_email';
}

function voiceifyReply(reply: string, channel: 'text' | 'voice') {
    if (channel !== 'voice') return reply;
    return reply
        .replace(/\bType /g, 'Say ')
        .replace(/\btype /g, 'say ')
        .replace(/\bEnter /g, 'Say ')
        .replace(/\benter /g, 'say ')
        .replace(/\bTap /g, 'Say ')
        .replace(/\btap /g, 'say ');
}

function clickByLabel(label: string) {
    const needle = label.toLowerCase().replace(/\s+/g, ' ').trim();
    const byTab = document.querySelector(`[data-ss-tab="${needle}"]`);
    if (byTab instanceof HTMLElement) {
        byTab.click();
        return true;
    }
    const nodes = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const match = nodes.find((node) => {
        if (!(node instanceof HTMLElement)) return false;
        const text = `${node.innerText || ''} ${node.getAttribute('aria-label') || ''} ${node.getAttribute('data-ss-tab') || ''}`
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
        const compact = text.replace(/\s+/g, '');
        return text === needle || text.includes(needle) || compact.includes(needle.replace(/\s+/g, ''));
    });
    if (match instanceof HTMLElement) {
        match.click();
        return true;
    }
    return false;
}

async function loginWith(email: string, password: string, runtime: AgentRuntime) {
    const res = await api.login(email, password);
    runtime.login(res.user, res.token);
    const first = res.user.name.split(' ')[0];
    runtime.go(res.user.isAdmin ? '/admin' : '/dashboard');
    return `Welcome back ${first}. Opening your dashboard. From there you can open trips, daily expenses, bills, activities, dining, movies, play, SIPs, or profile.`;
}

async function createNamedTrip(rawName: string, runtime: AgentRuntime) {
    const name = rawName.replace(/^(?:it(?:'s| is)|called|named|name is)\s+/i, '').trim();
    if (!name || /^(cancel|stop|never mind|nevermind)$/i.test(name)) {
        return { reply: 'Cancelled. Type New trip when you want to try again.', mode: 'command' as const };
    }
    if (!runtime.isAuthenticated) {
        return { reply: 'Sign in first, then I can create a trip. Type Log in or Create account.', mode: 'command' as const };
    }
    const trip = await api.createTrip('', name);
    runtime.go(`/trips/${trip.id}`);
    return { reply: `Created trip ${trip.name}. Opening it.`, mode: 'command' as const };
}

function tripIdFromPath(pathname: string) {
    const match = pathname.match(/^\/trips\/([^/]+)/);
    return match?.[1] || null;
}

function notifyTripChanged(tripId: string) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('ss-data-changed', { detail: { type: 'trip', id: tripId } }));
}

async function resolveTrip(runtime: AgentRuntime, tripName?: string) {
    const fromPath = tripIdFromPath(runtime.pathname);
    const trips = await api.getTrips('');
    if (tripName) {
        const needle = tripName
            .toLowerCase()
            .replace(/\b(the|my|our|trip)\b/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const match =
            trips.find((t) => t.name.toLowerCase() === needle) ||
            trips.find((t) => t.name.toLowerCase().includes(needle)) ||
            trips.find((t) => needle.includes(t.name.toLowerCase()));
        if (match) return match;
    }
    if (fromPath) {
        const current = trips.find((t) => t.id === fromPath);
        if (current) return current;
    }
    if (trips.length === 1) return trips[0];
    return null;
}

function neatName(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (trimmed.length === 1) return trimmed.toUpperCase();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function formatNameList(names: string[]) {
    if (names.length <= 1) return names[0] || '';
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

async function addPeopleToTrip(names: string[], runtime: AgentRuntime, tripName?: string) {
    if (!runtime.isAuthenticated) {
        return { reply: 'Sign in first, then I can add people. Type Log in.', mode: 'command' as const, names };
    }
    const cleaned = names.map((n) => neatName(n)).filter((n) => n && !/^(Add|Remove|Delete|Invite|Include)$/i.test(n));
    if (!cleaned.length) {
        return { reply: 'Who should I add? Type names separated by commas.', mode: 'people_names' as const, names: [] };
    }

    const trips = await api.getTrips('');
    if (!trips.length) {
        return {
            reply: 'You have no trips yet. Type New trip, then a name, and I can add people after that.',
            mode: 'command' as const,
            names: cleaned,
        };
    }

    const trip = await resolveTrip(runtime, tripName);
    if (!trip) {
        return {
            reply: `Which trip should I add ${formatNameList(cleaned)} to? Your trips: ${trips.map((t) => t.name).join(', ')}.`,
            mode: 'people_trip' as const,
            names: cleaned,
        };
    }

    const details = await api.getTripDetails(trip.id);
    const existing = new Set((details.participants || []).map((p) => p.name.toLowerCase()));
    const unique: string[] = [];
    const skipped: string[] = [];
    for (const name of cleaned) {
        if (existing.has(name.toLowerCase()) || unique.some((n) => n.toLowerCase() === name.toLowerCase())) {
            skipped.push(name);
        } else {
            unique.push(name);
        }
    }

    for (const name of unique) {
        await api.addParticipant(trip.id, name);
        existing.add(name.toLowerCase());
    }

    notifyTripChanged(trip.id);
    if (!runtime.pathname.startsWith(`/trips/${trip.id}`)) {
        runtime.go(`/trips/${trip.id}`);
    }

    if (!unique.length) {
        return {
            reply: `${formatNameList(skipped)} already on ${trip.name}.`,
            mode: 'command' as const,
            names: [],
        };
    }

    const added = `Added ${formatNameList(unique)} to ${trip.name}.`;
    const extra = skipped.length ? ` Skipped ${formatNameList(skipped)} — already there.` : '';
    return { reply: added + extra, mode: 'command' as const, names: [] };
}

function matchParticipants(query: string, people: { id: string; name: string }[]) {
    const q = query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (!q) return [];
    const scored = people.map((p) => {
        const name = p.name.toLowerCase();
        const compact = name.replace(/[^a-z0-9]+/g, '');
        const first = name.split(/[\s._-]+/)[0]?.replace(/[^a-z0-9]+/g, '') || compact;
        let score = 0;
        if (compact === q || name === query.trim().toLowerCase()) score = 5;
        else if (compact.startsWith(q) || q.startsWith(compact) || first === q) score = 4;
        else if (compact.includes(q) || q.includes(first)) score = 3;
        else if (editDistance(q, first) <= 2 && Math.min(q.length, first.length) >= 4) score = 2;
        return { p, score };
    });
    const best = Math.max(0, ...scored.map((s) => s.score));
    if (best < 2) return [];
    return scored.filter((s) => s.score === best).map((s) => s.p);
}

function editDistance(a: string, b: string) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
        let prev = i - 1;
        row[0] = i;
        for (let j = 1; j <= b.length; j += 1) {
            const cur = row[j];
            row[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev, row[j], row[j - 1]) + 1;
            prev = cur;
        }
    }
    return row[b.length];
}

function categoryFromDesc(description: string) {
    const s = description.toLowerCase();
    if (/food|lunch|dinner|breakfast|eat|pizza|coffee|meal|restaurant|snack|dinner/.test(s)) return 'Food';
    if (/travel|uber|taxi|bus|train|flight|fuel|petrol|cab/.test(s)) return 'Travel';
    if (/rent|hotel|stay|room/.test(s)) return 'Rent';
    if (/movie|film|game|entertain/.test(s)) return 'Entertainment';
    if (/shop|mall|cloth/.test(s)) return 'Shopping';
    return 'Others';
}

async function addTripExpense(
    runtime: AgentRuntime,
    draft: AgentState['draft'],
): Promise<{ reply: string; mode: AgentMode; draft: AgentState['draft'] }> {
    if (!runtime.isAuthenticated) {
        return { reply: 'Sign in first, then I can add an expense. Type Log in.', mode: 'command', draft };
    }

    const trip = await resolveTrip(runtime);
    if (!trip) {
        return {
            reply: 'Open a trip first, then I can add this expense there.',
            mode: 'command',
            draft,
        };
    }

    const details = await api.getTripDetails(trip.id);
    const people = details.participants || [];
    if (!people.length) {
        return { reply: `Add people to ${trip.name} first, then I can log an expense.`, mode: 'command', draft };
    }

    if (!draft.expensePayer) {
        return {
            reply: `Who paid for ${draft.expenseDesc || 'this'}? People: ${people.map((p) => p.name).join(', ')}.`,
            mode: 'expense_payer',
            draft,
        };
    }

    const payers = matchParticipants(draft.expensePayer, people);
    if (!payers.length) {
        return {
            reply: `I could not find ${draft.expensePayer} on ${trip.name}. People: ${people.map((p) => p.name).join(', ')}.`,
            mode: 'expense_payer',
            draft,
        };
    }
    if (payers.length > 1) {
        return {
            reply: `Which one paid — ${payers.map((p) => p.name).join(' or ')}?`,
            mode: 'expense_payer',
            draft,
        };
    }

    if (!draft.expenseAmount || draft.expenseAmount <= 0) {
        return {
            reply: `How much was ${draft.expenseDesc || 'the expense'}? Type the amount, like 500.`,
            mode: 'expense_amount',
            draft,
        };
    }

    const splitAmong = draft.expenseEveryone ? people.map((p) => p.id) : people.map((p) => p.id);
    const description = draft.expenseDesc || 'Expense';
    await api.addExpense(
        trip.id,
        {
            description,
            amount: draft.expenseAmount,
            date: new Date().toISOString(),
            category: categoryFromDesc(description),
            paidBy: [payers[0].id],
            splitAmong,
            isPayment: false,
        },
        runtime.user ? { id: runtime.user.id, name: runtime.user.name } : undefined,
    );
    notifyTripChanged(trip.id);
    if (!runtime.pathname.startsWith(`/trips/${trip.id}`)) runtime.go(`/trips/${trip.id}`);

    return {
        reply: `Added ${draft.expenseAmount} for ${description} on ${trip.name}. ${payers[0].name} paid, split among everyone.`,
        mode: 'command',
        draft: emptyAgentState().draft,
    };
}

async function removePeopleFromTrip(names: string[], runtime: AgentRuntime, tripName?: string) {
    if (!runtime.isAuthenticated) {
        return { reply: 'Sign in first, then I can remove people. Type Log in.', mode: 'command' as const, names };
    }
    const cleaned = names.map((n) => n.trim()).filter(Boolean);
    if (!cleaned.length) {
        return {
            reply: 'Who should I remove? Type a name, like Are or Danny.',
            mode: 'remove_names' as const,
            names: [],
        };
    }

    const trips = await api.getTrips('');
    if (!trips.length) {
        return { reply: 'You have no trips yet.', mode: 'command' as const, names: [] };
    }

    const trip = await resolveTrip(runtime, tripName);
    if (!trip) {
        return {
            reply: `Which trip should I remove ${formatNameList(cleaned)} from? Your trips: ${trips.map((t) => t.name).join(', ')}.`,
            mode: 'remove_trip' as const,
            names: cleaned,
        };
    }

    const details = await api.getTripDetails(trip.id);
    const people = details.participants || [];
    const removed: string[] = [];
    const missing: string[] = [];
    const ambiguous: string[] = [];

    for (const name of cleaned) {
        const matches = matchParticipants(name, people).filter(
            (p) => !removed.some((r) => r.toLowerCase() === p.name.toLowerCase()),
        );
        if (!matches.length) {
            missing.push(name);
            continue;
        }
        if (matches.length > 1) {
            ambiguous.push(`${name} (${matches.map((m) => m.name).join(', ')})`);
            continue;
        }
        const person = matches[0];
        await api.removeParticipant(person.id, trip.id);
        removed.push(person.name);
        const idx = people.findIndex((p) => p.id === person.id);
        if (idx >= 0) people.splice(idx, 1);
    }

    notifyTripChanged(trip.id);
    if (!runtime.pathname.startsWith(`/trips/${trip.id}`)) {
        runtime.go(`/trips/${trip.id}`);
    }

    if (!removed.length && !ambiguous.length) {
        const onTrip = people.length ? ` People on ${trip.name}: ${people.map((p) => p.name).join(', ')}.` : '';
        return {
            reply: `I could not find ${formatNameList(cleaned)} on ${trip.name}.${onTrip}`,
            mode: 'command' as const,
            names: [],
        };
    }

    const bits: string[] = [];
    if (removed.length) bits.push(`Removed ${formatNameList(removed)} from ${trip.name}.`);
    if (missing.length) bits.push(`Could not find ${formatNameList(missing)}.`);
    if (ambiguous.length) bits.push(`Be more specific for ${ambiguous.join('; ')}.`);
    return { reply: bits.join(' '), mode: 'command' as const, names: [] };
}

async function renamePersonOnTrip(from: string, to: string, runtime: AgentRuntime) {
    if (!runtime.isAuthenticated) return 'Sign in first, then I can rename people.';
    const newName = neatName(to);
    if (!newName) return 'What should the new name be?';

    const trip = await resolveTrip(runtime);
    if (!trip) return 'Open a trip first, then I can rename someone.';

    const details = await api.getTripDetails(trip.id);
    const people = details.participants || [];
    const matches = matchParticipants(from, people);
    if (!matches.length) {
        return `I could not find ${from} on ${trip.name}. People: ${people.map((p) => p.name).join(', ') || 'none'}.`;
    }
    if (matches.length > 1) {
        return `Which one should I rename — ${matches.map((p) => p.name).join(' or ')}?`;
    }

    const person = matches[0];
    if (person.name.toLowerCase() === newName.toLowerCase()) {
        return `${person.name} is already named that.`;
    }
    await api.updateParticipant(person.id, newName);
    notifyTripChanged(trip.id);
    return `Renamed ${person.name} to ${newName}.`;
}

async function runIntent(intent: VoiceIntent, state: AgentState, runtime: AgentRuntime): Promise<{ reply: string; state: AgentState }> {
    const next = { ...state, draft: { ...state.draft } };

    switch (intent.type) {
                case 'help':
        case 'wake':
            return {
                reply: runtime.isAuthenticated ? SIGNED_IN_HELP : runtime.channel === 'text' ? GUEST_HELP_TEXT : HELP_SCRIPT,
                state: { ...next, mode: 'command' },
            };
        case 'sleep':
            return { reply: 'Okay. Type or say wake up when you need me.', state: { ...next, mode: 'command' } };
        case 'scroll': {
            const h = window.innerHeight * 0.85;
            if (intent.direction === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
            if (intent.direction === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            if (intent.direction === 'down') window.scrollBy({ top: h, behavior: 'smooth' });
            if (intent.direction === 'up') window.scrollBy({ top: -h, behavior: 'smooth' });
            return { reply: `Scrolling ${intent.direction}.`, state: next };
        }
        case 'theme': {
            if (intent.mode === 'toggle') runtime.toggleTheme();
            else if ((intent.mode === 'dark') !== (runtime.theme === 'dark')) runtime.toggleTheme();
            return { reply: intent.mode === 'toggle' ? 'Switching theme.' : `${intent.mode} mode.`, state: next };
        }
        case 'navigate':
            runtime.go(intent.path);
            return { reply: `Opening ${intent.label}.`, state: next };
        case 'open_tab': {
            window.dispatchEvent(new CustomEvent('ss-open-tab', { detail: { tab: intent.tab } }));
            const clicked = clickByLabel(intent.tab);
            return {
                reply: clicked || intent.tab === 'analytics' || intent.tab === 'settlements' || intent.tab === 'expenses'
                    ? `Opening ${intent.tab}.`
                    : `I could not find the ${intent.tab} tab on this page. Open a trip first.`,
                state: next,
            };
        }
        case 'login_start':
            if (runtime.isAuthenticated) return { reply: 'You are already signed in.', state: next };
            next.mode = 'login_email';
            return {
                reply: runtime.channel === 'text'
                    ? 'Enter your email to log in.'
                    : 'What is your email?',
                state: next,
            };
        case 'login_direct':
            if (runtime.isAuthenticated) return { reply: 'You are already signed in.', state: next };
            try {
                const reply = await loginWith(intent.email, intent.password, runtime);
                return { reply, state: emptyAgentState() };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: emptyAgentState() };
            }
        case 'register_start':
            if (runtime.isAuthenticated) {
                return { reply: 'You already have a session. Log out first to register a new account.', state: next };
            }
            next.mode = 'register_name';
            return { reply: runtime.channel === 'text' ? 'Type your name.' : 'Say your name.', state: next };
        case 'logout':
            if (!runtime.isAuthenticated) return { reply: 'You are not signed in.', state: next };
            runtime.logout();
            runtime.go('/');
            return { reply: 'Signed out.', state: emptyAgentState() };
        case 'create_trip_start':
            if (!runtime.isAuthenticated) {
                return { reply: 'Sign in first. Type Log in or Create account, then I can create a trip.', state: next };
            }
            next.mode = 'trip_name';
            return { reply: 'What should we name the trip?', state: next };
        case 'create_trip':
            try {
                const created = await createNamedTrip(intent.name, runtime);
                return { reply: created.reply, state: { ...next, mode: created.mode } };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
            }
        case 'add_people_start':
            if (!runtime.isAuthenticated) {
                return { reply: 'Sign in first, then I can add people. Type Log in.', state: next };
            }
            next.mode = 'people_names';
            next.draft.names = [];
            return {
                reply: 'Who should I add? Names in any style are fine — Danny, Abdul, Anu or danny abdul anu.',
                state: next,
            };
        case 'add_people':
            try {
                const added = await addPeopleToTrip(intent.names, runtime, intent.tripName);
                next.mode = added.mode;
                next.draft.names = added.names;
                return { reply: added.reply, state: next };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
            }
        case 'remove_people_start':
            if (!runtime.isAuthenticated) {
                return { reply: 'Sign in first, then I can remove people. Type Log in.', state: next };
            }
            next.mode = 'remove_names';
            next.draft.names = [];
            return { reply: 'Who should I remove? Type the name, like Are or Danny.', state: next };
        case 'remove_people':
            try {
                const removed = await removePeopleFromTrip(intent.names, runtime, intent.tripName);
                next.mode = removed.mode;
                next.draft.names = removed.names;
                return { reply: removed.reply, state: next };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
            }
        case 'rename_person':
            try {
                const renamed = await renamePersonOnTrip(intent.from, intent.to, runtime);
                return { reply: renamed, state: next };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
            }
        case 'add_trip_expense': {
            next.draft.expenseDesc = intent.description;
            next.draft.expenseAmount = intent.amount || 0;
            next.draft.expensePayer = intent.paidBy || '';
            next.draft.expenseEveryone = intent.splitEveryone;
            try {
                const added = await addTripExpense(runtime, next.draft);
                return { reply: added.reply, state: { ...next, mode: added.mode, draft: added.draft } };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
            }
        }
        case 'click':
            if (clickByLabel(intent.label)) return { reply: `Clicked ${intent.label}.`, state: next };
            return { reply: `I could not find ${intent.label} on this page.`, state: next };
        case 'list_trips': {
            if (!runtime.isAuthenticated) {
                return { reply: 'Sign in first to see your trips.', state: next };
            }
            try {
                const trips = await api.getTrips('');
                if (!trips.length) return { reply: 'You have no trips yet. Type New trip, then a name.', state: next };
                return { reply: `You have ${trips.length} trip${trips.length === 1 ? '' : 's'}: ${trips.map((t) => t.name).join(', ')}.`, state: next };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: next };
            }
        }
        case 'stats': {
            if (!runtime.isAuthenticated) return { reply: 'Sign in first to hear your stats.', state: next };
            try {
                const stats = await api.getUserStats('');
                return {
                    reply: `You have ${stats.tripCount} trips, ${stats.totalTracked} tracked, and ${stats.pendingSettlements} pending settlements.`,
                    state: next,
                };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: next };
            }
        }
        case 'add_expense': {
            if (!runtime.isAuthenticated) {
                return { reply: 'Sign in first, then I can add an expense. Type Log in.', state: next };
            }
            try {
                const categories = await api.getDailyCategories('');
                const desc = intent.description.toLowerCase();
                const match =
                    categories.find((c) => desc.includes(c.name.toLowerCase().split(' ')[0])) ||
                    categories.find((c) => /food|lunch|dinner|coffee|eat/.test(desc) && /food/i.test(c.name)) ||
                    categories.find((c) => /uber|taxi|bus|fuel|transport/.test(desc) && /transport/i.test(c.name)) ||
                    categories[0];
                if (!match) return { reply: 'No expense categories found.', state: next };
                await api.addDailyExpense('', {
                    description: intent.description,
                    amount: intent.amount,
                    date: new Date().toISOString().slice(0, 10),
                    categoryId: match.id,
                    paymentMethod: 'UPI',
                });
                runtime.go('/daily-expenses');
                return { reply: `Logged ${intent.amount} for ${intent.description} under ${match.name}.`, state: next };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: next };
            }
        }
        case 'chat': {
            if (!runtime.isAuthenticated) {
                return {
                    reply: runtime.channel === 'text'
                        ? 'I can log you in, create an account, or start a trip after you sign in. Tap Log in or Create account below.'
                        : 'I can log you in, register, or take you around the site. Say help to hear commands.',
                    state: next,
                };
            }
            const looksLikeAction =
                /^(?:please\s+|also\s+)?(?:add|invite|include|create|remove|delete|update|edit|rename|change|log|record)\b/i.test(
                    intent.message.trim(),
                );
            if (looksLikeAction) {
                return {
                    reply: 'I can do that. Try: Add people named Danny, Abdul. Remove Are. Edit Manu to Manique. Add expense for food paid by Danny for everyone. Then type the amount.',
                    state: next,
                };
            }
            try {
                const res = await api.sendChatMessage(intent.message);
                return { reply: res.reply.slice(0, 600), state: next };
            } catch {
                return { reply: 'I could not reach the assistant.', state: next };
            }
        }
        default:
            return { reply: 'I did not catch that. Type help.', state: next };
    }
}

async function handleSlot(text: string, state: AgentState, runtime: AgentRuntime): Promise<{ reply: string; state: AgentState }> {
    const next = { ...state, draft: { ...state.draft } };

    if (state.mode === 'login_email') {
        const email = emailFromInput(text);
        if (!isValidEmail(email)) {
            return {
                reply: runtime.channel === 'text'
                    ? 'That is not a valid email. Type it like you@gmail.com.'
                    : `I did not catch a valid email. Say it like yourname at gmail dot com.`,
                state: next,
            };
        }
        next.draft.email = email;
        next.mode = 'login_password';
        return {
            reply: runtime.channel === 'text' ? 'Now enter your password.' : 'Now say your password.',
            state: next,
        };
    }

    if (state.mode === 'login_password') {
        try {
            const reply = await loginWith(next.draft.email, passwordFromInput(text, runtime.channel), runtime);
            return { reply, state: emptyAgentState() };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: emptyAgentState() };
        }
    }

    if (state.mode === 'register_name') {
        next.draft.name = text.trim();
        next.mode = 'register_email';
        return { reply: `Name set to ${next.draft.name}. Now type your email.`, state: next };
    }

    if (state.mode === 'register_email') {
        const email = emailFromInput(text);
        if (!isValidEmail(email)) {
            return { reply: 'That is not a valid email. Type it like you@gmail.com.', state: next };
        }
        next.draft.email = email;
        next.mode = 'register_password';
        return {
            reply: 'Now choose a password — at least 8 characters, one capital letter, and one number.',
            state: next,
        };
    }

    if (state.mode === 'register_password') {
        try {
            const password = passwordFromInput(text, runtime.channel);
            await api.register(next.draft.name, next.draft.email, password);
            const reply = await loginWith(next.draft.email, password, runtime);
            return { reply: `Account created. ${reply}`, state: emptyAgentState() };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: emptyAgentState() };
        }
    }

    if (state.mode === 'trip_name') {
        try {
            const created = await createNamedTrip(text, runtime);
            return { reply: created.reply, state: { ...next, mode: created.mode } };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
        }
    }

    if (state.mode === 'people_names') {
        const removeIntent = parseRemovePeople(text);
        if (removeIntent?.type === 'remove_people') {
            try {
                const removed = await removePeopleFromTrip(removeIntent.names, runtime, removeIntent.tripName);
                next.mode = removed.mode;
                next.draft.names = removed.names;
                return { reply: removed.reply, state: next };
            } catch (e) {
                return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
            }
        }
        const names = splitPeopleNames(text);
        if (!names.length) {
            return {
                reply: 'I could not find names in that. Try Danny, Abdul, Anu — commas or spaces both work.',
                state: next,
            };
        }
        try {
            const added = await addPeopleToTrip(names, runtime);
            next.mode = added.mode;
            next.draft.names = added.names;
            return { reply: added.reply, state: next };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
        }
    }

    if (state.mode === 'people_trip') {
        const peeled = peelTripName(/\b(to|into|in|on|for)\b/i.test(text) ? text : `to ${text}`);
        const tripName = (peeled.tripName || text).replace(/^(?:the\s+)?(?:trip\s+)?/i, '').trim();
        try {
            const added = await addPeopleToTrip(next.draft.names, runtime, tripName);
            next.mode = added.mode;
            next.draft.names = added.names;
            return { reply: added.reply, state: next };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
        }
    }

    if (state.mode === 'remove_names') {
        const parsed = parseRemovePeople(/^remove\b/i.test(text) ? text : `remove ${text}`);
        const names =
            parsed?.type === 'remove_people'
                ? parsed.names
                : text.split(/,|&|\band\b/i).map((n) => n.trim()).filter(Boolean);
        if (!names.length) {
            return { reply: 'Type the name to remove, like Are.', state: next };
        }
        try {
            const removed = await removePeopleFromTrip(names, runtime);
            next.mode = removed.mode;
            next.draft.names = removed.names;
            return { reply: removed.reply, state: next };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
        }
    }

    if (state.mode === 'remove_trip') {
        const peeled = peelTripName(/\b(to|into|in|on|for|from)\b/i.test(text) ? text : `from ${text}`);
        const tripName = (peeled.tripName || text).replace(/^(?:the\s+)?(?:trip\s+)?/i, '').trim();
        try {
            const removed = await removePeopleFromTrip(next.draft.names, runtime, tripName);
            next.mode = removed.mode;
            next.draft.names = removed.names;
            return { reply: removed.reply, state: next };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
        }
    }

    if (state.mode === 'expense_amount') {
        const amount = parseAmount(text);
        if (!amount || amount <= 0) {
            return { reply: 'Type a number, like 500.', state: next };
        }
        next.draft.expenseAmount = amount;
        try {
            const added = await addTripExpense(runtime, next.draft);
            return { reply: added.reply, state: { ...next, mode: added.mode, draft: added.draft } };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
        }
    }

    if (state.mode === 'expense_payer') {
        next.draft.expensePayer = text.trim();
        try {
            const added = await addTripExpense(runtime, next.draft);
            return { reply: added.reply, state: { ...next, mode: added.mode, draft: added.draft } };
        } catch (e) {
            return { reply: friendlyVoiceError(e), state: { ...next, mode: 'command' } };
        }
    }

    return { reply: 'Type help to see what I can do.', state: { ...next, mode: 'command' } };
}

export async function runAgentTurn(
    text: string,
    state: AgentState,
    runtime: AgentRuntime,
): Promise<{ reply: string; state: AgentState }> {
    let trimmed = text.trim();
    if (!trimmed) return { reply: 'Type something to get started.', state };
    if (!skipSpokenNorm(state.mode)) trimmed = normalizeSpokenCommand(trimmed) || trimmed;

    const finish = (result: { reply: string; state: AgentState }) => ({
        ...result,
        reply: voiceifyReply(result.reply, runtime.channel),
    });

    if (state.mode !== 'command') {
        return finish(await handleSlot(trimmed, state, runtime));
    }

    const intent = parseIntent(trimmed);
    if (!intent) {
        return finish({
            reply: runtime.isAuthenticated
                ? 'I did not catch that. Try Dashboard, Trips, Daily expenses, Bills, Activities, or Help.'
                : 'I did not catch that. Tap Log in or Create account, or type Help.',
            state,
        });
    }

    return finish(await runIntent(intent, state, runtime));
}

export function guestSuggestions() {
    return ['Log in', 'Create account', 'Help'];
}

export function signedInSuggestions() {
    return [
        'Dashboard',
        'Trips',
        'Daily expenses',
        'Bills',
        'Activities',
        'Dining',
        'Movies',
        'Play',
        'SIPs',
        'Profile',
        'New trip',
        'Add people',
        'Help',
    ];
}
