import { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, MapPin, Phone, Building2, Search } from 'lucide-react';
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

  const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
    name: '',
    address: '',
    contact_phone: '',
  });

  // ✅ Search Filtering (Local performance optimization)
  const filteredBranches = useMemo(() => {
    return branches.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const url = editingBranch ? `/admin/branches/${editingBranch.id}` : '/admin/branches';

    action(url, {
      onSuccess: () => {
        toggleModal(false);
        toast.success(`Branch ${editingBranch ? 'updated' : 'created'}!`);
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

      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Network Nodes</h1>
                <p className="text-slate-500 mt-1 italic">Configure and oversee physical service locations</p>
            </div>
            <Button onClick={() => toggleModal(true)} size="lg" className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
                <Plus className="mr-2 h-5 w-5" /> New Branch
            </Button>
        </div>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="border-b bg-white/80 py-4">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Quick find branch..." 
                    className="pl-10 bg-slate-50 border-none rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[80px] font-bold py-5 pl-8">ID</TableHead>
                  <TableHead className="font-bold">Branch Identity</TableHead>
                  <TableHead className="font-bold">Location Details</TableHead>
                  <TableHead className="text-right font-bold pr-8">Management</TableHead>
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
                        className="group hover:bg-blue-50/30 transition-colors border-b border-slate-100"
                    >
                        <TableCell className="pl-8 font-mono text-slate-400">#{branch.id}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-slate-800">{branch.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                {branch.address || <span className="text-slate-300 italic">No address provided</span>}
                            </div>
                        </TableCell>

                        <TableCell className="text-right pr-8">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditModal(branch)} className="rounded-xl hover:bg-white hover:shadow-md">
                                    <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setDeletingId(branch.id); setIsDeleteModalOpen(true); }} className="rounded-xl hover:bg-red-50 hover:shadow-md">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </TableCell>
                    </motion.tr>
                    ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Persistence Modal (Create/Edit) */}
      <Dialog open={isModalOpen} onOpenChange={toggleModal}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-slate-900 p-8 text-white">
                <DialogTitle className="text-2xl font-black">{editingBranch ? 'Update Node' : 'Register New Node'}</DialogTitle>
                <DialogDescription className="text-slate-400">Enter the operational details for this location.</DialogDescription>
            </div>
            
            <div className="p-8 space-y-6 bg-white">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-slate-500">Branch Designation</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="e.g. HQ Central" required />
                    {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-xs uppercase tracking-widest font-bold text-slate-500">Geographic Address</Label>
                        <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} className="h-12 bg-slate-50 border-none rounded-xl" placeholder="Full street details" />
                    </div>
                </div>
            </div>

            <DialogFooter className="p-8 bg-slate-50 mt-0">
              <Button type="button" variant="ghost" onClick={() => toggleModal(false)} className="rounded-xl font-bold uppercase tracking-widest text-xs">Dismiss</Button>
              <Button type="submit" disabled={processing} className="rounded-xl h-12 px-8 bg-slate-900 hover:bg-black text-white font-bold shadow-lg shadow-slate-200 transition-all">
                {processing ? 'Processing...' : (editingBranch ? 'Save Changes' : 'Finalize Registration')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fast-Action Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Decommission</DialogTitle>
            <DialogDescription className="py-4 text-slate-600">
                Are you sure you want to remove this branch? <span className="text-red-600 font-bold">This will disconnect all linked counters and historical feedback data immediately.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl">Keep Branch</Button>
            <Button variant="destructive" onClick={confirmDelete} className="rounded-xl shadow-lg shadow-red-100 font-bold">Confirm Deletion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}