import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  CalendarDays,
  Banknote,
} from 'lucide-react';
import type { Group, DayOfWeek } from '../../types/groups.types';

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Dush',
  tuesday: 'Sesh',
  wednesday: 'Chor',
  thursday: 'Pay',
  friday: 'Juma',
  saturday: 'Shan',
  sunday: 'Yak',
};

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onEdit,
  onDelete,
}) => {
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

  const formatDays = (days: DayOfWeek[]) => {
    if (!days || days.length === 0) return 'Belgilanmagan';
    return days.map((d) => DAY_LABELS[d] || d).join(', ');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('uz-UZ') + " so'm";
  };

  const handleCardClick = () => {
    navigate(`/dashboard/groups/${group.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#0F766E]/30 transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Top row: Name & Action Menu */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-base text-stone-900 group-hover:text-[#0F766E] transition-colors line-clamp-1">
            {group.name}
          </h3>

          {/* Three-dot menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              type="button"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-stone-200 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(group);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5 text-stone-500" />
                  Tahrirlash
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(group);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  O'chirish
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Days */}
        <div className="space-y-2 text-xs text-stone-600 mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#0F766E]/70 shrink-0" />
            <span className="font-medium text-stone-700">
              {formatDays(group.days)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0F766E]/70 shrink-0" />
            <span className="font-semibold text-stone-900">{group.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#0F766E]/70 shrink-0" />
            <span className="font-bold text-stone-900">
              {formatPrice(group.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Badges */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        {/* Payment Type Badge */}
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#0F766E]/10 text-[#0F766E]">
          {group.paymentType === 'monthly'
            ? 'Oylik'
            : `${group.lessonsPerCycle || 12} darslik`}
        </span>

        {/* Student Count Badge */}
        <div className="flex items-center gap-1.5 text-stone-600 font-semibold">
          <Users className="w-3.5 h-3.5 text-stone-400" />
          <span>{group.studentsCount ?? 0} ta o'quvchi</span>
        </div>
      </div>
    </div>
  );
};
