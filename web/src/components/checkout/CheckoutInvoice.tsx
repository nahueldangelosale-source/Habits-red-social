
import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { useCreateCheckoutPreference } from "../../hooks/useMonetization";

interface CheckoutProps {
    amount: number;
    coachName: string;
    planName: string;
    onConfirm: () => void; // This triggers the MP Redirect
    onClose: () => void;
}

export const CheckoutInvoice = ({ amount, coachName, planName, onConfirm, onClose }: CheckoutProps) => {
    const [isPaid, setIsPaid] = useState(false);
    const { mutateAsync: createPreference } = useCreateCheckoutPreference();

    // Formatting currency to Argentinian Standard
    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(amount);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 1. CINEMATIC BACKDROP */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* 2. THE BLACK CARD (INVOICE) */}
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-[#0F0F11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header Texture */}
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                <div className="p-8 relative z-10">
                    {/* Brand Pill */}
                    <div className="flex justify-center mb-8">
                        <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] tracking-[0.2em] text-zinc-400 uppercase font-medium">
                            Secure Transaction
                        </span>
                        <span className="ml-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[10px] tracking-[0.2em] text-amber-500 uppercase font-medium">
                            Degraded API
                        </span>
                    </div>

                    {/* Amount (The Hero) */}
                    <div className="text-center mb-8">
                        <h2 className="text-zinc-400 text-xs tracking-widest uppercase mb-2">Total Investment</h2>
                        <div className="text-5xl font-mono text-white tracking-tighter tabular-nums">
                            {formattedPrice}
                        </div>
                        <p className="text-zinc-500 text-xs mt-2">Monthly Recurring • Cancel Anytime</p>
                    </div>

                    {/* The Breakdown (Receipt) */}
                    <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 space-y-4">
                        <Row label="Professional Service" value={coachName} />
                        <Row label="Plan Tier" value={planName} />
                        <div className="h-px bg-white/10 my-2" />
                        <Row label="Platform Access" value="Included" highlight />
                        <Row label="Transaction Fee" value="Covered" highlight />
                    </div>

                    {/* Payment Method Preview */}
                    <div className="flex items-center gap-3 text-zinc-400 text-sm mb-8 justify-center">
                        <ShieldCheck size={16} className="text-[#88B04B]" />
                        <span>Processed securely via </span>
                        <span className="text-white font-semibold">Mercado Pago</span>
                    </div>

                    {/* 3. DIRECT ACTION BUTTON (PM Directive: Less Muda) */}
                    <button
                        onClick={async () => {
                            setIsPaid(true);
                            try {
                                const response = await createPreference({
                                    plan_id: planName,
                                    athlete_id: "athlete_123" // mocked athlete for now
                                });
                                console.log("Preference Created:", response.data);
                                // Here we would redirect to response.data.init_point
                                onConfirm();
                            } catch (e) {
                                console.error(e);
                                setIsPaid(false);
                            }
                        }}
                        disabled={isPaid}
                        className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-black font-bold tracking-widest uppercase rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isPaid ? "Redirecting..." : "Authorize Payment"}
                    </button>

                </div>
            </motion.div>
        </div>
    );
};

// --- SUB-COMPONENT: INVOICE ROW ---
const Row = ({ label, value, highlight }: any) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-zinc-500">{label}</span>
        <span className={`font-medium ${highlight ? 'text-indigo-400' : 'text-zinc-200'}`}>
            {value}
        </span>
    </div>
);
