import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';
import { FileSpreadsheet, Download, Upload, FileText, CheckCircle2, School, GraduationCap, CreditCard } from 'lucide-react';

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
      csvContent =
        'Name,Student ID,Email,Class/Department,Phone\n' +
        'Rahul Sharma,STU-201,rahul.sharma@school.edu,Grade 10-A,+91 9876543210\n' +
        'Priya Verma,STU-202,priya.verma@school.edu,Grade 10-A,+91 9876543211\n' +
        'Aman Gupta,STU-203,aman.gupta@school.edu,Grade 10-B,+91 9876543212\n' +
        'Ananya Patel,STU-204,ananya.patel@school.edu,Grade 10-B,+91 9876543213\n';
      filename = 'attendly_students_template.csv';
    } else if (uploadType === 'teachers') {
      csvContent =
        'Faculty ID,Teacher Name,Subject,Department,Assigned Class,Phone\n' +
        'FAC-201,Dr. Rajesh Sharma,Mathematics & Calculus,Science & Math,Grade 10-A,+91 9876543220\n' +
        'FAC-202,Prof. Kavita Rao,Physics & Mechanics,Science & Math,Grade 11-A,+91 9876543221\n' +
        'FAC-203,Deepak Mehta,English Literature,Languages,Grade 10-B,+91 9876543222\n' +
        'FAC-204,Sunita Verma,Chemistry Theory & Lab,Science & Math,Grade 12-A,+91 9876543223\n';
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

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((item) => item.trim().replace(/^"|"$/g, ''));
        if (row[0]) {
          if (uploadType === 'teachers') {
            parsed.push({
              id: row[0] || `FAC-${200 + i}`,
              name: row[1] || row[0],
              subject: row[2] || 'General Subject',
              department: row[3] || 'Science & Math',
              assignedClass: row[4] || 'Grade 10-A',
              phone: row[5] || '+91 98000-00000',
              checkIn: '08:30 AM',
              checkOut: '03:30 PM',
              status: 'present',
            });
          } else if (uploadType === 'fees') {
            // Fee Record Format
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
          } else {
            // Standard Student Format
            parsed.push({
              name: row[0],
              employeeId: row[1] || `ADM-2026-${100 + i}`,
              email: row[2] || `${row[0].toLowerCase().replace(/\s+/g, '.')}@school.edu`,
              department: row[3] || 'Grade 10-A',
              phone: row[4] || '+91 98000-00000',
              role: 'Student',
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
      if (uploadType === 'teachers') {
        // 👨‍🏫 SAVE TEACHERS
        const existingTeachers = JSON.parse(localStorage.getItem('attendly_teachers_att_v2') || '[]');
        const updatedTeachers = [...existingTeachers, ...previewData];
        localStorage.setItem('attendly_teachers_att_v2', JSON.stringify(updatedTeachers));

        addToast(
          'Teachers Uploaded! 👨‍🏫',
          `${previewData.length} faculty members added to Teachers Attendance roster!`,
          'success'
        );
      } else if (uploadType === 'fees') {
        // 💳 SAVE STUDENTS & FEE RECORDS (Dashboard table + Attendance)
        const existingFeeStudents = JSON.parse(localStorage.getItem('attendly_students_v1') || '[]');
        const updatedFeeStudents = [...existingFeeStudents, ...previewData];
        localStorage.setItem('attendly_students_v1', JSON.stringify(updatedFeeStudents));

        // Also add to daily attendance roster
        const attendanceItems = previewData.map((s, idx) => ({
          id: `STU-${Date.now()}-${idx}`,
          admissionNo: s.admissionNo,
          name: s.name,
          gradeClass: s.gradeClass,
          parentName: s.parentName,
          parentPhone: s.parentPhone,
          checkIn: '08:15 AM',
          status: 'present' as const,
        }));
        const existingAtt = JSON.parse(localStorage.getItem('attendly_students_att_v2') || '[]');
        localStorage.setItem('attendly_students_att_v2', JSON.stringify([...existingAtt, ...attendanceItems]));

        addToast(
          'Fees & Students Uploaded! 💳',
          `${previewData.length} student fee records added directly into Dashboard!`,
          'success'
        );
      } else {
        // 🎓 SAVE STUDENTS
        const newAttendanceStudents = previewData.map((item, idx) => ({
          id: `STU-${Date.now()}-${idx}`,
          admissionNo: item.employeeId || `ADM-2026-${100 + idx}`,
          name: item.name,
          gradeClass: item.department || 'Grade 10-A',
          parentName: 'Parent / Guardian',
          parentPhone: item.phone || '+91 98000-00000',
          checkIn: '08:15 AM',
          status: 'present' as const,
        }));

        const existingAttendance = JSON.parse(localStorage.getItem('attendly_students_att_v2') || '[]');
        localStorage.setItem('attendly_students_att_v2', JSON.stringify([...existingAttendance, ...newAttendanceStudents]));

        const existingPeople = JSON.parse(localStorage.getItem('attendly_people_v1') || '[]');
        localStorage.setItem('attendly_people_v1', JSON.stringify([...existingPeople, ...previewData]));

        addToast(
          'Students Uploaded! 🎓',
          `${previewData.length} students registered in student registry!`,
          'success'
        );
      }

      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 600);
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
              <p className="text-[11px] text-zinc-500">
                {uploadType === 'students' && 'Format: Name, Student ID, Email, Class/Department, Phone'}
                {uploadType === 'teachers' && 'Format: Faculty ID, Teacher Name, Subject, Department, Assigned Class, Phone'}
                {uploadType === 'fees' && 'Format: Admission No, Student Name, Class, Parent Name, Parent Phone, Fee Status, Fees Paid Till, Due Amount'}
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

        {/* Preview */}
        {previewData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-950 font-mono">
                Found {previewData.length} records ready to upload:
              </span>
            </div>

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
