var ZShepherd = require('zigbee-shepherd');

function start () {
    // 新增 shepherd 實例
    var shepherd = new ZShepherd('/dev/ttyACM0', { net: { panId: 0x1234 } });

    // 啟動 machine server 並回傳
    shepherd.start(function (err) {
        if (err)
            throw err;
    });

    return shepherd;
}

module.exports = start;
