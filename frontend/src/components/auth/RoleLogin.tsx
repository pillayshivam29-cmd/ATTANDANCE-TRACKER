import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  School, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Lock,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  departmentOrClass?: string;
  studentId?: string;
}

interface RoleLoginProps {
  onLogin: (session: UserSession) => void;
}

// ===============================================================
// 🔒 ADMIN EMAILS & PASSWORDS (Apne hisaab se password set karein)
// ===============================================================
export const ADMIN_ACCOUNTS = [
  {
    email: 'pillayshivam29@gmail.com', // Admin 1
    password: 'Adminshivam123',


  },
  {
    email: 'gyanpillay17mail.com',         // Admin 2
    password: 'Admimgyan123',      // <-- Iska password yaha set karein
  },
  {
    email: 'admin3@gmail.com',         // Admin 3
    password: 'AdminPassword123',      // <-- Iska password yaha set karein
  },
];

export const RoleLogin: React.FC<RoleLoginProps> = ({ onLogin }) => {
  const [activeModalRole, setActiveModalRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load dynamically configured teachers from localStorage (or defaults)
  const registeredTeachersList = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('attendly_teachers_att_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      { name: 'Prof. Marcus Chen', email: 'marcus.chen@gmail.com', password: 'Teacher123', assignedClass: 'Grade 10-A', department: 'Science & Math', id: 'FAC-101' },
      { name: 'Dr. Sophia Rodriguez', email: 'sophia.rodriguez@gmail.com', password: 'Teacher123', assignedClass: 'Grade 11-A', department: 'Science & Math', id: 'FAC-102' },
      { name: 'Julian Hayes', email: 'julian.hayes@gmail.com', password: 'Teacher123', assignedClass: 'Grade 10-B', department: 'Languages', id: 'FAC-103' },
      { name: 'Amara Okafor', email: 'amara.okafor@gmail.com', password: 'Teacher123', assignedClass: 'Grade 12-A', department: 'Science & Math', id: 'FAC-104' },
      { name: 'Rajesh Sharma', email: 'rajesh.sharma@gmail.com', password: 'Teacher123', assignedClass: 'Grade 11-B', department: 'Technology', id: 'FAC-105' },
      { name: 'Priya Patel', email: 'priya.patel@gmail.com', password: 'Teacher123', assignedClass: 'Grade 9-A', department: 'Humanities', id: 'FAC-106' },
    ];
  }, [activeModalRole]);

  const roles = [
    {
      id: 'admin' as UserRole,
      title: 'Administrator',
      subtitle: 'System Administration',
      badge: 'Authorized Only',
      description: 'System oversight, bulk upload students via Excel/CSV, policy rules & institution settings.',
      icon: <ShieldCheck size={28} className="text-zinc-950" />,
      department: 'Administration',
    },
    {
      id: 'teacher' as UserRole,
      title: 'Teacher / Faculty',
      subtitle: 'Class Teacher',
      badge: 'Class Control',
      description: 'Take daily roll call, mark present/absent/late, view class analytics and student directory.',
      icon: <School size={28} className="text-zinc-950" />,
      defaultEmail: 'teacher@attendly.edu',
      defaultName: 'Prof. Marcus Chen',
      department: 'Grade 10-A / Engineering',
    },
    {
      id: 'student' as UserRole,
      title: 'Student Portal',
      subtitle: 'Student Access',
      badge: 'Personal View',
      description: 'Check your personal attendance rate, daily calendar records, status breakdown and leave history.',
      icon: <GraduationCap size={28} className="text-zinc-950" />,
      defaultEmail: 'student@attendly.edu',
      defaultName: 'Eleanor Vance',
      department: 'Grade 10-A',
      studentId: 'EMP-1042',
    },
    {
      id: 'parent' as UserRole,
      title: 'Parent Portal',
      subtitle: 'Parent & Guardian',
      badge: 'Monitor View',
      description: 'Monitor your child’s daily presence, arrival timestamps, absence alerts, and monthly trends.',
      icon: <Users size={28} className="text-zinc-950" />,
      defaultEmail: 'parent@attendly.edu',
      defaultName: 'Arthur & Helen Vance',
      department: 'Parent of Eleanor Vance',
      studentId: 'EMP-1042',
    },
  ];

  const currentRole = roles.find((r) => r.id === activeModalRole);

  const openLoginModal = (roleId: UserRole) => {
    setActiveModalRole(roleId);
    setErrorMessage(null);
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRole) return;

    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    // 🔒 STRICT ADMIN CHECK: EMAIL + PASSWORD
    if (currentRole.id === 'admin') {
      const matchedAdmin = ADMIN_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === enteredEmail
      );

      // 1. Agar Email list mein nahi hai:
      if (!matchedAdmin) {
        setErrorMessage(
          'Access Denied: This email is not registered for administrator privileges.'
        );
        return;
      }

      // 2. Agar Password galat hai:
      if (matchedAdmin.password !== enteredPassword) {
        setErrorMessage(
          'Incorrect password. Please enter the correct administrator password.'
        );
        return;
      }

      // Dono sahi hai -> Admin Dashboard open hoga:
      onLogin({
        role: 'admin',
        name: enteredEmail.split('@')[0],
        email: enteredEmail,
        departmentOrClass: 'Administration',
        studentId: 'ADM-AUTH',
      });
      return;
    }

    // 🔒 STRICT TEACHER CHECK: GMAIL + PASSWORD CONFIGURED BY ADMIN
    if (currentRole.id === 'teacher') {
      let registeredTeachers: any[] = [];
      try {
        const saved = localStorage.getItem('attendly_teachers_att_v2');
        if (saved) registeredTeachers = JSON.parse(saved);
      } catch {
        registeredTeachers = [];
      }

      // Default fallback teachers list if localStorage is empty
      if (registeredTeachers.length === 0) {
        registeredTeachers = [
          { name: 'Prof. Marcus Chen', email: 'marcus.chen@gmail.com', password: 'Teacher123', assignedClass: 'Grade 10-A', department: 'Science & Math', id: 'FAC-101' },
          { name: 'Dr. Sophia Rodriguez', email: 'sophia.rodriguez@gmail.com', password: 'Teacher123', assignedClass: 'Grade 11-A', department: 'Science & Math', id: 'FAC-102' },
          { name: 'Julian Hayes', email: 'julian.hayes@gmail.com', password: 'Teacher123', assignedClass: 'Grade 10-B', department: 'Languages', id: 'FAC-103' },
          { name: 'Amara Okafor', email: 'amara.okafor@gmail.com', password: 'Teacher123', assignedClass: 'Grade 12-A', department: 'Science & Math', id: 'FAC-104' },
          { name: 'Rajesh Sharma', email: 'rajesh.sharma@gmail.com', password: 'Teacher123', assignedClass: 'Grade 11-B', department: 'Technology', id: 'FAC-105' },
          { name: 'Priya Patel', email: 'priya.patel@gmail.com', password: 'Teacher123', assignedClass: 'Grade 9-A', department: 'Humanities', id: 'FAC-106' },
        ];
      }

      // Check entered email against teacher's registered email
      const matchedTeacher = registeredTeachers.find((t: any) => {
        const tEmail = (t.email || '').trim().toLowerCase();
        return tEmail === enteredEmail || tEmail.replace('@attendly.edu', '@gmail.com') === enteredEmail;
      });

      // 1. Agar Teacher ka Gmail registered nahi hai:
      if (!matchedTeacher) {
        setErrorMessage(
          'Access Denied: This Gmail address is not registered for any teacher by the Admin. Please ask your administrator to register your Gmail.'
        );
        return;
      }

      // 2. Agar Password galat hai:
      const expectedPassword = (matchedTeacher.password || 'Teacher123').trim();
      if (expectedPassword !== enteredPassword) {
        setErrorMessage(
          'Incorrect password. Please enter the password configured by your school administrator.'
        );
        return;
      }

      // 3. Match ho gaya -> Teacher portal login successful!
      onLogin({
        role: 'teacher',
        name: matchedTeacher.name || enteredEmail.split('@')[0],
        email: matchedTeacher.email || enteredEmail,
        departmentOrClass: matchedTeacher.assignedClass
          ? `${matchedTeacher.department || 'Academics'} (${matchedTeacher.assignedClass})`
          : matchedTeacher.department || 'Faculty',
        studentId: matchedTeacher.id || 'FAC-AUTH',
      });
      return;
    }

    // Baaki roles ke liye (Student, Parent)
    onLogin({
      role: currentRole.id,
      name: enteredEmail ? enteredEmail.split('@')[0] : (currentRole.defaultName || 'User'),
      email: enteredEmail || currentRole.defaultEmail || '',
      departmentOrClass: currentRole.department,
      studentId: currentRole.studentId,
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 selection:bg-zinc-950 selection:text-white">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-zinc-950 text-white font-bold text-2xl items-center justify-center shadow-md">
            A
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
              Attendly Academy Portal
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto mt-1 leading-relaxed">
              Unified attendance management platform for institutions. Click on your portal to sign in.
            </p>
          </div>
        </div>

        {/* 4 Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((r) => (
            <div
              key={r.id}
              onClick={() => openLoginModal(r.id)}
              className="p-5 rounded-2xl border border-zinc-200/90 bg-white flex flex-col justify-between hover:border-zinc-950 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 group-hover:bg-zinc-200/80 transition-colors flex items-center justify-center">
                    {r.icon}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {r.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-950 tracking-tight group-hover:text-black">
                  {r.title}
                </h3>
                <span className="text-[11px] font-medium text-zinc-400 block -mt-0.5 mb-2">
                  {r.subtitle}
                </span>
                <p className="text-xs text-zinc-500 leading-relaxed">{r.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-950 flex items-center gap-1 group-hover:underline">
                  <span>Sign In as {r.title.split(' ')[0]}</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Popup Modal */}
      {activeModalRole && currentRole && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setActiveModalRole(null)}
        >
          <div
            className="w-full max-w-md bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalRole(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Role Header Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                {currentRole.icon}
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  TARGET PORTAL
                </span>
                <h2 className="text-base font-bold text-zinc-950">
                  {currentRole.title} Access
                </h2>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  {currentRole.id === 'admin'
                    ? 'Administrator Gmail Address'
                    : currentRole.id === 'teacher'
                    ? 'Teacher Gmail (Configured by Admin)'
                    : 'Email Address'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder={
                      currentRole.id === 'admin'
                        ? 'Enter registered admin Gmail'
                        : currentRole.id === 'teacher'
                        ? 'Enter teacher Gmail set by Admin'
                        : 'Enter email address'
                    }
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 font-mono"
                    required
                    autoFocus
                  />
                  <Mail size={14} className="absolute left-3 top-2.5 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-800">
                    {currentRole.id === 'teacher' ? 'Teacher Password (Set by Admin)' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1 cursor-pointer select-none"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={currentRole.id === 'teacher' ? 'Enter password set by Admin' : 'Enter password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-950 font-mono"
                    required
                  />
                  <Lock size={14} className="absolute left-3 top-2.5 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-all cursor-pointer shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle2 size={14} />
                <span>Sign In to {currentRole.title} Dashboard</span>
              </button>
            </form>

            {/* 👨‍🏫 TEACHER CREDENTIALS HELPER: Shows Admin-configured Logins */}
            {currentRole.id === 'teacher' && (
              <div className="mt-4 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-zinc-900 font-mono">
                    Faculty Logins Configured by Admin:
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Click to autofill</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] font-mono">
                  {registeredTeachersList.map((t: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEmail(t.email || `${t.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`);
                        setPassword(t.password || 'Teacher123');
                        setErrorMessage(null);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-zinc-100 border border-zinc-200/70 bg-white transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-zinc-950 font-sans block group-hover:underline">
                          {t.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate block">
                          {t.email} • {t.assignedClass}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 shrink-0">
                        Pass: {t.password || 'Teacher123'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-zinc-100 text-center">
              <button
                type="button"
                onClick={() => setActiveModalRole(null)}
                className="text-xs text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                ← Back to Portal Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
