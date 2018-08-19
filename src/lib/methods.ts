
export class Methods<T, A> {

  create : (listener : (item : T) => void, args ?: A) => void;
  destroy : (item : T) => void;
  reuse ?: (item : T, args ?: A) => T;
  
}