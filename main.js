var http = require('http');
var url = require("url");
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

console.log('mysql connected');
sqlconnect.connect();

var app = http.createServer(function(request,response){
    var requrl = request.url;

    if(request.url == '/'){
      requrl = '/index.html';
      
      // 입력받은 url 파싱
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
    
      request.on('end', function(){
        var post = qs.parse(body);
      });

      // 신규 url이면 DB 등록
    }
    else if(request.url == '/favicon.ico'){
        response.writeHead(404);
        response.end();
        return;
    }
    else{
      try {
        fs.accessSync(__dirname + requrl);
      }
      catch(err){
        // 해당 파일명이 없을경우 DB에서 key검사
        var path = requrl.substring(1);
        var key = base62.decode(path);
        console.log(key);

        connection.query('SELECT * FROM urltable WHERE id=?', key, function (error, results, fields) {
          if (error) {
              console.log(error);
          }
          console.log(results);
        });
        //response.writeHead(404);
        //response.end();
        return;
      }
    }

    // 해당되는 파일로 응답
    console.log('response');
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + requrl));
 
});
app.listen(3000);

console.log('mysql disconnected');
sqlconnect.end();