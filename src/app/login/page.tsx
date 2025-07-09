'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/services/authService";
import { AxiosError } from 'axios'; // 👈 Importar AxiosError

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const EyeIcon = ({...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = ({...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.67.127 2.454.364m-6.082 2.882a3 3 0 003.434 3.434M16 12a4 4 0 01-4 4m0 0l-4-4m4 4l4-4m-4 4V4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, logout } = useAuth();
    const router = useRouter();

    // Dentro de tu función handleSubmit...

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        const response = await loginUser(email, password);

        // ✅ CORRECCIÓN AQUÍ: Añade token y type al objeto
        login({
            id: response.id,
            nombre: response.nombre,
            email: response.email,
            rol: response.rol,
            token: response.token, // <-- Propiedad añadida
            type: response.type,   // <-- Propiedad añadida
        });

        if (response.rol === 'ADMIN') {
            router.push('/admin/usuarios');
        } else {
            logout();
            setError('¡Hola! Este panel es solo para nuestros administradores. Gracias por tu visita.');
        }
    } catch (err: unknown) {
        // ... el resto de tu manejo de errores
            const axiosError = err as AxiosError;

            if (axiosError.response) {
                if (axiosError.response.status === 500) {
                    setError('Esta cuenta no existe o hay un problema con el servidor. Por favor, intenta de nuevo más tarde.');
                } else {
                    setError(
                        (axiosError.response.data as { message?: string })?.message ||
                        '¡Ups! El email o la contraseña no son correctos. ¿Probamos de nuevo?'
                    );
                }
            } else {
                setError('Ocurrió un error inesperado. Intenta de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <Image
                        src="https://res.cloudinary.com/dod56svuf/image/upload/v1751876631/Logotipo_reposter%C3%ADa_y_macarrones_marr%C3%B3n_qa2wd1.png"
                        alt="Logotipo de la Pastelería"
                        width={140}
                        height={140}
                        priority
                    />
                </div>
                
                <div className={`bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full transition-all duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
                    <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Bienvenida de Nuevo</h2>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Ingresa tus credenciales para administrar</p>
                        
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="mb-4 relative">
                                <label htmlFor="email" className="sr-only">Email</label>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg w-full py-3 pl-10 pr-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="tu@email.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div className="mb-6 relative">
                                <label htmlFor="password" className="sr-only">Contraseña</label>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="shadow-sm appearance-none border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg w-full py-3 pl-10 pr-10 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    {showPassword ? (
                                        <EyeOffIcon onClick={() => setShowPassword(false)} />
                                    ) : (
                                        <EyeIcon onClick={() => setShowPassword(true)} />
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md mb-6 flex items-center" role="alert">
                                    <ErrorIcon />
                                    <p className="font-semibold">{error}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-center">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Verificando...</span>
                                        </>
                                    ) : (
                                        'Entrar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
