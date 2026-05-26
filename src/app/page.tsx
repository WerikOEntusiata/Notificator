import Dashboard from '@/components/Dashboard';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      <Link 
        href="/admin"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors"
      >
        <Shield size={16} />
        <span className="text-sm font-medium">Admin</span>
      </Link>
      <Dashboard />
    </main>
  );
}