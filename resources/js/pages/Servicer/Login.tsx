import { useForm, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Building2, Loader2, ArrowRightCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
    counter: { id: number; name: string };
    counterName: string;
}

export default function ServicerLogin({ counter, counterName }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        counter_id: counter.id,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/servicer/login');
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            <Head title="Staff Authentication" />
            
            {/* Dynamic Background Glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-40 brightness-50 mix-blend-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                {/* Status Badge */}
                <div className="flex justify-center mb-6">
                    <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary px-5 py-2 rounded-full backdrop-blur-md shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                        SECURE TERMINAL ACCESS
                    </Badge>
                </div>

                <Card className="border-border bg-card/60 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
                    {/* Brand Accent Line */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
                    
                    <div className="p-8 pb-4 text-center">
                        <motion.div 
                            whileHover={{ rotate: -5, scale: 1.05 }}
                            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/20"
                        >
                            <Building2 className="h-10 w-10 text-primary-foreground" />
                        </motion.div>
                        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
                            Staff Login
                        </h1>
                        <p className="mt-3 text-muted-foreground font-medium text-sm">
                            Terminal Assignment: 
                            <span className="ml-2 text-primary px-3 py-1 bg-primary/10 rounded-lg font-bold border border-primary/20">
                                {counterName}
                            </span>
                        </p>
                    </div>

                    <CardContent className="p-8 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="login" className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-black ml-1">
                                    Identity
                                </Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="login"
                                        type="text"
                                        placeholder="Username or Email"
                                        className="pl-12 h-14 bg-muted/30 border-input text-foreground text-lg rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/40"
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-black ml-1">
                                    Access Key
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-14 bg-muted/30 border-input text-foreground text-lg rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {errors.login && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive rounded-2xl">
                                            <AlertDescription className="font-bold flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                                                {errors.login}
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-2xl shadow-primary/20 group transition-all uppercase tracking-widest"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            Open Station
                                            <ArrowRightCircle className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center mt-10 space-y-4">
                    <p className="text-muted-foreground text-sm font-medium">
                        Need to change counter? <button className="text-primary hover:underline font-bold transition-all">Re-scan QR Code</button>
                    </p>
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <p className="text-muted-foreground text-[9px] uppercase tracking-[0.4em] font-black">
                            Protected by AES-256 Shift-Lock Protocol
                        </p>
                        <div className="h-px w-12 bg-muted-foreground/30" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function Badge({ children, className, variant }: any) {
    return (
        <span className={cn("inline-flex items-center text-[10px] font-black tracking-widest", className)}>
            {children}
        </span>
    );
}