# Onenet LBS
基于onenet平台的基站定位服务和Wifi定位服务

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
接口：getBaseStationLocation

## Wifi定位
接口：getWifiLocation

注意此接口必须提供两个或以上的MAC地址才能定位
