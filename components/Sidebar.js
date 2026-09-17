'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  User,
  History,
  QrCode,
  FileText,
  Activity,
  Siren,
  Stethoscope,
  Settings,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const patientLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/medical-history', label: 'Medical History', icon: History },
  { href: '/qr-code', label: 'QR Code', icon: QrCode },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/live-monitoring', label: 'Live Monitoring', icon: Activity },
  { href: '/emergency', label: 'Emergency', icon: Siren },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const doctorLinks = [
  { href: '/doctor', label: 'Doctor Dashboard', icon: LayoutDashboard },
  { href: '/doctor/scan', label: 'Scan QR', icon: QrCode },
  { href: '/doctor/search', label: 'Search Patient', icon: Stethoscope },
];

export function SidebarContent({ onNavigate }) {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const isDoctor = userProfile?.role === 'doctor';
  const links = isDoctor ? doctorLinks : patientLinks;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">HealthMonitor</p>
          <p className="text-xs text-muted-foreground">{isDoctor ? 'Doctor Portal' : 'Patient Portal'}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 p-3">
          <p className="text-xs font-semibold text-foreground">ESP32 Health Band</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Risk detection on-device</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">SIM800L emergency ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r md:block">
      <SidebarContent />
    </aside>
  );
}
