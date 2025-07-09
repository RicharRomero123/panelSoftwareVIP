// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {useAuth} from "@/context/AuthContext";


const HomePage: React.FC = () => {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (isAdmin) {
        router.push('/admin/usuarios');
      } else {
        router.push('/login'); // No-ADMIN users are redirected back to login
      }
    }
  }, [user, isAdmin, loading, router]);

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Cargando...</p>
      </div>
  );
};

export default HomePage;