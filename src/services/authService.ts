// src/services/authService.ts
import axiosClient from '../lib/axiosClient';
import { AuthResponse, CreateUserPayload, RechargeCoinsPayload, ResetPasswordPayload, User } from '../types';

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
};


/**
 * Servicio para la gestión de usuarios a través de la API.
 */
const userService = {
    /**
     * Crea un nuevo usuario (ADMIN o CLIENTE).
     * POST /usuarios
     * @param userData Datos del nuevo usuario (nombre, email, password, rol).
     * @returns El usuario creado.
     */
    createUser: async (userData: CreateUserPayload): Promise<User> => {
        const response = await axiosClient.post<User>('/usuarios', userData);
        return response.data;
    },

    /**
     * Obtiene la lista completa de todos los usuarios (ADMIN y CLIENTE).
     * GET /usuarios
     * @returns Un array de usuarios.
     */
    getAllUsers: async (): Promise<User[]> => {
        const response = await axiosClient.get<User[]>('/usuarios');
        return response.data;
    },

    /**
     * Obtiene la lista de usuarios con rol CLIENTE.
     * GET /usuarios/clientes
     * @returns Un array de usuarios con rol CLIENTE.
     */
    getClients: async (): Promise<User[]> => {
        const response = await axiosClient.get<User[]>('/usuarios/clientes');
        return response.data;
    },

    /**
     * Obtiene los detalles de un usuario por su ID.
     * GET /usuarios/{id}
     * @param id El ID del usuario.
     * @returns Los detalles del usuario.
     */
    getUserById: async (id: string): Promise<User> => {
        const response = await axiosClient.get<User>(`/usuarios/${id}`);
        return response.data;
    },

    /**
     * Recarga monedas a un usuario específico.
     * PATCH /usuarios/{id}/recargar
     * @param id El ID del usuario a recargar.
     * @param amount La cantidad de monedas a recargar.
     * @returns El usuario con las monedas actualizadas.
     */
    recargarMonedas: async (id: string, amount: number): Promise<User> => {
        const payload: RechargeCoinsPayload = { cantidad: amount };
        const response = await axiosClient.patch<User>(`/usuarios/${id}/recargar`, payload);
        return response.data;
    },
    /**
     * Resetea la contraseña de un usuario.
     * PATCH /usuarios/{id}/reset-password
     * @param id El ID del usuario cuya contraseña se va a resetear.
     * @param newPassword La nueva contraseña.
     * @returns El usuario con la contraseña actualizada (o una confirmación).
     */
    resetUserPassword: async (id: string, newPassword: string): Promise<User> => {
        const payload: ResetPasswordPayload = { newPassword };
        const response = await axiosClient.patch<User>(`/usuarios/${id}/reset-password`, payload);
        return response.data;
    },


};
export default userService;