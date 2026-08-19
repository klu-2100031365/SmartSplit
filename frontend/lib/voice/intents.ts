export type VoiceIntent =
    | { type: 'help' }
    | { type: 'sleep' }
    | { type: 'wake' }
    | { type: 'scroll'; direction: 'up' | 'down' | 'top' | 'bottom' }
    | { type: 'theme'; mode: 'dark' | 'light' | 'toggle' }
    | { type: 'navigate'; path: string; label: string }
    | { type: 'login_start' }
    | { type: 'login_direct'; email: string; password: string }
    | { type: 'register_start' }
    | { type: 'logout' }
    | { type: 'create_trip'; name: string }
    | { type: 'create_trip_start' }
    | { type: 'click'; label: string }
    | { type: 'open_tab'; tab: 'expenses' | 'settlements' | 'analytics' }
    | { type: 'list_trips' }
    | { type: 'stats' }
    | { type: 'add_expense'; amount: number; description: string }
    | { type: 'add_trip_expense'; description: string; amount?: number; paidBy?: string; splitEveryone: boolean; splitNames?: string[] }
    | { type: 'add_people'; names: string[]; tripName?: string }
    | { type: 'add_people_start' }
    | { type: 'remove_people'; names: string[]; tripName?: string }
    | { type: 'remove_people_start' }
    | { type: 'rename_person'; from: string; to: string }
    | { type: 'chat'; message: string };

const WAKE = /^(?:hey |ok |okay )?(?:smart\s*split|smartsplit)[,.]?\s*/i;

export function stripWakeWord(raw: string) {
    return raw.replace(WAKE, '').trim();
}

export function hasWakeWord(raw: string) {
    return WAKE.test(raw.trim());
}

const ONES: Record<string, number> = {
    zero: 0,
    oh: 0,
    nil: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
};

const TENS: Record<string, number> = {
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
};

const SCALES: Record<string, number> = {
    hundred: 100,
    thousand: 1000,
    lakh: 100000,
    lakhs: 100000,
    million: 1000000,
    crore: 10000000,
};

function numberAtom(raw: string): { kind: 'ones' | 'tens' | 'scale'; value: number } | 'and' | 'a' | null {
    const word = raw.toLowerCase().replace(/[,.!?]+$/g, '');
    if (!word) return null;
    if (word === 'and') return 'and';
    if (word === 'a' || word === 'an') return 'a';
    if (word.includes('-')) {
        const bits = word.split('-').filter(Boolean);
        if (bits.length === 2 && ONES[bits[1]] != null && TENS[bits[0]] != null) {
            return { kind: 'ones', value: TENS[bits[0]] + ONES[bits[1]] };
        }
    }
    if (ONES[word] != null) return { kind: 'ones', value: ONES[word] };
    if (TENS[word] != null) return { kind: 'tens', value: TENS[word] };
    if (SCALES[word] != null) return { kind: 'scale', value: SCALES[word] };
    return null;
}

function consumeNumberPhrase(words: string[], start: number): { count: number; value: number } | null {
    let i = start;
    let total = 0;
    let current = 0;
    let started = false;

    while (i < words.length) {
        const atom = numberAtom(words[i]);
        if (!atom) break;
        if (atom === 'and') {
            if (!started) break;
            i += 1;
            continue;
        }
        if (atom === 'a') {
            const next = i + 1 < words.length ? numberAtom(words[i + 1]) : null;
            if (!started && next && next !== 'and' && next !== 'a' && next.kind === 'scale') {
                current = 1;
                started = true;
                i += 1;
                continue;
            }
            break;
        }
        if (atom.kind === 'scale') {
            if (!started) current = 1;
            current *= atom.value;
            if (atom.value >= 1000) {
                total += current;
                current = 0;
            }
            started = true;
            i += 1;
            continue;
        }
        current += atom.value;
        started = true;
        i += 1;
    }

    if (!started) return null;
    return { count: i - start, value: total + current };
}

export function replaceSpokenNumbers(text: string): string {
    const words = text.split(/\s+/).filter(Boolean);
    const out: string[] = [];
    let i = 0;
    while (i < words.length) {
        const taken = consumeNumberPhrase(words, i);
        if (taken && taken.count > 0) {
            const singleSmall = taken.count === 1 && taken.value < 10;
            const nextWord = words[i + taken.count]?.toLowerCase().replace(/[,.!?]+$/g, '') || '';
            const amountHint = /^(rupees?|rs|inr|dollars?|bucks|for|on|of|amount)$/i.test(nextWord);
            const prevWord = out[out.length - 1]?.toLowerCase() || '';
            const afterAmountVerb = /^(expense|spend(?:ing)?|amount|of|rupees?|rs)$/i.test(prevWord);
            if (!singleSmall || amountHint || afterAmountVerb || taken.value >= 10) {
                out.push(String(taken.value));
                i += taken.count;
                continue;
            }
        }
        out.push(words[i]);
        i += 1;
    }
    return out.join(' ');
}

export function parseAmount(raw: string): number | null {
    const digits = raw.match(/(\d+(?:\.\d+)?)/);
    if (digits) {
        const n = Number(digits[1]);
        if (Number.isFinite(n) && n > 0) return n;
    }
    const taken = consumeNumberPhrase(raw.toLowerCase().split(/\s+/).filter(Boolean), 0);
    if (taken && taken.value > 0) return taken.value;
    return null;
}

export function normalizeSpokenCommand(raw: string): string {
    let s = stripWakeWord(raw).trim();
    if (!s) return '';

    s = s.replace(/\b(um+|uh+|ah+|er+|hmm+|huh)\b/gi, ' ');
    s = s.replace(/\bcomma\b/gi, ',');
    s = s.replace(/\b(?:full stop|period)\b/gi, ' ');
    s = s.replace(/\b(?:question mark|exclamation mark)\b/gi, ' ');
    s = s.replace(/\bpaid bye\b/gi, 'paid by');
    s = s.replace(/\bpayed by\b/gi, 'paid by');
    s = s.replace(/\bknew trip\b/gi, 'new trip');
    s = s.replace(/\bclick on knew\b/gi, 'click on new');
    s = s.replace(/\badd expense four\b/gi, 'add expense for');
    s = s.replace(/\bexpense four\b/gi, 'expense for');
    s = s.replace(/\bfour (everyone|everybody|all)\b/gi, 'for $1');
    s = s.replace(/\b(edit|rename|change|update)\s+(.+?)\s+two\s+(.+)$/i, '$1 $2 to $3');
    s = s.replace(/\bopen (?:the )?(an+l?ytics?|analitics|analtics|anaytics)\b/gi, 'open analytics');
    s = s.replace(/\bdash board\b/gi, 'dashboard');
    s = s.replace(/\bdaily expenses?\b/gi, 'daily expenses');
    s = replaceSpokenNumbers(s);
    s = s.replace(/[.]{2,}/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
}

export function pickVoiceTranscript(primary: string, alternatives: string[] = []): string {
    const seen = new Set<string>();
    const cands: string[] = [];
    for (const item of [primary, ...alternatives]) {
        const t = item.trim();
        if (!t) continue;
        const key = t.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        cands.push(t);
    }
    if (!cands.length) return primary.trim();

    let best = cands[0];
    let bestScore = -1;
    for (const candidate of cands) {
        const intent = parseIntent(normalizeSpokenCommand(candidate));
        let score = 0;
        if (!intent) score = 0;
        else if (intent.type === 'chat') score = 1;
        else score = 8;
        if (score > bestScore || (score === bestScore && score >= 8 && candidate.length > best.length)) {
            bestScore = score;
            best = candidate;
        }
    }
    return best;
}

const KNOWN_DOMAINS = ['gmail', 'yahoo', 'outlook', 'hotmail', 'icloud', 'protonmail', 'rediffmail', 'live'];

export function normalizeSpokenEmail(raw: string) {
    let s = raw.toLowerCase().trim();
    s = s.replace(/[,'"]/g, ' ');
    s = s.replace(/^(?:my\s+)?(?:e-?mail|mail)(?:\s+id|\s+address)?(?:\s+is)?\s+/i, '');

    s = s.replace(/\bat\s*the\s*rate(?:\s*of)?\b/g, ' @ ');
    s = s.replace(/\battherate\b/g, ' @ ');
    s = s.replace(/\bat\s+(?:symbol|sign|mark)\b/g, ' @ ');
    s = s.replace(/\s+at\s+/g, ' @ ');
    s = s.replace(/^at\s+/, '@ ');

    s = s.replace(/\s+(?:dot|period|point)\s+/g, '.');
    s = s.replace(/\s+underscore\s+/g, '_');
    s = s.replace(/\s+(?:dash|hyphen|minus)\s+/g, '-');

    for (const domain of KNOWN_DOMAINS) {
        const re = new RegExp(`\\b${domain}\\s*(?:\\.|dot\\s*)?com\\b`, 'g');
        s = s.replace(re, `${domain}.com`);
    }

    s = s.replace(/\s+/g, '');
    s = s.replace(/([a-z0-9._+-]+)(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|protonmail\.com|rediffmail\.com|live\.com)/, '$1@$2');

    for (const domain of KNOWN_DOMAINS) {
        if (s.endsWith(`@${domain}`)) s += '.com';
    }

    return s;
}

export function isValidEmail(email: string) {
    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

export function speakableEmail(email: string) {
    return email.replace('@', ' at ').replace(/\./g, ' dot ');
}

export function normalizeSpokenSecret(raw: string) {
    let s = raw.trim();
    s = s.replace(/\bat\s*the\s*rate(?:\s*of)?\b/gi, '@');
    s = s.replace(/\battherate\b/gi, '@');
    s = s.replace(/\s+at\s+/gi, '@');
    s = s.replace(/\s+(?:dot|period|point)\s+/gi, '.');
    s = s.replace(/\s+underscore\s+/gi, '_');
    s = s.replace(/\s+(?:dash|hyphen|minus)\s+/gi, '-');
    s = s.replace(/\s+/g, '');
    return s;
}

export function friendlyVoiceError(err: unknown) {
    const body =
        err && typeof err === 'object' && 'body' in err
            ? (err as { body?: { detail?: unknown } }).body
            : undefined;
    const detail = body?.detail;
    const message = err instanceof Error ? err.message : '';

    if (Array.isArray(detail)) {
        const emailIssue = detail.find(
            (item) => item && typeof item === 'object' && Array.isArray((item as { loc?: unknown }).loc) && (item as { loc: unknown[] }).loc.includes('email'),
        );
        if (emailIssue) {
            return 'That did not sound like a valid email. Please say it like yourname at gmail dot com.';
        }
        const firstMsg = detail[0] && typeof detail[0] === 'object' ? (detail[0] as { msg?: string }).msg : null;
        if (typeof firstMsg === 'string' && /email/i.test(firstMsg)) {
            return 'That did not sound like a valid email. Please say it like yourname at gmail dot com.';
        }
        return 'Please try that again, a little slower.';
    }

    if (typeof detail === 'string') {
        if (/invalid email or password/i.test(detail)) {
            return 'Email or password is wrong. Say log in to try again.';
        }
        if (/already exists/i.test(detail)) {
            return 'That email already has an account. Say log in instead.';
        }
        return detail;
    }

    if (message && !message.trim().startsWith('[') && !message.includes('"loc"')) {
        if (/invalid email or password/i.test(message)) {
            return 'Email or password is wrong. Say log in to try again.';
        }
        return message;
    }

    return 'That did not work. Please try again.';
}

const ROUTES: { test: RegExp; path: string; label: string }[] = [
    { test: /\b(home|landing|start page)\b/, path: '/', label: 'home' },
    { test: /\b(dashboard|overview)\b/, path: '/dashboard', label: 'dashboard' },
    { test: /\b(daily expenses?|daily spend|spending|personal spend)\b/, path: '/daily-expenses', label: 'daily expenses' },
    { test: /\b(bills?|subscriptions?|rent)\b/, path: '/bills', label: 'bills' },
    { test: /\bdining\b/, path: '/activities/dining', label: 'dining' },
    { test: /\bmovies?\b/, path: '/activities/movies', label: 'movies' },
    { test: /\bplay\b/, path: '/activities/play', label: 'play' },
    { test: /\bactivit(y|ies)|nights? out|outings?\b/, path: '/activities', label: 'activities' },
    { test: /^(?:go to |open |take me to |show (?:me )?|navigate to )?(?:my )?trips$/, path: '/trips', label: 'trips' },
    { test: /\bprofile|account\b/, path: '/profile', label: 'profile' },
    { test: /\bsips?|investments?\b/, path: '/sips', label: 'SIPs' },
    { test: /\bregister|sign up|create account\b/, path: '/register', label: 'register' },
    { test: /\blogin page|sign in page\b/, path: '/login', label: 'login' },
    { test: /\badmin\b/, path: '/admin', label: 'admin' },
    { test: /\bfeatures?\b/, path: '/#features', label: 'features' },
    { test: /\bhow it works\b/, path: '/#how-it-works', label: 'how it works' },
];

function compactWord(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function wordDistance(a: string, b: string) {
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

function fuzzyWord(query: string, target: string) {
    const q = compactWord(query);
    const t = compactWord(target);
    if (!q || !t) return false;
    if (q === t || t.startsWith(q) || q.startsWith(t)) return true;
    const allowed = Math.min(q.length, t.length) <= 5 ? 1 : 2;
    return wordDistance(q, t) <= allowed;
}

const OPEN_DESTINATIONS: { names: string[]; intent: VoiceIntent }[] = [
    {
        names: ['analytics', 'analytic', 'anlytics', 'analitics', 'analtics', 'anaytics', 'charts', 'chart'],
        intent: { type: 'open_tab', tab: 'analytics' },
    },
    { names: ['settlements', 'settlement', 'settle'], intent: { type: 'open_tab', tab: 'settlements' } },
    { names: ['expenses', 'expense', 'expences'], intent: { type: 'open_tab', tab: 'expenses' } },
    { names: ['people', 'participants', 'members'], intent: { type: 'click', label: 'people' } },
    { names: ['dashboard', 'overview', 'dashbord'], intent: { type: 'navigate', path: '/dashboard', label: 'dashboard' } },
    { names: ['trips', 'trip'], intent: { type: 'navigate', path: '/trips', label: 'trips' } },
    { names: ['bills', 'bill', 'subscriptions'], intent: { type: 'navigate', path: '/bills', label: 'bills' } },
    { names: ['profile', 'account'], intent: { type: 'navigate', path: '/profile', label: 'profile' } },
    { names: ['sips', 'sip', 'investments'], intent: { type: 'navigate', path: '/sips', label: 'SIPs' } },
    { names: ['activities', 'activity'], intent: { type: 'navigate', path: '/activities', label: 'activities' } },
    { names: ['dining', 'dinner', 'restaurants'], intent: { type: 'navigate', path: '/activities/dining', label: 'dining' } },
    { names: ['movies', 'movie', 'films'], intent: { type: 'navigate', path: '/activities/movies', label: 'movies' } },
    { names: ['play', 'games'], intent: { type: 'navigate', path: '/activities/play', label: 'play' } },
    { names: ['daily expenses', 'daily expense', 'spending'], intent: { type: 'navigate', path: '/daily-expenses', label: 'daily expenses' } },
];

const OPEN_LEAD =
    /^(please\s+|can you\s+|could you\s+)?(?:open|go(?:t)?\s+to|goto|show(?: me)?|take me to|navigate to|switch(?: to)?|see)\s+/i;

export function parseTripTab(raw: string): Extract<VoiceIntent, { type: 'open_tab' }> | null {
    const text = stripWakeWord(raw).toLowerCase().replace(/[?!.]+$/g, '').trim();
    if (!text) return null;

    const wantsTab =
        OPEN_LEAD.test(text) ||
        /\b(tab|page|section)\b/.test(text) ||
        /^(expenses|settlements?|analytics|an+l?ytics?)$/.test(text);

    if (!wantsTab) return null;

    if (/\bsettlements?\b/.test(text) || /\bsettle\b/.test(text)) {
        return { type: 'open_tab', tab: 'settlements' };
    }
    if (/an+l?yt/i.test(text) || /\banalyt/i.test(text) || /\bcharts?\b/.test(text)) {
        return { type: 'open_tab', tab: 'analytics' };
    }
    if (/\bexpenses?\b/.test(text) || /\bexpences\b/.test(text)) {
        return { type: 'open_tab', tab: 'expenses' };
    }
    return null;
}

export function parseOpenTarget(raw: string): VoiceIntent | null {
    const tab = parseTripTab(raw);
    if (tab) return tab;

    let text = stripWakeWord(raw).toLowerCase().replace(/[?!.]+$/g, '').trim();
    text = text.replace(/^(please\s+|can you\s+|could you\s+)/, '');
    const hadOpen = OPEN_LEAD.test(text);
    text = text.replace(OPEN_LEAD, '');
    text = text.replace(/^(the\s+|my\s+)/, '');
    text = text.replace(/\s+(tab|page|section|screen)$/, '');
    if (!text) return null;
    if (!hadOpen && text.split(/\s+/).length > 2) return null;

    if (/an+l?yt/i.test(text) || /analyt/i.test(text)) {
        return { type: 'open_tab', tab: 'analytics' };
    }

    for (const dest of OPEN_DESTINATIONS) {
        if (dest.names.some((name) => fuzzyWord(text, name) || text.includes(name))) return dest.intent;
    }
    return null;
}

const NAME_FILLER = new Set([
    'the',
    'an',
    'please',
    'pls',
    'plz',
    'can',
    'you',
    'ya',
    'u',
    'i',
    'im',
    "i'm",
    'we',
    'us',
    'me',
    'my',
    'our',
    'want',
    'wanna',
    'need',
    'like',
    'would',
    'could',
    'should',
    'to',
    'for',
    'in',
    'on',
    'of',
    'at',
    'into',
    'onto',
    'with',
    'this',
    'that',
    'these',
    'those',
    'them',
    'they',
    'also',
    'just',
    'now',
    'here',
    'there',
    'add',
    'adding',
    'added',
    'invite',
    'inviting',
    'include',
    'including',
    'put',
    'putting',
    'remove',
    'removed',
    'removing',
    'delete',
    'deleted',
    'deleting',
    'kick',
    'drop',
    'join',
    'joining',
    'append',
    'insert',
    'people',
    'ppl',
    'peeps',
    'persons',
    'person',
    'folks',
    'guys',
    'mates',
    'members',
    'member',
    'participants',
    'participant',
    'friends',
    'friend',
    'names',
    'name',
    'named',
    'called',
    'calling',
    'list',
    'following',
    'below',
    'trip',
    'trips',
    'group',
    'and',
    'or',
    'as',
    'well',
    'too',
    'is',
    'are',
    'be',
    'do',
    'does',
    'hey',
    'hi',
    'hello',
    'ok',
    'okay',
    'assistant',
    'bot',
    'smartsplit',
]);

function normalizeNameKey(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function isFillerWord(word: string) {
    return NAME_FILLER.has(word.toLowerCase().replace(/[^a-z']/g, ''));
}

function looksLikeNameToken(word: string) {
    return /^[a-zA-Z][a-zA-Z.'-]{0,23}$/.test(word.trim());
}

export function peelTripName(text: string): { rest: string; tripName?: string } {
    const patterns = [
        /\s+(?:to|into|in|on|for)\s+(?:the\s+)?(?:trip\s+)?(?:called\s+|named\s+)?(.+?)\s*$/i,
        /\s+(?:to|into|in|on)\s+(?:my\s+|the\s+)?(.+?)\s+trip\s*$/i,
        /^(?:in|on|for)\s+(?:the\s+)?(?:trip\s+)?(.+?)\s+(?:add|invite|include|put)\b/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (!match?.[1]) continue;
        let name = match[1].replace(/[.?!]+$/g, '').trim();
        name = name.replace(/^(the|my|our)\s+/i, '').replace(/\s+trip$/i, '').trim();
        if (!name || isFillerWord(name)) continue;
        const rest =
            match.index === 0
                ? text.slice(match[0].length).trim()
                : text.slice(0, match.index).trim();
        return { rest, tripName: name };
    }
    return { rest: text };
}

export function splitPeopleNames(raw: string): string[] {
    const { rest } = peelTripName(stripWakeWord(raw).trim());
    const blob = rest
        .replace(/[;|/]+/g, ',')
        .replace(/\s+&\s+/g, ',')
        .replace(/\band\b/gi, ',')
        .replace(/[“”"']/g, ' ')
        .replace(/[:\-]+/g, ' ')
        .trim();

    if (!blob) return [];

    const hasComma = blob.includes(',');
    const chunks = hasComma ? blob.split(',').map((part) => part.trim()).filter(Boolean) : [blob];
    const names: string[] = [];

    for (const chunk of chunks) {
        const words = chunk.split(/\s+/).filter(Boolean);
        if (hasComma) {
            const kept = words.filter((word) => !isFillerWord(word) || (words.length === 1 && word.length <= 2));
            const name = kept.join(' ').trim();
            if (
                name &&
                looksLikeNameToken(name.split(/\s+/)[0]) &&
                (!isFillerWord(name) || name.length <= 2)
            ) {
                names.push(name);
            }
        } else {
            for (const word of words) {
                if (word.length < 2) continue;
                if (!isFillerWord(word) && looksLikeNameToken(word)) names.push(word);
            }
        }
    }

    const seen = new Set<string>();
    return names.filter((name) => {
        const key = normalizeNameKey(name);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function isBlockedPeopleCommand(text: string) {
    return (
        /\b(expense|spend(?:ing)?|rupees?|\brs\b|\bsip\b)\b/i.test(text) ||
        /\b(?:create|start|new|make)\s+(?:a\s+)?trip\b/i.test(text) ||
        /^(?:add|create)\s+(?:a\s+)?trip\b/i.test(text)
    );
}

function looksLikeAddPeople(text: string) {
    if (isBlockedPeopleCommand(text)) return false;
    if (/\b(remove|delete|kick|drop|uninvite)\b/i.test(text)) return false;
    const lower = text.toLowerCase();
    if (
        /\b(add|invite|include|put|append|insert)\b/.test(lower) &&
        /\b(people|ppl|peeps|members?|participants?|friends|folks|guys|names?|persons?)\b/.test(lower)
    ) {
        return true;
    }
    if (/\b(add|invite|include|put)\b/.test(lower) && (/[,]|(\band\b)/.test(lower) || splitPeopleNames(text).length >= 2)) {
        return true;
    }
    if (/\bnames?\s+(?:are|is)\s+[a-z]/i.test(lower)) return true;
    if (/^(?:people|members?|names?|ppl)\s*[:\-]/i.test(lower)) return true;
    if (/\b(these|those|following)\s+(people|names|members|guys|friends)\b/i.test(lower)) return true;
    if (/\badd\s+(?:them|these|those)\b/i.test(lower) && splitPeopleNames(text).length >= 2) return true;
    const commaBits = text.split(',').map((part) => part.trim()).filter(Boolean);
    if (
        commaBits.length >= 3 &&
        commaBits.every((part) => looksLikeNameToken(part.split(/\s+/)[0] || '')) &&
        splitPeopleNames(text).length >= 3
    ) {
        return true;
    }
    return false;
}

export function parseAddPeople(raw: string): Extract<VoiceIntent, { type: 'add_people' | 'add_people_start' }> | null {
    const text = stripWakeWord(raw).trim();
    if (!text || isBlockedPeopleCommand(text)) return null;
    if (!looksLikeAddPeople(text)) return null;

    const peeled = peelTripName(text);
    const names = splitPeopleNames(peeled.rest);
    if (!names.length) return { type: 'add_people_start' };
    return peeled.tripName ? { type: 'add_people', names, tripName: peeled.tripName } : { type: 'add_people', names };
}

const REMOVE_LEAD =
    /^(?:also|and|then|please|pls|plz|ok|okay|can you|could you|would you|i want to|i need to|kindly)\s+/i;
const REMOVE_VERB_START = /^(?:remove|delete|kick|drop|uninvite|take off|get rid of)\s+/i;
const REMOVE_FROM_TAIL =
    /\s+(?:from|off)\s+(?:the\s+)?(?:this\s+)?(?:people\s+|members?\s+|participants?\s+)?(?:list|trip|group).*$/i;

export function parseRemovePeople(raw: string): Extract<VoiceIntent, { type: 'remove_people' | 'remove_people_start' }> | null {
    let text = stripWakeWord(raw).trim();
    if (!text || !/\b(remove|delete|kick|drop|uninvite)\b/i.test(text)) return null;
    if (/\b(expense|spend(?:ing)?)\b/i.test(text)) return null;

    for (let i = 0; i < 4; i += 1) {
        const next = text.replace(REMOVE_LEAD, '');
        if (next === text) break;
        text = next.trim();
    }

    const peeled = peelTripName(text);
    let rest = peeled.rest.replace(REMOVE_FROM_TAIL, '').trim();
    const afterVerb = rest.match(/\b(?:remove|delete|kick|drop|uninvite)\s+(.+)$/i);
    rest = (afterVerb?.[1] || rest.replace(REMOVE_VERB_START, '')).trim();

    rest = rest.replace(
        /^(?:the\s+)?(?:name|names|person|people|members?|participants?|friend)\s*(?:named|called|:)?\s*/i,
        '',
    );
    rest = rest.replace(REMOVE_FROM_TAIL, '').trim();

    const names = rest
        .split(/,|&|\band\b/i)
        .map((part) => part.trim().replace(/^["']+|["']+$/g, ''))
        .filter(Boolean)
        .filter((part) => !/^(the|please|pls|named|called|people|person|members?|list)$/i.test(part));

    if (!names.length) return { type: 'remove_people_start' };
    return peeled.tripName
        ? { type: 'remove_people', names, tripName: peeled.tripName }
        : { type: 'remove_people', names };
}

export function parseRenamePerson(raw: string): Extract<VoiceIntent, { type: 'rename_person' }> | null {
    let text = stripWakeWord(raw).trim();
    if (!text) return null;
    if (!/\b(edit|rename|change|update)\b/i.test(text)) return null;
    if (/\b(expense|password|email|trip)\b/i.test(text) && !/\b(name|person|member|people)\b/i.test(text)) {
        if (/\bexpense\b/i.test(text)) return null;
    }

    for (let i = 0; i < 4; i += 1) {
        const next = text.replace(REMOVE_LEAD, '');
        if (next === text) break;
        text = next.trim();
    }

    const match = text.match(
        /^(?:please\s+)?(?:edit|rename|change|update)\s+(?:the\s+)?(?:name\s+(?:of\s+)?)?(?:person\s+|member\s+|participant\s+)?(.+?)\s+(?:to|two|2)\s+(.+)$/i,
    ) || text.match(
        /^(?:change|edit|rename)\s+(.+?)(?:'s name)?\s+(?:as|into)\s+(.+)$/i,
    );
    if (!match?.[1] || !match[2]) return null;

    const from = match[1].replace(/^(?:the\s+)?(?:name\s+)?/i, '').trim();
    const to = match[2].replace(/[.?!]+$/g, '').trim();
    if (!from || !to || /\b(expense|trip)\b/i.test(from)) return null;
    return { type: 'rename_person', from, to };
}

export function parseTripExpense(raw: string): Extract<VoiceIntent, { type: 'add_trip_expense' }> | null {
    const text = stripWakeWord(raw).trim();
    if (!text) return null;
    if (/\b(people|members?|participants?)\b/i.test(text) && !/\bexpense\b/i.test(text)) return null;

    const isTripShaped =
        /\b(paid by|paid bye|payed by|split (?:among|between|with)|for everyone|for everybody|for all)\b/i.test(text) ||
        (/\bexpense\b/i.test(text) && /\b(everyone|everybody|paid)\b/i.test(text));
    if (!isTripShaped) return null;
    if (!/\b(add|log|record|create|expense|paid)\b/i.test(text)) return null;

    const amount = parseAmount(text) ?? undefined;

    const paidBy =
        text.match(/\bpaid bye?\s+([a-z][a-z.'-]{0,23})/i)?.[1] ||
        text.match(/\bpayed by\s+([a-z][a-z.'-]{0,23})/i)?.[1] ||
        text.match(/\b([a-z][a-z.'-]{0,23})\s+paid\b/i)?.[1];

    const splitEveryone = /\b(everyone|everybody|all|the group|the people)\b/i.test(text);

    let rest = text
        .replace(/^(?:please\s+|also\s+|can you\s+)?(?:add|log|record|create)\s+(?:an?\s+)?(?:expense|spend(?:ing)?)?\s*/i, '')
        .replace(/\bpaid by\s+[a-z][a-z.'-]{0,23}/gi, ' ')
        .replace(/\b[a-z][a-z.'-]{0,23}\s+paid\b/gi, ' ')
        .replace(/\bfor everyone\b/gi, ' ')
        .replace(/\bfor everybody\b/gi, ' ')
        .replace(/\bsplit (?:among|between|with|equally)?\b/gi, ' ')
        .replace(/\b(?:rupees?|rs|inr|dollars?)\b/gi, ' ')
        .replace(/\d+(?:\.\d+)?/g, ' ')
        .replace(/\b(everyone|everybody|expense|spend(?:ing)?)\b/gi, ' ')
        .replace(/^(?:for|on|of)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();

    const description = rest || 'expense';

    return {
        type: 'add_trip_expense',
        description,
        amount,
        paidBy,
        splitEveryone: splitEveryone || !text.match(/\bsplit (?:among|between|with)\s+/i),
    };
}

export function parseIntent(raw: string): VoiceIntent | null {
    const text = stripWakeWord(raw).trim().toLowerCase().replace(/[?!.]+$/g, '');
    if (!text) return null;

    if (/^(help|what can you do|commands?|what do i say)$/.test(text) || text.includes('what can you do')) {
        return { type: 'help' };
    }

    const tripTab = parseTripTab(raw);
    if (tripTab) return tripTab;

    const openedEarly = parseOpenTarget(raw);
    if (openedEarly && (OPEN_LEAD.test(text) || openedEarly.type === 'open_tab')) {
        return openedEarly;
    }
    if (/^(go to sleep|stop listening|that's all|thats all|quiet|silence)$/.test(text) || /\b(stop listening|go to sleep)\b/.test(text)) {
        return { type: 'sleep' };
    }
    if (/^(wake up|start listening|listen|i'm back|im back)$/.test(text)) {
        return { type: 'wake' };
    }

    if (/\bscroll to top|top of (the )?page\b/.test(text)) return { type: 'scroll', direction: 'top' };
    if (/\bscroll to bottom|bottom of (the )?page\b/.test(text)) return { type: 'scroll', direction: 'bottom' };
    if (/\bscroll down|page down\b/.test(text)) return { type: 'scroll', direction: 'down' };
    if (/\bscroll up|page up\b/.test(text)) return { type: 'scroll', direction: 'up' };

    if (/\bdark mode\b/.test(text)) return { type: 'theme', mode: 'dark' };
    if (/\blight mode\b/.test(text)) return { type: 'theme', mode: 'light' };
    if (/\b(toggle|switch) (the )?theme\b/.test(text)) return { type: 'theme', mode: 'toggle' };

    if (/\b(log out|logout|sign out)\b/.test(text)) return { type: 'logout' };

    const directLogin = raw.match(
        /(?:log(?:\s*me)?\s*in|sign(?:\s*me)?\s*in)(?:\s+with)?(?:\s+email)?\s+(.+?)\s+password\s+(.+)/i,
    );
    if (directLogin) {
        const email = normalizeSpokenEmail(directLogin[1]);
        if (!isValidEmail(email)) {
            return { type: 'login_start' };
        }
        return {
            type: 'login_direct',
            email,
            password: normalizeSpokenSecret(directLogin[2]),
        };
    }
    if (/^(log(?:\s*me)?\s*in|sign(?:\s*me)?\s*in)$/.test(text) || /^(log in|sign in|login)$/.test(text)) {
        return { type: 'login_start' };
    }
    if (/\b(log(?:\s*me)?\s*in|sign(?:\s*me)?\s*in)\b/.test(text) && !/\bpassword\b/.test(text)) {
        return { type: 'login_start' };
    }

    if (/^(register|sign up|create (an )?account)$/.test(text)) {
        return { type: 'register_start' };
    }

    const clickCmd = text.match(/^(?:click|press|tap|hit)(?:\s+on)?(?:\s+the)?\s+(.+)$/);
    if (clickCmd?.[1] && /(?:new|create|add)\s+trip/.test(clickCmd[1])) {
        return { type: 'create_trip_start' };
    }
    if (clickCmd?.[1]) {
        return { type: 'click', label: clickCmd[1].replace(/^(?:the|a|an)\s+/, '').trim() };
    }

    if (/^(?:new trip|add (?:a )?trip|create (?:a )?trip|start (?:a )?trip)$/.test(text)) {
        return { type: 'create_trip_start' };
    }

    const createTrip = text.match(
        /(?:create|start|new|make|add)\s+(?:a\s+)?trip(?:\s+(?:called|named|for|to))?\s+(.+)/,
    );
    if (createTrip?.[1] && !/^(?:called|named|for|to)$/.test(createTrip[1].trim())) {
        return { type: 'create_trip', name: createTrip[1].replace(/\.$/, '').trim() };
    }

    const removePeople = parseRemovePeople(raw);
    if (removePeople) return removePeople;

    const renamePerson = parseRenamePerson(raw);
    if (renamePerson) return renamePerson;

    const addPeople = parseAddPeople(raw);
    if (addPeople) return addPeople;

    const tripExpense = parseTripExpense(raw);
    if (tripExpense) return tripExpense;

    if (/\b(list|show|read)\b.*\btrips?\b/.test(text) || /^(my trips|what trips)$/.test(text)) {
        return { type: 'list_trips' };
    }

    if (
        /^(stats|my stats|my summary|dashboard summary)$/.test(text) ||
        (/\b(how much|pending count|trip count|dashboard summary|my summary)\b/.test(text) &&
            !/\b(open|go(?:t)?\s+to|goto|tab)\b/.test(text))
    ) {
        return { type: 'stats' };
    }

    const expense = text.match(
        /(?:add|log|record|create)?\s*(?:an?\s+)?(?:expense|spend(?:ing)?)\s+(?:of\s+)?(\d+(?:\.\d+)?)(?:\s*(?:rupees?|rs|inr|dollars?))?\s*(?:for|on|at)?\s*(.+)?/,
    );
    if (expense?.[1]) {
        return {
            type: 'add_expense',
            amount: Number(expense[1]),
            description: (expense[2] || 'expense').trim(),
        };
    }
    if (/\b(add|log|record)\b/.test(text) && /\b(expense|spend(?:ing)?)\b/.test(text)) {
        const amount = parseAmount(raw) ?? parseAmount(text);
        if (amount) {
            const description = text
                .replace(/\b(add|log|record|create)\b/g, ' ')
                .replace(/\b(an?\s+)?(expense|spend(?:ing)?)\b/g, ' ')
                .replace(/\b(rupees?|rs|inr|dollars?)\b/g, ' ')
                .replace(/\d+(?:\.\d+)?/g, ' ')
                .replace(/\b(of|for|on|at)\b/g, ' ')
                .replace(/\s+/g, ' ')
                .trim() || 'expense';
            return { type: 'add_expense', amount, description };
        }
    }

    if (/^(go to|open|take me to|show me|navigate to)\b/.test(text) || ROUTES.some((r) => r.test.test(text))) {
        const opened = parseOpenTarget(raw);
        if (opened) return opened;
        const match = ROUTES.find((r) => r.test.test(text));
        if (match) return { type: 'navigate', path: match.path, label: match.label };
    }

    const opened = parseOpenTarget(raw);
    if (opened) return opened;

    if (/^(?:please\s+|also\s+)?(?:add|invite|include|create|remove|delete|update|edit|rename|change|log|record)\b/.test(text)) {
        return { type: 'chat', message: stripWakeWord(raw).trim() };
    }

    if (text.split(/\s+/).length >= 3) {
        return { type: 'chat', message: stripWakeWord(raw).trim() };
    }

    return null;
}

export const HELP_SCRIPT =
    'I can open dashboard, trips, daily expenses, bills, activities, dining, movies, play, SIPs, and profile. You can also create a trip, add people by name, add an expense, list trips, or check stats.';
