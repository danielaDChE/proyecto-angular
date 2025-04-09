import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsistenteComponent } from './asistente/asistente.component';

@Component({
  selector: 'app-root',
  imports: [AsistenteComponent], //RouterOutlet, 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tecinter-angular';
}
