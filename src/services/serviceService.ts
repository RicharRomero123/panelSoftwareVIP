// src/services/serviceService.ts
import axiosClient from '../lib/axiosClient';
import { Service, CreateServicePayload, UpdateServicePayload } from '../types';

/**
 * Servicio para la gestión de servicios a través de la API.
 */
const serviceService = {
    /**
     * Obtiene la lista completa de todos los servicios disponibles.
     * GET /servicios
     * @returns Un array de servicios.
     */
    getAllServices: async (): Promise<Service[]> => {
        const response = await axiosClient.get<Service[]>('/servicios');
        return response.data;
    },

    /**
     * Crea un nuevo servicio.
     * POST /servicios
     * @param serviceData Datos del nuevo servicio.
     * @returns El servicio creado.
     */
    createService: async (serviceData: CreateServicePayload): Promise<Service> => {
        const response = await axiosClient.post<Service>('/servicios', serviceData);
        return response.data;
    },

    /**
     * Actualiza un servicio existente por su ID.
     * PATCH /servicios/{id}
     * @param id El ID del servicio a actualizar.
     * @param serviceData Los datos a actualizar (parciales).
     * @returns El servicio actualizado.
     */
    updateService: async (id: string, serviceData: UpdateServicePayload): Promise<Service> => {
        const response = await axiosClient.patch<Service>(`/servicios/${id}`, serviceData);
        return response.data;
    },

    /**
     * Elimina un servicio por su ID.
     * DELETE /servicios/{id}
     * @param id El ID del servicio a eliminar.
     * @returns No devuelve contenido (Status 204).
     */
    deleteService: async (id: string): Promise<void> => {
        await axiosClient.delete(`/servicios/${id}`);
    },
};

export default serviceService;