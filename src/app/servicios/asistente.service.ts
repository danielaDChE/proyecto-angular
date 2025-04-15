import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsistenteService {
  private dbNombre = 'EscuelaSabaticaDB';
  private objetoAsistente = 'asistentes';
  private db! : IDBDatabase;
  constructor() { 
    this.initDB();
  }

  initDB (){
    const request = indexedDB.open(this.dbNombre, 1);   
    request.onsuccess = () => {
        this.db = request.result;
        console.log("Base de datos abierta", this.db);
    }

    request.onupgradeneeded = (event : any) => {
        this.db = event.target.result;
        if(!this.db.objectStoreNames.contains(this.objetoAsistente)){
          this.db.createObjectStore(this.objetoAsistente, {keyPath: 'id', autoIncrement: true });
        }
      
    }

    request.onerror = (error) =>{
        console.log('Error al abrir la DB',error);
    }      
  }
 
  guardarAsistente( asistente : {nombre : string; edad: string}) : Promise<void>{
    return new Promise((satisfactorio, rechazo) => {
      const trs =  this.db.transaction([this.objetoAsistente], 'readwrite');
      const objetoAsistente = trs.objectStore(this.objetoAsistente);
      objetoAsistente.add(asistente);
      trs.oncomplete = () => satisfactorio();
      trs.onerror = () => rechazo(trs.error);

    });
  }

  obtenerAsistentes () : Promise<any[]>{
    return new Promise((satisfactorio, rechazo) => {
      const trs =  this.db.transaction([this.objetoAsistente], 'readonly');
      const objetoAsistente = trs.objectStore(this.objetoAsistente);
      const request =  objetoAsistente.getAll();
      request.onsuccess = () => satisfactorio(request.result);
      request.onerror = () => console.log("existe un error");
    });
  }
}
