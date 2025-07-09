// src/components/users/ResetPasswordModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
// ✅ SOLUCIÓN: Se eliminaron los iconos 'Info' y 'Mail' no utilizados
import { KeyRound, Lock, RefreshCw, User, Eye, EyeOff, X } from 'lucide-react';
import userService from '@/services/authService';
import { User as UserType } from '@/types';
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
        className="relative bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-radial from-indigo-600/10 via-transparent to-transparent animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <KeyRound className="text-indigo-400" />
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

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, user }) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setShowPassword(false);
      setPasswordStrength(0);
    }
  }, [isOpen]);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    checkPasswordStrength(newPass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await userService.resetUserPassword(user.id, newPassword);
      toast.success(`¡Contraseña de ${user.nombre} actualizada!`);
      onClose();
    } catch (err: unknown) { // ✅ SOLUCIÓN: Se usa 'unknown' en lugar de 'any'
      const apiError = err as ApiError;
      toast.error(apiError.response?.data?.message || 'Error al resetear la contraseña.');
    } finally {
      setLoading(false);
    }
  };
  
  const strengthColors = ['bg-slate-600', 'bg-red-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const strengthLabels = ['Muy Débil', 'Débil', 'Normal', 'Fuerte', 'Muy Fuerte'];

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Resetear Contraseña">
          {user && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center mb-2">
                  <User className="text-slate-400 mr-2" size={16} />
                  <p className="text-sm font-semibold text-slate-300">Usuario a modificar:</p>
                </div>
                <p className="text-base font-bold text-white ml-8">{user.nombre}</p>
                <p className="text-sm text-slate-400 ml-8">{user.email}</p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-slate-300 text-sm font-medium mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 pl-11 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    placeholder="Ingresa la nueva contraseña"
                  />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-grow grid grid-cols-4 gap-1.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-colors ${passwordStrength > i ? strengthColors[passwordStrength] : 'bg-slate-600'}`}></div>
                        ))}
                    </div>
                    <span className="text-xs font-medium text-slate-400 w-20 text-right">{newPassword.length > 0 ? strengthLabels[passwordStrength] : ''}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:bg-indigo-400/50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <KeyRound />}
                  {loading ? 'Reseteando...' : 'Resetear'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </AnimatePresence>
  );
};
