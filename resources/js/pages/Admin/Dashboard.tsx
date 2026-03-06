import { useState, useCallback, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Star,
    Users,
    TrendingUp,
    Tag as TagIcon,
    Building2,
    MonitorSmartphone,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({
    stats,
    recentComments,
    recentTags,
    topServicers,
    branches,
    counters,
    filters,
}: any) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const start = () => setIsLoading(true);
        const finish = () => {
            setTimeout(() => setIsLoading(false), 150);
        };

        const unbindStart = router.on('start', start);
        const unbindFinish = router.on('finish', finish);

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    const updateFilter = useCallback(
        (key: string, value: any) => {
            const newFilters = {
                ...filters,
                [key]: value === 'all' ? '' : value,
            };
            if (key === 'branch_id') newFilters.counter_id = '';

            router.get(window.location.pathname, newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['stats', 'recentComments', 'recentTags', 'topServicers', 'counters', 'filters'],
            });
        },
        [filters],
    );

    return (
        <AppLayout>
            <Head title="Performance Dashboard" />
            <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-6">
                
                {/* === FILTER BAR (Adaptive Surface) === */}
                <Card className="rounded-[1.5rem] border-none p-2 shadow-sm bg-card text-card-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Preset Toggles */}
                        <div className="flex rounded-xl bg-muted p-1">
                            {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                                <Button
                                    key={p}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateFilter('preset', p)}
                                    disabled={isLoading}
                                    className={`rounded-lg px-4 text-[10px] font-black uppercase transition-all ${
                                        filters.preset === p 
                                        ? 'bg-background text-primary shadow-sm' 
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>

                        {/* Date Inputs */}
                        <div className="flex items-center gap-2 border-r border-border pr-3">
                            <Input
                                type="date"
                                disabled={isLoading}
                                value={filters.date_start || ''}
                                onChange={(e) => updateFilter('date_start', e.target.value)}
                                className="h-9 w-32 border-none bg-transparent text-xs focus-visible:ring-ring"
                            />
                            <span className="text-xs text-muted-foreground">→</span>
                            <Input
                                type="date"
                                disabled={isLoading}
                                value={filters.date_end || ''}
                                onChange={(e) => updateFilter('date_end', e.target.value)}
                                className="h-9 w-32 border-none bg-transparent text-xs focus-visible:ring-ring"
                            />
                        </div>

                        {/* Dropdowns */}
                        <div className="flex gap-2">
                            <Select
                                disabled={isLoading}
                                value={filters.branch_id || 'all'}
                                onValueChange={(v) => updateFilter('branch_id', v)}
                            >
                                <SelectTrigger className="h-9 w-[160px] border-none bg-transparent text-xs font-bold focus:ring-ring">
                                    <Building2 className="mr-2 h-3 w-3 text-muted-foreground" />
                                    <SelectValue placeholder="Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    {branches.map((b: any) => (
                                        <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                disabled={isLoading || !filters.branch_id}
                                value={filters.counter_id || 'all'}
                                onValueChange={(v) => updateFilter('counter_id', v)}
                            >
                                <SelectTrigger className="h-9 w-[160px] border-none bg-transparent text-xs font-bold focus:ring-ring">
                                    <MonitorSmartphone className="mr-2 h-3 w-3 text-muted-foreground" />
                                    <SelectValue placeholder="Counter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Counters</SelectItem>
                                    {counters.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={() => router.get(window.location.pathname)}
                            variant="ghost"
                            className="ml-auto text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </Card>

                <div className={`transition-opacity duration-200 ${isLoading ? 'pointer-events-none opacity-50' : 'opacity-100'}`}>
                    
                    {/* === TOP METRICS === */}
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <MetricCard
                            title="Total Feedback"
                            value={stats.totalFeedbacks}
                            icon={<TrendingUp className="text-primary" />}
                        />
                        <MetricCard
                            title="Average Rating"
                            value={stats.avgRating}
                            icon={<Star className="fill-current text-secondary" />}
                            suffix="/ 5.0"
                        />
                        <MetricCard
                            title="Staff Active"
                            value={stats.activeServicers}
                            icon={<Users className="text-primary" />}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* === LEADERBOARD === */}
                        <Card className="rounded-[2rem] border-none shadow-sm lg:col-span-2 bg-card text-card-foreground">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black tracking-wider uppercase">Servicer Leaderboard</CardTitle>
                                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">
                                    High Performance
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {topServicers.map((s: any) => (
                                    <div key={s.id} className="group flex items-center justify-between rounded-2xl p-4 transition-colors hover:bg-muted/30">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-black text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                                {s.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">{s.name}</h4>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{s.feedbacks_count} Sessions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-1 flex items-center justify-end gap-1">
                                                <Star className="h-4 w-4 fill-current text-secondary" />
                                                <span className="text-lg font-black text-foreground">{Number(s.feedbacks_avg_rating || 0).toFixed(1)}</span>
                                            </div>
                                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(s.feedbacks_avg_rating / 5) * 100}%` }}
                                                    className="h-full rounded-full bg-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* === TAGS === */}
                        <Card className="rounded-[2rem] border-none shadow-sm bg-card text-card-foreground">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider uppercase">
                                    <TagIcon className="h-4 w-4 text-muted-foreground" /> Top Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {recentTags?.map((tag: any) => (
                                    <div key={tag.id} className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/30">
                                        <span className="text-xs font-bold text-foreground/80">#{tag.name}</span>
                                        <Badge className="bg-primary text-primary-foreground border-none font-black">{tag.feedbacks_count}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* === COMMENTS === */}
                    <Card className="mt-6 rounded-[2rem] border-none shadow-sm bg-card text-card-foreground">
                        <CardHeader>
                            <CardTitle className="text-sm font-black tracking-wider uppercase text-foreground">Latest Comments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {recentComments.map((c: any) => (
                                    <div key={c.id} className="relative rounded-2xl border border-border p-4 shadow-sm bg-background/50 hover:bg-background transition-colors">
                                        <div className="mb-2 flex items-start justify-between">
                                            <Badge className="border-none bg-secondary/15 text-secondary hover:bg-secondary/25 font-bold">
                                                {c.rating} ★
                                            </Badge>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-foreground/90 italic">"{c.comment}"</p>
                                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Served by</span>
                                            <span className="text-xs font-black text-foreground">{c.user?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function MetricCard({ title, value, icon, suffix = '' }: any) {
    return (
        <Card className="rounded-[2rem] border-none shadow-sm bg-card text-card-foreground">
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="mb-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">{title}</p>
                    <h3 className="text-4xl font-black tracking-tighter text-foreground">
                        {value}
                        <span className="ml-1 text-xl text-muted-foreground">{suffix}</span>
                    </h3>
                </div>
                <div className="rounded-2xl bg-muted p-4">{icon}</div>
            </CardContent>
        </Card>
    );
}