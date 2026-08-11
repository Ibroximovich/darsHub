import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  UserX,
  ShieldCheck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Pencil,
} from 'lucide-react';
import type { AdminUser } from '../../types/admin.types';
import { adminSubscriptionApi } from '../../api/admin';
import { ActivateSubscriptionModal } from './ActivateSubscriptionModal';
import toast from 'react-hot-toast';

interface UserTableProps {
  users: AdminUser[];
}

type StatusBadge = {
  label: string;
  icon: React.ReactNode;
  className: string;
};

function getStatusBadge(status: AdminUser['subscriptionStatus']): StatusBadge {
  switch (status) {
    case 'trial':
      return {
        label: 'Trial',
        icon: <Clock className="w-3 h-3" />,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'active':
      return {
        label: 'Faol',
        icon: <CheckCircle className="w-3 h-3" />,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'expired':
      return {
        label: 'Tugagan',
        icon: <XCircle className="w-3 h-3" />,
        className: 'bg-red-50 text-red-600 border-red-200',
      };
  }
}

// O'qish uchun o'zbekcha sana formati (masalan: "25 Avgust, 2026")
function formatTrialDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';

  const day = date.getDate();
  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  const monthNameUz = monthNames[date.getMonth()];

  return `${day} ${monthNameUz}, ${date.getFullYear()}`;
}

// HTML <input type="date"> uchun YYYY-MM-DD format
function toInputDateValue(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface InlineTrialEditorProps {
  userId: string;
  currentTrialEndsAt: string;
  onSave: (userId: string, isoDate: string) => void;
  isUpdating: boolean;
}

const InlineTrialEditor: React.FC<InlineTrialEditorProps> = ({
  userId,
  currentTrialEndsAt,
  onSave,
  isUpdating,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isUpdating) {
    return (
      <div className="flex items-center gap-1.5 text-teal-700 text-xs font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Saqlanmoqda...</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <input
        type="date"
        defaultValue={toInputDateValue(currentTrialEndsAt)}
        autoFocus
        onChange={(e) => {
          if (e.target.value) {
            const iso = new Date(`${e.target.value}T00:00:00.000Z`).toISOString();
            onSave(userId, iso);
            setIsEditing(false);
          }
        }}
        onBlur={() => setIsEditing(false)}
        className="px-2 py-1 text-xs border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white text-stone-900 shadow-xs"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      type="button"
      className="group flex items-center gap-1.5 hover:bg-stone-100 px-2 py-1 rounded-lg transition-colors text-left"
      title="Trial sanasini tahrirlash uchun bosing"
    >
      <span className="text-xs font-medium text-stone-700">
        {formatTrialDate(currentTrialEndsAt)}
      </span>
      <Pencil className="w-3 h-3 text-stone-400 opacity-60 group-hover:opacity-100 group-hover:text-teal-600 transition-all" />
    </button>
  );
};

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const [activateTarget, setActivateTarget] = useState<AdminUser | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate: deactivate, isPending: deactivating } = useMutation({
    mutationFn: (userId: string) => adminSubscriptionApi.deactivateUser(userId),
    onSuccess: () => {
      toast.success('Obuna bekor qilindi');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const { mutate: updateTrial } = useMutation({
    mutationFn: ({ userId, trialEndsAt }: { userId: string; trialEndsAt: string }) => {
      setUpdatingUserId(userId);
      return adminSubscriptionApi.updateUserTrial(userId, trialEndsAt);
    },
    onSuccess: () => {
      toast.success('Trial sanasi yangilandi');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Trial sanasini yangilashda xatolik yuz berdi');
    },
    onSettled: () => {
      setUpdatingUserId(null);
    },
  });

  const handleTrialDateSave = (userId: string, newIsoDate: string) => {
    updateTrial({ userId, trialEndsAt: newIsoDate });
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400 text-sm">
        Foydalanuvchilar topilmadi
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-stone-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Foydalanuvchi
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Telefon
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Holat
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Trial tugash sanasi
              </th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((user) => {
              const badge = getStatusBadge(user.subscriptionStatus);
              const isUpdatingThisUser = updatingUserId === user.id;

              return (
                <tr key={user.id} className="bg-white hover:bg-stone-50/60 transition-colors">
                  {/* Name + email */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-teal-700">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-stone-900 text-sm truncate max-w-[180px]">
                            {user.fullName}
                          </p>
                          {user.isAdmin && (
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-stone-400 truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-4 text-xs text-stone-600 font-mono">{user.phone}</td>

                  {/* Status badge */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  </td>

                  {/* Trial Expiry Date inline editor */}
                  <td className="px-4 py-4">
                    <InlineTrialEditor
                      userId={user.id}
                      currentTrialEndsAt={user.trialEndsAt}
                      onSave={handleTrialDateSave}
                      isUpdating={isUpdatingThisUser}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setActivateTarget(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Faollashtirish
                      </button>

                      {user.subscriptionStatus === 'active' && !user.isAdmin && (
                        <button
                          onClick={() => deactivate(user.id)}
                          disabled={deactivating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deactivating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserX className="w-3.5 h-3.5" />
                          )}
                          Bekor qilish
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

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {users.map((user) => {
          const badge = getStatusBadge(user.subscriptionStatus);
          const isUpdatingThisUser = updatingUserId === user.id;

          return (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-teal-700">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-stone-900 text-sm truncate">{user.fullName}</p>
                      {user.isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-stone-400 truncate">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${badge.className}`}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              </div>

              <div className="text-xs text-stone-500 mb-3 space-y-2">
                <p>📞 {user.phone}</p>
                <div className="flex items-center gap-1">
                  <span>📅 Trial tugash:</span>
                  <InlineTrialEditor
                    userId={user.id}
                    currentTrialEndsAt={user.trialEndsAt}
                    onSave={handleTrialDateSave}
                    isUpdating={isUpdatingThisUser}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActivateTarget(user)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Faollashtirish
                </button>
                {user.subscriptionStatus === 'active' && !user.isAdmin && (
                  <button
                    onClick={() => deactivate(user.id)}
                    disabled={deactivating}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Bekor
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activate Modal */}
      {activateTarget && (
        <ActivateSubscriptionModal
          userId={activateTarget.id}
          userName={activateTarget.fullName}
          onClose={() => setActivateTarget(null)}
        />
      )}
    </>
  );
};
