import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Send,
    LogOut,
    Loader2,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// --- STATIC MOCK DATA ---
const MOCK_COUNTER = { id: 2, name: 'Counter 02' };
const MOCK_TAGS = [
    { id: 1, name: 'Technical Expertise' },
    { id: 2, name: 'Resolution Speed' },
    { id: 3, name: 'Friendly Staff' },
    { id: 4, name: 'Clear Communication' }
];
const MOCK_SERVICER = { id: 101, full_name: 'Alex D.' };

const EMOJI_RATINGS = [
    { value: 1, label: 'Terrible', emoji: '😠', activeColor: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-500 border-red-500/50' },
    { value: 2, label: 'Bad', emoji: '☹️', activeColor: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 border-orange-500/50' },
    { value: 3, label: 'Okay', emoji: '😐', activeColor: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 border-yellow-500/50' },
    { value: 4, label: 'Good', emoji: '😊', activeColor: 'bg-lime-500/10 dark:bg-lime-500/20 text-lime-600 dark:text-lime-500 border-lime-500/50' },
    { value: 5, label: 'Great', emoji: '🤩', activeColor: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 border-emerald-500/50' },
];

const SuccessOverlay = ({ show }: { show: boolean }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-6"
                >
                    <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary shadow-[0_0_50px_rgba(var(--primary),0.3)]">
                        <CheckCircle2 className="h-16 w-16 text-primary-foreground" />
                    </div>
                    <h2 className="mb-2 text-4xl font-black text-foreground">Thank You!</h2>
                    <p className="text-muted-foreground">Your feedback has been recorded.</p>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function Feedback() {
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, processing, reset } = useForm({
        rating: 0,
        comment: '',
        tagIds: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.rating === 0) return;
        setShowSuccess(true);
        toast.success('Feedback received!', { icon: '🚀' });
        setTimeout(() => {
            setShowSuccess(false);
            reset();
        }, 3000);
    };

    const toggleTag = (id: number) => {
        const currentTags = data.tagIds.includes(id) 
            ? data.tagIds.filter(t => t !== id) 
            : [...data.tagIds, id];
        setData('tagIds', currentTags);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 transition-colors duration-500">
            <Head title="Service Feedback" />
            <SuccessOverlay show={showSuccess} />

            {/* Ambient Lighting - Supports Light/Dark */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-50 dark:opacity-100">
                <div className="absolute -top-[10%] -right-[10%] h-96 w-96 bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-[10%] -left-[10%] h-96 w-96 bg-accent/10 blur-[120px]" />
            </div>

            <Button
                variant="ghost"
                className="absolute top-6 left-6 text-muted-foreground hover:text-foreground gap-2"
                onClick={() => router.visit('/')}
            >
                <LogOut className="h-4 w-4" /> Logout
            </Button>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 w-full max-w-2xl rounded-[2.5rem] border border-border bg-card/60 p-8 backdrop-blur-2xl sm:p-12 shadow-xl"
            >
                <div className="mb-10 text-center">
                    <Badge variant="secondary" className="mb-4 px-4 py-1 text-primary tracking-wide">
                        SERVICE QUALITY
                    </Badge>
                    <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        How was your service?
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                        <span>Terminal <span className="text-primary font-mono">{MOCK_COUNTER.name}</span></span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4">
                            {MOCK_SERVICER.full_name}
                        </span>
                    </div>
                </div>

                {/* Rating Grid */}
                <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
                    {EMOJI_RATINGS.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setData('rating', item.value)}
                            className={cn(
                                'relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-200 min-w-[100px] flex-1',
                                data.rating === item.value
                                    ? `${item.activeColor} scale-105 border-current shadow-sm`
                                    : 'border-transparent bg-muted/50 opacity-40 hover:opacity-100'
                            )}
                        >
                            <span className="text-4xl sm:text-5xl">{item.emoji}</span>
                            <span className={cn(
                                'text-[10px] font-black tracking-widest uppercase',
                                data.rating === item.value ? 'opacity-100' : 'opacity-0'
                            )}>
                                {item.label}
                            </span>
                            {data.rating === item.value && (
                                <motion.div layoutId="sparkle" className="absolute -top-2 -right-2">
                                    <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                </motion.div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tags Grid */}
                <div className="mb-10 space-y-4">
                    <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        What stood out to you?
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {MOCK_TAGS.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className={cn(
                                    'rounded-xl border px-4 py-2 text-sm font-semibold transition-all active:scale-95',
                                    data.tagIds.includes(tag.id)
                                        ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                        : 'border-input bg-background text-muted-foreground hover:bg-muted'
                                )}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>

                <Textarea
                    placeholder="Additional comments (optional)..."
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    className="min-h-[100px] rounded-2xl border-input bg-background/50 p-4 text-foreground focus-visible:ring-primary text-base"
                />

                <Button
                    onClick={handleSubmit}
                    disabled={processing || data.rating === 0}
                    className={cn(
                        'mt-8 h-16 w-full rounded-2xl text-lg font-bold gap-3 transition-all',
                        data.rating > 0
                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                            : 'bg-muted text-muted-foreground'
                    )}
                >
                    {processing ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>Submit Feedback <Send className="h-5 w-5" /></>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}