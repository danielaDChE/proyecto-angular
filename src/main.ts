import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { AsistenteComponent } from './app/asistente/asistente.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', component: AsistenteComponent }
    ]),
    provideAnimations(),
    importProvidersFrom(FormsModule)
  ]
}).catch(err => console.error(err));