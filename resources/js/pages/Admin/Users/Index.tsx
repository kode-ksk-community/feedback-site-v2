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
import { Plus, Edit, Trash2, User, ShieldCheck, Mail } from 'lucide-react';
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

// Roles now use semantic secondary and accent colors from app.css
const ROLE_CONFIG = {
    servicer: { label: 'Servicer', color: 'bg-muted text-muted-foreground border-border' },
    manager: { label: 'Manager', color: 'bg-primary/10 text-primary border-primary/20' },
    admin: { label: 'Admin', color: 'bg-accent text-accent-foreground border-accent/20' },
    superadmin: { label: 'Super Admin', color: 'bg-secondary/20 text-secondary border-secondary/50' },
} as const;

const UserRow = memo(({ user, onEdit, onDelete }: { user: UserType, onEdit: (u: UserType) => void, onDelete: (id: number) => void }) => {
    const role = ROLE_CONFIG[user.role];

    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group border-b border-border transition-colors hover:bg-muted/30 last:border-0"
        >
            <TableCell className="py-4 px-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-card group-hover:shadow-sm transition-all border border-transparent group-hover:border-border">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground tracking-tight">{user.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                        </span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${role.color}`}>
                    {role.label}
                </span>
            </TableCell>
            <TableCell className="text-right px-6">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)} className="h-8 w-8 text-primary hover:bg-primary/10">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
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
            password: '', 
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">User Control</h1>
                        <p className="text-muted-foreground font-medium italic">Manage team members and their access levels.</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Add User
                    </Button>
                </div>

                <Card className="rounded-[2rem] overflow-hidden shadow-sm border-none bg-card text-card-foreground">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-none">
                                    <TableHead className="font-black text-muted-foreground uppercase text-[11px] tracking-[0.2em] px-8 h-14">User Details</TableHead>
                                    <TableHead className="font-black text-muted-foreground uppercase text-[11px] tracking-[0.2em] h-14">Access Role</TableHead>
                                    <TableHead className="text-right font-black text-muted-foreground uppercase text-[11px] tracking-[0.2em] px-8 h-14">Actions</TableHead>
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
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-card text-card-foreground">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-primary p-8 text-primary-foreground">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                {editingUser ? 'Update Profile' : 'Register User'}
                            </DialogTitle>
                            <DialogDescription className="text-primary-foreground/70 font-medium">
                                {editingUser ? 'Modify profile and permissions.' : 'Grant a new member access to the platform.'}
                            </DialogDescription>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Full Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-none bg-muted focus-visible:ring-primary text-base font-semibold"
                                />
                                {errors.name && <p className="text-xs font-bold text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Email Address</Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-none bg-muted focus-visible:ring-primary text-base font-semibold"
                                />
                                {errors.email && <p className="text-xs font-bold text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                                    {editingUser ? 'New Password (Optional)' : 'Security Password'}
                                </Label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required={!editingUser}
                                    className="h-12 rounded-xl border-none bg-muted focus-visible:ring-primary text-base font-semibold"
                                />
                                {errors.password && <p className="text-xs font-bold text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Role Assignment</Label>
                                <Select value={data.role} onValueChange={(v: any) => setData('role', v)}>
                                    <SelectTrigger className="h-12 border-none bg-muted rounded-xl focus:ring-primary font-semibold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground shadow-xl">
                                        <SelectItem value="servicer" className="focus:bg-primary focus:text-primary-foreground">Servicer</SelectItem>
                                        <SelectItem value="manager" className="focus:bg-primary focus:text-primary-foreground">Manager</SelectItem>
                                        <SelectItem value="admin" className="focus:bg-primary focus:text-primary-foreground">Admin</SelectItem>
                                        <SelectItem value="superadmin" className="focus:bg-primary focus:text-primary-foreground">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="p-8 bg-muted/50 border-t border-border flex flex-row items-center justify-between">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-transparent">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20">
                                {processing ? 'SAVING...' : editingUser ? 'UPDATE USER' : 'CREATE USER'}
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
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">Revoke Access?</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm font-medium">
                                This user will lose all access immediately. Historical data linked to this user will be preserved.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex w-full gap-3 mt-6">
                            <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold uppercase text-xs text-muted-foreground" onClick={() => setIsDeleteModalOpen(false)}>
                                Keep User
                            </Button>
                            <Button className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black uppercase text-xs shadow-lg shadow-destructive/20" onClick={confirmDelete} disabled={processing}>
                                Revoke
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}