var http = require('http');
var fs = require('fs');
var mysql = require('mysql');
var qs = require('querystring');
var base62 = require("base62/lib/ascii");

var sqlconnect = mysql.createConnection({
    host     : 'localhost',
    user     : 'miru2533',
    password : 'best4027',
    database : 'urlshort'
  });


var app = http.createServer(function(request,response){
    var url = request.url;

    if(request.url == '/'){
      url = '/index.html';

      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
  
      request.on('end', function(){
        var post = qs.parse(body);
        var urls = post.url;
        console.debug(urls);
      });
    }
    if(request.url == '/favicon.ico'){
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + url));
 
});
app.listen(3000);