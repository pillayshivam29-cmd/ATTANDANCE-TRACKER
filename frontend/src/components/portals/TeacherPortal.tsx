import React, { useState, useMemo, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import {
  School,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Send,
  Phone,
  BookOpen,
  Calendar,
  MessageSquare,
  CheckCheck,
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
  Plus,
  Mail,
  UserPlus,
  FileSpreadsheet,
  Download,
  Upload,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  FileText
} from 'lucide-react';

interface TeacherPortalProps {
  teacherName?: string;
  teacherEmail?: string;
  teacherId?: string;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  teacherName = 'Prof. Marcus Chen',
  teacherEmail = 'marcus.chen@gmail.com',
  teacherId = 'FAC-101',
}) => {
  const { addPerson, addToast, people } = useAttendance();

  // 1. Fetch Logged-in Teacher Data
  const [teachers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentTeacher = useMemo(() => {
    const found = teachers.find(
      (t) => (t.email && t.email.toLowerCase() === teacherEmail.toLowerCase()) || t.name === teacherName
    );
    return (
      found || {
        id: teacherId,
        name: teacherName,
        email: teacherEmail,
        department: 'Science & Math',
        subject: 'Mathematics & Calculus',
        assignedClass: 'Grade 10-A',
        room: 'Room 201',
        dailyPeriods: 5,
        phone: '+91 98765-43210',
      }
    );
  }, [teachers, teacherEmail, teacherName, teacherId]);

  // Today Date formatted
  const todayDateStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const todayIsoStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // 2. Fetch Students of this Teacher's Class ONLY
  const [students, setStudents] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('attendly_students_att_v2');
      if (saved) return JSON.parse(saved);
      return [
        { id: 'STU-101', admissionNo: '22272', rollNo: '01', name: 'piyush kumar varma', gradeClass: 'Grade 10-A', parentName: 'Parent / Guardian', parentPhone: '+91 9876543210', checkIn: '08:15 AM', status: 'present' },
        { id: 'STU-102', admissionNo: '19554', rollNo: '02', name: 'kunal raj singh', gradeClass: 'Grade 10-A', parentName: 'Parent / Guardian', parentPhone: '+91 9876543211', checkIn: '08:15 AM', status: 'present' },
        { id: 'STU-103', admissionNo: '99', rollNo: '03', name: 'akash pillay', gradeClass: 'Grade 10-A', parentName: 'Parent / Guardian', parentPhone: '+91 98000-00000', checkIn: '08:15 AM', status: 'present' },
      ];
    } catch {
      return [];
    }
  });

  // Filter students STRICTLY for this Teacher's Assigned Class ONLY
  const myClassStudents = useMemo(() => {
    const classTarget = currentTeacher.assignedClass || 'Grade 10-A';
    const studentMap = new Map<string, any>();

    // 1. From attendance roster
    students.forEach((s) => {
      const sClass = s.gradeClass || s.department || '';
      if (sClass === classTarget) {
        studentMap.set(s.admissionNo || s.id, s);
      }
    });

    // 2. From Admin people registry (matching this class only)
    people.forEach((p) => {
      const isStudent = (p.role || '').toLowerCase() === 'student' || (p.role || '').toLowerCase() === 'member';
      const pClass = p.department || '';
      if (isStudent && pClass === classTarget) {
        const idKey = p.employeeId || p.admissionNo || p.id;
        if (!studentMap.has(idKey)) {
          studentMap.set(idKey, {
            id: p.id,
            admissionNo: p.employeeId || p.admissionNo || '19550',
            rollNo: p.rollNo || '01',
            name: p.name,
            gradeClass: classTarget,
            parentName: p.parentName || 'Parent / Guardian',
            parentPhone: p.parentPhone || p.phone || '+91 98000-00000',
            checkIn: '08:15 AM',
            status: 'present',
          });
        }
      }
    });

    // Return ONLY students that belong to this teacher's class
    return Array.from(studentMap.values());
  }, [students, people, currentTeacher.assignedClass]);

  // Tab State: 'rollcall' | 'timetable' | 'roster'
  const [activeTab, setActiveTab] = useState<'rollcall' | 'timetable' | 'roster'>('rollcall');
  const [searchQuery, setSearchQuery] = useState('');

  // 📝 DRAFT ATTENDANCE STATE (Database me tab tak nahi jayega jab tak teacher Submit na kare)
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Check if today's attendance has already been finalized/submitted
  const submissionStorageKey = `attendly_submitted_${currentTeacher.id}_${todayIsoStr}`;
  const [submissionInfo, setSubmissionInfo] = useState<{ submittedAt: string; presentCount: number; absentCount: number; lateCount: number } | null>(() => {
    try {
      const saved = localStorage.getItem(submissionStorageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Initialize draft marks when class students load
  useEffect(() => {
    setAttendanceDraft((prevDraft) => {
      const nextDraft = { ...prevDraft };
      myClassStudents.forEach((s) => {
        const key = s.admissionNo || s.id;
        if (!nextDraft[key]) {
          nextDraft[key] = s.status || 'present';
        }
      });
      return nextDraft;
    });
  }, [myClassStudents]);

  // Helper to get effective status of a student
  const getStudentStatus = (student: any): 'present' | 'absent' | 'late' => {
    const key = student.admissionNo || student.id;
    return attendanceDraft[key] || student.status || 'present';
  };

  // Draft Status Toggle (Local React state only - NO database write, NO SMS sent yet!)
  const handleDraftStatusChange = (studentKey: string, newStatus: 'present' | 'absent' | 'late') => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentKey]: newStatus,
    }));
    setIsDirty(true);
  };

  // Draft Quick Mark All Present
  const handleDraftMarkAllPresent = () => {
    const nextDraft: Record<string, 'present' | 'absent' | 'late'> = {};
    myClassStudents.forEach((s) => {
      const key = s.admissionNo || s.id;
      nextDraft[key] = 'present';
    });
    setAttendanceDraft(nextDraft);
    setIsDirty(true);
    addToast('Draft Updated', `All ${myClassStudents.length} students marked present in draft. Click 'Submit' to finalize.`, 'info');
  };

  // Attendance Counters from Draft State
  const presentCount = myClassStudents.filter((s) => getStudentStatus(s) === 'present').length;
  const absentCount = myClassStudents.filter((s) => getStudentStatus(s) === 'absent').length;
  const lateCount = myClassStudents.filter((s) => getStudentStatus(s) === 'late').length;
  const attendanceRate = myClassStudents.length > 0 ? Math.round(((presentCount + lateCount) / myClassStudents.length) * 100) : 0;

  // List of currently absent students in draft
  const absentStudentsInDraft = useMemo(() => {
    return myClassStudents.filter((s) => getStudentStatus(s) === 'absent');
  }, [myClassStudents, attendanceDraft]);

  // 🔔 MODALS STATE
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [smsReceiptModal, setSmsReceiptModal] = useState<any | null>(null);

  // 🎓 FINAL ATTENDANCE SUBMISSION HANDLER
  // Only executed when teacher confirms the popup!
  const handleFinalSubmitAttendance = () => {
    const timeNow = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date());

    // 1. UPDATE ATTENDANCE ROSTER (attendly_students_att_v2)
    const finalizedStudents = students.map((s) => {
      const key = s.admissionNo || s.id;
      if (attendanceDraft[key]) {
        const finalStatus = attendanceDraft[key];
        return {
          ...s,
          status: finalStatus,
          checkIn: finalStatus === 'absent' ? '--' : s.checkIn === '--' ? '08:15 AM' : s.checkIn,
        };
      }
      return s;
    });
    setStudents(finalizedStudents);
    localStorage.setItem('attendly_students_att_v2', JSON.stringify(finalizedStudents));

    // 2. COMMIT TO MONTHLY CALENDAR DATABASE (attendly_att_by_date_v3)
    try {
      const calendarMap = JSON.parse(localStorage.getItem('attendly_att_by_date_v3') || '{}');
      const updatedClassStudents = myClassStudents.map((s) => {
        const key = s.admissionNo || s.id;
        const finalStatus = attendanceDraft[key] || s.status || 'present';
        return {
          ...s,
          status: finalStatus,
          checkIn: finalStatus === 'absent' ? '--' : '08:15 AM',
        };
      });

      calendarMap[todayIsoStr] = {
        date: todayIsoStr,
        students: updatedClassStudents,
        finalizedAt: timeNow,
        submittedBy: currentTeacher.name,
      };
      localStorage.setItem('attendly_att_by_date_v3', JSON.stringify(calendarMap));
    } catch (err) {
      console.warn('Error saving to calendar database', err);
    }

    // 3. 📨 DISPATCH OFFICIAL SMS TO PARENTS OF ABSENT STUDENTS (DIRECT SMS, NOT WHATSAPP)
    const dispatchedLogs: any[] = [];
    absentStudentsInDraft.forEach((absentTarget) => {
      const parentNum = absentTarget.parentPhone || '+91 98000-00000';
      const smsMessage = `Dear Parent, your ward ${absentTarget.name} (Adm No: ${absentTarget.admissionNo}, ${currentTeacher.assignedClass}) was marked ABSENT today (${todayDateStr}) by Class Teacher ${currentTeacher.name}. Kindly contact Attendly Academy if this is unexpected.`;
      
      const newLog = {
        id: `SMS-${Date.now()}-${absentTarget.admissionNo}`,
        studentName: absentTarget.name,
        admissionNo: absentTarget.admissionNo,
        parentPhone: parentNum,
        parentName: absentTarget.parentName || 'Parent / Guardian',
        date: todayDateStr,
        time: timeNow,
        gateway: 'National Cellular SMS Gateway (DLT Approved)',
        status: 'DELIVERED',
        message: smsMessage,
      };
      dispatchedLogs.push(newLog);
    });

    if (dispatchedLogs.length > 0) {
      const existingLogs = JSON.parse(localStorage.getItem('attendly_sms_logs_v1') || '[]');
      localStorage.setItem('attendly_sms_logs_v1', JSON.stringify([...dispatchedLogs, ...existingLogs]));
    }

    // 4. SAVE SUBMISSION TIMESTAMP
    const subInfo = {
      submittedAt: timeNow,
      presentCount,
      absentCount,
      lateCount,
    };
    localStorage.setItem(submissionStorageKey, JSON.stringify(subInfo));
    setSubmissionInfo(subInfo);
    setIsDirty(false);
    setIsConfirmSubmitOpen(false);

    // 5. OPEN OFFICIAL SMS DISPATCH RECEIPT
    setSmsReceiptModal({
      submittedAt: timeNow,
      classRoom: currentTeacher.assignedClass,
      totalStudents: myClassStudents.length,
      presentCount,
      absentCount,
      lateCount,
      smsDispatchedCount: dispatchedLogs.length,
      smsList: dispatchedLogs,
    });

    addToast(
      'Attendance Finalized & Synced! 📨',
      `Database updated. ${dispatchedLogs.length > 0 ? `${dispatchedLogs.length} official SMS dispatched to parents.` : 'All students present.'}`,
      'success'
    );
  };

  // ========================================================
  // 🎓 TEACHER'S BULK CSV UPLOAD MODAL FOR CLASSROOM
  // ========================================================
  const [isTeacherBulkOpen, setIsTeacherBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const handleDownloadTeacherTemplate = () => {
    const csvContent =
      'Roll No,Student Name,Admission No,Parents Phone Number\n' +
      `01,Aarav Sharma,19555,+91 9876543210\n` +
      `02,Priya Verma,19556,+91 9876543211\n` +
      `03,Rohan Mehta,19557,+91 9876543212\n` +
      `04,Sneha Patel,19558,+91 9876543213\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendly_${currentTeacher.assignedClass?.toLowerCase().replace(/\s+/g, '_')}_students_template.csv`;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Template Downloaded', 'Class CSV template downloaded', 'info');
  };

  const handleTeacherBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setBulkFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const parsed: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((item) => item.trim().replace(/^"|"$/g, ''));
        if (row[0] || row[1]) {
          const roll = row[0] || String(i).padStart(2, '0');
          const name = row[1] || `Student ${i}`;
          const adm = row[2] || `1955${i}`;
          const phoneNum = row[3] || '+91 98000-00000';

          parsed.push({
            id: `STU-${Date.now()}-${i}`,
            admissionNo: adm,
            rollNo: roll,
            name: name,
            gradeClass: currentTeacher.assignedClass,
            parentName: 'Parent / Guardian',
            parentPhone: phoneNum,
            checkIn: '08:15 AM',
            status: 'present' as const,
          });
        }
      }
      setBulkPreview(parsed);
    };
    reader.readAsText(selectedFile);
  };

  const handleTeacherBulkUploadSubmit = async () => {
    if (bulkPreview.length === 0) return;
    setIsBulkUploading(true);

    try {
      // 1. Sync to attendly_students_att_v2
      const updatedAtt = [...students, ...bulkPreview];
      setStudents(updatedAtt);
      localStorage.setItem('attendly_students_att_v2', JSON.stringify(updatedAtt));

      // 2. Sync each to AttendanceContext (Admin Registry)
      for (const item of bulkPreview) {
        await addPerson({
          name: item.name,
          employeeId: item.admissionNo,
          admissionNo: item.admissionNo,
          rollNo: item.rollNo,
          department: currentTeacher.assignedClass,
          role: 'Student',
          phone: item.parentPhone,
          parentPhone: item.parentPhone,
          email: `${item.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          joinDate: todayIsoStr,
          status: 'active',
        });
      }

      // 3. Sync to Admin Dashboard Fees
      const existingFees = JSON.parse(localStorage.getItem('attendly_students_v1') || '[]');
      const newFees = bulkPreview.map((item) => ({
        id: `S-${Date.now()}-${item.admissionNo}`,
        admissionNo: item.admissionNo,
        rollNo: item.rollNo,
        name: item.name,
        gradeClass: currentTeacher.assignedClass,
        parentName: 'Parent / Guardian',
        parentPhone: item.parentPhone,
        feeStatus: 'Paid' as const,
        feePaidTill: 'Paid Full Year (2026-27)',
        totalFee: '₹60,000',
        dueAmount: '₹0',
        attendanceRate: 100,
      }));
      localStorage.setItem('attendly_students_v1', JSON.stringify([...existingFees, ...newFees]));

      addToast(
        'Bulk Upload Complete! 🎓',
        `${bulkPreview.length} students enrolled directly into ${currentTeacher.assignedClass}!`,
        'success'
      );

      setIsTeacherBulkOpen(false);
      setBulkFile(null);
      setBulkPreview([]);
    } catch (err) {
      addToast('Upload Error', 'Could not process CSV file', 'error');
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Add Single Student Modal Form State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [formStudentName, setFormStudentName] = useState('');
  const [formRollNo, setFormRollNo] = useState('');
  const [formAdmissionNo, setFormAdmissionNo] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');

  const handleAddSingleStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName.trim()) return;

    const newAdmNo = formAdmissionNo.trim() || `1955${Math.floor(10 + Math.random() * 90)}`;
    const studentClass = currentTeacher.assignedClass || 'Grade 10-A';
    const rollValue = formRollNo.trim() || `${myClassStudents.length + 1}`.padStart(2, '0');
    const phoneValue = formParentPhone.trim() || '+91 98000-00000';
    const emailVal = `${formStudentName.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

    // 1. Context Sync
    await addPerson({
      name: formStudentName.trim(),
      employeeId: newAdmNo,
      admissionNo: newAdmNo,
      rollNo: rollValue,
      email: emailVal,
      department: studentClass,
      role: 'Student',
      phone: phoneValue,
      parentPhone: phoneValue,
      joinDate: todayIsoStr,
      status: 'active',
    });

    // 2. Roster Sync
    const newStudentAttItem = {
      id: `STU-${Date.now()}`,
      admissionNo: newAdmNo,
      rollNo: rollValue,
      name: formStudentName.trim(),
      gradeClass: studentClass,
      parentName: 'Parent / Guardian',
      parentPhone: phoneValue,
      checkIn: '08:15 AM',
      status: 'present' as const,
    };
    const updatedAtt = [...students, newStudentAttItem];
    setStudents(updatedAtt);
    localStorage.setItem('attendly_students_att_v2', JSON.stringify(updatedAtt));

    // Update Draft
    setAttendanceDraft((prev) => ({
      ...prev,
      [newAdmNo]: 'present',
    }));

    addToast('Student Added', `${formStudentName.trim()} enrolled in ${studentClass}`, 'success');
    setFormStudentName('');
    setFormRollNo('');
    setFormAdmissionNo('');
    setFormParentPhone('');
    setIsAddStudentOpen(false);
  };

  // Timetable Schedule
  const todayTimetable = [
    { period: 'Period 1', time: '08:30 - 09:20 AM', subject: currentTeacher.subject, classRoom: currentTeacher.assignedClass, room: currentTeacher.room || 'Room 201', active: true },
    { period: 'Period 2', time: '09:20 - 10:10 AM', subject: currentTeacher.subject, classRoom: 'Grade 11-A', room: 'Physics Lab B', active: false },
    { period: 'Break', time: '10:10 - 10:30 AM', subject: 'Morning Recess', classRoom: 'Campus Yard', room: '--', active: false },
    { period: 'Period 3', time: '10:30 - 11:20 AM', subject: 'Remedial Doubt Session', classRoom: currentTeacher.assignedClass, room: currentTeacher.room || 'Room 201', active: false },
    { period: 'Period 4', time: '11:20 - 12:10 PM', subject: 'Lab Practical', classRoom: 'Grade 12-A', room: 'Lab A', active: false },
  ];

  return (
    <div className="w-full space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white font-bold text-base flex items-center justify-center font-mono shadow-xs shrink-0">
            {currentTeacher.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                Welcome back, {currentTeacher.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-xs font-mono font-semibold border border-zinc-200">
                {currentTeacher.id}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Faculty Portal
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Class In-Charge: <strong className="text-zinc-900">{currentTeacher.assignedClass}</strong> • Subject: {currentTeacher.subject} • {currentTeacher.room || 'Room 201'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Mark All Present */}
          <button
            type="button"
            onClick={handleDraftMarkAllPresent}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            Mark All Present
          </button>

          {/* Bulk Upload CSV Button */}
          <button
            type="button"
            onClick={() => setIsTeacherBulkOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Upload size={14} />
            <span>Bulk Upload (CSV)</span>
          </button>

          {/* Add Single Student */}
          <button
            type="button"
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Class Overview */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">My Classroom</span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5">{currentTeacher.assignedClass}</div>
            <p className="text-[11px] text-zinc-500 mt-1">{myClassStudents.length} Students in My Class</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
        </div>

        {/* Present Today */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase font-mono">Present Today</span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 flex items-baseline gap-1.5">
              <span>{presentCount}</span>
              <span className="text-xs font-semibold text-emerald-600">({attendanceRate}%)</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">In attendance today</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Absent Today */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-500 uppercase font-mono">Absent Today</span>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5 flex items-baseline gap-1.5">
              <span>{absentCount}</span>
              {lateCount > 0 && <span className="text-xs font-semibold text-amber-600">({lateCount} Late)</span>}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {absentCount > 0 ? `${absentCount} SMS alert(s) ready` : 'No absentees'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <XCircle size={20} />
          </div>
        </div>

        {/* Submission Status */}
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Roll Call State</span>
            <div className="text-lg font-bold text-zinc-950 mt-0.5">
              {submissionInfo ? (
                <span className="text-emerald-700 flex items-center gap-1 text-sm font-semibold">
                  <CheckCheck size={16} /> Finalized
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1 text-sm font-semibold">
                  <Clock size={16} /> Draft Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">
              {submissionInfo ? `Synced at ${submissionInfo.submittedAt}` : 'Requires Submit click'}
            </p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${submissionInfo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            {submissionInfo ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DRAFT WARNING & SUBMIT BAR */}
      {/* ======================================================== */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        submissionInfo
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : 'bg-zinc-900 text-white border-zinc-800 shadow-lg'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            submissionInfo ? 'bg-emerald-600 text-white' : 'bg-white text-zinc-950'
          }`}>
            {submissionInfo ? <CheckCheck size={18} /> : <Clock size={18} />}
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm">
              {submissionInfo
                ? `Today's Attendance Finalized & Synced (${submissionInfo.submittedAt})`
                : 'Attendance is currently in DRAFT mode'}
            </h4>
            <p className={`text-xs mt-0.5 ${submissionInfo ? 'text-emerald-800' : 'text-zinc-300'}`}>
              {submissionInfo
                ? `All marks are locked in database. ${submissionInfo.absentCount} parent SMS delivered.`
                : 'Database me data tab tak nahi jayega jab tak aap neeche "Submit Daily Attendance" click nahi karenge.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {submissionInfo && (
            <button
              type="button"
              onClick={() => setIsConfirmSubmitOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Update / Resubmit
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsConfirmSubmitOpen(true)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              submissionInfo
                ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                : 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-white/10'
            }`}
          >
            <Send size={14} />
            <span>Submit Daily Attendance & Send SMS</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABS NAVIGATION */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200">
        <button
          onClick={() => setActiveTab('rollcall')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'rollcall' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <UserCheck size={16} />
          <span>My Class Roll Call</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'rollcall' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
            {presentCount}/{myClassStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'timetable' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Calendar size={16} />
          <span>My Daily Timetable</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'timetable' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
            5 Periods
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'roster' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
          }`}
        >
          <Users size={16} />
          <span>Class Students Roster</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeTab === 'roster' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
            {myClassStudents.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 5. TAB CONTENT: ROLL CALL */}
      {/* ======================================================== */}
      {activeTab === 'rollcall' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-zinc-950 text-sm">
                Daily Roll Call: {currentTeacher.assignedClass}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Mark status in draft mode. Click 'Submit Daily Attendance' to finalize & send SMS alerts to parents.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsTeacherBulkOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Upload size={13} />
                <span>Bulk CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>+ Add Student</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase font-mono">
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Parent Phone (for SMS)</th>
                  <th className="py-3 px-4 text-center">Mark Status (Draft)</th>
                  <th className="py-3 px-4 text-right">SMS Notice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {myClassStudents
                  .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((student, idx) => {
                    const studentKey = student.admissionNo || student.id;
                    const effectiveStatus = getStudentStatus(student);

                    return (
                      <tr key={student.id} className="hover:bg-zinc-50/70 transition-colors">
                        {/* Roll Number */}
                        <td className="py-3 px-4 font-mono font-bold text-zinc-950">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">
                            #{student.rollNo || String(idx + 1).padStart(2, '0')}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="py-3 px-4 font-semibold text-zinc-950">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-zinc-950 text-white font-mono text-xs flex items-center justify-center font-bold">
                              {student.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span>{student.name}</span>
                          </div>
                        </td>

                        {/* Admission No */}
                        <td className="py-3 px-4 font-mono text-zinc-600">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                            {student.admissionNo}
                          </span>
                        </td>

                        {/* Class */}
                        <td className="py-3 px-4 font-mono text-zinc-700">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 border border-zinc-200">
                            {student.gradeClass || currentTeacher.assignedClass}
                          </span>
                        </td>

                        {/* Parent Phone for SMS */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-zinc-800 flex items-center gap-1.5">
                            <Smartphone size={13} className="text-zinc-400" />
                            <span>{student.parentPhone || '+91 98000-00000'}</span>
                          </div>
                        </td>

                        {/* Attendance Toggle Buttons */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                            <button
                              type="button"
                              onClick={() => handleDraftStatusChange(studentKey, 'present')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                                effectiveStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                              title="Mark Present"
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDraftStatusChange(studentKey, 'absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                                effectiveStatus === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                              title="Mark Absent"
                            >
                              A
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDraftStatusChange(studentKey, 'late')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                                effectiveStatus === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-zinc-600 hover:bg-zinc-200'
                              }`}
                              title="Mark Late"
                            >
                              L
                            </button>
                          </div>
                        </td>

                        {/* Status Notice */}
                        <td className="py-3 px-4 text-right">
                          {effectiveStatus === 'absent' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-mono">
                              <Smartphone size={11} /> SMS Ready
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-zinc-400">
                              {effectiveStatus === 'present' ? 'Present' : 'Late (08:45 AM)'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                {myClassStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-400 font-mono text-xs">
                      No students enrolled in {currentTeacher.assignedClass} yet. Click "+ Add Student" or "Bulk CSV" to register.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Submit Action Bar */}
          <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-zinc-500 font-mono">
              Class Count: <strong>{myClassStudents.length} Students</strong> • Present: <strong className="text-emerald-700">{presentCount}</strong> • Absent: <strong className="text-rose-700">{absentCount}</strong> • Late: <strong className="text-amber-700">{lateCount}</strong>
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmSubmitOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Send size={14} />
              <span>Submit Daily Attendance ({absentCount} SMS)</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. TAB CONTENT: TIMETABLE */}
      {/* ======================================================== */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs p-5">
          <div className="mb-4">
            <h3 className="font-bold text-zinc-950 text-sm">Daily Teaching Schedule & Periods</h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{todayDateStr} • {currentTeacher.assignedClass}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {todayTimetable.map((slot, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  slot.active ? 'bg-zinc-950 text-white border-zinc-900 shadow-md' : 'bg-zinc-50 border-zinc-200/90 text-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold ${slot.active ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {slot.period}
                  </span>
                  {slot.active ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold animate-pulse">
                      ACTIVE NOW
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-400">{slot.room}</span>
                  )}
                </div>
                <h4 className="font-bold text-sm mt-2">{slot.subject}</h4>
                <div className={`flex items-center justify-between mt-3 text-xs font-mono ${slot.active ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  <span>Class: {slot.classRoom}</span>
                  <span>{slot.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. TAB CONTENT: ROSTER (Strictly Class Students Only) */}
      {/* ======================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-zinc-950 text-sm">Class Roster: {currentTeacher.assignedClass}</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{myClassStudents.length} Students in My Class</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTeacherBulkOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Upload size={13} />
                <span>Bulk CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Student</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClassStudents.map((s, idx) => (
              <div key={s.id} className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                          #{s.rollNo || String(idx + 1).padStart(2, '0')}
                        </span>
                        <h4 className="font-bold text-zinc-950 text-sm">{s.name}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                        Adm: {s.admissionNo} • {currentTeacher.assignedClass}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono uppercase border ${
                      getStudentStatus(s) === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {getStudentStatus(s)}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1 text-xs text-zinc-600">
                    <p><span className="text-zinc-400">Parent:</span> {s.parentName}</p>
                    <p className="flex items-center gap-1 font-mono">
                      <Smartphone size={12} className="text-zinc-400" />
                      <span>{s.parentPhone}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    SMS Alert Registered
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-900">100% Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. POPUP MODAL: "CONFIRM YOU WANT TO SUBMIT ATTENDANCE" */}
      {/* ======================================================== */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">Confirm Attendance Submission</h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    {currentTeacher.assignedClass} • {todayDateStr}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Summary Badges */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center font-mono">
                <div className="p-2 rounded-xl bg-white border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 uppercase block">Present</span>
                  <span className="text-lg font-bold text-emerald-600">{presentCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 uppercase block">Absent</span>
                  <span className="text-lg font-bold text-rose-600">{absentCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-zinc-200">
                  <span className="text-[10px] text-zinc-400 uppercase block">Late</span>
                  <span className="text-lg font-bold text-amber-600">{lateCount}</span>
                </div>
              </div>

              {/* Absent Warning with Parent Numbers */}
              {absentCount > 0 ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                    <Smartphone size={16} className="text-rose-600" />
                    <span>Official SMS Alerts to be Dispatched ({absentCount})</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-800">
                    Submitting will finalize attendance in the database and immediately send an official cellular SMS (No WhatsApp) to the parents of these absent student(s):
                  </p>

                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                    {absentStudentsInDraft.map((absent, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white border border-rose-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-zinc-950 block">{absent.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">Adm: {absent.admissionNo}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-rose-700 block text-xs">{absent.parentPhone}</span>
                          <span className="text-[10px] text-zinc-400">Direct Cellular SMS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold">
                    All {myClassStudents.length} students are marked PRESENT! No absence SMS will be sent.
                  </span>
                </div>
              )}

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-[11px] text-zinc-600">
                Are you sure you want to finalize today's attendance? Once confirmed, it will be saved to the central database and monthly calendar.
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmSubmitOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Review / Make Changes
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmitAttendance}
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCheck size={14} />
                  <span>Confirm & Submit Attendance</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. SMS DISPATCH RECEIPT MODAL */}
      {/* ======================================================== */}
      {smsReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">Attendance Recorded & SMS Sent</h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Synced at {smsReceiptModal.submittedAt} • {currentTeacher.assignedClass}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSmsReceiptModal(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-700 shrink-0" />
                <div>
                  <h4 className="font-bold">Database Synchronized Successfully</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Attendance records have been officially written to institutional database and monthly calendar.
                  </p>
                </div>
              </div>

              {smsReceiptModal.smsList.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-zinc-900 font-mono uppercase text-[11px]">
                      Cellular SMS Gateway Delivery Logs ({smsReceiptModal.smsList.length})
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Network ACK 200 (Delivered)
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {smsReceiptModal.smsList.map((log: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 font-mono space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-950 text-xs">{log.studentName}</span>
                          <span className="text-xs text-zinc-900 font-semibold">{log.parentPhone}</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 font-sans leading-relaxed italic border-t border-zinc-200/60 pt-1 mt-1">
                          "{log.message}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                          <span>Gateway: {log.gateway}</span>
                          <span className="text-emerald-700 font-bold">STATUS: {log.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-zinc-500 font-mono text-xs">
                  All students were present. No absence SMS dispatched.
                </div>
              )}

              <div className="pt-3 flex justify-end border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setSmsReceiptModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. TEACHER CLASS BULK CSV UPLOAD MODAL */}
      {/* ======================================================== */}
      {isTeacherBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">Bulk CSV Upload: {currentTeacher.assignedClass}</h3>
                  <p className="text-xs text-zinc-500">Upload multiple students directly into your classroom.</p>
                </div>
              </div>
              <button
                onClick={() => setIsTeacherBulkOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Template Download */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-200/80 text-zinc-900 shrink-0">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950">Download {currentTeacher.assignedClass} CSV Template</h4>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Columns: Roll No, Student Name, Admission No, Parents Phone Number
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTeacherTemplate}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                >
                  <Download size={13} />
                  <span>Template</span>
                </button>
              </div>

              {/* File Selector */}
              <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-5 text-center hover:border-zinc-400 transition-colors bg-white">
                <FileText size={28} className="mx-auto text-zinc-400 mb-1.5" />
                <p className="font-semibold text-zinc-800">
                  {bulkFile ? bulkFile.name : `Select CSV file for ${currentTeacher.assignedClass}`}
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleTeacherBulkFileChange}
                  className="mt-2.5 block w-full text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-950 file:text-white hover:file:bg-zinc-800 cursor-pointer"
                />
              </div>

              {/* Preview Table */}
              {bulkPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-950 font-mono">
                      Found {bulkPreview.length} students to enroll in {currentTeacher.assignedClass}:
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-100 text-zinc-700 font-mono text-[10px] uppercase sticky top-0 border-b border-zinc-200">
                        <tr>
                          <th className="py-2 px-3">Roll No</th>
                          <th className="py-2 px-3">Student Name</th>
                          <th className="py-2 px-3">Admission No</th>
                          <th className="py-2 px-3">Parents Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-medium">
                        {bulkPreview.map((s, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50 font-mono text-[11px]">
                            <td className="py-2 px-3 font-bold text-zinc-950">#{s.rollNo}</td>
                            <td className="py-2 px-3 font-semibold text-zinc-900 font-sans">{s.name}</td>
                            <td className="py-2 px-3 text-zinc-600">{s.admissionNo}</td>
                            <td className="py-2 px-3 text-zinc-600">{s.parentPhone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsTeacherBulkOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={bulkPreview.length === 0 || isBulkUploading}
                  onClick={handleTeacherBulkUploadSubmit}
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>{isBulkUploading ? 'Uploading...' : `Enroll ${bulkPreview.length} Students`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 11. MODAL: ADD SINGLE STUDENT TO CLASS */}
      {/* ======================================================== */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">Add Student to {currentTeacher.assignedClass}</h3>
                  <p className="text-xs text-zinc-500">Student will be enrolled directly into your class.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSingleStudent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Malhotra"
                  value={formStudentName}
                  onChange={(e) => setFormStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 04"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Admission No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 19559"
                    value={formAdmissionNo}
                    onChange={(e) => setFormAdmissionNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Parents Phone Number * (For SMS)</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765-43210"
                  value={formParentPhone}
                  onChange={(e) => setFormParentPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none font-mono"
                />
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-600 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Adding this student will automatically enroll them in <strong>{currentTeacher.assignedClass}</strong> and sync to Admin Registry.
                </span>
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
                  className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Enroll Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
