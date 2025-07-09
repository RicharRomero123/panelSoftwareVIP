// src/app/admin/servicios/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CreateServicePayload, Service, UpdateServicePayload } from "@/types";
import serviceService from "@/services/serviceService";
import { Plus, Edit, Trash2, Search, RefreshCw, Info, Clock, DollarSign, Package, UploadCloud, Image as ImageIcon, CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

// --- Componente para subir imágenes a Cloudinary ---
const ImageUploader = ({ initialImageUrl, onUploadSuccess }: { initialImageUrl: string; onUploadSuccess: (url: string) => void; }) => {
    const [image, setImage] = useState(initialImageUrl);
    const [loading, setLoading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const presetName = 'Presenten_react';
    const cloudName = 'daassyisd';

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', presetName);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                setImage(data.secure_url);
                onUploadSuccess(data.secure_url);
            } else {
                throw new Error('No se pudo obtener la URL de la imagen.');
            }
        } catch (err) {
            console.error(err);
            setUploadError('Error al subir la imagen.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Imagen del Servicio</label>
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-slate-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600">
                    {loading ? (
                        <RefreshCw className="animate-spin text-2xl text-blue-400" />
                    ) : image ? (
                        <Image src={image} alt="Vista previa" width={96} height={96} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <ImageIcon className="text-3xl text-slate-500" />
                    )}
                </div>
                <div className="flex-grow">
                    <label htmlFor="file-upload" className="cursor-pointer bg-slate-700 text-slate-200 hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-600 transition duration-300 flex items-center justify-center gap-2">
                        <UploadCloud size={18} />
                        <span>{image ? 'Cambiar Imagen' : 'Subir Imagen'}</span>
                    </label>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    <p className="text-xs text-slate-500 mt-2">Recomendado: 500x280px</p>
                    {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                </div>
            </div>
        </div>
    );
};


const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative bg-slate-800/80 backdrop-blur-lg border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
            >
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-radial from-blue-600/10 via-transparent to-transparent animate-pulse"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Info className="text-blue-400" />{title}</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-700 p-1 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

const ServiciosPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [newService, setNewService] = useState<CreateServicePayload>({ nombre: '', descripcion: '', precioMonedas: 0, requiereEntrega: false, activo: true, tiempoEsperaMinutos: 0, imgUrl: '' });
    const [createLoading, setCreateLoading] = useState<boolean>(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [editLoading, setEditLoading] = useState<boolean>(false);

    const filteredServices = services.filter(service => service.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await serviceService.getAllServices();
            setServices(data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al cargar los servicios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await serviceService.createService(newService);
            toast.success('¡Servicio creado exitosamente!');
            fetchServices();
            setIsCreateModalOpen(false);
            setNewService({ nombre: '', descripcion: '', precioMonedas: 0, requiereEntrega: false, activo: true, tiempoEsperaMinutos: 0, imgUrl: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al crear el servicio.');
        } finally {
            setCreateLoading(false);
        }
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setIsEditModalOpen(true);
    };

    const handleUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;
        setEditLoading(true);
        const payload: UpdateServicePayload = { ...editingService, tiempoEsperaMinutos: Number(editingService.tiempoEsperaMinutos) || 0 };
        try {
            await serviceService.updateService(editingService.id, payload);
            toast.success('Servicio actualizado exitosamente!');
            fetchServices();
            setIsEditModalOpen(false);
            setEditingService(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al actualizar el servicio.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este servicio? Esta acción es irreversible.')) return;
        try {
            await serviceService.deleteService(id);
            toast.success('Servicio eliminado correctamente.');
            fetchServices();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al eliminar el servicio.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
            <Toaster position="top-right" toastOptions={{ className: 'bg-slate-700 text-white' }} />
            <AnimatePresence>
                {isCreateModalOpen && (
                    <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Nuevo Servicio">
                        <form onSubmit={handleCreateService} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label><input type="text" value={newService.nombre} onChange={(e) => setNewService({ ...newService, nombre: e.target.value })} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label><textarea rows={3} value={newService.descripcion} onChange={(e) => setNewService({ ...newService, descripcion: e.target.value })} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea></div>
                                <ImageUploader initialImageUrl="" onUploadSuccess={(url) => setNewService({ ...newService, imgUrl: url })} />
                                <div><label className="block text-sm font-medium text-slate-300 mb-2">Precio (Monedas)</label><input type="number" value={newService.precioMonedas} onChange={(e) => setNewService({ ...newService, precioMonedas: parseInt(e.target.value) || 0 })} required min="0" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block text-sm font-medium text-slate-300 mb-2">Espera (Minutos)</label><input type="number" value={newService.tiempoEsperaMinutos} onChange={(e) => setNewService({ ...newService, tiempoEsperaMinutos: parseInt(e.target.value) || 0 })} required min="0" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-4"><input type="checkbox" id="create-requiereEntrega" className="h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500" checked={newService.requiereEntrega} onChange={(e) => setNewService({ ...newService, requiereEntrega: e.target.checked })} /><label htmlFor="create-requiereEntrega" className="text-slate-300 text-sm font-medium">Requiere Entrega</label></div>
                                <div className="flex items-center gap-4"><input type="checkbox" id="create-activo" className="h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500" checked={newService.activo} onChange={(e) => setNewService({ ...newService, activo: e.target.checked })} /><label htmlFor="create-activo" className="text-slate-300 text-sm font-medium">Activar servicio</label></div>
                            </div>
                            <div className="mt-8 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors">Cancelar</button>
                                <button type="submit" disabled={createLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-blue-400/50 disabled:cursor-not-allowed">
                                    {createLoading ? <RefreshCw className="animate-spin" /> : <Plus />} {createLoading ? 'Creando...' : 'Crear Servicio'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
                 {isEditModalOpen && editingService && (
                    <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Servicio">
                        <form onSubmit={handleUpdateService} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label><input type="text" value={editingService.nombre} onChange={(e) => setEditingService({ ...editingService, nombre: e.target.value })} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label><textarea rows={3} value={editingService.descripcion} onChange={(e) => setEditingService({ ...editingService, descripcion: e.target.value })} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea></div>
                                <ImageUploader initialImageUrl={editingService.imgUrl} onUploadSuccess={(url) => setEditingService({ ...editingService, imgUrl: url })} />
                                <div><label className="block text-sm font-medium text-slate-300 mb-2">Precio (Monedas)</label><input type="number" value={editingService.precioMonedas} onChange={(e) => setEditingService({ ...editingService, precioMonedas: parseInt(e.target.value) || 0 })} required min="0" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label className="block text-sm font-medium text-slate-300 mb-2">Espera (Minutos)</label><input type="number" value={editingService.tiempoEsperaMinutos} onChange={(e) => setEditingService({ ...editingService, tiempoEsperaMinutos: e.target.value })} required min="0" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-4"><input type="checkbox" id="edit-requiereEntrega" className="h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500" checked={editingService.requiereEntrega} onChange={(e) => setEditingService({ ...editingService, requiereEntrega: e.target.checked })} /><label htmlFor="edit-requiereEntrega" className="text-slate-300 text-sm font-medium">Requiere Entrega</label></div>
                                <div className="flex items-center gap-4"><input type="checkbox" id="edit-activo" className="h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500" checked={editingService.activo} onChange={(e) => setEditingService({ ...editingService, activo: e.target.checked })} /><label htmlFor="edit-activo" className="text-slate-300 text-sm font-medium">Activar servicio</label></div>
                            </div>
                            <div className="mt-8 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors">Cancelar</button>
                                <button type="submit" disabled={editLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-blue-400/50 disabled:cursor-not-allowed">
                                    {editLoading ? <RefreshCw className="animate-spin" /> : <CheckCircle />} {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3"><Package />Gestión de Servicios</h1>
                        <p className="mt-2 text-slate-400">Administra los servicios disponibles en la plataforma.</p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 md:mt-0 bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center gap-2">
                        <Plus />Nuevo Servicio
                    </button>
                </div>
                <div className="mb-6 flex justify-between items-center">
                     <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={fetchServices} className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                        <RefreshCw className={loading ? "animate-spin" : ""} />Actualizar
                    </button>
                </div>

                {loading ? <div className="text-center py-10"><RefreshCw className="animate-spin text-3xl mx-auto" /></div> : (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                        {filteredServices.map((service) => (
                            <motion.div layout key={service.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-blue-500 hover:bg-slate-800 hover:-translate-y-1">
                                <div className="p-5">
                                    {service.imgUrl && <Image src={service.imgUrl} alt={service.nombre} width={500} height={280} className="w-full h-32 object-cover rounded-lg mb-4" />}
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-white flex-grow pr-2">{service.nombre}</h3>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${service.activo ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{service.activo ? 'Activo' : 'Inactivo'}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm my-3 h-16 overflow-hidden">{service.descripcion}</p>
                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-lg"><DollarSign className="text-amber-400 h-4 w-4" /><div><span className="text-xs text-slate-400">Precio</span><p className="font-bold text-white">{service.precioMonedas}</p></div></div>
                                        <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-lg"><Clock className="text-cyan-400 h-4 w-4" /><div><span className="text-xs text-slate-400">Espera</span><p className="font-bold text-white">{service.tiempoEsperaMinutos} min</p></div></div>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-2">
                                    <button onClick={() => openEditModal(service)} className="w-full flex items-center justify-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors"><Edit size={16}/>Editar</button>
                                    <button onClick={() => handleDeleteService(service.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </motion.div>
                )}
                {!loading && filteredServices.length === 0 && <p className="text-center py-10 text-slate-500">No se encontraron servicios.</p>}
            </div>
        </div>
    );
};

export default ServiciosPage;