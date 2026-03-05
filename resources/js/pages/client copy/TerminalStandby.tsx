import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Monitor, 
    // Broadcast, 
    CheckCircle2, 
    UserCheck,
    ArrowRight
} from 'lucide-react';

// Shadcn UI Imports
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

export default function TerminalStandby() {
    const [agent, setAgent] = useState<{ name: string } | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Simulation: Handle WebSocket/Real-time event
    const simulateStaffScan = () => {
        if (agent || isRedirecting) return;
        
        // Step 1: Set Agent (Triggers Success Overlay)
        setAgent({ name: "Alex D." });

        // Step 2: Auto-redirect simulation
        setTimeout(() => {
            setIsRedirecting(true);
            console.log("Navigating to Customer Feedback...");
            // router.visit(route('customer.feedback'));
        }, 3000);
    };

    return (
        <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden select-none">
            <Head title="Terminal Standby - Nexus Enterprise" />

            {/* Kiosk Header */}
            <header className="h-20 flex items-center justify-between px-10 bg-card border-b border-border shadow-sm z-50">
                <div className="flex items-center gap-3 text-2xl font-extrabold tracking-tighter text-primary">
                    <Monitor className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    NEXUS
                </div>

                <div className="flex items-center gap-5">
                    <code className="px-3 py-1.5 bg-muted rounded-md text-sm text-muted-foreground font-mono">
                        NX-884-XJ9
                    </code>
                    
                    <AnimatePresence mode="wait">
                        {!agent ? (
                            <motion.div
                                key="awaiting"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <Badge variant="outline" className="h-10 px-4 gap-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                    </span>
                                    Awaiting Agent Login
                                </Badge>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Badge variant="outline" className="h-10 px-4 gap-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Active: {agent.name}
                                </Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Main Standby Content */}
            <main className="flex-1 flex items-center justify-center p-10 relative">
                <Card className="w-full max-w-lg overflow-hidden border-border/40 shadow-2xl relative">
                    <CardContent className="p-10 text-center relative z-10">
                        <AnimatePresence mode="wait">
                            {!agent ? (
                                <motion.div
                                    key="qr-view"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h1 className="text-5xl font-black tracking-tighter text-primary mb-1">Counter 02</h1>
                                        <p className="text-xl text-muted-foreground">Terminal Secured & Ready</p>
                                    </div>

                                    {/* QR Container */}
                                    <motion.div 
                                        whileHover={{ scale: 1.02 }}
                                        className="inline-block p-6 bg-white rounded-3xl border-2 border-dashed border-muted-foreground/30 shadow-inner"
                                    >
                                        <img 
                                            src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=STAFF_LOGIN_URL" 
                                            alt="Staff Login QR"
                                            className="w-56 h-56"
                                        />
                                    </motion.div>

                                    <div className="space-y-4">
                                        <p className="text-lg text-muted-foreground leading-snug">
                                            Please scan this code using your <br />
                                            <strong className="text-foreground">Employee App</strong> to begin.
                                        </p>
                                        
                                        <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
                                            {/* < className="w-5 h-5 animate-pulse" /> */}
                                            <span>Listening for scan...</span>
                                        </div>
                                    </div>

                                    {/* Temporary Mock Navigation */}
                                    <Button asChild variant="ghost" className="mt-4 text-muted-foreground">
                                        <Link href="/customer-feedback" className="gap-2">
                                            View Customer UI <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success-view"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-10 space-y-6"
                                >
                                    <div className="flex justify-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12 }}
                                            className="p-5 bg-emerald-500 rounded-full text-white"
                                        >
                                            <UserCheck className="w-16 h-16" />
                                        </motion.div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold">Agent Verified</h2>
                                        <p className="text-xl text-muted-foreground">Welcome back, {agent.name}</p>
                                    </div>

                                    <div className="flex items-center justify-center gap-3 text-muted-foreground italic">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                        Loading environment...
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    {/* Background Decorative Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
                </Card>
            </main>

            {/* Dev Simulator Tool */}
            {!agent && (
                <button 
                    onClick={simulateStaffScan}
                    className="fixed bottom-6 right-6 px-4 py-2 bg-slate-900 text-white text-xs rounded-full opacity-20 hover:opacity-100 transition-opacity z-[100]"
                >
                    Simulate WebSocket: STAFF_SCAN
                </button>
            )}
        </div>
    );
}