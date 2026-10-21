import { StudentEmployee, AttendanceRecord, AppSettings, ActivityItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error [${res.status}]: ${errorText}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const api = {
  // Members / People
  getPeople: () => request<StudentEmployee[]>('/people'),
  createPerson: (person: Partial<StudentEmployee>) =>
    request<StudentEmployee>('/people', {
      method: 'POST',
      body: JSON.stringify(person),
    }),
  updatePerson: (id: string, updates: Partial<StudentEmployee>) =>
    request<StudentEmployee>(`/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deletePerson: (id: string) =>
    request<{ success: boolean }>(`/people/${id}`, {
      method: 'DELETE',
    }),

  // Attendance
  getAttendance: (date?: string) =>
    request<AttendanceRecord[]>(`/attendance${date ? `?date=${encodeURIComponent(date)}` : ''}`),
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) =>
    request<AttendanceRecord>('/attendance', {
      method: 'POST',
      body: JSON.stringify(record),
    }),
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) =>
    request<AttendanceRecord>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteAttendance: (id: string) =>
    request<{ success: boolean }>(`/attendance/${id}`, {
      method: 'DELETE',
    }),

  // Activities & Settings
  getActivities: () => request<ActivityItem[]>('/activities'),
  getSettings: () => request<AppSettings>('/settings'),
  updateSettings: (settings: Partial<AppSettings>) =>
    request<AppSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
