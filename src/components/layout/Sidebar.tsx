import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { 
  Home, 
  MessageCircle, 
  BookOpen, 
  Brain, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const getNavItems = () => {
    const basePath = user?.role === 'admin' ? '/admin' : 
                     user?.role === 'shift_lead' ? '/shift-lead' : '/crew';
    
    const items = [
      { icon: Home, label: t('dashboard'), path: basePath },
      { icon: MessageCircle, label: t('chat'), path: '/chat' },
      { icon: BookOpen, label: t('procedures'), path: '/admin/lessons' },
      { icon: Brain, label: t('quiz'), path: '/admin/quiz' },
    ];

    if (user?.role === 'admin' || user?.role === 'shift_lead') {
      items.push(
        { icon: FileText, label: t('documents'), path: '/documents/upload' }
      );
    }


    return items;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <Card className={`
        fixed top-0 left-0 h-full w-72 minimal-card z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-medium text-foreground">F&B Training</h1>
                <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {getNavItems().map((item) => {
              const isActive = location.pathname === item.path || 
                              location.pathname.startsWith(item.path + '/');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 space-y-4">
            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Language</label>
              <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                <SelectTrigger className="minimal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sign Out Button */}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full border-border/50 hover:bg-muted/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}