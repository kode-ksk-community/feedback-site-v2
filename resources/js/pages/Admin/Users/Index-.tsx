import { useState, memo, useCallback, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Users & Servicers', href: '/admin/users' },
];

interface User {
    id: number;
    full_name: string;
    username: string;
    email: string;
    role: string;
    branch?: { id: number; name: string };
    is_active: boolean;
}

interface Props {
    users: User[];
    branches: { id: number; name: string }[];
}

// ✅ Performance: Memoized Row component to prevent re-renders when parent state (modals/form) changes
const UserRow = memo(({ user, onEdit, onDelete }: { user: User, onEdit: (u: User) => void, onDelete: (id: number) => void }) => (
    <motion.tr 
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="group hover:bg-slate-50/80 transition-colors"
    >
        <TableCell className="font-semibold text-slate-900">{user.full_name}</TableCell>
        <TableCell className="text-slate-500">{user.username}</TableCell>
        <TableCell>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 uppercase tracking-wider border border-blue-100">
                <ShieldCheck className="w-3 h-3" /> {user.role.replace('_', ' ')}
            </span>
        </TableCell>
        <TableCell className="font-medium text-slate-600">{user.branch?.name || <span className="text-slate-300">—</span>}</TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className={`text-xs font-bold uppercase ${user.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
        </TableCell>
        <TableCell className="text-right">
            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => onEdit(user)} className="h-8 w-8 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)} className="h-8 w-8 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></Button>
            </div>
        </TableCell>
    </motion.tr>
));

export default function UsersIndex({ users, branches }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        full_name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'servicer',
        branch_id: '',
        is_active: true,
    });

    const openCreate = useCallback(() => {
        clearErrors();
        setEditingUser(null);
        reset();
        setIsModalOpen(true);
    }, [reset, clearErrors]);

    const openEdit = useCallback((user: User) => {
        clearErrors();
        setEditingUser(user);
        setData({
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            role: user.role,
            branch_id: user.branch?.id.toString() || '',
            is_active: user.is_active,
            password: '',
            password_confirmation: '',
        });
        setIsModalOpen(true);
    }, [setData, clearErrors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                toast.success(editingUser ? 'User updated' : 'User created');
            },
            preserveScroll: true,
        };
        editingUser ? put(`/admin/users/${editingUser.id}`, options) : post('/admin/users', options);
    };

    const confirmDelete = () => {
        if (!deletingId) return;
        router.delete(`/admin/users/${deletingId}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeletingId(null);
                toast.success('User removed');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Access Management" />
            <div className="mx-auto max-w-7xl p-6 lg:p-10 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Users & Servicers</h1>
                        <p className="text-slate-500">Manage permissions and branch assignments for your team.</p>
                    </div>
                    <Button onClick={openCreate} size="lg" className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 gap-2 font-bold transition-transform active:scale-95">
                        <Plus className="h-5 w-5" /> Add New User
                    </Button>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-none">
                                    <TableHead className="h-14 font-bold text-slate-400 uppercase text-[11px] tracking-widest pl-6">Full Name</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-widest">Username</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-widest">Role</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-widest">Branch</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase text-[11px] tracking-widest">Status</TableHead>
                                    <TableHead className="text-right pr-6 font-bold text-slate-400 uppercase text-[11px] tracking-widest w-[120px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {users.map((user) => (
                                        <UserRow key={user.id} user={user} onEdit={openEdit} onDelete={(id) => { setDeletingId(id); setIsDeleteModalOpen(true); }} />
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-slate-900 p-8 text-white">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                {editingUser ? 'Edit Identity' : 'Create Identity'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">Configure access levels and credentials.</DialogDescription>
                        </div>
                        
                        <div className="p-8 grid grid-cols-2 gap-6">
                            <div className="col-span-1 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                                <Input value={data.full_name} onChange={(e) => setData('full_name', e.target.value)} className="h-11 rounded-xl bg-slate-50 border-none" required />
                                {errors.full_name && <p className="text-xs text-rose-500 font-bold">{errors.full_name}</p>}
                            </div>
                            <div className="col-span-1 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</Label>
                                <Input value={data.username} onChange={(e) => setData('username', e.target.value)} className="h-11 rounded-xl bg-slate-50 border-none" required />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="h-11 rounded-xl bg-slate-50 border-none" required />
                            </div>

                            {!editingUser && (
                                <>
                                    <div className="col-span-1 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                                        <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="h-11 rounded-xl bg-slate-50 border-none" />
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm</Label>
                                        <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="h-11 rounded-xl bg-slate-50 border-none" />
                                    </div>
                                </>
                            )}

                            <div className="col-span-1 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Role</Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="contributor">Contributor</SelectItem>
                                        <SelectItem value="servicer">Servicer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Branch</Label>
                                <Select value={data.branch_id} onValueChange={(v) => setData('branch_id', v)}>
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none">
                                        <SelectValue placeholder="Headquarters" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {branches.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
                                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" id="is_active" />
                                <Label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer uppercase tracking-tight">Account is Active</Label>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50 border-t flex flex-row items-center justify-between">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Cancel</Button>
                            <Button type="submit" disabled={processing} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-black shadow-lg shadow-slate-200 transition-all">
                                {processing ? 'SYNCING...' : editingUser ? 'UPDATE USER' : 'CREATE USER'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="rounded-[2rem] p-8 border-none shadow-2xl max-w-sm">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Revoke Access?</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">This user will lose all system access immediately. This cannot be undone.</DialogDescription>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-slate-200">Keep User</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-100">Confirm</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}