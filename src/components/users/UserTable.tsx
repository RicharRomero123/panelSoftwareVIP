// src/components/users/UserTable.tsx
'use client';

import React from 'react';
import { User } from '@/types';
import { UserTableRow } from './UserTableRow';

interface UserTableProps {
  users: User[];
  title: string;
  titleColor: string; // e.g., 'text-amber-400'
  onDataChange: () => void;
  onOpenResetPassword: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, title, titleColor, onDataChange, onOpenResetPassword }) => {
  // No renderizar nada si la lista de usuarios para esta categoría está vacía
  if (users.length === 0) return null;

  return (
    <div className="mb-10">
      <h3 className={`text-xl font-semibold mb-4 ${titleColor}`}>
        {title} <span className="text-slate-400 font-normal text-base">({users.length})</span>
      </h3>
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/40">
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
            {users.map((user) => (
              <UserTableRow 
                key={user.id} 
                user={user} 
                onDataChange={onDataChange}
                onOpenResetPassword={onOpenResetPassword}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
