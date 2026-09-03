import React, { useState } from 'react';
import { emitStripeConnectIntent } from '../../utils/telemetry';
import './PricingFreedomFakeDoor.css';

interface Props {
  ptId: string;
  onClose: () => void;
}

export const PricingFreedomFakeDoor: React.FC<Props> = ({ ptId, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Emitimos el intent de telemetría (Nuestra métrica de umbral)
    await emitStripeConnectIntent(ptId);
    
    // Simulamos un delay de carga para la experiencia inmersiva
    setTimeout(() => {
      setIsConnecting(false);
      setShowConcierge(true); // Mostramos el Concierge MVP
    }, 1500);
  };

  if (showConcierge) {
    return (
      <div className="antigravity-modal-overlay">
        <div className="antigravity-modal-content success-state">
          <div className="ag-glow-effect"></div>
          <h2 className="ag-title">Estás en la Lista de Acceso Anticipado</h2>
          <p className="ag-description">
            Estamos integrando tu pasarela de pagos. Por ahora, un agente de conserjería se pondrá en contacto contigo para configurar tus primeros cobros manualmente y sin comisión.
          </p>
          <button className="ag-btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="antigravity-modal-overlay">
      <div className="antigravity-modal-content">
        <div className="ag-glow-effect"></div>
        <div className="ag-badge">Autonomía Financiera</div>
        <h2 className="ag-title">Automatiza tus Cobros</h2>
        <p className="ag-description">
          Ofrece planes híbridos premium, suscripciones recurrentes y retén a tus atletas con pagos sin fricción. Configura tu cuenta para empezar a recibir ingresos directamente en tu cuenta bancaria.
        </p>
        
        <div className="ag-features">
          <div className="ag-feature-item">
            <span className="ag-icon">✨</span>
            <span>Cero comisiones ocultas</span>
          </div>
          <div className="ag-feature-item">
            <span className="ag-icon">🔄</span>
            <span>Cobros automáticos recurrentes</span>
          </div>
          <div className="ag-feature-item">
            <span className="ag-icon">📈</span>
            <span>Aumenta tu ticket promedio (ASP)</span>
          </div>
        </div>

        <div className="ag-actions">
          <button className="ag-btn-secondary" onClick={onClose}>
            En otro momento
          </button>
          <button 
            className={`ag-btn-primary ${isConnecting ? 'loading' : ''}`}
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Conectando...' : 'Conectar mi Cuenta y Empezar'}
          </button>
        </div>
      </div>
    </div>
  );
};
