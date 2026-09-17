'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPatientProfile } from '@/lib/patientService';
import { History, Heart, Pill, Stethoscope, Syringe, Users, AlertTriangle } from 'lucide-react';

function MedicalHistoryContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getPatientProfile(user.uid).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><p className="text-muted-foreground">Loading...</p></div>;

  const sections = [
    { icon: AlertTriangle, label: 'Allergies', value: profile?.allergies, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: Heart, label: 'Previous Diseases', value: profile?.previousDiseases, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { icon: Stethoscope, label: 'Current Diseases', value: profile?.currentDiseases, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Pill, label: 'Current Treatments', value: profile?.currentTreatments, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { icon: Pill, label: 'Current Medications', value: profile?.currentMedications, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: Syringe, label: 'Surgery History', value: profile?.surgeryHistory, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: Users, label: 'Family Medical History', value: profile?.familyMedicalHistory, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><History className="h-6 w-6 text-primary" /> Medical History</h1>
        <p className="text-muted-foreground">Your complete health record</p>
      </div>

      {!profile || (!profile.allergies && !profile.currentDiseases) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No medical history found. Please complete your profile first.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.label}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${section.bg}`}>
                      <Icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    {section.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.value ? (
                    <p className="whitespace-pre-line text-sm">{section.value}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data recorded</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {profile?.emergencyContacts?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {profile.emergencyContacts.map((c, i) => (
              c?.name ? (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.relationship}</p>
                  </div>
                  <Badge variant="outline">{c.phone}</Badge>
                </div>
              ) : null
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function MedicalHistoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MedicalHistoryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
