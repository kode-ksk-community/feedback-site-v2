import { useState, useEffect, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Counter {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
    counters: Counter[];
}

interface Props {
    branches: Branch[];
}

export default function TerminalActivation({ branches }: Props) {
    const [isSuccess, setIsSuccess] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        branch: '',
        counter: '',
        pin: '',
    });

    // Dynamically find counters for the selected branch
    const availableCounters = useMemo(() => {
        const selectedBranch = branches.find(b => String(b.id) === data.branch);
        return selectedBranch ? selectedBranch.counters : [];
    }, [data.branch, branches]);

    const isFormValid = data.branch && data.counter && data.pin.length === 6;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        post(route('terminal.lock'), {
            onStart: () => {
                toast.loading('Securing Terminal...', { id: 'lock-toast' });
            },
            onSuccess: () => {
                toast.success('Hardware Lock Engaged', { id: 'lock-toast' });
                setIsSuccess(true);
            },
            onError: () => {
                toast.error('Authentication Failed', { id: 'lock-toast' });
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Head title="Terminal Activation" />
            <Toaster position="top-center" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[460px]">
                <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.div key="form" exit={{ opacity: 0, x: -20 }}>
                                <CardHeader className="text-center pb-2">
                                    <div className="flex items-center justify-center gap-2 text-3xl font-black tracking-tighter text-slate-900">
                                        <Monitor className="w-8 h-8 text-blue-600" />
                                        NEXUS
                                    </div>
                                    <CardDescription className="font-bold uppercase tracking-widest text-slate-400 text-[10px]">
                                        Secure Registration
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6 pt-6">
                                    <div className="flex gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
                                        <p className="text-[11px] leading-tight text-blue-700 font-medium">
                                            This browser will be locked to the selected counter. Generated URLs will only be valid on this hardware ID.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-slate-500 ml-1">Location</Label>
                                            <Select onValueChange={(v) => { setData(d => ({ ...d, branch: v, counter: '' })) }}>
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="Select branch..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {branches.map(branch => (
                                                        <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-slate-500 ml-1">Counter</Label>
                                            <Select 
                                                disabled={!data.branch} 
                                                value={data.counter}
                                                onValueChange={(v) => setData('counter', v)}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                                    <SelectValue placeholder={data.branch ? "Select counter..." : "Select branch first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableCounters.map(counter => (
                                                        <SelectItem key={counter.id} value={String(counter.id)}>{counter.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-slate-500 ml-1">Admin PIN</Label>
                                            <Input
                                                type="password"
                                                maxLength={6}
                                                placeholder="••••••"
                                                className="text-center text-2xl tracking-[12px] h-12 rounded-xl border-slate-200"
                                                value={data.pin}
                                                onChange={(e) => setData('pin', e.target.value.replace(/\D/g, ''))}
                                            />
                                            {errors.pin && <p className="text-xs text-red-500 font-bold mt-1">{errors.pin}</p>}
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-lg font-bold transition-all shadow-lg shadow-slate-200"
                                            disabled={!isFormValid || processing}
                                        >
                                            {processing ? <Loader2 className="animate-spin" /> : 'Lock Device Now'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </motion.div>
                        ) : (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center space-y-6">
                                <div className="p-4 bg-emerald-50 w-fit mx-auto rounded-full">
                                    <ShieldCheck className="w-20 h-20 text-emerald-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-3xl font-black text-slate-900">SECURED</CardTitle>
                                    <p className="text-slate-500 font-medium">Terminal successfully locked.</p>
                                </div>
                                <p className="text-xs text-slate-400 animate-pulse font-bold uppercase tracking-widest">
                                    Initialising Idle Interface...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}