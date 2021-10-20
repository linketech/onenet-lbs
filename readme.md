# Onenet LBS
基于onenet平台的基站定位服务和Wifi定位服务

# 原理
本服务运行在服务器上。向onenet平台发送设备搜索到的基站信息或WiFi热点信息，等一段时间后（1秒），再获取该设备的最后位置。以此实现基站定位和WiFi定位。如果该设备不存在于onenet平台，则自动注册该设备。

本库的接口已集成上述逻辑，调用者只需直接调用接口即可。
# 用法
## 安装
```bash
npm i -S onenet-lbs
```
## 初始化
```javascript
const OnenetLBS = require('onenet-lbs')
new OnenetLBS('api key', 'register code')
```

## 基站定位
接口：getBaseStationLocation(sn, { mcc, mnc, lac, cid, networktype = 1 })
* sn：设备唯一标识码
* mcc, mnc, lac, cid：基站信息
* networktype：
	1. GSM
	2. CDMA
	3. WCDMA
	4. TD_CDMA
	5. LTE

## Wifi定位
接口：getWifiLocation(sn, macs)
* sn：设备唯一标识码
* macs：设备附近热点的mac地址，格式XX:XX:XX:XX:XX:XX，**须提供两个或以上**
