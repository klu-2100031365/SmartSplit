export type SpeechRecognitionLike = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
};

export type SpeechRecognitionEventLike = {
    resultIndex: number;
    results: ArrayLike<{
        isFinal: boolean;
        length: number;
        0: { transcript: string };
        [index: number]: { transcript: string };
    }>;
};

export function isSpeechRecognitionSupported() {
    if (typeof window === 'undefined') return false;
    const w = window as Window & {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function createRecognizer(): SpeechRecognitionLike | null {
    if (typeof window === 'undefined') return null;
    const w = window as Window & {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';
    rec.maxAlternatives = 5;
    return rec;
}

export function speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        onEnd?.();
        return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.02;
    utter.pitch = 1;
    utter.lang = 'en-IN';
    utter.onend = () => onEnd?.();
    utter.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
    if (typeof window === 'undefined') return;
    window.speechSynthesis?.cancel();
}
