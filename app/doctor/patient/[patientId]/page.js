'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import HealthCard from '@/components/HealthCard';
import EcgChart from '@/components/EcgChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getPatientByPatientId, getReports, subscribeToLiveData } from '@/lib/patientService';
import { User, Heart, FileText, Phone, Activity, Download, ArrowLeft, AlertTriangle, Stethoscope, ShieldCheck, Gauge } from 'lucide-react';

function PatientViewContent() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId;
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patientId) return;
    getPatientByPatientId(patientId).then(async (data) => {
      if (!data) {
        setError(`No patient found with ID: ${patientId}`);
        setLoading(false);
        return;
      }
      setPatient(data);
      try {
        const reps = await getReports(data.id);
        setReports(reps);
      } catch {}
      // Subscribe to live data
      const unsub = subscribeToLiveData(data.id, (ld) => setLiveData(ld));
      setLoading(false);
      return () => unsub();
    });
  }, [patientId]);

  if (loading) return <div className="flex justify-center py-20"><p className="text-muted-foreground">Loading patient data...</p></div>;

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/doctor/scan')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scanner
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const heartRate = liveData?.heartRate || '--';
  const spo2 = liveData?.spo2 || '--';
  const temperature = liveData?.temperature || '--';
  const systolicBP = liveData?.systolicBP || '--';
  const diastolicBP = liveData?.diastolicBP || '--';
  const ecgStatus = liveData?.ecgStatus || (liveData?.ecg ? 'Normal' : 'Standby');
  const riskStatus = liveData?.riskStatus || 'Normal';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/doctor/scan')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Badge variant="secondary" className="font-mono">{patientId}</Badge>
      </div>

      {/* Patient Header */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-primary-foreground">
                {patient.fullName?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{patient.fullName || 'Unknown Patient'}</h2>
                <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>Age: {patient.age || 'N/A'}</span>
                  <span>•</span>
                  <span>{patient.gender || 'N/A'}</span>
                  <span>•</span>
                  <span>Blood: {patient.bloodGroup || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" /> Read-only Access
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Status from ESP32 */}
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${riskStatus === 'Critical' ? 'border-destructive/50 bg-destructive/5' : riskStatus === 'Warning' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-green-500/50 bg-green-500/5'}`}>
        <ShieldCheck className={`h-5 w-5 ${riskStatus === 'Critical' ? 'text-destructive' : riskStatus === 'Warning' ? 'text-yellow-500' : 'text-green-500'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">ESP32 Risk Assessment: <span className={`font-bold ${riskStatus === 'Critical' ? 'text-destructive' : riskStatus === 'Warning' ? 'text-yellow-500' : 'text-green-500'}`}>{riskStatus}</span></p>
          <p className="text-xs text-muted-foreground">Risk analysis performed on the patient&apos;s ESP32 health band. This is display only.</p>
        </div>
      </div>

      {/* Live Vitals */}
      <div>
        <h3 className="mb-3 text-lg font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Live Vitals</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <HealthCard type="heartRate" title="Heart Rate" value={heartRate} unit={liveData?.heartRate ? 'bpm' : ''} status={liveData?.heartRate ? 'Normal' : 'Standby'} />
          <HealthCard type="spo2" title="SpO2" value={spo2} unit={liveData?.spo2 ? '%' : ''} status={liveData?.spo2 ? 'Normal' : 'Standby'} />
          <HealthCard type="temperature" title="Temperature" value={temperature} unit={liveData?.temperature ? '°F' : ''} status={liveData?.temperature ? 'Normal' : 'Standby'} />
        </div>
      </div>

      {/* Blood Pressure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-purple-500" /> Blood Pressure</CardTitle>
          <CardDescription>From ESP32 blood pressure sensor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Systolic</p>
              <p className="text-3xl font-bold text-purple-500">{systolicBP}<span className="text-sm text-muted-foreground ml-1">mmHg</span></p>
            </div>
            <div className="text-2xl text-muted-foreground">/</div>
            <div>
              <p className="text-xs text-muted-foreground">Diastolic</p>
              <p className="text-3xl font-bold text-purple-500">{diastolicBP}<span className="text-sm text-muted-foreground ml-1">mmHg</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ECG */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-teal-500" /> ECG Waveform</CardTitle>
          <CardDescription>Status: {ecgStatus}</CardDescription>
        </CardHeader>
        <CardContent>
          <EcgChart liveData={liveData} height={240} />
        </CardContent>
      </Card>

      {/* Medical Info */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: 'Allergies', value: patient.allergies },
              { label: 'Current Diseases', value: patient.currentDiseases },
              { label: 'Current Medications', value: patient.currentMedications },
              { label: 'Current Treatments', value: patient.currentTreatments },
              { label: 'Previous Diseases', value: patient.previousDiseases },
              { label: 'Surgery History', value: patient.surgeryHistory },
              { label: 'Family Medical History', value: patient.familyMedicalHistory },
            ].map((item) => (
              <div key={item.label} className="border-b pb-2">
                <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                <p className="mt-0.5">{item.value || 'Not recorded'}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-orange-500" /> Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {patient.emergencyContacts?.filter((c) => c?.name).map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.relationship}</p>
                  </div>
                  <a href={`tel:${c.phone}`}>
                    <Button size="sm" variant="outline"><Phone className="mr-1 h-3.5 w-3.5" /> {c.phone}</Button>
                  </a>
                </div>
              ))}
              {!patient.emergencyContacts?.some((c) => c?.name) && <p className="text-sm text-muted-foreground">No emergency contacts</p>}
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Reports</CardTitle>
              <CardDescription>{reports.length} report(s) available</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reports uploaded.</p>
              ) : (
                <div className="space-y-2">
                  {reports.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border p-2">
                      <div>
                        <p className="text-sm font-medium">{r.reportName || r.fileName}</p>
                        <p className="text-xs text-muted-foreground">{r.reportType || ''}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => window.open(r.fileUrl, '_blank')}>View</Button>
                        <Button size="sm" variant="ghost" onClick={() => { const a = document.createElement('a'); a.href = r.fileUrl; a.download = r.fileName; a.click(); }}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPatientPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PatientViewContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
