import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { groupsApi } from '../../api/groups';
import type { Group } from '../../types/groups.types';
import { GroupCard } from '../../components/groups/GroupCard';
import { CreateGroupModal } from '../../components/groups/CreateGroupModal';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const GroupsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  const {
    data: groups = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => groupsApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success("Guruh o'chirildi");
      setDeletingGroup(null);
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || err.message || "Guruhni o'chirishda xatolik yuz berdi"
      );
    },
  });

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (group: Group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (group: Group) => {
    setDeletingGroup(group);
  };

  const handleConfirmDelete = () => {
    if (deletingGroup) {
      deleteMutation.mutate(deletingGroup.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Guruhlar
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Barcha guruhlar ro'yxati va dars jadvallarini boshqarish
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi guruh</span>
        </button>
      </div>

      {/* First Group Feedback Banner */}
      {!isLoading && !isError && groups.length >= 1 && (
        <FeedbackBanner
          storageKey="feedback_first_group_banner_dismissed"
          title="🎉 Birinchi guruhingizni yaratdingiz!"
          message="Ilova haqida fikringiz yoki taklifingiz bo'lsa, to'g'ridan-to'g'ri menga yozing"
          buttonText="Telegram'da yozish"
          variant="amber"
        />
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F766E] mb-3" />
          <p className="text-xs font-medium">Guruhlar yuklanmoqda...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm font-semibold mb-3">
            Ma'lumotlarni yuklashda xatolik yuz berdi
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      ) : groups.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center my-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            Hali guruhingiz yo'q
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mb-6 leading-relaxed">
            O'quvchilarni biriktirish va dars grafiklarini yuritish uchun birinchi guruhingizni yarating.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Birinchi guruhni yaratish</span>
          </button>
        </div>
      ) : (
        /* Groups Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Group Modal */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupToEdit={editingGroup}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingGroup)}
        onClose={() => setDeletingGroup(null)}
        title="Guruhni o'chirish"
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeletingGroup(null)}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>O'chirish</span>
            </button>
          </>
        }
      >
        <div className="space-y-2 text-xs text-stone-600">
          <p className="font-semibold text-stone-900 text-sm">
            Rostdan ham o'chirmoqchimisiz?
          </p>
          <p>
            <strong className="text-stone-900">{deletingGroup?.name}</strong> guruhini o'chirsangiz, barcha dars ma'lumotlari ham o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
          </p>
        </div>
      </Modal>
    </div>
  );
};
