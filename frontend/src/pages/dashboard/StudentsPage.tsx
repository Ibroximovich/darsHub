import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Search,
  Phone,
  FolderKanban,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { studentsApi } from '../../api/students';
import { formatPhoneDisplay } from '../../utils/phone.utils';

export const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: students = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['students-all'],
    queryFn: () => studentsApi.searchStudents(),
  });

  // Client-side filtering by name or phone
  const filteredStudents = students.filter((st: any) => {
    const fullName = `${st.firstName} ${st.lastName}`.toLowerCase();
    const phone = (st.phone || '').toLowerCase();
    const search = searchTerm.toLowerCase().trim();
    return fullName.includes(search) || phone.includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            O'quvchilar
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Barcha o'quvchilar ro'yxati va ularning guruhlari
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-xs font-medium text-stone-900 shadow-2xs"
          />
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F766E] mb-3" />
          <p className="text-xs font-medium">O'quvchilar ro'yxati yuklanmoqda...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm font-semibold mb-3">
            O'quvchilar ro'yxatini yuklashda xatolik yuz berdi
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center my-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            {searchTerm ? "O'quvchi topilmadi" : "Hali o'quvchi qo'shilmagan"}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
            {searchTerm
              ? "Qidiruv bo'yicha hech qanday o'quvchi mos kelmadi."
              : "O'quvchilarni guruhlar sahifasi orqali guruhlarga biriktirishingiz mumkin."}
          </p>
        </div>
      ) : (
        /* Students List */
        <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Jami o'quvchilar: {filteredStudents.length} ta</span>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredStudents.map((st: any) => {
              const activeLinks = (st.groupLinks || []).filter(
                (l: any) => l.status === 'active'
              );
              return (
                <div
                  key={st.id}
                  onClick={() => navigate(`/dashboard/students/${st.id}`)}
                  className="p-4 hover:bg-stone-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-sm shrink-0">
                      {st.firstName[0]}
                      {st.lastName[0]}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-stone-900 group-hover:text-[#0F766E] transition-colors flex items-center gap-2">
                        <span>
                          {st.firstName} {st.lastName}
                        </span>
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-0.5">
                        <span className="flex items-center gap-1 font-semibold tabular-nums">
                          <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
                          {formatPhoneDisplay(st.phone)}
                        </span>
                        {st.parentPhone && (
                          <span className="text-stone-500 tabular-nums">
                            Ota-onasi: {formatPhoneDisplay(st.parentPhone)}
                            {st.parentName && ` (${st.parentName})`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Group Badges & Arrow */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {activeLinks.length === 0 ? (
                        <span className="text-[11px] text-stone-400 italic">
                          Guruhsiz
                        </span>
                      ) : (
                        activeLinks.map((link: any) => (
                          <span
                            key={link.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#0F766E]/10 text-[#0F766E]"
                          >
                            <FolderKanban className="w-3 h-3" />
                            {link.group?.name}
                          </span>
                        ))
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#0F766E] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
