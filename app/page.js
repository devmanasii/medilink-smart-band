'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  HeartPulse,
  QrCode,
  Activity,
  Stethoscope,
  Siren,
  Shield,
  Smartphone,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  { icon: HeartPulse, title: 'Real-time Monitoring', desc: 'Track heart rate, SpO2, temperature, and ECG live from your ESP32 health band.' },
  { icon: QrCode, title: 'QR Medical ID', desc: 'Generate a unique QR code that gives doctors instant access to your medical history.' },
  { icon: Stethoscope, title: 'Doctor Portal', desc: 'Doctors can scan your QR and instantly view your complete medical profile.' },
  { icon: Siren, title: 'Emergency Alerts', desc: 'One-tap emergency alerts notify your emergency contacts during critical situations.' },
  { icon: Activity, title: 'ECG Visualization', desc: 'Live and historical ECG graphs with downloadable PDF reports.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected with Firebase authentication and encrypted storage.' },
];

const stats = [
  { label: 'Vital Signs Tracked', value: '4+' },
  { label: 'Response Time', value: '<1s' },
  { label: 'Data Encrypted', value: '100%' },
  { label: 'Emergency Ready', value: '24/7' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="animate-fade-in">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                ESP32 Health Band Compatible
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Smart Health
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Monitoring System
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Comprehensive health monitoring for patients, doctors, and emergency care.
                Create your medical profile, generate a QR code, and wear your smart health band
                for real-time vital tracking.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => router.push(user ? '/dashboard' : '/signup')} className="group">
                  {user ? 'Go to Dashboard' : 'Get Started Free'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> HIPAA Ready</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Real-time Data</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Free Forever</span>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="mx-auto max-w-sm">
                <Card className="overflow-hidden border-primary/20 shadow-2xl">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-80">Patient Monitor</p>
                          <p className="text-xl font-bold">PAT1001</p>
                        </div>
                        <HeartPulse className="h-8 w-8 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-4 p-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-red-500/10 p-3">
                          <p className="text-xs text-muted-foreground">Heart Rate</p>
                          <p className="text-2xl font-bold text-red-500">72 <span className="text-xs">bpm</span></p>
                        </div>
                        <div className="rounded-lg bg-blue-500/10 p-3">
                          <p className="text-xs text-muted-foreground">SpO2</p>
                          <p className="text-2xl font-bold text-blue-500">98<span className="text-xs">%</span></p>
                        </div>
                        <div className="rounded-lg bg-orange-500/10 p-3">
                          <p className="text-xs text-muted-foreground">Temp</p>
                          <p className="text-2xl font-bold text-orange-500">98.6<span className="text-xs">°F</span></p>
                        </div>
                        <div className="rounded-lg bg-teal-500/10 p-3">
                          <p className="text-xs text-muted-foreground">ECG</p>
                          <p className="text-2xl font-bold text-teal-500">Normal</p>
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Band Status</span>
                          <span className="flex items-center gap-1.5 font-medium text-green-500">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Connected
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Everything You Need for Health Monitoring</h2>
            <p className="mt-4 text-muted-foreground">
              From real-time vitals to emergency alerts, our system covers every aspect of patient care.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="group transition-all hover:shadow-lg hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-4 text-muted-foreground">Three simple steps to stay protected</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Smartphone, step: '01', title: 'Create Profile', desc: 'Sign up and fill in your complete medical history, allergies, and emergency contacts.' },
              { icon: QrCode, step: '02', title: 'Get Your QR Code', desc: 'Generate a unique QR code. Print it or save it on your phone for instant access.' },
              { icon: Activity, step: '03', title: 'Wear & Monitor', desc: 'Connect your ESP32 health band for real-time vitals. Doctors scan your QR for full access.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-sm font-bold text-primary/50">{item.step}</span>
                  <h3 className="mt-1 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-br from-primary to-secondary py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <Clock className="mx-auto mb-4 h-12 w-12" />
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Take Control of Your Health?</h2>
          <p className="mt-4 text-white/80">
            Join thousands of patients who trust Smart Health Monitoring for their daily health tracking.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" onClick={() => router.push('/signup')}>
            Create Free Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground md:px-6">
          &copy; {new Date().getFullYear()} Smart Health Monitoring System. Powered by ESP32 & Firebase.
        </div>
      </footer>
    </div>
  );
}
