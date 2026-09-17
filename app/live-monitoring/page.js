'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import HealthCard from '@/components/HealthCard';
import EcgChart from '@/components/EcgChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { subscribeToLiveData, saveEcgReport } from '@/lib/patientService';
import { useToast } from '@/hooks/use-toast';
import { Activity, Heart, Thermometer, FileHeart, Download, Wifi, WifiOff, ShieldCheck, Gauge } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

function LiveMonitoringContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liveData, setLiveData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [ecgHistory, setEcgHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToLiveData(user.uid, (data) => {
      setLiveData(data);
      setConnected(true);
      setEcgHistory((prev) => [...prev.slice(-99), data]);
    });
    return () => { unsub(); setConnected(false); };
  }, [user]);

  const heartRate = liveData?.heartRate || '--';
  const spo2 = liveData?.spo2 || '--';
  const temperature = liveData?.temperature || '--';
  const systolicBP = liveData?.systolicBP || liveData?.bloodPressureSystolic || '--';
  const diastolicBP = liveData?.diastolicBP || liveData?.bloodPressureDiastolic || '--';
  const ecgStatus = liveData?.ecgStatus || (liveData?.ecg ? 'Normal' : 'Standby');
  const riskStatus = liveData?.riskStatus || 'Normal';

  const handleDownloadEcgPdf = async () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('ECG Report', 20, 25);
    doc.setFontSize(12);
    doc.text(`Patient: ${user.email}`, 20, 40);
    doc.text(`Date: ${format(new Date(), 'PPpp')}`, 20, 50);
    doc.text(`Heart Rate: ${heartRate} bpm`, 20, 60);
    doc.text(`SpO2: ${spo2}%`, 20, 70);
    doc.text(`Temperature: ${temperature}°F`, 20, 80);
    doc.text(`Blood Pressure: ${systolicBP}/${diastolicBP} mmHg`, 20, 90);
    doc.text(`ECG Status: ${ecgStatus}`, 20, 100);
    doc.text(`Risk Status: ${riskStatus} (determined by ESP32)`, 20, 110);

    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(0.5);
    const points = ecgHistory.length > 0 ? ecgHistory.flatMap((d, i) => [i * 2, 150 - (d.ecg || 0) * 50]) : [];
    if (points.length > 2) {
      for (let i = 0; i < points.length - 2; i += 2) {
        doc.line(points[i], points[i + 1], points[i + 2], points[i + 3]);
      }
    } else {
      doc.text('ECG waveform data available when health band is connected.', 20, 130);
    }

    doc.text('Smart Health Monitoring System', 20, 280);
    doc.text('Risk analysis performed by ESP32 hardware', 20, 287);
    doc.save('ecg-report.pdf');

    if (user) {
      await saveEcgReport(user.uid, ecgHistory, `HR:${heartRate} SpO2:${spo2} Temp:${temperature} BP:${systolicBP}/${diastolicBP} ECG:${ecgStatus} Risk:${riskStatus}`);
    }
    toast({ title: 'ECG report downloaded and saved!' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-primary" /> Live Monitoring</h1>
          <p className="text-muted-foreground">Real-time vitals from your ESP32 health band</p>
        </div>
        <Badge variant={connected ? 'default' : 'secondary'} className="flex items-center gap-1.5 w-fit">
          {connected ? <><Wifi className="h-3.5 w-3.5" /> Connected</> : <><WifiOff className="h-3.5 w-3.5" /> Awaiting Data</>}
        </Badge>
      </div>

      {/* Risk Status from ESP32 */}
      <Card className={riskStatus === 'Critical' ? 'border-destructive/50 bg-destructive/5' : riskStatus === 'Warning' ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-green-500/50 bg-green-500/5'}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className={`h-6 w-6 ${riskStatus === 'Critical' ? 'text-destructive' : riskStatus === 'Warning' ? 'text-yellow-500' : 'text-green-500'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">ESP32 Risk Assessment: <span className={`font-bold ${riskStatus === 'Critical' ? 'text-destructive' : riskStatus === 'Warning' ? 'text-yellow-500' : 'text-green-500'}`}>{riskStatus}</span></p>
              <p className="text-xs text-muted-foreground">Risk analysis is performed locally on the ESP32. The web app only displays this status.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vitals Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <HealthCard type="heartRate" title="Heart Rate" value={heartRate} unit={liveData?.heartRate ? 'bpm' : ''} status={liveData?.heartRate ? 'Normal' : 'Standby'} />
        <HealthCard type="spo2" title="SpO2" value={spo2} unit={liveData?.spo2 ? '%' : ''} status={liveData?.spo2 ? 'Normal' : 'Standby'} />
        <HealthCard type="temperature" title="Temperature" value={temperature} unit={liveData?.temperature ? '°F' : ''} status={liveData?.temperature ? 'Normal' : 'Standby'} />
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><FileHeart className="h-5 w-5 text-teal-500" /> ECG Waveform</CardTitle>
              <CardDescription>Live electrocardiogram — status: {ecgStatus}</CardDescription>
            </div>
            <Button onClick={handleDownloadEcgPdf} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EcgChart liveData={liveData} height={320} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> Heart Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ecgHistory.slice(-10).reverse().map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b pb-1.5">
                  <span className="text-muted-foreground">{d.timestamp ? format(new Date(d.timestamp), 'HH:mm:ss') : '--'}</span>
                  <span className="font-medium">{d.heartRate || '--'} bpm</span>
                </div>
              ))}
              {ecgHistory.length === 0 && <p className="text-sm text-muted-foreground">No data yet. Connect your health band.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Thermometer className="h-5 w-5 text-orange-500" /> Device Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Device</span><span className="font-medium">ESP32 Health Band</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sensors</span><span className="font-medium">MAX30100, DS18B20, AD8232, BP Sensor</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Emergency Module</span><span className="font-medium text-green-500">SIM800L Ready</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Risk Analysis</span><span className="font-medium">On-device (ESP32)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-green-500">{connected ? 'Streaming' : 'Awaiting'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Reading</span><span className="font-medium">{liveData?.timestamp ? format(new Date(liveData.timestamp), 'PPpp') : 'N/A'}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LiveMonitoringPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <LiveMonitoringContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
