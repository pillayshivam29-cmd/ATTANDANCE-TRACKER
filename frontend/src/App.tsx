import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { MarkAttendanceModal } from './components/attendance/MarkAttendanceModal';
import { BulkUploadModal } from './components/people/BulkUploadModal';
import { RoleLogin, UserSession } from './components/auth/RoleLogin';

// Portals & Views
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { AttendanceCalendarView } from './components/calendar/AttendanceCalendarView';
import { PeopleDirectory } from './components/people/PeopleDirectory';
import { StudentPortal } from './components/portals/StudentPortal';
import { ParentPortal } from './components/portals/ParentPortal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useAttendance();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('attendly_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (session: UserSession) => {
    setCurrentUser(session);
    localStorage.setItem('attendly_user_session', JSON.stringify(session));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('attendly_user_session');
  };

  // Agar login nahi hai toh 4-Role Portal show karein
  if (!currentUser) {
    return <RoleLogin onLogin={handleLogin} />;
  }

  const renderDashboardView = () => {
    if (currentUser.role === 'student') {
      return (
        <StudentPortal
          studentName={currentUser.name}
          studentId={currentUser.studentId || 'EMP-1042'}
        />
      );
    }

    if (currentUser.role === 'parent') {
      return (
        <ParentPortal
          childName="Eleanor Vance"
          childId={currentUser.studentId || 'EMP-1042'}
        />
      );
    }

    return <DashboardOverview />;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 flex font-sans antialiased selection:bg-zinc-950 selection:text-white">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        userSession={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNav
          onMobileMenuToggle={() => setMobileSidebarOpen(true)}
          userSession={currentUser}
          onLogout={handleLogout}
          onOpenBulkModal={() => setBulkModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && renderDashboardView()}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'calendar' && <AttendanceCalendarView />}
          {activeTab === 'people' && <PeopleDirectory />}
        </main>
      </div>

      <MarkAttendanceModal />
      <BulkUploadModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
