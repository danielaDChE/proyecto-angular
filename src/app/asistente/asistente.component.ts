import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenteService } from '../servicios/asistente.service';

@Component({
  selector: 'es-asistente',
  imports: [FormsModule, CommonModule],
  templateUrl: './asistente.component.html',
  styleUrl: './asistente.component.css'
})
export class AsistenteComponent {
  asistente = signal({
    nombre : '',
    edad : null
  });
  asistentes = signal<any[]>([]);

  constructor(private dbServicio : AsistenteService) {
    this.cargarAsistentes();
    
  }

  registrarAsistencia() {
    const datos = this.asistente(); 
    if (datos.nombre && datos.edad !== null) {
      this.dbServicio.guardarAsistente({nombre : datos.nombre, edad : datos.edad})
        .then(() => {
            this.asistente.set({ nombre : '' , edad : null});
            this.cargarAsistentes();
            // console.log("registro correctamente ------");
        }).catch(() => console.log("error....."));
    }
  }

  cargarAsistentes() {
    this.dbServicio.obtenerAsistentes()
      .then((lista) => { this.asistentes.set(lista) });
  }
}
