from __future__ import print_function
from telethon import TelegramClient, sync, events
from telethon.tl.types import Channel
from telethon.tl.functions.messages import GetHistoryRequest
import re
from ws4py.client.threadedclient import WebSocketClient

class EchoClient(WebSocketClient):
         
    def closed(self, code, reason):
        print(("Closed down", code, reason))



ws = EchoClient('ws://localhost:8012/', protocols=['http-only', 'echo-protocol'])
ws.daemon = False
ws.connect()

pares = ["EURAUD","Copper","AUDNZD","EURSEK","CADJPY","USDCHF","LTCUSD","USDCNH","US30","XAGUSD","SOYF","USDSEK","AUDCHF","GER30","USOil","GBPNZD","EURCAD","EURUSD","AUS200","EURJPY","CHN50","EURGBP","EURNOK","USDCAD","CORNF","GBPCHF","GBPAUD","USDJPY","USDNOK","AUDCAD","FRA40","ETHUSD","AUDUSD","USDHKD","NZDCHF","EURTRY","AUDJPY","USDZAR","Bund","USDMXN","USDTRY","USDOLLAR","JPN225","UK100","HKG33","CADCHF","NAS100","NGAS","ZARJPY","GBPCAD","ESP35","GBPUSD","SPX500","GBPJPY","EUSTX50","TRYJPY","WHEATF","NZDCAD","EURNZD","XAUUSD","NZDUSD","BTCUSD","NZDJPY","US2000","UKOil","CHFJPY","EURCHF","EUR/AUD","Copper","AUD/NZD","EUR/SEK","CAD/JPY","USD/CHF","LTC/USD","USD/CNH","US30","XAG/USD","SOYF","USD/SEK","AUD/CHF","GER30","OIL","GBP/NZD","EUR/CAD","EUR/USD","AUS200","EUR/JPY","CHN50","EUR/GBP","EUR/NOK","USD/CAD","CORNF","GBP/CHF","GBP/AUD","USD/JPY","USD/NOK","AUD/CAD","FRA40","ETH/USD","AUD/USD","USD/HKD","NZD/CHF","EUR/TRY","AUD/JPY","USD/ZAR","Bund","USD/MXN","USD/TRY","USDOLLAR","JPN225","UK100","HKG33","CAD/CHF","NAS100","NGAS","ZAR/JPY","GBP/CAD","ESP35","GBP/USD","SPX500","GBP/JPY","EUSTX50","TRY/JPY","WHEATF","NZD/CAD","EUR/NZD","XAU/USD","NZD/USD","BTC/USD","NZD/JPY","US2000","BRENTOIL","CHF/JPY","EUR/CHF"]

print('connected')
api_id = int("416099")
api_hash = "b803284b81b9ee613e5078d7782a39f1"
client = TelegramClient("session_cache", api_id, api_hash)
with client:
  myself = client.start()
  print('connecting')

  data = {}  

  for dialog in client.get_dialogs():
    if dialog.is_channel:    
      data[dialog.message.to_id.channel_id] = dialog.name;
      @client.on(events.NewMessage(chats=dialog.name))
      async def my_event_handler(event):
          print(data[event.message.to_id.channel_id],event.date)
          #client.get_entity(PeerChannel(event.message.to_id)
          msg = event.raw_text 
          msg = msg.upper().replace(':',' : ').replace('TP 1 ','TP').replace('TP 1 ','TP').replace('\'','').replace('\"',' : ').replace('-',' ').replace('(',' ').replace(')',' ').strip().replace('\n', ' ').replace('\r', ' ').rstrip()
          msg = msg.replace("GOLD","XAUUSD")
          msg = msg.replace("OIL","USOIL")
          msg2 = msg
          #tp = c.split('TP|T.P')[1]
          #tpValue = re.search("\d+", tp).group(0)
          for posiblePar in pares:

            possible = re.search(posiblePar.upper(), msg)
             
           
            if possible:
              
              par = possible.group(0)
              par = par.replace("/","")
              order = re.search("BUY|SELL", msg)  
              if order:
                order = order.group(0)
                msgArray = msg.split(" ")
                for i,text in enumerate(msgArray):
                  if(re.search('^SELL$|^BUY$|^SELL@$|^BUY@$', text)):
                    msgArray[i]= 'ZXCZXCZXC'
                  if(re.search(':SL1$|:SL$|SL1$|^SL@$|^S.L$|^STOPLOSS$|^STOPLOSS@$|^SL$', text)):
                    msgArray[i]= 'SL'
                  if(re.search(':TP1$|:TP$|TP1|^TP@$|^T.P$|^TAKEPROFITS$|^TARGET@$|^TP$', text)):
                    msgArray[i]= 'TP'
                  #print(text, i)
                  if(re.search('HTTP', text)):
                    msgArray.pop(i)
                msg = ' '.join([str(x) for x in msgArray])      
                entryCrude =  re.findall("(ZXCZXCZXC)(\D*)(\d+(\.\d{0,4})?)", msg)[0] 
                entryCrude = ''.join([str(x) for x in entryCrude]) 
                    
                if entryCrude:
                  entry = re.search("\d+(\.\d{1,4})?", entryCrude).group(0) 
                  tp = None
                  sl = None
                  tpCrude =  re.findall("(TP)(\D*)(\d+(\.\d{1,4})?)", msg)[0] 
                 
                  if len(tpCrude) > 1 :
                    tpCrude = ''.join([str(x) for x in tpCrude])
                    tp = re.search("\d+(\.\d{1,4})?", tpCrude).group(0) 
                  
                  slCrude =  re.findall("(SL)(\D*)(\d+(\.\d{1,4})?)", msg)[0] 
                  if len(slCrude) > 1 :
                    slCrude = ''.join([str(x) for x in slCrude])
                    sl = re.search("\d+(\.\d{1,4})?", slCrude).group(0) 
                
                  if sl is not None and tp is not None:
                    if sl != tp and sl != entry and tp != entry:
                      signal = '{"entry":' + '"' + entry + '", "order":"' + order + '", "par":"' + par + '","msg":"' + msg + '", "provider":"' + data[event.message.to_id.channel_id] + '", "sl":"' + sl  + '", "tp":"' + tp +'"}'
                      print(signal)
                      ws.send(signal)
                     
                         
          

myself = client.start()

client.add_event_handler(my_event_handler) 

client.run_until_disconnected()
