import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { StudentEmployee } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { GraduationCap, School, CheckCircle2 } from 'lucide-react';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: StudentEmployee | null;
  category?: 'students' | 'teachers' | 'all';
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
  category = 'students',
}) => {
  const { addPerson, updatePerson, addToast } = useAttendance();

  const isTeacherMode =
    category === 'teachers' ||
    (personToEdit?.role && personToEdit.role.toLowerCase().includes('faculty'));

  // 🎓 STUDENT-SPECIFIC FIELDS: Name, Roll Number, Admission Number, Class, Section, Parents Phone Number
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [className, setClassName] = useState('Grade 10');
  const [section, setSection] = useState('A');
  const [parentPhone, setParentPhone] = useState('');

  // 👨‍🏫 TEACHER-SPECIFIC FIELDS (Fallback when on Teachers Tab)
  const [teacherName, setTeacherName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [subject, setSubject] = useState('');
  const [assignedClass, setAssignedClass] = useState('Grade 10-A');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('Teacher123');

  useEffect(() => {
    if (personToEdit) {
      if (isTeacherMode) {
        setTeacherName(personToEdit.name);
        setFacultyId(personToEdit.employeeId);
        setSubject(personToEdit.role?.replace(/Faculty\s*\(?|\)?/gi, '') || 'Academics');
        setAssignedClass(personToEdit.department || 'Grade 10-A');
        setTeacherPhone(personToEdit.phone || '');
        setTeacherEmail(personToEdit.email || '');

        try {
          const teachersSaved = JSON.parse(localStorage.getItem('attendly_teachers_att_v2') || '[]');
          const match = teachersSaved.find(
            (t: any) => t.id === personToEdit.employeeId || t.id === personToEdit.id || t.email === personToEdit.email
          );
          if (match?.password) {
            setTeacherPassword(match.password);
          } else {
            setTeacherPassword('Teacher123');
          }
        } catch {
          setTeacherPassword('Teacher123');
        }
      } else {
        setStudentName(personToEdit.name);
        setRollNo(personToEdit.rollNo || '');
        setAdmissionNo(personToEdit.admissionNo || personToEdit.employeeId || '');
        
        // Parse Class & Section from department if not present
        if (personToEdit.className) {
          setClassName(personToEdit.className);
        } else if (personToEdit.department.includes('-')) {
          setClassName(personToEdit.department.split('-')[0].trim());
        } else {
          setClassName('Grade 10');
        }

        if (personToEdit.section) {
          setSection(personToEdit.section);
        } else if (personToEdit.department.includes('-')) {
          setSection(personToEdit.department.split('-')[1].trim());
        } else {
          setSection('A');
        }

        setParentPhone(personToEdit.parentPhone || personToEdit.phone || '');
      }
    } else {
      // New Student Defaults
      setStudentName('');
      setRollNo('');
      setAdmissionNo(`${Math.floor(10000 + Math.random() * 90000)}`);
      setClassName('Grade 10');
      setSection('A');
      setParentPhone('');

      // New Teacher Defaults
      setTeacherName('');
      setFacultyId(`FAC-${100 + Math.floor(Math.random() * 900)}`);
      setSubject('Mathematics');
      setAssignedClass('Grade 10-A');
      setTeacherPhone('');
    }
  }, [personToEdit, isOpen, isTeacherMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isTeacherMode) {
      // 👨‍🏫 TEACHER SUBMISSION (Includes Login Gmail & Password set by Admin)
      if (!teacherName.trim() || !facultyId.trim()) return;

      const emailVal = teacherEmail.trim().toLowerCase() || `${teacherName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
      const passVal = teacherPassword.trim() || 'Teacher123';

      const newTeacherObj = {
        id: facultyId.trim(),
        name: teacherName.trim(),
        subject: subject.trim() || 'General Subject',
        department: 'Academics',
        assignedClass: assignedClass.trim() || 'Grade 10-A',
        phone: teacherPhone.trim() || '+91 98000-00000',
        email: emailVal,
        password: passVal,
        checkIn: '08:30 AM',
        checkOut: '03:30 PM',
        status: 'present',
      };

      try {
        const existingTeachers = JSON.parse(localStorage.getItem('attendly_teachers_att_v2') || '[]');
        if (personToEdit) {
          const updated = existingTeachers.map((t: any) =>
            t.id === personToEdit.employeeId || t.id === personToEdit.id ? newTeacherObj : t
          );
          localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(updated));
        } else {
          localStorage.setItem('attendly_teachers_att_v2', JSON.stringify([...existingTeachers, newTeacherObj]));
        }
        addToast('Teacher Saved', `${teacherName} (${emailVal}) can now login with password: ${passVal}`, 'success');
      } catch (err) {
        console.warn(err);
      }
    } else {
      // 🎓 STUDENT SUBMISSION (Name, Roll No, Admission No, Class, Section, Parents Phone)
      if (!studentName.trim() || !admissionNo.trim()) return;

      const fullClass = `${className.trim()}-${section.trim()}`;
      const adm = admissionNo.trim();
      const phoneNum = parentPhone.trim() || '+91 98765-00000';
      const cleanEmail = `${studentName.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

      if (personToEdit) {
        updatePerson(personToEdit.id, {
          name: studentName.trim(),
          employeeId: adm,
          admissionNo: adm,
          rollNo: rollNo.trim(),
          className: className.trim(),
          section: section.trim(),
          department: fullClass,
          phone: phoneNum,
          parentPhone: phoneNum,
          email: personToEdit.email || cleanEmail,
          role: 'Student',
          status: 'active',
        });
      } else {
        await addPerson({
          name: studentName.trim(),
          employeeId: adm,
          admissionNo: adm,
          rollNo: rollNo.trim(),
          className: className.trim(),
          section: section.trim(),
          department: fullClass,
          phone: phoneNum,
          parentPhone: phoneNum,
          email: cleanEmail,
          role: 'Student',
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active',
        });

        // Sync to Daily Attendance Roster (attendly_students_att_v2)
        try {
          const existingAtt = JSON.parse(localStorage.getItem('attendly_students_att_v2') || '[]');
          const newAtt = {
            id: `STU-${Date.now()}`,
            admissionNo: adm,
            rollNo: rollNo.trim(),
            name: studentName.trim(),
            gradeClass: fullClass,
            parentName: 'Parent / Guardian',
            parentPhone: phoneNum,
            checkIn: '08:15 AM',
            status: 'present' as const,
          };
          localStorage.setItem('attendly_students_att_v2', JSON.stringify([...existingAtt, newAtt]));
        } catch (e) {
          console.warn(e);
        }

        // Sync to Admin Dashboard Fees & Records (attendly_students_v1)
        try {
          const existingFees = JSON.parse(localStorage.getItem('attendly_students_v1') || '[]');
          const newFee = {
            id: `S-${Date.now()}`,
            admissionNo: adm,
            rollNo: rollNo.trim(),
            name: studentName.trim(),
            gradeClass: fullClass,
            parentName: 'Parent / Guardian',
            parentPhone: phoneNum,
            feeStatus: 'Paid' as const,
            feePaidTill: 'Paid Full Year (2026-27)',
            totalFee: '₹60,000',
            dueAmount: '₹0',
            attendanceRate: 100,
          };
          localStorage.setItem('attendly_students_v1', JSON.stringify([...existingFees, newFee]));
        } catch (e) {
          console.warn(e);
        }
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isTeacherMode
          ? personToEdit
            ? 'Edit Faculty Record'
            : 'Add New Teacher / Faculty'
          : personToEdit
          ? 'Edit Student Record'
          : 'Add New Student'
      }
      description={
        isTeacherMode
          ? 'Register faculty credentials, subject specialization, and assigned class.'
          : 'Enter student details: Roll No, Admission No, Class & Section, and Parents Contact.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ========================================================== */}
        {/* 🎓 STUDENT FORM: Name, Roll No, Admission No, Class, Section, Parents Phone */}
        {/* ========================================================== */}
        {!isTeacherMode ? (
          <>
            {/* Student Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Student Full Name <span className="text-zinc-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Akash Pillay"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 font-medium"
              />
            </div>

            {/* Roll Number & Admission Number */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Roll Number <span className="text-zinc-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01, 15, 24"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Admission Number <span className="text-zinc-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 19554 or ADM-2026-101"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            {/* Class & Section */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Class / Grade <span className="text-zinc-400">*</span>
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer font-medium"
                >
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 7">Grade 7</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Section <span className="text-zinc-400">*</span>
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer font-medium"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>

            {/* Parents Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Parents Phone Number <span className="text-zinc-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+91 98765-43210 (For SMS & WhatsApp alerts)"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Absent alerts will be sent automatically to this phone number.
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>
                Enrolling will add student to <strong>{className}-{section}</strong> and synchronize with Teacher Portal and Attendance Calendar.
              </span>
            </div>
          </>
        ) : (
          /* ========================================================== */
          /* 👨‍🏫 TEACHER FORM FALLBACK */
          /* ========================================================== */
          <>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">
                Teacher / Faculty Name <span className="text-zinc-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Sharma"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Faculty ID <span className="text-zinc-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FAC-101"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Subject Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics / Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Assigned Class
                </label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
                >
                  <option value="Grade 10-A">Grade 10-A</option>
                  <option value="Grade 10-B">Grade 10-B</option>
                  <option value="Grade 11-A">Grade 11-A</option>
                  <option value="Grade 11-B">Grade 11-B</option>
                  <option value="Grade 12-A">Grade 12-A</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765-43220"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 font-mono"
                />
              </div>
            </div>

            {/* 🔒 Teacher Portal Login Credentials (Set by Admin) */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Teacher Login Gmail <span className="text-zinc-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. teacher@gmail.com"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value.toLowerCase())}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Teacher Login Password <span className="text-zinc-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TeacherPass123"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 font-mono"
                />
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {isTeacherMode
              ? personToEdit
                ? 'Save Faculty'
                : 'Add Teacher'
              : personToEdit
              ? 'Save Changes'
              : 'Add Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
