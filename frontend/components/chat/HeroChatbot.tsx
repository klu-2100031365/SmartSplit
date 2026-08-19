"use client";

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { Bot, Loader2, Mic, Minus, Send, Sparkles, User, X } from 'lucide-react';
import { AuthContext, ThemeContext } from '../../context/AppContext';
import {
    emptyAgentState,
    guestSuggestions,
    runAgentTurn,
    signedInSuggestions,
    type AgentState,
} from '../../lib/voice/agentTurn';
import { pickVoiceTranscript } from '../../lib/voice/intents';
import {
    createRecognizer,
    isSpeechRecognitionSupported,
    speak,
    stopSpeaking,
    type SpeechRecognitionLike,
} from '../../lib/voice/speech';

type ChatLine = { role: 'user' | 'assistant'; content: string; secret?: boolean };

const WELCOME =
    'Hi — I can log you in, create an account, or open the app. Speak or type the same commands. Tap Log in, Create account, or the mic.';

const SIGNED_IN_WELCOME =
    'You are signed in. Speak or type the same prompts: open Dashboard, Trips, Daily expenses, Bills, Activities, Dining, Movies, Play, SIPs, or Profile. You can also create a trip, add people, or add an expense.';

type HeroChatbotProps = {
    variant?: 'hero' | 'docked';
    onClose?: () => void;
};

export default function HeroChatbot({ variant = 'hero', onClose }: HeroChatbotProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { login, logout, isAuthenticated, user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [messages, setMessages] = useState<ChatLine[]>([
        { role: 'assistant', content: isAuthenticated ? SIGNED_IN_WELCOME : WELCOME },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false);
    const [state, setState] = useState<AgentState>(emptyAgentState);
    const [listening, setListening] = useState(false);
    const [listenOn, setListenOn] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [interim, setInterim] = useState('');
    const listRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef(state);
    const authRef = useRef({ isAuthenticated, user });
    const sendRef = useRef<(text: string, fromVoice?: boolean) => Promise<void>>(async () => {});
    const recRef = useRef<SpeechRecognitionLike | null>(null);
    const listenOnRef = useRef(false);
    const speakingRef = useRef(false);
    const voiceBufferRef = useRef('');
    const voiceTimerRef = useRef<number | null>(null);
    const queuedRef = useRef<{ text: string; fromVoice: boolean } | null>(null);
    const voiceSupported = isSpeechRecognitionSupported();

    stateRef.current = state;
    authRef.current = { isAuthenticated, user };
    listenOnRef.current = listenOn;

    useEffect(() => {
        sessionStorage.removeItem('ss-assistant-messages');
        sessionStorage.removeItem('ss-assistant-state');
    }, []);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, loading, interim]);

    const go = useCallback(
        (path: string) => {
            if (path.includes('#')) {
                const [base, hash] = path.split('#');
                if (base && base !== pathname) router.push(base);
                window.setTimeout(() => {
                    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
                }, 350);
                return;
            }
            router.push(path);
        },
        [pathname, router],
    );

    const send = useCallback(
        async (text: string, fromVoice = false) => {
            const trimmed = text.trim();
            if (!trimmed) return;
            if (loadingRef.current) {
                queuedRef.current = queuedRef.current
                    ? { text: `${queuedRef.current.text} ${trimmed}`, fromVoice: queuedRef.current.fromVoice || fromVoice }
                    : { text: trimmed, fromVoice };
                return;
            }

            const hide = stateRef.current.mode === 'login_password' || stateRef.current.mode === 'register_password';
            setMessages((prev) => [...prev, { role: 'user', content: trimmed, secret: hide }]);
            setInput('');
            setInterim('');
            loadingRef.current = true;
            setLoading(true);

            try {
                const result = await runAgentTurn(trimmed, stateRef.current, {
                    isAuthenticated: authRef.current.isAuthenticated,
                    pathname,
                    theme,
                    channel: fromVoice ? 'voice' : 'text',
                    login,
                    logout,
                    go,
                    toggleTheme,
                    user: authRef.current.user
                        ? { id: authRef.current.user.id, name: authRef.current.user.name }
                        : null,
                });
                stateRef.current = result.state;
                setState(result.state);
                setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
                if (fromVoice || listenOnRef.current) {
                    speakingRef.current = true;
                    recRef.current?.stop();
                    speak(result.reply, () => {
                        speakingRef.current = false;
                        if (listenOnRef.current) {
                            try {
                                recRef.current?.start();
                            } catch {
                                /* already started */
                            }
                        }
                    });
                }
            } catch {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Something went wrong. Please try again.' },
                ]);
            } finally {
                loadingRef.current = false;
                setLoading(false);
                const queued = queuedRef.current;
                queuedRef.current = null;
                if (queued?.text.trim()) {
                    window.setTimeout(() => {
                        void sendRef.current(queued.text, queued.fromVoice);
                    }, 40);
                }
            }
        },
        [go, login, logout, pathname, theme, toggleTheme],
    );

    sendRef.current = send;

    useEffect(() => {
        if (!voiceSupported) return;
        const rec = createRecognizer();
        if (!rec) return;
        recRef.current = rec;
        rec.onstart = () => setListening(true);
        rec.onend = () => {
            setListening(false);
            if (listenOnRef.current && !speakingRef.current) {
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
                setListenOn(false);
                listenOnRef.current = false;
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Microphone is blocked. Allow mic access, then tap the mic again.' },
                ]);
            }
        };
        rec.onresult = (event) => {
            let nextInterim = '';
            let finalText = '';
            const alts: string[] = [];
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i];
                const piece = result[0]?.transcript || '';
                if (result.isFinal) {
                    finalText += piece;
                    for (let a = 0; a < result.length; a += 1) {
                        const alt = result[a]?.transcript;
                        if (alt) alts.push(alt);
                    }
                } else nextInterim += piece;
            }
            if (nextInterim) setInterim(nextInterim);
            if (finalText) {
                const mode = stateRef.current.mode;
                const secret = mode === 'login_password' || mode === 'register_password';
                const chosen = secret ? finalText.trim() : pickVoiceTranscript(finalText, alts);
                voiceBufferRef.current = voiceBufferRef.current
                    ? `${voiceBufferRef.current} ${chosen}`
                    : chosen;
                setInterim(voiceBufferRef.current);
                if (voiceTimerRef.current) window.clearTimeout(voiceTimerRef.current);
                voiceTimerRef.current = window.setTimeout(() => {
                    const buffered = voiceBufferRef.current.trim();
                    voiceBufferRef.current = '';
                    voiceTimerRef.current = null;
                    if (buffered) void sendRef.current(buffered, true);
                }, 650);
            }
        };

        return () => {
            listenOnRef.current = false;
            rec.onresult = null;
            rec.onend = null;
            rec.onerror = null;
            if (voiceTimerRef.current) window.clearTimeout(voiceTimerRef.current);
            voiceBufferRef.current = '';
            try {
                rec.abort();
            } catch {
                /* ignore */
            }
            recRef.current = null;
            stopSpeaking();
        };
    }, [voiceSupported]);

    const toggleListen = () => {
        if (!voiceSupported) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Voice needs Chrome or Edge. You can still type here.' },
            ]);
            return;
        }
        const next = !listenOnRef.current;
        listenOnRef.current = next;
        setListenOn(next);
        if (next) {
            try {
                recRef.current?.start();
            } catch {
                /* already started */
            }
        } else {
            if (voiceTimerRef.current) {
                window.clearTimeout(voiceTimerRef.current);
                voiceTimerRef.current = null;
            }
            const buffered = voiceBufferRef.current.trim();
            voiceBufferRef.current = '';
            recRef.current?.stop();
            stopSpeaking();
            setInterim('');
            if (buffered) void sendRef.current(buffered, true);
        }
    };

    const collapse = () => {
        setMinimized(true);
        if (listenOnRef.current) {
            listenOnRef.current = false;
            setListenOn(false);
            recRef.current?.stop();
            stopSpeaking();
            setInterim('');
        }
    };

    const chips = isAuthenticated ? signedInSuggestions() : guestSuggestions();
    const placeholder =
        state.mode === 'login_email' || state.mode === 'register_email'
            ? 'you@email.com'
            : state.mode === 'login_password' || state.mode === 'register_password'
              ? 'Password'
              : state.mode === 'trip_name'
                ? 'Trip name, e.g. Ooty'
                : state.mode === 'people_names'
                  ? 'Danny, Abdul, Anu'
                  : state.mode === 'people_trip'
                  ? 'Trip name, e.g. Ooty'
                  : state.mode === 'remove_names'
                    ? 'Name to remove, e.g. Are'
                    : state.mode === 'remove_trip'
                      ? 'Trip name, e.g. Ooty'
                      : state.mode === 'expense_amount'
                        ? 'Amount, e.g. 500'
                        : state.mode === 'expense_payer'
                          ? 'Who paid, e.g. Danny'
                          : state.mode === 'register_name'
                      ? 'Your name'
                      : listenOn
                        ? 'Listening… speak or type'
                        : 'Type or tap the mic…';

    if (variant === 'docked' && minimized) {
        return (
            <button
                type="button"
                onClick={() => setMinimized(false)}
                className="pointer-events-auto fixed bottom-4 right-4 z-[180] grid h-14 w-14 place-items-center rounded-full bg-brand-green text-gray-900 shadow-lg dark:bg-[#d4ff00]"
                aria-label="Open assistant"
                title="Open assistant"
            >
                <Bot size={22} />
            </button>
        );
    }

    const shell =
        variant === 'docked'
            ? 'pointer-events-auto fixed bottom-4 right-4 z-[180] flex h-[360px] w-[min(100%-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-white/12 dark:bg-[#141414]'
            : 'flex h-[320px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-white/12 dark:bg-[#141414] sm:h-[360px] sm:rounded-3xl';

    return (
        <div className={shell}>
            <div className="flex items-center gap-2.5 border-b border-gray-100 px-3.5 py-2.5 dark:border-white/10">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand-green text-gray-900 dark:bg-[#d4ff00]">
                    <Bot size={16} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-mier text-sm font-semibold text-gray-900 dark:text-[#f2f2ed]">SmartSplit assistant</p>
                    <p className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-gray-400">
                        {listening ? 'Listening' : isAuthenticated ? `Signed in${user?.name ? ` · ${user.name.split(' ')[0]}` : ''}` : 'Talk or type to log in'}
                    </p>
                </div>
                {listening && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-green dark:bg-[#d4ff00]" />}
                {variant === 'docked' && (
                    <div className="flex items-center gap-0.5">
                        <button
                            type="button"
                            onClick={collapse}
                            className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label="Minimize assistant"
                            title="Minimize"
                        >
                            <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                collapse();
                                onClose?.();
                            }}
                            className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label="Close assistant"
                            title="Close"
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>

            <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
                {messages.map((msg, i) => (
                    <m.div
                        key={`${i}-${msg.role}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                                msg.role === 'user'
                                    ? 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/60'
                                    : 'bg-brand-green/15 text-brand-green dark:bg-[#d4ff00]/15 dark:text-[#d4ff00]'
                            }`}
                        >
                            {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
                        </div>
                        <div
                            className={`max-w-[82%] break-words rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                                msg.role === 'user'
                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                    : 'bg-gray-100 text-gray-800 dark:bg-white/8 dark:text-[#f2f2ed]'
                            }`}
                        >
                            {msg.secret ? '••••••••' : msg.content}
                        </div>
                    </m.div>
                ))}
                {interim && (
                    <p className="text-xs italic text-gray-400">Hearing: {interim}</p>
                )}
                {loading && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Loader2 size={16} className="animate-spin" />
                        Working…
                    </div>
                )}
            </div>

            <div className="shrink-0 border-t border-gray-100 px-3 py-2.5 dark:border-white/10">
                {messages.filter((m) => m.role === 'user').length === 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {chips.map((chip) => (
                        <button
                            key={chip}
                            type="button"
                            disabled={loading}
                            onClick={() => void send(chip)}
                            className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-600 transition hover:border-brand-green/40 hover:text-gray-900 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white/65 dark:hover:text-white"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
                )}
                <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void send(input);
                    }}
                >
                    <button
                        type="button"
                        onClick={toggleListen}
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${
                            listenOn
                                ? 'border-brand-green bg-brand-green text-gray-900 dark:border-[#d4ff00] dark:bg-[#d4ff00]'
                                : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white'
                        }`}
                        aria-label={listenOn ? 'Stop listening' : 'Start listening'}
                        title={listenOn ? 'Stop listening' : 'Start listening'}
                    >
                        {listenOn ? <Mic size={18} /> : <Mic size={18} />}
                    </button>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        type={state.mode === 'login_password' || state.mode === 'register_password' ? 'password' : 'text'}
                        autoComplete={state.mode === 'login_password' ? 'current-password' : 'off'}
                        placeholder={placeholder}
                        className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-green/50 dark:border-white/10 dark:bg-white/5 dark:text-[#f2f2ed] dark:placeholder:text-white/35"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-green text-gray-900 disabled:opacity-50 dark:bg-[#d4ff00]"
                        aria-label="Send"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
