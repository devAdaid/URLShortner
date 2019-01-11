var http = require('http');
var url = require("url");
var fs = require('fs');
var mysql = require('mysql');
var qs = require('querystring');
var base62 = require("base62/lib/ascii");

var sqldb = mysql.createConnection({
    host     : 'localhost',
    port      : 3307,
    user     : 'root',
    password : 'best4027',
    database : 'urlshort'
  });

console.log('mysql connected');
sqldb.connect();

var app = http.createServer(function(request,response){
    var requrl = request.url;

    if(request.url == '/'){
      requrl = '/index.html';
      
      // 입력받은 url 파싱
      var body = '';
      var inputData;
     
      request.on('data', function(data){
          body = body + data;
      });
    
      request.on('end', function(){
        var post = qs.parse(body);
        inputData = post.originUrl;

        // if data exist
        if(inputData != undefined){
          sqldb.query('SELECT * FROM urls WHERE url=?', inputData, function (error, results, fields) {
            if (results == '') {
              // 신규 url DB 등록
              console.log("register new url");
              var records = [[inputData]];
              sqldb.query('INSERT INTO urls(url) VALUES (?)', records, function (error2, results2, fields) {
                if (error2) throw error2;

                var insertedId = results2.insertId;
                var code = base62.encode(insertedId);
                console.log(insertedId);
                console.log("http://localhost:3000/"+code);
                response.writeHead(200);
                response.end('{"url" : ' + code + ' }');
                console.log('{"url" : ' + code + ' }');
                return;
              });
            }
            else {
              // 기존 url 가져옴
              var code = base62.encode(results[0].id);
              console.log("get url");
              console.log("http://localhost:3000/"+base62.encode(results[0].id));
              response.writeHead(200);
              response.end('{"url" : ' + code + ' }');
              return;
            }
          });
        }
        
        //end of get post
      });
      
    }
    else if(request.url == '/favicon.ico'){
        response.writeHead(404);
        response.end();
        return;
    }
    else{
      try {
        fs.accessSync(__dirname + requrl);
        
        response.writeHead(200);
        response.end(fs.readFileSync(__dirname + requrl));
      }
      catch(err){
        // 해당 파일명이 없을경우 DB에서 key검사
        var path = requrl.substring(1);
        var key = base62.decode(path);
        console.log(key);

        sqldb.query('SELECT * FROM urls WHERE id=?', key, function (error, results, fields) {
          if (error) {
            // key 없으면 404
            response.writeHead(404);
            response.end();
          }
          else {
            // key 있음 - 리다이렉트
            response.statusCode = 302;
            response.setHeader('Location', results[0].url);
            console.log(results[0].url);
            response.end();
            return;
          }
        });
        //response.writeHead(404);
        //response.end();
        return;
      }
    }

    // 해당되는 파일로 응답
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + requrl));
 
});
app.listen(3000);