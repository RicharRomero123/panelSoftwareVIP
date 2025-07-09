// src/components/users/CreateUserModal.tsx
'use client';

import React, { useState } from 'react';
import {
  User, Mail, Lock, UserPlus, RefreshCw, Eye, EyeOff, Shield, X, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '@/services/authService';
import { CreateUserPayload, UserRole } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ SOLUCIÓN: Interfaz para manejar errores de API de forma segura
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
      >
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-radial from-blue-600/10 via-transparent to-transparent animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <UserPlus className="text-blue-400" />
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-700 p-1 rounded-full transition-colors"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const CreateUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onUserCreated: () => void; }> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [formData, setFormData] = useState<CreateUserPayload>({
    nombre: '',
    email: '',
    password: '',
    rol: 'CLIENTE',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (rol: UserRole) => {
    setFormData(prev => ({ ...prev, rol }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.createUser(formData);
      toast.success('¡Usuario creado exitosamente!');
      onUserCreated();
      onClose();
      setFormData({ nombre: '', email: '', password: '', rol: 'CLIENTE' });
    } catch (err: unknown) { // ✅ SOLUCIÓN: Se usa 'unknown' en lugar de 'any'
      const apiError = err as ApiError;
      toast.error(apiError.response?.data?.message || 'Error al crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Usuario">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-300 mb-2">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input
                  type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre Apellido"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rol de usuario</label>
              <div className="grid grid-cols-2 gap-4">
                <RoleButton
                  label="Cliente"
                  icon={<User size={24}/>}
                  isActive={formData.rol === 'CLIENTE'}
                  onClick={() => handleRoleChange('CLIENTE')}
                  activeColor="blue"
                />
                <RoleButton
                  label="Admin"
                  icon={<Shield size={24}/>}
                  isActive={formData.rol === 'ADMIN'}
                  onClick={() => handleRoleChange('ADMIN')}
                  activeColor="amber"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-blue-400/50 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <UserPlus />}
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AnimatePresence>
  );
};

const RoleButton = ({ label, icon, isActive, onClick, activeColor }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void, activeColor: 'blue' | 'amber' }) => {
    const activeClasses = activeColor === 'blue' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-amber-500 bg-amber-500/10 text-amber-400';
    const inactiveClasses = 'border-slate-600 hover:border-slate-500 text-slate-400';

    return (
        <button type="button" onClick={onClick} className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${isActive ? activeClasses : inactiveClasses}`}>
            {isActive && <motion.div layoutId="activeRole" className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 rounded-lg" />}
            {isActive && <CheckCircle className="absolute top-2 right-2 text-white/50" size={16}/>}
            <div className={`mb-2 ${isActive ? '' : 'text-slate-400'}`}>{icon}</div>
            <span className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        </button>
    );
};
