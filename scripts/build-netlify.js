var fs = require('fs');
var path = require('path');

var DIST = path.resolve(__dirname, '..', 'netlify-dist');

function mkdirp(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyDir(src, dest) {
    mkdirp(dest);
    var entries = fs.readdirSync(src, { withFileTypes: true });
    entries.forEach(function(entry) {
        var srcPath = path.join(src, entry.name);
        var destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        }
        else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

mkdirp(DIST);

var clientDir = path.resolve(__dirname, '..', 'client');
copyDir(path.join(clientDir, 'css'), path.join(DIST, 'css'));
copyDir(path.join(clientDir, 'dist'), path.join(DIST, 'dist'));

if (fs.existsSync(path.join(clientDir, 'img'))) {
    copyDir(path.join(clientDir, 'img'), path.join(DIST, 'img'));
}

fs.copyFileSync(
    path.join(clientDir, 'playerCard.html'),
    path.join(DIST, 'playerCard.html')
);

fs.copyFileSync(
    path.join(clientDir, 'index.html'),
    path.join(DIST, 'index.html')
);

var viewsDir = path.resolve(__dirname, '..', 'views');
fs.copyFileSync(
    path.join(viewsDir, 'play.html'),
    path.join(DIST, 'play.html')
);
fs.copyFileSync(
    path.join(viewsDir, 'control.html'),
    path.join(DIST, 'control.html')
);

console.log('Netlify build output assembled in', DIST);
