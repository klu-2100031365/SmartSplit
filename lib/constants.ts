import { Plane, Utensils, Film, Gamepad2, PiggyBank, TrendingUp, Car, Home, Pizza, Coffee, HelpCircle, ShoppingBag, Wallet } from 'lucide-react';
import { Currency } from '../types';

export const CURRENCIES: Record<Currency, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: '.د.إ'
};

export const TRIP_ICONS = {
    plane: Plane,
    utensils: Utensils,
    film: Film,
    gamepad: Gamepad2,
    piggy: PiggyBank,
    trending: TrendingUp,
    wallet: Wallet
};

export const CATEGORY_STYLES: Record<string, { icon: React.ElementType, bg: string, color: string }> = {
    Food: { icon: Pizza, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
    Travel: { icon: Car, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    Rent: { icon: Home, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
    Entertainment: { icon: Film, bg: 'bg-pink-100 dark:bg-pink-900/30', color: 'text-pink-600 dark:text-pink-400' },
    Shopping: { icon: ShoppingBag, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
    Others: { icon: HelpCircle, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' },
    Payment: { icon: Coffee, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' }
};
export const getCategoryStyles = (category: string) => {
    return CATEGORY_STYLES[category] || CATEGORY_STYLES['Others'];
};
