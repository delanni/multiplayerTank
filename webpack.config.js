var path = require('path');

module.exports = {
    entry: {
        lobby: './client/js/lobby-app.js',
        viewer: './client/js/viewer-app.js',
        controller: './client/js/controller-app.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'client', 'dist'),
        clean: true
    },
    externals: {
        angular: 'angular'
    },
    resolve: {
        extensions: ['.js']
    }
};
