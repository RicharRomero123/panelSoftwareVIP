'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const SideNav: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const [showConfirmLogout, setShowConfirmLogout] = useState(false);

    const navItems = [
        { name: 'Usuarios', href: '/admin/usuarios', icon: '👤' },
        { name: 'Servicios', href: '/admin/servicios', icon: '🛠️' },
        { name: 'Órdenes', href: '/admin/ordenes', icon: '📦' },
    ];

    const handleLogoutConfirm = () => {
        logout();
        router.push('/login');
    };

    return (
        <>
            <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed flex flex-col shadow-2xl rounded-r-xl overflow-hidden">
                <div className="p-6 text-center">
                    <img
                        src="https://res.cloudinary.com/dod56svuf/image/upload/v1751876631/Logotipo_reposter%C3%ADa_y_macarrones_marr%C3%B3n_qa2wd1.png"
                        alt="Logo"
                        className="w-16 h-16 mx-auto mb-2 rounded-full"
                    />
                    <h1 className="text-xl font-extrabold text-blue-400">Sistemas VIP Panel</h1>
                    <p className="text-xs text-gray-400 mt-1">Panel de Control</p>
                </div>

                <nav className="flex-grow mt-4 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 ease-in-out text-sm font-medium
                                ${pathname === item.href
                                    ? 'bg-blue-600 text-white shadow-md border-l-4 border-blue-300'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            <span className="mr-3 text-xl">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-700">
                    {user && (
                        <div className="mb-4 text-center">
                            <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center shadow">
                                {user.nombre.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-semibold text-sm text-gray-100">{user.nombre}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            <span className="mt-1 inline-block text-xs px-3 py-1 bg-blue-700 text-blue-100 rounded-full">
                                {user.rol}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowConfirmLogout(true)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition transform hover:scale-105 flex items-center justify-center"
                    >
                        <span className="mr-2">🚪</span> Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showConfirmLogout && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-md shadow-lg border dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">¿Estás seguro?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">¿Deseas cerrar sesión y salir del panel?</p>
                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmLogout(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SideNav;
