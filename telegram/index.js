const spawn = require('cross-spawn');
const pythonProcess = spawn('py', ['./python_telethon/main.py'])

const messages = []
pythonProcess.stdout.on('data', (data) => {
  messages[0] = (data.toString());

  console.log(messages[0].provider)

})

