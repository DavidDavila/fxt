var firebase = require("firebase-admin");
import { BehaviorSubject } from 'rxjs';

var serviceAccount = require("./serviceAccountKey.json");

export class FirebaseServer {
  
  constructor() {    
    this.allNewSignals;
    this.allHistoricalSignals;
    this.allActiveSignals;
    this.allNewSignalsObservable = new BehaviorSubject() ;
    this.allActiveSignalsObservable =  new BehaviorSubject();
    this.allHistoricalSignalsObservable =  new BehaviorSubject();
    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
      databaseURL: "https://forex-c0079.firebaseio.com/"
    });
    var db = firebase.database();
    this.newSignals = db.ref("new-signals");
    this.activeSignals = db.ref("active-signals");
    this.historicalSignals = db.ref("historical-signals");

    this.newSignals.on("value", ((snapshot)=>{
      this.allNewSignals = snapshot.val() || {};     
      this.allNewSignalsObservable.next(this.allNewSignals)

    }).bind(this))

    this.activeSignals.on("value", ((snapshot)=>{
      this.allActiveSignals = snapshot.val() || {};     
      this.allActiveSignalsObservable.next(this.allActiveSignals)

    }).bind(this))

    this.historicalSignals.on("value", ((snapshot)=>{
      this.allHistoricalSignals = snapshot.val() || {};     
      this.allHistoricalSignalsObservable.next(this.allHistoricalSignals)

    }).bind(this))
  }
  setNewSignal(par, signal){    
    signal.date = new Date().toGMTString(); 
    if(!this.allNewSignals[signal.par] || this.allNewSignals[signal.par].length === 0) {
      let data = {}
      data[signal.par] = [];
      this.newSignals.child(signal.par).set({})
    } 
    this.newSignals.child(signal.par).push(signal);
  }
  setActiveSignal(signal, id){   
    signal.activeDate = new Date().toGMTString(); 
    if(!this.allActiveSignals[signal.par] || this.allActiveSignals[signal.par].length === 0) {
      let data = {}
      data[signal.par] = [];
      this.activeSignals.child(signal.par).set({})
    } 
    this.activeSignals.child(signal.par).push(signal);
    this.deleteNewSignal(signal.par, id)
   
  }

  deleteNewSignal(par, id) {    
    this.newSignals.child(par).child(id).remove();
    
  }
  setHistoricalSignal(signal, id, hit){
    signal.hit = hit;
    signal.hitDate = new Date().toGMTString(); 
    if(!this.allHistoricalSignals[signal.par] || this.allHistoricalSignals[signal.par].length === 0) {
      let data = {}
      data[signal.par] = [];
      this.historicalSignals.child(signal.par).set({})
    } 
    this.historicalSignals.child(signal.par).push(signal);
    this.deleteActiveSignal(signal.par, id)   
  }
  deleteActiveSignal(par, id) {
    this.activeSignals.child(par).child(id).remove();    
  }
}
const DDBB = new FirebaseServer();
export default DDBB;
