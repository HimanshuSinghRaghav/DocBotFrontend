
import { Routes, Route } from 'react-router-dom';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  BookOpen, 
  BarChart3,
  Settings,
  Plus,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';

function AdminDashboardHome() {
  // const { t } = useLanguage();

  const systemStats = {
    totalUsers: 4,
    activeLocations: 8,
    totalModules: 89,
    completionRate: 82,
    averageScore: 88,
  };

  const locations = [
    {
      id: 1,
      name: 'Downtown Store',
      staff: 18,
      completionRate: 94,
      averageScore: 91,
      status: 'excellent',
    },
    {
      id: 2,
      name: 'Mall Location',
      staff: 22,
      completionRate: 78,
      averageScore: 85,
      status: 'good',
    },
    {
      id: 3,
      name: 'Airport Terminal',
      staff: 15,
      completionRate: 65,
      averageScore: 79,
      status: 'needs_attention',
    },
  ];

  const recentActivity = [
    { icon: Users, text: '3 new staff members onboarded', time: '2 hours ago' },
    { icon: BookOpen, text: 'Food Safety SOP updated', time: '1 day ago' },
    { icon: Target, text: 'Downtown Store achieved 95% completion', time: '2 days ago' },
    { icon: Settings, text: 'New quiz module published', time: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

   

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalModules}</p>
                <p className="text-sm text-gray-600">Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStats.completionRate}%</p>
                <p className="text-sm text-gray-600">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStats.averageScore}%</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

     

    

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <activity.icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
      </Routes>
    </DashboardLayout>
  );
}