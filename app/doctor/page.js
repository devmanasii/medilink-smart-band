'use client';

import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, QrCode, Search, FileText, Activity, ShieldCheck } from 'lucide-react';

function DoctorDashboardContent() {
  const router = useRouter();

  const actions = [
    { icon: QrCode, title: 'Scan QR Code', desc: 'Scan a patient\'s QR code with your camera', href: '/doctor/scan' },
    { icon: Search, title: 'Search Patient', desc: 'Look up a patient by their Patient ID', href: '/doctor/search' },
    { icon: FileText, title: 'View Reports', desc: 'Access medical reports after scanning', href: '/doctor/scan' },
    { icon: Activity, title: 'Live Monitoring', desc: 'View real-time patient vitals', href: '/doctor/scan' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Stethoscope className="h-6 w-6 text-primary" /> Doctor Dashboard</h1>
        <p className="text-muted-foreground">Access patient information by scanning QR or searching by ID</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30" onClick={() => router.push(action.href)}>
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-500" /> Doctor Access</CardTitle>
          <CardDescription>Important information about your role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600">✓</div>
            <p>You can <strong>view</strong> patient medical history, reports, and live vitals.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">✗</div>
            <p>You <strong>cannot edit</strong> any patient data. All data is read-only.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600">i</div>
            <p>Use the QR scanner or patient ID search to find a patient quickly.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <Button className="w-full" size="lg" onClick={() => router.push('/doctor/scan')}>
              <QrCode className="mr-2 h-5 w-5" /> Scan Patient QR
            </Button>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <Button className="w-full" size="lg" variant="outline" onClick={() => router.push('/doctor/search')}>
              <Search className="mr-2 h-5 w-5" /> Search by Patient ID
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DoctorDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
