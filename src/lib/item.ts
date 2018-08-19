export class Item<T> {
  
  static count = 0;
  private relesedTime : number;
  private acquisitionTime : number;
  public id : number;
  
  constructor(public item : T){
    Item.count += 1;
    this.id = Item.count;
  }

  setAcquired(){
    this.relesedTime = null;
    this.acquisitionTime = Date.now();
  }

  setRelesed(){
    this.relesedTime = Date.now();
    this.acquisitionTime = null;
  }

  idleTime(){
    return this.relesedTime ? Date.now() - this.relesedTime : 0;
  }

  acquiredTime(){
    return this.acquisitionTime ? Date.now() - this.acquisitionTime : 0;
  }

}