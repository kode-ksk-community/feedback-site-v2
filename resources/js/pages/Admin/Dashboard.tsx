import { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Users, TrendingUp, Calendar, MessageSquare, Tag as TagIcon, Building2, MonitorSmartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard({ stats, recentComments, recentTags, topServicers, branches, counters, servicers, filters }: any) {
    
    const updateFilter = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value === "all" ? "" : value };
        // Reset counter if branch changes
        if (key === 'branch_id') newFilters.counter_id = "";
        
        router.get(window.location.pathname, newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    return (
        <AppLayout>
            <Head title="Performance Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full bg-slate-50/50">
                
                {/* === FLEXIBLE FILTER BAR === */}
                <Card className="border-none shadow-sm bg-white p-2 rounded-[1.5rem]">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Time Presets */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                                <Button 
                                    key={p} size="sm" variant="ghost"
                                    onClick={() => updateFilter('preset', p)}
                                    className={`px-4 text-[10px] font-black uppercase rounded-lg ${filters.preset === p ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 border-r pr-3 border-slate-200">
                            <Input type="date" value={filters.date_start || ''} onChange={(e) => updateFilter('date_start', e.target.value)} className="w-32 h-9 text-xs border-none bg-slate-50" />
                            <span className="text-slate-400 text-xs">→</span>
                            <Input type="date" value={filters.date_end || ''} onChange={(e) => updateFilter('date_end', e.target.value)} className="w-32 h-9 text-xs border-none bg-slate-50" />
                        </div>

                        {/* Dropdowns */}
                        <Select value={filters.branch_id || "all"} onValueChange={(v) => updateFilter('branch_id', v)}>
                            <SelectTrigger className="w-[160px] h-9 border-none bg-slate-50 text-xs font-bold">
                                <Building2 className="w-3 h-3 mr-2" /> <SelectValue placeholder="Branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Branches</SelectItem>
                                {branches.map((b: any) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={filters.counter_id || "all"} onValueChange={(v) => updateFilter('counter_id', v)}>
                            <SelectTrigger className="w-[160px] h-9 border-none bg-slate-50 text-xs font-bold">
                                <MonitorSmartphone className="w-3 h-3 mr-2" /> <SelectValue placeholder="Counter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Counters</SelectItem>
                                {counters.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Button onClick={() => router.get(window.location.pathname)} variant="ghost" className="ml-auto text-xs text-slate-400">Clear</Button>
                    </div>
                </Card>

                {/* === METRICS === */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard title="Total Feedback" value={stats.totalFeedbacks} icon={<TrendingUp className="text-emerald-500" />} />
                    <MetricCard title="Average Rating" value={stats.avgRating} icon={<Star className="text-amber-500 fill-current" />} suffix="/ 5.0" />
                    <MetricCard title="Staff Active" value={stats.activeServicers} icon={<Users className="text-blue-500" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* === SERVICER PERFORMANCE === */}
                    <Card className="lg:col-span-2 border-none shadow-sm rounded-[2rem]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase">Servicer Leaderboard</CardTitle>
                            <Badge variant="outline">Sorted by Rating</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {topServicers.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            {s.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{s.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{s.feedbacks_count} Sessions Handled</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Star className="w-4 h-4 text-amber-500 fill-current" />
                                                <span className="font-black text-xl">{Number(s.feedbacks_avg_rating || 0).toFixed(1)}</span>
                                            </div>
                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(s.feedbacks_avg_rating / 5) * 100}%` }}
                                                    className="h-full bg-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* === TRENDING TAGS === */}
                    <Card className="border-none shadow-sm rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <TagIcon className="w-4 h-4" /> Top Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {recentTags?.map((tag: any) => (
                                <div key={tag.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-xs font-bold text-slate-700">#{tag.name}</span>
                                    <Badge className="bg-white text-slate-900 shadow-sm border-none font-black">{tag.feedbacks_count}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* === RECENT COMMENTS === */}
                <Card className="border-none shadow-sm rounded-[2rem]">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase">Detailed Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentComments.map((c: any) => (
                                <div key={c.id} className="p-4 border border-slate-100 rounded-2xl relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-none">
                                            {c.rating} ★
                                        </Badge>
                                        <span className="text-[9px] font-black text-slate-300 uppercase">{c.submitted_at}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 italic">"{c.comment || 'No comment provided'}"</p>
                                    <div className="mt-3 pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                                        Served by: <span className="text-slate-900">{c.user?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function MetricCard({ title, value, icon, suffix = "" }: any) {
    return (
        <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}{suffix}</h3>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
            </CardContent>
        </Card>
    );
}