import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Check, X, Info, ScanLine, AlertTriangle, Utensils } from "lucide-react";

// --- MOCK DATA ---
const PENDING_REVIEWS = [
    {
        id: 1,
        patientName: "Ana G.",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        aiPrediction: "PokÃ© Bowl SalmÃ³n",
        confidence: 98,
        macros: { kcal: 450, p: 25, c: 45, f: 18 },
        timestamp: "12:30 PM",
        mealType: "Almuerzo"
    },
    {
        id: 2,
        patientName: "Carlos M.",
        imageUrl: "https://images.unsplash.com/photo-1504754524776-350331959bd3?auto=format&fit=crop&w=800&q=80",
        aiPrediction: "Avena & Berries",
        confidence: 85,
        macros: { kcal: 320, p: 12, c: 55, f: 6 },
        timestamp: "08:15 AM",
        mealType: "Desayuno"
    },
    {
        id: 3,
        patientName: "Lucia R.",
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
        aiPrediction: "Pollo & Vegetales",
        confidence: 92,
        macros: { kcal: 380, p: 40, c: 15, f: 12 },
        timestamp: "02:45 PM",
        mealType: "Almuerzo"
    }
];

export const FoodReviewStack = () => {
    const [cards, setCards] = useState(PENDING_REVIEWS);

    // Physics for the active card
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const isFrontOpacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
    const bgStatus = useTransform(x, [-150, 0, 150], ["rgba(239, 68, 68, 0.2)", "rgba(255,255,255,0)", "rgba(136, 176, 75, 0.2)"]);

    const handleReview = (id: number, action: "approve" | "reject") => {
        console.log(`Action: ${action} on item ${id}`);
        setCards((prev) => prev.filter((c) => c.id !== id));
        x.set(0);
    };

    const activeCard = cards[0];

    return (
        <div className="relative w-full h-[450px] flex flex-col items-center justify-center font-sans">

            {/* HEADER: CLINICAL CONTEXT */}
            <div className="absolute top-0 left-0 w-full flex justify-between items-center px-2 mb-4 z-10">
                <h3 className="text-zinc-800 font-medium flex items-center gap-2">
                    <ScanLine size={18} className="text-zinc-400" />
                    AI Food Analysis
                </h3>
                <span className="text-xs font-mono text-zinc-400 bg-white px-2 py-1 rounded-full border border-zinc-100 shadow-sm">
                    {cards.length} PENDING
                </span>
            </div>

            {/* --- THE STACK --- */}
            <div className="relative w-full max-w-sm h-[380px] mt-8">
                <AnimatePresence>
                    {cards.length > 0 ? (
                        cards.map((card, index) => {
                            const isFront = index === 0;
                            return (
                                <motion.div
                                    key={card.id}
                                    style={{
                                        zIndex: cards.length - index,
                                        x: isFront ? x : 0,
                                        rotate: isFront ? rotate : 0,
                                        scale: isFront ? 1 : 1 - index * 0.05,
                                        y: isFront ? 0 : index * 10,
                                        opacity: isFront ? 1 : 1 - index * 0.2,
                                    }}
                                    drag={isFront ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x > 100) handleReview(card.id, "approve");
                                        if (info.offset.x < -100) handleReview(card.id, "reject");
                                    }}
                                    className="absolute w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-white border border-white/40 cursor-grab active:cursor-grabbing"
                                >
                                    {/* BACKGROUND IMAGE */}
                                    <div className="absolute inset-0 bg-zinc-200">
                                        <img src={card.imageUrl} alt="Food" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                                        {isFront && <motion.div style={{ backgroundColor: bgStatus }} className="absolute inset-0 z-10 pointer-events-none" />}
                                    </div>

                                    {/* --- CARD CONTENT --- */}
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                                        <div className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-white">
                                            <div className="w-5 h-5 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                {card.patientName.charAt(0)}
                                            </div>
                                            <span className="text-xs font-medium tracking-wide">{card.patientName}</span>
                                        </div>

                                        <div className={`
                                            px-3 py-1.5 rounded-full text-xs font-mono font-semibold border backdrop-blur-md flex items-center gap-1.5
                                            ${card.confidence > 90 ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100' : 'bg-amber-500/20 border-amber-500/30 text-amber-100'}
                                        `}>
                                            <ScanLine size={12} />
                                            AI: {card.confidence}%
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 w-full p-5 text-white z-20">
                                        <h2 className="font-sans text-2xl leading-none mb-1">{card.aiPrediction}</h2>
                                        <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-4">Detected at {card.timestamp}</p>

                                        <div className="grid grid-cols-4 gap-2">
                                            <MacroBadge label="KCAL" value={card.macros.kcal} />
                                            <MacroBadge label="PRO" value={`${card.macros.p}g`} />
                                            <MacroBadge label="CARB" value={`${card.macros.c}g`} />
                                            <MacroBadge label="FAT" value={`${card.macros.f}g`} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                <Check size={32} className="text-[#88B04B]" />
                            </div>
                            <p className="text-label">All Clean</p>
                            <p className="font-sans text-lg text-zinc-600">No logs pending review.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- ACTION CONTROLS --- */}
            {cards.length > 0 && (
                <div className="flex gap-6 mt-6">
                    <ActionBtn
                        icon={X}
                        color="text-rose-500"
                        bg="bg-white hover:bg-rose-50"
                        onClick={() => handleReview(activeCard.id, "reject")}
                    />
                    <ActionBtn
                        icon={Info}
                        color="text-zinc-500"
                        bg="bg-white hover:bg-zinc-50"
                        onClick={() => console.log("Details")}
                        small
                    />
                    <ActionBtn
                        icon={Check}
                        color="text-white"
                        bg="bg-[#88B04B] hover:bg-[#7a9e43] shadow-[#88B04B]/30"
                        onClick={() => handleReview(activeCard.id, "approve")}
                        isPrimary
                    />
                </div>
            )}
        </div>
    );
};

const MacroBadge = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/10 text-center">
        <div className="text-[10px] text-white/60 font-mono mb-0.5">{label}</div>
        <div className="text-sm font-mono font-medium">{value}</div>
    </div>
);

const ActionBtn = ({ icon: Icon, color, bg, onClick, small, isPrimary }: any) => (
    <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={`
            rounded-full flex items-center justify-center transition-colors shadow-xl
            ${small ? 'w-10 h-10' : 'w-16 h-16'}
            ${bg} ${color}
            ${isPrimary ? 'shadow-lg shadow-emerald-900/10' : 'border border-zinc-100'}
        `}
    >
        <Icon size={small ? 18 : 28} strokeWidth={2.5} />
    </motion.button>
);
