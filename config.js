export const TELEGRAM = {
	phone: '+34669940214',
	appId: 416099,
	appHash: 'b803284b81b9ee613e5078d7782a39f1',
	server: '149.154.167.40:443',
	
}
export const API = {
	api_id: TELEGRAM.appId,
	invokeWithLayer: 0xda9b0d0d,
	layer: 57,
	initConnection: 0x69796de9,
}

export const SERVER = {
	webogram: true,
  	dev: true //We will connect to the test server.
} //Any empty configurations fields can just not be specified
 

export const LISTMARKET = [
	'https://www.fxempire.com/api/v1/es/markets/list'
]