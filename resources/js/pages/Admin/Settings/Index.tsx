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
import { Upload, Save, Palette, Globe, Loader2, AlertCircle } from 'lucide-react';
import { route } from 'ziggy-js';

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
 * Performance-optimized FormField. 
 * Updated with fluid gap spacing and responsive grid layouts.
 */
const FormField = memo(({ label, htmlFor, error, children, description }: any) => (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-8 items-start">
        <div className="space-y-1">
            <Label htmlFor={htmlFor} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {label}
            </Label>
            {description && <p className="text-xs text-muted-foreground/80 italic font-medium">{description}</p>}
        </div>
        <div className="md:col-span-2 w-full">
            {children}
            {error && (
                <div className="flex items-center gap-1.5 mt-2 text-destructive animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                </div>
            )}
        </div>
    </div>
));

FormField.displayName = 'FormField';

export default function SystemSettings({ settings }: { settings: Settings }) {
    const initialPreview = useMemo(() =>
        settings.logo ? `/storage/${settings.logo}` : null,
        [settings.logo]
    );

    const [logoPreview, setLogoPreview] = useState<string | null>(initialPreview);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        app_name: settings.app_name || '',
        primary_color: settings.primary_color || '#000000',
        shift_morning_start: settings.shift_morning_start || '',
        shift_morning_end: settings.shift_morning_end || '',
        shift_afternoon_start: settings.shift_afternoon_start || '',
        shift_afternoon_end: settings.shift_afternoon_end || '',
        logo: null as File | null,
    });

    useEffect(() => {
        return () => {
            if (logoPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setData(e.target.name as keyof typeof data, e.target.value);
    }, [setData]);

    const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            toast.error('Invalid format. Use PNG, JPG, or SVG.');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('Performance Warning: Image exceeds 2MB limit.');
            e.target.value = '';
            return;
        }

        setData('logo', file);
        setLogoPreview(URL.createObjectURL(file));
    }, [setData]);

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        post(route('superadmin.settings.update', { setting: 1 }), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('System configuration synced successfully');
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: () => toast.error('Validation failed. Please check inputs.'),
        });
    }, [post]);

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="System Configuration" />

            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 md:space-y-10 animate-in fade-in duration-500">
                <header className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase italic">System Core</h1>
                    <p className="text-sm md:text-base text-muted-foreground font-medium italic">High-performance environment variables and scheduling.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-card transition-shadow hover:shadow-primary/10">
                        <CardHeader className="bg-primary p-6 md:p-10 text-primary-foreground flex-row items-center justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-[0.2em]">General Identity</CardTitle>
                                <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">Global Branding Assets</CardDescription>
                            </div>
                            <Globe className="w-8 h-8 md:w-12 md:h-12 text-primary-foreground/20 shrink-0" />
                        </CardHeader>

                        <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10">
                            <FormField
                                label="Application Name"
                                htmlFor="app_name"
                                description="Displayed in browser tabs and SEO meta."
                                error={errors.app_name}
                            >
                                <Input
                                    id="app_name"
                                    name="app_name"
                                    value={data.app_name}
                                    onChange={handleTextChange}
                                    className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-muted border-none text-base md:text-lg font-bold focus-visible:ring-2 focus-visible:ring-primary transition-all"
                                />
                            </FormField>

                            <Separator className="bg-border/50" />

                            <FormField label="Brand Identity" description="Optimized SVG/WebP recommended." error={errors.logo}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                                    <div className="relative group shrink-0">
                                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:border-primary/50">
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo Preview"
                                                    className="w-full h-full object-contain p-3 md:p-4"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <Upload className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground/30" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 md:gap-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleUploadClick}
                                            className="h-10 md:h-11 px-4 md:px-6 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-2 hover:bg-primary hover:text-primary-foreground transition-all w-fit"
                                        >
                                            <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" /> Change Logo
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ALLOWED_MIME_TYPES.join(',')}
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.3em] ml-1">Threshold: 2MB</p>
                                    </div>
                                </div>
                            </FormField>

                            <Separator className="bg-border/50" />

                            <FormField label="Primary Palette" htmlFor="primary_color" description="UI accent system color." error={errors.primary_color}>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="relative h-12 md:h-14 flex-1 flex items-center px-3 md:px-4 bg-muted rounded-xl md:rounded-2xl transition-all focus-within:ring-2 focus-within:ring-primary">
                                        <Palette className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50 mr-2 md:mr-3 shrink-0" />
                                        <input
                                            type="color"
                                            name="primary_color"
                                            value={data.primary_color}
                                            onChange={handleTextChange}
                                            className="w-6 h-6 md:w-8 md:h-8 rounded md:rounded-lg border-none cursor-pointer bg-transparent mr-2 shrink-0 p-0"
                                        />
                                        <Input
                                            id="primary_color"
                                            name="primary_color"
                                            value={data.primary_color}
                                            onChange={handleTextChange}
                                            className="border-none bg-transparent font-mono font-black text-sm md:text-base text-foreground focus-visible:ring-0 uppercase tracking-widest w-full px-0"
                                        />
                                    </div>
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl shadow-xl ring-2 md:ring-4 ring-background transition-colors duration-300 shrink-0" style={{ backgroundColor: data.primary_color }} />
                                </div>
                            </FormField>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full h-16 md:h-24 rounded-2xl md:rounded-[2.5rem] bg-primary hover:bg-primary/90 text-primary-foreground text-base md:text-xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl md:shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {processing ? (
                            <div className="flex items-center gap-2 md:gap-3">
                                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
                                <span className="animate-pulse">Optimizing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 md:gap-4">
                                <Save className="w-5 h-5 md:w-7 md:h-7" /> Save Configurations
                            </div>
                        )}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}


{/* <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card">
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
                    </Card> */}