var express = require('express');
var path = require('path');
var fs = require('fs');

var isDeveloping = process.env.NODE_ENV !== 'production',
    port = 3000,
    app = express();

if (isDeveloping) {
    var config = require('../../../webpack.config'),
        compiler = require('webpack')(config),
        middleware = require('webpack-dev-middleware')(compiler, {
        publicPath: config.output.publicPath,
        contentBase: 'src',
        stats: {
            colors: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            modules: false
        }
    });

    app.use(middleware);
    app.use(require('webpack-hot-middleware')(compiler));
    app.get('*', function response(req, res) {
        fs.readFile(path.join(__dirname, '../../../', 'build/index.html'), function (err, data) {
            res.write(data);
            res.end();
        });
    });
} else {
    app.use(express.static(path.join(__dirname, '../../../', 'build')));
    app.get('*', function response(req, res) {
        fs.readFile(path.join(__dirname, '../../../', 'build/index.html'), function (err, data) {
            res.end(data);
        });
    });
}

function start() {
    return app.listen(port, '0.0.0.0', function onStart(err) {
        if (err) {
            console.log(err);
        }

        console.info('==> Listening on port %s.', port);
        console.info('==> Open up http://0.0.0.0:%s/ in your browser.', port);
    });
}

module.exports = start;
