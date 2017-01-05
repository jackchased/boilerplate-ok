function clientReqHdlr(shepherd, rpcServer, msg) {
    var args = msg.args,
        rspMsg = {
            seq: msg.seq,
            rspType: msg.reqType,
            status: null,
            data: {}
        };

    if (msg.reqType === 'permitJoin') {
        shepherd.permitJoin(args.time, function (err) {
            if (!err) {
                rspMsg.status = 0;
                rpcServer.emit('rsp', rspMsg);
            }
        });
    }

    if (msg.reqType === 'getDevs') {
        var devList = shepherd.list(),
            devs = {};

        devList.forEach(function (devInfo) {
            if (devInfo.nwkAddr === 0) return;

            devInfo.epList.forEach(function (epId) {
                var ep = shepherd.find(devInfo.ieeeAddr, epId);
                devInfo[epId] = ep.dump();
            });

            devs[devInfo.ieeeAddr] = devInfo;
        });

        rspMsg.status = 0;
        rspMsg.data.devs = devs;
        rpcServer.emit('rsp', rspMsg);
    }

    if (msg.reqType === 'write') {
        var ep = shepherd.find(args.ieeeAddr, args.epId),
            cid = args.cid,
            value = args.value;

        if (!ep) return;

        if (cid === 'genOnOff') {
            var cmd = value ? 'on' : 'off';
            ep.functional('genOnOff', cmd, {}, function (err, rsp) {});
        }
    }
}

module.exports = clientReqHdlr;
