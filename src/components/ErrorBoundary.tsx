import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetLocalCache = () => {
    try {
      localStorage.clear();
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-neutral-900 text-white flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-neutral-800 border border-neutral-700 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                An unexpected display error occurred. Don't worry, your cloud database and stock records remain safe.
              </p>
              {this.state.error?.message && (
                <div className="p-3 rounded-xl bg-neutral-900/80 text-[11px] font-mono text-rose-300 text-left border border-neutral-700/80 overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetLocalCache}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Local Cache & Re-sync</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
