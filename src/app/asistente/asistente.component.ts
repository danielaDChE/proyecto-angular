import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenteService } from '../servicios/asistente.service';

@Component({
  selector: 'app-asistente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistente.component.html',
  styleUrls: ['./asistente.component.css']
})
export class AsistenteComponent implements OnInit {
  activeTab: string = 'usuarios';
  usuarios: any[] = [];
  terrenos: any[] = [];
  deudas: any[] = [];
  nuevoUsuario: any = {};
  nuevoTerreno: any = {};
  nuevaDeuda: any = {};
  editando: any = {};
  errorMessage: string = '';

  constructor(public asistenteService: AsistenteService) {}

  async ngOnInit() {
    try {
      await this.asistenteService.inicializarDB();
      await this.cargarDatos();
    } catch (error) {
      this.errorMessage = 'Error al inicializar la base de datos';
      console.error(error);
    }
  }

  async cargarDatos() {
    try {
      this.usuarios = await this.asistenteService.obtenerUsuarios();
      this.terrenos = await this.asistenteService.obtenerTerrenos();
      this.deudas = await this.asistenteService.obtenerDeudas();
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Error al cargar los datos';
      console.error(error);
    }
  }

  getUsuarioNombre(id: number): string {
    return this.asistenteService.getUsuarioNombre(id);
  }

  cambiarTab(tab: string) {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  async agregarUsuario() {
    try {
      if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.telefono) {
        this.errorMessage = 'Nombre y teléfono son requeridos';
        return;
      }
      
      await this.asistenteService.agregarUsuario(this.nuevoUsuario);
      this.nuevoUsuario = {};
      await this.cargarDatos();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al agregar usuario';
      console.error(error);
    }
  }

  async agregarTerreno() {
    try {
      if (!this.nuevoTerreno.usuarioId) {
        this.errorMessage = 'Debe seleccionar un cliente';
        return;
      }
      this.nuevoTerreno.usuarioId = Number(this.nuevoTerreno.usuarioId);
      if (!this.nuevoTerreno.direccion) {
        this.errorMessage = 'La dirección es requerida';
        return;
      }

      await this.asistenteService.agregarTerreno(this.nuevoTerreno);
      this.nuevoTerreno = {};
      await this.cargarDatos();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al agregar terreno';
      console.error(error);
    }
  }

  async agregarDeuda() {
    try {
      this.nuevaDeuda.terrenoId = Number(this.nuevaDeuda.terrenoId); 
      if (!this.nuevaDeuda.terrenoId) {
        this.errorMessage = 'Debe seleccionar un terreno';
        return;
      }
      if (!this.nuevaDeuda.monto || this.nuevaDeuda.monto <= 0) {
        this.errorMessage = 'Ingrese un monto válido';
        return;
      }

      // Asegurar formato de fecha
      if (!this.nuevaDeuda.fechaVencimiento) {
        this.nuevaDeuda.fechaVencimiento = new Date().toISOString().split('T')[0];
      }

      await this.asistenteService.agregarDeuda(this.nuevaDeuda);
      this.nuevaDeuda = {};
      await this.cargarDatos();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al agregar deuda';
      console.error(error);
    }
  }

  async eliminarUsuario(id: number) {
    try {
      await this.asistenteService.eliminarUsuario(id);
      await this.cargarDatos();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al eliminar usuario';
      console.error(error);
    }
  }

  async eliminarTerreno(id: number) {
    try {
      await this.asistenteService.eliminarTerreno(id);
      await this.cargarDatos();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al eliminar terreno';
      console.error(error);
    }
  }

  async eliminarDeuda(id: number) {
    try {
      await this.asistenteService.eliminarDeuda(id);
      await this.cargarDatos();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al eliminar deuda';
      console.error(error);
    }
  }

  editar(item: any, tipo: string) {
    this.editando = { ...item, tipo };
    this.errorMessage = '';
  }

  async guardarEdicion() {
    try {
      if (this.editando.tipo === 'usuario') {
        if (!this.editando.nombre || !this.editando.telefono) {
          this.errorMessage = 'Nombre y teléfono son requeridos';
          return;
        }
        await this.asistenteService.actualizarUsuario(this.editando);
      } else if (this.editando.tipo === 'terreno') {
        if (!this.editando.usuarioId || !this.editando.direccion) {
          this.errorMessage = 'Cliente y dirección son requeridos';
          return;
        }
        await this.asistenteService.actualizarTerreno(this.editando);
      } else if (this.editando.tipo === 'deuda') {
        if (!this.editando.terrenoId || !this.editando.monto) {
          this.errorMessage = 'Terreno y monto son requeridos';
          return;
        }
        await this.asistenteService.actualizarDeuda(this.editando);
      }
      
      this.editando = {};
      await this.cargarDatos();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al guardar cambios';
      console.error(error);
    }
  }

  cancelarEdicion() {
    this.editando = {};
    this.errorMessage = '';
  }

  formatFecha(fecha: string): string {
    return this.asistenteService.formatFecha(fecha);
  }

  getDeudaDisplay(deuda: any): string {
    return this.asistenteService.getDeudaDisplay(deuda);
  }
}