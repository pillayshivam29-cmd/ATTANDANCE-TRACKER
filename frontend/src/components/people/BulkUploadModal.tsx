import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';
import { FileSpreadsheet, Download, Upload, FileText } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useAttendance();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent =
      'Name,Student ID,Email,Class/Department,Phone\n' +
      'Rahul Sharma,STU-201,rahul.sharma@school.edu,Grade 10-A,+91 9876543210\n' +
      'Priya Verma,STU-202,priya.verma@school.edu,Grade 10-A,+91 9876543211\n' +
      'Aman Gupta,STU-203,aman.gupta@school.edu,Grade 10-B,+91 9876543212\n' +
      'Ananya Patel,STU-204,ananya.patel@school.edu,Grade 10-B,+91 9876543213\n' +
      'Rohan Joshi,STU-205,rohan.joshi@school.edu,Grade 11-A,+91 9876543214\n' +
      'Sneha Roy,STU-206,sneha.roy@school.edu,Grade 11-A,+91 9876543215';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendly_students_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    addToast('Template Downloaded', 'students_template.csv saved to downloads', 'info');
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
          parsed.push({
            name: row[0],
            employeeId: row[1] || `STU-${100 + i}`,
            email: row[2] || `${row[0].toLowerCase().replace(/\s+/g, '.')}@school.edu`,
            department: row[3] || 'Grade 10-A',
            phone: row[4] || '',
            role: 'Student',
          });
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
      const res = await fetch('http://localhost:4000/api/people/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData),
      });

      if (!res.ok) throw new Error('Upload failed');

      addToast(
        'Bulk Upload Complete',
        `${previewData.length} students uploaded directly into MongoDB database!`,
        'success'
      );
      onClose();
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      addToast('Upload Error', 'Could not upload to server. Ensure backend is running.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload Students (Excel / CSV)"
      description="Upload an entire batch of students into MongoDB in one click."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-200/80 text-zinc-900 shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">Step 1: Download CSV Template</h4>
              <p className="text-[11px] text-zinc-500">
                Format: Name, Student ID, Email, Class/Department, Phone
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

        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center hover:border-zinc-400 transition-colors bg-white">
          <FileText size={32} className="mx-auto text-zinc-400 mb-2" />
          <p className="text-xs font-semibold text-zinc-800">
            {file ? file.name : 'Select or drop your completed CSV file'}
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-3 block w-full text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-950 file:text-white hover:file:bg-zinc-800 cursor-pointer"
          />
        </div>

        {previewData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-950 font-mono">
                Found {previewData.length} students ready to upload:
              </span>
            </div>

            <div className="max-h-44 overflow-y-auto border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-xs">
              {previewData.slice(0, 8).map((s, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-zinc-50">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-900 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                      {s.name[0]}
                    </span>
                    <span className="font-semibold text-zinc-900">{s.name}</span>
                    <span className="text-zinc-400 text-[11px]">({s.department})</span>
                  </div>
                  <span className="font-mono text-zinc-500 text-[11px]">{s.employeeId}</span>
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
            {isUploading ? 'Uploading to MongoDB...' : `Upload ${previewData.length} Students`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
