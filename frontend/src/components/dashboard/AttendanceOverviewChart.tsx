import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  School,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Calendar,
  UserCheck,
  UserX
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
  { id: 'FAC-107', name: 'Elena Rostova', subject: 'Biology', department: 'Science & Math', assignedClass: 'Grade 12-B', phone: '+91 98765-43216', checkIn: '--', checkOut: '--', status: 'absent' },
  { id: 'FAC-108', name: 'Vikram Verma', subject: 'Physical Education', department: 'Sports', assignedClass: 'All Grades', phone: '+91 98765-43217', checkIn: '07:55 AM', checkOut: '03:30 PM', status: 'present' },
];

const INITIAL_STUDENTS: StudentAttendanceItem[] = [
  { id: 'STU-101', admissionNo: 'ADM-2026-101', name: 'Eleanor Vance', gradeClass: 'Grade 10-A', parentName: 'Arthur Vance', parentPhone: '+91 98234-11001', checkIn: '08:12 AM', status: 'present' },
  { id: 'STU-102', admissionNo: 'ADM-2026-102', name: 'Aarav Mehta', gradeClass: 'Grade 10-A', parentName: 'Sanjay Mehta', parentPhone: '+91 98234-11002', checkIn: '08:20 AM', status: 'present' },
  { id: 'STU-103', admissionNo: 'ADM-2026-103', name: 'Zoya Khan', gradeClass: 'Grade 10-B', parentName: 'Farhan Khan', parentPhone: '+91 98234-11003', checkIn: '08:42 AM', status: 'late' },
  { id: 'STU-104', admissionNo: 'ADM-2026-104', name: 'Liam Cooper', gradeClass: 'Grade 11-A', parentName: 'Robert Cooper', parentPhone: '+91 98234-11004', checkIn: '--', status: 'absent' },
  { id: 'STU-105', admissionNo: 'ADM-2026-105', name: 'Ananya Sen', gradeClass: 'Grade 11-A', parentName: 'Debabrata Sen', parentPhone: '+91 98234-11005', checkIn: '08:10 AM', status: 'present' },
  { id: 'STU-106', admissionNo: 'ADM-2026-106', name: 'Rohan Deshmukh', gradeClass: 'Grade 12-A', parentName: 'Vilas Deshmukh', parentPhone: '+91 98234-11006', checkIn: '08:18 AM', status: 'present' },
  { id: 'STU-107', admissionNo: 'ADM-2026-107', name: 'Maya Lin', gradeClass: 'Grade 10-B', parentName: 'David Lin', parentPhone: '+91 98234-11007', checkIn: '08:15 AM', status: 'present' },
  { id: 'STU-108', admissionNo: 'ADM-2026-108', name: 'Kabir Verma', gradeClass: 'Grade 12-A', parentName: 'Anil Verma', parentPhone: '+91 98234-11008', checkIn: '--', status: 'absent' },
];

export const AttendanceManagement: React.FC = () => {
  // 🔀 TWO MAIN SECTIONS: 'teachers' | 'students'
  const [section, setSection] = useState<'teachers' | 'students'>('teachers');

  // Teachers State with LocalStorage
  const [teachers, setTeachers] = useState<TeacherAttendanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  // Students State with LocalStorage
  const [students, setStudents] = useState<StudentAttendanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_students_att_v2');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [classFilter, setClassFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Date selection
  const todayDateString = 'Saturday, Oct 17, 2026';

  // ==========================================
  // TEACHER STATS
  // ==========================================
  const teacherPresentCount = teachers.filter((t) => t.status === 'present').length;
  const teacherAbsentCount = teachers.filter((t) => t.status === 'absent').length;
  const teacherLateCount = teachers.filter((t) => t.status === 'late').length;

  // ==========================================
  // STUDENT STATS
  // ==========================================
  const studentPresentCount = students.filter((s) => s.status === 'present').length;
  const studentAbsentCount = students.filter((s) => s.status === 'absent').length;
  const studentLateCount = students.filter((s) => s.status === 'late').length;
  const studentRate = students.length > 0 ? Math.round(((studentPresentCount + studentLateCount) / students.length) * 100) : 0;

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

  // Change Student Status
  const handleStudentStatusChange = (id: string, newStatus: AttendanceStatus) => {
    const updated = students.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: newStatus,
          checkIn: newStatus === 'absent' ? '--' : (s.checkIn === '--' ? '08:15 AM' : s.checkIn),
        };
      }
      return s
    });
    setStudents(updated);
    localStorage.setItem('attendly_students_att_v2', JSON.stringify(updated));
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
      if (deptFilter !== 'all' && t.department !== deptFilter) return false;
      return true;
    });
  }, [teachers, searchQuery, statusFilter, deptFilter]);

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

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (section === 'teachers') {
      csvContent += 'Faculty ID,Teacher Name,Subject,Department,Assigned Class,Check In,Status\n';
      filteredTeachers.forEach((t) => {
        csvContent += `${t.id},"${t.name}","${t.subject}","${t.department}","${t.assignedClass}",${t.checkIn},${t.status.toUpperCase()}\n`;
      });
    } else {
      csvContent += 'Admission No,Student Name,Class,Parent Name,Parent Phone,Check In,Status\n';
      filteredStudents.forEach((s) => {
        csvContent += `${s.admissionNo},"${s.name}","${s.gradeClass}","${s.parentName}","${s.parentPhone}",${s.checkIn},${s.status.toUpperCase()}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${section}_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TOP HEADER & SECTION DIVISION SELECTOR */}
      {/* ======================================================== */}
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
            Separate attendance tracking for academic staff and enrolled students.
          </p>
        </div>

        {/* 🔀 TWO DISTINCT SECTIONS BUTTONS */}
        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 cursor-pointer shadow-2xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: TEACHERS ATTENDANCE */}
      {/* ======================================================== */}
      {section === 'teachers' && (
        <div className="space-y-5">
          {/* Teachers Stat Counters */}
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

          {/* Teachers Table Card */}
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
                    <th className="py-3 px-4 text-right">Mark Attendance</th>
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
                      <td className="py-3.5 px-4 text-right">
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
          {/* Students Stat Counters */}
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
              <p className="text-[11px] text-rose-600 mt-0.5">Unexcused / notices sent</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold uppercase text-zinc-900">Attendance Rate</span>
              <div className="text-2xl font-extrabold text-zinc-950 mt-1">{studentRate}%</div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Today's overall average</p>
            </div>
          </div>

          {/* Students Table Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Students Daily Roll Call</h2>
                <p className="text-xs text-zinc-500">Mark daily attendance for enrolled students class-wise.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by student, admission no..."
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
                    <th className="py-3 px-4 text-right">Mark Attendance</th>
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
                            Absent
                          </span>
                        )}
                        {s.status === 'late' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                            Late
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(s.id, 'present')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                              s.status === 'present'
                                ? 'bg-zinc-950 text-white'
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
                                ? 'bg-rose-600 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentStatusChange(s.id, 'late')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                              s.status === 'late'
                                ? 'bg-amber-500 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            L
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
    </div>
  );
};
