import { Routes, Route, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Target,
  Award,
  Calendar,
  BookOpen,
} from 'lucide-react';

function ShiftLeadDashboardHome() {
  const { t } = useLanguage();

  const teamStats = {
    totalMembers: 12,
    activeToday: 8,
    completedTraining: 6,
    pendingReviews: 3,
    averageScore: 87,
  };

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'crew',
      progress: 95,
      lastActive: '2 hours ago',
      status: 'online',
      modules: { completed: 8, total: 10 },
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'crew',
      progress: 72,
      lastActive: '1 day ago',
      status: 'offline',
      modules: { completed: 6, total: 10 },
    },
    {
      id: 3,
      name: 'Emma Davis',
      role: 'crew',
      progress: 88,
      lastActive: '4 hours ago',
      status: 'online',
      modules: { completed: 7, total: 10 },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{teamStats.activeToday}</p>
                <p className="text-sm text-gray-600">Active Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{teamStats.completedTraining}</p>
                <p className="text-sm text-gray-600">{t('completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{teamStats.averageScore}%</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Quick Access</span>
          </CardTitle>
          <CardDescription>Access training tools and crew portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
              onClick={() => window.location.href = '/crew'}
            >
              <Users className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Crew Portal</span>
              <span className="text-xs text-gray-500">Access training interface</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200 transition-all duration-200"
              onClick={() => window.location.href = '/procedures'}
            >
              <BookOpen className="h-6 w-6 text-green-600" />
              <span className="font-medium">Procedures</span>
              <span className="text-xs text-gray-500">View SOPs & guidelines</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200"
              onClick={() => window.location.href = '/quiz'}
            >
              <Award className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Quiz Management</span>
              <span className="text-xs text-gray-500">Monitor quiz results</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Team Overview</span>
          </CardTitle>
          <CardDescription>Monitor your team's training progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="border hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-gray-700">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.status === 'online' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{member.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {member.modules.completed}/{member.modules.total} modules
                    </p>
                    <p className="text-xs text-gray-500">{member.progress}% complete</p>
                  </div>
                </div>
                
                <Progress value={member.progress} className="h-2 mb-3" />
                
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm">Send Message</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Pending Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Pending Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Review Quiz Results</p>
                <p className="text-sm text-gray-600">3 crew members need score review</p>
              </div>
            </div>
            <Button size="sm">Review</Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Schedule Training</p>
                <p className="text-sm text-gray-600">New SOP update available</p>
              </div>
            </div>
            <Button size="sm">Schedule</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ShiftLeadDashboard() {

  return (
    <DashboardLayout title="Shift Lead Dashboard">
      <Routes>
        <Route path="/" element={<ShiftLeadDashboardHome />} />
      </Routes>
    </DashboardLayout>
  );
}