import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/contexts/OfflineContext';
import { Menu, Wifi, WifiOff, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuth();
  const { isOnline, queuedSubmissions } = useOffline();

  return (
    <TooltipProvider>
      <header className="bg-card/50 border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-foreground">{title}</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="flex items-center gap-1 h-6 border-border/50 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{user?.location || 'Training Center'}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current location</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Offline Status */}
          <Tooltip>
            <TooltipTrigger>
              <div className="cursor-help">
                <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1 h-7">
                  {isOnline ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isOnline ? 'Connected to server' : 'Working offline'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Queued Items */}
          {queuedSubmissions.length > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <div className="cursor-help">
                  <Badge variant="secondary" className="flex items-center gap-1 h-7 bg-muted text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{queuedSubmissions.length}</span>
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{queuedSubmissions.length} items queued for sync</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Separator orientation="vertical" className="h-8 bg-border/50" />
          
          {/* User Avatar */}
          <Tooltip>
            <TooltipTrigger>
              <div className="cursor-help">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user?.name || user?.email || 'Current User'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}