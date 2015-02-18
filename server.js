var express = require('express'),
    path = require('path'),
    app = express();

app
  .use(express.static('src/'))
  .get('*', function (req, res) {
    var rootPath = '/';

    // In windows enviroment use '\\' instead of '/'
    if (process.platform === 'win32') {
      rootPath = path.resolve(__dirname + '\\..\\');
      res.sendFile(rootPath + 'index.html');
    } else {
      res.sendFile(path.join(__dirname, 'index.html'));
    }

  })
  .listen(3000);