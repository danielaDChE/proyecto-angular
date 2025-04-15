import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsistenteService {
  private dbNombre = 'EscuelaSabaticaDB';
  private objetoAsistente = 'asistentes'; // tabla asistente
  private objetoMinisterio = 'ministerio'; // tabla ministerios
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

        if(!this.db.objectStoreNames.contains(this.objetoMinisterio)){
          this.db.createObjectStore(this.objetoMinisterio, {keyPath: 'id', autoIncrement: true });
        }
      
    }

    request.onerror = (error) =>{
        console.log('Error al abrir la DB',error);
    }      
  }
 
  guardarAsistente( asistente : {nombre : string; edad: number | null; ministerioId : number | null}) : Promise<void>{
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

  agregarMinisterio( ministerio : {nombre : string; descripcion: string; }) : Promise<void>{
    return new Promise((satisfactorio, rechazo) => {
      const trs =  this.db.transaction([this.objetoMinisterio], 'readwrite');
      const objetoMinisterio = trs.objectStore(this.objetoMinisterio);
      objetoMinisterio.add(ministerio);
      trs.oncomplete = () => satisfactorio();
      trs.onerror = () => rechazo(trs.error);

    });
  }

  obtenerMinisterios () : Promise<any[]>{
    return new Promise((satisfactorio, rechazo) => {
      const trs =  this.db.transaction([this.objetoMinisterio], 'readonly');
      const objetoMinisterio= trs.objectStore(this.objetoMinisterio);
      const request =  objetoMinisterio.getAll();
      request.onsuccess = () => satisfactorio(request.result);
      request.onerror = () => console.log("existe un error");
    });
  }
}
