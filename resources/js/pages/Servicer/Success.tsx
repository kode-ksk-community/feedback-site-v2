import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Check, ShieldCheck, XCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Success() {
    const [countdown, setCountdown] = useState(5);

    // ✅ Auto-close or Redirect logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        // Optional: window.close() often only works if the script opened the tab.
        // Usually, in a Kiosk, we redirect back to a "Status" page or stay here.
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
            <Head title="Access Granted" />

            {/* --- Dynamic Background Layers --- */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
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
                        className="absolute inset-0 bg-emerald-500 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.4)]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-16 h-16 text-white"
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
                    <h1 className="text-6xl font-black text-white mb-6 tracking-tighter">
                        TERMINAL ACTIVE
                    </h1>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-10">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">
                            Session Locked to Counter
                        </span>
                    </div>

                    <p className="text-slate-400 text-xl max-w-md mx-auto leading-relaxed mb-12">
                        Success! You are now assigned to this kiosk. 
                        <span className="text-white font-medium block mt-2">
                            Customer feedback loop is now live.
                        </span>
                    </p>
                </motion.div>

                {/* --- Footer / Action Status --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-6"
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="h-full bg-emerald-500" 
                            />
                        </div>
                        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
                            Tab closing in {countdown}s
                        </p>
                    </div>

                    <button 
                        onClick={() => window.close()}
                        className="group flex items-center gap-2 mx-auto text-slate-400 hover:text-white transition-colors pt-4"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold uppercase tracking-widest">Close Manually</span>
                    </button>
                </motion.div>
            </motion.div>

            {/* --- Corner Decorative Accents --- */}
            <div className="absolute bottom-10 left-10 flex gap-4 opacity-20">
                <div className="w-1 h-12 bg-emerald-500 rounded-full" />
                <div className="w-1 h-8 bg-emerald-500 rounded-full mt-4" />
                <div className="w-1 h-16 bg-emerald-500 rounded-full -mt-4" />
            </div>
        </div>
    );
}