import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, User, Phone, Trash2 } from 'lucide-react';
import type { GroupStudentItem } from '../../types/students.types';
import { formatPhoneDisplay } from '../../utils/phone.utils';

interface StudentRowProps {
  student: GroupStudentItem;
  onRemove: (student: GroupStudentItem) => void;
}

export const StudentRow: React.FC<StudentRowProps> = ({ student, onRemove }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRowClick = () => {
    navigate(`/dashboard/students/${student.id}`);
  };

  return (
    <tr
      onClick={handleRowClick}
      className="group hover:bg-stone-50/80 transition-colors cursor-pointer border-b border-stone-100 last:border-0"
    >
      {/* Student Name */}
      <td className="py-3 px-4 text-xs font-bold text-stone-900 group-hover:text-[#0F766E] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
            {student.firstName[0]}
            {student.lastName[0]}
          </div>
          <div>
            <p className="leading-tight font-bold text-stone-900">
              {student.firstName} {student.lastName}
            </p>
            <span className="text-[10px] text-stone-400 font-normal">
              Qo'shilgan: {new Date(student.joinedAt).toLocaleDateString('uz-UZ')}
            </span>
          </div>
        </div>
      </td>

      {/* Student Phone */}
      <td className="py-3 px-4 text-xs font-semibold text-stone-800 tabular-nums">
        <div className="flex items-center gap-1.5 text-stone-700">
          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>{formatPhoneDisplay(student.phone)}</span>
        </div>
      </td>

      {/* Parent Phone & Name */}
      <td className="py-3 px-4 text-xs font-medium text-stone-600 tabular-nums">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="text-[10px] font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
              Ota-onasi
            </span>
            <span>{formatPhoneDisplay(student.parentPhone)}</span>
          </div>
          {student.parentName && (
            <p className="text-[11px] text-stone-400 font-normal pl-1">
              ({student.parentName})
            </p>
          )}
        </div>
      </td>

      {/* Action Menu */}
      <td className="py-3 px-4 text-right shrink-0">
        <div className="relative inline-block" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-stone-200 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 text-left">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  navigate(`/dashboard/students/${student.id}`);
                }}
                className="w-full px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-stone-500" />
                Profilni ko'rish
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRemove(student);
                }}
                className="w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                Guruhdan chiqarish
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
