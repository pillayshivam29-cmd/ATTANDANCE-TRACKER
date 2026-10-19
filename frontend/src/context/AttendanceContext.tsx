import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentEmployee,
  AttendanceRecord,
  AppSettings,
  ActivityItem,
  ToastMessage,
  AttendanceStatus,
} from '../types';
import {
  INITIAL_PEOPLE,
  INITIAL_SETTINGS,
  INITIAL_ACTIVITIES,
  generateInitialAttendanceRecords,
} from '../data/mockData';

export type NavigationTab =
  | 'dashboard'
  | 'attendance'
  | 'calendar'
  | 'people'
  | 'reports'
  | 'settings';

interface AttendanceContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  people: StudentEmployee[];
  attendanceRecords: AttendanceRecord[];
  activities: ActivityItem[];
  settings: AppSettings;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  isMarkModalOpen: boolean;
  markModalPersonId: string | null;
  openMarkModal: (personId?: string) => void;
  closeMarkModal: () => void;
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;
  deleteAttendance: (id: string) => void;
  addPerson: (
    person: Omit<StudentEmployee, 'id' | 'attendancePercentage' | 'initials'>
  ) => void;
  updatePerson: (id: string, updates: Partial<StudentEmployee>) => void;
  deletePerson: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetToMockData: () => void;
  exportCSV: (recordsToExport?: AttendanceRecord[], filename?: string) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PEOPLE: 'attendly_people_v1',
  RECORDS: 'attendly_records_v1',
  ACTIVITIES: 'attendly_activities_v1',
  SETTINGS: 'attendly_settings_v1',
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>('2026-10-17');
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markModalPersonId, setMarkModalPersonId] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize state with localStorage fallbacks
  const [people, setPeople] = useState<StudentEmployee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PEOPLE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PEOPLE;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return generateInitialAttendanceRecords();
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ACTIVITIES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    } catch (e) {
      console.warn('Failed saving people to localStorage', e);
    }
  }, [people]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.warn('Failed saving records to localStorage', e);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.warn('Failed saving activities to localStorage', e);
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed saving settings to localStorage', e);
    }
  }, [settings]);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (
    title: string,
    description?: string,
    type: ToastMessage['type'] = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openMarkModal = (personId?: string) => {
    setMarkModalPersonId(personId || null);
    setIsMarkModalOpen(true);
  };

  const closeMarkModal = () => {
    setIsMarkModalOpen(false);
    setMarkModalPersonId(null);
  };

  // Helper to re-calculate a person's attendance percentage
  const calculatePersonPercentage = (
    personId: string,
    currentRecords: AttendanceRecord[]
  ): number => {
    const personRecords = currentRecords.filter((r) => r.personId === personId);
    if (personRecords.length === 0) return 100;
    let score = 0;
    personRecords.forEach((r) => {
      if (r.status === 'present') score += 1;
      else if (r.status === 'late') score += 0.85;
      else if (r.status === 'half-day') score += 0.5;
    });
    return Number(((score / personRecords.length) * 100).toFixed(1));
  };

  const markAttendance = (data: Omit<AttendanceRecord, 'id'>) => {
    const existingIndex = attendanceRecords.findIndex(
      (r) => r.personId === data.personId && r.date === data.date
    );

    let updatedRecords: AttendanceRecord[];
    if (existingIndex >= 0) {
      updatedRecords = [...attendanceRecords];
      updatedRecords[existingIndex] = {
        ...updatedRecords[existingIndex],
        ...data,
      };
    } else {
      const newRecord: AttendanceRecord = {
        id: `rec-${Date.now()}`,
        ...data,
      };
      updatedRecords = [newRecord, ...attendanceRecords];
    }

    setAttendanceRecords(updatedRecords);

    // Update person attendance percentage
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id === data.personId) {
          const newPct = calculatePersonPercentage(p.id, updatedRecords);
          return { ...p, attendancePercentage: newPct };
        }
        return p;
      })
    );

    // Add activity log
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      personName: data.personName,
      department: data.department,
      type: 'marked',
      status: data.status,
      timestamp: data.checkIn && data.checkIn !== '--' ? data.checkIn : 'Logged',
      timeAgo: 'Just now',
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 19)]);

    addToast(
      'Attendance Recorded',
      `${data.personName} marked as ${data.status.toUpperCase()} for ${data.date}`,
      'success'
    );
    closeMarkModal();
  };

  const updateAttendance = (id: string, updates: Partial<AttendanceRecord>) => {
    const updated = attendanceRecords.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setAttendanceRecords(updated);
    addToast('Record Updated', 'Attendance record updated successfully', 'info');
  };

  const deleteAttendance = (id: string) => {
    const target = attendanceRecords.find((r) => r.id === id);
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    addToast(
      'Record Deleted',
      target ? `Deleted entry for ${target.personName}` : 'Record removed',
      'info'
    );
  };

  const addPerson = (
    personData: Omit<StudentEmployee, 'id' | 'attendancePercentage' | 'initials'>
  ) => {
    const nameParts = personData.name.trim().split(' ');
    const initials =
      nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].slice(0, 2).toUpperCase();

    const newPerson: StudentEmployee = {
      id: `emp-${Date.now()}`,
      ...personData,
      attendancePercentage: 100,
      initials,
    };

    setPeople((prev) => [newPerson, ...prev]);
    addToast('Member Added', `${newPerson.name} added to the directory`, 'success');
  };

  const updatePerson = (id: string, updates: Partial<StudentEmployee>) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (updates.name) {
            const parts = updates.name.trim().split(' ');
            updated.initials =
              parts.length > 1
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : parts[0].slice(0, 2).toUpperCase();
          }
          return updated;
        }
        return p;
      })
    );
    addToast('Profile Updated', 'Member details saved', 'info');
  };

  const deletePerson = (id: string) => {
    const person = people.find((p) => p.id === id);
    setPeople((prev) => prev.filter((p) => p.id !== id));
    setAttendanceRecords((prev) => prev.filter((r) => r.personId !== id));
    addToast(
      'Member Removed',
      person ? `${person.name} removed from registry` : 'Member deleted',
      'warning'
    );
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addToast('Settings Saved', 'Application preferences updated', 'success');
  };

  const resetToMockData = () => {
    localStorage.removeItem(STORAGE_KEYS.PEOPLE);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    setPeople(INITIAL_PEOPLE);
    setAttendanceRecords(generateInitialAttendanceRecords());
    setActivities(INITIAL_ACTIVITIES);
    setSettings(INITIAL_SETTINGS);
    addToast('Data Reset', 'All sample records and settings restored', 'info');
  };

  const exportCSV = (recordsToExport?: AttendanceRecord[], filename = 'attendly_records.csv') => {
    const list = recordsToExport || attendanceRecords;
    if (list.length === 0) {
      addToast('Export Failed', 'No records to export', 'error');
      return;
    }

    const headers = ['ID', 'Name', 'Employee ID', 'Department', 'Date', 'Check In', 'Check Out', 'Status', 'Notes'];
    const rows = list.map((r) => [
      `"${r.id}"`,
      `"${r.personName}"`,
      `"${r.employeeId}"`,
      `"${r.department}"`,
      `"${r.date}"`,
      `"${r.checkIn}"`,
      `"${r.checkOut}"`,
      `"${r.status}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('Export Complete', `${list.length} records exported to CSV`, 'success');
  };

  return (
    <AttendanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        people,
        attendanceRecords,
        activities,
        settings,
        currentDate,
        setCurrentDate,
        isMarkModalOpen,
        markModalPersonId,
        openMarkModal,
        closeMarkModal,
        markAttendance,
        updateAttendance,
        deleteAttendance,
        addPerson,
        updatePerson,
        deletePerson,
        updateSettings,
        resetToMockData,
        exportCSV,
        toasts,
        addToast,
        dismissToast,
        commandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
