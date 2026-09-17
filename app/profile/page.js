'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { savePatientProfile, getPatientProfile, generatePatientId } from '@/lib/patientService';
import { User, Heart, Phone, Save, CheckCircle2 } from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

function ProfileContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fullName: '', age: '', gender: '', dateOfBirth: '', height: '', weight: '',
    bloodGroup: '', address: '', mobileNumber: '',
    allergies: '', previousDiseases: '', currentDiseases: '', currentTreatments: '',
    currentMedications: '', surgeryHistory: '', familyMedicalHistory: '',
    emergencyContacts: [
      { name: '', relationship: '', phone: '' },
      { name: '', relationship: '', phone: '' },
    ],
  });

  useEffect(() => {
    if (!user) return;
    getPatientProfile(user.uid).then((data) => {
      if (data) {
        setForm((prev) => ({
          ...prev,
          ...data,
          emergencyContacts: data.emergencyContacts?.length
            ? data.emergencyContacts
            : prev.emergencyContacts,
        }));
      }
      setLoading(false);
    });
  }, [user]);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleContactChange = (index, field, value) => {
    setForm((p) => {
      const contacts = [...p.emergencyContacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...p, emergencyContacts: contacts };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      let patientId = form.patientId;
      if (!patientId) {
        patientId = await generatePatientId();
      }
      await savePatientProfile(user.uid, { ...form, patientId });
      setForm((p) => ({ ...p, patientId }));
      setSaved(true);
      toast({ title: 'Profile saved successfully!', description: 'Your medical information has been updated.' });
    } catch (err) {
      toast({ title: 'Failed to save profile', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading profile...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patient Profile</h1>
        <p className="text-muted-foreground">Complete your medical information for emergency access</p>
      </div>

      {saved && (
        <Alert className="border-green-500/50 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Profile saved successfully. Your Patient ID is {form.patientId}.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</CardTitle>
            <CardDescription>Basic demographic details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={form.age} onChange={(e) => handleChange('age', e.target.value)} placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => handleChange('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  {genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input value={form.height} onChange={(e) => handleChange('height', e.target.value)} placeholder="175" />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input value={form.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="70" />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select value={form.bloodGroup} onValueChange={(v) => handleChange('bloodGroup', v)}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input value={form.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value)} placeholder="+1 234 567 890" />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="123 Main St, City, State, ZIP" />
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> Medical Information</CardTitle>
            <CardDescription>Your health history for doctors and emergencies</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Allergies</Label>
              <Textarea value={form.allergies} onChange={(e) => handleChange('allergies', e.target.value)} placeholder="Penicillin, peanuts, latex..." />
            </div>
            <div className="space-y-2">
              <Label>Previous Diseases</Label>
              <Textarea value={form.previousDiseases} onChange={(e) => handleChange('previousDiseases', e.target.value)} placeholder="Pneumonia (2018), Typhoid (2020)..." />
            </div>
            <div className="space-y-2">
              <Label>Current Diseases</Label>
              <Textarea value={form.currentDiseases} onChange={(e) => handleChange('currentDiseases', e.target.value)} placeholder="Hypertension, Diabetes..." />
            </div>
            <div className="space-y-2">
              <Label>Current Treatments</Label>
              <Textarea value={form.currentTreatments} onChange={(e) => handleChange('currentTreatments', e.target.value)} placeholder="Insulin therapy, BP medication..." />
            </div>
            <div className="space-y-2">
              <Label>Current Medications</Label>
              <Textarea value={form.currentMedications} onChange={(e) => handleChange('currentMedications', e.target.value)} placeholder="Metformin 500mg, Amlodipine 5mg..." />
            </div>
            <div className="space-y-2">
              <Label>Surgery History</Label>
              <Textarea value={form.surgeryHistory} onChange={(e) => handleChange('surgeryHistory', e.target.value)} placeholder="Appendectomy (2015)..." />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Family Medical History</Label>
              <Textarea value={form.familyMedicalHistory} onChange={(e) => handleChange('familyMedicalHistory', e.target.value)} placeholder="Father: Heart disease, Mother: Diabetes..." />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-orange-500" /> Emergency Contacts</CardTitle>
            <CardDescription>People to notify in critical situations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[0, 1].map((i) => (
              <div key={i} className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                <p className="text-sm font-semibold sm:col-span-3">Contact Person {i + 1}</p>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.emergencyContacts[i]?.name || ''} onChange={(e) => handleContactChange(i, 'name', e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input value={form.emergencyContacts[i]?.relationship || ''} onChange={(e) => handleContactChange(i, 'relationship', e.target.value)} placeholder="Spouse" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={form.emergencyContacts[i]?.phone || ''} onChange={(e) => handleContactChange(i, 'phone', e.target.value)} placeholder="+1 234 567 890" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-8">
          <Button type="submit" disabled={saving} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
