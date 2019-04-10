import Fx from '../fx/fx.js';
import Scrap from '../scrap/scrap.js';
import { BehaviorSubject } from 'rxjs';
import WS from "../websocket/websocket.js";
import DDBB from "../firebase/firebase.js";

export default class Trade {
  constructor() {
    this.firstTime = true;
    this.ws = WS;
    this.activeTrades = {};
    this.activeTradesObservable = new BehaviorSubject();     
    this.signals = {};
    
    this.configureFx();
    //this.configureScrap();
    this.configureActiveOrders();
  }
  getSignalsDDBB() {
    DDBB.allActiveSignalsObservable.subscribe(( actives => {
      this.activeTrades = actives;      
      this.formatSignal(this.activeTrades, false)
    }).bind(this))

    DDBB.allNewSignalsObservable.subscribe(( signals => {
      this.signals = signals;
      this.formatSignal(this.signals, false)
    }).bind(this))
  }
  setSignal(par, signal) {
    DDBB.setNewSignal(par, signal)   
  }
  checkIfNewActiveOrder() {

    for( let par in this.signals) {   
      for (let id in this.signals[par]) {
        let signal = this.signals[par][id];
        if(this.activePars[par]) {
          if ( signal && this.activePars && this.activePars[par] &&(signal.order === 'SELL' && signal.entry <= this.activePars[par][signal.order] )||
            (signal.order === 'BUY' && signal.entry >= this.activePars[par][signal.order] ) ) {
              DDBB.setActiveSignal(signal, id );
              this.signals && this.activeTrades && !this.signals[par] && !this.activeTrades[par]  && this.fx.deletePar(signal.par);
             
          }
        }

      }
    }   
  }
  checkIfTPorSL() {
    for( let par in this.activeTrades) {   
     for (let id in this.activeTrades[par]) {
        let signal 
        try {
          signal = this.activeTrades[par][id];
        }catch(e) {
          break;
        }
        if(this.activePars[par] && signal ){
          
          switch(signal.order) {
            case 'BUY':
              signal.max = signal.max  || signal.entry;
              signal.max < this.activePars[par]['BUY'] && (signal.max = this.activePars[par]['BUY']);
              if(this.activePars[par]['BUY'] >= signal.tp){
                 DDBB.setHistoricalSignal(signal, id, 'tp' )
                !this.signals[par] && !this.activeTrades[par]  && this.fx.deletePar(signal.par);

                 break;
              }
              if(this.activePars[par]['BUY'] <= signal.sl ) {
                DDBB.setHistoricalSignal(signal, id, 'sl' )  
                !this.signals[par] && !this.activeTrades[par]  && this.fx.deletePar(signal.par);

                break;             
              }

            break;
            case 'SELL':
              signal.max = signal.max  || signal.entry;
              signal.max > this.activePars[par]['SELL'] && (signal.max = this.activePars[par]['SELL']);
              if(this.activePars[par]['SELL'] <= signal.tp){
                 DDBB.setHistoricalSignal(signal, id, 'tp' )
                !this.signals[par] && !this.activeTrades[par]  && this.fx.deletePar(signal.par);

                 break;
              }
              if(this.activePars[par]['SELL'] >= signal.sl ) {

                DDBB.setHistoricalSignal(signal, id, 'sl' ) 
                !this.signals[par] && !this.activeTrades[par]  && this.fx.deletePar(signal.par);

                break;              
              }
          }          
        }        
      }
    }   

  }
  configureFx() {
    this.activePars;
    this.fx = new Fx();
    this.fx.activeParsObservable.subscribe( (recievedPars => {
      this.firstTime && this.getSignalsDDBB();
      this.firstTime = false;
      if(recievedPars && Object.keys(recievedPars).length > 0) {       
          this.ws.connection && this.ws.sendToClient(JSON.stringify(recievedPars))
          console.log('pars--> \n', recievedPars, '\n')
          this.activePars = recievedPars;   
          this.signals && this.checkIfNewActiveOrder();
          this.activeTrades && this.checkIfTPorSL();        
      }
    }).bind(this))
  }
  configureScrap() {
    this.scrap = new Scrap();
    this.scrap.activeSignals.subscribe((signal => {
      if (signal) {
        this.formatSignal(signal);       
      }
    }).bind(this));   
  }
  configureActiveOrders() {
    this.activeTradesObservable.subscribe( trade => {
      if( trade ) {
        this.activeTrades[trade.par] = this.activeTrades[trade.par] || [];
        this.activeTrades[trade.par].push(trade)
      } 
    })
  }
  formatSignal(signal, insertInDDBB = true) {

    for(let par in signal) {
      this.fx.getPar( par );
      insertInDDBB && this.setSignal(par, signal[par])
    }
  }
}