import { useState, useMemo, memo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, QrCode as QrIcon, RefreshCw, Download, ShieldCheck, Checkbox } from 'lucide-react';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Counters', href: '/admin/counters' }];

interface Counter {
    id: number;
    name: string;
    branch: { id: number; name: string };
    is_active: boolean;
    fixed_qr_token: string;
}

interface Props {
    counters: Counter[];
    branches: { id: number; name: string }[];
}

// ✅ Optimized Row Component to prevent unnecessary QR re-renders
const CounterRow = memo(({ counter, onEdit, onDelete, onRegenerate, onExport }: { 
    counter: Counter, 
    onEdit: (c: Counter) => void, 
    onDelete: (id: number) => void,
    onRegenerate: (id: number) => void,
    onExport: (id: number, name: string) => void 
}) => {
    const qrUrl = String(route('servicer.start', { counter_id: counter.id, token: counter.fixed_qr_token }));

    return (
        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-slate-50/80 transition-colors border-b">
            <TableCell className="py-4 font-bold text-slate-700">{counter.name}</TableCell>
            <TableCell className="text-slate-500">{counter.branch.name}</TableCell>
            <TableCell className="text-center">
                <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    counter.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                    {counter.is_active ? 'Online' : 'Offline'}
                </span>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300" />)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onRegenerate(counter.id)} className="h-8 w-8 text-slate-400 hover:text-blue-600">
                        <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex flex-col items-center gap-2 py-2">
                    <div className="p-2 bg-white rounded-xl border shadow-sm group-hover:shadow-md transition-shadow">
                        <QRCode id={`qr-svg-${counter.id}`} value={qrUrl} size={48} level="H" />
                    </div>
                    <button 
                        onClick={() => onExport(counter.id, counter.name)}
                        className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                        <Download className="w-3 h-3" /> PNG
                    </button>
                </div>
            </TableCell>
            <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(counter)} className="hover:bg-blue-50 text-blue-600">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(counter.id)} className="hover:bg-red-50 text-red-500">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </motion.tr>
    );
});

export default function CountersIndex({ counters, branches }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCounter, setEditingCounter] = useState<Counter | null>(null);

    const { data, setData, post, put, processing, reset, delete: destroy, errors, clearErrors } = useForm({
        branch_id: '',
        name: '',
        pin: '',
        change_pin: false,
        is_active: true,
        update_token: false,
    });

    const filteredCounters = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return counters.filter(c => 
            c.name.toLowerCase().includes(term) || c.branch.name.toLowerCase().includes(term)
        );
    }, [counters, searchTerm]);

    const handleOpenModal = (counter: Counter | null = null) => {
        clearErrors();
        setEditingCounter(counter);
        if (counter) {
            setData({
                branch_id: counter.branch.id.toString(),
                name: counter.name,
                pin: '',
                change_pin: false,
                is_active: counter.is_active,
                update_token: false,
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const exportQRCode = (id: number, name: string) => {
        const svg = document.getElementById(`qr-svg-${id}`) as any;
        if (!svg) return;
        const canvas = document.createElement('canvas');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = 1024; canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 1024, 1024);
                ctx.drawImage(img, 0, 0, 1024, 1024);
                const link = document.createElement('a');
                link.download = `QR_${name.replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Counters" />

            <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Counters</h1>
                        <p className="text-slate-500 font-medium">Provision secure access tokens and QR identification for service points.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Filter nodes..." 
                                className="pl-10 h-12 w-[280px] bg-white border-slate-200 rounded-xl shadow-sm focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => handleOpenModal()} className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 gap-2 font-bold transition-transform active:scale-95">
                            <Plus className="h-5 w-5" /> Add Counter
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-none">
                                    <TableHead className="h-14 px-8 font-bold text-slate-400 uppercase text-[11px] tracking-widest">Identify</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-widest">Branch Location</TableHead>
                                    <TableHead className="text-center font-bold text-slate-400 uppercase text-[11px] tracking-widest">Status</TableHead>
                                    <TableHead className="text-center font-bold text-slate-400 uppercase text-[11px] tracking-widest">Secure PIN</TableHead>
                                    <TableHead className="text-center font-bold text-slate-400 uppercase text-[11px] tracking-widest">Access QR</TableHead>
                                    <TableHead className="text-right pr-8 font-bold text-slate-400 uppercase text-[11px] tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {filteredCounters.map((counter) => (
                                        <CounterRow 
                                            key={counter.id} 
                                            counter={counter}
                                            onEdit={handleOpenModal}
                                            onRegenerate={(id) => confirm('New 6-digit PIN?') && router.post(`/admin/counters/${id}/regenerate-pin`)}
                                            onDelete={(id) => confirm('Delete counter?') && destroy(`/admin/counters/${id}`)}
                                            onExport={exportQRCode}
                                        />
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Optimized Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const opts = { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true };
                        editingCounter ? put(`/admin/counters/${editingCounter.id}`, opts) : post('/admin/counters', opts);
                    }}>
                        <div className="bg-slate-900 p-8 text-white">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                {editingCounter ? 'Modify Node' : 'Initialize Node'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">Configure terminal identity and security protocols.</DialogDescription>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Branch Assignment</Label>
                                <Select value={data.branch_id} onValueChange={(v) => setData('branch_id', v)}>
                                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none">
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {branches.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Counter Designation</Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Front Desk A" className="h-12 rounded-xl bg-slate-50 border-none" required />
                            </div>

                            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">6-Digit Security PIN</Label>
                                        {editingCounter && (
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="cpin" checked={data.change_pin} onChange={e => setData('change_pin', e.target.checked)} className="rounded border-blue-200" />
                                                <label htmlFor="cpin" className="text-[10px] font-bold text-blue-400 uppercase cursor-pointer">Update</label>
                                            </div>
                                        )}
                                    </div>
                                    <Input 
                                        type="password" 
                                        inputMode="numeric" 
                                        maxLength={6} 
                                        disabled={editingCounter && !data.change_pin}
                                        value={data.pin} 
                                        onChange={(e) => setData('pin', e.target.value.replace(/\D/g, ''))} 
                                        className="h-12 text-center text-xl tracking-[1em] font-black bg-white border-blue-100 rounded-xl"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50 border-t flex flex-row items-center justify-between">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Cancel</Button>
                            <Button type="submit" disabled={processing} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-black shadow-lg shadow-slate-200">
                                {processing ? 'SAVING...' : editingCounter ? 'UPDATE TERMINAL' : 'INITIALIZE'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}