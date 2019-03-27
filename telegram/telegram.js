const spawn = require('cross-spawn');
const pythonProcess = spawn('python', ['./python_telethon/emitSignals.py'])
export class TelegramClass {
  
    constructor() { 
   
    }
}
const Telegram = new TelegramClass();
export default Telegram;