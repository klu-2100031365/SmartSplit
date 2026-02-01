"use client";

import React, { useState } from 'react';
import Modal from '../ui/Modal';

const CalculatorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [display, setDisplay] = useState('0');
    const [prev, setPrev] = useState<string | null>(null);
    const [op, setOp] = useState<string | null>(null);

    const handleNum = (num: string) => {
        setDisplay(display === '0' ? num : display + num);
    };

    const handleOp = (operator: string) => {
        setPrev(display);
        setOp(operator);
        setDisplay('0');
    };

    const calculate = () => {
        if (!prev || !op) return;
        const current = parseFloat(display);
        const previous = parseFloat(prev);
        let result = 0;
        switch (op) {
            case '+': result = previous + current; break;
            case '-': result = previous - current; break;
            case '*': result = previous * current; break;
            case '/': result = previous / current; break;
        }
        setDisplay(result.toString());
        setOp(null);
        setPrev(null);
    };

    const clear = () => {
        setDisplay('0');
        setPrev(null);
        setOp(null);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Calculator">
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-2xl mb-4 text-right">
                <div className="text-xs text-gray-500 min-h-[1.2rem]">{prev} {op}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white truncate">{display}</div>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
                    <button
                        key={btn}
                        onClick={() => {
                            if (btn === 'C') clear();
                            else if (btn === '=') calculate();
                            else if (['+', '-', '*', '/'].includes(btn)) handleOp(btn);
                            else handleNum(btn);
                        }}
                        className={`p-4 rounded-xl text-xl font-bold transition-all active:scale-95 ${btn === '=' ? 'bg-brand-blue text-white col-span-1' :
                            btn === 'C' ? 'bg-brand-orange/10 text-brand-orange' :
                                ['+', '-', '*', '/'].includes(btn) ? 'bg-gray-200 dark:bg-gray-700 text-brand-blue' :
                                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                            }`}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </Modal>
    );
};

export default CalculatorModal;
