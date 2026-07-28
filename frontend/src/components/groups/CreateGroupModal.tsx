import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { groupsApi } from '../../api/groups';
import type { Group, DayOfWeek, PaymentType } from '../../types/groups.types';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: Group | null;
}

const WEEK_DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Dush' },
  { key: 'tuesday', label: 'Sesh' },
  { key: 'wednesday', label: 'Chor' },
  { key: 'thursday', label: 'Pay' },
  { key: 'friday', label: 'Juma' },
  { key: 'saturday', label: 'Shan' },
  { key: 'sunday', label: 'Yak' },
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  groupToEdit,
}) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [days, setDays] = useState<DayOfWeek[]>(['monday', 'wednesday', 'friday']);
  const [time, setTime] = useState('14:00');
  const [price, setPrice] = useState<number | ''>(500000);
  const [paymentType, setPaymentType] = useState<PaymentType>('monthly');
  const [lessonsPerCycle, setLessonsPerCycle] = useState<number | ''>(12);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name || '');
      setDays(groupToEdit.days || []);
      setTime(groupToEdit.time || '14:00');
      setPrice(groupToEdit.price ?? 500000);
      setPaymentType(groupToEdit.paymentType || 'monthly');
      setLessonsPerCycle(groupToEdit.lessonsPerCycle ?? 12);
    } else {
      setName('');
      setDays(['monday', 'wednesday', 'friday']);
      setTime('14:00');
      setPrice(500000);
      setPaymentType('monthly');
      setLessonsPerCycle(12);
    }
    setErrorMsg('');
  }, [groupToEdit, isOpen]);

  const toggleDay = (dayKey: DayOfWeek) => {
    if (days.includes(dayKey)) {
      setDays(days.filter((d) => d !== dayKey));
    } else {
      setDays([...days, dayKey]);
    }
  };

  const createMutation = useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success("Guruh yaratildi");
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || "Guruh yaratishda xatolik yuz berdi";
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      groupsApi.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success("Guruh tahrirlandi");
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || "Guruhni tahrirlashda xatolik yuz berdi";
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg("Guruh nomini kiriting");
      return;
    }
    if (days.length === 0) {
      setErrorMsg("Kamida bitta dars kunini tanlang");
      return;
    }
    if (!time) {
      setErrorMsg("Dars vaqtini belgilang");
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setErrorMsg("Guruh narxini to'g'ri kiriting");
      return;
    }
    if (paymentType === 'lesson_based' && (!lessonsPerCycle || Number(lessonsPerCycle) <= 0)) {
      setErrorMsg("Darslar sonini to'g'ri kiriting");
      return;
    }

    const payload: any = {
      name: name.trim(),
      days,
      time,
      price: Number(price),
      paymentType,
      ...(paymentType === 'lesson_based'
        ? { lessonsPerCycle: Number(lessonsPerCycle) }
        : {}),
    };

    if (groupToEdit) {
      updateMutation.mutate({ id: groupToEdit.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={groupToEdit ? "Guruhni tahrirlash" : "Yangi guruh yaratish"}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="create-group-form"
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D9488] rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{groupToEdit ? "Saqlash" : "Yaratish"}</span>
          </button>
        </>
      }
    >
      <form id="create-group-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Guruh nomi */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Guruh nomi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Masalan: Fizika №1 (10-sinf)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-medium text-stone-900"
            required
          />
        </div>

        {/* Dars kunlari */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1.5">
            Dars kunlari <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => {
              const isSelected = days.includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(day.key)}
                  className={`py-2 rounded-lg text-[11px] font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vaqti */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Dars vaqti <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-semibold text-stone-900"
            required
          />
        </div>

        {/* Narxi */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1">
            Guruh narxi (so'mda) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="500000"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full px-3 py-2 pr-14 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-semibold text-stone-900"
              required
            />
            <span className="absolute right-3 top-2.5 text-stone-400 font-medium text-xs pointer-events-none">
              so'm
            </span>
          </div>
        </div>

        {/* To'lov turi */}
        <div>
          <label className="block font-semibold text-stone-700 mb-1.5">
            To'lov turi <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                paymentType === 'monthly'
                  ? 'border-[#0F766E] bg-[#0F766E]/5 font-bold text-[#0F766E]'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <input
                type="radio"
                name="paymentType"
                value="monthly"
                checked={paymentType === 'monthly'}
                onChange={() => setPaymentType('monthly')}
                className="accent-[#0F766E]"
              />
              <span>Oylik to'lov</span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                paymentType === 'lesson_based'
                  ? 'border-[#0F766E] bg-[#0F766E]/5 font-bold text-[#0F766E]'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <input
                type="radio"
                name="paymentType"
                value="lesson_based"
                checked={paymentType === 'lesson_based'}
                onChange={() => setPaymentType('lesson_based')}
                className="accent-[#0F766E]"
              />
              <span>Darsga asoslangan</span>
            </label>
          </div>
        </div>

        {/* Conditional Field: Necha dars */}
        {paymentType === 'lesson_based' && (
          <div className="animate-in fade-in zoom-in-95">
            <label className="block font-semibold text-stone-700 mb-1">
              Necha dars (bir sikl uchun) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="12"
              value={lessonsPerCycle}
              onChange={(e) =>
                setLessonsPerCycle(
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-semibold text-stone-900"
              required
            />
          </div>
        )}
      </form>
    </Modal>
  );
};
