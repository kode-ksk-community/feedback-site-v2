import { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ShieldCheck,
    Landmark,
    MonitorSmartphone,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';

interface Props {
    branches: { id: number; name: string }[];
    counters: { id: number; name: string; branch_id: number }[];
}

export default function ActivateCounter({ branches, counters }: Props) {
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm({
        counter_id: '',
        pin: '',
    });

    // Performance: Filter counters locally to avoid server round-trips
    const filteredCounters = useMemo(() => {
        if (!selectedBranchId) return [];
        return counters.filter(
            (c) => c.branch_id === parseInt(selectedBranchId),
        );
    }, [selectedBranchId, counters]);

    // Navigation Handlers
    const handleBranchChange = (id: string) => {
        setSelectedBranchId(id);
        setData('counter_id', '');
        setStep(2);
    };

    const handleCounterChange = (id: string) => {
        setData('counter_id', id);
        setStep(3);
    };

    // Secure Submit Logic
    const handleSubmit = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();
            if (data.pin.length === 6 && !processing) {
                post(route('client.verify-pin'), {
                    onFinish: () => reset('pin'),
                    preserveState: true,
                });
            }
        },
        [data, processing, post, reset],
    );

    // Latency Optimization: Auto-submit on 6th digit
    useEffect(() => {
        if (data.pin.length === 6) handleSubmit();
    }, [data.pin, handleSubmit]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] p-6 font-sans selection:bg-blue-500/30">
            <Head title="System Provisioning" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-10 w-full max-w-[480px]"
            >
                <Card className="overflow-hidden border-slate-800/50 bg-slate-900/40 shadow-[0_0_50px_-12px_rgba(30,58,138,0.5)] backdrop-blur-3xl">
                    <div className="animate-gradient-x h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />

                    <CardContent className="p-10">
                        <header className="mb-10 text-center">
                            <motion.div
                                layoutId="icon-box"
                                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/10"
                            >
                                <ShieldCheck className="h-8 w-8 text-blue-500" />
                            </motion.div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Activate Terminal
                            </h1>
                            <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                Secure Node Provisioning
                            </p>
                        </header>

                        <div className="space-y-8">
                            {/* Branch Selection */}
                            <div className="space-y-3">
                                <Label className="ml-1 text-[10px] font-bold text-slate-400 uppercase">
                                    Terminal Location
                                </Label>
                                <Select
                                    value={selectedBranchId}
                                    onValueChange={handleBranchChange}
                                >
                                    <SelectTrigger className="h-14 border-slate-800 bg-slate-950/50 text-white focus:ring-blue-500/50">
                                        <Landmark className="mr-3 h-4 w-4 text-blue-500" />
                                        <SelectValue placeholder="Identify Branch..." />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-800 bg-slate-900 text-white">
                                        {branches.map((b) => (
                                            <SelectItem
                                                key={b.id}
                                                value={b.id.toString()}
                                            >
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Counter Selection */}
                            <AnimatePresence>
                                {step >= 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-3"
                                    >
                                        <Label className="ml-1 text-[10px] font-bold text-slate-400 uppercase">
                                            Terminal ID
                                        </Label>
                                        <Select
                                            value={data.counter_id}
                                            onValueChange={handleCounterChange}
                                        >
                                            <SelectTrigger className="h-14 border-slate-800 bg-slate-950/50 text-white focus:ring-indigo-500/50">
                                                <MonitorSmartphone className="mr-3 h-4 w-4 text-indigo-500" />
                                                <SelectValue placeholder="Select Counter..." />
                                            </SelectTrigger>
                                            <SelectContent className="border-slate-800 bg-slate-900 text-white">
                                                {filteredCounters.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.id.toString()}
                                                    >
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.counter_id && (
                                            <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-400">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.counter_id}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* PIN Entry */}
                            {step === 3 && (
                                <motion.form
                                    onSubmit={handleSubmit}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6 border-t border-slate-800/50 pt-6"
                                >
                                    <div className="space-y-4">
                                        <Label className="block text-center text-[10px] font-bold text-slate-400 uppercase">
                                            Authorization PIN
                                        </Label>
                                        <Input
                                            type="password"
                                            inputMode="numeric"
                                            autoFocus
                                            maxLength={6}
                                            value={data.pin}
                                            onChange={(e) =>
                                                setData(
                                                    'pin',
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                                )
                                            }
                                            className="h-20 border-slate-800 bg-black/40 text-center font-mono text-4xl tracking-[0.5em] text-blue-500 shadow-inner transition-all focus:border-blue-500"
                                            placeholder="••••••"
                                        />
                                        {errors.pin && (
                                            <p className="text-center text-xs font-medium text-red-400">
                                                {errors.pin}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        disabled={
                                            processing || data.pin.length < 6
                                        }
                                        className="h-16 w-full rounded-xl bg-blue-600 text-lg font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-500 active:scale-95"
                                    >
                                        {processing ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            'Establish Secure Link'
                                        )}
                                    </Button>
                                </motion.form>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <footer className="mt-8 space-y-2 text-center">
                    <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                        Authorized Access Only
                    </p>
                    <div className="font-mono text-[9px] text-slate-800">
                        HASH: {btoa(navigator.userAgent).slice(0, 16)}
                    </div>
                </footer>
            </motion.div>
        </div>
    );
}
