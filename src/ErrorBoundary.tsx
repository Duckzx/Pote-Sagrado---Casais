import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cookbook-bg text-cookbook-text flex flex-col justify-center items-center p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-200">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Tivemos um soluço técnico.</h1>
          <p className="font-sans text-sm text-cookbook-text/60 mb-8 max-w-md">
            Alguma coisa não saiu como o esperado na aplicação. Tente recarregar a página para voltar ao normal.
            <br/><br/>
            {this.state.error?.message && (
              <span className="font-mono text-xs bg-red-50 text-red-700/80 p-2 rounded block text-left overflow-hidden">
                {this.state.error.message}
              </span>
            )}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-cookbook-primary text-white font-sans text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full hover:bg-cookbook-primary-hover active:scale-[0.98] transition-all shadow-md"
          >
            <RefreshCw size={16} /> Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
