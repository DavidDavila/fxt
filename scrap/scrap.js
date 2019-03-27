import Foresignal from "./foresignal/foresignal.js";
import Wetalktrade from "./wetalktrade/wetalktrade.js";
import { BehaviorSubject } from 'rxjs';


export default class Scrap {
  constructor() {
    this.activeSignals = new BehaviorSubject(); 

    this.Foresignal = new Foresignal();
    this.Foresignal.activeSignals.subscribe( val => {
      this.controlSignal(val)
    })
   /* this.Wetalktrade = new Wetalktrade();
    this.Wetalktrade.activeSignals.subscribe( val => {
      this.controlSignal(val)
    })*/
  } 
  controlSignal(val) {
    if (val && Object.keys(val).length) {
      this.activeSignals.next( val )
    }
  }
}