const OnenetLBS = require('./index')

async function test() {
	const lbs = new OnenetLBS('*********', '*******')
	console.log(await lbs.getBaseStationLocation('FFFFFFFFF5', {
		cid: 21842,
		lac: 32768,
		mcc: 460,
		mnc: 0,
	}))

	console.log(await lbs.getWifiLocation('FFFFFFFFF6', [
		'FC:D7:33:55:92:6A',
		'B8:F8:83:E6:24:DF',
	]))
}

test().catch(console.error)
