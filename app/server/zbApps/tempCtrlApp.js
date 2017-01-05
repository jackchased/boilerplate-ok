var ThingSpeakClient = require('thingspeakclient');
var client = new ThingSpeakClient();

client.attachChannel(203075, {
    writeKey:'KZ7UB0P8KX0WGOZT',
    readKey:'LM7F26TPWOBETOF6'
});

var shepherd, plug, tempSenser;

function tempCtrlApp(shep) {
    shepherd = shep;

    shepherd.on('ind', function (msg) {
        switch (msg.type) {
            case 'devIncoming':
                // 裝置加入網路
                devIncomingHdlr(msg);
                break;

            case 'devChange':
                // 裝置屬性值改變
                devChangeHdlr(msg);
                break;
        }
    });
}

function devIncomingHdlr(msg) {
    // console.log('Device: ' + msg.data + ' joining the network!');

    msg.endpoints.forEach(function (ep) {
        if (ep.devId === 81) {   // smartPlug
            // 將 Meter Plug 裝置指定到 plug 變數
            plug = ep;

            plug.report('genOnOff', 'onOff', 2, 3, function (err) {
                if (err)
                    console.log('Set SmartPlug report error: ' + err);
            });
        }

        if (ep.devId === 770) {  // temperatureSensor
            // 將 Temperature Sensor 裝置指定到 tempSenser 變數
            tempSenser = ep;

            tempSenser.report('msTemperatureMeasurement', 'measuredValue', 2, 3, 100, function (err) {
                if (!err)
                    console.log('Set Temperature report success!');
            });

            setInterval(function () {
                var cInfo = tempSenser.dump().clusters,
                    device = shepherd.list(tempSenser.getIeeeAddr()),
                    tempValue;

                if (cInfo)
                    tempValue = cInfo.msTemperatureMeasurement.attrs.measuredValue / 100;

                // 若 tempSenser 為離線狀態，則不做任何事
                if (!device || device[0].status !== 'online') return;

                // 上傳溫度值至雲端服務       
                client.updateChannel(
                    203075,                 // Channel ID
                    { field1: tempValue },  // 溫度值
                    function(err, rsp) {
                        // 不做任何事
                    }
                );
            }, 15000);

        }
    });
}

function devChangeHdlr(msg) {
    var ep = msg.endpoints[0];

    if (ep.devId === 81 && msg.data.cid === 'genOnOff') {
        var plugStatus = msg.data.data.onOff ? 'On' : 'Off';
    }

    if (ep.devId === 770 && msg.data.cid === 'msTemperatureMeasurement') {
        var temp = msg.data.data.measuredValue / 100;
        tempChangedHdlr(temp);
    }
}

// 溫度處理函式
function tempChangedHdlr (tempVal) {
    if (!plug) return;          // 若 plug 尚未入網，則不再做任何事

    if (tempVal > 28) {         // 當溫度過高，則開啟 plug
        plug.functional('genOnOff', 'on', {}, function (err) {
            if (err) console.log(err);
        });
    } else if (tempVal < 27) {  // 當溫度過低，則關閉 plug
        plug.functional('genOnOff', 'off', {}, function (err) {
            if (err) console.log(err);
        });
    }
}

module.exports = tempCtrlApp;
