/**
 * BIENESTAR APP - Professional Wellness Management Platform
 * HYBRID CORE + LIQUID DOCK Navigation
 * 
 * Performance: All views are lazy-loaded (React.lazy + Suspense)
 * Only critical-path components (LoginPage, Sidebar, Atmosphere) are eagerly loaded.
 */

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { ViewSkeleton } from './components/ui/ViewSkeleton';
import { RBACProvider } from './context/RBACContext';
import { LanguageProvider } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';
import './App.css';
import { AtmosphereBackground } from './components/layout/AtmosphereBackground';
import { PaymentWall } from './components/PaymentWall';
import { EntropyVAKProvider } from './contexts/EntropyVAKContext';
import { JoinView } from './components/JoinView';
import { AuthSuccessHandler } from './components/AuthSuccessHandler';
import { DunningBanner } from './components/DunningBanner';
import { useCognitiveLoad } from './hooks/useCognitiveLoad';
import { SimulatorDashboard } from './components/dev/SimulatorDashboard';

// ═══════════════════════════════════════════════════════════════════════════════
// LAZY-LOADED VIEWS (Code-Splitting)
// Each view is a separate chunk — only downloaded when the user navigates to it.
// ═══════════════════════════════════════════════════════════════════════════════

const PatientList = React.lazy(() => import('./components/patients/PatientList').then(m => ({ default: m.PatientList })));
const LabDashboard = React.lazy(() => import('./components/LabDashboard').then(m => ({ default: m.LabDashboard })));
const IntelligentInbox = React.lazy(() => import('./components/IntelligentInbox').then(m => ({ default: m.IntelligentInbox })));
const MagicImport = React.lazy(() => import('./components/MagicImport').then(m => ({ default: m.MagicImport })));
const TenantBranding = React.lazy(() => import('./components/TenantBranding').then(m => ({ default: m.TenantBranding })));
const ReferralDashboard = React.lazy(() => import('./components/ReferralDashboard').then(m => ({ default: m.ReferralDashboard })));
const VoiceToChart = React.lazy(() => import('./components/VoiceToChart').then(m => ({ default: m.VoiceToChart })));
const ShoppablePrescription = React.lazy(() => import('./components/ShoppablePrescription').then(m => ({ default: m.ShoppablePrescription })));
const ContextualInbox = React.lazy(() => import('./components/ContextualInbox').then(m => ({ default: m.ContextualInbox })));
const Gatekeeper = React.lazy(() => import('./components/Gatekeeper').then(m => ({ default: m.Gatekeeper })));
const RevenueGuard = React.lazy(() => import('./components/RevenueGuard').then(m => ({ default: m.RevenueGuard })));
const GamificationBuilder = React.lazy(() => import('./components/coach/GamificationBuilder').then(m => ({ default: m.GamificationBuilder })));
const TheArena = React.lazy(() => import('./components/TheArena').then(m => ({ default: m.TheArena })));
const NutritionDashboard = React.lazy(() => import('./components/NutritionDashboard'));
const NutricionistaDashboard = React.lazy(() => import('./components/NutricionistaDashboard').then(m => ({ default: m.NutricionistaDashboard })));
const DietQAPage = React.lazy(() => import('./pages/DietQAPage').then(m => ({ default: m.DietQAPage })));
const CommandCenter = React.lazy(() => import('./components/CommandCenter').then(m => ({ default: m.CommandCenter })));
const ResourceManagementDashboard = React.lazy(() => import('./pages/CommandCenter/ResourceManagementDashboard').then(m => ({ default: m.ResourceManagementDashboard })));
const ClientHub = React.lazy(() => import('./components/ClientHub').then(m => ({ default: m.ClientHub })));
const DebugChat = React.lazy(() => import('./components/DebugChat').then(m => ({ default: m.DebugChat })));
const MindGym = React.lazy(() => import('./components/MindGym').then(m => ({ default: m.MindGym })));
const ProfessionalsManager = React.lazy(() => import('./components/ProfessionalsManager').then(m => ({ default: m.ProfessionalsManager })));
const CommunicationHub = React.lazy(() => import('./components/CommunicationHub').then(m => ({ default: m.CommunicationHub })));
const ClinicalBentoLayout = React.lazy(() => import('./layouts/ClinicalBentoLayout').then(m => ({ default: m.ClinicalBentoLayout })));
const MenuScanner = React.lazy(() => import('./components/MenuScanner').then(m => ({ default: m.MenuScanner })));
const CheckoutInvoice = React.lazy(() => import('./components/checkout/CheckoutInvoice').then(m => ({ default: m.CheckoutInvoice })));
const AthleteMobileView = React.lazy(() => import('./components/athlete/AthleteMobileView').then(m => ({ default: m.AthleteMobileView })));
const BioSynthesis = React.lazy(() => import('./components/BioSynthesis').then(m => ({ default: m.BioSynthesis })));
const RewardsVault = React.lazy(() => import('./components/tenant/RewardsVault').then(m => ({ default: m.RewardsVault })));
const ReceptionScanner = React.lazy(() => import('./components/tenant/ReceptionScanner').then(m => ({ default: m.ReceptionScanner })));
const FinanceDashboardView = React.lazy(() => import('./components/dashboard/FinanceDashboardView').then(m => ({ default: m.FinanceDashboardView })));
const LibraryDashboard = React.lazy(() => import('./components/LibraryDashboard').then(m => ({ default: m.LibraryDashboard })));
const MasterLibrary = React.lazy(() => import('./pages/MasterLibrary').then(m => ({ default: m.MasterLibrary })));
const ValidationsPage = React.lazy(() => import('./pages/ValidationsPage').then(m => ({ default: m.ValidationsPage })));
const BusinessPage = React.lazy(() => import('./pages/GymOwner/GymOwnerDashboard').then(m => ({ default: m.GymOwnerDashboard })));
const SmartCalendarPage = React.lazy(() => import('./pages/SmartCalendarPage').then(m => ({ default: m.SmartCalendarPage })));
const TrainerSetupWizard = React.lazy(() => import('./components/onboarding/TrainerSetupWizard').then(m => ({ default: m.TrainerSetupWizard })));

// ═══════════════════════════════════════════════════════════════════════════════


const ActiveCanvas = React.lazy(() => import('./components/athlete/ActiveCanvas').then(m => ({ default: m.ActiveCanvas })));
const MagicLinkRedeem = React.lazy(() => import('./components/auth/MagicLinkRedeem').then(m => ({ default: m.MagicLinkRedeem })));
const AthleteMagicLinkForm = React.lazy(() => import('./pages/AthleteOnboarding/AthleteMagicLinkForm'));
const ZeroClientWizard = React.lazy(() => import('./components/onboarding/ZeroClientWizard').then(m => ({ default: m.ZeroClientWizard })));
const ZeroClientWizardPT = React.lazy(() => import('./components/onboarding/ZeroClientWizardPT').then(m => ({ default: m.ZeroClientWizardPT })));
const ClienteCeroNutri = React.lazy(() => import('./components/onboarding/ClienteCeroNutri'));
const PatientLongevityCanvas = React.lazy(() => import('./pages/PatientLongevityCanvas'));
const ClinicalOnboardingWizard = React.lazy(() => import('./pages/AthleteOnboarding/ClinicalOnboardingWizard'));
const TestB2B2C = React.lazy(() => import('./pages/TestB2B2C').then(m => ({ default: m.TestB2B2C })));
const TrainerCockpit = React.lazy(() => import('./components/trainer/TrainerCockpit').then(m => ({ default: m.TrainerCockpit })));
const PlanBuilderCockpit = React.lazy(() => import('./components/onboarding/PlanBuilderCockpit').then(m => ({ default: m.PlanBuilderCockpit })));
const NutritionSmartBlocks = React.lazy(() => import('./components/nutritionist/NutritionSmartBlocks').then(m => ({ default: m.NutritionSmartBlocks })));
const NaaSWorkspace = React.lazy(() => import('./components/builders/DietBuilder/NaaSWorkspace').then(m => ({ default: m.NaaSWorkspace })));

import { AppLayout } from './components/layout/AppLayout';
import { RouteGuard } from './components/auth/RouteGuard';
import { TenantBrandingProvider } from './context/TenantBrandingProvider';
import { ShatteringGlassAnimation } from './features/gamification/ShatteringGlassAnimation';
import { IntroPresentationOverlay } from './components/common/IntroPresentationOverlay';

function RootRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-indigo-400 font-mono">Iniciando sistema...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === 'CLIENT_FITNESS' || user?.role === 'ATHLETE' || user?.role === 'PATIENT' || user?.role === 'USER') {
    return <Navigate to="/athlete" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  const location = useLocation();
  const isB2CRoute = location.pathname.startsWith('/atleta/') ||
    location.pathname.startsWith('/athlete/') ||
    location.pathname === '/athlete' ||
    location.pathname.startsWith('/b2c/') ||
    location.pathname === '/onboarding' ||
    location.pathname === '/recepcion/escaner' ||
    location.pathname === '/join' ||
    location.pathname === '/app/auth/success' ||
    location.pathname === '/cliente-cero' ||
    location.pathname === '/cliente-cero-pt' ||
    location.pathname === '/cliente-cero-nutri' ||
    location.pathname === '/magic-link-onboarding' ||
    location.pathname === '/test-b2b2c' ||
    location.pathname.startsWith('/plan-builder') ||
    location.pathname === '/trainer-cockpit' ||
    location.pathname === '/longevidad' ||
    location.pathname === '/b2c/onboarding-clinico' ||
    location.pathname === '/naas-builder' ||
    location.pathname === '/nutrition-blocks' ||
    location.pathname.startsWith('/habits/') ||
    location.pathname === '/redeem' ||
    location.pathname === '/setup' ||
    location.pathname === '/login';

  return (
    <LanguageProvider>
      <TenantBrandingProvider>
      <EntropyVAKProvider>
        <AuthProvider>
          {/* Presentación Intro Pantalla Completa (Video Acelerado al abrir la app) */}
          <IntroPresentationOverlay />
          {isB2CRoute ? (
            <>
              <ShatteringGlassAnimation />
              <Routes>
            <Route path="/b2c/onboarding" element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <ZeroClientWizardPT mode="B2C" />
              </Suspense>
            } />
            <Route path="/b2c/onboarding-clinico" element={
              <Suspense fallback={<div className="min-h-screen bg-[#F5F5DC]" />}>
                <ClinicalOnboardingWizard />
              </Suspense>
            } />
            <Route path="/onboarding" element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <ZeroClientWizardPT mode="B2C" />
              </Suspense>
            } />
            <Route path="/b2c/join" element={
              <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
                <MagicLinkRedeem />
              </Suspense>
            } />
            <Route path="/redeem" element={
              <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
                <MagicLinkRedeem />
              </Suspense>
            } />
            <Route path="/recepcion/escaner" element={
              <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-indigo-400">Inicializando Escáner QR...</div>}>
                <ReceptionScanner />
              </Suspense>
            } />
            <Route path="/atleta/canvas" element={<Navigate to="/athlete/canvas" replace />} />
            <Route path="/atleta/*" element={<Navigate to="/athlete" replace />} />
            <Route path="/athlete/canvas" element={
              <Suspense fallback={<div className="min-h-screen bg-zinc-950 dark:bg-zinc-950 flex items-center justify-center text-indigo-400">Cargando Math Engine...</div>}>
                <ActiveCanvas />
              </Suspense>
            } />
            <Route path="/athlete/*" element={
              <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center text-emerald-400">Cargando...</div>}>
                <AthleteMobileView />
              </Suspense>
            } />
            <Route path="/cliente-cero" element={
              <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
                <ZeroClientWizard />
              </Suspense>
            } />
            <Route path="/cliente-cero-pt" element={
              <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
                <ZeroClientWizardPT />
              </Suspense>
            } />
            <Route path="/cliente-cero-nutri" element={
              <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
                <ClienteCeroNutri />
              </Suspense>
            } />
            <Route path="/test-b2b2c" element={
              <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
                <TestB2B2C />
              </Suspense>
            } />
            <Route path="/magic-link-onboarding" element={
              <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
                <AthleteMagicLinkForm />
              </Suspense>
            } />
            <Route path="/longevidad" element={
              <Suspense fallback={<div className="min-h-screen bg-[#F5F5DC]" />}>
                <PatientLongevityCanvas />
              </Suspense>
            } />

            <Route path="/plan-builder/*" element={
              <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
                <PlanBuilderCockpit />
              </Suspense>
            } />
            <Route path="/trainer-cockpit" element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <TrainerCockpit />
              </Suspense>
            } />
            <Route path="/nutrition-blocks" element={
              <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
                <NutritionSmartBlocks />
              </Suspense>
            } />
            <Route path="/join" element={<JoinView />} />
            <Route path="/app/auth/success" element={<AuthSuccessHandler />} />
            <Route path="/naas-builder" element={
              <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Cargando NaaS Studio...</div>}>
                <NaaSWorkspace />
              </Suspense>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={
              <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
                <TrainerSetupWizard />
              </Suspense>
            } />
            <Route path="*" element={<Navigate to="/b2c/onboarding" replace />} />
              </Routes>
            </>
          ) : (
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/dashboard" element={<CommandCenter />} />
            <Route path="/trainer" element={<CommandCenter />} />
            <Route path="/trainer/athlete/:id" element={<CommandCenter />} />
            <Route path="/trainer/finance" element={<FinanceDashboardView />} />
            <Route path="/finance" element={<FinanceDashboardView />} />
            <Route path="/inbox" element={<IntelligentInbox />} />
            <Route path="/validations" element={<IntelligentInbox />} />

            <Route path="/business" element={<RouteGuard allowedRoles={['ADMIN', 'SUPERADMIN']}><BusinessPage /></RouteGuard>} />
            <Route path="/roster" element={<PatientList />} />
            <Route path="/lab" element={<LabDashboard />} />
            <Route path="/analytics" element={<BioSynthesis />} />
            <Route path="/rewards" element={<RewardsVault />} />
            <Route path="/import" element={<MagicImport />} />
            <Route path="/branding" element={<RouteGuard allowedRoles={['ADMIN', 'SUPERADMIN']}><TenantBranding /></RouteGuard>} />
            <Route path="/referrals" element={<ReferralDashboard />} />
            <Route path="/voice" element={<VoiceToChart />} />
            <Route path="/prescription" element={<ShoppablePrescription />} />
            <Route path="/context-inbox" element={<ContextualInbox />} />
            <Route path="/gatekeeper" element={<Navigate to="/inbox?tab=communication" replace />} />
            <Route path="/revenue" element={<RouteGuard allowedRoles={['ADMIN', 'SUPERADMIN']}><RevenueGuard /></RouteGuard>} />
            <Route path="/gamification" element={<GamificationBuilder />} />
            <Route path="/arena" element={<TheArena />} />
            <Route path="/mindgym" element={<MindGym />} />
            <Route path="/nutrition" element={<NutritionDashboard />} />
            <Route path="/nutricionista" element={<NutricionistaDashboard />} />
            <Route path="/naas-builder" element={<NaaSWorkspace />} />
            <Route path="/dietqa" element={<DietQAPage />} />
            <Route path="/client" element={<Navigate to="/roster" replace />} />

            <Route path="/professionals" element={<RouteGuard allowedRoles={['ADMIN', 'SUPERADMIN']}><ProfessionalsManager /></RouteGuard>} />
            <Route path="/communication" element={<CommunicationHub />} />
            <Route path="/smartlab" element={<ClinicalBentoLayout />} />
            <Route path="/menu" element={<MenuScanner />} />
            <Route path="/library" element={<LibraryDashboard />} />
            <Route path="/assets" element={<MasterLibrary />} />
            <Route path="/calendar" element={<SmartCalendarPage />} />
            <Route path="/schedule" element={<ResourceManagementDashboard />} />
            <Route path="/settings" element={
              <RouteGuard allowedRoles={['ADMIN', 'SUPERADMIN']}>
                <div className="settings-placeholder p-8">
                  <h2 className="text-2xl font-black mb-4">Settings</h2>
                  <p className="mb-4">Configuration module coming soon.</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => window.location.hash = '#/import'} className="text-left text-blue-500 hover:underline">→ Magic Import</button>
                    <button onClick={() => window.location.hash = '#/branding'} className="text-left text-blue-500 hover:underline">→ Brand Settings</button>
                  </div>
                </div>
              </RouteGuard>
            } />
            <Route path="*" element={<CommandCenter />} />
          </Route>
        </Routes>
      )}
    </AuthProvider>
  </EntropyVAKProvider>
  </TenantBrandingProvider>
</LanguageProvider>
  );
}
