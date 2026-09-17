'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
