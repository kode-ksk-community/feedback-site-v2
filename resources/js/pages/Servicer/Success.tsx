import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { route } from 'ziggy-js';

export default function Success() {
    const [countdown, setCountdown] = useState(5);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Redirect when countdown hits 0
    useEffect(() => {
        if (countdown === 0) {
            router.visit(route('dashboard.index'));
        }
    }, [countdown]);

    return (
        <div className="relative min-h-screen bg-background flex items-center justify-center p-6 overflow-hidden transition-colors duration-500">
            <Head title="Access Granted" />

            {/* --- Dynamic Background Layers --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] opacity-20 dark:opacity-40" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-30 mix-blend-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="relative z-10 max-w-2xl w-full text-center"
            >
                {/* --- Animated Icon Section --- */}
                <div className="relative mx-auto w-32 h-32 mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                        className="absolute inset-0 bg-primary rounded-full shadow-[0_0_60px_rgba(var(--primary),0.4)]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-16 h-16 text-primary-foreground"
                        >
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.6, delay: 0.3, ease: "easeInOut" }}
                                d="M20 6L9 17L4 12"
                            />
                        </motion.svg>
                    </div>
                </div>

                {/* --- Text Content --- */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h1 className="text-5xl sm:text-7xl font-black text-foreground mb-6 tracking-tighter italic uppercase">
                        Terminal Active
                    </h1>
                    
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full mb-10 shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                            Session Locked to Counter
                        </span>
                    </div>

                    <p className="text-muted-foreground text-xl max-w-md mx-auto leading-relaxed mb-12 font-medium">
                        Success! You are now assigned to this kiosk. 
                        <span className="text-foreground font-bold block mt-2 border-t border-border pt-4">
                            Customer feedback loop is live.
                        </span>
                    </p>
                </motion.div>

                {/* --- Footer / Action Status --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-8"
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="h-full bg-primary" 
                            />
                        </div>
                        <p className="text-muted-foreground font-mono text-xs font-bold uppercase tracking-[0.3em]">
                            Tab closing in <span className="text-primary">{countdown}s</span>
                        </p>
                    </div>

                    <button 
                        onClick={() => window.close()}
                        className="group flex items-center gap-2 mx-auto text-muted-foreground hover:text-foreground transition-all pt-4"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                            Close Manually
                        </span>
                    </button>
                </motion.div>
            </motion.div>

            {/* --- Decorative Accents --- */}
            <div className="absolute bottom-10 left-10 flex gap-4 opacity-10 dark:opacity-20 pointer-events-none">
                <div className="w-1 h-12 bg-primary rounded-full" />
                <div className="w-1 h-8 bg-primary rounded-full mt-4" />
                <div className="w-1 h-16 bg-primary rounded-full -mt-4" />
            </div>
        </div>
    );
}