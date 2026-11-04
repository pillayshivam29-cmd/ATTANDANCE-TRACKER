import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Info,
  School,
  GraduationCap,
  Sparkles,
  Search,
  Send,
  Phone,
  Trash2,
  X,
  CheckCheck,
  Download,
  MessageSquare,
  Users,
  LayoutGrid,
  List,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { UserSession } from '../auth/RoleLogin';

// ==========================================
// 1. DATA TYPES
// ==========================================
export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface TeacherAttendanceItem {
  id: string;
  name: string;
  subject: string;
  department: string;
  assignedClass: string;
  phone: string;
  checkIn: string;
  checkOut?: string;
  status: AttendanceStatus;
}

export interface StudentAttendanceItem {
  id: string;
  admissionNo: string;
  name: string;
  gradeClass: string;
  parentName: string;
  parentPhone: string;
  checkIn: string;
  status: AttendanceStatus;
}

export interface DayRecord {
  teachers: TeacherAttendanceItem[];
  students: StudentAttendanceItem[];
  finalizedAt?: string;
  submittedBy?: string;
}

export interface SmsAlertLog {
  id: string;
  studentName: string;
  admissionNo: string;
  parentPhone: string;
  parentName: string;
  date: string;
  time: string;
  message: string;
}

// ==========================================
// 2. INITIAL BASE ROSTERS
// ==========================================
const BASE_TEACHERS: TeacherAttendanceItem[] = [
  { id: 'FAC-101', name: 'Prof. Marcus Chen', subject: 'Mathematics', department: 'Science & Math', assignedClass: 'Grade 10-A', phone: '+91 98765-43210', checkIn: '08:15 AM', status: 'present' },
  { id: 'FAC-102', name: 'Dr. Sophia Rodriguez', subject: 'Physics & Lab', department: 'Science & Math', assignedClass: 'Grade 11-A', phone: '+91 98765-43211', checkIn: '08:20 AM', status: 'present' },
  { id: 'FAC-103', name: 'Julian Hayes', subject: 'English Literature', department: 'Languages', assignedClass: 'Grade 10-B', phone: '+91 98765-43212', checkIn: '08:45 AM', status: 'late' },
  { id: 'FAC-104', name: 'Amara Okafor', subject: 'Chemistry', department: 'Science & Math', assignedClass: 'Grade 12-A', phone: '+91 98765-43213', checkIn: '--', status: 'absent' },
  { id: 'FAC-105', name: 'Rajesh Sharma', subject: 'Computer Science', department: 'Technology', assignedClass: 'Grade 11-B', phone: '+91 98765-43214', checkIn: '08:05 AM', status: 'present' },
  { id: 'FAC-106', name: 'Priya Patel', subject: 'Social Studies', department: 'Humanities', assignedClass: 'Grade 9-A', phone: '+91 98765-43215', checkIn: '08:25 AM', status: 'present' },
];

const BASE_STUDENTS: StudentAttendanceItem[] = [
  { id: 'STU-101', admissionNo: '22272', name: 'piyush kumar varma', gradeClass: 'Grade 10-A', parentName: 'Parent / Guardian', parentPhone: '+91 9876543210', checkIn: '08:15 AM', status: 'present' },
  { id: 'STU-102', admissionNo: '19554', name: 'kunal raj singh', gradeClass: 'Grade 10-A', parentName: 'Parent / Guardian', parentPhone: '+91 9876543211', checkIn: '08:15 AM', status: 'present' },
  { id: 'STU-103', admissionNo: '99', name: 'akash pillay', gradeClass: 'Grade 10-A', parentName: 'Parent / Guardian', parentPhone: '+91 98000-00000', checkIn: '08:15 AM', status: 'present' },
  { id: 'STU-104', admissionNo: '56748', name: 'purvi jain', gradeClass: 'Grade 11-A', parentName: 'Parent / Guardian', parentPhone: '+91 9876543215', checkIn: '08:15 AM', status: 'present' },
  { id: 'STU-105', admissionNo: '98789', name: 'rachit jain', gradeClass: 'Grade 11-A', parentName: 'Parent / Guardian', parentPhone: '+91 9876543214', checkIn: '08:15 AM', status: 'present' },
  { id: 'STU-106', admissionNo: '11111', name: 'ritul singh', gradeClass: 'Grade 10-B', parentName: 'Parent / Guardian', parentPhone: '+91 9876543213', checkIn: '08:15 AM', status: 'present' },
  { id: 'STU-107', admissionNo: '20163', name: 'shivam pillay', gradeClass: 'Grade 10-B', parentName: 'Parent / Guardian', parentPhone: '+91 9876543212', checkIn: '08:15 AM', status: 'present' },
];

// Helper to get Today's Date in YYYY-MM-DD
const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface AttendanceCalendarViewProps {
  userSession?: UserSession | null;
}

export const AttendanceCalendarView: React.FC<AttendanceCalendarViewProps> = ({
  userSession: propUserSession,
}) => {
  // 1. Identify User Session (Props or LocalStorage)
  const userSession = useMemo<UserSession | null>(() => {
    if (propUserSession) return propUserSession;
    try {
      const saved = localStorage.getItem('attendly_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [propUserSession]);

  const isTeacher = userSession?.role === 'teacher';

  // Identify Teacher's assigned class if logged in as teacher
  const currentTeacherClass = useMemo(() => {
    if (!isTeacher) return null;
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      const teachers = saved ? JSON.parse(saved) : [];
      const found = teachers.find(
        (t: any) =>
          (t.email && userSession?.email && t.email.toLowerCase() === userSession.email.toLowerCase()) ||
          (t.name && userSession?.name && t.name.toLowerCase() === userSession.name.toLowerCase())
      );
      return found?.assignedClass || userSession?.departmentOrClass || 'Grade 10-A';
    } catch {
      return userSession?.departmentOrClass || 'Grade 10-A';
    }
  }, [isTeacher, userSession]);

  // Real-Time Today Date
  const todayDateStr = useMemo(() => getTodayDateStr(), []);

  // Calendar View month & year (defaults to real current month & year)
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  // Selected date (defaults to today's real date)
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  // Roll Call active sub-tab: 'students' | 'teachers' | 'sms'
  const [activeRollCallTab, setActiveRollCallTab] = useState<'students' | 'teachers' | 'sms'>('students');

  // Unified Date-based Storage: Record<"YYYY-MM-DD", DayRecord>
  const [dateRecords, setDateRecords] = useState<Record<string, DayRecord>>(() => {
    try {
      const saved = localStorage.getItem('attendly_att_by_date_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }

      // Seed initial record with existing localStorage data for today
      const todayTeachers = JSON.parse(localStorage.getItem('attendly_teachers_att_v2') || 'null') || BASE_TEACHERS;
      const todayStudents = JSON.parse(localStorage.getItem('attendly_students_att_v2') || 'null') || BASE_STUDENTS;

      const initialMap: Record<string, DayRecord> = {
        [todayDateStr]: {
          teachers: todayTeachers,
          students: todayStudents,
        },
      };

      // Seed past days of the current month with realistic attendance
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      for (let d = 1; d < currentDay; d++) {
        const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const daySeed = (d * 7) % 5;
        const pastTeachers = todayTeachers.map((t: TeacherAttendanceItem, idx: number) => ({
          ...t,
          status: idx === (daySeed % todayTeachers.length) && daySeed > 2 ? 'absent' : 'present',
        }));
        const pastStudents = todayStudents.map((s: StudentAttendanceItem, idx: number) => ({
          ...s,
          status: idx === (daySeed % todayStudents.length) ? 'absent' : idx === (daySeed + 1) % todayStudents.length ? 'late' : 'present',
        }));
        initialMap[dStr] = { teachers: pastTeachers, students: pastStudents };
      }

      localStorage.setItem('attendly_att_by_date_v3', JSON.stringify(initialMap));
      return initialMap;
    } catch {
      return {
        [todayDateStr]: {
          teachers: BASE_TEACHERS,
          students: BASE_STUDENTS,
        },
      };
    }
  });

  // 🛡️ AUTO-HEALING EFFECT: Repairs any missing teachers/students arrays in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('attendly_att_by_date_v3');
      if (raw) {
        const parsed = JSON.parse(raw);
        let modified = false;

        const defaultTeachers = JSON.parse(localStorage.getItem('attendly_teachers_att_v2') || 'null') || BASE_TEACHERS;
        const defaultStudents = JSON.parse(localStorage.getItem('attendly_students_att_v2') || 'null') || BASE_STUDENTS;

        Object.keys(parsed).forEach((k) => {
          if (!Array.isArray(parsed[k].teachers)) {
            parsed[k].teachers = defaultTeachers;
            modified = true;
          }
          if (!Array.isArray(parsed[k].students)) {
            parsed[k].students = defaultStudents;
            modified = true;
          }
        });

        if (modified) {
          localStorage.setItem('attendly_att_by_date_v3', JSON.stringify(parsed));
          setDateRecords(parsed);
        }
      }
    } catch (e) {
      console.warn('Auto-repairing calendar data error:', e);
    }
  }, []);

  // SMS Alert Logs State
  const [smsLogs, setSmsLogs] = useState<SmsAlertLog[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_sms_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Floating SMS Toast alert
  const [latestSmsAlert, setLatestSmsAlert] = useState<SmsAlertLog | null>(null);

  // Filters & Search for Roll Call
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [classFilter, setClassFilter] = useState<string>(() => {
    return isTeacher && currentTeacherClass ? currentTeacherClass : 'all';
  });

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);

  // Form states
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAdm, setNewStudentAdm] = useState('');
  const [newStudentClass, setNewStudentClass] = useState(() => currentTeacherClass || 'Grade 10-A');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');

  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('');
  const [newTeacherDept, setNewTeacherDept] = useState('Science & Math');
  const [newTeacherClass, setNewTeacherClass] = useState('Grade 10-A');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');

  // Month Names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month Navigation
  const handlePrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDate(todayDateStr);
  };

  // Days in selected calendar month
  const firstDayOfWeek = new Date(viewDate.year, viewDate.month, 1).getDay();
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();

  // Helper to get or initialize day record safely
  const getDayRecord = (dateStr: string): DayRecord => {
    const defaultTeachers = (Array.isArray(dateRecords[todayDateStr]?.teachers) && dateRecords[todayDateStr].teachers.length > 0)
      ? dateRecords[todayDateStr].teachers
      : BASE_TEACHERS;

    const defaultStudents = (Array.isArray(dateRecords[todayDateStr]?.students) && dateRecords[todayDateStr].students.length > 0)
      ? dateRecords[todayDateStr].students
      : BASE_STUDENTS;

    if (dateRecords[dateStr]) {
      const rec = dateRecords[dateStr];
      return {
        teachers: Array.isArray(rec.teachers) && rec.teachers.length > 0
          ? rec.teachers
          : defaultTeachers.map((t) => ({ ...t, status: 'present', checkIn: '08:30 AM' })),
        students: Array.isArray(rec.students) && rec.students.length > 0
          ? rec.students
          : defaultStudents.map((s) => ({ ...s, status: 'present', checkIn: '08:15 AM' })),
        finalizedAt: rec.finalizedAt,
        submittedBy: rec.submittedBy,
      };
    }

    // Fallback
    return {
      teachers: defaultTeachers.map((t) => ({ ...t, status: 'present', checkIn: '08:30 AM' })),
      students: defaultStudents.map((s) => ({ ...s, status: 'present', checkIn: '08:15 AM' })),
    };
  };

  // Helper to get day statistics for any cell in the calendar
  const getCellStats = (dayNum: number) => {
    const formattedDay = dayNum.toString().padStart(2, '0');
    const formattedMonth = (viewDate.month + 1).toString().padStart(2, '0');
    const dateStr = `${viewDate.year}-${formattedMonth}-${formattedDay}`;

    const record = getDayRecord(dateStr);
    const studentsArr = Array.isArray(record?.students) ? record.students : [];
    const teachersArr = Array.isArray(record?.teachers) ? record.teachers : [];

    // Scope to teacher's class if logged in as teacher:
    const targetStudents = isTeacher && currentTeacherClass
      ? studentsArr.filter((s) => (s.gradeClass || (s as any).department) === currentTeacherClass)
      : studentsArr;

    const sTotal = targetStudents.length;
    const sPresent = targetStudents.filter((s) => s.status === 'present').length;
    const sLate = targetStudents.filter((s) => s.status === 'late').length;
    const sAbsent = targetStudents.filter((s) => s.status === 'absent').length;

    const tTotal = teachersArr.length;
    const tPresent = teachersArr.filter((t) => t.status === 'present').length;
    const tLate = teachersArr.filter((t) => t.status === 'late').length;
    const tAbsent = teachersArr.filter((t) => t.status === 'absent').length;

    const totalCombined = isTeacher ? sTotal : sTotal + tTotal;
    const presentCombined = isTeacher ? sPresent : sPresent + tPresent;
    const lateCombined = isTeacher ? sLate : sLate + tLate;
    const rate = totalCombined > 0 ? Math.round(((presentCombined + lateCombined * 0.8) / totalCombined) * 100) : 0;

    const isToday = dateStr === todayDateStr;
    const isSelected = dateStr === selectedDate;
    const hasData = Boolean(dateRecords[dateStr]) || isToday;

    return {
      dateStr,
      isToday,
      isSelected,
      hasData,
      sTotal,
      sPresent,
      sAbsent,
      sLate,
      tTotal,
      tPresent,
      tAbsent,
      tLate,
      rate,
    };
  };

  // Active Selected Day Data
  const activeDayRecord = useMemo(() => {
    return getDayRecord(selectedDate);
  }, [selectedDate, dateRecords]);

  // Selected Day Statistics
  const selectedStats = useMemo(() => {
    const studentsArr = Array.isArray(activeDayRecord?.students) ? activeDayRecord.students : [];
    const teachersArr = Array.isArray(activeDayRecord?.teachers) ? activeDayRecord.teachers : [];

    const targetStudents = isTeacher && currentTeacherClass
      ? studentsArr.filter((s) => (s.gradeClass || (s as any).department) === currentTeacherClass)
      : studentsArr;

    const sTotal = targetStudents.length;
    const sPresent = targetStudents.filter((s) => s.status === 'present').length;
    const sLate = targetStudents.filter((s) => s.status === 'late').length;
    const sAbsent = targetStudents.filter((s) => s.status === 'absent').length;
    const sRate = sTotal > 0 ? Math.round(((sPresent + sLate) / sTotal) * 100) : 0;

    const tTotal = teachersArr.length;
    const tPresent = teachersArr.filter((t) => t.status === 'present').length;
    const tLate = teachersArr.filter((t) => t.status === 'late').length;
    const tAbsent = teachersArr.filter((t) => t.status === 'absent').length;
    const tRate = tTotal > 0 ? Math.round(((tPresent + tLate) / tTotal) * 100) : 0;

    return {
      sTotal,
      sPresent,
      sLate,
      sAbsent,
      sRate,
      tTotal,
      tPresent,
      tLate,
      tAbsent,
      tRate,
    };
  }, [activeDayRecord, isTeacher, currentTeacherClass]);

  // Save changes to date-indexed records
  const updateDayRecord = (dateStr: string, updated: DayRecord) => {
    // If teacher is updating, merge students with other classes' students:
    let finalStudents = updated.students;
    if (isTeacher && currentTeacherClass) {
      const prevDay = dateRecords[dateStr] || getDayRecord(dateStr);
      const otherStudents = (Array.isArray(prevDay.students) ? prevDay.students : []).filter(
        (s) => (s.gradeClass || (s as any).department) !== currentTeacherClass
      );
      finalStudents = [...otherStudents, ...updated.students];
    }

    const safeRecord: DayRecord = {
      teachers: Array.isArray(updated.teachers) ? updated.teachers : (dateRecords[dateStr]?.teachers || BASE_TEACHERS),
      students: finalStudents,
      finalizedAt: updated.finalizedAt || activeDayRecord.finalizedAt,
      submittedBy: updated.submittedBy || userSession?.name,
    };

    const newRecords = {
      ...dateRecords,
      [dateStr]: safeRecord,
    };
    setDateRecords(newRecords);
    localStorage.setItem('attendly_att_by_date_v3', JSON.stringify(newRecords));

    // If updating today's date, also sync to master attendance keys
    if (dateStr === todayDateStr) {
      localStorage.setItem('attendly_students_att_v2', JSON.stringify(finalStudents));
      if (!isTeacher) {
        localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(safeRecord.teachers));
      }
    }
  };

  // 📲 SEND ABSENTEE PARENT SMS
  const sendAbsentSmsAlert = (student: StudentAttendanceItem, dateOfAbsence: string) => {
    const timeNow = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date());
    const message = `Dear Parent, your ward ${student.name} (${student.admissionNo}, ${student.gradeClass}) was marked ABSENT on ${dateOfAbsence}. Please contact the school office. - Attendly Academy`;

    const newLog: SmsAlertLog = {
      id: `SMS-${Date.now()}`,
      studentName: student.name,
      admissionNo: student.admissionNo,
      parentPhone: student.parentPhone || '+91 98000-00000',
      parentName: student.parentName,
      date: dateOfAbsence,
      time: timeNow,
      message,
    };

    const updatedLogs = [newLog, ...smsLogs];
    setSmsLogs(updatedLogs);
    localStorage.setItem('attendly_sms_logs_v1', JSON.stringify(updatedLogs));

    setLatestSmsAlert(newLog);
    setTimeout(() => {
      setLatestSmsAlert((prev) => (prev?.id === newLog.id ? null : prev));
    }, 6000);
  };

  // Change Student Status
  const handleStudentStatusChange = (id: string, newStatus: AttendanceStatus) => {
    let absentTarget: StudentAttendanceItem | null = null;

    const currentStudents = Array.isArray(activeDayRecord?.students) ? activeDayRecord.students : [];
    const updatedStudents = currentStudents.map((s) => {
      if (s.id === id) {
        if (newStatus === 'absent') absentTarget = s;
        return {
          ...s,
          status: newStatus,
          checkIn: newStatus === 'absent' ? '--' : s.checkIn === '--' ? '08:15 AM' : s.checkIn,
        };
      }
      return s;
    });

    const updatedRecord: DayRecord = {
      ...activeDayRecord,
      students: updatedStudents,
    };

    updateDayRecord(selectedDate, updatedRecord);

    if (absentTarget) {
      sendAbsentSmsAlert(absentTarget, selectedDate);
    }
  };

  // Change Teacher Status
  const handleTeacherStatusChange = (id: string, newStatus: AttendanceStatus) => {
    const currentTeachers = Array.isArray(activeDayRecord?.teachers) ? activeDayRecord.teachers : [];
    const updatedTeachers = currentTeachers.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          checkIn: newStatus === 'absent' ? '--' : t.checkIn === '--' ? '08:30 AM' : t.checkIn,
        };
      }
      return t;
    });

    const updatedRecord: DayRecord = {
      ...activeDayRecord,
      teachers: updatedTeachers,
    };

    updateDayRecord(selectedDate, updatedRecord);
  };

  // Add Student
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const assignedTargetClass = isTeacher && currentTeacherClass ? currentTeacherClass : newStudentClass;
    const currentStudents = Array.isArray(activeDayRecord?.students) ? activeDayRecord.students : [];

    const newStudent: StudentAttendanceItem = {
      id: `STU-${Date.now()}`,
      admissionNo: newStudentAdm.trim() || `ADM-2026-${100 + currentStudents.length + 1}`,
      name: newStudentName.trim(),
      gradeClass: assignedTargetClass,
      parentName: newParentName.trim() || 'Parent/Guardian',
      parentPhone: newParentPhone.trim() || '+91 98000-00000',
      checkIn: '08:15 AM',
      status: 'present',
    };

    const updatedRecord: DayRecord = {
      ...activeDayRecord,
      students: [...currentStudents, newStudent],
    };

    updateDayRecord(selectedDate, updatedRecord);
    setNewStudentName('');
    setNewStudentAdm('');
    setNewParentName('');
    setNewParentPhone('');
    setIsAddStudentOpen(false);
  };

  // Add Teacher
  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;

    const currentTeachers = Array.isArray(activeDayRecord?.teachers) ? activeDayRecord.teachers : [];
    const newTeacher: TeacherAttendanceItem = {
      id: `FAC-${100 + currentTeachers.length + 1}`,
      name: newTeacherName.trim(),
      subject: newTeacherSubject.trim() || 'General Subject',
      department: newTeacherDept,
      assignedClass: newTeacherClass,
      phone: newTeacherPhone.trim() || '+91 98000-00000',
      checkIn: '08:30 AM',
      status: 'present',
    };

    const updatedRecord: DayRecord = {
      ...activeDayRecord,
      teachers: [...currentTeachers, newTeacher],
    };

    updateDayRecord(selectedDate, updatedRecord);
    setNewTeacherName('');
    setNewTeacherSubject('');
    setNewTeacherPhone('');
    setIsAddTeacherOpen(false);
  };

  // Delete Student
  const handleDeleteStudent = (id: string) => {
    const currentStudents = Array.isArray(activeDayRecord?.students) ? activeDayRecord.students : [];
    const updated = currentStudents.filter((s) => s.id !== id);
    updateDayRecord(selectedDate, { ...activeDayRecord, students: updated });
  };

  // Delete Teacher
  const handleDeleteTeacher = (id: string) => {
    const currentTeachers = Array.isArray(activeDayRecord?.teachers) ? activeDayRecord.teachers : [];
    const updated = currentTeachers.filter((t) => t.id !== id);
    updateDayRecord(selectedDate, { ...activeDayRecord, teachers: updated });
  };

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    const studentsArr = Array.isArray(activeDayRecord?.students) ? activeDayRecord.students : [];
    return studentsArr.filter((s) => {
      // If teacher is logged in, restrict to teacher's class:
      if (isTeacher && currentTeacherClass && (s.gradeClass || (s as any).department) !== currentTeacherClass) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mName = (s.name || '').toLowerCase().includes(q);
        const mAdm = (s.admissionNo || '').toLowerCase().includes(q);
        const mParent = (s.parentName || '').toLowerCase().includes(q);
        if (!mName && !mAdm && !mParent) return false;
      }
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (classFilter !== 'all' && s.gradeClass !== classFilter) return false;
      return true;
    });
  }, [activeDayRecord, searchQuery, statusFilter, classFilter, isTeacher, currentTeacherClass]);

  // Filtered Teachers list
  const filteredTeachers = useMemo(() => {
    const teachersArr = Array.isArray(activeDayRecord?.teachers) ? activeDayRecord.teachers : [];
    return teachersArr.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mName = (t.name || '').toLowerCase().includes(q);
        const mSub = (t.subject || '').toLowerCase().includes(q);
        const mId = (t.id || '').toLowerCase().includes(q);
        if (!mName && !mSub && !mId) return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    });
  }, [activeDayRecord, searchQuery, statusFilter]);

  // Formatted Selected Date
  const formattedSelectedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(selectedDate + 'T00:00:00'));
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="w-full space-y-6">
      {/* ======================================================== */}
      {/* 📲 FLOATING REAL-TIME SMS ALERT NOTIFICATION BANNER */}
      {/* ======================================================== */}
      {latestSmsAlert && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-zinc-950 text-white p-4 rounded-2xl shadow-2xl border border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Send size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Parent SMS Dispatched</span>
                  <CheckCheck size={13} className="text-emerald-400" />
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono">
                  To: {latestSmsAlert.parentPhone} ({latestSmsAlert.parentName})
                </p>
              </div>
            </div>
            <button
              onClick={() => setLatestSmsAlert(null)}
              className="text-zinc-500 hover:text-white p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-2.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed font-mono">
            "{latestSmsAlert.message}"
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Sent for {latestSmsAlert.date}</span>
            <span className="text-emerald-400 font-semibold font-mono">Delivered ✅</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP HEADER & MONTH CONTROLS */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                  {isTeacher
                    ? `${currentTeacherClass} Monthly Attendance Calendar`
                    : 'Monthly Calendar & Live Attendance Tracker'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isTeacher ? `Teacher: ${userSession?.name || 'Class In-Charge'}` : 'Live Real-Time'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isTeacher
                  ? `Full month attendance matrix and live roll call logs for your assigned class: ${currentTeacherClass}`
                  : 'Full month calendar tracking exact Students & Teachers present each day, unified with live daily roll call.'}
              </p>
            </div>
          </div>
        </div>

        {/* Date Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 transition-colors shadow-2xs cursor-pointer"
          >
            <CalendarIcon size={14} className="text-zinc-500" />
            <span>Go to Today</span>
          </button>

          <div className="flex items-center border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3.5 text-xs font-bold font-mono text-zinc-900 border-x border-zinc-200">
              {monthNames[viewDate.month]} {viewDate.year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP MONTHLY SUMMARY METRIC CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Students Present */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider font-mono">
              {isTeacher ? `${currentTeacherClass} Present Today` : 'Students Present Today'}
            </span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 tracking-tight flex items-baseline gap-1.5">
              <span>{selectedStats.sPresent}</span>
              <span className="text-xs font-normal text-zinc-400">
                / {selectedStats.sTotal} Students
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Live synchronized in real time</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
        </div>

        {/* Card 2: Classroom Assignment / Teachers Present */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider font-mono">
              {isTeacher ? 'Classroom Assignment' : 'Teachers Present Today'}
            </span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 tracking-tight flex items-baseline gap-1.5">
              <span>
                {isTeacher
                  ? currentTeacherClass
                  : (dateRecords[todayDateStr]?.teachers || BASE_TEACHERS).filter((t) => t.status === 'present').length}
              </span>
              {!isTeacher && (
                <span className="text-xs font-normal text-zinc-400">
                  / {(dateRecords[todayDateStr]?.teachers || BASE_TEACHERS).length} Faculty
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {isTeacher ? `In-Charge: ${userSession?.name || 'Class Teacher'}` : 'On duty in classrooms & labs'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
            <School size={20} />
          </div>
        </div>

        {/* Card 3: Selected Date Status */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Selected Date Roll Call
            </span>
            <div className="text-xl font-bold text-zinc-950 mt-0.5 tracking-tight truncate max-w-[180px]">
              {selectedDate === todayDateStr ? 'TODAY' : selectedDate}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {isTeacher ? (
                `🎓 ${selectedStats.sPresent}/${selectedStats.sTotal} ${currentTeacherClass} Students`
              ) : (
                `🎓 ${selectedStats.sPresent}/${selectedStats.sTotal} Stud • 👨‍🏫 ${selectedStats.tPresent}/${selectedStats.tTotal} Teach`
              )}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 4: Automated Absentee SMS Dispatched */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Parent SMS Dispatches
            </span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 tracking-tight">
              {smsLogs.length} <span className="text-xs font-normal text-zinc-400">Alerts Sent</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Instant Parent absentee notices</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <Send size={20} />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MONTHLY CALENDAR GRID (FULL WIDTH) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-900">
              {monthNames[viewDate.month]} {viewDate.year} {isTeacher ? `— ${currentTeacherClass} Matrix` : 'Attendance Matrix'}
            </h2>
            <span className="text-xs text-zinc-400 font-normal">
              (Click any date box to view & manage its daily roll call)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span>{isTeacher ? currentTeacherClass : 'Students'}</span>
            </span>
            {!isTeacher && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900 inline-block" />
                <span>Teachers</span>
              </span>
            )}
          </div>
        </div>

        {/* Day-of-Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Padding Cells for month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="min-h-24 p-2 rounded-xl bg-zinc-50/40 border border-transparent"
            />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const stats = getCellStats(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(stats.dateStr)}
                className={`min-h-[110px] p-2.5 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer relative group ${
                  stats.isSelected
                    ? 'border-zinc-950 bg-zinc-50/90 ring-2 ring-zinc-950 ring-offset-1 shadow-md'
                    : stats.isToday
                    ? 'border-zinc-950 bg-white shadow-xs hover:border-zinc-800'
                    : 'border-zinc-200/90 bg-white hover:border-zinc-400 hover:bg-zinc-50/60'
                }`}
              >
                {/* Top Row: Date Number + Badges */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-mono font-bold w-6 h-6 rounded-md flex items-center justify-center ${
                      stats.isToday
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : stats.isSelected
                        ? 'bg-zinc-300 text-zinc-950'
                        : 'text-zinc-700'
                    }`}
                  >
                    {day}
                  </span>

                  {stats.isToday && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 animate-pulse">
                      TODAY
                    </span>
                  )}

                  {!stats.isToday && stats.hasData && (
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 bg-zinc-100 px-1 py-0.2 rounded">
                      {stats.rate}%
                    </span>
                  )}
                </div>

                {/* Real Data Breakdown Pills: EXACT STUDENTS & TEACHERS COUNTS */}
                {stats.hasData ? (
                  <div className="mt-1.5 space-y-1 w-full text-[10px] font-mono">
                    {/* 🎓 Students Count */}
                    <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-50/90 border border-emerald-200/70 text-emerald-900 font-semibold">
                      <span className="flex items-center gap-1">
                        🎓 {isTeacher ? 'Class:' : 'Stud:'}
                      </span>
                      <span>
                        {stats.sPresent}/{stats.sTotal}
                      </span>
                    </div>

                    {/* 👨‍🏫 Teachers Count (Shown for Admin) */}
                    {!isTeacher ? (
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200/80 text-zinc-900 font-semibold">
                        <span className="flex items-center gap-1">
                          👨‍🏫 Teach:
                        </span>
                        <span>
                          {stats.tPresent}/{stats.tTotal}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200/80 text-zinc-700 font-semibold text-[9px]">
                        <span>Status:</span>
                        <span className={stats.sAbsent > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                          {stats.sAbsent > 0 ? `${stats.sAbsent} Absent` : '100% Present'}
                        </span>
                      </div>
                    )}

                    {/* Visual Progress Bar */}
                    <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden flex mt-0.5">
                      <div
                        style={{ width: `${stats.rate}%` }}
                        className="bg-zinc-950 h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-zinc-300 text-center py-2">
                    Upcoming
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ACTIVE SELECTED DATE ROLL CALL & ATTENDANCE CONTROL */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-5 shadow-2xs space-y-4">
        {/* Roll Call Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                DATE ROLL CALL & RECORD
              </span>
              {selectedDate === todayDateStr && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Today
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-zinc-950 mt-0.5">
              {formattedSelectedDate}
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Date: {selectedDate} • {selectedStats.sTotal} Students {isTeacher ? `in ${currentTeacherClass}` : `& ${selectedStats.tTotal} Teachers`} Registered
            </p>
          </div>

          {/* Sub-Tabs: Students vs Teachers vs SMS Logs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={() => {
                  setActiveRollCallTab('students');
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeRollCallTab === 'students'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <GraduationCap size={15} />
                <span>{isTeacher ? `${currentTeacherClass} Roll Call` : 'Students Roll Call'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeRollCallTab === 'students' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
                  {selectedStats.sPresent}/{selectedStats.sTotal}
                </span>
              </button>

              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveRollCallTab('teachers');
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeRollCallTab === 'teachers'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <School size={15} />
                  <span>Teachers Attendance</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeRollCallTab === 'teachers' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
                    {selectedStats.tPresent}/{selectedStats.tTotal}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveRollCallTab('sms')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeRollCallTab === 'sms'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <MessageSquare size={14} />
                <span>SMS Logs</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeRollCallTab === 'sms' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
                  {smsLogs.length}
                </span>
              </button>
            </div>

            {/* Quick Add Button */}
            {activeRollCallTab === 'students' ? (
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Student</span>
              </button>
            ) : activeRollCallTab === 'teachers' && !isTeacher ? (
              <button
                type="button"
                onClick={() => setIsAddTeacherOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Teacher</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Search & Filter Bar */}
        {activeRollCallTab !== 'sms' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={activeRollCallTab === 'students' ? 'Search by student name, admission no...' : 'Search by faculty name, subject, ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-zinc-950 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>

              {activeRollCallTab === 'students' && !isTeacher && (
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
                >
                  <option value="all">All Classes</option>
                  <option value="Grade 10-A">Grade 10-A</option>
                  <option value="Grade 10-B">Grade 10-B</option>
                  <option value="Grade 11-A">Grade 11-A</option>
                  <option value="Grade 11-B">Grade 11-B</option>
                  <option value="Grade 12-A">Grade 12-A</option>
                </select>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 1: STUDENTS ROLL CALL TABLE */}
        {/* ========================================== */}
        {activeRollCallTab === 'students' && (
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Parent / Guardian</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4 text-center">Mark Attendance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        No students match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-950 flex items-center gap-1.5">
                            <span>{student.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                              {student.admissionNo}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {student.gradeClass}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-zinc-900 font-medium">{student.parentName}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                            <Phone size={10} className="text-zinc-400" />
                            <span>{student.parentPhone}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-zinc-600">
                          {student.checkIn}
                        </td>

                        {/* Interactive P / A / L Buttons */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(student.id, 'present')}
                              title="Mark Present"
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                                student.status === 'present'
                                  ? 'bg-zinc-950 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                            >
                              P
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(student.id, 'absent')}
                              title="Mark Absent (Triggers Parent SMS)"
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                                student.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                            >
                              A
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(student.id, 'late')}
                              title="Mark Late"
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                                student.status === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                            >
                              L
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {student.status === 'absent' && (
                              <span className="text-[10px] font-mono text-rose-600 font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                                SMS Dispatched
                              </span>
                            )}
                            {!isTeacher && (
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(student.id)}
                                title="Remove Student"
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: TEACHERS ATTENDANCE TABLE */}
        {/* ========================================== */}
        {activeRollCallTab === 'teachers' && !isTeacher && (
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Subject & Dept</th>
                    <th className="py-3 px-4">Class In-Charge</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 font-mono">Check-In</th>
                    <th className="py-3 px-4 text-center">Mark Attendance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-400">
                        No faculty members match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-950 flex items-center gap-1.5">
                            <span>{teacher.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                              {teacher.id}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-zinc-900">{teacher.subject}</div>
                          <span className="text-[10px] text-zinc-500 font-mono">{teacher.department}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {teacher.assignedClass || 'Subject Teacher'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-zinc-600">
                          {teacher.phone}
                        </td>

                        <td className="py-3 px-4 font-mono text-zinc-600">
                          {teacher.checkIn}
                        </td>

                        {/* Interactive P / A / L Buttons */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
                            <button
                              type="button"
                              onClick={() => handleTeacherStatusChange(teacher.id, 'present')}
                              title="Mark Present"
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                                teacher.status === 'present'
                                  ? 'bg-zinc-950 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                            >
                              P
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTeacherStatusChange(teacher.id, 'absent')}
                              title="Mark Absent"
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                                teacher.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                            >
                              A
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTeacherStatusChange(teacher.id, 'late')}
                              title="Mark Late"
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                                teacher.status === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                            >
                              L
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            title="Remove Teacher"
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: SMS DISPATCH LOGS */}
        {/* ========================================== */}
        {activeRollCallTab === 'sms' && (
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase font-mono">
                  Parent Absentee SMS Logs ({smsLogs.length})
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Automated SMS notifications dispatched when students were marked absent.
                </p>
              </div>
              {smsLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all SMS dispatch logs?')) {
                      setSmsLogs([]);
                      localStorage.removeItem('attendly_sms_logs_v1');
                    }
                  }}
                  className="text-xs text-rose-600 hover:underline font-mono cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            <div className="divide-y divide-zinc-100 max-h-96 overflow-y-auto">
              {smsLogs.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  No SMS notifications dispatched yet. Mark any student as Absent (A) to trigger an automated SMS alert.
                </div>
              ) : (
                smsLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-zinc-50/70 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-950 text-xs">{log.studentName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {log.admissionNo}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          To: {log.parentName} ({log.parentPhone})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {log.date} at {log.time}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          Delivered ✅
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 font-mono mt-1.5 bg-zinc-50 p-2 rounded-lg border border-zinc-200/70">
                      "{log.message}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. MODAL: ADD STUDENT */}
      {/* ======================================================== */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-950 text-base">Add New Student</h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Malhotra"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Admission No</label>
                  <input
                    type="text"
                    placeholder="ADM-2026-107"
                    value={newStudentAdm}
                    onChange={(e) => setNewStudentAdm(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Grade / Class</label>
                  {isTeacher && currentTeacherClass ? (
                    <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-100 font-semibold text-zinc-800">
                      {currentTeacherClass} (Your Class)
                    </div>
                  ) : (
                    <select
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                    >
                      <option value="Grade 10-A">Grade 10-A</option>
                      <option value="Grade 10-B">Grade 10-B</option>
                      <option value="Grade 11-A">Grade 11-A</option>
                      <option value="Grade 11-B">Grade 11-B</option>
                      <option value="Grade 12-A">Grade 12-A</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohit Malhotra"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Parent Phone *</label>
                  <input
                    type="text"
                    placeholder="+91 98765-43210"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: ADD TEACHER (ADMIN ONLY) */}
      {/* ======================================================== */}
      {isAddTeacherOpen && !isTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-950 text-base">Add New Teacher</h3>
              <button onClick={() => setIsAddTeacherOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={newTeacherSubject}
                    onChange={(e) => setNewTeacherSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Department</label>
                  <select
                    value={newTeacherDept}
                    onChange={(e) => setNewTeacherDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                  >
                    <option value="Science & Math">Science & Math</option>
                    <option value="Languages">Languages</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Class In-Charge</label>
                  <select
                    value={newTeacherClass}
                    onChange={(e) => setNewTeacherClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                    <option value="Grade 11-A">Grade 11-A</option>
                    <option value="Grade 12-A">Grade 12-A</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765-43210"
                    value={newTeacherPhone}
                    onChange={(e) => setNewTeacherPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
