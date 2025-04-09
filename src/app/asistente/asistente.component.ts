import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'es-asistente',
  imports: [FormsModule, CommonModule],
  templateUrl: './asistente.component.html',
  styleUrl: './asistente.component.css'
})
export class AsistenteComponent {
  asistente = signal({
    nombre : '',
    edad : ''
  });

  registrarAsistencia() {
    console.log('asistente registrado', this.asistente());
  }
}
