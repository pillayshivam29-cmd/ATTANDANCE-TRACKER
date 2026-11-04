import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';
import { FileSpreadsheet, Download, Upload, FileText, CheckCircle2, School, GraduationCap, CreditCard, Phone, Hash } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'students' | 'teachers' | 'fees';
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ 
  isOpen, 
  onClose,
  defaultType = 'students'
}) => {
  const { addToast } = useAttendance();

  // 3-WAY SELECTOR: 'students' | 'teachers' | 'fees'
  const [uploadType, setUploadType] = useState<'students' | 'teachers' | 'fees'>(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Download Templates for each specific type
  const handleDownloadTemplate = () => {
    let csvContent = '';
    let filename = '';

    if (uploadType === 'students') {
      // 🎓 STUDENTS CSV TEMPLATE: Name, Roll Number, Admission Number, Class, Section, Parents Phone Number
      csvContent =
        'Roll No,Student Name,Admission No,Class,Section,Parents Phone Number\n' +
        '01,Rahul Sharma,19554,Grade 10,A,+91 9876543210\n' +
        '02,Priya Verma,19555,Grade 10,A,+91 9876543211\n' +
        '03,Aman Gupta,19556,Grade 10,B,+91 9876543212\n' +
        '04,Ananya Patel,19557,Grade 11,A,+91 9876543213\n' +
        '05,Kunal Raj Singh,19558,Grade 10,A,+91 9876543214\n';
      filename = 'attendly_students_template.csv';
    } else if (uploadType === 'teachers') {
      csvContent =
        'Faculty ID,Teacher Name,Subject,Department,Assigned Class,Phone,Teacher Gmail,Login Password\n' +
        'FAC-201,Dr. Rajesh Sharma,Mathematics & Calculus,Science & Math,Grade 10-A,+91 9876543220,rajesh.sharma@gmail.com,Teacher123\n' +
        'FAC-202,Prof. Kavita Rao,Physics & Mechanics,Science & Math,Grade 11-A,+91 9876543221,kavita.rao@gmail.com,Teacher123\n' +
        'FAC-203,Deepak Mehta,English Literature,Languages,Grade 10-B,+91 9876543222,deepak.mehta@gmail.com,Teacher123\n' +
        'FAC-204,Sunita Verma,Chemistry Theory & Lab,Science & Math,Grade 12-A,+91 9876543223,sunita.verma@gmail.com,Teacher123\n';
      filename = 'attendly_teachers_template.csv';
    } else {
      // 💳 FEES & REGISTRY TEMPLATE
      csvContent =
        'Admission No,Student Name,Class,Parent Name,Parent Phone,Fee Status,Fees Paid Till,Due Amount\n' +
        'ADM-2026-201,Rahul Sharma,Grade 10-A,Sunil Sharma,+91 9876543210,Paid,Paid Full Year (2026-27),₹0\n' +
        'ADM-2026-202,Priya Verma,Grade 10-A,Manoj Verma,+91 9876543211,Partial,Paid till Term 2 (Nov 2026),₹15,000\n' +
        'ADM-2026-203,Aman Gupta,Grade 10-B,Rajesh Gupta,+91 9876543212,Pending,Pending from April 2026,₹60,000\n' +
        'ADM-2026-204,Ananya Patel,Grade 10-B,Suresh Patel,+91 9876543213,Paid,Paid till Term 3 (Jan 2027),₹0\n';
      filename = 'attendly_fees_registry_template.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Template Downloaded', `${filename} saved to your downloads`, 'info');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const parsed: any[] = [];

      if (lines.length <= 1) {
        setPreviewData([]);
        return;
      }

      if (uploadType === 'students') {
        // 🎓 PARSE STUDENTS: Roll No, Name, Admission No, Class, Section, Parents Phone
        const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const rollIdx = header.findIndex((h) => h.includes('roll'));
        const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('student'));
        const admIdx = header.findIndex((h) => h.includes('admission') || h.includes('adm') || h.includes('id'));
        const classIdx = header.findIndex((h) => h.includes('class') || h.includes('grade'));
        const secIdx = header.findIndex((h) => h.includes('section') || h.includes('sec'));
        const phoneIdx = header.findIndex((h) => h.includes('phone') || h.includes('parent') || h.includes('contact') || h.includes('mobile'));

        const rIdx = rollIdx >= 0 ? rollIdx : 0;
        const nIdx = nameIdx >= 0 ? nameIdx : 1;
        const aIdx = admIdx >= 0 ? admIdx : 2;
        const cIdx = classIdx >= 0 ? classIdx : 3;
        const sIdx = secIdx >= 0 ? secIdx : 4;
        const pIdx = phoneIdx >= 0 ? phoneIdx : 5;

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((item) => item.trim().replace(/^"|"$/g, ''));
          if (row.length > 1 || (row[0] && row[0] !== '')) {
            const roll = row[rIdx] || String(i).padStart(2, '0');
            const name = row[nIdx] || `Student ${i}`;
            const adm = row[aIdx] || `1955${i}`;
            const cls = row[cIdx] || 'Grade 10';
            const sec = row[sIdx] || 'A';
            const parentPhone = row[pIdx] || '+91 98765-00000';
            const fullClass = cls.includes('-') ? cls : `${cls}-${sec}`;

            parsed.push({
              rollNo: roll,
              name: name,
              admissionNo: adm,
              employeeId: adm,
              className: cls,
              section: sec,
              department: fullClass,
              phone: parentPhone,
              parentPhone: parentPhone,
              email: `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
              role: 'Student',
              joinDate: new Date().toISOString().split('T')[0],
              status: 'active',
              attendancePercentage: 100,
            });
          }
        }
      } else if (uploadType === 'teachers') {
        // 👨‍🏫 PARSE TEACHERS (With Gmail & Login Password)
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((item) => item.trim().replace(/^"|"$/g, ''));
          if (row[0]) {
            const tName = row[1] || row[0];
            const tEmail = row[6] || `${tName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
            const tPass = row[7] || 'Teacher123';
            parsed.push({
              id: row[0] || `FAC-${200 + i}`,
              name: tName,
              subject: row[2] || 'General Subject',
              department: row[3] || 'Science & Math',
              assignedClass: row[4] || 'Grade 10-A',
              phone: row[5] || '+91 98000-00000',
              email: tEmail,
              password: tPass,
              checkIn: '08:30 AM',
              checkOut: '03:30 PM',
              status: 'present',
            });
          }
        }
      } else {
        // 💳 PARSE FEES
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((item) => item.trim().replace(/^"|"$/g, ''));
          if (row[0]) {
            parsed.push({
              id: `S-${Date.now()}-${i}`,
              admissionNo: row[0] || `ADM-2026-${200 + i}`,
              name: row[1] || 'Student',
              gradeClass: row[2] || 'Grade 10-A',
              parentName: row[3] || 'Parent / Guardian',
              parentPhone: row[4] || '+91 98000-00000',
              feeStatus: (row[5] === 'Paid' || row[5] === 'Partial' || row[5] === 'Pending') ? row[5] : 'Paid',
              feePaidTill: row[6] || 'Paid Full Year',
              totalFee: '₹60,000',
              dueAmount: row[7] || '₹0',
              attendanceRate: 95,
            });
          }
        }
      }
      setPreviewData(parsed);
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;
    setIsUploading(true);

    try {
      if (uploadType === 'students') {
        // 🎓 SAVE STUDENTS: 4-Way Real Time Sync
        // 1. Sync to attendly_people_v1 (Admin Students Registry)
        const existingPeople = JSON.parse(localStorage.getItem('attendly_people_v1') || '[]');
        const formattedNewPeople = previewData.map((item, idx) => {
          const nameParts = (item.name || 'Student').trim().split(' ');
          const initials =
            nameParts.length > 1
              ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
              : (item.name || 'ST').slice(0, 2).toUpperCase();

          return {
            id: `emp-${Date.now()}-${idx}`,
            initials,
            ...item,
          };
        });
        localStorage.setItem('attendly_people_v1', JSON.stringify([...formattedNewPeople, ...existingPeople]));

        // 2. Sync to attendly_students_att_v2 (Daily Roll Call)
        const attendanceItems = previewData.map((item, idx) => ({
          id: `STU-${Date.now()}-${idx}`,
          admissionNo: item.admissionNo,
          rollNo: item.rollNo,
          name: item.name,
          gradeClass: item.department,
          parentName: 'Parent / Guardian',
          parentPhone: item.parentPhone,
          checkIn: '08:15 AM',
          status: 'present' as const,
        }));
        const existingAttendance = JSON.parse(localStorage.getItem('attendly_students_att_v2') || '[]');
        localStorage.setItem('attendly_students_att_v2', JSON.stringify([...existingAttendance, ...attendanceItems]));

        // 3. Sync to attendly_students_v1 (Admin Dashboard Fees)
        const feeItems = previewData.map((item, idx) => ({
          id: `S-${Date.now()}-${idx}`,
          admissionNo: item.admissionNo,
          rollNo: item.rollNo,
          name: item.name,
          gradeClass: item.department,
          parentName: 'Parent / Guardian',
          parentPhone: item.parentPhone,
          feeStatus: 'Paid' as const,
          feePaidTill: 'Paid Full Year (2026-27)',
          totalFee: '₹60,000',
          dueAmount: '₹0',
          attendanceRate: 100,
        }));
        const existingFees = JSON.parse(localStorage.getItem('attendly_students_v1') || '[]');
        localStorage.setItem('attendly_students_v1', JSON.stringify([...existingFees, ...feeItems]));

        // 4. Sync to attendly_att_by_date_v3 (Calendar)
        try {
          const todayStr = new Date().toISOString().split('T')[0];
          const calendarMap = JSON.parse(localStorage.getItem('attendly_att_by_date_v3') || '{}');
          const todayTeachers = JSON.parse(localStorage.getItem('attendly_teachers_att_v2') || 'null') || [];
          if (!calendarMap[todayStr]) {
            calendarMap[todayStr] = {
              teachers: todayTeachers,
              students: attendanceItems,
            };
          } else {
            calendarMap[todayStr].students = [...(calendarMap[todayStr].students || []), ...attendanceItems];
            if (!Array.isArray(calendarMap[todayStr].teachers)) {
              calendarMap[todayStr].teachers = todayTeachers;
            }
          }
          localStorage.setItem('attendly_att_by_date_v3', JSON.stringify(calendarMap));
        } catch (e) {
          console.warn(e);
        }

        addToast(
          'Students Uploaded! 🎓',
          `${previewData.length} students enrolled with Roll No, Admission No, and Class details!`,
          'success'
        );
      } else if (uploadType === 'teachers') {
        // 👨‍🏫 SAVE TEACHERS
        const existingTeachers = JSON.parse(localStorage.getItem('attendly_teachers_att_v2') || '[]');
        const updatedTeachers = [...existingTeachers, ...previewData];
        localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(updatedTeachers));

        addToast(
          'Teachers Uploaded! 👨‍🏫',
          `${previewData.length} faculty members added to Teachers Attendance roster!`,
          'success'
        );
      } else {
        // 💳 SAVE FEES
        const existingFeeStudents = JSON.parse(localStorage.getItem('attendly_students_v1') || '[]');
        const updatedFeeStudents = [...existingFeeStudents, ...previewData];
        localStorage.setItem('attendly_students_v1', JSON.stringify(updatedFeeStudents));

        addToast(
          'Fees & Students Uploaded! 💳',
          `${previewData.length} student fee records added directly into Dashboard!`,
          'success'
        );
      }

      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      addToast('Upload Error', 'Could not process CSV data. Please check file format.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Institutional Bulk CSV Upload"
      description="Choose what you want to upload: Students, Teachers, or Fee Records."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* 🔀 3-WAY MODE SELECTOR */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200">
          <button
            type="button"
            onClick={() => {
              setUploadType('students');
              setFile(null);
              setPreviewData([]);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              uploadType === 'students'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 bg-transparent'
            }`}
          >
            <GraduationCap size={15} />
            <span>1. Students</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadType('teachers');
              setFile(null);
              setPreviewData([]);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              uploadType === 'teachers'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 bg-transparent'
            }`}
          >
            <School size={15} />
            <span>2. Teachers</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadType('fees');
              setFile(null);
              setPreviewData([]);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              uploadType === 'fees'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 bg-transparent'
            }`}
          >
            <CreditCard size={15} />
            <span>3. Fees & Registry</span>
          </button>
        </div>

        {/* Step 1: Download specific template */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-200/80 text-zinc-900 shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">
                {uploadType === 'students' && 'Download Students CSV Template'}
                {uploadType === 'teachers' && 'Download Faculty Teachers CSV Template'}
                {uploadType === 'fees' && 'Download Students & Fees CSV Template'}
              </h4>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                {uploadType === 'students' && 'Columns: Roll No, Student Name, Admission No, Class, Section, Parents Phone Number'}
                {uploadType === 'teachers' && 'Columns: Faculty ID, Teacher Name, Subject, Department, Assigned Class, Phone'}
                {uploadType === 'fees' && 'Columns: Admission No, Student Name, Class, Parent Name, Parent Phone, Fee Status, Fees Paid Till, Due Amount'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={13} />}
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>
        </div>

        {/* Step 2: File Selector */}
        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-5 text-center hover:border-zinc-400 transition-colors bg-white">
          <FileText size={28} className="mx-auto text-zinc-400 mb-1.5" />
          <p className="text-xs font-semibold text-zinc-800">
            {file ? file.name : `Select your ${uploadType.toUpperCase()} CSV file`}
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-2.5 block w-full text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-950 file:text-white hover:file:bg-zinc-800 cursor-pointer"
          />
        </div>

        {/* Step 3: Data Preview */}
        {previewData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-950 font-mono">
                Found {previewData.length} records ready to upload:
              </span>
            </div>

            {uploadType === 'students' ? (
              /* 🎓 SPECIFIC STUDENTS PREVIEW TABLE: Roll No, Name, Admission No, Class, Section, Parents Phone */
              <div className="max-h-48 overflow-y-auto border border-zinc-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 text-zinc-700 font-mono text-[10px] uppercase sticky top-0 border-b border-zinc-200">
                    <tr>
                      <th className="py-2 px-3">Roll No</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">Admission No</th>
                      <th className="py-2 px-3">Class & Section</th>
                      <th className="py-2 px-3">Parents Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {previewData.slice(0, 10).map((s, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 font-mono text-[11px]">
                        <td className="py-2 px-3 font-bold text-zinc-950">#{s.rollNo}</td>
                        <td className="py-2 px-3 font-semibold text-zinc-900 font-sans">{s.name}</td>
                        <td className="py-2 px-3 text-zinc-600">{s.admissionNo}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 text-[10px]">
                            {s.className} - Sec {s.section}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-zinc-600">{s.parentPhone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Teachers & Fees Preview */
              <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-xs">
                {previewData.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="p-2 flex items-center justify-between hover:bg-zinc-50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-zinc-900 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                        {item.name ? item.name[0] : (item.admissionNo ? item.admissionNo[0] : '#')}
                      </span>
                      <span className="font-semibold text-zinc-900">{item.name || item.admissionNo}</span>
                      <span className="text-zinc-400 text-[11px]">
                        ({item.gradeClass || item.assignedClass || item.department})
                      </span>
                    </div>
                    <span className="font-mono text-zinc-500 text-[11px]">
                      {item.feeStatus ? `${item.feeStatus} • ${item.feePaidTill}` : (item.employeeId || item.id)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Upload size={14} />}
            disabled={previewData.length === 0 || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? 'Uploading Data...' : `Upload ${previewData.length} ${uploadType.toUpperCase()} Records`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
