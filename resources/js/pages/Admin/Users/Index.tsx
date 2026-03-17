import { useState, memo, useCallback, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Edit,
    Trash2,
    User,
    ShieldCheck,
    Mail,
    Search,
    Eye,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce'; // Recommended: standard debounce hook
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'User Management', href: '/admin/users' },
];

interface UserType {
    id: number;
    name: string;
    email: string;
    role: 'servicer' | 'manager' | 'admin' | 'superadmin';
    created_at?: string;
}

interface Props {
    users: UserType[];
    filters: { search?: string; role?: string };
    branches: any;
}

const ROLE_CONFIG = {
    servicer: {
        label: 'Servicer',
        color: 'bg-muted text-muted-foreground border-border',
    },
    manager: {
        label: 'Manager',
        color: 'bg-primary/10 text-primary border-primary/20',
    },
    admin: {
        label: 'Admin',
        color: 'bg-accent text-accent-foreground border-accent/20',
    },
    superadmin: {
        label: 'Super Admin',
        color: 'bg-secondary/20 text-secondary border-secondary/50',
    },
} as const;

// --- Sub-component: User Row ---
const UserRow = memo(
    ({
        user,
        onEdit,
        onDelete,
        onView,
    }: {
        user: UserType;
        onEdit: (u: UserType) => void;
        onDelete: (id: number) => void;
        onView: (u: UserType) => void;
    }) => {
        const role = ROLE_CONFIG[user.role];

        return (
            <motion.tr
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group border-b border-border transition-colors last:border-0 hover:bg-muted/30"
            >
                <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-transparent bg-muted p-2 text-muted-foreground transition-all group-hover:border-border group-hover:bg-card">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold tracking-tight text-foreground">
                                {user.name}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" /> {user.email}
                            </span>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase ${role.color}`}
                    >
                        {role.label}
                    </span>
                </TableCell>
                <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-muted-foreground hover:bg-muted"
                        >
                            <Link href={route('admin.users.show', { user: user.id })}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        {/* <Button variant="ghost" size="icon" onClick={() => onView(user)} className="h-8 w-8 text-muted-foreground hover:bg-muted">
                        <Eye className="w-4 h-4" />
                    </Button> */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(user)}
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(user.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </TableCell>
            </motion.tr>
        );
    },
);

// --- Main Page Component ---
export default function UserManagementIndex({ users, filters, branches }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState<UserType | null>(null);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Filters
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'servicer' as UserType['role'],
    });

    // Handle Server-side Filtering
    const updateFilters = useCallback(() => {
        router.get(
            '/admin/users',
            { search: search, role: roleFilter },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }, [search, roleFilter]);

    // Trigger update when role changes or search is cleared
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            updateFilters();
        }, 300); // Simple debounce

        return () => clearTimeout(delayDebounceFn);
    }, [search, roleFilter, updateFilters]);

    // Actions
    const handleOpenCreate = () => {
        clearErrors();
        setEditingUser(null);
        reset();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: UserType) => {
        clearErrors();
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
            preserveScroll: true,
        };
        editingUser
            ? put(`/admin/users/${editingUser.id}`, options)
            : post('/admin/users', options);
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

            <div className="mx-auto space-y-8 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                            User Control
                        </h1>
                        <p className="font-medium text-muted-foreground italic">
                            Manage team members and their access levels.
                        </p>
                    </div>
                    <Button
                        onClick={handleOpenCreate}
                        className="h-12 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Add User
                    </Button>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col gap-4 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 rounded-xl border-none bg-card pl-11 shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute top-1/2 right-4 -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                        )}
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="h-12 w-full rounded-xl border-none bg-card font-semibold shadow-sm md:w-56">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="servicer">Servicers</SelectItem>
                            <SelectItem value="manager">Managers</SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                            <SelectItem value="superadmin">
                                Super Admins
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card className="overflow-hidden rounded-[2rem] border-none bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-none">
                                    <TableHead className="h-14 px-8 text-[11px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                                        User Details
                                    </TableHead>
                                    <TableHead className="h-14 text-[11px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                                        Access Role
                                    </TableHead>
                                    <TableHead className="h-14 px-8 text-right text-[11px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <UserRow
                                                key={user.id}
                                                user={user}
                                                onEdit={handleOpenEdit}
                                                onDelete={(id) => {
                                                    setDeletingId(id);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                onView={(u) =>
                                                    setViewingUser(u)
                                                }
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="h-32 text-center text-muted-foreground italic"
                                            >
                                                No users found matching your
                                                criteria.
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Preview (Show Detail) Modal */}
            <Dialog
                open={!!viewingUser}
                onOpenChange={() => setViewingUser(null)}
            >
                <DialogContent className="overflow-hidden rounded-[2.5rem] border-none bg-card p-0 shadow-2xl sm:max-w-md">
                    {viewingUser && (
                        <div>
                            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-card bg-card shadow-lg">
                                    <User className="h-10 w-10 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-6 p-8 pt-10 text-center">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black tracking-tight uppercase">
                                        {viewingUser.name}
                                    </h2>
                                    <p className="font-medium text-muted-foreground">
                                        {viewingUser.email}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-border/50 bg-muted/50 p-4 text-left">
                                        <p className="mb-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Level
                                        </p>
                                        <p className="text-sm font-bold text-primary uppercase">
                                            {
                                                ROLE_CONFIG[viewingUser.role]
                                                    .label
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/50 bg-muted/50 p-4 text-left">
                                        <p className="mb-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                            Joined
                                        </p>
                                        <p className="text-sm font-bold">
                                            {new Date(
                                                viewingUser.created_at || '',
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    className="h-12 w-full rounded-xl text-[10px] font-bold tracking-widest uppercase"
                                    onClick={() => setViewingUser(null)}
                                >
                                    Close Preview
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Registration/Edit Modal - (Kept from original with styling refinements) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="overflow-hidden rounded-[2.5rem] border-none bg-card p-0 shadow-2xl sm:max-w-md">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-primary p-8 text-primary-foreground">
                            <DialogTitle className="text-2xl font-black tracking-tight uppercase">
                                {editingUser
                                    ? 'Update Profile'
                                    : 'Register User'}
                            </DialogTitle>
                            <DialogDescription className="font-medium text-primary-foreground/70 italic">
                                {editingUser
                                    ? 'Modify profile and permissions.'
                                    : 'Grant a new member access to the platform.'}
                            </DialogDescription>
                        </div>
                        <div className="space-y-5 p-8">
                            <div className="space-y-2">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Full Name
                                </Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    className="h-12 rounded-xl border-none bg-muted font-semibold focus-visible:ring-primary"
                                />
                                {errors.name && (
                                    <p className="text-xs font-bold text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    className="h-12 rounded-xl border-none bg-muted font-semibold focus-visible:ring-primary"
                                />
                                {errors.email && (
                                    <p className="text-xs font-bold text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    {editingUser
                                        ? 'New Password (Optional)'
                                        : 'Security Password'}
                                </Label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required={!editingUser}
                                    className="h-12 rounded-xl border-none bg-muted font-semibold focus-visible:ring-primary"
                                />
                                {errors.password && (
                                    <p className="text-xs font-bold text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <div>

                                <div className="space-y-2">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                        Role Assignment
                                    </Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(v: any) =>
                                            setData('role', v)
                                        }
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-none bg-muted font-semibold focus:ring-primary">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                                            <SelectItem value="servicer">
                                                Servicer
                                            </SelectItem>
                                            <SelectItem value="manager">
                                                Manager
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                            <SelectItem value="superadmin">
                                                Super Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                        Branch
                                    </Label>
                                    <Select
                                        value={String(data.branch_id)}
                                        onValueChange={(v) => setData('branch_id', v)}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-none bg-muted font-semibold focus:ring-primary">
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                                            {branches.map((b) => (
                                                <SelectItem key={b.id} value={String(b.id)}>
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex flex-row items-center justify-between border-t border-border/50 bg-muted/30 p-8">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-12 rounded-xl bg-primary px-8 font-black text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                            >
                                {processing
                                    ? 'SAVING...'
                                    : editingUser
                                        ? 'UPDATE USER'
                                        : 'CREATE USER'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
            >
                <DialogContent className="rounded-[2rem] border-none bg-card p-8 shadow-2xl sm:max-w-sm">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="rounded-full bg-destructive/10 p-4 text-destructive">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight uppercase">
                                Revoke Access?
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground">
                                This user will lose all access immediately.
                                Historical data will be preserved.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 flex w-full gap-3">
                            <Button
                                variant="ghost"
                                className="h-12 flex-1 rounded-xl text-[10px] font-bold uppercase"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Keep User
                            </Button>
                            <Button
                                className="h-12 flex-1 rounded-xl bg-destructive text-[10px] font-black text-destructive-foreground uppercase shadow-lg shadow-destructive/20 hover:bg-destructive/90"
                                onClick={confirmDelete}
                                disabled={processing}
                            >
                                Revoke
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
