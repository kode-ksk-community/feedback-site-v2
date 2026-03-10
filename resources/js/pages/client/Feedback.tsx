import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Send,
    UserCircle2,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import QRCode from 'react-qr-code';
import FlashMessage from '@/components/notifications/FlashMessage';
import { Toaster as HotToast } from 'react-hot-toast';
import { route } from 'ziggy-js';

// Added uuid to Props for secure routing
interface Props {
    counter: { id: number; name: string; uuid: string }; 
    tags: { id: number; name: string; level: number }[];
    fixed_qr_token: string;
    currentServicer: any | null;
}

const EMOJI_RATINGS = [
    { value: 1, label: 'Terrible', emoji: '😠', activeColor: 'bg-destructive/20 text-destructive border-destructive/50' },
    { value: 2, label: 'Bad', emoji: '☹️', activeColor: 'bg-orange-500/20 text-orange-600 border-orange-500/50' },
    { value: 3, label: 'Okay', emoji: '😐', activeColor: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50' },
    { value: 4, label: 'Good', emoji: '😊', activeColor: 'bg-primary/20 text-primary border-primary/50' },
    { value: 5, label: 'Great', emoji: '🤩', activeColor: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50' },
];

const SuccessOverlay = ({ show }: { show: boolean }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary"
                    >
                        <CheckCircle2 className="h-20 w-20 text-primary-foreground" />
                    </motion.div>
                    <h2 className="mb-2 text-5xl font-black text-foreground">Thank You!</h2>
                    <p className="text-xl text-muted-foreground">Your feedback has been recorded.</p>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function Feedback({ counter, tags, fixed_qr_token, currentServicer: initialServicer }: Props) {
    const { props } = usePage() as any;
    const [currentServicer, setCurrentServicer] = useState<any>(initialServicer);
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        rating: 0,
        comment: '',
        tagIds: [] as number[],
    });

    // 1. DYNAMIC TAG FILTERING
    const filteredTags = tags.filter((tag) => tag.level === data.rating);

    // Reset tags when rating changes to prevent mismatched data
    useEffect(() => {
        setData('tagIds', []);
    }, [data.rating]);

    // 2. OPTIMIZED POLLING
    useEffect(() => {
        if (document.hidden || showSuccess || currentServicer) return;

        const interval = setInterval(() => {
            router.reload({
                only: ['currentServicer'],
                preserveState: true,
                onSuccess: (page) => {
                    const newServicer = page.props.currentServicer as any;
                    if (newServicer) {
                        setCurrentServicer(newServicer);
                    }
                },
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [currentServicer, showSuccess]);

// 3. FIX: Handle Flash Success
    useEffect(() => {
        if (props.flash?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
                
                // ❌ REMOVED: setCurrentServicer(null); 
                // We keep the servicer active so the form is instantly ready for the next customer!
                
                router.reload({ only: ['flash'] });
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [props.flash?.success]);

    const handleSubmit = () => {
        // FIX: Route by UUID, not ID
        post(route('feedback.store', { counter: counter.uuid }), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                // We deliberately DO NOT set currentServicer(null) here anymore. 
                // The useEffect above handles it so the user can see the "Thank You" screen.
            },
        });
    };

    const toggleTag = (id: number) => {
        const current = [...data.tagIds];
        const idx = current.indexOf(id);
        idx > -1 ? current.splice(idx, 1) : current.push(id);
        setData('tagIds', current);
    };

    if (!currentServicer) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
                <HotToast position="top-right" />
                <FlashMessage />
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10"
                >
                    <UserCircle2 className="h-16 w-16 text-primary" />
                </motion.div>
                <h2 className="mb-4 text-4xl font-black text-foreground uppercase italic tracking-tighter">Ready to Serve</h2>
                <p className="mb-8 text-xl text-muted-foreground">
                    Terminal <span className="font-mono font-bold text-primary">{counter.name}</span> is active.
                </p>
                <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl">
                    <QRCode
                        value={route('servicer.start', { counter_id: counter.id, token: fixed_qr_token })}
                        size={250}
                        level="H"
                        bgColor="transparent"
                        fgColor="currentColor"
                        className="text-foreground"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
            <Head title="Customer Satisfaction" />
            <SuccessOverlay show={showSuccess} />
            <HotToast position="bottom-right" />
            <FlashMessage />

            <Button
                variant="ghost"
                className="absolute top-6 left-6 text-muted-foreground hover:text-foreground rounded-full"
                onClick={() => router.visit('/')}
            >
                Logout
            </Button>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 w-full max-w-2xl rounded-[3rem] border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-2xl sm:p-12"
            >
                <div className="mb-10 text-center">
                    <Badge variant="outline" className="mb-6 border-primary/30 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Service Feedback
                    </Badge>
                    <h1 className="mb-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">How was my service?</h1>
                    <div className="flex items-center justify-center gap-3 text-lg text-muted-foreground">
                        <span className="opacity-60 italic">Served by</span>
                        <span className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4">
                            {currentServicer.name}
                        </span>
                    </div>
                </div>

                {/* --- RATING SECTION --- */}
                <div className="mb-12 pt-6 flex items-center justify-between gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {EMOJI_RATINGS.map((item) => (
                        <motion.button
                            key={item.value}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setData('rating', item.value)}
                            className={cn(
                                'relative flex min-w-[60px] flex-col items-center gap-3 rounded-[2rem] border-2 p-4 transition-all duration-300',
                                data.rating === item.value
                                    ? `${item.activeColor} scale-110 shadow-xl`
                                    : 'border-transparent bg-muted/20 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                            )}
                        >
                            <span className="text-5xl sm:text-6xl">{item.emoji}</span>
                            <span className={cn('text-[10px] font-black tracking-widest uppercase transition-opacity', data.rating === item.value ? 'opacity-100' : 'opacity-0')}>
                                {item.label}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* --- DYNAMIC TAGS --- */}
                <AnimatePresence mode="wait">
                    {data.rating > 0 && filteredTags.length > 0 && (
                        <motion.div
                            key={data.rating}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-10 space-y-6"
                        >
                            <p className="text-center text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase opacity-50">
                                What stood out?
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {filteredTags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => toggleTag(tag.id)}
                                        className={cn(
                                            'rounded-2xl border px-6 py-4 text-sm font-bold transition-all active:scale-95',
                                            data.tagIds.includes(tag.id)
                                                ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                : 'border-input bg-muted/50 text-muted-foreground hover:border-primary/50'
                                        )}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Textarea
                    placeholder="Tell us more about your experience..."
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    className="min-h-[140px] rounded-[2rem] border-input bg-muted/30 p-8 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                />

                <Button
                    onClick={handleSubmit}
                    disabled={processing || data.rating === 0}
                    className={cn(
                        'mt-10 h-24 w-full rounded-[2.5rem] text-2xl font-black uppercase tracking-widest transition-all shadow-2xl',
                        data.rating > 0 ? 'bg-primary text-primary-foreground hover:scale-[1.02]' : 'bg-muted text-muted-foreground opacity-50'
                    )}
                >
                    {processing ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                    ) : (
                        <div className="flex items-center gap-4">
                            Submit Feedback <Send className="h-8 w-8" />
                        </div>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}