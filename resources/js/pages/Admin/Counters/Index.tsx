import { useState, useMemo, memo, useEffect } from 'react';
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
import { Plus, Edit, Trash2, Search, RefreshCw, Download, Building2 } from 'lucide-react';
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

const CounterRow = memo(({ counter, onEdit, onDelete, onRegenerate, onExport }: { 
    counter: Counter, 
    onEdit: (c: Counter) => void, 
    onDelete: (id: number) => void,
    onRegenerate: (id: number) => void,
    onExport: (id: number, name: string) => void 
}) => {
    const qrUrl = String(route('servicer.start', { counter_id: counter.id, token: counter.fixed_qr_token }));

    return (
        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group border-b border-border transition-colors hover:bg-muted/30">
            <TableCell className="py-4 font-bold text-foreground">{counter.name}</TableCell>
            <TableCell className="text-muted-foreground">{counter.branch.name}</TableCell>
            <TableCell className="text-center">
                <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    counter.is_active 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                )}>
                    {counter.is_active ? 'Online' : 'Offline'}
                </span>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-border" />)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onRegenerate(counter.id)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex flex-col items-center gap-2 py-2">
                    {/* QR Code always on white for scanner compatibility */}
                    <div className="p-2 bg-white rounded-xl border border-border shadow-sm group-hover:shadow-md transition-shadow">
                        <QRCode id={`qr-svg-${counter.id}`} value={qrUrl} size={48} level="H" />
                    </div>
                    <button 
                        onClick={() => onExport(counter.id, counter.name)}
                        className="text-[10px] font-bold text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                        <Download className="w-3 h-3" /> PNG
                    </button>
                </div>
            </TableCell>
            <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(counter)} className="text-primary hover:bg-primary/10">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(counter.id)} className="text-destructive hover:bg-destructive/10">
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

            <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 p-6 lg:p-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Counters</h1>
                        <p className="text-muted-foreground font-medium italic">Provision secure access tokens and QR identification for service points.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Filter counters..." 
                                className="pl-10 h-12 w-[280px] bg-card border-none rounded-xl shadow-sm focus-visible:ring-ring"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => handleOpenModal()} 
                            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2 font-bold transition-transform active:scale-95"
                        >
                            <Plus className="h-5 w-5" /> Add Counter
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden text-card-foreground">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-none">
                                        <TableHead className="h-14 px-8 font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Identify</TableHead>
                                        <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Branch Location</TableHead>
                                        <TableHead className="text-center font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Status</TableHead>
                                        <TableHead className="text-center font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Secure PIN</TableHead>
                                        <TableHead className="text-center font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Access QR</TableHead>
                                        <TableHead className="text-right pr-8 font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredCounters.map((counter) => (
                                            <CounterRow 
                                                key={counter.id} 
                                                counter={counter}
                                                onEdit={handleOpenModal}
                                                onRegenerate={(id) => confirm('Generate new 6-digit PIN?') && router.post(`/admin/counters/${id}/regenerate-pin`)}
                                                onDelete={(id) => confirm('Permanently delete counter?') && destroy(`/admin/counters/${id}`)}
                                                onExport={exportQRCode}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CREATE/EDIT MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-card text-card-foreground">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const opts = { onSuccess: () => { setIsModalOpen(false); reset(); }, preserveScroll: true };
                        editingCounter ? put(`/admin/counters/${editingCounter.id}`, opts) : post('/admin/counters', opts);
                    }}>
                        <div className="bg-primary p-8 text-primary-foreground">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                {editingCounter ? 'Modify Counter' : 'Initialize Counter'}
                            </DialogTitle>
                            <DialogDescription className="text-primary-foreground/70">Configure terminal identity and security protocols.</DialogDescription>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Branch Assignment</Label>
                                <Select value={data.branch_id} onValueChange={(v) => setData('branch_id', v)}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted border-none focus:ring-ring">
                                        <SelectValue placeholder="Select Branch" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-popover text-popover-foreground">
                                        {branches.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.branch_id && <p className="text-xs font-bold text-destructive">{errors.branch_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Counter Designation</Label>
                                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Front Desk A" className="h-12 rounded-xl bg-muted border-none focus-visible:ring-ring" required />
                                {errors.name && <p className="text-xs font-bold text-destructive">{errors.name}</p>}
                            </div>

                            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">6-Digit Security PIN</Label>
                                        {editingCounter && (
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" id="cpin" checked={data.change_pin} onChange={e => setData('change_pin', e.target.checked)} className="rounded border-secondary/50 accent-secondary" />
                                                <label htmlFor="cpin" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">Update</label>
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
                                        className="h-12 text-center text-xl tracking-[1em] font-black bg-card border-secondary/20 rounded-xl focus-visible:ring-secondary"
                                        placeholder="••••••"
                                    />
                                    {errors.pin && <p className="text-xs font-bold text-destructive">{errors.pin}</p>}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-muted/50 border-t border-border flex flex-row items-center justify-between">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-transparent hover:text-foreground">Cancel</Button>
                            <Button type="submit" disabled={processing} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20">
                                {processing ? 'SAVING...' : editingCounter ? 'UPDATE TERMINAL' : 'INITIALIZE'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}