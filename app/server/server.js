var fs = require('fs'),
    path = require('path'),
    chalk = require('chalk');

// Machine Server 啟動函式
var startMachineServer = require('./services/machineServer');
// RPC Server 啟動函式
var startRpcServer = require('./services/rpcServer');
// HTTP Server 啟動函式
var startHttpServer = require('./services/httpServer');

// Client Request Handler
var clientReqHdlr = require('./handlers/clientReqHdlr');
// ZigBee Machine Network Handlers
var zbEvtHdlrs = require('./handlers/zbEvtHdlrs');

// 載入溫控系統應用
var tempCtrlApp = require('./zbApps/tempCtrlApp');

var shepherd,
    rpcServer,
    httpServer;

function start () {
    var dbPath = path.resolve(__dirname, '../../node_modules/zigbee-shepherd/lib/database/dev.db');
    fs.exists(dbPath, function (isThere) {
        if (isThere)
            fs.unlink(dbPath);
    });

    showWelcomeMsg();
    setLeaveMsg();

    // 依序啟動 Machine Server, RPC Server 和 HTTP Server
    shepherd = startMachineServer();     // Machine Server

    shepherd.on('ready', function () {
        // 啟動溫控系統應用
        tempCtrlApp(shepherd);

        rpcServer = startRpcServer();    // RPC Server
        httpServer = startHttpServer();  // HTTP Server

        // Web Server 啟動之後，開始會有 socket 連入，監聽 'connection' 事件
        rpcServer.on('connection', function (socket) {
            socket.on('req', function (msg) {
                clientReqHdlr(shepherd, rpcServer, msg);
            });
        });
    });

    // 需要轉接 Machine Server 的事件至 Web Client 端
    shepherd.on('error', function (err) {
        zbEvtHdlrs.error(rpcServer, err);
    });
    shepherd.on('permitJoining', function (timeLeft) {
        zbEvtHdlrs.permitJoining(rpcServer, timeLeft);
    });
    shepherd.on('ind', function (msg) {
        zbEvtHdlrs.ind(shepherd, rpcServer, msg);
    });
}

/***********************************************/
/* welcome function                            */
/***********************************************/
function showWelcomeMsg() {
    var zbPart1 = chalk.blue('      ____   ____ _____ ___   ____ ____        ____ __ __ ____ ___   __ __ ____ ___   ___     '),
        zbPart2 = chalk.blue('     /_  /  /  _// ___// _ ) / __// __/ ____  / __// // // __// _ \\ / // // __// _ \\ / _ \\ '),
        zbPart3 = chalk.blue('      / /_ _/ / / (_ // _  |/ _/ / _/  /___/ _\\ \\ / _  // _/ / ___// _  // _/ / , _// // /  '),
        zbPart4 = chalk.blue('     /___//___/ \\___//____//___//___/       /___//_//_//___//_/   /_//_//___//_/|_|/____/    ');

    console.log('');
    console.log('');
    console.log('Welcome to zigbee-shepherd webapp... ');
    console.log('');
    console.log(zbPart1);
    console.log(zbPart2);
    console.log(zbPart3);
    console.log(zbPart4);
    console.log(chalk.gray('         A network server and manager for the ZigBee machine network'));
    console.log('');
    console.log('   >>> Author:     Jack Wu (jackchased@gmail.com)              ');
    console.log('   >>> Version:    zigbee-shepherd v0.2.0                      ');
    console.log('   >>> Document:   https://github.com/zigbeer/zigbee-shepherd  ');
    console.log('   >>> Copyright (c) 2017 Jack Wu, The MIT License (MIT)       ');
    console.log('');
    console.log('The server is up and running, press Ctrl+C to stop server.     ');
    console.log('---------------------------------------------------------------');
}

/***********************************************/
/* goodbye function                            */
/***********************************************/
function setLeaveMsg() {
    process.stdin.resume();

    function showLeaveMessage() {
        console.log(' ');
        console.log(chalk.blue('      _____              __      __                  '));
        console.log(chalk.blue('     / ___/ __  ___  ___/ /____ / /  __ __ ___       '));
        console.log(chalk.blue('    / (_ // _ \\/ _ \\/ _  //___// _ \\/ // // -_)   '));
        console.log(chalk.blue('    \\___/ \\___/\\___/\\_,_/     /_.__/\\_, / \\__/ '));
        console.log(chalk.blue('                                   /___/             '));
        console.log(' ');
        console.log('    >>> This is a simple demonstration of how the shepherd works.');
        console.log('    >>> Please visit the link to know more about this project:   ');
        console.log('    >>>   ' + chalk.yellow('https://github.com/zigbeer/zigbee-shepherd'));
        console.log(' ');
        process.exit();
    }

    process.on('SIGINT', showLeaveMessage);
}

module.exports = start;
