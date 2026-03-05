import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Send,
    UserCircle2,
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
import QRCode from 'react-qr-code';
interface Props {
    counter: { id: number; name: string };
    tags: { id: number; name: string }[];
    fixed_qr_token: string;
    currentServicer: any | null;
}

// Map ratings to Emojis and Colors
const EMOJI_RATINGS = [
    {
        value: 1,
        label: 'Terrible',
        emoji: '😠',
        activeColor: 'bg-red-500/20 text-red-500 border-red-500/50',
    },
    {
        value: 2,
        label: 'Bad',
        emoji: '☹️',
        activeColor: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
    },
    {
        value: 3,
        label: 'Okay',
        emoji: '😐',
        activeColor: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
    },
    {
        value: 4,
        label: 'Good',
        emoji: '😊',
        activeColor: 'bg-lime-500/20 text-lime-500 border-lime-500/50',
    },
    {
        value: 5,
        label: 'Great',
        emoji: '🤩',
        activeColor: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
    },
];

const SuccessOverlay = ({ show }: { show: boolean }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl"
            >
                <motion.div
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.4)]"
                    >
                        <CheckCircle2 className="h-20 w-20 text-white" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-2 text-5xl font-black text-white"
                    >
                        Thank You!
                    </motion.h2>
                    <motion.p className="text-xl text-slate-400">
                        Your feedback has been recorded.
                    </motion.p>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default function Feedback({
    counter,
    tags,
    fixed_qr_token,
    currentServicer: initialServicer,
}: Props) {
    const { props } = usePage();
    const [currentServicer, setCurrentServicer] =
        useState<any>(initialServicer);
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        rating: 0,
        comment: '',
        tagIds: [] as number[],
    });

    console.log({ tags });

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

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.hidden || showSuccess) return;
            router.reload({
                only: ['currentServicer'],
                preserveState: true,
                onSuccess: (page) => {
                    const newServicer = page.props.currentServicer as any;
                    if (
                        newServicer &&
                        (!currentServicer ||
                            newServicer.id !== currentServicer.id)
                    ) {
                        setCurrentServicer(newServicer);
                    }
                    if (!newServicer && currentServicer) {
                        setCurrentServicer(null);
                        reset();
                    }
                },
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [currentServicer, showSuccess]);

    const handleSubmit = () => {
        post(`/feedback/${counter.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Thank you! Feedback received', { icon: '🚀' });
                reset();
            },
        });
    };

    const toggleTag = (id: number) => {
        const currentTags = [...data.tagIds];
        const index = currentTags.indexOf(id);
        index > -1 ? currentTags.splice(index, 1) : currentTags.push(id);
        setData('tagIds', currentTags);
    };

    if (!currentServicer) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] p-8 text-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-blue-500/20"
                >
                    <UserCircle2 className="h-16 w-16 text-blue-400" />
                </motion.div>
                <h2 className="mb-4 text-4xl font-bold text-white">
                    Ready to Serve
                </h2>
                <p className="text-xl text-slate-400">
                    Terminal{' '}
                    <span className="font-mono text-blue-400">
                        {counter.name}
                    </span>{' '}
                    is active.
                </p>
                <div className="rounded-xl border bg-white p-2 shadow-sm transition-shadow group-hover:shadow-md">
                    <QRCode
                        id={`qr-svg-${counter.id}`}
                        value={fixed_qr_token}
                        size={250}
                        level="H"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 sm:p-6">
            <Head title="Customer Satisfaction" />
            <SuccessOverlay show={showSuccess} />

            <Button
                variant="ghost"
                className="absolute top-4 left-4 text-slate-400 hover:text-white"
                onClick={() => router.visit('/')}
            >
                Logout
            </Button>

            <div className="pointer-events-none fixed inset-0">
                <div className="absolute top-0 right-0 h-96 w-96 bg-blue-600/20 blur-[100px]" />
                <div className="absolute bottom-0 left-0 h-96 w-96 bg-indigo-600/20 blur-[100px]" />
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 w-full max-w-2xl rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-2xl sm:p-12"
            >
                <div className="mb-10 text-center">
                    <Badge
                        variant="outline"
                        className="mb-4 border-blue-500/50 px-4 py-1 text-blue-400"
                    >
                        Service Feedback
                    </Badge>
                    <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        How was your service?
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-lg text-slate-400">
                        <span>Staff:</span>
                        <span className="font-semibold text-white">
                            {currentServicer.name}
                        </span>
                    </div>
                </div>

                {/* --- 🎭 EMOJI RATING SECTION --- */}
                <div className="mb-12 flex items-center justify-between gap-2">
                    {EMOJI_RATINGS.map((item) => (
                        <motion.button
                            key={item.value}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setData('rating', item.value)}
                            className={cn(
                                'flex flex-col items-center gap-3 rounded-3xl border-2 p-4 transition-all duration-300',
                                data.rating === item.value
                                    ? `${item.activeColor} scale-110 shadow-lg`
                                    : 'border-transparent bg-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0',
                            )}
                        >
                            <span className="text-5xl sm:text-6xl">
                                {item.emoji}
                            </span>
                            <span
                                className={cn(
                                    'text-xs font-bold tracking-wider uppercase',
                                    data.rating === item.value
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                )}
                            >
                                {item.label}
                            </span>
                            {data.rating === item.value && (
                                <motion.div
                                    layoutId="sparkle"
                                    className="absolute -top-2 -right-2"
                                >
                                    <Sparkles className="h-6 w-6 text-yellow-200" />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* 🏷 Tags */}
                <div className="mb-10 space-y-4">
                    <p className="text-center text-sm font-medium text-slate-500 uppercase">
                        What stood out?
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={cn(
                                    'rounded-2xl border px-6 py-3 text-base font-semibold transition-all',
                                    data.tagIds.includes(tag.id)
                                        ? 'border-blue-500 bg-blue-600 text-white'
                                        : 'border-slate-700 bg-slate-800/50 text-slate-400',
                                )}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>

                <Textarea
                    placeholder="Any specifics you'd like to share?"
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    className="min-h-[120px] rounded-2xl border-slate-800 bg-slate-950/50 p-6 text-white"
                />

                <Button
                    onClick={handleSubmit}
                    disabled={processing || data.rating === 0}
                    className={cn(
                        'mt-10 h-20 w-full rounded-2xl text-xl font-bold transition-all',
                        data.rating > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'cursor-not-allowed bg-slate-800 text-slate-500',
                    )}
                >
                    {processing ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                        <>
                            Complete Feedback <Send className="ml-3 h-6 w-6" />
                        </>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
