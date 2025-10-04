'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if authenticated, otherwise to login
    if (apiService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
