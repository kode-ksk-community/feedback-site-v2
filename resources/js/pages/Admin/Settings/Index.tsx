import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import { Upload, Save, Clock, Palette, Globe, Loader2, AlertCircle } from 'lucide-react';
import { route } from 'ziggy-js';

// Constant hoisted outside component to prevent re-allocation
const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'System Settings', href: '/admin/settings' },
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

interface Settings {
    app_name: string;
    logo: string | null;
    primary_color: string;
    shift_morning_start: string;
    shift_morning_end: string;
    shift_afternoon_start: string;
    shift_afternoon_end: string;
}

/**
 * Performance-optimized Input sub-component to prevent 
 * the entire form from re-rendering on every keystroke.
 */
const FormField = memo(({ label, error, children, description }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</Label>
            {description && <p className="text-xs text-muted-foreground/80 italic font-medium">{description}</p>}
        </div>
        <div className="md:col-span-2">
            {children}
            {error && (
                <div className="flex items-center gap-1.5 mt-2 text-destructive animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <p className="text-xs font-bold">{error}</p>
                </div>
            )}
        </div>
    </div>
));

FormField.displayName = 'FormField';

export default function SystemSettings({ settings }: { settings: Settings }) {
    // Memoize storage path
    const initialPreview = useMemo(() => 
        settings.logo ? `/storage/${settings.logo}` : null, 
    [settings.logo]);

    const [logoPreview, setLogoPreview] = useState<string | null>(initialPreview);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'PUT',
        app_name: settings.app_name,
        primary_color: settings.primary_color,
        shift_morning_start: settings.shift_morning_start,
        shift_morning_end: settings.shift_morning_end,
        shift_afternoon_start: settings.shift_afternoon_start,
        shift_afternoon_end: settings.shift_afternoon_end,
        logo: null as File | null,
    });

    // Memory Management: Cleanup ObjectURLs immediately when replaced or unmounted
    useEffect(() => {
        return () => {
            if (logoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            toast.error('Invalid format. Use PNG, JPG, or SVG.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('Performance Warning: Image exceeds 2MB limit.');
            return;
        }

        setData('logo', file);
        const objectUrl = URL.createObjectURL(file);
        setLogoPreview(objectUrl);
    }, [setData]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('superadmin.settings.update', { setting: 1 }), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('System configuration synced successfully');
                // Reset file input only
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: () => toast.error('Validation failed. Please check inputs.'),
        });
    }, [post]);

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="System Configuration" />

            <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
                <header className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">System Core</h1>
                    <p className="text-muted-foreground font-medium italic">High-performance environment variables and scheduling.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card transition-shadow hover:shadow-primary/10">
                        <CardHeader className="bg-primary p-10 text-primary-foreground">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black uppercase tracking-[0.2em]">General Identity</CardTitle>
                                    <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px] tracking-widest">Global Branding Assets</CardDescription>
                                </div>
                                <Globe className="w-12 h-12 text-primary-foreground/20" />
                            </div>
                        </CardHeader>

                        <CardContent className="p-10 space-y-10">
                            <FormField 
                                label="Application Name" 
                                description="Displayed in browser tabs and SEO meta."
                                error={errors.app_name}
                            >
                                <Input 
                                    value={data.app_name} 
                                    onChange={e => setData('app_name', e.target.value)}
                                    className="h-14 rounded-2xl bg-muted border-none text-lg font-bold focus-visible:ring-2 focus-visible:ring-primary transition-all"
                                />
                            </FormField>

                            <Separator className="bg-border/50" />

                            <FormField label="Brand Identity" description="Optimized SVG/WebP recommended." error={errors.logo}>
                                <div className="flex items-center gap-8">
                                    <div className="relative group shrink-0">
                                        <div className="w-28 h-28 rounded-[2rem] bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:border-primary/50">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-4" loading="lazy" />
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
                                            className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                                        >
                                            <Upload className="w-4 h-4" /> Change Logo
                                        </Button>
                                        <input ref={fileInputRef} type="file" accept={ALLOWED_MIME_TYPES.join(',')} className="hidden" onChange={handleLogoChange} />
                                        <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] ml-1">Threshold: 2MB</p>
                                    </div>
                                </div>
                            </FormField>

                            <Separator className="bg-border/50" />

                            <FormField label="Primary Palette" description="UI accent system color." error={errors.primary_color}>
                                <div className="flex items-center gap-4">
                                    <div className="relative h-14 flex-1 flex items-center px-4 bg-muted rounded-2xl transition-all focus-within:ring-2 focus-within:ring-primary">
                                        <Palette className="w-5 h-5 text-muted-foreground/50 mr-3" />
                                        <input 
                                            type="color" 
                                            value={data.primary_color} 
                                            onChange={e => setData('primary_color', e.target.value)}
                                            className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent mr-2"
                                        />
                                        <Input 
                                            value={data.primary_color} 
                                            onChange={e => setData('primary_color', e.target.value)}
                                            className="border-none bg-transparent font-mono font-black text-foreground focus-visible:ring-0 uppercase tracking-widest"
                                        />
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl shadow-xl ring-4 ring-background transition-colors duration-300" style={{ backgroundColor: data.primary_color }} />
                                </div>
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card">
                        <CardHeader className="bg-muted/50 p-10 border-b border-border">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Shift Operations</CardTitle>
                                    <CardDescription className="font-bold text-[10px] uppercase text-muted-foreground tracking-widest">Low-latency time scheduling</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {[
                                    { label: 'Morning Window', start: 'shift_morning_start', end: 'shift_morning_end', color: 'bg-primary' },
                                    { label: 'Afternoon Window', start: 'shift_afternoon_start', end: 'shift_afternoon_end', color: 'bg-orange-500' }
                                ].map((shift) => (
                                    <div key={shift.label} className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-10 h-[3px] ${shift.color} rounded-full`} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{shift.label}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {(['start', 'end'] as const).map((key) => {
                                                const field = key === 'start' ? shift.start : shift.end;
                                                return (
                                                    <div key={field} className="space-y-2">
                                                        <Label className="text-[10px] font-black text-muted-foreground tracking-widest">{key.toUpperCase()}</Label>
                                                        <Input 
                                                            type="time" 
                                                            value={(data[field as keyof typeof data] as string).substring(0, 5)} 
                                                            onChange={e => setData(field as any, e.target.value + ':00')} 
                                                            className="h-12 rounded-xl bg-muted border-none font-black focus-visible:ring-primary" 
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="w-full h-24 rounded-[2.5rem] bg-primary hover:bg-primary/90 text-primary-foreground text-xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {processing ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="animate-pulse">Optimizing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Save className="w-7 h-7" /> Save Configurations
                            </div>
                        )}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}