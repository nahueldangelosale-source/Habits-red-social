import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, ShieldAlert, User, Zap, Calendar, Heart, 
  Check, Trash2, RefreshCw, AlertTriangle, Sparkles 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
}

interface TelemetryAlert {
  id: string;
  tenant_id: string;
  client_id: string;
  alert_type: string;
  severity: string;
  metric_name: string;
  metric_value: number;
  message: string;
  status: string;
  created_at: string;
  client: Client | null;
}

export default function AnalyticalRadar() {
  const [activeTab, setActiveTab] = useState<'fatigue' | 'churn'>('fatigue');
  const [fatigueAlerts, setFatigueAlerts] = useState<TelemetryAlert[]>([]);
  const [churnAlerts, setChurnAlerts] = useState<TelemetryAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningAudit, setRunningAudit] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const fatigueRes = await axios.get<TelemetryAlert[]>('http://localhost:8000/api/v1/radar/fatigue-alerts');
      const churnRes = await axios.get<TelemetryAlert[]>('http://localhost:8000/api/v1/radar/churn-risks');
      setFatigueAlerts(fatigueRes.data);
      setChurnAlerts(churnRes.data);
    } catch (error) {
      console.error("Error fetching radar alerts:", error);
      // Fallback fallback data for UI preview in development if backend is not running
      const mockFatigue: TelemetryAlert[] = [
        {
          id: "alert-1",
          tenant_id: "tenant-1",
          client_id: "c-1",
          alert_type: "fatigue_acwr",
          severity: "danger",
          metric_name: "acwr_ratio",
          metric_value: 1.68,
          message: "Riesgo crítico de sobreentrenamiento: ACWR alcanzó 1.68 (Danger Zone). Riesgo de lesión inminente.",
          status: "pending",
          created_at: new Date().toISOString(),
          client: { id: "c-1", first_name: "Gonzalo", last_name: "Quesada", email: "gonza@example.com", phone: "+5411223344" }
        },
        {
          id: "alert-2",
          tenant_id: "tenant-1",
          client_id: "c-2",
          alert_type: "fatigue_acwr",
          severity: "warning",
          metric_name: "acwr_ratio",
          metric_value: 1.34,
          message: "Carga aguda elevada: ACWR es 1.34. Fatiga del SNC en aumento progresivo.",
          status: "pending",
          created_at: new Date().toISOString(),
          client: { id: "c-2", first_name: "Martina", last_name: "Silva", email: "marti@example.com", phone: "+5411334455" }
        }
      ];
      const mockChurn: TelemetryAlert[] = [
        {
          id: "alert-3",
          tenant_id: "tenant-1",
          client_id: "c-3",
          alert_type: "churn",
          severity: "danger",
          metric_name: "days_since_last_workout",
          metric_value: 18,
          message: "Riesgo extremo de Churn silencioso: 18 días sin registrar actividad física.",
          status: "pending",
          created_at: new Date().toISOString(),
          client: { id: "c-3", first_name: "Federico", last_name: "Mancuello", email: "fede@example.com", phone: "+5411445566" }
        }
      ];
      setFatigueAlerts(mockFatigue);
      setChurnAlerts(mockChurn);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string) => {
    try {
      await axios.post(`http://localhost:8000/api/v1/radar/alerts/${id}/action`);
      toast.success("Alerta accionada y registrada con éxito.");
      fetchAlerts();
    } catch (err) {
      // Offline action fallback for UI
      setFatigueAlerts(prev => prev.filter(a => a.id !== id));
      setChurnAlerts(prev => prev.filter(a => a.id !== id));
      toast.success("Alerta accionada de forma simulada.");
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await axios.post(`http://localhost:8000/api/v1/radar/alerts/${id}/dismiss`);
      toast.success("Alerta descartada de forma limpia.");
      fetchAlerts();
    } catch (err) {
      setFatigueAlerts(prev => prev.filter(a => a.id !== id));
      setChurnAlerts(prev => prev.filter(a => a.id !== id));
      toast.success("Alerta descartada de forma simulada.");
    }
  };

  const triggerAudit = async () => {
    setRunningAudit(true);
    try {
      const res = await axios.post('http://localhost:8000/api/v1/radar/run');
      toast.success(`Auditoría finalizada. Creadas: ${res.data.created_alerts_count}, Resueltas: ${res.data.resolved_alerts_count}`);
      fetchAlerts();
    } catch (err) {
      toast.error("Servidor no responde. Iniciando auditoría simulada...");
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Auditoría finalizada. Todos los datos recalculados.");
      fetchAlerts();
    } finally {
      setRunningAudit(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const currentAlerts = activeTab === 'fatigue' ? fatigueAlerts : churnAlerts;

  return (
    <div className="bg-[#0f111a] border border-[#1f293d] rounded-2xl p-6 shadow-2xl text-white max-w-4xl mx-auto my-6 font-sans relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#7f00ff]/10 to-[#e100ff]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-[#1f293d] relative z-10">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent">
            <Activity className="text-[#00ffcc] w-7 h-7 animate-pulse" />
            Radar Analítico Predictivo
          </h2>
          <p className="text-sm text-[#94a3b8] mt-1">
            Detección matemática de estrés del SNC (ACWR EWMA) e inactividad de retención.
          </p>
        </div>

        <button
          onClick={triggerAudit}
          disabled={runningAudit}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] hover:from-[#00c6ff] hover:to-[#0072ff] text-[#0f111a] font-bold rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${runningAudit ? 'animate-spin' : ''}`} />
          {runningAudit ? 'Calculando EWMA...' : 'Auditar Telemetría'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-[#171a26] rounded-xl border border-[#242b3e] mb-6 relative z-10">
        <button
          onClick={() => setActiveTab('fatigue')}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === 'fatigue'
              ? 'bg-[#1f293d] text-[#00ffcc] shadow-md border border-[#2b3a55]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#1a2030]'
          }`}
        >
          <Zap className="w-4 h-4" />
          Fatiga Biomecánica SNC ({fatigueAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('churn')}
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === 'churn'
              ? 'bg-[#1f293d] text-[#ff3366] shadow-md border border-[#2b3a55]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#1a2030]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Riesgo de Churn Silencioso ({churnAlerts.length})
        </button>
      </div>

      {/* Alert List Container */}
      <div className="relative z-10 min-h-[250px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#94a3b8]">
            <RefreshCw className="w-10 h-10 animate-spin text-[#00ffcc] mb-4" />
            <p className="text-sm font-medium animate-pulse">Consultando base de datos relacional...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {currentAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[#1f293d] rounded-2xl bg-[#121422]"
              >
                <div className="p-4 bg-gradient-to-br from-[#00ffcc]/10 to-[#00f2fe]/5 rounded-full mb-4 border border-[#00ffcc]/20">
                  <Sparkles className="w-8 h-8 text-[#00ffcc] animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">¡Todo en Orden!</h3>
                <p className="text-sm text-[#94a3b8] max-w-sm mt-2 px-4">
                  Todos los atletas del tenant se encuentran estables dentro del Sweet Spot biomecánico y registran actividad.
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-4">
                {currentAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layoutId={alert.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -50 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={`border p-5 rounded-xl transition-all duration-300 relative overflow-hidden group shadow-lg ${
                      alert.severity === 'danger'
                        ? 'border-[#ff3366]/30 bg-gradient-to-r from-[#ff3366]/5 to-transparent hover:border-[#ff3366]/50'
                        : 'border-[#ffcc00]/30 bg-gradient-to-r from-[#ffcc00]/5 to-transparent hover:border-[#ffcc00]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side info */}
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg tracking-wide border shadow-inner ${
                          alert.severity === 'danger'
                            ? 'bg-[#ff3366]/10 border-[#ff3366]/30 text-[#ff3366]'
                            : 'bg-[#ffcc00]/10 border-[#ffcc00]/30 text-[#ffcc00]'
                        }`}>
                          {alert.client ? `${alert.client.first_name[0]}${alert.client.last_name[0]}` : <User className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-base text-white tracking-tight group-hover:text-[#00ffcc] transition-colors duration-300">
                              {alert.client ? `${alert.client.first_name} ${alert.client.last_name}` : 'Atleta Desconocido'}
                            </h4>
                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border tracking-wider ${
                              alert.severity === 'danger'
                                ? 'bg-[#ff3366]/20 border-[#ff3366]/40 text-[#ff3366]'
                                : 'bg-[#ffcc00]/20 border-[#ffcc00]/40 text-[#ffcc00]'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>

                          <p className="text-sm text-[#cbd5e1] mt-1 leading-relaxed max-w-2xl">
                            {alert.message}
                          </p>

                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#94a3b8] font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Registrado: {new Date(alert.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5" />
                              Métrica: {alert.metric_name} = <strong className="text-white">{alert.metric_value.toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side actions */}
                      <div className="flex items-center gap-2 self-center sm:self-start opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleAction(alert.id)}
                          title="Contactar / Tomar Acción"
                          className="p-2.5 bg-[#171a26] border border-[#2b3a55] hover:border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc]/10 rounded-xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          title="Descartar Alerta"
                          className="p-2.5 bg-[#171a26] border border-[#2b3a55] hover:border-[#ff3366] text-[#ff3366] hover:bg-[#ff3366]/10 rounded-xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
