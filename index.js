const { promisify } = require('util')
require('request')
const rp = require('request-promise')

const sleep = promisify(setTimeout)

module.exports = class OnenetLBS {
	static get Host() {
		return 'https://api.heclouds.com'
	}

	static get LocationType() {
		return {
			BaseStation: '',
			Wifi: 'Wifi',
		}
	}

	constructor(apiKey, registerCode, timeFrame = 30000, timeout = 8000) {
		this.apiKey = apiKey
		this.registerCode = registerCode
		this.timeFrame = timeFrame
		this.timeout = timeout
	}

	async getDevice(sn) {
		const { error, data } = await rp({
			uri: `${OnenetLBS.Host}/devices`,
			headers: { 'api-key': this.apiKey },
			json: true,
			qs: { title: sn },
			timeout: this.timeout
		})
		if (error !== 'succ') {
			throw new Error(error)
		}
		return data && data.devices && data.devices[0] ? data.devices[0] : null
	}

	async registerDevice(sn) {
		const { error, data } = await rp({
			method: 'POST',
			uri: `${OnenetLBS.Host}/register_de`,
			headers: { 'api-key': this.apiKey },
			json: true,
			qs: { register_code: this.registerCode },
			body: { sn, title: sn },
			timeout: this.timeout
		})
		if (error !== 'succ') {
			throw new Error(error)
		}
		return data
	}

	async ensureDevice(sn) {
		let device = await this.getDevice(sn)
		if (device) {
			return device
		}
		device = await this.registerDevice(sn)
		return {
			id: device.device_id,
			newly: true,
		}
	}

	async postBaseStationInfo(deviceId, { mcc, mnc, lac, cid, networktype = 1 }) {
		const { errno, error } = await rp({
			method: 'POST',
			uri: `${OnenetLBS.Host}/devices/${deviceId}/datapoints`,
			headers: { 'api-key': this.apiKey },
			json: true,
			body: {
				datastreams: [{
					id: '$OneNET_LBS',
					datapoints: [{
						value: { cid, lac, mcc, mnc, networktype },
					}],
				}],
			},
			timeout: this.timeout
		})
		if (errno !== 0 || error !== 'succ') {
			throw new Error(`errno:${errno}. ${error}`)
		}
	}

	async postWifiInfo(deviceId, { macs }) {
		if (!macs || macs.length < 2) {
			throw new Error('at least 2 macs are required')
		}
		const { errno, error } = await rp({
			method: 'POST',
			uri: `${OnenetLBS.Host}/devices/${deviceId}/datapoints`,
			headers: { 'api-key': this.apiKey },
			json: true,
			body: {
				datastreams: [{
					id: '$OneNET_LBS_WIFI',
					datapoints: [{
						value: { macs: macs.map((e, i) => `${e},${-70 + i}`).join('|') },
					}],
				}],
			},
			timeout: this.timeout
		})
		if (errno !== 0 || error !== 'succ') {
			throw new Error(`errno:${errno}. ${error}`)
		}
	}

	async getLatestLocation(deviceId, type) {
		const { errno, error, data } = await rp({
			uri: `${OnenetLBS.Host}/devices/${deviceId}/lbs/latest${type}Location`,
			headers: { 'api-key': this.apiKey },
			json: true,
			timeout: this.timeout
		})
		if (errno !== 0 || error !== 'succ') {
			throw new Error(`errno:${errno}. ${error}`)
		}
		return data
	}

	ensureLocationTime(l) {
		const t = new Date(l.at).valueOf()
		if (Number.isNaN(t)) {
			throw new Error('location info not found')
		}
		if (Date.now() - t > this.timeFrame) {
			throw new Error(`location(${l.lon},${l.lat}) at ${l.at} is out of time.`)
		}
	}

	async getBaseStationLocation(sn, { mcc, mnc, lac, cid, networktype = 1 }) {
		const device = await this.ensureDevice(sn)
		await this.postBaseStationInfo(device.id, { mcc, mnc, lac, cid, networktype })

		await sleep(1000) // 定位后，需要等一会儿再获取最后位置
		const l = await this.getLatestLocation(device.id, OnenetLBS.LocationType.BaseStation)
		this.ensureLocationTime(l)
		return l
	}

	async getWifiLocation(sn, macs) {
		const device = await this.ensureDevice(sn)
		await this.postWifiInfo(device.id, { macs })

		await sleep(1000) // 定位后，需要等一会儿再获取最后位置
		const l = await this.getLatestLocation(device.id, OnenetLBS.LocationType.Wifi)
		this.ensureLocationTime(l)
		return l
	}
}
