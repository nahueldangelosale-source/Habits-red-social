import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class LocalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in component ${this.props.componentName || 'Unknown'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-rose-50 border border-rose-100 rounded-xl">
          <AlertTriangle className="text-rose-500 mb-3" size={32} />
          <h3 className="text-rose-800 font-bold text-sm mb-1">
            Error en {this.props.componentName || 'el módulo'}
          </h3>
          <p className="text-rose-600 text-xs text-center max-w-xs mb-4">
            {this.state.error?.message || 'Ha ocurrido un error inesperado al cargar esta sección.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium text-xs rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
