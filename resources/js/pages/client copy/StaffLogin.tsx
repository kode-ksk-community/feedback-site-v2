import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Contact, 
    Monitor, 
    User, 
    Lock, 
    Loader2, 
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Shadcn UI Components
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

export default function StaffLogin() {
    const [isLogged, setIsLogged] = useState(false);

    // Inertia Form Helper for performance and security
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        password: '',
        counter_id: 'Counter 02', // Mocked from URL context in a real app
    });

    const isFormValid = data.employee_id.trim().length > 0 && data.password.length >= 4;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        // Simulate Authentication & WebSocket Trigger to the Terminal
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Authenticating...',
                success: () => {
                    setIsLogged(true);
                    return 'Counter Activated!';
                },
                error: 'Invalid Credentials',
            }
        );

        // Actual Inertia Post Implementation
        // post(route('staff.auth'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 transition-colors duration-300">
            <Head title="Staff Login - Nexus Enterprise" />
            <Toaster position="top-center" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/60 shadow-2xl rounded-3xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!isLogged ? (
                            <motion.div
                                key="login-form"
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className="flex justify-center mb-2">
                                        <div className="p-3 bg-primary/5 rounded-2xl">
                                            <Contact className="w-8 h-8 text-blue-600" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-extrabold tracking-tight">NEXUS</CardTitle>
                                    <CardDescription>Employee Portal Authentication</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6 pt-4">
                                    {/* Context Badge */}
                                    <Badge variant="secondary" className="w-full justify-center py-2.5 rounded-xl text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-800 gap-2">
                                        <Monitor className="w-4 h-4" />
                                        Checking into: <span className="font-bold">{data.counter_id}</span>
                                    </Badge>

                                    <form onSubmit={handleLogin} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="employee_id">Employee Name or ID</Label>
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="employee_id"
                                                    className="pl-10 h-12 rounded-xl"
                                                    placeholder="e.g. Alex D."
                                                    value={data.employee_id}
                                                    onChange={e => setData('employee_id', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="password">Password</Label>
                                                <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">Forgot?</button>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    className="pl-10 h-12 rounded-xl"
                                                    placeholder="••••••••"
                                                    value={data.password}
                                                    onChange={e => setData('password', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full h-12 rounded-xl font-bold transition-all active:scale-[0.98]"
                                            disabled={!isFormValid || processing}
                                        >
                                            {processing ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                "Sign In & Activate Counter"
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-state"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-10 text-center space-y-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                                    className="flex justify-center"
                                >
                                    <div className="p-4 bg-emerald-500/10 rounded-full">
                                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                    </div>
                                </motion.div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold tracking-tight">Login Successful</h3>
                                    <p className="text-muted-foreground">
                                        You are now assigned to <span className="text-foreground font-bold">{data.counter_id}</span>.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                                    <p className="text-sm font-semibold text-primary leading-relaxed">
                                        The customer terminal is waking up.<br />
                                        You may now close this page.
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
                                    <ShieldCheck className="w-4 h-4" />
                                    Secure Hardware Link Established
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}