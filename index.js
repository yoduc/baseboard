const
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  qs = require('querystring');

// Get server config
const config = JSON.parse(fs.readFileSync('server.json'));

// If http is defined then start http server
if (config.hasOwnProperty('http')) {
  http.createServer((req, res) => response(req, res)).listen(config['http']['port'], config['http']['server']);
}


// If https is defined then start https server with SSL certificate & key
if (config.hasOwnProperty('https')) {
  const options = {
    key: fs.readFileSync(config['https']['key']),
    cert: fs.readFileSync(config['https']['cert'])
  };
  https.createServer(options, (req, res) => response(req, res)).listen(config['https']['port'], config['https']['server']);
}



/**
 * Response to web request for both http & https
 */
const response = (req, res) => {
  // Write config file if there is a POST
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
      if (body.length > 1e6)
        req.connection.destroy();
    });

    req.on('end', function () {
      fs.writeFileSync('config.json', qs.parse(body)['config_editor']);
    });
  }


  // Write index.html if url is /
  let url = req.url;
  if (url === "/") url = '/index.html';

  fs.readFile(__dirname + url, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }

    if (req.url === "/") {
      const config = fs.readFileSync('config.json');
      data = data.toString().replace("edit-invisible", "edit-visible");                     // Make config button visible
      data = data.replace("const config = null;", `const config = ${config};`);             // Add config into the HTML
    }

    // Response
    res.writeHead(200);
    res.end(data);
  });
}