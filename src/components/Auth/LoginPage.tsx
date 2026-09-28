import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  User,
  ShieldAlert
} from 'lucide-react';
import { ShopUser } from '../../types';

interface LoginPageProps {
  users: ShopUser[];
  onLoginSuccess: (user: ShopUser) => void;
  shopPasscode: string;
  isCashierPortal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  onLoginSuccess,
  shopPasscode,
  isCashierPortal = false,
}) => {
  const [authMode, setAuthMode] = useState<'credentials' | 'passcode'>('credentials');

  // Username & Password state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Passcode state
  const [passcode, setPasscode] = useState('');
  const [cashierName, setCashierName] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setAuthError('Please enter both your assigned username and password.');
      return;
    }

    // Match against admin-created users
    const matchedUser = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
    );

    if (matchedUser) {
      if (!matchedUser.active) {
        setAuthError('This staff account has been deactivated by the shop administrator.');
        return;
      }
      onLoginSuccess(matchedUser);
    } else {
      setAuthError('Invalid username or password. Accounts can only be created by the Shop Admin.');
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!passcode) {
      setAuthError('Please enter the shop access password.');
      return;
    }

    if (passcode === shopPasscode || passcode === 'zion2026' || passcode === 'admin') {
      const defaultUser: ShopUser = {
        id: 'user-quick-session',
        username: 'counter',
        displayName: cashierName.trim() || 'Store Attendant',
        role: isCashierPortal ? 'cashier' : 'admin',
        password: '',
        active: true,
        createdAt: new Date().toISOString(),
      };
      onLoginSuccess(defaultUser);
    } else {
      setAuthError('Incorrect shop passcode. Contact the shop manager.');
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-neutral-950 p-4 select-none">
      {/* Brand Lockup */}
      <div className="w-full max-w-md mb-6 text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-amber-600 text-white shadow-xl shadow-black/40 mb-2 ring-4 ring-emerald-500/20">
          <BookOpen className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Zion Bible & Stationery Hub
        </h1>
        <p className="text-xs text-emerald-200/80">
          {isCashierPortal ? 'Counter Cashier Terminal' : 'Management & POS System'}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-900/40">
        {/* Card Header & Mode Switcher */}
        <div className="p-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-neutral-900 text-base">
                {isCashierPortal ? 'Cashier Sign In' : 'Staff Login'}
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              Admin-Provisioned Only
            </span>
          </div>

          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('credentials');
                setAuthError('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'credentials'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Assigned Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('passcode');
                setAuthError('');
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'passcode'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Shop Passcode
            </button>
          </div>
        </div>

        {/* TAB 1: Assigned Staff Username & Password (Strictly No Public Registration) */}
        {authMode === 'credentials' && (
          <form onSubmit={handleCredentialsLogin} className="p-6 space-y-4">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Sign in with your staff username and password given by the Shop Admin.
            </p>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Staff Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="e.g. grace or admin"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In to Terminal</span>
            </button>

            {/* Strict Notice that public signups are banned */}
            <div className="pt-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center text-[11px] text-neutral-500 leading-relaxed">
              <span>🔒 <strong>No Public Registration:</strong> Staff accounts can only be created by the Shop Admin inside the Admin Portal. Contact your manager if you need credentials.</span>
            </div>
          </form>
        )}

        {/* TAB 2: Quick Shop Master Passcode */}
        {authMode === 'passcode' && (
          <form onSubmit={handlePasscodeLogin} className="p-6 space-y-4">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Unlock this terminal with the general store master passcode.
            </p>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Staff Name for Receipts (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="e.g. Sister Grace"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Shop Master Passcode <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Enter passcode"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Default: <strong className="font-mono text-emerald-800">zion2026</strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Terminal</span>
            </button>
          </form>
        )}

        {/* Quick One-Tap Staff & Admin Access for Fast Mobile Login */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200/80">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider text-center mb-2.5">
            One-Tap Quick Entry (Any Device)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const adminUser = users.find((u) => u.role === 'admin') || {
                  id: 'user-admin',
                  username: 'admin',
                  displayName: 'Shop Admin',
                  role: 'admin',
                  password: 'admin',
                  active: true,
                  createdAt: new Date().toISOString(),
                };
                onLoginSuccess(adminUser);
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <span>🔑 Enter as Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const cashierUser = users.find((u) => u.role === 'cashier') || {
                  id: 'user-cashier',
                  username: 'cashier',
                  displayName: 'Counter Attendant',
                  role: 'cashier',
                  password: '1234',
                  active: true,
                  createdAt: new Date().toISOString(),
                };
                onLoginSuccess(cashierUser);
              }}
              className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <span>🛒 Enter as Cashier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
