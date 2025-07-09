'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import SideNav from '@/components/SideNav';

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const FullScreenLoader: React.FC = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="text-lg mt-4 font-semibold">Verificando acceso...</p>
    </div>
);

const AdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [isSideNavOpen, setIsSideNavOpen] = useState(false);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/login');
        }
    }, [user, isAdmin, loading, router]);

    if (loading || !user || !isAdmin) {
        return <FullScreenLoader />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
            {/* SideNav Desktop */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <SideNav />
            </div>

            {/* SideNav Mobile */}
            {isSideNavOpen && (
                <div className="lg:hidden">
                    <div
                        onClick={() => setIsSideNavOpen(false)}
                        className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                        aria-hidden="true"
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-40 shadow-xl transform transition-transform duration-300 ease-in-out">
                        <SideNav />
                    </div>
                </div>
            )}

            {/* Contenido Principal */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                {/* Header */}
<header className="sticky top-0 z-20 flex items-center justify-between h-16  dark:bg-gray-900  dark:border-gray-700 px-4 sm:px-6 shadow-sm">
                    {/* Botón del menú (solo en móviles) */}
                    <button
                        type="button"
                        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        onClick={() => setIsSideNavOpen(true)}
                    >
                        <span className="sr-only">Abrir menú</span>
                        <MenuIcon className="h-6 w-6" />
                    </button>

                    {/* Espacio central vacío para balancear */}
                    <div className="flex-1" />

                    {/* Usuario actual (alineado a la derecha) */}
                    <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        <span>Bienvenido,</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {user.nombre}
                        </span>
                    </div>
                </header>

                <main className="flex-grow p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
