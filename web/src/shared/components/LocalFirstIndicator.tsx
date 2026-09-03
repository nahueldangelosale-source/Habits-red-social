import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, CloudLightning } from 'lucide-react';

export const LocalFirstIndicator: React.FC = () => {
    // states: 'synced', 'syncing', 'offline', 'error'
    const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setSyncState('syncing'); // Try to sync when back online
        };
        const handleOffline = () => {
            setIsOnline(false);
            setSyncState('offline');
        };

        const handleSyncStart = () => setSyncState('syncing');
        const handleSyncComplete = () => {
            setSyncState('synced');
            // Flash success effect conceptually
        };
        const handleSyncError = () => setSyncState('error');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('local-first-sync-start', handleSyncStart);
        window.addEventListener('local-first-sync-complete', handleSyncComplete);
        window.addEventListener('local-first-sync-error', handleSyncError);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('local-first-sync-start', handleSyncStart);
            window.removeEventListener('local-first-sync-complete', handleSyncComplete);
            window.removeEventListener('local-first-sync-error', handleSyncError);
        };
    }, []);

    // Neuroesthetic styling without blocking UI
    let icon;
    let text;
    let bgColor;
    let textColor;

    switch (syncState) {
        case 'offline':
            icon = <CloudOff size={14} />;
            text = "Offline Mode";
            bgColor = "bg-zinc-800/80";
            textColor = "text-zinc-400";
            break;
        case 'syncing':
            icon = <CloudLightning size={14} className="animate-pulse" />;
            text = "Guardando localmente...";
            bgColor = "bg-indigo-500/20";
            textColor = "text-indigo-400";
            break;
        case 'error':
            icon = <CloudOff size={14} />;
            text = "Sync Pausado";
            bgColor = "bg-amber-500/20";
            textColor = "text-amber-500";
            break;
        case 'synced':
        default:
            icon = <Cloud size={14} />;
            text = "0ms Sync";
            bgColor = "bg-emerald-500/10";
            textColor = "text-emerald-500 font-bold opacity-70 hover:opacity-100 transition-opacity";
    }

    if (!isOnline && syncState !== 'offline') {
        setSyncState('offline');
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm shadow-sm transition-colors duration-300 ${bgColor} ${textColor}`}>
            {icon}
            <span className="text-[10px] uppercase tracking-wider font-medium">{text}</span>
        </div>
    );
};
