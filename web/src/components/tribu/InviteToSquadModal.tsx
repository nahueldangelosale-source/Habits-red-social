import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Share2, Copy, Check, QrCode, Sparkles, Trophy, Users, 
  MessageCircle, ArrowRight, UserPlus, Flame, ShieldCheck, CheckCircle2, Gift 
} from 'lucide-react';
import { useTribuStore } from '../../stores/useTribuStore';
import confetti from 'canvas-confetti';

interface InviteToSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteToSquadModal: React.FC<InviteToSquadModalProps> = ({
  isOpen,
  onClose
}) => {
  const { squadName, inviteCode, members, joinSquadFromInvite } = useTribuStore();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'SHARE' | 'SIMULATOR'>('SHARE');
  
  // Estados para el Simulador de Invitado (Non-User Instant Onboarding)
  const [guestName, setGuestName] = useState('');
  const [simulatedJoined, setSimulatedJoined] = useState(false);
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  const inviteUrl = `https://habits.app/join/${inviteCode}`;
  const whatsappMessage = `🔥 ¡Hola! Te invito a unirte a mi Escuadrón "${squadName}" en Habits. Estamos compitiendo en el reto semanal de hábitos. ¡Súmate con mi enlace para desbloquear tu Squad y llevarte +50 XP de bienvenida gratis! 🚀 ${inviteUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSimulateJoin = () => {
    if (!guestName.trim()) {
      setSimulatedError('Ingresa un nombre o alias para el nuevo atleta.');
      return;
    }

    const idempotencyKey = `sim_join_${inviteCode}_${guestName.trim().toLowerCase()}_${Date.now()}`;
    const result = joinSquadFromInvite(inviteCode, guestName.trim(), undefined, idempotencyKey);

    if (result.success) {
      setSimulatedJoined(true);
      setSimulatedError(null);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
      });
    } else {
      setSimulatedError(result.error || 'Error al unirse.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header con Identidad Habits. */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-amber-400/20">
                <UserPlus size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white">Invitar al Squad</h3>
                  <span className="font-bold text-xs text-transparent bg-clip-text bg-gradient-to-tr from-amber-500 to-rose-500">Habits.</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Suma amigos que aún no tengan la app</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          {/* Selector de Pestañas: Compartir vs Simulador */}
          <div className="p-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setActiveTab('SHARE')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'SHARE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Share2 size={13} />
              <span>Compartir Enlace</span>
            </button>
            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'SIMULATOR'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Probar Como Amigo</span>
            </button>
          </div>

          {/* Contenido */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {activeTab === 'SHARE' ? (
              <div className="space-y-4">
                {/* Banner de Incentivo Doble (Ganas tú, gana tu amigo) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 text-slate-800 dark:text-white relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-400/20">
                      <Gift size={20} />
                    </div>
                    <div>
                      <h4 className="font-montserrat font-black text-sm text-slate-900 dark:text-white">Regalo de Bienvenida</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        Tu amigo recibe <strong className="text-amber-600 dark:text-amber-300 font-black">+50 XP de regalo</strong> y tu squad activa el <strong className="text-indigo-600 dark:text-indigo-400 font-black">Multiplicador 1.5x de Racha</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón WhatsApp Oficial de Alta Conversión */}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-montserrat font-black text-xs shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <MessageCircle size={18} className="fill-slate-950" />
                  <span>Enviar Invitación por WhatsApp</span>
                </button>

                {/* Enlace para Copiar */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    Enlace de Invitación Directa
                  </label>
                  <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl">
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className="bg-transparent text-xs text-slate-700 dark:text-slate-300 px-2 font-mono flex-1 outline-none truncate"
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        copied
                          ? 'bg-emerald-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Código QR Amigable para el Gym */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                    <QrCode size={42} className="text-slate-900" />
                  </div>
                  <div>
                    <h5 className="font-montserrat font-bold text-xs text-slate-900 dark:text-white">Escaneo Rápido con Cámara</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Tu compañero solo debe apuntar la cámara de su celular para abrir la landing de ingreso en 1 toque.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* PESTAÑA: SIMULADOR DE EXPERIENCIA DEL INVITADO (LANDING INSTANTÁNEA) */
              <div className="space-y-4">
                {!simulatedJoined ? (
                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 space-y-3.5">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full inline-block border border-indigo-500/20">
                        Vista previa de la Landing
                      </span>
                      <h4 className="font-montserrat font-black text-base text-slate-900 dark:text-white">
                        ¡Te invitaron al {squadName}!
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Nahuel te invitó a sincronizar hábitos y entrenar juntos en Habits.
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-black/30 rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {members.slice(0, 3).map(m => (
                            <img key={m.id} src={m.avatarUrl} alt={m.name} className="w-7 h-7 rounded-full border-2 border-white dark:border-black object-cover" />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{members.length} Atletas en el Squad</span>
                      </div>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        +50 XP Regalo
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Ingresa un Nombre para Simular el Ingreso:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Mateo Pérez"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none shadow-sm"
                      />
                      {simulatedError && (
                        <p className="text-xs text-rose-500 font-bold">{simulatedError}</p>
                      )}
                    </div>

                    <button
                      onClick={handleSimulateJoin}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-montserrat font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <span>¡Unirme al Squad y Reclamar +50 XP!</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-montserrat font-black text-base text-slate-900 dark:text-white">
                        ¡{guestName} se unió al Squad!
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Se le otorgó el rol <strong className="text-indigo-600 dark:text-indigo-400">Recluta</strong>, recibió sus <strong className="text-amber-600 dark:text-amber-300">+50 XP de regalo</strong> y ya figura en el feed de la tribu.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSimulatedJoined(false);
                        setGuestName('');
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-montserrat font-black text-xs transition-all shadow-md"
                    >
                      Ver en el Dashboard del Squad 🚀
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck size={13} />
              Idempotencia protegida
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">habits.app/join/{inviteCode}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
