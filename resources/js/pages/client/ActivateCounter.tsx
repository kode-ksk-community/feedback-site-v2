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
import FlashMessage from '@/components/notifications/FlashMessage';
import { Toaster as HotToast } from 'react-hot-toast';

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

    const filteredCounters = useMemo(() => {
        if (!selectedBranchId) return [];
        return counters.filter(
            (c) => c.branch_id === parseInt(selectedBranchId),
        );
    }, [selectedBranchId, counters]);

    const handleBranchChange = (id: string) => {
        setSelectedBranchId(id);
        setData('counter_id', '');
        setStep(2);
    };

    const handleCounterChange = (id: string) => {
        setData('counter_id', id);
        setStep(3);
    };

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

    useEffect(() => {
        if (data.pin.length === 6) handleSubmit();
    }, [data.pin, handleSubmit]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-sans selection:bg-primary/30">
            <Head title="System Provisioning" />

            <HotToast position="bottom-right" reverseOrder={false} />
            <FlashMessage />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-10 w-full max-w-[480px]"
            >
                <Card className="overflow-hidden border-border bg-card shadow-2xl backdrop-blur-3xl">
                    {/* Animated Top Bar using Primary Color */}
                    <div className="animate-gradient-x h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />

                    <CardContent className="p-10">
                        <header className="mb-10 text-center">
                            <motion.div
                                layoutId="icon-box"
                                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10"
                            >
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </motion.div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">
                                Activate Terminal
                            </h1>
                            <p className="mt-2 text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase italic">
                                Secure Node Provisioning
                            </p>
                        </header>

                        <div className="space-y-8">
                            {/* Branch Selection */}
                            <div className="space-y-3">
                                <Label className="ml-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    Terminal Location
                                </Label>
                                <Select
                                    value={selectedBranchId}
                                    onValueChange={handleBranchChange}
                                >
                                    <SelectTrigger className="h-14 w-full border-input bg-muted/50 text-foreground focus:ring-primary/50 rounded-xl">
                                        <Landmark className="mr-3 h-4 w-4 text-primary" />
                                        <SelectValue placeholder="Identify Branch..." />
                                    </SelectTrigger>
                                    <SelectContent className="border-border bg-popover text-popover-foreground">
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
                                        <Label className="ml-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            Terminal ID
                                        </Label>
                                        <Select
                                            value={data.counter_id}
                                            onValueChange={handleCounterChange}
                                        >
                                            <SelectTrigger className="h-14 w-full border-input bg-muted/50 text-foreground focus:ring-primary/50 rounded-xl">
                                                <MonitorSmartphone className="mr-3 h-4 w-4 text-primary" />
                                                <SelectValue placeholder="Select Counter..." />
                                            </SelectTrigger>
                                            <SelectContent className="border-border bg-popover text-popover-foreground">
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
                                            <div className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
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
                                    className="space-y-6 border-t border-border pt-6"
                                >
                                    <div className="space-y-4">
                                        <Label className="block text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
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
                                                    e.target.value.replace(/\D/g, ''),
                                                )
                                            }
                                            className="h-24 border-input bg-muted/30 text-center font-mono text-5xl font-black tracking-[0.5em] text-primary shadow-inner transition-all focus:border-primary focus:ring-primary/20 rounded-2xl"
                                            placeholder="••••••"
                                        />
                                        {errors.pin && (
                                            <p className="text-center text-xs font-bold text-destructive">
                                                {errors.pin}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        disabled={processing || data.pin.length < 6}
                                        className="h-16 w-full rounded-[2rem] bg-primary text-lg font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
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
                    <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase opacity-50">
                        Authorized Access Only
                    </p>
                    <div className="font-mono text-[9px] text-muted-foreground/30 uppercase">
                        Node Hash: {btoa(navigator.userAgent).slice(0, 12)}
                    </div>
                </footer>
            </motion.div>
        </div>
    );
}