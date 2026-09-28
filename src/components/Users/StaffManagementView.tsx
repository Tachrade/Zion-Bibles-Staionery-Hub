import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ShopUser, UserRole } from '../../types';

interface StaffManagementViewProps {
  users: ShopUser[];
  onSaveUser: (user: ShopUser, isEdit: boolean) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: string;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  users,
  onSaveUser,
  onDeleteUser,
  currentUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ShopUser | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cashierPortalUrl = `${window.location.origin}${window.location.pathname}?portal=cashier`;

  const copyCashierLink = () => {
    navigator.clipboard.writeText(cashierPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setDisplayName('');
    setRole('cashier');
    setPassword('');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u: ShopUser) => {
    setEditingUser(u);
    setUsername(u.username);
    setDisplayName(u.displayName);
    setRole(u.role);
    setPassword(u.password);
    setActive(u.active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return alert('Please enter a username.');
    if (!displayName.trim()) return alert('Please enter staff name.');
    if (!password.trim()) return alert('Please assign a password.');

    // Check duplicate username if adding
    if (!editingUser) {
      const exists = users.some(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (exists) {
        return alert(`Username "${username}" is already assigned. Choose another.`);
      }
    }

    const userData: ShopUser = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      role,
      password: password.trim(),
      active,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
    };

    onSaveUser(userData, !!editingUser);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Staff Accounts & Access Control</h2>
          <p className="text-xs text-neutral-500">
            Create cashiers, assign passwords, and generate direct cashier terminal links
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Staff Member</span>
        </button>
      </div>

      {/* Direct Cashier Terminal Link Card */}
      <div className="bg-gradient-to-r from-emerald-950 to-neutral-900 text-white p-5 rounded-2xl border border-emerald-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Direct Cashier Link
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
              Counter Terminals
            </span>
          </div>
          <h3 className="font-bold text-sm text-white">
            Give this link to your cashiers and counter attendants
          </h3>
          <p className="text-xs text-neutral-300 max-w-xl font-mono text-[11px] truncate">
            {cashierPortalUrl}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyCashierLink}
            className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-neutral-100 transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Cashier Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-neutral-900">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Authorized Shop Users ({users.length})</span>
          </div>
          <span className="text-[11px] text-neutral-500">
            Strictly Admin-Created · Public Sign-Up Disabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Role / Permissions</th>
                <th className="py-3 px-3">Assigned Password</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => {
                const isPasswordVisible = visiblePasswords[u.id];
                const isCurrent = u.displayName === currentUser || u.username === currentUser;

                return (
                  <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                            <span>{u.displayName}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-neutral-700">
                      @{u.username}
                    </td>

                    <td className="py-3 px-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                          <ShieldCheck className="w-3 h-3 text-amber-700" />
                          Admin / Full Control
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-900 border border-emerald-200">
                          Cashier / Sales Terminal
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-neutral-700">
                      <div className="flex items-center gap-2">
                        <span>{isPasswordVisible ? u.password : '••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                          title={isPasswordVisible ? 'Hide password' : 'View password'}
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.active ? 'bg-emerald-500' : 'bg-neutral-400'
                          }`}
                        />
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 cursor-pointer"
                          title="Edit user & password"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {users.length > 1 && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete staff account "@${u.username}" (${u.displayName})?`
                                )
                              ) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100 cursor-pointer"
                            title="Remove staff member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base text-white">
                  {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name / Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Sister Grace Adeleke"
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Username (Staff Login ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. grace"
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Used by the staff member to sign in on their phone or counter terminal.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Assigned Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. grace123"
                  className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  You give this password to the staff member.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Role / Access Level
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('cashier')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      role === 'cashier'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="font-bold">Cashier / Staff</div>
                    <div className="text-[10px] font-normal text-neutral-500 mt-0.5">
                      POS sales, receipt printing & stock lookup only. No financial reports.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      role === 'admin'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="font-bold">Shop Admin</div>
                    <div className="text-[10px] font-normal text-neutral-500 mt-0.5">
                      Full access to profit reports, cost prices, staff management & settings.
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeUser"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-neutral-300 cursor-pointer"
                />
                <label htmlFor="activeUser" className="text-xs text-neutral-700 cursor-pointer">
                  Account is active (can log in to shop system)
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Save User Changes' : 'Create Staff User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
