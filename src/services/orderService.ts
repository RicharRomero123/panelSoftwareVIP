// src/services/
import axiosClient from '../lib/axiosClient';
import {Order, UpdateOrderStatusPayload, AddDeliveryDetailsPayload, OrderStatus} from '../types';

/**
 * Servicio para la gestión de órdenes a través de la API.
 */
const orderService = {
    /**
     * Obtiene la lista completa de todas las órdenes en el sistema.
     * GET /ordenes
     * @returns Un array de órdenes.
     */
    getAllOrders: async (): Promise<Order[]> => {
        const response = await axiosClient.get<Order[]>('/ordenes');
        return response.data;
    },

    /**
     * Actualiza el estado de una orden específica.
     * PATCH /ordenes/{id}/estado
     * @param id El ID de la orden a actualizar.
     * @param newStatus El nuevo estado de la orden.
     * @returns La orden actualizada.
     */
    updateOrderStatus: async (id: string, newStatus: OrderStatus): Promise<Order> => {
        const payload: UpdateOrderStatusPayload = { nuevoEstado: newStatus };
        const response = await axiosClient.patch<Order>(`/ordenes/${id}/estado`, payload);
        return response.data;
    },

    /**
     * Agrega detalles de entrega a una orden específica.
     * PATCH /ordenes/{id}/entrega
     * @param id El ID de la orden.
     * @param deliveryDetails Los detalles de entrega.
     * @returns La orden con los detalles de entrega agregados.
     */
    addDeliveryDetails: async (id: string, deliveryDetails: AddDeliveryDetailsPayload): Promise<Order> => {
        const response = await axiosClient.patch<Order>(`/ordenes/${id}/entrega`, deliveryDetails);
        return response.data;
    },
};

export default orderService;