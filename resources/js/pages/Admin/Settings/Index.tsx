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
import { Upload, Save, Clock, Palette, Globe, Loader2 } from 'lucide-react';

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
    
    const { data, setData, put, processing, errors } = useForm({
        _method: 'PUT',
        app_name: settings.app_name,
        primary_color: settings.primary_color,
        shift_morning_start: settings.shift_morning_start,
        shift_morning_end: settings.shift_morning_end,
        shift_afternoon_start: settings.shift_afternoon_start,
        shift_afternoon_end: settings.shift_afternoon_end,
        logo: null as File | null,
    });

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
        put('/admin/settings', {
            preserveScroll: true,
            onSuccess: () => toast.success('System configuration updated'),
            onError: () => toast.error('Check form for errors'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Configuration" />

            <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">System Core</h1>
                    <p className="text-muted-foreground font-medium italic">Global environment variables and scheduling constraints.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* General Identity Card */}
                    <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card text-card-foreground">
                        <CardHeader className="bg-primary p-10 text-primary-foreground">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black uppercase tracking-[0.2em]">General Identity</CardTitle>
                                    <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest">Visual & Branding Assets</CardDescription>
                                </div>
                                <Globe className="w-12 h-12 text-primary-foreground/20" />
                            </div>
                        </CardHeader>

                        <CardContent className="p-10 space-y-10">
                            {/* App Name */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Application Name</Label>
                                    <p className="text-xs text-muted-foreground/80 italic font-medium">Displayed in browser tabs and emails.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Input 
                                        value={data.app_name} 
                                        onChange={e => setData('app_name', e.target.value)}
                                        className="h-14 rounded-2xl bg-muted border-none text-lg font-bold focus-visible:ring-2 focus-visible:ring-primary transition-all"
                                    />
                                    {errors.app_name && <p className="text-destructive text-xs font-bold mt-2">{errors.app_name}</p>}
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            {/* Logo Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Brand Identity</Label>
                                    <p className="text-xs text-muted-foreground/80 italic font-medium">High-resolution SVG or PNG preferred.</p>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-8">
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-[2rem] bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:border-primary/50">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4 transition-all" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-muted-foreground/30" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Button 
                                            type="button" 
                                            variant="secondary" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                                        >
                                            <Upload className="w-4 h-4" /> Change Logo
                                        </Button>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                        <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] text-center md:text-left ml-1">Limit: 2MB per file</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            {/* Color Picker */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Primary Palette</Label>
                                    <p className="text-xs text-muted-foreground/80 italic font-medium">Main accent color for the interface.</p>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-4">
                                    <div className="relative h-14 flex-1 flex items-center px-4 bg-muted rounded-2xl group transition-all focus-within:ring-2 focus-within:ring-primary">
                                        <Palette className="w-5 h-5 text-muted-foreground/50 mr-3" />
                                        <input 
                                            type="color" 
                                            value={data.primary_color} 
                                            onChange={e => setData('primary_color', e.target.value)}
                                            className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent"
                                        />
                                        <Input 
                                            value={data.primary_color} 
                                            onChange={e => setData('primary_color', e.target.value)}
                                            className="border-none bg-transparent font-mono font-black text-foreground focus-visible:ring-0 uppercase tracking-widest"
                                        />
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl shadow-xl ring-4 ring-background" style={{ backgroundColor: data.primary_color }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shift Times Card */}
                    <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card text-card-foreground">
                        <CardHeader className="bg-muted/50 p-10 border-b border-border">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Shift Operations</CardTitle>
                                    <CardDescription className="font-bold text-[10px] uppercase text-muted-foreground tracking-widest">Define working windows for automation</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Morning Shift */}
                                <div className="space-y-6 group">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-[3px] bg-primary rounded-full" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Morning Window</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-muted-foreground tracking-widest">START</Label>
                                            <Input type="time" value={data.shift_morning_start.substring(0,5)} onChange={e => setData('shift_morning_start', e.target.value + ':00')} className="h-12 rounded-xl bg-muted border-none font-black text-foreground focus-visible:ring-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-muted-foreground tracking-widest">FINISH</Label>
                                            <Input type="time" value={data.shift_morning_end.substring(0,5)} onChange={e => setData('shift_morning_end', e.target.value + ':00')} className="h-12 rounded-xl bg-muted border-none font-black text-foreground focus-visible:ring-primary" />
                                        </div>
                                    </div>
                                </div>

                                {/* Afternoon Shift */}
                                <div className="space-y-6 group">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-[3px] bg-accent rounded-full" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Afternoon Window</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-muted-foreground tracking-widest">START</Label>
                                            <Input type="time" value={data.shift_afternoon_start.substring(0,5)} onChange={e => setData('shift_afternoon_start', e.target.value + ':00')} className="h-12 rounded-xl bg-muted border-none font-black text-foreground focus-visible:ring-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-muted-foreground tracking-widest">FINISH</Label>
                                            <Input type="time" value={data.shift_afternoon_end.substring(0,5)} onChange={e => setData('shift_afternoon_end', e.target.value + ':00')} className="h-12 rounded-xl bg-muted border-none font-black text-foreground focus-visible:ring-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-primary/90 text-primary-foreground text-xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all active:scale-[0.97]"
                    >
                        {processing ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="animate-pulse">Syncing to disk...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Save className="w-7 h-7" /> Save All Configurations
                            </div>
                        )}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}