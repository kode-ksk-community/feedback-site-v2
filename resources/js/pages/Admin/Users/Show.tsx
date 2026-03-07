import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, Tag as TagIcon, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
    user: any;
    feedbacks: any[];
    stats: {
        average_rating: number;
        total_reviews: number;
        rating_data: Record<string, number>;
        tag_data: { name: string; total: number }[];
    };
    filters: any;
}

export default function UserShow({ user, feedbacks, stats, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (preset?: string) => {
        router.get(`/admin/users/${user.id}`, 
            { preset, start_date: startDate, end_date: endDate }, 
            { preserveState: true }
        );
    };

    // Prepare Chart Data
    const chartData = [1, 2, 3, 4, 5].map(star => ({
        name: `${star} Star`,
        total: stats.rating_data[star] || 0
    }));

    return (
        <AppLayout breadcrumbs={[{ title: 'User Control', href: '/admin/users' }, { title: user.name, href: '#' }]}>
            <Head title={`Performance: ${user.name}`} />

            <div className="mx-auto max-w-6xl p-6 space-y-8">
                {/* Performance Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-[2rem] shadow-sm">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Servicer Intelligence</h1>
                        <p className="text-muted-foreground italic font-medium">Analyzing performance for {user.name}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Select onValueChange={(v) => handleFilter(v)} defaultValue={filters.preset || 'all'}>
                            <SelectTrigger className="w-32 rounded-xl bg-muted border-none font-bold">
                                <SelectValue placeholder="Preset" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="daily">Today</SelectItem>
                                <SelectItem value="weekly">This Week</SelectItem>
                                <SelectItem value="monthly">This Month</SelectItem>
                                <SelectItem value="yearly">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 bg-muted p-1 px-3 rounded-xl">
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none h-8  p-0 text-xs font-bold" />
                            <span className="text-muted-foreground">-</span>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none h-8  p-0 text-xs font-bold" />
                            <Button size="sm" onClick={() => handleFilter()} className="h-7 rounded-lg bg-primary">Apply</Button>
                        </div>
                    </div>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-[2rem] border-none bg-primary text-primary-foreground">
                        <CardContent className="p-8 flex flex-col items-center">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Average Score</p>
                            <h2 className="text-6xl font-black">{stats.average_rating}</h2>
                            <div className="flex mt-2"><Star className="fill-current" /></div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-none bg-card">
                        <CardHeader><CardTitle className="text-xs uppercase tracking-widest font-black text-muted-foreground">Rating Distribution</CardTitle></CardHeader>
                        <CardContent className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index > 2 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                                        ))}
                                    </Bar>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-none bg-card">
                        <CardHeader><CardTitle className="text-xs uppercase tracking-widest font-black text-muted-foreground">Common Tags</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {stats.tag_data.slice(0, 4).map((tag, i) => (
                                <div key={i} className="flex justify-between items-center bg-muted/50 p-2 px-4 rounded-xl">
                                    <span className="text-xs font-bold">{tag.name}</span>
                                    <span className="text-xs font-black text-primary">{tag.total}x</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Feedback Timeline */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <MessageSquare className="text-primary" /> Review History
                    </h3>
                    <div className="grid gap-4">
                        {feedbacks.map((fb) => (
                            <Card key={fb.id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-card transition-hover hover:shadow-md">
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                                    <div className="flex flex-col items-center justify-center bg-muted/50 p-4 rounded-2xl min-w-[80px]">
                                        <span className="text-2xl font-black">{fb.rating}</span>
                                        <div className="flex"><Star size={10} className="fill-primary text-primary" /></div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between">
                                            <p className="font-bold text-foreground">"{fb.comment}"</p>
                                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(fb.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {fb.tags.map((tag: any) => (
                                                <span key={tag.id} className="text-[9px] font-black uppercase tracking-widest bg-accent/10 text-accent-foreground border border-accent/20 px-2 py-0.5 rounded-full">
                                                    #{tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}