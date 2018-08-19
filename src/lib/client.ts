import { Error } from './error';

import * as debug from 'debug';
const log = debug('easy-pool:client');

export class Client<T, A> {
  
  static count = 0;

  private requestTime : number;
  public id;

  constructor(
    public listener : (item : T) => void,
    public errorListener : (error : Error) =>void,  
    public args ?: A
  ){
    this.requestTime = Date.now();
    Client.count += 1;
    this.id = Client.count;
  }

  waitingTime() : number{
    return Date.now() - this.requestTime;
  }

}