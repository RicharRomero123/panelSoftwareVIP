// src/app/admin/usuarios/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import userService from '@/services/authService';
import { User, UserRole } from '@/types';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { ResetPasswordModal } from '@/components/users/ResetPasswordModal';
import { UserTableRow } from '@/components/users/UserTableRow';
import toast, { Toaster } from 'react-hot-toast';
import { FiRefreshCw, FiSearch, FiUserPlus, FiUsers } from 'react-icons/fi';

const UsuariosPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // State for modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState<boolean>(false);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

    const { clientes, administradores } = useMemo(() => {
        const filteredUsers = users.filter(user =>
            user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return {
            clientes: filteredUsers.filter(user => user.rol === 'CLIENTE'),
            administradores: filteredUsers.filter(user => user.rol === 'ADMIN')
        };
    }, [users, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            console.error('Error al obtener usuarios:', err);
            toast.error(err.response?.data?.message || 'Error al cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenResetPassword = (user: User) => {
        setUserToResetPassword(user);
        setIsResetPasswordModalOpen(true);
    };

    const renderUserTable = (userList: User[], title: string, color: string) => {
        if (userList.length === 0 && searchTerm) return null;
        return (
            <div className="mb-10">
                <h3 className={`text-xl font-semibold mb-4 ${color}`}>{title} ({userList.length})</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800/40">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Monedas</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Recargar Saldo</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {userList.map((user) => (
                                <UserTableRow 
                                    key={user.id} 
                                    user={user} 
                                    onDataChange={fetchUsers} 
                                    onOpenResetPassword={handleOpenResetPassword} 
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
            <Toaster position="top-right" reverseOrder={false} toastOptions={{
                className: 'bg-slate-700 text-white',
            }}/>
            <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onUserCreated={fetchUsers} />
            <ResetPasswordModal isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} user={userToResetPassword} />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3"><FiUsers />Gestión de Usuarios</h1>
                        <p className="mt-2 text-slate-400">Administra usuarios, roles y saldos de la plataforma.</p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 md:mt-0 bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center gap-2">
                        <FiUserPlus />
                        Nuevo Usuario
                    </button>
                </div>
                
                <div className="mb-6 flex justify-between items-center">
                     <div className="relative flex-grow max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchUsers} className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        Actualizar
                    </button>
                </div>

                {loading && <div className="text-center py-10"><FiRefreshCw className="animate-spin text-3xl mx-auto" /></div>}
                {!loading && renderUserTable(administradores, 'Administradores', 'text-amber-400')}
                {!loading && renderUserTable(clientes, 'Clientes', 'text-green-400')}
                {!loading && users.length === 0 && <p className="text-center py-10 text-slate-500">No hay usuarios registrados.</p>}
            </div>
        </div>
    );
};

export default UsuariosPage;