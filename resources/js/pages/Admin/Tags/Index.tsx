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

const LEVELS = [
    { value: 1, label: 'Terrible', emoji: '😠', activeColor: 'bg-red-500/10 text-red-600 border-red-500/50' },
    { value: 2, label: 'Bad', emoji: '☹️', activeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/50' },
    { value: 3, label: 'Okay', emoji: '😐', activeColor: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/50' },
    { value: 4, label: 'Good', emoji: '😊', activeColor: 'bg-lime-500/10 text-lime-600 border-lime-500/50' },
    { value: 5, label: 'Great', emoji: '🤩', activeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/50' },
] as const;

const TagRow = memo(({ tag, onEdit, onDelete }: { tag: Tag, onEdit: (t: Tag) => void, onDelete: (id: number) => void }) => {
    const level = LEVELS.find(l => l.value === tag.level);

    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group hover:bg-slate-50/50 transition-colors border-b last:border-0"
        >
            <TableCell className="py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <TagIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900">{tag.name}</span>
                </div>
            </TableCell>
            <TableCell>
                {level && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${level.activeColor}`}>
                        {level.emoji} {level.label}
                    </span>
                )}
            </TableCell>
            <TableCell className="text-slate-500 font-medium">
                {tag.creator?.full_name || <span className="text-slate-300 italic">System</span>}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(tag)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(tag.id)} className="h-8 w-8 text-rose-600 hover:bg-rose-50">
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
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black uppercase">Feedback Tags</h1>
                        <p className="text-slate-500">Define rapid-response options for customer surveys.</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-black">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Tag
                    </Button>
                </div>

                <Card className="rounded-3xl overflow-hidden shadow-sm border-slate-200">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="font-bold">Label</TableHead>
                                    <TableHead className="font-bold">Rating Level</TableHead>
                                    <TableHead className="font-bold">Source</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
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
                <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-slate-900 p-8 text-white">
                            <DialogTitle className="text-2xl font-black uppercase">
                                {editingTag ? 'Edit Tag' : 'New Tag'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                This tag will be grouped by its feedback rating.
                            </DialogDescription>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs font-bold uppercase tracking-widest">Tag Label</Label>
                                <Input
                                    placeholder="e.g. Friendly Staff"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-slate-200 focus:ring-slate-900 text-lg"
                                />
                                {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-slate-600 text-xs font-bold uppercase tracking-widest">Sentiment Level</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {LEVELS.map((level) => {
                                        const isActive = data.level === level.value;
                                        return (
                                            <button
                                                key={level.value}
                                                type="button"
                                                onClick={() => setData('level', level.value)}
                                                className={`
                                                    flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all
                                                    ${isActive 
                                                        ? `${level.activeColor} border-current scale-105 shadow-md` 
                                                        : 'border-slate-100 hover:border-slate-200 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                                    }
                                                `}
                                            >
                                                <span className="text-3xl leading-none">{level.emoji}</span>
                                                <span className="text-[10px] font-black uppercase tracking-tight leading-none text-center">
                                                    {level.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.level && <p className="text-sm text-red-500 font-medium">{errors.level}</p>}
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50 border-t flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="rounded-xl h-12 px-8 bg-slate-900 hover:bg-black font-bold">
                                {processing ? 'Saving...' : editingTag ? 'Update Tag' : 'Create Tag'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-sm rounded-3xl p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase text-slate-900">Delete Tag?</DialogTitle>
                            <DialogDescription className="text-slate-500 text-base">
                                This will permanently remove this tag. Survey results already using this tag will be affected.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex w-full gap-3 mt-6">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsDeleteModalOpen(false)}>
                                Keep it
                            </Button>
                            <Button variant="destructive" className="flex-1 h-12 rounded-xl bg-rose-600 font-bold" onClick={confirmDelete} disabled={processing}>
                                Yes, Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}