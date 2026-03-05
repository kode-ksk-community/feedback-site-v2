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
        // Secure submission: No need for manual state resets as Inertia handles the session
        post('/servicer/login');
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            <Head title="Staff Authentication" />
            
            {/* Background High-Tech Aura */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                {/* Status Badge */}
                <div className="flex justify-center mb-6">
                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/50 text-blue-400 px-4 py-1.5 rounded-full backdrop-blur-md">
                        <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                        SECURE TERMINAL ACCESS
                    </Badge>
                </div>

                <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                    
                    <div className="p-8 pb-4 text-center">
                        <motion.div 
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20"
                        >
                            <Building2 className="h-10 w-10 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Staff Login</h1>
                        <p className="mt-3 text-slate-400 font-medium">
                            Terminal Assignment: <span className="text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded">{counterName}</span>
                        </p>
                    </div>

                    <CardContent className="p-8 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="login" className="text-slate-300 text-xs uppercase tracking-widest font-bold ml-1">Identity</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <Input
                                        id="login"
                                        type="text"
                                        placeholder="Username or Email"
                                        className="pl-12 h-14 bg-slate-950/50 border-slate-800 text-white text-lg rounded-xl focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300 text-xs uppercase tracking-widest font-bold ml-1">Access Key</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-14 bg-slate-950/50 border-slate-800 text-white text-lg rounded-xl focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {errors.login && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400 rounded-xl">
                                            <AlertDescription className="font-medium">{errors.login}</AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-16 text-xl font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xl shadow-blue-900/20 group transition-all"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <div className="flex items-center">
                                            Open Station
                                            <ArrowRightCircle className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center mt-8 space-y-2">
                    <p className="text-slate-500 text-sm font-medium">
                        Need to change counter? <button className="text-blue-400 hover:underline">Re-scan QR Code</button>
                    </p>
                    <p className="text-slate-700 text-[10px] uppercase tracking-tighter">
                        Protected by AES-256 Shift-Lock Protocol
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// Minimalistic Badge for the header
function Badge({ children, className, variant }: any) {
    return (
        <span className={cn("inline-flex items-center text-xs font-semibold", className)}>
            {children}
        </span>
    );
}