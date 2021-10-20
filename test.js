const OnenetLBS = require('./index')

async function test() {
	const lbs = new OnenetLBS(process.env.ONENET_API_KEY, process.env.ONENET_REGISTER_CODE)
	console.log(await lbs.getBaseStationLocation('FFFFFFFFF5', {
		cid: 21842,
		lac: 32768,
		mcc: 460,
		mnc: 0,
	}))

	console.log(await lbs.getBaseStationLocation('046961531551', {
		cid: 10466,
		lac: 9540,
		mcc: 460,
		mnc: 0,
	}))

	console.log(await lbs.getWifiLocation('FFFFFFFFF6', [
		'78:EB:14:90:19:02',
		'A8:57:4E:BF:A7:2E',
		'00:0F:1E:B0:AF:AE',
	]))

	console.log(await lbs.getWifiLocation('FFFFFFFFF6', [
		'FC:D7:33:55:92:6A',
		'B8:F8:83:E6:24:DF',
	]))
}

test().catch(console.error)
