// src/app/admin/ordenes/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, OrderStatus, AddDeliveryDetailsPayload } from "@/types";
import orderService from "@/services/orderService";
import { motion, AnimatePresence } from 'framer-motion';
// ✅ SOLUCIÓN: Se eliminó el icono 'User' no utilizado
import { Package, Clock, Search, RefreshCw, Pencil, Truck, X, CheckCircle, Loader, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- INTERFAZ PARA ERRORES DE API (Buena práctica) ---
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// --- Componente Modal Genérico ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; icon?: React.ReactNode; children: React.ReactNode; }> = ({ isOpen, onClose, title, icon, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-lg mx-4"
            >
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">{icon}{title}</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-700 p-1 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

// --- Componente de Fila de Orden Expandible ---
const OrderListItem: React.FC<{ order: Order; onOpenStatusModal: (order: Order) => void; onOpenDeliveryModal: (order: Order) => void; onDeleteOrder: (order: Order) => void; isClient: boolean; }> = ({ order, onOpenStatusModal, onOpenDeliveryModal, onDeleteOrder, isClient }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const getStatusInfo = (status: OrderStatus) => {
        switch (status) {
            case 'PENDIENTE': return { color: 'bg-blue-500/20 text-blue-300', icon: <Loader size={14} className="animate-spin" /> };
            case 'PROCESANDO': return { color: 'bg-yellow-500/20 text-yellow-300', icon: <Clock size={14} /> };
            case 'COMPLETADO': return { color: 'bg-green-500/20 text-green-300', icon: <CheckCircle size={14} /> };
            case 'CANCELADO': return { color: 'bg-red-500/20 text-red-300', icon: <X size={14} /> };
            default: return { color: 'bg-slate-600/50 text-slate-300', icon: null };
        }
    };
    const statusInfo = getStatusInfo(order.estado);

    return (
        <motion.div layout className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-full ${statusInfo.color}`}>
                        {statusInfo.icon || <Package size={16}/>}
                    </div>
                    <div>
                        <p className="font-bold text-white truncate">{order.servicioNombre}</p>
                        <p className="text-xs text-slate-400">para {order.usuarioNombre}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
                        {order.estado}
                    </span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown className="h-5 w-5 text-slate-400" /></motion.div>
                </div>
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 border-t border-slate-700 bg-slate-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300 mb-6">
                                <div>
                                    <p className="font-semibold text-white mb-1">Información General</p>
                                    <p><strong>ID Orden:</strong> <span className="font-mono text-slate-400">{order.id}</span></p>
                                    <p><strong>Creada:</strong> {isClient ? new Date(order.fechaCreacion).toLocaleString('es-PE') : '...'}</p>
                                    <p><strong>Entregada:</strong> {isClient && order.fechaEntrega ? new Date(order.fechaEntrega).toLocaleString('es-PE') : 'Pendiente'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white mb-1">Detalles de Entrega</p>
                                    {order.entrega ? (
                                        <div className="space-y-1 text-xs bg-slate-800 p-2 rounded-md">
                                            <p><strong>Cuenta:</strong> {order.entrega.usuarioCuenta}</p>
                                            <p><strong>Clave:</strong> {order.entrega.clave}</p>
                                            {order.entrega.nota && <p><strong>Nota:</strong> {order.entrega.nota}</p>}
                                        </div>
                                    ) : <p className="text-slate-500 italic">No hay detalles de entrega.</p>}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-slate-700/50">
                                <button onClick={() => onOpenStatusModal(order)} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"><Pencil className="-ml-1 mr-2 h-5 w-5" />Cambiar Estado</button>
                                {!order.entrega && <button onClick={() => onOpenDeliveryModal(order)} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 transition-colors"><Truck className="-ml-1 mr-2 h-5 w-5" />Agregar Entrega</button>}
                                <button onClick={() => onDeleteOrder(order)} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"><Trash2 className="-ml-1 mr-2 h-5 w-5" />Eliminar</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// --- Página Principal de Gestión de Órdenes ---
const OrdenesPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'activo' | 'historial'>('activo');
    const [isClient, setIsClient] = useState(false);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('PENDIENTE');
    const [deliveryDetails, setDeliveryDetails] = useState<AddDeliveryDetailsPayload>({ usuarioCuenta: '', clave: '', nota: '' });
    
    const [updateLoading, setUpdateLoading] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await orderService.getAllOrders();
            setOrders(data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()));
        } catch (err: unknown) { 
            const apiError = err as ApiError;
            toast.error(apiError.response?.data?.message || 'Error al cargar las órdenes.');
        } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { 
        setIsClient(true);
        fetchOrders(); 
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => orders.filter(order =>
        order.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.servicioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    ), [orders, searchTerm]);

    const activeOrders = useMemo(() => filteredOrders.filter(o => o.estado === 'PENDIENTE' || o.estado === 'PROCESANDO'), [filteredOrders]);
    const historicalOrders = useMemo(() => filteredOrders.filter(o => o.estado === 'COMPLETADO' || o.estado === 'CANCELADO'), [filteredOrders]);

    const openStatusModal = (order: Order) => { setSelectedOrder(order); setNewOrderStatus(order.estado); setIsStatusModalOpen(true); };
    const openDeliveryModal = (order: Order) => { setSelectedOrder(order); setDeliveryDetails({ usuarioCuenta: '', clave: '', nota: '' }); setIsDeliveryModalOpen(true); };
    const openDeleteModal = (order: Order) => { setSelectedOrder(order); setIsDeleteModalOpen(true); };

    const handleUpdateStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        setUpdateLoading(true);
        try {
            await orderService.updateOrderStatus(selectedOrder.id, newOrderStatus);
            toast.success('Estado de la orden actualizado.');
            fetchOrders();
            setIsStatusModalOpen(false);
        } catch (err: unknown) { 
            const apiError = err as ApiError;
            toast.error(apiError.response?.data?.message || 'Error al actualizar estado.');
        } 
        finally { setUpdateLoading(false); }
    };

    const handleAddDeliveryDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        setUpdateLoading(true);
        try {
            await orderService.addDeliveryDetails(selectedOrder.id, deliveryDetails);
            toast.success('Detalles de entrega guardados.');
            fetchOrders();
            setIsDeliveryModalOpen(false);
        } catch (err: unknown) { 
            const apiError = err as ApiError;
            toast.error(apiError.response?.data?.message || 'Error al guardar detalles.');
        } 
        finally { setUpdateLoading(false); }
    };

    const handleDeleteOrder = async () => {
        if (!selectedOrder) return;
        setUpdateLoading(true);
        try {
            // @ts-expect-error La función deleteOrder aún no está implementada en el servicio.
            await orderService.deleteOrder(selectedOrder.id);
            toast.success('Orden eliminada correctamente.');
            fetchOrders();
            setIsDeleteModalOpen(false);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            toast.error(apiError.response?.data?.message || 'Error al eliminar la orden.');
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
            <Toaster position="top-right" toastOptions={{ className: 'bg-slate-700 text-white' }} />
            
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3"><Package />Gestión de Órdenes</h1>
                        <p className="mt-2 text-slate-400">Visualiza y administra el flujo de trabajo de las órdenes.</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Buscar orden..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"><RefreshCw className={loading ? "animate-spin" : ""} />Actualizar</button>
                    </div>
                </div>

                <div className="mb-6 border-b border-slate-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('activo')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${activeTab === 'activo' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-400'}`}>Órdenes Activas ({activeOrders.length})</button>
                        <button onClick={() => setActiveTab('historial')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${activeTab === 'historial' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-400'}`}>Historial ({historicalOrders.length})</button>
                    </nav>
                </div>

                {loading ? <div className="text-center py-20"><Loader className="animate-spin text-4xl mx-auto" /></div> : (
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            {(activeTab === 'activo' ? activeOrders : historicalOrders).length > 0 ? (
                                (activeTab === 'activo' ? activeOrders : historicalOrders).map(order => (
                                    <OrderListItem key={order.id} order={order} onOpenStatusModal={openStatusModal} onOpenDeliveryModal={openDeliveryModal} onDeleteOrder={openDeleteModal} isClient={isClient} />
                                ))
                            ) : (
                                <div className="text-center py-20 text-slate-500">No hay órdenes en esta sección.</div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <AnimatePresence>
                {isStatusModalOpen && selectedOrder && (
                    <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Actualizar Estado" icon={<Pencil/>}>
                        <form onSubmit={handleUpdateStatus} className="space-y-6">
                            <p className="text-slate-300">Orden: <span className="font-mono text-white">#{selectedOrder.id.substring(0,8)}</span></p>
                            <div>
                                <label htmlFor="newStatus" className="block text-slate-300 text-sm font-medium mb-2">Nuevo Estado:</label>
                                <select id="newStatus" value={newOrderStatus} onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="PENDIENTE">PENDIENTE</option>
                                    <option value="PROCESANDO">PROCESANDO</option>
                                    <option value="COMPLETADO">COMPLETADO</option>
                                    <option value="CANCELADO">CANCELADO</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-5 py-2 bg-slate-700/50 rounded-lg">Cancelar</button><button type="submit" disabled={updateLoading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50">{updateLoading ? 'Guardando...' : 'Guardar'}</button></div>
                        </form>
                    </Modal>
                )}
                {isDeliveryModalOpen && selectedOrder && (
                     <Modal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)} title="Agregar Detalles de Entrega" icon={<Truck/>}>
                        <form onSubmit={handleAddDeliveryDetails} className="space-y-4">
                             <div><label className="block text-sm font-medium text-slate-300 mb-2">Cuenta de Usuario</label><input type="text" value={deliveryDetails.usuarioCuenta} onChange={(e) => setDeliveryDetails({...deliveryDetails, usuarioCuenta: e.target.value})} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                             <div><label className="block text-sm font-medium text-slate-300 mb-2">Contraseña / Clave</label><input type="text" value={deliveryDetails.clave} onChange={(e) => setDeliveryDetails({...deliveryDetails, clave: e.target.value})} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                             <div><label className="block text-sm font-medium text-slate-300 mb-2">Nota (Opcional)</label><textarea rows={2} value={deliveryDetails.nota} onChange={(e) => setDeliveryDetails({...deliveryDetails, nota: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea></div>
                             <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsDeliveryModalOpen(false)} className="px-5 py-2 bg-slate-700/50 rounded-lg">Cancelar</button><button type="submit" disabled={updateLoading} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50">{updateLoading ? 'Guardando...' : 'Guardar Detalles'}</button></div>
                        </form>
            __           </Modal>
                )}
                {isDeleteModalOpen && selectedOrder && (
                     <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación" icon={<AlertTriangle className="text-red-400"/>}>
                        <div className="space-y-4">
                            <p className="text-slate-300">¿Estás seguro de que quieres eliminar la orden <strong className="font-mono text-white">#{selectedOrder.id.substring(0,8)}</strong>? Esta acción es irreversible.</p>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 bg-slate-700/50 rounded-lg">Cancelar</button>
                                <button onClick={handleDeleteOrder} disabled={updateLoading} className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50">{updateLoading ? 'Eliminando...' : 'Sí, eliminar'}</button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrdenesPage;