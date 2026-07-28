import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { studentsApi } from '../../api/students';
import type { Student } from '../../types/students.types';
import { applyPhoneMask, cleanPhoneNumber, formatPhoneDisplay } from '../../utils/phone.utils';
import toast from 'react-hot-toast';
import { Search, UserPlus, ArrowLeft, Loader2, UserCheck } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  groupId,
}) => {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [searchPhone, setSearchPhone] = useState('+998 ');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Student[] | null>(null);

  // Step 2 form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+998 ');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchPhone('+998 ');
      setIsSearching(false);
      setSearchResults(null);
      setFirstName('');
      setLastName('');
      setPhone('+998 ');
      setParentName('');
      setParentPhone('+998 ');
      setFormError('');
    }
  }, [isOpen]);

  // Handle Search in Step 1
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');

    const cleaned = cleanPhoneNumber(searchPhone);
    if (cleaned.length < 13) {
      setFormError("Telefon raqamini to'liq kiriting (+998 XX XXX XX XX)");
      return;
    }

    try {
      setIsSearching(true);
      const results = await studentsApi.searchStudents(cleaned);
      setSearchResults(results);
    } catch (err: any) {
      toast.error("Qidiruvda xatolik yuz berdi");
    } finally {
      setIsSearching(false);
    }
  };

  // Add existing student mutation
  const addExistingMutation = useMutation({
    mutationFn: (studentId: string) =>
      studentsApi.addStudentToGroup(groupId, { studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupStudents', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success("O'quvchi guruhga qo'shildi");
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || "Guruhga qo'shishda xatolik";
      toast.error(msg);
    },
  });

  // Add new student mutation
  const addNewMutation = useMutation({
    mutationFn: (data: any) => studentsApi.addStudentToGroup(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupStudents', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success("Yangi o'quvchi yaratildi va guruhga qo'shildi");
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || "O'quvchi yaratishda xatolik";
      setFormError(msg);
      toast.error(msg);
    },
  });

  const goToStep2 = () => {
    setStep(2);
    setPhone(searchPhone);
    setFormError('');
  };

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim()) {
      setFormError("Ismni kiriting");
      return;
    }
    if (!lastName.trim()) {
      setFormError("Familiyani kiriting");
      return;
    }
    const cleanP = cleanPhoneNumber(phone);
    if (cleanP.length < 13) {
      setFormError("Telefon raqamini to'g'ri kiriting (+998XXXXXXXXX)");
      return;
    }
    const cleanPP = cleanPhoneNumber(parentPhone);
    if (cleanPP.length < 13) {
      setFormError("Ota-ona telefon raqamini to'g'ri kiriting (+998XXXXXXXXX)");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: cleanP,
      parentName: parentName.trim() || undefined,
      parentPhone: cleanPP,
    };

    addNewMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Guruhga o'quvchi qo'shish" : "Yangi o'quvchi ma'lumotlari"}
      maxWidth="max-w-md"
      footer={
        step === 2 ? (
          <>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={addNewMutation.isPending}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Orqaga</span>
            </button>
            <button
              type="submit"
              form="new-student-form"
              disabled={addNewMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D9488] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {addNewMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Saqlash va qo'shish</span>
            </button>
          </>
        ) : null
      }
    >
      {step === 1 ? (
        /* STEP 1: SEARCH */
        <div className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block font-semibold text-stone-700">
              Telefon raqami bo'yicha qidirish
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="+998 90 123 45 67"
                value={searchPhone}
                onChange={(e) => setSearchPhone(applyPhoneMask(e.target.value))}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-semibold text-stone-900 tabular-nums text-sm"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-[#0F766E] text-white font-semibold rounded-xl hover:bg-[#0D9488] transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Qidirish</span>
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults !== null && (
            <div className="pt-3 border-t border-stone-100 space-y-3">
              {searchResults.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-stone-700 mb-2">
                    Mavjud o'quvchi topildi ({searchResults.length} ta):
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {searchResults.map((st) => (
                      <div
                        key={st.id}
                        className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 hover:border-[#0F766E]/30 transition-all"
                      >
                        <div>
                          <p className="font-bold text-stone-900 text-xs">
                            {st.firstName} {st.lastName}
                          </p>
                          <p className="text-[11px] text-stone-500 tabular-nums">
                            {formatPhoneDisplay(st.phone)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addExistingMutation.mutate(st.id)}
                          disabled={addExistingMutation.isPending}
                          className="px-3 py-1.5 bg-[#0F766E] text-white text-xs font-semibold rounded-lg hover:bg-[#0D9488] transition-colors flex items-center gap-1 shrink-0"
                        >
                          {addExistingMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          <span>Qo'shish</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <p className="text-xs text-stone-600 font-medium mb-3">
                    Ushbu raqam bilan o'quvchi topilmadi.
                  </p>
                  <button
                    type="button"
                    onClick={goToStep2}
                    className="w-full py-2 px-3 bg-[#0F766E] text-white text-xs font-semibold rounded-xl hover:bg-[#0D9488] transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Yangi o'quvchi sifatida qo'shish</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: NEW STUDENT FORM */
        <form
          id="new-student-form"
          onSubmit={handleCreateStudentSubmit}
          className="space-y-3.5 text-xs"
        >
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {formError}
            </div>
          )}

          {/* Ismi */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Ismi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masalan: Ali"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-[#E7E5E4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-medium text-stone-900"
              required
            />
          </div>

          {/* Familiyasi */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Familiyasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masalan: Valiyev"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-[#E7E5E4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-medium text-stone-900"
              required
            />
          </div>

          {/* Telefon raqami */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Telefon raqami <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(applyPhoneMask(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 border border-[#E7E5E4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-semibold text-stone-900 tabular-nums"
              required
            />
          </div>

          {/* Ota-ona ismi (IXTIYORIY) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Ota-ona ismi <span className="text-stone-400 font-normal">(ixtiyoriy)</span>
            </label>
            <input
              type="text"
              placeholder="Masalan: Hikmat Valiyev"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-[#E7E5E4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-medium text-stone-900"
            />
          </div>

          {/* Ota-ona telefon raqami (MAJBURIY) */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Ota-ona telefon raqami <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={parentPhone}
              onChange={(e) => setParentPhone(applyPhoneMask(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 border border-[#E7E5E4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] font-semibold text-stone-900 tabular-nums"
              required
            />
          </div>
        </form>
      )}
    </Modal>
  );
};
