'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import QrCode, { downloadQrCode, printQrCode } from '@/components/QrCode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPatientProfile, generatePatientId, savePatientProfile } from '@/lib/patientService';
import { QrCode as QrIcon, Download, Printer, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function QrCodeContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    getPatientProfile(user.uid).then(async (data) => {
      if (data?.patientId) {
        setPatientId(data.patientId);
      } else {
        const newId = await generatePatientId();
        await savePatientProfile(user.uid, { patientId: newId });
        setPatientId(newId);
      }
      setLoading(false);
    });
  }, [user]);

  const handleDownload = async () => {
    try {
      await downloadQrCode(patientId, `${patientId}-qr.png`);
      toast({ title: 'QR code downloaded!' });
    } catch {
      toast({ title: 'Failed to download', variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(patientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><p className="text-muted-foreground">Generating QR code...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your QR Code</h1>
        <p className="text-muted-foreground">Doctors can scan this to instantly view your medical information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><QrIcon className="h-5 w-5 text-primary" /> Patient QR Card</CardTitle>
            <CardDescription>Print or save this QR code for emergencies</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {patientId && <QrCode
  value={`http://localhost:3000/doctor/patient/${patientId}`}
  size={256}
/>}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-base font-mono">{patientId}</Badge>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button variant="outline" onClick={() => printQrCode(patientId)}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Your QR code gives instant medical access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { step: '1', title: 'Save or Print', desc: 'Download the QR image or print it as a card to carry with you.' },
              { step: '2', title: 'Doctor Scans', desc: 'A doctor opens the scanner page and scans your QR code with their camera.' },
              { step: '3', title: 'Instant Access', desc: 'Your complete medical profile appears on their screen — no login needed.' },
              { step: '4', title: 'Emergency Ready', desc: 'First responders can access critical info like allergies and blood group instantly.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QrCodePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <QrCodeContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
