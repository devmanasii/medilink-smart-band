'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getReports, uploadReport } from '@/lib/patientService';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Download, Eye, FileImage, FileCheck, Trash2 } from 'lucide-react';

function ReportsContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadReports();
  }, [user]);

  const loadReports = async () => {
    try {
      const data = await getReports(user.uid);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { toast({ title: 'Please select a file', variant: 'destructive' }); return; }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Only PDF, JPG, and PNG files are supported', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      await uploadReport(user.uid, file, {
        reportName: reportName || file.name,
        reportType: reportType || 'General',
      });
      toast({ title: 'Report uploaded successfully!' });
      setReportName('');
      setReportType('');
      if (fileRef.current) fileRef.current.value = '';
      await loadReports();
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes('image')) return <FileImage className="h-5 w-5 text-blue-500" />;
    return <FileCheck className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> Reports</h1>
        <p className="text-muted-foreground">Upload, view, and download your medical reports</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Upload New Report</CardTitle>
          <CardDescription>Supported formats: PDF, JPG, PNG</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Report Name</Label>
              <Input value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Blood Test Report" />
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Input value={reportType} onChange={(e) => setReportType(e.target.value)} placeholder="Lab Test, X-Ray..." />
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <Input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" required />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={uploading} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>{reports.length} report(s) available</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading reports...</p>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No reports uploaded yet. Upload your first report above.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <div key={report.id} className="flex flex-col gap-2 rounded-lg border p-4 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    {getFileIcon(report.fileType)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{report.reportName || report.fileName}</p>
                    {report.reportType && (
                      <p className="text-xs text-muted-foreground">{report.reportType}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open(report.fileUrl, '_blank')}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => {
                      const a = document.createElement('a');
                      a.href = report.fileUrl;
                      a.download = report.fileName;
                      a.click();
                    }}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ReportsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
