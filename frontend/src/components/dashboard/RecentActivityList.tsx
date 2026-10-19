import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { ArrowRight, Clock } from 'lucide-react';

export const RecentActivityList: React.FC = () => {
  const { activities, setActiveTab, openMarkModal } = useAttendance();

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-950">Recent Activity Stream</h3>
        </div>
        <button
          onClick={() => setActiveTab('attendance')}
          className="text-xs font-medium text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View all</span>
          <ArrowRight size={12} />
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-100">
          {activities.slice(0, 6).map((activity) => (
            <div
              key={activity.id}
              className="p-3.5 hover:bg-zinc-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-md bg-zinc-900 text-white font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                  {activity.personName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 truncate">{activity.personName}</p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {activity.department} • {activity.timestamp}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge status={activity.status} size="sm" />
                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                  {activity.timeAgo}
                </span>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="p-6 text-center text-xs text-zinc-400">
              No recent attendance events recorded.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
