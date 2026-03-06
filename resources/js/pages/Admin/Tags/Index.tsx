import { useState, memo, useCallback } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Tags', href: '/admin/tags' },
];

interface Tag {
    id: number;
    name: string;
    level: 1 | 2 | 3 | 4 | 5;
    creator?: { full_name: string };
}

interface Props {
    tags: Tag[];
}

// LEVELS now use semantic classes from your app.css
const LEVELS = [
    { value: 1, label: 'Terrible', emoji: '😠', activeClass: 'bg-destructive/10 text-destructive border-destructive/50' },
    { value: 2, label: 'Bad', emoji: '☹️', activeClass: 'bg-secondary/10 text-secondary border-secondary/50' },
    { value: 3, label: 'Okay', emoji: '😐', activeClass: 'bg-muted text-muted-foreground border-border' },
    { value: 4, label: 'Good', emoji: '😊', activeClass: 'bg-primary/10 text-primary border-primary/50' },
    { value: 5, label: 'Great', emoji: '🤩', activeClass: 'bg-primary/20 text-primary border-primary font-black' },
] as const;

const TagRow = memo(({ tag, onEdit, onDelete }: { tag: Tag, onEdit: (t: Tag) => void, onDelete: (id: number) => void }) => {
    const level = LEVELS.find(l => l.value === tag.level);

    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group border-b border-border transition-colors hover:bg-muted/30 last:border-0"
        >
            <TableCell className="py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-card group-hover:shadow-sm transition-all border border-transparent group-hover:border-border">
                        <TagIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-foreground">{tag.name}</span>
                </div>
            </TableCell>
            <TableCell>
                {level && (
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${level.activeClass}`}>
                        {level.emoji} {level.label}
                    </span>
                )}
            </TableCell>
            <TableCell className="text-muted-foreground font-medium text-sm">
                {tag.creator?.full_name || <span className="text-muted/60 italic text-xs">System</span>}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(tag)} className="h-8 w-8 text-primary hover:bg-primary/10">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(tag.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
        </motion.tr>
    );
});

export default function TagsIndex({ tags }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        name: '',
        level: 3 as 1 | 2 | 3 | 4 | 5,
    });

    const handleOpenCreate = useCallback(() => {
        clearErrors();
        setEditingTag(null);
        reset();
        setIsModalOpen(true);
    }, [clearErrors, reset]);

    const handleOpenEdit = useCallback((tag: Tag) => {
        clearErrors();
        setEditingTag(tag);
        setData({
            name: tag.name,
            level: tag.level,
        });
        setIsModalOpen(true);
    }, [clearErrors, setData]);

    const handleOpenDelete = useCallback((id: number) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
            preserveScroll: true,
        };
        editingTag ? put(`/admin/tags/${editingTag.id}`, options) : post('/admin/tags', options);
    };

    const confirmDelete = () => {
        if (!deletingId) return;
        destroy(`/admin/tags/${deletingId}`, {
            onSuccess: () => setIsDeleteModalOpen(false),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedback Tags" />

            <div className="mx-auto max-w-5xl p-6 lg:p-10 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">Feedback Tags</h1>
                        <p className="text-muted-foreground font-medium italic">Define rapid-response options for customer surveys.</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Tag
                    </Button>
                </div>

                <Card className="rounded-[2rem] overflow-hidden shadow-sm border-none bg-card text-card-foreground">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-none">
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest px-8">Label</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Rating Level</TableHead>
                                    <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest">Source</TableHead>
                                    <TableHead className="text-right font-bold text-muted-foreground uppercase text-[11px] tracking-widest px-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {tags.map(tag => (
                                        <TagRow key={tag.id} tag={tag} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-card text-card-foreground">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-primary p-8 text-primary-foreground">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                {editingTag ? 'Modify Tag' : 'Initialize Tag'}
                            </DialogTitle>
                            <DialogDescription className="text-primary-foreground/70">
                                Tags help categorize feedback for deeper analytics.
                            </DialogDescription>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Tag Label</Label>
                                <Input
                                    placeholder="e.g. Friendly Staff"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-none bg-muted focus-visible:ring-primary text-lg font-medium"
                                />
                                {errors.name && <p className="text-xs font-bold text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Sentiment Level</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {LEVELS.map((level) => {
                                        const isActive = data.level === level.value;
                                        return (
                                            <button
                                                key={level.value}
                                                type="button"
                                                onClick={() => setData('level', level.value)}
                                                className={`
                                                    flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all
                                                    ${isActive 
                                                        ? `${level.activeClass} border-current scale-105 shadow-md` 
                                                        : 'border-muted hover:border-border text-muted-foreground/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                                    }
                                                `}
                                            >
                                                <span className="text-2xl leading-none">{level.emoji}</span>
                                                <span className="text-[9px] font-black uppercase tracking-tighter leading-none text-center">
                                                    {level.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.level && <p className="text-xs font-bold text-destructive">{errors.level}</p>}
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-muted/50 border-t border-border flex flex-row items-center justify-between">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-transparent">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20">
                                {processing ? 'SAVING...' : editingTag ? 'UPDATE TAG' : 'CREATE TAG'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-sm rounded-[2rem] p-8 bg-card border-none shadow-2xl">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-destructive/10 text-destructive rounded-full">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">Delete Tag?</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm">
                                This will permanently remove this tag. Survey results already using this tag will be affected.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex w-full gap-3 mt-6">
                            <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold uppercase text-xs text-muted-foreground" onClick={() => setIsDeleteModalOpen(false)}>
                                Keep it
                            </Button>
                            <Button className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold uppercase text-xs shadow-lg shadow-destructive/20" onClick={confirmDelete} disabled={processing}>
                                Yes, Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}