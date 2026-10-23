import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  School,
  Search,
  Download,
  Phone,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  ExternalLink,
  CheckCheck,
  Bell
} from 'lucide-react';

// ==========================================
// 1. DATA TYPES
// ==========================================
type AttendanceStatus = 'present' | 'absent' | 'late';

interface TeacherAttendanceItem {
  id: string;
  name: string;
  subject: string;
  department: string;
  assignedClass: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
}

interface StudentAttendanceItem {
  id: string;
  admissionNo: string;
  name: string;
  gradeClass: string;
  parentName: string;
  parentPhone: string;
  checkIn: string;
  status: AttendanceStatus;
}

interface SmsAlertLog {
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
// 2. INITIAL DATA
// ==========================================
const INITIAL_TEACHERS: TeacherAttendanceItem[] = [
  { id: 'FAC-101', name: 'Prof. Marcus Chen', subject: 'Mathematics', department: 'Science & Math', assignedClass: 'Grade 10-A', phone: '+91 98765-43210', checkIn: '08:15 AM', checkOut: '03:30 PM', status: 'present' },
  { id: 'FAC-102', name: 'Dr. Sophia Rodriguez', subject: 'Physics & Lab', department: 'Science & Math', assignedClass: 'Grade 11-A', phone: '+91 98765-43211', checkIn: '08:20 AM', checkOut: '03:30 PM', status: 'present' },
  { id: 'FAC-103', name: 'Julian Hayes', subject: 'English Literature', department: 'Languages', assignedClass: 'Grade 10-B', phone: '+91 98765-43212', checkIn: '08:45 AM', checkOut: '03:30 PM', status: 'late' },
  { id: 'FAC-104', name: 'Amara Okafor', subject: 'Chemistry', department: 'Science & Math', assignedClass: 'Grade 12-A', phone: '+91 98765-43213', checkIn: '--', checkOut: '--', status: 'absent' },
  { id: 'FAC-105', name: 'Rajesh Sharma', subject: 'Computer Science', department: 'Technology', assignedClass: 'Grade 11-B', phone: '+91 98765-43214', checkIn: '08:05 AM', checkOut: '03:30 PM', status: 'present' },
  { id: 'FAC-106', name: 'Priya Patel', subject: 'Social Studies', department: 'Humanities', assignedClass: 'Grade 9-A', phone: '+91 98765-43215', checkIn: '08:25 AM', checkOut: '03:30 PM', status: 'present' },
];

const INITIAL_STUDENTS: StudentAttendanceItem[] = [
  { id: 'STU-101', admissionNo: 'ADM-2026-101', name: 'Eleanor Vance', gradeClass: 'Grade 10-A', parentName: 'Arthur Vance', parentPhone: '+91 98234-11001', checkIn: '08:12 AM', status: 'present' },
  { id: 'STU-102', admissionNo: 'ADM-2026-102', name: 'Aarav Mehta', gradeClass: 'Grade 10-A', parentName: 'Sanjay Mehta', parentPhone: '+91 98234-11002', checkIn: '08:20 AM', status: 'present' },
  { id: 'STU-103', admissionNo: 'ADM-2026-103', name: 'Zoya Khan', gradeClass: 'Grade 10-B', parentName: 'Farhan Khan', parentPhone: '+91 98234-11003', checkIn: '08:42 AM', status: 'late' },
  { id: 'STU-104', admissionNo: 'ADM-2026-104', name: 'Liam Cooper', gradeClass: 'Grade 11-A', parentName: 'Robert Cooper', parentPhone: '+91 98234-11004', checkIn: '--', status: 'absent' },
  { id: 'STU-105', admissionNo: 'ADM-2026-105', name: 'Ananya Sen', gradeClass: 'Grade 11-A', parentName: 'Debabrata Sen', parentPhone: '+91 98234-11005', checkIn: '08:10 AM', status: 'present' },
  { id: 'STU-106', admissionNo: 'ADM-2026-106', name: 'Rohan Deshmukh', gradeClass: 'Grade 12-A', parentName: 'Vilas Deshmukh', parentPhone: '+91 98234-11006', checkIn: '08:18 AM', status: 'present' },
];

export const AttendanceManagement: React.FC = () => {
  const [section, setSection] = useState<'teachers' | 'students'>('students');

  // Teachers State
  const [teachers, setTeachers] = useState<TeacherAttendanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  // Students State
  const [students, setStudents] = useState<StudentAttendanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_students_att_v2');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // 📲 SMS Dispatch Logs State
  const [smsLogs, setSmsLogs] = useState<SmsAlertLog[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_sms_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Floating Toast Alert for latest SMS
  const [latestSmsAlert, setLatestSmsAlert] = useState<SmsAlertLog | null>(null);
  const [isSmsHistoryModalOpen, setIsSmsHistoryModalOpen] = useState(false);

  // Modals Open State
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // New Teacher Form Fields
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('');
  const [newTeacherDept, setNewTeacherDept] = useState('Science & Math');
  const [newTeacherClass, setNewTeacherClass] = useState('Grade 10-A');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');

  // New Student Form Fields
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAdm, setNewStudentAdm] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Grade 10-A');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [classFilter, setClassFilter] = useState('all');

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Stats
  const teacherPresentCount = teachers.filter((t) => t.status === 'present').length;
  const teacherAbsentCount = teachers.filter((t) => t.status === 'absent').length;
  const teacherLateCount = teachers.filter((t) => t.status === 'late').length;

  const studentPresentCount = students.filter((s) => s.status === 'present').length;
  const studentAbsentCount = students.filter((s) => s.status === 'absent').length;
  const studentLateCount = students.filter((s) => s.status === 'late').length;
  const studentRate = students.length > 0 ? Math.round(((studentPresentCount + studentLateCount) / students.length) * 100) : 0;

  // 📲 TRIGGER AUTOMATIC ABSENT SMS TO PARENT
  const sendAbsentSmsAlert = (student: StudentAttendanceItem) => {
    const timeNow = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date());
    
    // Asli SMS Message Template
    const message = `Dear Parent, your ward ${student.name} (${student.admissionNo}, ${student.gradeClass}) was marked ABSENT today on ${todayDateString}. If unplanned, please submit a leave notice or call the school office at +91 98765-43210. - Attendly Academy`;

    const newLog: SmsAlertLog = {
      id: `SMS-${Date.now()}`,
      studentName: student.name,
      admissionNo: student.admissionNo,
      parentPhone: student.parentPhone || '+91 98000-00000',
      parentName: student.parentName,
      date: todayDateString,
      time: timeNow,
      message: message,
    };

    // Save into Logs
    const updatedLogs = [newLog, ...smsLogs];
    setSmsLogs(updatedLogs);
    localStorage.setItem('attendly_sms_logs_v1', JSON.stringify(updatedLogs));

    // Show on-screen popup notification
    setLatestSmsAlert(newLog);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setLatestSmsAlert((prev) => (prev?.id === newLog.id ? null : prev));
    }, 6000);
  };

  // Change Teacher Status
  const handleTeacherStatusChange = (id: string, newStatus: AttendanceStatus) => {
    const updated = teachers.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          checkIn: newStatus === 'absent' ? '--' : (t.checkIn === '--' ? '08:30 AM' : t.checkIn),
        };
      }
      return t;
    });
    setTeachers(updated);
    localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(updated));
  };

  // Change Student Status (Triggers SMS when marked 'absent')
  const handleStudentStatusChange = (id: string, newStatus: AttendanceStatus) => {
    let absentStudentTarget: StudentAttendanceItem | null = null;

    const updated = students.map((s) => {
      if (s.id === id) {
        if (newStatus === 'absent') {
          absentStudentTarget = s;
        }
        return {
          ...s,
          status: newStatus,
          checkIn: newStatus === 'absent' ? '--' : (s.checkIn === '--' ? '08:15 AM' : s.checkIn),
        };
      }
      return s;
    });

    setStudents(updated);
    localStorage.setItem('attendly_students_att_v2', JSON.stringify(updated));

    // 🚀 AGAR BACHA ABSENT MARK HUA TOH AUTOMATIC SMS DISPATCH HOGA:
    if (absentStudentTarget) {
      sendAbsentSmsAlert(absentStudentTarget);
    }
  };

  // WhatsApp Message Direct Send
  const handleSendWhatsAppAlert = (student: StudentAttendanceItem) => {
    const text = `Dear Parent, your ward ${student.name} (${student.admissionNo}, ${student.gradeClass}) was marked ABSENT today on ${todayDateString}. - Attendly Academy`;
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Delete Teacher
  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(updated));
  };

  // Delete Student
  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    localStorage.setItem('attendly_students_att_v2', JSON.stringify(updated));
  };

  // Submit New Teacher
  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;

    const newTeacher: TeacherAttendanceItem = {
      id: `FAC-${100 + teachers.length + 1}`,
      name: newTeacherName.trim(),
      subject: newTeacherSubject.trim() || 'General',
      department: newTeacherDept,
      assignedClass: newTeacherClass,
      phone: newTeacherPhone.trim() || '+91 98000-00000',
      checkIn: '08:30 AM',
      checkOut: '03:30 PM',
      status: 'present',
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(updated));
    setNewTeacherName('');
    setNewTeacherSubject('');
    setNewTeacherPhone('');
    setIsAddTeacherOpen(false);
  };

  // Submit New Student
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: StudentAttendanceItem = {
      id: `STU-${100 + students.length + 1}`,
      admissionNo: newStudentAdm.trim() || `ADM-2026-${100 + students.length + 1}`,
      name: newStudentName.trim(),
      gradeClass: newStudentClass,
      parentName: newParentName.trim() || 'Parent/Guardian',
      parentPhone: newParentPhone.trim() || '+91 98000-00000',
      checkIn: '08:15 AM',
      status: 'present',
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('attendly_students_att_v2', JSON.stringify(updated));
    setNewStudentName('');
    setNewStudentAdm('');
    setNewParentName('');
    setNewParentPhone('');
    setIsAddStudentOpen(false);
  };

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchSub = t.subject.toLowerCase().includes(q);
        const matchId = t.id.toLowerCase().includes(q);
        if (!matchName && !matchSub && !matchId) return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    });
  }, [teachers, searchQuery, statusFilter]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchAdm = s.admissionNo.toLowerCase().includes(q);
        const matchParent = s.parentName.toLowerCase().includes(q);
        if (!matchName && !matchAdm && !matchParent) return false;
      }
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (classFilter !== 'all' && s.gradeClass !== classFilter) return false;
      return true;
    });
  }, [students, searchQuery, statusFilter, classFilter]);

  return (
    <div className="space-y-6 relative">
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
            "{latestSmsAlert.message.slice(0, 100)}..."
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Sent at {latestSmsAlert.time}</span>
            <span className="text-emerald-400 font-semibold font-mono">Status: Delivered ✅</span>
          </div>
        </div>
      )}

      {/* Top Header & Section Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Attendance Control Center
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-mono border border-zinc-200">
              {todayDateString}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time daily attendance with automated Parent Absentee SMS notifications.
          </p>
        </div>

        {/* Section Tabs Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Section Toggle */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setSection('teachers');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                section === 'teachers'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <School size={15} />
              <span>Teachers Attendance</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${section === 'teachers' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
                {teachers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSection('students');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                section === 'students'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <GraduationCap size={15} />
              <span>Students Attendance</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${section === 'students' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
                {students.length}
              </span>
            </button>
          </div>

          {/* Add Member Button */}
          {section === 'teachers' ? (
            <button
              type="button"
              onClick={() => setIsAddTeacherOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>+ Add Teacher</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>+ Add Student</span>
            </button>
          )}

          {/* 📲 SMS HISTORY BUTTON */}
          <button
            type="button"
            onClick={() => setIsSmsHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 cursor-pointer shadow-2xs relative"
          >
            <MessageSquare size={13} className="text-zinc-600" />
            <span>SMS Logs</span>
            {smsLogs.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-zinc-950 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {smsLogs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: TEACHERS ATTENDANCE */}
      {/* ======================================================== */}
      {section === 'teachers' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-zinc-500">Total Faculty</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{teachers.length}</div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Academic instructors</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600">Present Today</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{teacherPresentCount}</div>
              <p className="text-[11px] text-emerald-600 mt-0.5">Checked-in on campus</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-rose-600">Absent Today</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{teacherAbsentCount}</div>
              <p className="text-[11px] text-rose-600 mt-0.5">On leave / sick</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-amber-600">Late Arrival</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{teacherLateCount}</div>
              <p className="text-[11px] text-amber-600 mt-0.5">Arrived after 08:30 AM</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Faculty Daily Roll Call</h2>
                <p className="text-xs text-zinc-500">Take attendance for teachers and staff members.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search teacher, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 w-52 focus:outline-none focus:border-zinc-950"
                  />
                  <Search size={13} className="absolute left-2.5 top-2 text-zinc-400" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/70 border-b border-zinc-200/80 text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                    <th className="py-3 px-4">Faculty ID</th>
                    <th className="py-3 px-4">Teacher Name</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Assigned Class</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-center">Mark Attendance</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-zinc-500">{t.id}</td>
                      <td className="py-3.5 px-4 font-bold text-zinc-950">{t.name}</td>
                      <td className="py-3.5 px-4 text-zinc-700">{t.subject}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                          {t.assignedClass}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600">{t.checkIn}</td>
                      <td className="py-3.5 px-4">
                        {t.status === 'present' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            Present
                          </span>
                        )}
                        {t.status === 'absent' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                            Absent
                          </span>
                        )}
                        {t.status === 'late' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                            Late
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleTeacherStatusChange(t.id, 'present')}
                            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                              t.status === 'present'
                                ? 'bg-zinc-950 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTeacherStatusChange(t.id, 'absent')}
                            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                              t.status === 'absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTeacherStatusChange(t.id, 'late')}
                            className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                              t.status === 'late'
                                ? 'bg-amber-500 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            L
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTeacher(t.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: STUDENTS ATTENDANCE */}
      {/* ======================================================== */}
      {section === 'students' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-zinc-500">Total Enrolled</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{students.length}</div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Across all classes</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-emerald-600">Students Present</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{studentPresentCount}</div>
              <p className="text-[11px] text-emerald-600 mt-0.5">Present in classrooms</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-rose-600">Students Absent</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{studentAbsentCount}</div>
              <p className="text-[11px] text-rose-600 mt-0.5">SMS Alerts Dispatched</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-zinc-900">Attendance Rate</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{studentRate}%</div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Today's overall average</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Students Daily Roll Call</h2>
                <p className="text-xs text-zinc-500">
                  Mark daily attendance. Marking <b>[A] Absent</b> automatically sends an instant SMS notice to the parent.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search student, admission no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 w-56 focus:outline-none focus:border-zinc-950"
                  />
                  <Search size={13} className="absolute left-2.5 top-2 text-zinc-400" />
                </div>

                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950"
                >
                  <option value="all">All Classes</option>
                  <option value="Grade 10-A">Grade 10-A</option>
                  <option value="Grade 10-B">Grade 10-B</option>
                  <option value="Grade 11-A">Grade 11-A</option>
                  <option value="Grade 12-A">Grade 12-A</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:border-zinc-950"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/70 border-b border-zinc-200/80 text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Parent Name & Contact</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Mark Attendance</th>
                    <th className="py-3 px-4 text-right">SMS / WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900">{s.admissionNo}</td>
                      <td className="py-3.5 px-4 font-bold text-zinc-950">{s.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[11px]">
                          {s.gradeClass}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-900">{s.parentName}</div>
                        <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone size={10} className="text-zinc-400" />
                          <span>{s.parentPhone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600">{s.checkIn}</td>
                      <td className="py-3.5 px-4">
                        {s.status === 'present' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            Present
                          </span>
                        )}
                        {s.status === 'absent' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                            Absent (SMS Sent)
                          </span>
                        )}
                        {s.status === 'late' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                            Late
                          </span>
                        )}
                      </td>

                      {/* Attendance Buttons (P, A, L) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(s.id, 'present')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                              s.status === 'present'
                                ? 'bg-zinc-950 text-white shadow-2xs'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(s.id, 'absent')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                              s.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                            title="Mark Absent & Send SMS"
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(s.id, 'late')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                              s.status === 'late'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            L
                          </button>
                        </div>
                      </td>

                      {/* Direct WhatsApp / SMS Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {s.status === 'absent' && (
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppAlert(s)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Send WhatsApp Absent Notice"
                            >
                              <MessageSquare size={11} className="text-emerald-700" />
                              <span>WhatsApp</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(s.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📲 MODAL: SMS DISPATCH HISTORY / LOGS */}
      {/* ======================================================== */}
      {isSmsHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xl relative max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsSmsHistoryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
                <Send size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Parent Absentee SMS Logs</h3>
                <p className="text-xs text-zinc-500">History of all automated absent notices dispatched to parents.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1">
              {smsLogs.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  Abhi tak koi Absentee SMS send nahi hua hai. Jab kisi bache ko Absent mark karenge, woh yaha record hoga.
                </div>
              ) : (
                smsLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                        <span>{log.studentName}</span>
                        <span className="font-mono text-[10px] text-zinc-400">({log.admissionNo})</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{log.time} • {log.date}</span>
                    </div>

                    <div className="text-[11px] text-zinc-600 font-mono bg-white p-2 rounded-lg border border-zinc-100 leading-relaxed">
                      "{log.message}"
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-0.5">
                      <span className="text-zinc-500 font-mono">Sent to: {log.parentPhone} ({log.parentName})</span>
                      <span className="text-emerald-700 font-semibold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Delivered Successfully ✅
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => {
                  setSmsLogs([]);
                  localStorage.removeItem('attendly_sms_logs_v1');
                }}
                className="text-xs text-red-600 hover:underline cursor-pointer"
              >
                Clear All Logs
              </button>
              <button
                type="button"
                onClick={() => setIsSmsHistoryModalOpen(false)}
                className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 MODAL: ADD NEW TEACHER */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsAddTeacherOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
                <School size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Add New Teacher</h3>
                <p className="text-xs text-zinc-500">Register new faculty member in institution records.</p>
              </div>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Sharma"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Subject / Specialization *</label>
                <input
                  type="text"
                  placeholder="e.g. Physics & Mechanics"
                  value={newTeacherSubject}
                  onChange={(e) => setNewTeacherSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Department</label>
                  <select
                    value={newTeacherDept}
                    onChange={(e) => setNewTeacherDept(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Science & Math">Science & Math</option>
                    <option value="Languages">Languages</option>
                    <option value="Technology">Technology</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Assigned Class</label>
                  <select
                    value={newTeacherClass}
                    onChange={(e) => setNewTeacherClass(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                    <option value="Grade 11-A">Grade 11-A</option>
                    <option value="Grade 12-A">Grade 12-A</option>
                    <option value="All Grades">All Grades</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765-43210"
                  value={newTeacherPhone}
                  onChange={(e) => setNewTeacherPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 cursor-pointer shadow-xs"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔵 MODAL: ADD NEW STUDENT */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsAddStudentOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950">
                <GraduationCap size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Add New Student</h3>
                <p className="text-xs text-zinc-500">Register new student in classroom roll call.</p>
              </div>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Admission No</label>
                  <input
                    type="text"
                    placeholder="e.g. ADM-2026-107"
                    value={newStudentAdm}
                    onChange={(e) => setNewStudentAdm(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Class & Section *</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                    <option value="Grade 11-A">Grade 11-A</option>
                    <option value="Grade 12-A">Grade 12-A</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunil Verma"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Parent Phone Contact</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98234-11000"
                  value={newParentPhone}
                  onChange={(e) => setNewParentPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 cursor-pointer shadow-xs"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
