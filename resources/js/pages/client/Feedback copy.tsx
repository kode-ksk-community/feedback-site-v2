import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Send, UserCircle2, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import QRCode from 'react-qr-code';
import FlashMessage from '@/components/notifications/FlashMessage';
import { Toaster as HotToast } from 'react-hot-toast';
import { route } from 'ziggy-js';

// --- Static Data (Moved outside to prevent re-allocation) ---
const EMOJI_RATINGS = [
    { value: 1, label: 'Terrible', emoji: '😠', activeColor: 'bg-destructive/20 text-destructive border-destructive/50' },
    { value: 2, label: 'Bad', emoji: '☹️', activeColor: 'bg-orange-500/20 text-orange-600 border-orange-500/50' },
    { value: 3, label: 'Okay', emoji: '😐', activeColor: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50' },
    { value: 4, label: 'Good', emoji: '😊', activeColor: 'bg-primary/20 text-primary border-primary/50' },
    { value: 5, label: 'Great', emoji: '🤩', activeColor: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50' },
];

// --- Memoized Sub-components ---
const SuccessOverlay = memo(({ show }: { show: boolean }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="text-center p-6"
                >
                    <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary">
                        <CheckCircle2 className="h-20 w-20 text-primary-foreground" />
                    </div>
                    <h2 className="mb-2 text-5xl font-black text-foreground">Thank You!</h2>
                    <p className="text-xl text-muted-foreground">Your feedback has been recorded.</p>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
));

const StaticQR = memo(({ url }: { url: string }) => (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-2xl">
        <QRCode value={url} size={250} level="H" bgColor="transparent" fgColor="currentColor" />
    </div>
));

export default function Feedback({ counter, tags, fixed_qr_token, currentServicer: initialServicer }: Props) {
    const { props } = usePage();
    const [currentServicer, setCurrentServicer] = useState(initialServicer);
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        rating: 0,
        comment: '',
        tagIds: [] as number[],
        servicer_id: initialServicer?.id || null,
    });

    // 1. HIGH PERFORMANCE STATE DERIVATION
    // Faster than useEffect; filters only when data.rating or tags change.
    const filteredTags = useMemo(() => 
        tags.filter((tag) => tag.level === data.rating), 
    [tags, data.rating]);

    // 2. OPTIMIZED POLLING (Network & CPU Efficiency)
    useEffect(() => {
        if (currentServicer || showSuccess) return;

        const poll = () => {
            if (document.hidden) return; // Don't poll if user switched tabs
            
            router.reload({
                only: ['currentServicer'],
                preserveState: true,
                onSuccess: (page) => {
                    const newServicer = page.props.currentServicer as any;
                    if (newServicer) {
                        setCurrentServicer(newServicer);
                        setData('servicer_id', newServicer.id);
                    }
                },
            });
        };

        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, [currentServicer, showSuccess, setData]);

    // 3. FLASH HANDLING
    useEffect(() => {
        if (props.flash?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
                router.reload({ only: ['flash'] });
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [props.flash]);

    // 4. MEMOIZED HANDLERS (Prevents child re-renders)
    const handleRatingSelect = useCallback((val: number) => {
        setData(prev => ({ ...prev, rating: val, tagIds: [] }));
    }, [setData]);

    const toggleTag = useCallback((id: number) => {
        setData('tagIds', data.tagIds.includes(id) 
            ? data.tagIds.filter(t => t !== id) 
            : [...data.tagIds, id]
        );
    }, [data.tagIds, setData]);

    const handleSubmit = useCallback(() => {
        post(`/feedback/${counter.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setCurrentServicer(null);
            },
        });
    }, [counter.id, post, reset]);

    // --- VIEW RENDERING ---

    if (!currentServicer) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
                <HotToast position="top-right" />
                <FlashMessage />
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10"
                >
                    <UserCircle2 className="h-16 w-16 text-primary" />
                </motion.div>
                <h2 className="mb-4 text-4xl font-black text-foreground uppercase italic tracking-tighter">Ready to Serve</h2>
                <p className="mb-8 text-xl text-muted-foreground">
                    Terminal <span className="font-mono font-bold text-primary">{counter.name}</span>
                </p>
                <StaticQR url={route('servicer.start', { counter_id: counter.id, token: fixed_qr_token })} />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
            <Head title="Service Feedback" />
            <SuccessOverlay show={showSuccess} />
            <HotToast />

            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-2xl rounded-[3rem] border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-2xl"
            >
                <div className="mb-10 text-center">
                    <Badge className="mb-6 bg-primary/10 text-primary border-none">SERVICE FEEDBACK</Badge>
                    <h1 className="mb-2 text-4xl font-black tracking-tight">How was my service?</h1>
                    <p className="text-muted-foreground italic">Served by <span className="font-bold text-foreground not-italic underline">{currentServicer.name}</span></p>
                </div>

                {/* RATING SELECTOR */}
                <div className="mb-12 flex justify-between gap-2 overflow-x-auto pb-2">
                    {EMOJI_RATINGS.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => handleRatingSelect(item.value)}
                            className={cn(
                                'flex flex-col items-center gap-2 rounded-3xl border-2 p-4 transition-all',
                                data.rating === item.value ? item.activeColor : 'border-transparent grayscale opacity-50'
                            )}
                        >
                            <span className="text-5xl">{item.emoji}</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* TAGS (AnimatePresence only if rating exists) */}
                <div className="min-h-[100px]"> 
                    {data.rating > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap justify-center gap-2 mb-8">
                            {filteredTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={cn(
                                        'rounded-xl border px-5 py-3 text-sm font-bold transition-all',
                                        data.tagIds.includes(tag.id) ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                                    )}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                <Textarea
                    placeholder="Optional comments..."
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    className="rounded-3xl bg-muted/20 p-6 focus-visible:ring-1"
                />

                <Button
                    onClick={handleSubmit}
                    disabled={processing || data.rating === 0}
                    className="mt-8 h-20 w-full rounded-full text-xl font-bold uppercase shadow-xl"
                >
                    {processing ? <Loader2 className="animate-spin" /> : "Submit Feedback"}
                </Button>
            </motion.div>
        </div>
    );
}