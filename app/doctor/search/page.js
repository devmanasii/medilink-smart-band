'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Stethoscope } from 'lucide-react';

function DoctorSearchContent() {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (patientId.trim()) {
      router.push(`/doctor/patient/${patientId.trim()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="h-6 w-6 text-primary" /> Search Patient</h1>
        <p className="text-muted-foreground">Look up a patient by their unique Patient ID</p>
      </div>

      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" /> Patient ID Search</CardTitle>
          <CardDescription>Enter the Patient ID found on their QR card</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="PAT1001"
              className="text-lg font-mono"
              autoFocus
            />
            <Button type="submit" className="w-full" size="lg">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DoctorSearchPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DoctorSearchContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
