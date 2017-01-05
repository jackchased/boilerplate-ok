var chalk = require('chalk');

var zbEvtHdlrs = {
    error: errorEvtHdlr,
    permitJoining: permitJoiningEvtHdlr,
    ind: indEvtHdlr
};

/***********************************************/
/* Machine Server Event Handler                */
/***********************************************/
function errorEvtHdlr(rpcServer, err) {
    console.log(chalk.red('[         error ] ') + err.message);
    rpcServer.emit('error', { msg: err.message });
}

// 轉發 permitJoining 事件至 Web Client 端
function permitJoiningEvtHdlr(rpcServer, timeLeft) {
    console.log(chalk.green('[ permitJoining ] ') + timeLeft + ' sec');

    rpcServer.emit('ind', {
        indType: 'permitJoining',
        data: {
            timeLeft: timeLeft
        }
    });
}

// ind 事件為周邊裝置相關的所有事件，使用分派器處理
function indEvtHdlr(shepherd, rpcServer, msg) {
    var data = msg.data,
        eps = msg.endpoints;

    switch (msg.type) {
        case 'devIncoming':
            devIncomingHdlr(shepherd, rpcServer, data, eps);
            break;
        case 'devStatus':
            devStatusHdlr(rpcServer, data, eps);
            break;
        case 'devChange':
            devChangeHdlr(rpcServer, data, eps);
            break;
    }
}

/***********************************************/
/* Peripheral Event Handler                    */
/***********************************************/
function devIncomingHdlr(shepherd, rpcServer, ieeeAddr, eps) {
    var devInfo = shepherd.list(ieeeAddr)[0];

    console.log(chalk.yellow('[   devIncoming ] ') + '@' + ieeeAddr);

    eps.forEach(function (ep) {
        epInfo = ep.dump();
        devInfo[epInfo.epId] = epInfo;
    });

    rpcServer.emit('ind', {
        indType: 'devIncoming',
        data: {
            devInfo: devInfo
        }
    });
}

function devStatusHdlr(rpcServer, status, eps) {
    var ieeeAddr = eps[0].getIeeeAddr();

    chalkStatus = (status === 'online') ? chalk.green(status) : chalk.red(status);
    console.log(chalk.magenta('[     devStatus ] ') + '@' + ieeeAddr + ', ' + chalkStatus);

    rpcServer.emit('ind', {
        indType: 'devStatus',
        data: { ieeeAddr: ieeeAddr, status: status }
    });
}

function devChangeHdlr(rpcServer, changeData, eps) {
    var ieeeAddr = eps[0].getIeeeAddr(),
        epInfo = eps[0].dump(),
        cid = changeData.cid,
        value;

    if (cid === 'msTemperatureMeasurement') value = changeData.data.measuredValue / 100;
    if (cid === 'genOnOff') value = changeData.data.onOff;
    if (value !== undefined)
        console.log(chalk.blue('[   attrsChange ] ') + '@' + ieeeAddr + 
            ', type: ' + cid + ', value: ' + value);

    rpcServer.emit('ind', {
        indType: 'attChange',
        data: {
            ieeeAddr: ieeeAddr,
            epInfo: epInfo
        }
    });
}

module.exports = zbEvtHdlrs;
