import { useState, memo, useCallback } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, User, ShieldCheck, AlertCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'User Management', href: '/admin/users' },
];

interface UserType {
    id: number;
    name: string;
    email: string;
    role: 'servicer' | 'manager' | 'admin' | 'superadmin';
}

interface Props {
    users: UserType[];
}

const ROLE_CONFIG = {
    servicer: { label: 'Servicer', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    manager: { label: 'Manager', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    admin: { label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-100' },
    superadmin: { label: 'Super Admin', color: 'bg-rose-50 text-rose-700 border-rose-100' },
} as const;

const UserRow = memo(({ user, onEdit, onDelete }: { user: UserType, onEdit: (u: UserType) => void, onDelete: (id: number) => void }) => {
    const role = ROLE_CONFIG[user.role];

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
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{user.name}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${role.color}`}>
                    {role.label}
                </span>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)} className="h-8 w-8 text-rose-600 hover:bg-rose-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
        </motion.tr>
    );
});

export default function UserManagementIndex({ users }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'servicer' as UserType['role'],
    });

    const handleOpenCreate = useCallback(() => {
        clearErrors();
        setEditingUser(null);
        reset();
        setIsModalOpen(true);
    }, [clearErrors, reset]);

    const handleOpenEdit = useCallback((user: UserType) => {
        clearErrors();
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '', // Keep empty for edits
            role: user.role,
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
        editingUser ? put(`/admin/users/${editingUser.id}`, options) : post('/admin/users', options);
    };

    const confirmDelete = () => {
        if (!deletingId) return;
        destroy(`/admin/users/${deletingId}`, {
            onSuccess: () => setIsDeleteModalOpen(false),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="mx-auto max-w-5xl p-6 lg:p-10 space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">User Control</h1>
                        <p className="text-slate-500">Manage team members and their access levels.</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-black transition-all">
                        <Plus className="w-5 h-5 mr-2" />
                        Add User
                    </Button>
                </div>

                <Card className="rounded-3xl overflow-hidden shadow-sm border-slate-200">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="font-bold">User Details</TableHead>
                                    <TableHead className="font-bold">Access Role</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {users.map(user => (
                                        <UserRow key={user.id} user={user} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />
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
                                {editingUser ? 'Edit User' : 'Register User'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                {editingUser ? 'Modify profile and permissions.' : 'Grant a new member access to the platform.'}
                            </DialogDescription>
                        </div>

                        <div className="p-8 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs font-bold uppercase tracking-widest">Full Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    className="h-11 rounded-xl border-slate-200"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs font-bold uppercase tracking-widest">Email Address</Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                    className="h-11 rounded-xl border-slate-200"
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs font-bold uppercase tracking-widest">
                                    {editingUser ? 'New Password (Optional)' : 'Security Password'}
                                </Label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required={!editingUser}
                                    className="h-11 rounded-xl border-slate-200"
                                />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs font-bold uppercase tracking-widest">Role Assignment</Label>
                                <Select value={data.role} onValueChange={(v: any) => setData('role', v)}>
                                    <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="servicer">Servicer</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="superadmin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50 border-t flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="rounded-xl h-12 px-8 bg-slate-900 hover:bg-black font-bold">
                                {processing ? 'Processing...' : editingUser ? 'Update Profile' : 'Create User'}
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
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase text-slate-900">Revoke Access?</DialogTitle>
                            <DialogDescription className="text-slate-500 text-base">
                                This user will lose all access immediately. Historical data linked to this user will be preserved.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex w-full gap-3 mt-6">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsDeleteModalOpen(false)}>
                                Keep User
                            </Button>
                            <Button variant="destructive" className="flex-1 h-12 rounded-xl bg-rose-600" onClick={confirmDelete} disabled={processing}>
                                Revoke
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}