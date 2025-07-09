// src/types/index.d.ts

/**
 * Define los roles de usuario posibles en el sistema.
 */
export type UserRole = 'ADMIN' | 'CLIENTE';

/**
 * Interfaz para la respuesta de autenticación del endpoint /auth/login.
 */
export interface AuthResponse {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    message: string;
}

/**
 * Interfaz para los datos del usuario que se almacenan en la sesión.
 */
export interface UserSession {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
}

/**
 * Interfaz para la estructura completa de un usuario obtenida de la API.
 */
export interface User {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    monedas: number;
}

/**
 * Interfaz para los datos necesarios para crear un nuevo usuario.
 */
export interface CreateUserPayload {
    nombre: string;
    email: string;
    password?: string; // La contraseña podría ser opcional si el backend la genera o si es un flujo de invitación
    rol: UserRole;
}

/**
 * Interfaz para los datos necesarios para recargar monedas a un usuario.
 */
export interface RechargeCoinsPayload {
    cantidad: number;
}

// src/types/index.d.ts

/**
 * Define los roles de usuario posibles en el sistema.
 */
export type UserRole = 'ADMIN' | 'CLIENTE';

/**
 * Interfaz para la respuesta de autenticación del endpoint /auth/login.
 */
export interface AuthResponse {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    message: string;
}

/**
 * Interfaz para los datos del usuario que se almacenan en la sesión.
 */
export interface UserSession {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
}

/**
 * Interfaz para la estructura completa de un usuario obtenida de la API.
 */
export interface User {
    id: string;
    nombre: string;
    email: string;
    rol: UserRole;
    monedas: number;
}

/**
 * Interfaz para los datos necesarios para crear un nuevo usuario.
 */
export interface CreateUserPayload {
    nombre: string;
    email: string;
    password?: string;
    rol: UserRole;
}

/**
 * Interfaz para los datos necesarios para recargar monedas a un usuario.
 */
export interface RechargeCoinsPayload {
    cantidad: number;
}

/**
 * Interfaz para la estructura completa de un servicio obtenida de la API.
 */
export interface Service {
    id: string;
    nombre: string;
    descripcion: string;
    precioMonedas: number;
    requiereEntrega: boolean;
    activo: boolean;
    tiempoEsperaMinutos: string; // O number si el backend lo envía como tal
    fechaCreacion: string;
    imgUrl:string;
}

/**
 * Interfaz para los datos necesarios para crear un nuevo servicio.
 */
export interface CreateServicePayload {
    nombre: string;
    descripcion: string;
    precioMonedas: number;
    requiereEntrega: boolean;
    activo: boolean;
    tiempoEsperaMinutos: number;
    imgUrl:string;// El backend espera un número aquí
}

/**
 * Interfaz para los datos opcionales para actualizar un servicio existente.
 */
export interface UpdateServicePayload {
    nombre?: string;
    descripcion?: string;
    precioMonedas?: number;
    requiereEntrega?: boolean;
    activo?: boolean;
    tiempoEsperaMinutos?: number;
    imgUrl:string;
}

/**
 * Define los posibles estados de una orden.
 */
export type OrderStatus = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'CANCELADO';

/**
 * Interfaz para los detalles de entrega de una orden.
 */
export interface DeliveryDetails {
    id: string;
    usuarioCuenta: string;
    clave: string;
    nota?: string;
}

/**
 * Interfaz para la estructura completa de una orden obtenida de la API.
 */
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

/**
 * Interfaz para el payload de actualización del estado de una orden.
 */
export interface UpdateOrderStatusPayload {
    nuevoEstado: OrderStatus;
}

/**
 * Interfaz para el payload de agregar detalles de entrega a una orden.
 */
export interface AddDeliveryDetailsPayload {
    usuarioCuenta: string;
    clave: string;
    nota?: string;
}
/**
 * Interfaz para el payload de reseteo de contraseña.
 */
export interface ResetPasswordPayload {
    newPassword: string;
}
