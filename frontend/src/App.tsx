import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { MarkAttendanceModal } from './components/attendance/MarkAttendanceModal';

// Pages
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { AttendanceCalendarView } from './components/calendar/AttendanceCalendarView';
import { PeopleDirectory } from './components/people/PeopleDirectory';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { activeTab } = useAttendance();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 flex font-sans antialiased selection:bg-zinc-950 selection:text-white">
      {/* Sidebar (Desktop fixed, Mobile off-canvas) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Top Navigation */}
        <TopNav onMobileMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'calendar' && <AttendanceCalendarView />}
          {activeTab === 'people' && <PeopleDirectory />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Interactive Modals and Toasts */}
      <MarkAttendanceModal />
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
