import { useState, useMemo, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, MapPin, Building2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AppLayout from '@/layouts/app-layout';

interface Branch {
    id: number;
    name: string;
    address: string | null;
    contact_phone: string | null;
}

interface Props {
    branches: Branch[];
}

export default function BranchesIndex({ branches }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, reset, errors, clearErrors } =
        useForm({
            name: '',
            address: '',
            contact_phone: '',
        });

    const filteredBranches = useMemo(() => {
        return branches.filter(
            (b) =>
                b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.address?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [branches, searchTerm]);

    const toggleModal = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            reset();
            clearErrors();
            setEditingBranch(null);
        }
    };

    const openEditModal = (branch: Branch) => {
        setEditingBranch(branch);
        setData({
            name: branch.name,
            address: branch.address || '',
            contact_phone: branch.contact_phone || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const action = editingBranch ? put : post;
        const url = editingBranch
            ? `/admin/branches/${editingBranch.id}`
            : '/admin/branches';

        action(url, {
            onSuccess: () => {
                toggleModal(false);
                toast.success(
                    `Branch ${editingBranch ? 'updated' : 'created'}!`,
                );
            },
            preserveScroll: true,
        });
    };

    const confirmDelete = () => {
        if (!deletingId) return;
        router.delete(`/admin/branches/${deletingId}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeletingId(null);
                toast.success('Branch permanently removed');
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Branch Operations" />

            <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-6 lg:p-10">
                {/* === HEADER SECTION === */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
                            Branches
                        </h1>
                        <p className="mt-1 text-muted-foreground italic">
                            Manage company branches, including creating,
                            updating, and organizing branch information
                        </p>{' '}
                    </div>
                    <Button
                        onClick={() => toggleModal(true)}
                        size="lg"
                        className="h-14 rounded-2xl bg-primary px-8 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                    >
                        <Plus className="mr-2 h-5 w-5" /> New Branch
                    </Button>
                </div>

                {/* === MAIN TABLE CARD === */}
                <Card className="overflow-hidden rounded-[2rem] border-none bg-card text-card-foreground shadow-sm">
                    <CardHeader className="border-b border-border bg-card/50 py-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Quick find branch..."
                                className="rounded-xl border-none bg-muted pl-10 focus-visible:ring-ring"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="w-[80px] py-5 pl-8 font-bold text-muted-foreground">
                                            ID
                                        </TableHead>
                                        <TableHead className="font-bold text-muted-foreground">
                                            Branch Identity
                                        </TableHead>
                                        <TableHead className="font-bold text-muted-foreground">
                                            Location Details
                                        </TableHead>
                                        <TableHead className="pr-8 text-right font-bold text-muted-foreground">
                                            Management
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredBranches.map((branch) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={branch.id}
                                                className="group border-b border-border transition-colors hover:bg-muted/30"
                                            >
                                                <TableCell className="pl-8 font-mono text-muted-foreground/60">
                                                    #{branch.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                                            <Building2 className="h-5 w-5" />
                                                        </div>
                                                        <span className="font-bold text-foreground">
                                                            {branch.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="h-4 w-4 text-muted-foreground/50" />
                                                        {branch.address || (
                                                            <span className="text-muted-foreground/40 italic">
                                                                No address
                                                                provided
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="pr-8 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    branch,
                                                                )
                                                            }
                                                            className="rounded-xl text-primary hover:bg-primary/10 hover:text-primary"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setDeletingId(
                                                                    branch.id,
                                                                );
                                                                setIsDeleteModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* === CREATE/EDIT DIALOG === */}
            <Dialog open={isModalOpen} onOpenChange={toggleModal}>
                <DialogContent className="overflow-hidden rounded-[2.5rem] border-none bg-card p-0 text-card-foreground shadow-2xl sm:max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-primary p-8 text-primary-foreground">
                            <DialogTitle className="text-2xl font-black">
                                {editingBranch
                                    ? 'Update Node'
                                    : 'Register New Node'}
                            </DialogTitle>
                            <DialogDescription className="text-primary-foreground/70">
                                Enter the operational details for this location.
                            </DialogDescription>
                        </div>

                        <div className="space-y-6 bg-card p-8">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                                >
                                    Branch Designation
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="h-12 rounded-xl border-none bg-muted focus-visible:ring-ring"
                                    placeholder="e.g. HQ Central"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs font-bold text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="address"
                                    className="text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                                >
                                    Geographic Address
                                </Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    className="h-12 rounded-xl border-none bg-muted focus-visible:ring-ring"
                                    placeholder="Full street details"
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-0 bg-muted/50 p-8">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => toggleModal(false)}
                                className="text-xs font-black tracking-widest text-muted-foreground uppercase hover:bg-transparent hover:text-foreground"
                            >
                                Dismiss
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-12 rounded-xl bg-primary px-8 font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                            >
                                {processing
                                    ? 'Processing...'
                                    : editingBranch
                                      ? 'Save Changes'
                                      : 'Finalize Registration'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* === DELETE CONFIRMATION === */}
            <Dialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
            >
                <DialogContent className="rounded-[2rem] border-none bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            Confirm Decommission
                        </DialogTitle>
                        <DialogDescription className="py-4 text-muted-foreground">
                            Are you sure you want to remove this branch?
                            <span className="mt-2 block font-bold text-destructive">
                                This will disconnect all linked counters and
                                historical feedback data immediately.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="rounded-xl border-border bg-transparent hover:bg-muted"
                        >
                            Keep Branch
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="rounded-xl font-bold shadow-lg shadow-destructive/10"
                        >
                            Confirm Deletion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
