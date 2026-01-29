import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [, navigate] = useLocation();

  return (
    <div className="bg-[#003a8c] text-white px-6 py-5 mb-6 shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-blue-100 mt-1 text-base">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-600 hover:text-white"
            onClick={() => navigate('/notificaciones')}
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-600 hover:text-white"
            onClick={() => navigate('/configuracion')}
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-600 hover:text-white"
            onClick={() => navigate('/configuracion-perfil')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
