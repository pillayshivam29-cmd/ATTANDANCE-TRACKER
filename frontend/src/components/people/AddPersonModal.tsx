import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { StudentEmployee } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: StudentEmployee | null;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
}) => {
  const { addPerson, updatePerson } = useAttendance();

  const [name, setName] = useState(personToEdit?.name || '');
  const [employeeId, setEmployeeId] = useState(personToEdit?.employeeId || '');
  const [email, setEmail] = useState(personToEdit?.email || '');
  const [department, setDepartment] = useState(personToEdit?.department || 'Engineering');
  const [role, setRole] = useState(personToEdit?.role || '');
  const [phone, setPhone] = useState(personToEdit?.phone || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(
    personToEdit?.status || 'active'
  );

  React.useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setEmployeeId(personToEdit.employeeId);
      setEmail(personToEdit.email);
      setDepartment(personToEdit.department);
      setRole(personToEdit.role);
      setPhone(personToEdit.phone || '');
      setStatus(personToEdit.status);
    } else {
      setName('');
      setEmployeeId(`EMP-${1000 + Math.floor(Math.random() * 9000)}`);
      setEmail('');
      setDepartment('Engineering');
      setRole('');
      setPhone('');
      setStatus('active');
    }
  }, [personToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !employeeId.trim() || !email.trim()) return;

    if (personToEdit) {
      updatePerson(personToEdit.id, {
        name,
        employeeId,
        email,
        department,
        role: role || 'Member',
        phone,
        status,
      });
    } else {
      addPerson({
        name,
        employeeId,
        email,
        department,
        role: role || 'Member',
        phone,
        joinDate: new Date().toISOString().split('T')[0],
        status,
      });
    }

    onClose();
  };

  const departments = [
    'Engineering',
    'Product Design',
    'Product',
    'Marketing',
    'Operations',
    'Data Science',
    'Finance',
    'Grade 10-A',
    'Grade 10-B',
    'Grade 11-A',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={personToEdit ? 'Edit Member Record' : 'Add New Student / Employee'}
      description="Register member credentials, organization department, and role."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1">
            Full Name <span className="text-zinc-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Maya Lin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
          />
        </div>

        {/* ID & Department */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Member ID <span className="text-zinc-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. EMP-1060"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Department / Class <span className="text-zinc-400">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Email Address <span className="text-zinc-400">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="name@attendly.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
            />
          </div>
        </div>

        {/* Role & Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Role / Designation
            </label>
            <input
              type="text"
              placeholder="e.g. Lead Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Membership Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {personToEdit ? 'Save Changes' : 'Create Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
