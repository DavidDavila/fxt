const puppeteer = require('puppeteer');
import { BehaviorSubject } from 'rxjs';

export default class Wetalktrade {
  constructor() {
    this.signals = {};
    this.activeSignals = new BehaviorSubject(); 
    this.openWeb();
  }  
  async openWeb() {
      const browser = await puppeteer.launch({ devtools: false});
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 768 })
      await page.goto('https://signal.wetalktrade.com/FreeSignal', {waitUntil: 'load', timeout: 10000});
      try {
        await page.waitForSelector('input[name="email"]')
      } catch(e) {  
        await page.waitFor(100); 
        contiuneButton = await page.evaluate((data) => {
          try {
            console.log('da')
            return document.querySelector('body > div.md-dialog-container.ng-scope > md-dialog > md-dialog-actions > button.md-primary.md-confirm-button.md-button.md-ink-ripple.md-default-theme').click();

          }catch(e) {
              return false
          }
          
        },data);
        
        if( !contiuneButton) {
            console.log('reloading');
            await browser.close()
            this.openWeb()
        }        
      }
      this.completeRegisterForm(page,browser)
      //await browser.close();
  }

  async completeRegisterForm(page, browser) {
    var data = {
      user: {selector: 'input[name="email"]', value: 'blendmode19@gmail.com'},
      password: {selector: 'input[type="password"]', value: 'ZXCzxc123+'}
    }
    for(let label in data) {
      await page.type(data[label].selector, data[label].value)
    }
    await page.evaluate((data) => {
      document.querySelector('#LoginSubmit').click();
    
    },data);
      try {
        await page.waitForSelector('#DataTables_Table_0 tbody tr');        
      } catch(e) { 
        console.log('reloading');
        await browser.close()
        this.openWeb()
      }
      //await page.screenshot({path: 'C:/Users/david/Desktop/telegram/scrap/captures/mail.png'});
      this.scrap(page);
  }  
  async scrap(page) {
    let signalsObject = await page.evaluate((data) => {
      signals = {}
      document.querySelectorAll('#DataTables_Table_0 tbody tr').forEach( signalCell => {
        console.log(signalCell)
        let par = signalCell.querySelector('td:nth-child(3)').textContent
        par = par.trim().replace(/\//,'');        
        signals[par] = {};
        signals[par].provider = 'Wetalktrade';
        signals[par].par = par;
        signals[par].order = signalCell.querySelector('td:nth-child(4)').textContent.trim().toUpperCase()
        signals[par].entry = Number(signalCell.querySelector('td:nth-child(7)').textContent);
        signals[par].tp = Number(signalCell.querySelector('td:nth-child(8)').textContent);
        signals[par].sl = Number(signalCell.querySelector('td:nth-child(9)').textContent);
       
       
      })
      return signals;
    })
    this.activeSignals.next(signalsObject)
  }
}