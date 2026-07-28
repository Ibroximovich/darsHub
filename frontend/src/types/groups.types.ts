export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type PaymentType = 'monthly' | 'lesson_based';

export interface Group {
  id: string;
  userId: string;
  name: string;
  days: DayOfWeek[];
  time: string;
  price: number;
  paymentType: PaymentType;
  lessonsPerCycle?: number | null;
  studentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupInput {
  name: string;
  days: DayOfWeek[];
  time: string;
  price: number;
  paymentType: PaymentType;
  lessonsPerCycle?: number;
}

export interface UpdateGroupInput {
  name?: string;
  days?: DayOfWeek[];
  time?: string;
  price?: number;
  paymentType?: PaymentType;
  lessonsPerCycle?: number | null;
}
