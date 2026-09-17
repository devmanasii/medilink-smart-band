'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getPatientProfile, subscribeToEmergencyAlerts } from '@/lib/patientService';
import { Siren, Phone, AlertCircle, Clock, CheckCircle2, XCircle, ShieldAlert, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function EmergencyContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getPatientProfile(user.uid).then((data) => {
      setProfile(data);
      setLoading(false);
    });
    const unsub = subscribeToEmergencyAlerts(user.uid, (data) => setAlerts(data));
    return () => unsub();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><p className="text-muted-foreground">Loading...</p></div>;

  const contacts = profile?.emergencyContacts?.filter((c) => c?.name) || [];
  const activeAlerts = alerts.filter((a) => a.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Siren className="h-6 w-6 text-destructive" /> Emergency</h1>
        <p className="text-muted-foreground">Alerts and notifications from your ESP32 health band</p>
      </div>

      {/* Architecture notice */}
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          Emergency detection and calling are handled entirely by your ESP32 health band with SIM800L.
          This page only displays alerts that the device has already detected and uploaded.
          Emergency calls work even without internet or this app being open.
        </AlertDescription>
      </Alert>

      {/* Active Alert Banner */}
      {activeAlerts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 animate-pulse-ring">
                <Siren className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">Active Emergency Alert</p>
                <p className="text-sm text-muted-foreground">
                  ESP32 has detected a critical condition and is calling your emergency contacts via SIM800L.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How ESP32 Emergency Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Radio className="h-5 w-5 text-primary" /> How Emergency Detection Works</CardTitle>
          <CardDescription>Risk analysis runs on your ESP32 hardware, not in this app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">1</div>
            <p>ESP32 continuously monitors heart rate, SpO2, temperature, blood pressure, and ECG.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">2</div>
            <p>If any vital crosses a critical threshold (e.g. HR &gt; 130, SpO2 &lt; 90, temp &gt; 39.5°C), the ESP32 triggers an emergency.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">3</div>
            <p>SIM800L calls Emergency Contact 1, then Contact 2 if no answer — even without internet.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">4</div>
            <p>ESP32 uploads the alert to Firebase. This page displays it in real time.</p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts (display only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-orange-500" /> Emergency Contacts</CardTitle>
          <CardDescription>These contacts are called by the ESP32 + SIM800L during emergencies</CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {contacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.relationship}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{c.phone}</p>
                    <p className="text-xs text-muted-foreground">Contact {i + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No emergency contacts set up. Add them in your profile so the ESP32 knows who to call.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Alert History (from ESP32 via Firebase) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Alert History</CardTitle>
          <CardDescription>Emergency alerts detected by your ESP32 health band</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-500/50" />
              <p className="mt-3 text-sm text-muted-foreground">No emergency alerts detected. All clear.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-lg border p-3">
                  {alert.status === 'active'
                    ? <XCircle className="mt-0.5 h-5 w-5 text-destructive shrink-0" />
                    : <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message || 'Emergency alert from ESP32'}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{alert.timestamp ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true }) : ''}</span>
                      {alert.triggered_by && <span>• Source: {alert.triggered_by}</span>}
                      {alert.vital && <span>• {alert.vital}</span>}
                    </div>
                  </div>
                  <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                    {alert.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmergencyPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <EmergencyContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
