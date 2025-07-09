// src/types/index.d.ts (CORREGIDO Y UNIFICADO)

export type UserRole = 'ADMIN' | 'CLIENTE';
export type OrderStatus = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'CANCELADO';

// --- Autenticación y Usuarios ---

export interface AuthResponse {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    message: string;
    token: string;
    type: string;
}

export interface UserSession {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    token: string;
    type: string;
}

export interface User {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    monedas: number;
}

export interface CreateUserPayload {
    nombre: string;
    email: string;
    password?: string;
    rol: UserRole;
}

export interface RechargeCoinsPayload {
    cantidad: number;
}

export interface ResetPasswordPayload {
    newPassword: string;
}

// --- Servicios ---

export interface Service {
    id: string;
    nombre: string;
    descripcion: string;
    precioMonedas: number;
    requiereEntrega: boolean;
    activo: boolean;
    tiempoEsperaMinutos: string | number;
    fechaCreacion: string;
    imgUrl: string;
}

export interface CreateServicePayload {
    nombre: string;
    descripcion: string;
    precioMonedas: number;
    requiereEntrega: boolean;
    activo: boolean;
    tiempoEsperaMinutos: number;
    imgUrl: string;
}

export interface UpdateServicePayload {
    nombre?: string;
    descripcion?: string;
    precioMonedas?: number;
    requiereEntrega?: boolean;
    activo?: boolean;
    tiempoEsperaMinutos?: number;
    imgUrl?: string;
}

// --- Órdenes ---

export interface DeliveryDetails {
    id: string;
    usuarioCuenta: string;
    clave: string;
    nota?: string;
}

export interface Order {
    id: string;
    usuarioId: string;
    usuarioNombre: string;
    servicioId: string;
    servicioNombre: string;
    estado: OrderStatus;
    fechaCreacion: string;
    fechaEntrega: string | null;
    tiempoEstimadoEspera: string;
    entrega: DeliveryDetails | null;
}

export interface UpdateOrderStatusPayload {
    nuevoEstado: OrderStatus;
}

export interface AddDeliveryDetailsPayload {
    usuarioCuenta: string;
    clave: string;
    nota?: string;
}