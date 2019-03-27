import {get} from 'https';
import { Observable, BehaviorSubject } from 'rxjs';

export default class Fx {
    constructor() {
      this.activePars = {};
      this.activeParsObservable = new BehaviorSubject();
      this.dataObservable = new Observable(this.getApiData.bind(this));
      this.data;
      try {
        this.init();
      }catch(e) {
        this.init();        
      }
    }
    async setInterval() {
      return new Promise((resolve, reject)=>{
        try{
          const req = get('https://ratesjson.fxcm.com/DataDisplayer?callback=angular.callbacks._3', (res)=> {
            res.on('data', (chunk) => {            
                let data = chunk.toString();
                data = data.trim().replace(/(?:\r\n|\r|\n)/g, '').replace('angular.callbacks._3(','').replace(');','').replace(/,}/g,'}');
                try {
                    JSON.parse(data);
                } catch (e) {               
                    return false;
                }              
                data = JSON.parse(data);
                return resolve(data['Rates']);             
            });

            res.on('end', () => {
            });
          })

          req.on('error', (e) => {
          });
          req.end();
        } catch(e) {
          return resolve({});  
        }   
      }) 
    }

    getApiData(observer) { 
      setInterval(async ()=> {
        let result = await this.setInterval();
        if (result != this.data) {

           observer.next(result)
        }
      },100)
    }

    updateActivePars() {

      Object.keys(this.activePars).forEach( parName => {
        this.getPar(parName);
      })

    }
    deletePar(name) {
      delete this.activePars[name]
    }
    getPar(name) {
        name = name.toUpperCase();
        let crudePar = this.data && (this.data.filter(par => {
          return par.Symbol.toUpperCase() === name;
        }))
        if( crudePar && crudePar[0]) {
          let formattedPar = {
              BUY  : Number(crudePar[0].Ask),
              SELL  : Number(crudePar[0].Bid)
          }
          if(JSON.stringify(this.activePars[name]) !== JSON.stringify(formattedPar)) {
            this.activePars[name] = formattedPar;
            this.activeParsObservable.next(this.activePars)

          }
        }
       
           
    }
    async init() {
      this.dataObservable.subscribe( data =>{
        this.data = data;
        this.updateActivePars();
      })
    }
}