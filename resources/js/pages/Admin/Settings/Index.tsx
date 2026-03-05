import { useState, useRef, useEffect, useCallback } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { Upload, Save, Clock, Palette, Globe } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'System Settings', href: '/admin/settings' },
];

interface Settings {
    app_name: string;
    logo_url: string | null;
    primary_color: string;
    shift_morning_start: string;
    shift_morning_end: string;
    shift_afternoon_start: string;
    shift_afternoon_end: string;
}

interface Props {
    settings: Settings;
}

export default function SystemSettings({ settings }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.logo_url ? `/storage/${settings.logo_url}` : null
    );
    
    const { data, setData, post, put,  processing, errors } = useForm({
        _method: 'PUT', // Method spoofing for secure file uploads
        app_name: settings.app_name,
        primary_color: settings.primary_color,
        shift_morning_start: settings.shift_morning_start,
        shift_morning_end: settings.shift_morning_end,
        shift_afternoon_start: settings.shift_afternoon_start,
        shift_afternoon_end: settings.shift_afternoon_end,
        logo: null as File | null,
    });

    // ✅ Performance: Cleanup Object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File too large (Max 2MB)');
                return;
            }
            setData('logo', file);
            const url = URL.createObjectURL(file);
            setLogoPreview(url);
        }
    }, [setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use POST with _method spoofing for reliable file uploads
        put('/admin/settings', {
            preserveScroll: true,
            onSuccess: () => toast.success('System configuration updated'),
            onError: () => toast.error('Check form for errors'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Configuration" />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">System Core</h1>
                    <p className="text-slate-500 font-medium">Global environment variables and scheduling constraints.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black uppercase tracking-widest">General Identity</CardTitle>
                                    <CardDescription className="text-slate-400 font-bold uppercase text-[10px]">Visual & Branding Assets</CardDescription>
                                </div>
                                <Globe className="w-10 h-10 text-slate-700" />
                            </div>
                        </CardHeader>

                        <CardContent className="p-10 space-y-10">
                            {/* App Name */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-black uppercase tracking-tighter text-slate-400">Application Name</Label>
                                    <p className="text-xs text-slate-500">Displayed in browser tabs and emails.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Input 
                                        value={data.app_name} 
                                        onChange={e => setData('app_name', e.target.value)}
                                        className="h-14 rounded-2xl bg-slate-50 border-none text-lg font-bold focus:ring-2 focus:ring-slate-900 transition-all"
                                    />
                                    {errors.app_name && <p className="text-rose-500 text-xs font-bold mt-2">{errors.app_name}</p>}
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Logo Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-black uppercase tracking-tighter text-slate-400">Brand Identity</Label>
                                    <p className="text-xs text-slate-500">High-resolution SVG or PNG preferred.</p>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-8">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <Upload className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-11 px-6 rounded-xl border-slate-200 font-bold gap-2 hover:bg-slate-900 hover:text-white transition-all"
                                        >
                                            <Upload className="w-4 h-4" /> Change Logo
                                        </Button>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center md:text-left">Max size: 2MB</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Color Picker */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-black uppercase tracking-tighter text-slate-400">Primary Palette</Label>
                                    <p className="text-xs text-slate-500">Main accent color for the interface.</p>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-4">
                                    <div className="relative h-14 flex-1 flex items-center px-4 bg-slate-50 rounded-2xl group">
                                        <Palette className="w-5 h-5 text-slate-400 mr-3" />
                                        <input 
                                            type="color" 
                                            value={data.primary_color} 
                                            onChange={e => setData('primary_color', e.target.value)}
                                            className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent"
                                        />
                                        <Input 
                                            value={data.primary_color} 
                                            onChange={e => setData('primary_color', e.target.value)}
                                            className="border-none bg-transparent font-mono font-bold text-slate-600 focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl shadow-inner border-4 border-white" style={{ backgroundColor: data.primary_color }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shift Times Card */}
                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-slate-50 p-10 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-900">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Shift Operations</CardTitle>
                                    <CardDescription className="font-bold text-[10px] uppercase text-slate-400">Define working windows for automation</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Morning Shift */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-[2px] bg-amber-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Morning Window</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-slate-500">START</Label>
                                            <Input type="time" value={data.shift_morning_start.substring(0,5)} onChange={e => setData('shift_morning_start', e.target.value + ':00')} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-slate-500">FINISH</Label>
                                            <Input type="time" value={data.shift_morning_end.substring(0,5)} onChange={e => setData('shift_morning_end', e.target.value + ':00')} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                                        </div>
                                    </div>
                                </div>

                                {/* Afternoon Shift */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-[2px] bg-indigo-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Afternoon Window</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-slate-500">START</Label>
                                            <Input type="time" value={data.shift_afternoon_start.substring(0,5)} onChange={e => setData('shift_afternoon_start', e.target.value + ':00')} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-slate-500">FINISH</Label>
                                            <Input type="time" value={data.shift_afternoon_end.substring(0,5)} onChange={e => setData('shift_afternoon_end', e.target.value + ':00')} className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="w-full h-20 rounded-[2rem] bg-slate-900 hover:bg-black text-white text-xl font-black uppercase tracking-widest shadow-xl shadow-slate-300 transition-all active:scale-[0.98]"
                    >
                        {processing ? (
                            <span className="animate-pulse">Writing to disk...</span>
                        ) : (
                            <>
                                <Save className="mr-4 w-6 h-6" /> Save All Configurations
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}