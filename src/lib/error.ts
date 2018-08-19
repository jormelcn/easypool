
export class Error {
  
  constructor(
    public message : string,
    public code ?: number,
    public trace ?: string
  ){
    
  }

  public addTrace(trace : string) : void{
    this.trace = this.trace ? `${this.trace}:${trace}` : trace;
  }

}