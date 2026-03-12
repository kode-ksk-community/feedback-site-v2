import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Loader2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { differenceInSeconds, formatDistanceToNow } from 'date-fns';

interface Props {
    auth: { user: { name: string } };
    counterUser: {
        created_at: string;
        counter?: { name: string };
    };
}

export default function CounterDashboard({ auth, counterUser }: Props) {
    // Optimization: Store 'now' as seconds to reduce re-render frequency from 60fps to 1fps
    const [secondsNow, setSecondsNow] = useState(Math.floor(Date.now() / 1000));
    const [showConfirm, setShowConfirm] = useState(false);
    const { post, processing } = useForm();

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsNow(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Memoize the start date object to prevent repeated parsing
    const startDate = useMemo(() => new Date(counterUser.created_at), [counterUser.created_at]);

    const duration = useMemo(() => {
        const diff = differenceInSeconds(new Date(secondsNow * 1000), startDate);
        
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;

        return {
            time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
            relative: formatDistanceToNow(startDate, { addSuffix: true })
        };
    }, [secondsNow, startDate]);

    const handleLogout = () => {
        post(route('servicer.logout')); // Ensure this matches your route name
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary/30">
            <Head title={`Active: ${counterUser?.counter?.name ?? 'Station'}`} />
            
            {/* Ambient Background matching your Login page */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay contrast-150" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full max-w-md z-10"
            >
                {/* Secure Status Badge */}
                <div className="flex justify-center mb-8">
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-6 py-2.5 rounded-full backdrop-blur-xl shadow-inner"
                    >
                        <ShieldCheck className="w-4 h-4 mr-2.5 animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                            Terminal: {counterUser?.counter?.name ?? 'N/A'}
                        </span>
                    </motion.div>
                </div>

                <Card className="border-border bg-card/40 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden border-t-primary/20">
                    {/* Visual Pulse Header */}
                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                    
                    <CardContent className="p-12 text-center">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 2, -2, 0] 
                            }}
                            transition={{ repeat: Infinity, duration: 8 }}
                            className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary text-primary-foreground shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)]"
                        >
                            <Clock className="h-10 w-10" />
                        </motion.div>

                        <div className="space-y-4 mb-12">
                            <Label className="text-muted-foreground text-[10px] uppercase tracking-[0.5em] font-black opacity-60">
                                Active Session
                            </Label>
                            <h2 className="text-7xl font-mono font-black tracking-tight text-foreground tabular-nums drop-shadow-sm">
                                {duration.time}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-muted-foreground/60 text-xs font-medium italic">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Started {duration.relative}
                            </div>
                        </div>

                        <Button
                            variant="destructive"
                            size="lg"
                            className="w-full h-18 text-lg font-black rounded-2xl shadow-xl uppercase tracking-[0.15em] group transition-all active:scale-[0.97]"
                            onClick={() => setShowConfirm(true)}
                        >
                            <LogOut className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            Close Station
                        </Button>
                    </CardContent>
                </Card>

                {/* Secure Footer Info */}
                <div className="text-center mt-10">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
                        Agent: {auth.user.name}
                    </p>
                </div>
            </motion.div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-2xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-card border border-border p-10 rounded-[2.5rem] max-w-sm w-full shadow-3xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="p-4 bg-destructive/10 rounded-3xl mb-6">
                                    <AlertTriangle className="h-10 w-10 text-destructive" />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground mb-4">
                                    Terminate Session?
                                </h3>
                                <p className="text-muted-foreground mb-10 text-sm leading-relaxed">
                                    You are about to close <span className="text-foreground font-bold">{counterUser?.counter?.name}</span>. 
                                    This action is final and will be logged in the system.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button 
                                    variant="destructive" 
                                    className="h-14 rounded-2xl font-black uppercase tracking-widest order-2 sm:order-1"
                                    onClick={handleLogout}
                                    disabled={processing}
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : "Confirm Logout"}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="h-14 rounded-2xl font-bold text-muted-foreground hover:text-foreground order-1 sm:order-2"
                                    onClick={() => setShowConfirm(false)}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <label className={cn("block text-sm font-medium leading-none", className)}>{children}</label>;
}