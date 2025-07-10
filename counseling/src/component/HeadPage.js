import React from 'react';
import { Users, UserCheck, AlertTriangle, Clock } from 'lucide-react';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function HODDashboardOverview() {
  const stats = [
    { title: 'Total Counselors', value: '0', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Counselors', value: '0', icon: UserCheck, color: 'bg-green-500' },
    { title: 'Pending Cases', value: '0', icon: Clock, color: 'bg-yellow-500' },
    { title: 'Escalated Cases', value: '0', icon: AlertTriangle, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Counselor Activities</h2>
          <div className="space-y-4">
            {/* Activity list will be populated from database */}
            <div className="text-center py-8 text-gray-500">
              <p>No recent activities</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Urgent Cases</h2>
          <div className="space-y-4">
            {/* Urgent cases will be populated from database */}
            <div className="text-center py-8 text-gray-500">
              <p>No urgent cases at the moment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HODDashboardOverview;