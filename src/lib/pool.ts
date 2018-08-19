import { Error } from './error';
import { Client } from './client';
import { Item } from './item';
import { Methods } from './methods';
import { Config } from './config';

import * as debug from 'debug';
const log = debug('easy-pool');

export class Pool<T, A> {

  private waitingClients : Client<T, A>[] = [];
  private availableItems : Item<T>[] = [];
  private acquiredItems : Item<T>[] = [];

  private onAcquiring  = false;

  constructor(
    private methods : Methods<T, A>, 
    private config : Config
  ){
    this.preloadItems();
    this.findNotReleasesItems();
  }

  private preloadItems(){
    if(this.availableItems.length + this.acquiredItems.length < this.config.min){
      this.methods.create( item => {
        let poolItem = new Item(item);
        this.availableItems.push(poolItem);
        log(`Se ha precargado el item ${poolItem.id}`);
        setTimeout(() => { this.preloadItems(); }, 0);
      });
    }
  }

  private findNotReleasesItems(){
    setInterval(() => {
      for(let i = 0; i < this.acquiredItems.length; i++){
        if(this.acquiredItems[i].acquiredTime() > this.config.releaseAcquiredAfter){
          let poolItem = this.acquiredItems.splice(i, 1)[0];
          log(`El item ${poolItem.id} ha sido destruido por permanecer demasiado tiempo retenido`);
          this.methods.destroy(poolItem.item);
        }
      }
    }, 1000);
  }

  private realAcquire(){
    //Sino hay clientes en espera... 
    if(this.waitingClients.length == 0){
      //terminar adquisicion de items
      this.onAcquiring = false;
      log('No hay clientes en espera, terminando proceso de adquisicion');
      return;
    }

    //Revisar el tiempo de espera de los clientes
    while(this.waitingClients[0].waitingTime() > this.config.waitingTimeOut){
      log(`client ${this.waitingClients[0].id} superó el tiempo de espera`);
      this.waitingClients.shift().errorListener(new Error('Acquiring TimeOut'));
      if(this.waitingClients.length == 0){
        this.onAcquiring = false;
        log('No hay clientes en espera, terminando proceso de adquisicion');
        return;
      }
    }

    let client = this.waitingClients[0];

    //Si hay items disponibles ....
    if(this.availableItems.length > 0){
      let poolItem = this.availableItems[0];
      //Si está definido un metodo de reuso...
      if(this.methods.reuse){
        //Si se proveen argumentos para el reuso...
        if(client.args){
          //Reusar
          poolItem.item = this.methods.reuse(poolItem.item, client.args);
          log(`Item ${poolItem.id} ha sido reusado`);
        }
        else{
          //Sino hay argumentos, Notificar error en la programación
          throw new Error( 'Provide args for reuse method');
        }
      }
      //Entregar item
      this.availableItems.shift()
      poolItem.setAcquired();
      this.acquiredItems.push(poolItem);
      this.waitingClients.shift();    
      client.listener(poolItem.item);
      log(`Item ${poolItem.id} entregado al cliente ${client.id}`);
      //Llamar nueva adquisicion
      setTimeout(() => {this.realAcquire()}, 0);
    }
    //Si no hay items disponibles, pero aun no se alcanza el maximo...
    else if(this.acquiredItems.length < this.config.max){
      //Crear
      this.methods.create(item => {
        let poolItem = new Item(item);
        log(`se ha creado el Item ${poolItem.id}`);
        //Entregar item
        poolItem.setAcquired();
        this.acquiredItems.push(poolItem);
        this.waitingClients.shift();
        client.listener(poolItem.item);
        log(`Item ${poolItem.id} entregado al cliente ${client.id}`);
        //Llamar nueva adquisicion
        setTimeout(() => {this.realAcquire()}, 0);
      }, client.args)
    }
    //Si definitivamente, no hay nada que hacer...
    else{
      //Volver a intentar en un tiempo prudente
      setTimeout(() => {this.realAcquire()}, 100);
    }
  }

  acquire(listener : (item : T) => void, errorListener : (error : Error) => void, args ?: A){
    if(this.waitingClients.length < this.config.maxWaitingClients){
      let poolClient = new Client(listener, errorListener, args);
      log(`Se ha Creado el Cliente ${poolClient.id}`);
      this.waitingClients.push(poolClient);
      if(!this.onAcquiring){
        this.onAcquiring = true;
        this.realAcquire();
      }
    }
    else{
      errorListener(new Error('To Many Waiting Clients'));
      log(`Cliente rechazado por superar el maximo numero de clientes en espera`);
    }
  }

  release(item : T){
    for(let i = 0; i < this.acquiredItems.length; i++){
      if(this.acquiredItems[i].item == item){
        let poolItem = this.acquiredItems.splice(i, 1)[0];
        poolItem.setRelesed();
        this.availableItems.push(poolItem);
        log(`Se ha liberado el item ${poolItem.id}`);
        while(
          this.availableItems.length > this.config.min && 
          this.availableItems[0].idleTime() > this.config.destroyIdleAfter
        ){
          let toDestroyItem = this.availableItems.shift();
          this.methods.destroy(toDestroyItem.item);
          log(`Se ha destruido el item ${toDestroyItem.id} por superar el tiempo de ocio`);
        }
      }
    }
  }

}