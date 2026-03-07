import { usePage } from '@inertiajs/react';

interface SystemSettings {
    app_name: string;
    logo: string | null;
    primary_color: string;
    // Add other properties as needed
}

export function useSettings() {
    const { props } = usePage();
    
    // We cast the props to our expected shape
    const system = props.system as SystemSettings;

    console.log('System Settings from Inertia Props:', system);

    return {
        name: system?.app_name || 'Laravel',
        logo: system?.logo,
        color: system?.primary_color || '#3b82f6',
        // Example: logic to check if it's currently morning shift
        isMorning: () => {
             /* logic here */ 
        }
    };
}