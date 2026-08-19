"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import PageTransition from "../motion/PageTransition";
import HeroChatbot from "../chat/HeroChatbot";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [assistantClosed, setAssistantClosed] = useState(false);

    return (
        <>
            {!isHome && (
                <Navbar
                    showAssistantButton={assistantClosed}
                    onOpenAssistant={() => setAssistantClosed(false)}
                />
            )}
            <main className={isHome ? "min-h-screen pt-0" : "min-h-screen pt-[3.75rem]"}>
                <PageTransition>{children}</PageTransition>
            </main>
            {!isHome && !assistantClosed && (
                <HeroChatbot variant="docked" onClose={() => setAssistantClosed(true)} />
            )}
        </>
    );
}
