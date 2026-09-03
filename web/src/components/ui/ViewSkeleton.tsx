/**
 * ViewSkeleton — Suspense Fallback
 * Animated skeleton screen that matches the app's layout.
 * Reduces perceived latency during lazy chunk downloads.
 */
import React from 'react';

export function ViewSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6 animate-fade-in" style={{ minHeight: '70vh' }}>
            {/* Title skeleton */}
            <div className="skeleton skeleton-title" style={{ width: '35%' }} />

            {/* Subtitle */}
            <div className="skeleton skeleton-text" style={{ width: '55%' }} />

            {/* KPI row */}
            <div className="skeleton-row">
                <div className="skeleton skeleton-card flex-1" style={{ height: '10rem' }} />
                <div className="skeleton skeleton-card flex-1" style={{ height: '10rem' }} />
                <div className="skeleton skeleton-card flex-1" style={{ height: '10rem' }} />
            </div>

            {/* Main content area */}
            <div className="skeleton skeleton-card" style={{ height: '20rem' }} />

            {/* Bottom row */}
            <div className="skeleton-row">
                <div className="skeleton skeleton-card flex-1" style={{ height: '8rem' }} />
                <div className="skeleton skeleton-card flex-1" style={{ height: '8rem' }} />
            </div>
        </div>
    );
}
