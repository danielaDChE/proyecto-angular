import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PagoTerrenosDB extends DBSchema {
  usuarios: {
    key: number;
    value: {
      id?: number;
      nombre: string;
      telefono: string;
      direccion: string;
    };
    indexes: { 'byNombre': string };
  };
  terrenos: {
    key: number;
    value: {
      id?: number;
      usuarioId: number;
      direccion: string;
      area: string;
      precio: number;
    };
    indexes: { 'byUsuarioId': number };
  };
  deudas: {
    key: number;
    value: {
      id?: number;
      terrenoId: number;
      monto: number;
      fechaVencimiento: string;
      estado: string;
    };
    indexes: { 'byTerrenoId': number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AsistenteService {
  private db!: IDBPDatabase<PagoTerrenosDB>;
  private usuariosCache: any[] = [];
  private terrenosCache: any[] = [];
  private deudasCache: any[] = [];

  constructor() { }

  /**
   * Inicializa la base de datos IndexedDB
   */
  async inicializarDB() {
    this.db = await openDB<PagoTerrenosDB>('PagoTerrenosDB', 1, {
      upgrade(db) {
        // Crear store para usuarios
        const usuarioStore = db.createObjectStore('usuarios', {
          keyPath: 'id',
          autoIncrement: true
        });
        usuarioStore.createIndex('byNombre', 'nombre');

        // Crear store para terrenos
        const terrenoStore = db.createObjectStore('terrenos', {
          keyPath: 'id',
          autoIncrement: true
        });
        terrenoStore.createIndex('byUsuarioId', 'usuarioId');

        // Crear store para deudas
        const deudaStore = db.createObjectStore('deudas', {
          keyPath: 'id',
          autoIncrement: true
        });
        deudaStore.createIndex('byTerrenoId', 'terrenoId');
      }
    });
    await this.actualizarCache();
  }

  /**
   * Actualiza la caché local con datos de la base de datos
   */
  private async actualizarCache() {
    try {
      this.usuariosCache = await this.db.getAll('usuarios');
      this.terrenosCache = await this.db.getAll('terrenos');
      this.deudasCache = await this.db.getAll('deudas');

      // Ordenar datos
      this.usuariosCache.sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.terrenosCache.sort((a, b) => a.direccion.localeCompare(b.direccion));
      this.deudasCache.sort((a, b) => new Date(b.fechaVencimiento).getTime() - new Date(a.fechaVencimiento).getTime());
    } catch (error) {
      console.error('Error actualizando caché:', error);
      throw error;
    }
  }

  // ============ CRUD para Usuarios ============
  async agregarUsuario(usuario: { nombre: string, telefono: string, direccion: string }) {
    if (!usuario.nombre || !usuario.telefono) {
      throw new Error('Nombre y teléfono son requeridos');
    }

    try {
      await this.db.add('usuarios', usuario);
      await this.actualizarCache();
    } catch (error) {
      console.error('Error agregando usuario:', error);
      throw error;
    }
  }

  async obtenerUsuarios(): Promise<any[]> {
    return this.usuariosCache;
  }

  async obtenerUsuarioPorId(id: number): Promise<any> {
    const usuario = this.usuariosCache.find(u => u.id === id);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
  }

  async actualizarUsuario(usuario: { id: number, nombre: string, telefono: string, direccion: string }) {
    if (!usuario.id) throw new Error('ID de usuario es requerido');

    try {
      await this.db.put('usuarios', usuario);
      await this.actualizarCache();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  async eliminarUsuario(id: number) {
    try {
      // Verificar si el usuario tiene terrenos asociados
      const terrenosAsociados = this.terrenosCache.some(t => t.usuarioId === id);
      if (terrenosAsociados) {
        throw new Error('No se puede eliminar, el usuario tiene terrenos asociados');
      }

      await this.db.delete('usuarios', id);
      await this.actualizarCache();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // ============ CRUD para Terrenos ============
  async agregarTerreno(terreno: { usuarioId: number, direccion: string, area: string, precio: number }) {
    // Validaciones
    if (!terreno.usuarioId) throw new Error('ID de usuario es requerido');
    if (!terreno.direccion) throw new Error('Dirección es requerida');
    
    try {
      // Verificar que el usuario existe
      const usuarioExiste = this.usuariosCache.some(u => u.id === terreno.usuarioId);
      if (!usuarioExiste) {
        throw new Error('El cliente seleccionado no existe');
      }

      await this.db.add('terrenos', terreno);
      await this.actualizarCache();
    } catch (error) {
      console.error('Error agregando terreno:', error);
      throw error;
    }
  }

  async obtenerTerrenos(): Promise<any[]> {
    return this.terrenosCache;
  }

  async obtenerTerrenoPorId(id: number): Promise<any> {
    const terreno = this.terrenosCache.find(t => t.id === id);
    if (!terreno) throw new Error('Terreno no encontrado');
    return terreno;
  }

  async obtenerTerrenosPorUsuario(usuarioId: number): Promise<any[]> {
    return this.terrenosCache.filter(t => t.usuarioId === usuarioId);
  }

  async actualizarTerreno(terreno: { id: number, usuarioId: number, direccion: string, area: string, precio: number }) {
    if (!terreno.id) throw new Error('ID de terreno es requerido');

    try {
      await this.db.put('terrenos', terreno);
      await this.actualizarCache();
    } catch (error) {
      console.error('Error actualizando terreno:', error);
      throw error;
    }
  }

  async eliminarTerreno(id: number) {
    try {
      // Verificar si el terreno tiene deudas asociadas
      const deudasAsociadas = this.deudasCache.some(d => d.terrenoId === id);
      if (deudasAsociadas) {
        throw new Error('No se puede eliminar, el terreno tiene deudas asociadas');
      }

      await this.db.delete('terrenos', id);
      await this.actualizarCache();
    } catch (error) {
      console.error('Error eliminando terreno:', error);
      throw error;
    }
  }

  // ============ CRUD para Deudas ============
  async agregarDeuda(deuda: { terrenoId: number, monto: number, fechaVencimiento: string, estado: string }) {
    // Validaciones
    if (!deuda.terrenoId) throw new Error('ID de terreno es requerido');
    if (!deuda.monto || deuda.monto <= 0) throw new Error('Monto debe ser positivo');

    try {
      // Verificar que el terreno existe
      const terrenoExiste = this.terrenosCache.some(t => t.id === deuda.terrenoId);
      if (!terrenoExiste) {
        throw new Error('El terreno seleccionado no existe');
      }

      await this.db.add('deudas', {
        ...deuda,
        fechaVencimiento: deuda.fechaVencimiento || new Date().toISOString(),
        estado: deuda.estado || 'Pendiente'
      });
      await this.actualizarCache();
    } catch (error) {
      console.error('Error agregando deuda:', error);
      throw error;
    }
  }

  async obtenerDeudas(): Promise<any[]> {
    return this.deudasCache;
  }

  async obtenerDeudaPorId(id: number): Promise<any> {
    const deuda = this.deudasCache.find(d => d.id === id);
    if (!deuda) throw new Error('Deuda no encontrada');
    return deuda;
  }

  async obtenerDeudasPorTerreno(terrenoId: number): Promise<any[]> {
    return this.deudasCache.filter(d => d.terrenoId === terrenoId);
  }

  async actualizarDeuda(deuda: { id: number, terrenoId: number, monto: number, fechaVencimiento: string, estado: string }) {
    if (!deuda.id) throw new Error('ID de deuda es requerido');

    try {
      await this.db.put('deudas', deuda);
      await this.actualizarCache();
    } catch (error) {
      console.error('Error actualizando deuda:', error);
      throw error;
    }
  }

  async eliminarDeuda(id: number) {
    try {
      await this.db.delete('deudas', id);
      await this.actualizarCache();
    } catch (error) {
      console.error('Error eliminando deuda:', error);
      throw error;
    }
  }

  // ============ Métodos de ayuda ============
  getUsuarioNombre(id: number): string {
    const usuario = this.usuariosCache.find(u => u.id === id);
    return usuario ? `${usuario.nombre} (${usuario.telefono})` : 'Cliente no encontrado';
  }

  getTerrenoInfo(id: number): { usuarioId: number, direccion: string, usuarioInfo: string } {
    const terreno = this.terrenosCache.find(t => t.id === id);
    if (!terreno) {
      return {
        usuarioId: 0,
        direccion: 'Terreno no encontrado',
        usuarioInfo: ''
      };
    }

    return {
      usuarioId: terreno.usuarioId,
      direccion: terreno.direccion,
      usuarioInfo: this.getUsuarioNombre(terreno.usuarioId)
    };
  }

  formatFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  getDeudaDisplay(deuda: any): string {
    const terrenoInfo = this.getTerrenoInfo(deuda.terrenoId);
    return `${terrenoInfo.usuarioInfo} - ${terrenoInfo.direccion} | $${deuda.monto} | ${this.formatFecha(deuda.fechaVencimiento)} | ${deuda.estado}`;
  }
}