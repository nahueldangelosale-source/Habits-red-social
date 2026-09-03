import React, { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from '../LoginPage';
import { Sidebar } from '../Sidebar';
import { ViewSkeleton } from '../ui/ViewSkeleton';
import { RBACProvider } from '../../context/RBACContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AtmosphereBackground } from './AtmosphereBackground';
import { PaymentWall } from '../PaymentWall';
import { DunningBanner } from '../DunningBanner';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { CheckoutInvoice } from '../checkout/CheckoutInvoice';
import { CoachWelcomeWizardModal } from '../onboarding/CoachWelcomeWizardModal';
import { Toaster } from 'react-hot-toast';

export const AppLayout: React.FC = () => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const { calmMode } = useCognitiveLoad();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const location = useLocation();
    const navigate = useNavigate();

    const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.email ? user.email.split('@')[0] : 'Coach'));

    // Coach Initial Welcome Wizard State (se abre automáticamente para nuevos coaches)
    const [isCoachWizardOpen, setIsCoachWizardOpen] = useState(() => {
        return localStorage.getItem('coach_wizard_completed') !== 'true';
    });

    // Temporary State for Testing Checkout
    const [showCheckout, setShowCheckout] = useState(false);

    // Payment Required Wall (Bypassed in Open Beta Usability)
    const [showPaymentWall, setShowPaymentWall] = useState(false);

    // Focus Mode (Ctrl+K)
    const [isFocusMode, setIsFocusMode] = useState(false);

    useEffect(() => {
        const handlePaymentRequired = () => {
            // Open Beta mode: keep access open without paywall blocks
            console.log('Payment required event - bypassed for usability testing');
        };
        window.addEventListener('app:payment-required', handlePaymentRequired);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsFocusMode(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('app:payment-required', handlePaymentRequired);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (isLoading) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-indigo-400">LOADING SYSTEM...</div>;
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
            <RBACProvider>
                {/* GLOBAL TOAST ENGINE */}
                <Toaster 
                    position="bottom-right" 
                    toastOptions={{
                        className: 'toast-glass font-medium shadow-2xl',
                        style: {
                            maxWidth: '500px'
                        }
                    }} 
                />

                {/* ATMOSPHERE ENGINE */}
                {!isClinical && <AtmosphereBackground />}
                
                {/* STATEFUL GLOW ENGINE (Aura de Cristal) */}
                {isClinical && (
                    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                        {/* El color puede ser pasado por props o estado global después. Por defecto: Verde Menta (isClinical healthy state) */}
                        <div className="stateful-glow-orb bottom-[-200px] left-[-200px]" style={{ backgroundColor: '#a7f3d0' }} />
                        <div className="stateful-glow-orb top-[-200px] right-[-200px]" style={{ backgroundColor: '#fbc2eb', opacity: 0.1 }} />
                    </div>
                )}

                {/* Checkout Modal Overlay Test */}
                <AnimatePresence>
                    {showCheckout && (
                        <Suspense fallback={null}>
                            <CheckoutInvoice
                                amount={45000}
                                coachName="Dr. Alex Fit"
                                planName="Plan Transformación 90 Días"
                                onConfirm={() => {
                                    alert("🔒 Redirigiendo a Mercado Pago Seguro...");
                                    setShowCheckout(false);
                                }}
                                onClose={() => setShowCheckout(false)}
                            />
                        </Suspense>
                    )}
                </AnimatePresence>

                {/* Payment Required Wall Overlay (HTTP 402) */}
                <AnimatePresence>
                    {showPaymentWall && <PaymentWall />}
                </AnimatePresence>

                {/* Coach Initial Pedagogical Welcome Wizard */}
                <CoachWelcomeWizardModal
                    isOpen={isCoachWizardOpen}
                    onClose={() => setIsCoachWizardOpen(false)}
                    coachName={displayName}
                />

                <div className={`app-container relative z-10 min-h-screen transition-all duration-1000 has-sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''
                    } ${isClinical ? 'bg-clinical-mesh' : calmMode ? 'bg-slate-950 text-slate-400' : 'bg-transparent'
                    }`}>

                    {/* FINOPS DUNNING BANNER (Phase 18) */}
                    <DunningBanner />

                    <div className={`transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <Sidebar
                            isCollapsed={isSidebarCollapsed}
                            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        />
                    </div>

                    <main className={`main-content transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isFocusMode ? 'ml-0 w-full' : (isSidebarCollapsed ? 'ml-20' : 'ml-72')} flex-1`}>
                        {/* Views wrapped in Suspense for lazy loading */}
                        <Suspense fallback={<ViewSkeleton />}>
                            <Outlet />
                        </Suspense>
                    </main>
                </div>
            </RBACProvider>
    );
};
