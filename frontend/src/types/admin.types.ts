export interface AdminStats {
  totalUsers: number;
  activeGroups: number;
  totalStudents: number;
  currentMonthRevenue: number;
  totalRevenue: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    groups: number;
    students: number;
  };
}

export interface AdminGroup {
  id: string;
  userId: string;
  name: string;
  days: string[];
  time: string;
  price: number;
  paymentType: string;
  lessonsPerCycle?: number;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  _count: {
    studentLinks: number;
    lessons: number;
  };
}

export interface AdminStudent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  parentName?: string;
  parentPhone: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  groupLinks: {
    group: {
      id: string;
      name: string;
    };
  }[];
}

export interface AdminPayment {
  id: string;
  groupStudentId: string;
  period: string;
  amount: number;
  status: 'paid' | 'unpaid';
  paidAt?: string;
  createdAt: string;
  groupStudent: {
    student: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
    group: {
      id: string;
      name: string;
      user: {
        id: string;
        fullName: string;
        email: string;
      };
    };
  };
}

export interface AdminPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
}
