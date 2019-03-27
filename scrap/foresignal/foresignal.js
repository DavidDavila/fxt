const puppeteer = require('puppeteer');
import { BehaviorSubject } from 'rxjs';

export default class Foresignal {
  constructor() {
    this.signals = {};
    this.activeSignals = new BehaviorSubject(); 
    this.openWeb();
  }  
  async openWeb() {
      const browser = await puppeteer.launch({ devtools: true, headless: true});
      const page = await browser.newPage();
      await page.setViewport({ width: 2920, height: 1768 })
      await page.goto('https://foresignal.com/es/login');
      await page.waitForSelector('input[name="user_name"]')
      this.completeRegisterForm(page)
      //await browser.close();
  }

  async completeRegisterForm(page) {
    var data = {
      user: {selector: 'input[name="user_name"]', value: 'lapidavid'},
      password: {selector: 'input[type="password"]', value: 'arrecife77'}
    }
    for(let label in data) {
      await page.type(data[label].selector, data[label].value)
    }
    await page.evaluate((data) => {
      document.getElementsByTagName('form')[0].submit();
    
    },data);
      await page.waitForSelector('.signal-header');
      //await page.screenshot({path: 'C:/Users/david/Desktop/telegram/scrap/captures/mail.png'});
      this.scrap(page);
  }  
  async scrap(page) {
    let signalsObject = await page.evaluate((data) => {
      signals = {}
      document.querySelectorAll('.signal-cell').forEach( signalCell => {
        let par = signalCell.querySelector('a').text;
        par = par.trim().replace(/\//,'');
        canScrap =  signalCell.querySelector('.signal-status');
        if( canScrap ) {
          signals[par] = {};
          signals[par].order = canScrap.textContent.trim().toUpperCase() 

          if( signals[par].order !== "REALIZADO" && signals[par].order !== "CANCELADO" ) {
            signals[par].order = signals[par].order === 'VENTA' ? 'SELL' : 'BUY';
            signals[par].provider = 'Foresignal';
            signals[par].par = par;
            signals[par].entry = signalCell.querySelectorAll('.signal-color')[4].textContent? Number(signalCell.querySelectorAll('.signal-color')[4].textContent.trim().split(';')[1].replace(',','.')) : '';
            signals[par].tp = signalCell.querySelectorAll('.signal-color')[5].textContent? Number(signalCell.querySelectorAll('.signal-color')[5].textContent.trim().split(';')[1].replace(',','.')) : '';
            signals[par].sl = signalCell.querySelectorAll('.signal-color')[6].textContent? Number(signalCell.querySelectorAll('.signal-color')[6].textContent.trim().split(';')[1].replace(',','.')) : '';          
          } else {
            delete signals[par];
          }
        }
       
      })
      console.log(signals)
      return signals;
    })
    console.log(signalsObject)
    this.activeSignals.next(signalsObject);
  }
}