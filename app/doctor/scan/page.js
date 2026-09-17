'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Camera, Search, XCircle } from 'lucide-react';

function DoctorScanContent() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualId, setManualId] = useState('');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const startScanner = async () => {
    setError('');
    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!scannerRef.current) return;
      const html5Qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = html5Qr;
      html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5Qr.stop();
          setScanning(false);
          router.push(`/doctor/patient/${decodedText}`);
        },
        () => {}
      ).catch((err) => {
        setError('Camera access failed. Use manual entry instead.');
        setScanning(false);
      });
    } catch {
      setError('Failed to start scanner. Use manual entry instead.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      router.push(`/doctor/patient/${manualId.trim()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><QrCode className="h-6 w-6 text-primary" /> Scan Patient QR</h1>
        <p className="text-muted-foreground">Scan a patient&apos;s QR code to view their medical information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> Camera Scanner</CardTitle>
            <CardDescription>Point your camera at the patient&apos;s QR code</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div id="qr-reader" ref={scannerRef} className="w-full overflow-hidden rounded-lg border bg-muted/30" style={{ minHeight: scanning ? '300px' : '0' }} />
            {!scanning ? (
              <Button className="w-full mt-4" onClick={startScanner}>
                <Camera className="mr-2 h-4 w-4" /> Start Camera Scan
              </Button>
            ) : (
              <Button variant="destructive" className="w-full mt-4" onClick={stopScanner}>
                <XCircle className="mr-2 h-4 w-4" /> Stop Scanner
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> Manual Entry</CardTitle>
            <CardDescription>Enter a Patient ID directly</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSearch} className="space-y-4">
              <div>
                <Input
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="PAT1001"
                  className="text-lg font-mono"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Search className="mr-2 h-4 w-4" /> Search Patient
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Patient IDs start with PAT followed by numbers (e.g., PAT1001)
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DoctorScanPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DoctorScanContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
