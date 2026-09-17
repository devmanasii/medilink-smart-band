'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import HealthCard from '@/components/HealthCard';
import EcgChart from '@/components/EcgChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { subscribeToLiveData, getPatientProfile, subscribeToEmergencyAlerts } from '@/lib/patientService';
import { Heart, Activity, Thermometer, FileHeart, QrCode, Siren, Clock, TrendingUp, AlertCircle, ShieldCheck, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function DashboardContent() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [liveData, setLiveData] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    if (!user) return;
    getPatientProfile(user.uid).then((data) => {
      setPatient(data);
      setLoadingProfile(false);
    });
    const unsubLive = subscribeToLiveData(user.uid, (data) => setLiveData(data));
    const unsubAlerts = subscribeToEmergencyAlerts(user.uid, (alerts) => {
      const active = alerts.filter((a) => a.status === 'active');
      setActiveAlert(active.length > 0 ? active[0] : null);
    });
    return () => { unsubLive(); unsubAlerts(); };
  }, [user]);

  const heartRate = liveData?.heartRate || '--';
  const spo2 = liveData?.spo2 || '--';
  const temperature = liveData?.temperature || '--';
  const ecgStatus = liveData?.ecgStatus || (liveData?.ecg ? 'Normal' : 'Standby');
  const lastUpdated = liveData?.timestamp
    ? formatDistanceToNow(new Date(liveData.timestamp), { addSuffix: true })
    : 'Awaiting data';

  // Display risk status from ESP32 — do NOT compute risk in the web app
  const riskStatus = liveData?.riskStatus || 'Normal';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userProfile?.fullName || 'Patient'}</h1>
          <p className="text-muted-foreground">Here&apos;s your health overview for today</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/qr-code')}>
            <QrCode className="mr-2 h-4 w-4" /> My QR Code
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/emergency')}>
            <Siren className="mr-2 h-4 w-4" /> Emergency
          </Button>
        </div>
      </div>

      {/* Active Alert Banner (from ESP32) */}
      {activeAlert && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/5 p-4 animate-fade-in">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 animate-pulse-ring">
            <Siren className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-destructive">Emergency Alert Active</p>
            <p className="text-sm text-muted-foreground">
              {activeAlert.message || 'ESP32 detected a critical condition. SIM800L is calling your emergency contacts.'}
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => router.push('/emergency')}>
            View Details
          </Button>
        </div>
      )}

      {/* Risk Status Banner (from ESP32) */}
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${riskStatus === 'Critical' ? 'border-destructive/50 bg-destructive/5' : riskStatus === 'Warning' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
        <ShieldCheck className={`h-5 w-5 ${riskStatus === 'Critical' ? 'text-destructive' : riskStatus === 'Warning' ? 'text-yellow-500' : 'text-green-500'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">ESP32 Risk Status: <span className={riskStatus === 'Critical' ? 'text-destructive' : riskStatus === 'Warning' ? 'text-yellow-500' : 'text-green-500'}>{riskStatus}</span></p>
          <p className="text-xs text-muted-foreground">Risk analysis is performed by your ESP32 health band. This status is received from Firebase.</p>
        </div>
      </div>

      {/* Health Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HealthCard type="heartRate" title="Heart Rate" value={heartRate} unit={liveData?.heartRate ? 'bpm' : ''} status={liveData?.heartRate ? 'Normal' : 'Standby'} lastUpdated={lastUpdated} />
        <HealthCard type="spo2" title="Blood Oxygen (SpO2)" value={spo2} unit={liveData?.spo2 ? '%' : ''} status={liveData?.spo2 ? 'Normal' : 'Standby'} lastUpdated={lastUpdated} />
        <HealthCard type="temperature" title="Body Temperature" value={temperature} unit={liveData?.temperature ? '°F' : ''} status={liveData?.temperature ? 'Normal' : 'Standby'} lastUpdated={lastUpdated} />
        <HealthCard type="ecg" title="ECG Status" value={ecgStatus} status={ecgStatus === 'Normal' ? 'Normal' : 'Standby'} lastUpdated={lastUpdated} />
      </div>

      {/* ECG + Profile Overview */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileHeart className="h-5 w-5 text-teal-500" /> Live ECG Monitor
                </CardTitle>
                <CardDescription>Real-time electrocardiogram from your health band</CardDescription>
              </div>
              <Badge variant={liveData ? 'default' : 'secondary'}>
                {liveData ? 'Live' : 'Awaiting Data'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <EcgChart liveData={liveData} height={240} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingProfile ? (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            ) : patient ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Patient ID</span>
                  <span className="font-medium">{patient.patientId || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Blood Group</span>
                  <span className="font-medium">{patient.bloodGroup || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{patient.age || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium">{patient.height || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{patient.weight || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Allergies</span>
                  <span className="font-medium">{patient.allergies || 'None'}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/profile')}>
                  View Full Profile
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Your profile is not set up yet.</p>
                <Button size="sm" className="w-full" onClick={() => router.push('/profile')}>
                  Complete Your Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access + Emergency Contacts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Navigate to key features</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Medical History', icon: Activity, href: '/medical-history' },
              { label: 'Reports', icon: FileHeart, href: '/reports' },
              { label: 'Live Monitor', icon: Heart, href: '/live-monitoring' },
              { label: 'QR Code', icon: QrCode, href: '/qr-code' },
              { label: 'Emergency', icon: Siren, href: '/emergency' },
              { label: 'Settings', icon: Clock, href: '/settings' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all hover:border-primary/30 hover:bg-muted/50"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" /> Emergency Contacts
            </CardTitle>
            <CardDescription>Called by ESP32 + SIM800L during emergencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient?.emergencyContacts?.[0]?.name ? (
              patient.emergencyContacts.filter((c) => c?.name).map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.relationship}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{c.phone}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No emergency contacts added yet.</p>
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/profile')}>
              Manage Contacts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
