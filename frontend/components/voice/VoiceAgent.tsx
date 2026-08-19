"use client";

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { AuthContext, SplashContext, ThemeContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import {
    HELP_SCRIPT,
    friendlyVoiceError,
    hasWakeWord,
    isValidEmail,
    normalizeSpokenEmail,
    normalizeSpokenSecret,
    parseIntent,
    speakableEmail,
    type VoiceIntent,
} from '../../lib/voice/intents';
import {
    createRecognizer,
    isSpeechRecognitionSupported,
    speak,
    stopSpeaking,
    type SpeechRecognitionLike,
} from '../../lib/voice/speech';

type AgentMode =
    | 'command'
    | 'login_email'
    | 'login_password'
    | 'register_name'
    | 'register_email'
    | 'register_password'
    | 'trip_name';

const LISTEN_HINT: Record<AgentMode, string> = {
    command: 'Listening — say help or log in',
    login_email: 'Say your email, like name at gmail dot com',
    login_password: 'Say your password',
    register_name: 'Say your name',
    register_email: 'Say your email',
    register_password: 'Password needs a capital letter and a number',
    trip_name: 'Say the trip name, like Ooty',
};

export default function VoiceAgent() {
    const router = useRouter();
    const pathname = usePathname();
    const { login, logout, isAuthenticated, user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { splashFinished } = useContext(SplashContext);

    const [supported] = useState(() => isSpeechRecognitionSupported());
    const [enabled, setEnabled] = useState(false);
    const [listening, setListening] = useState(false);
    const [asleep, setAsleep] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [caption, setCaption] = useState('');
    const [heard, setHeard] = useState('');
    const [needsGesture, setNeedsGesture] = useState(false);
    const [mode, setMode] = useState<AgentMode>('command');

    const recRef = useRef<SpeechRecognitionLike | null>(null);
    const enabledRef = useRef(false);
    const asleepRef = useRef(false);
    const speakingRef = useRef(false);
    const modeRef = useRef<AgentMode>('command');
    const loginDraft = useRef({ email: '', password: '', name: '' });
    const authRef = useRef({ isAuthenticated: false, user });
    const themeRef = useRef(theme);
    const pathRef = useRef(pathname);
    const onFinalRef = useRef<(transcript: string) => void>(() => {});

    enabledRef.current = enabled;
    asleepRef.current = asleep;
    speakingRef.current = speaking;
    authRef.current = { isAuthenticated, user };
    themeRef.current = theme;
    pathRef.current = pathname;

    const setAgentMode = useCallback((next: AgentMode) => {
        modeRef.current = next;
        setMode(next);
    }, []);

    const say = useCallback((text: string) => {
        setCaption(text);
        setSpeaking(true);
        speakingRef.current = true;
        recRef.current?.stop();
        speak(text, () => {
            speakingRef.current = false;
            setSpeaking(false);
            if (enabledRef.current) {
                try {
                    recRef.current?.start();
                } catch {
                    /* already started */
                }
            }
        });
    }, []);

    const go = useCallback(
        (path: string) => {
            if (path.includes('#')) {
                const [base, hash] = path.split('#');
                if (base && base !== pathRef.current) router.push(base);
                window.setTimeout(() => {
                    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
                }, 350);
                return;
            }
            router.push(path);
        },
        [router],
    );

    const runLogin = useCallback(
        async (email: string, password: string) => {
            try {
                const res = await api.login(email, password);
                login(res.user, res.token);
                loginDraft.current = { email: '', password: '', name: '' };
                setAgentMode('command');
                say(`Welcome back ${res.user.name.split(' ')[0]}. Opening your ${res.user.isAdmin ? 'admin panel' : 'dashboard'}.`);
                go(res.user.isAdmin ? '/admin' : '/dashboard');
            } catch (e) {
                say(friendlyVoiceError(e));
                setAgentMode('command');
            }
        },
        [go, login, say, setAgentMode],
    );

    const runRegister = useCallback(
        async (name: string, email: string, password: string) => {
            try {
                await api.register(name, email, password);
                say('Account created. Logging you in now.');
                await runLogin(email, password);
            } catch (e) {
                say(friendlyVoiceError(e));
                setAgentMode('command');
            }
        },
        [runLogin, say, setAgentMode],
    );

    const createNamedTrip = useCallback(
        async (rawName: string) => {
            const name = rawName.replace(/^(?:it(?:'s| is)|called|named|name is)\s+/i, '').trim();
            if (!name || /^(cancel|stop|never mind|nevermind)$/i.test(name)) {
                setAgentMode('command');
                say('Cancelled. Say new trip when you want to try again.');
                return;
            }
            if (!authRef.current.isAuthenticated) {
                say('Sign in first, then I can create a trip.');
                setAgentMode('command');
                return;
            }
            try {
                const trip = await api.createTrip('', name);
                setAgentMode('command');
                say(`Created trip ${trip.name}. Opening it.`);
                go(`/trips/${trip.id}`);
            } catch (e) {
                say(friendlyVoiceError(e));
                setAgentMode('command');
            }
        },
        [go, say, setAgentMode],
    );

    const clickByLabel = (label: string) => {
        const needle = label.toLowerCase().replace(/\s+/g, ' ').trim();
        const nodes = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const match = nodes.find((node) => {
            if (!(node instanceof HTMLElement)) return false;
            const text = `${node.innerText || ''} ${node.getAttribute('aria-label') || ''}`.replace(/\s+/g, ' ').trim().toLowerCase();
            return text === needle || text.includes(needle);
        });
        if (match instanceof HTMLElement) {
            match.click();
            return true;
        }
        return false;
    };

    const handleSlot = useCallback(
        (transcript: string) => {
            const current = modeRef.current;
            if (current === 'login_email') {
                const email = normalizeSpokenEmail(transcript);
                if (!isValidEmail(email)) {
                    say('I did not catch a valid email. Say it like yourname at gmail dot com. Use at for the at sign, and dot for dots.');
                    return;
                }
                loginDraft.current.email = email;
                setAgentMode('login_password');
                say(`Email set to ${speakableEmail(email)}. Now say your password.`);
                return;
            }
            if (current === 'login_password') {
                const password = normalizeSpokenSecret(transcript);
                loginDraft.current.password = password;
                say('Signing you in.');
                void runLogin(loginDraft.current.email, password);
                return;
            }
            if (current === 'register_name') {
                loginDraft.current.name = transcript.trim();
                setAgentMode('register_email');
                say(`Name set to ${loginDraft.current.name}. Say your email.`);
                return;
            }
            if (current === 'register_email') {
                const email = normalizeSpokenEmail(transcript);
                if (!isValidEmail(email)) {
                    say('I did not catch a valid email. Say it like yourname at gmail dot com.');
                    return;
                }
                loginDraft.current.email = email;
                setAgentMode('register_password');
                say(`Email set to ${speakableEmail(email)}. Now say a password. It needs eight characters, one capital letter, and one number.`);
                return;
            }
            if (current === 'register_password') {
                const password = normalizeSpokenSecret(transcript);
                void runRegister(loginDraft.current.name, loginDraft.current.email, password);
                return;
            }
            if (current === 'trip_name') {
                void createNamedTrip(transcript);
            }
        },
        [createNamedTrip, runLogin, runRegister, say, setAgentMode],
    );

    const runIntent = useCallback(
        async (intent: VoiceIntent) => {
            if (intent.type === 'wake') {
                asleepRef.current = false;
                setAsleep(false);
                say('I am listening.');
                return;
            }
            if (intent.type === 'sleep') {
                asleepRef.current = true;
                setAsleep(true);
                setAgentMode('command');
                say('Going to sleep. Say wake up when you need me.');
                return;
            }
            if (asleepRef.current) return;

            switch (intent.type) {
                case 'help':
                    say(HELP_SCRIPT);
                    return;
                case 'scroll': {
                    const h = window.innerHeight * 0.85;
                    if (intent.direction === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (intent.direction === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    if (intent.direction === 'down') window.scrollBy({ top: h, behavior: 'smooth' });
                    if (intent.direction === 'up') window.scrollBy({ top: -h, behavior: 'smooth' });
                    say(`Scrolling ${intent.direction}.`);
                    return;
                }
                case 'theme': {
                    if (intent.mode === 'toggle') {
                        toggleTheme();
                        say('Switching theme.');
                        return;
                    }
                    if ((intent.mode === 'dark') !== (themeRef.current === 'dark')) toggleTheme();
                    say(`${intent.mode} mode.`);
                    return;
                }
                case 'navigate':
                    say(`Opening ${intent.label}.`);
                    go(intent.path);
                    return;
                case 'login_start':
                    if (authRef.current.isAuthenticated) {
                        say('You are already signed in.');
                        return;
                    }
                    setAgentMode('login_email');
                    say('Say your email. Use at instead of the at sign, and dot for dots.');
                    return;
                case 'login_direct':
                    if (authRef.current.isAuthenticated) {
                        say('You are already signed in.');
                        return;
                    }
                    say('Signing you in.');
                    void runLogin(intent.email, intent.password);
                    return;
                case 'register_start':
                    if (authRef.current.isAuthenticated) {
                        say('You already have a session. Say log out first to register a new account.');
                        return;
                    }
                    setAgentMode('register_name');
                    say('Let us create an account. Say your name.');
                    return;
                case 'logout':
                    if (!authRef.current.isAuthenticated) {
                        say('You are not signed in.');
                        return;
                    }
                    logout();
                    say('Signed out. Opening home.');
                    go('/');
                    return;
                case 'create_trip_start': {
                    if (!authRef.current.isAuthenticated) {
                        say('Sign in first, then I can create a trip.');
                        return;
                    }
                    if (pathRef.current !== '/trips') go('/trips');
                    setAgentMode('trip_name');
                    say('What should we name the trip?');
                    return;
                }
                case 'create_trip': {
                    void createNamedTrip(intent.name);
                    return;
                }
                case 'click': {
                    if (clickByLabel(intent.label)) {
                        say(`Clicked ${intent.label}.`);
                        return;
                    }
                    say(`I could not find ${intent.label} on this page.`);
                    return;
                }
                case 'list_trips': {
                    if (!authRef.current.isAuthenticated) {
                        say('Sign in first to hear your trips.');
                        return;
                    }
                    try {
                        const trips = await api.getTrips('');
                        if (!trips.length) {
                            say('You have no trips yet. Say create a trip followed by the name.');
                            return;
                        }
                        say(`You have ${trips.length} trip${trips.length === 1 ? '' : 's'}: ${trips.map((t) => t.name).join(', ')}.`);
                    } catch {
                        say('I could not load your trips.');
                    }
                    return;
                }
                case 'stats': {
                    if (!authRef.current.isAuthenticated) {
                        say('Sign in first to hear your stats.');
                        return;
                    }
                    try {
                        const stats = await api.getUserStats('');
                        say(
                            `You have ${stats.tripCount} trips, ${stats.totalTracked} tracked, and ${stats.pendingSettlements} pending settlements.`,
                        );
                    } catch {
                        say('I could not load your stats.');
                    }
                    return;
                }
                case 'add_expense': {
                    if (!authRef.current.isAuthenticated) {
                        say('Sign in first to add an expense.');
                        return;
                    }
                    try {
                        const categories = await api.getDailyCategories('');
                        const desc = intent.description.toLowerCase();
                        const match =
                            categories.find((c) => desc.includes(c.name.toLowerCase().split(' ')[0])) ||
                            categories.find((c) => /food|lunch|dinner|coffee|eat/.test(desc) && /food/i.test(c.name)) ||
                            categories.find((c) => /uber|taxi|bus|fuel|transport/.test(desc) && /transport/i.test(c.name)) ||
                            categories[0];
                        if (!match) {
                            say('No categories found.');
                            return;
                        }
                        await api.addDailyExpense('', {
                            description: intent.description,
                            amount: intent.amount,
                            date: new Date().toISOString().slice(0, 10),
                            categoryId: match.id,
                            paymentMethod: 'UPI',
                        });
                        say(`Logged ${intent.amount} for ${intent.description} under ${match.name}. Opening daily expenses.`);
                        go('/daily-expenses');
                    } catch {
                        say('I could not add that expense.');
                    }
                    return;
                }
                case 'chat': {
                    if (!authRef.current.isAuthenticated) {
                        say('I can log you in, register, or take you around the site. Say help to hear commands.');
                        return;
                    }
                    try {
                        const res = await api.sendChatMessage(intent.message);
                        say(res.reply.slice(0, 420));
                    } catch {
                        say('I could not reach the assistant.');
                    }
                }
            }
        },
        [createNamedTrip, go, logout, runLogin, say, setAgentMode, toggleTheme],
    );

    const onFinalTranscript = useCallback(
        (transcript: string) => {
            const text = transcript.trim();
            if (!text) return;
            setHeard(text);

            if (asleepRef.current && !hasWakeWord(text) && !/^(wake up|start listening|listen)$/i.test(text)) {
                return;
            }
            if (asleepRef.current && (hasWakeWord(text) || /^(wake up|start listening|listen)$/i.test(text))) {
                asleepRef.current = false;
                setAsleep(false);
            }

            if (modeRef.current !== 'command') {
                handleSlot(text);
                return;
            }

            const intent = parseIntent(text);
            if (!intent) {
                if (hasWakeWord(text) || text.split(/\s+/).length >= 2) {
                    say('I did not catch a command. Say help to hear what I can do.');
                }
                return;
            }
            void runIntent(intent);
        },
        [handleSlot, runIntent, say],
    );

    onFinalRef.current = onFinalTranscript;

    const startListening = useCallback(() => {
        const rec = recRef.current;
        if (!rec) return;
        enabledRef.current = true;
        setEnabled(true);
        try {
            rec.start();
            setNeedsGesture(false);
        } catch {
            /* already started */
        }
    }, []);

    useEffect(() => {
        if (!supported || !splashFinished) return;
        const rec = createRecognizer();
        if (!rec) return;
        recRef.current = rec;

        rec.onstart = () => setListening(true);
        rec.onend = () => {
            setListening(false);
            if (enabledRef.current && !speakingRef.current) {
                window.setTimeout(() => {
                    try {
                        rec.start();
                    } catch {
                        /* ignore */
                    }
                }, 180);
            }
        };
        rec.onerror = (event) => {
            if (event.error === 'not-allowed') {
                setNeedsGesture(true);
                setEnabled(false);
                enabledRef.current = false;
                setCaption('Microphone blocked. Allow mic, then tap the orb once.');
            }
        };
        rec.onresult = (event) => {
            let interim = '';
            let finalText = '';
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const piece = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalText += piece;
                else interim += piece;
            }
            if (interim) setHeard(interim);
            if (finalText) onFinalRef.current(finalText);
        };

        enabledRef.current = true;
        setEnabled(true);
        try {
            rec.start();
            setNeedsGesture(false);
            setCaption('Hands-free is on. Say help, or say log in.');
        } catch {
            setNeedsGesture(true);
            setCaption('Tap the orb once to start hands-free listening.');
        }

        return () => {
            enabledRef.current = false;
            rec.onresult = null;
            rec.onend = null;
            rec.onerror = null;
            try {
                rec.abort();
            } catch {
                /* ignore */
            }
            recRef.current = null;
            stopSpeaking();
        };
    }, [splashFinished, supported]);

    if (!splashFinished) return null;

    if (!supported) {
        return (
            <div className="fixed bottom-4 right-4 z-[180] max-w-[16rem] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 shadow-xl dark:border-white/10 dark:bg-[#141414] dark:text-white/60">
                Voice control needs Chrome, Edge, or Safari with speech recognition.
            </div>
        );
    }

    const hideSecret = mode === 'login_password' || mode === 'register_password';
    const status = speaking ? 'Speaking' : asleep ? 'Sleeping' : listening ? 'Listening' : needsGesture ? 'Tap to start' : 'Standby';

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[180] flex flex-col items-end gap-3 p-4 sm:p-5">
            <AnimatePresence>
                {(caption || heard) && (
                    <m.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="pointer-events-none max-w-[min(100%,22rem)] rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#141414]/95"
                    >
                        {heard && (
                            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                You: {hideSecret ? '••••••' : heard}
                            </p>
                        )}
                        {caption && (
                            <p className="leading-relaxed text-gray-800 dark:text-[#f2f2ed]">
                                <Volume2 className="mr-1.5 inline h-3.5 w-3.5 text-brand-green dark:text-[#d4ff00]" />
                                {caption}
                            </p>
                        )}
                    </m.div>
                )}
            </AnimatePresence>

            <button
                type="button"
                onClick={() => {
                    setAsleep(false);
                    asleepRef.current = false;
                    startListening();
                    if (needsGesture) say('Hands-free is on. I am listening.');
                }}
                className="pointer-events-auto relative grid h-16 w-16 place-items-center rounded-full bg-brand-green text-gray-900 shadow-[0_12px_0_0_rgba(15,23,42,0.12),0_18px_40px_-12px_rgba(0,0,0,0.45)] dark:bg-[#d4ff00]"
                aria-label={status}
            >
                {(listening || speaking) && !asleep && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-green/40 dark:bg-[#d4ff00]/30" />
                )}
                {asleep || needsGesture ? <MicOff className="relative h-7 w-7" /> : <Mic className="relative h-7 w-7" />}
            </button>
            <p className="pointer-events-none max-w-[11rem] text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-white/40">
                {status}
                {mode !== 'command' ? ` · ${LISTEN_HINT[mode]}` : ''}
            </p>
        </div>
    );
}
