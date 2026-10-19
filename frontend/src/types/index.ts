export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day';

export interface StudentEmployee {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
  phone?: string;
  joinDate: string;
  status: 'active' | 'inactive';
  attendancePercentage: number;
  initials: string;
}

export interface AttendanceRecord {
  id: string;
  personId: string;
  personName: string;
  employeeId: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface ActivityItem {
  id: string;
  personName: string;
  department: string;
  type: 'check-in' | 'check-out' | 'status-change' | 'marked';
  status: AttendanceStatus;
  timestamp: string;
  timeAgo: string;
}

export interface AppSettings {
  orgName: string;
  adminName: string;
  adminEmail: string;
  timezone: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
  gracePeriodMins: number;
  lateThresholdMins: number;
  halfDayMinHours: number;
  theme: 'monochrome-light' | 'monochrome-minimal' | 'monochrome-dark';
  workingDays: string[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
