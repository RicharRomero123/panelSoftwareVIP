// src/components/users/UserTableRow.tsx
'use client';

import React, { useState } from 'react';
// ✅ SOLUCIÓN: Se eliminó 'User as UserIcon' no utilizado
import { DollarSign, RefreshCw, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '@/types';
import userService from '@/services/authService';

// ✅ SOLUCIÓN: Interfaz para manejar errores de API de forma segura
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface UserTableRowProps {
  user: User;
  onDataChange: () => void;
  onOpenResetPassword: (user: User) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({ user, onDataChange, onOpenResetPassword }) => {
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  const [isRecharging, setIsRecharging] = useState(false);

  const handleRecharge = async () => {
    if (rechargeAmount <= 0) {
      toast.error('La cantidad a recargar debe ser mayor que 0.');
      return;
    }
    setIsRecharging(true);
    try {
      await userService.recargarMonedas(user.id, rechargeAmount);
      toast.success(`Se recargaron ${rechargeAmount} monedas a ${user.nombre}.`);
      setRechargeAmount(0); // Reset input
      onDataChange(); // Refresh data in parent
    } catch (err: unknown) { // ✅ SOLUCIÓN: Se usa 'unknown' en lugar de 'any'
      const apiError = err as ApiError;
      toast.error(apiError.response?.data?.message || 'Error al recargar monedas.');
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      {/* Columna de Usuario */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center text-slate-300 font-bold text-lg">
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">{user.nombre}</div>
            <div className="text-sm text-slate-400">{user.email}</div>
          </div>
        </div>
      </td>

      {/* Columna de Monedas */}
      <td className="px-6 py-4">
        <div className="flex items-center text-sm font-bold text-amber-400">
          <DollarSign className="mr-1 h-4 w-4" />
          {user.monedas}
        </div>
      </td>
      
      {/* Columna de Recarga */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            value={rechargeAmount || ''}
            onChange={(e) => setRechargeAmount(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="block w-24 pl-2 pr-2 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
          <button onClick={handleRecharge} disabled={isRecharging} className="flex items-center justify-center px-3 py-2 rounded-md text-sm transition-colors bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400/50 disabled:cursor-not-allowed">
            {isRecharging ? <RefreshCw className="animate-spin h-4 w-4" /> : 'Recargar'}
          </button>
        </div>
      </td>

      {/* Columna de Acciones */}
      <td className="px-6 py-4 text-center">
        <button onClick={() => onOpenResetPassword(user)} className="text-indigo-400 hover:text-indigo-300 ml-4 flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-indigo-500/20 transition-colors">
          <KeyRound size={14} />
          Resetear Clave
        </button>
      </td>
    </tr>
  );
};
