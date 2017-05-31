var express = require('express');
var app = express();
var mysql = require('mysql');

var Iconv = require('iconv').Iconv;
var iconv = new Iconv('EUC-KR', 'UTF-8');

var jade = require('jade');
var bodyParser = require('body-parser');
var request = require('request');
var parseString = require('xml2js').parseString;
var sleep = require('system-sleep');


app.set('views', './views');
app.set('view engine', 'ejs');
//app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('public'));


var urlencodedParser = bodyParser.urlencoded({ extended: false});
var jsonParser = bodyParser.json();



var db = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'aed_data'
});

db.connect();



// 네이버 음성합성 Open API 예제
/*
var client_id = 'XAykvWJha_MnbnbShcyT';
var client_secret = 'zlntOBAMTS';
var fs = require('fs');
app.get('/tts', function (req, res) {
   var api_url = 'https://openapi.naver.com/v1/voice/tts.bin';
   var request = require('request');
   var options = {
       url: api_url,
       form: {'speaker':'jinho', 'speed':'0', 'text':'근처에 심정지 환자가 발생하였으니 본 제세동기를 수령하여 지도에 표시된 위치로 가져다 주시기 바랍니다.'},
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    var writeStream = fs.createWriteStream('./tts1.mp3');
    var _req = request.post(options).on('response', function(response) {
       console.log(response.statusCode) // 200
       console.log(response.headers['content-type'])
    });
  _req.pipe(writeStream); // file로 출력
  _req.pipe(res); // 브라우저로 출력
 });


*/




/*

app.get('/aedrenew', (req,res)=>{

res.send("hello");

var i = 1;

for(i = 1; i <= 100; i++) {

getAed();
console.log(i);
sleep(10000);

}

function getAed(){
    var serviceKey = "M8J%2B2LHbMU23T1QGVNPPFFH%2Fe9ZSDlRwxkUb4kLhAoK%2FMXJ8sFtkElI9tpISLSePUIKzguqJlzpFw7Cr32bfHQ%3D%3D";
    var url = 'http://apis.data.go.kr/B552657/AEDInfoInqireService/getAedFullDown';
    var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + serviceKey; // Service Key
    queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('-'); // 공공데이터포털에서 >받은 인증키
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent(i.toString()); // 페이지번
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent("100"); // 한 페이지
    console.log(url + queryParams);
    request({url: url + queryParams,method: 'GET'}, function (error, response, body) {
        parseString(body, function (err, result) {
            //console.log(body);
            for(var k = 0; k < 100; k++) {
                var jsonP = result.response.body[0].items[0].item[k];
                var price = [jsonP.buildAddress[0],jsonP.buildPlace[0],jsonP.gugun[0],jsonP.org[0],jsonP.wgs84Lon[0],jsonP.wgs84Lat[0]];
                var sql = "INSERT into aed_list (buildAddress, buildPlace, gugun, org, wgs84Lon, wgs84Lat) values (?, ?, ?, ?, ?, ?)"
                db.query(sql, price, (err, rows, field) =>{
                    //console.log(rows);
                    if(err){
                        console.log(err);
                        res.send('asdf');
                        //res.status(500).send('Internal Server Error');
                    }
                })
            }
        })
    })
}
})
*/








app.get('/userRegisterTest', (req,res)=> {

    var options = {
      uri: 'http://45.76.197.124:3000/userRegister',
      method: 'POST',
      json: {
        "gender" : 'm', "password": '1234'
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body.id) // Print the shortened url.
      }
    else {
        res.send("test");
    }
    });
})






app.post('/userRegister', jsonParser, (req,res) => {
    
    var max;
    var id, gen, pw;
    
    var checkExistId = "SELECT userId FROM user_info";
    
    db.query(checkExistId, (err,rows,field)=> {
            if(err) {
                console.log("err in userRegister\n");
                console.log(err);
            } else {
                var arr = [];
                for (var i = 0; i < rows.length; i++) {
                    arr.push(rows[i].userId);
                }       
//                max = arr.reduce( function (previous, current) { 
//	               return previous > current ? previous:current;
//                });
                
                max = arr[0];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] >= max) {
                        max = arr[i];
                    }
                }
            }    
        if(!req.body && !max) {
            return res.sendStatus(400) 
        } 
        else {
            console.log(req.body);
            id = max + 1;
            gen = req.body.gender;
            pw = req.body.password;
        }
        if (max) {
            var sql = "INSERT INTO user_info (userId, gender, password) VALUES (" + id + ", '" + gen + "' ," + pw + ")";
        }     
        db.query(sql, (err,rows,field)=> {
                if(err) {
                    console.log("err in userRegister2\n");
                    console.log(err);
                }
            
                var json_data = {user_id : id, password: pw, gender: gen};
                console.log(JSON.stringify(json_data))
                res.send(JSON.stringify(json_data))
        });
    })
})

app.get('/userRenewTest', (req,res)=> {


    var options = {
      uri: 'http://45.76.197.124:3000/userRenew',
      method: 'POST',
      json: {
        "user_id" : '2014', "lat": '37.5608439', "lon" : '126.936160'
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body.id) // Print the shortened url.
      }
    else {
        res.send("test");
    }
    });
})


app.post('/userRenew', jsonParser, (req,res)=>{
    console.log("aaaa");
    if(!req.body) return res.sendStatus(400)
    else {
        console.log(req.body);
        var userId = req.body.user_id
        var x = req.body.lon;
        var y = req.body.lat;
        var sql = "INSERT INTO user_info (userId, x, y) VALUES (?,?,?) ON DUPLICATE KEY UPDATE x=?, y=?";
        var list = [userId, x, y, x, y]
        db.query(sql, list, (err,rows,field)=> {
            if(err) {
                console.log("err in userRenew\n");
                console.log(err);
                res.send("error");
            }
            else {
                var sql2 = "select aedCall from user_info where X = ? and Y = ? limit 1"
                var list2 = [x,y]
                db.query(sql2,list2, (err,rows,field)=> {
                    if(err) {
                        console.log("err in userRenew2\n")
                        console.log(err)
                        res.send("error")
                    }
                    else {
                        if(rows[0].aedCall != 1) {
                            res.send("check");

                        }
                        else if (rows[0].aedCall == 1) {
                            var sql3 = "select distinct wgs84Lon, wgs84Lat from aed_list where aed_call = 1 limit 3";
                            db.query(sql3, (err,rows,field) => {
                                if(err) {console.log("err in userRenew3\n"); console.log(err); res.send("error");}
                                var json_data = {lon1 : rows[0].wgs84Lon, lat1: rows[0].wgs84Lat, lon2: rows[1].wgs84Lon, lat2: rows[1].wgs84Lat, lon3: rows[2].wgs84Lon, lat3: rows[2].wgs84Lat}
                                console.log(JSON.stringify(json_data))
                                var sql4 = "update user_info set aedCall = 0"
                                db.query(sql4, (err,rows,field) => {
                                    if(err) {console.log("err in userRenew4\n"); console.log(err); res.send("error");}
                                    res.send(JSON.stringify(json_data))
                                })
                            })
                        }
                    }
                })
            } 
        })
    }
})






app.get('/userWarnTest', (req,res)=> {
    var options = {
      uri: 'http://45.76.197.124:3000/userWarn',
      method: 'POST',
      json: {
        "user_id" : '2012', "lat": '37.5608439', "lon" : '126.936160'
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(error);
        console.log(body.id) // Print the shortened url.
      }
    else {
        res.send("test");
        }
    });
})


app.post('/userWarn', jsonParser, (req,res)=> {
    if(!req.body) return res.sendStatus(400)
    else {
        var userId = req.body.user_id;
        var x = req.body.lon;
        var y = req.body.lat;
        var sql = "select wgs84Lon, wgs84Lat, (power(wgs84Lon - "+ x + ",2) + power(" + y + "- wgs84Lat, 2)) as distance from aed_list order by distance limit 3 "
   
         db.query(sql, (err,rows,field)=> {
            if(err) {
                console.log("err in userWarn\n");
                console.log(err)
                res.send("error");
            }
            else {
                var sql2 = "update aed_list set aed_call = 1, userX = " + x + " , userY = " + y + " where (wgs84Lon = ? and wgs84Lat = ?) or (wgs84Lon = ? and wgs84Lat = ?) or (wgs84Lon = ? and wgs84Lat = ?)"
                var list = [rows[0].wgs84Lon, rows[0].wgs84Lat,
                            rows[1].wgs84Lon, rows[1].wgs84Lat,
                            rows[2].wgs84Lon, rows[2].wgs84Lat]

                db.query(sql2, list, (err,rows,field)=> {
                    if(err) {
                        console.log("err in userWarn2\n");
                        console.log(err);
                        res.send("error");
                    }
                    else {
                        var sql3 = "update user_info set aedCall = 1 order by (power(x-?,2) + power(y-?,2)) limit 1"
                        var list3 = [x,y];
                        db.query(sql3, list3, (err,rows,field)=> {
                            if (err) {
                                console.log("err in userWarn3\n");
                                console.log(err);
                                res.send("error");
                            }  
                            else {
                                res.send("check");
                            }
                        })
                    }
                })
            }
        })
    }
})



app.get('/', (req,res)=>{
    res.render('main');
});


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/userLocationTest', (req, res)=>{
    var user_id = req.body.user_id,
        lat = req.body.lat,
        lon = req.body.lon;
    
    var sql = "select * from user_info where userId = " + user_id; 
        db.query(sql, (err,rows,field)=> {
            if(err) {
                console.log("err in userLocationTest");
                console.log(err);
            } else {
                res.send(lat + ", " + lon);
            }
        })

});




app.get('/aedRequest', (req,res)=> {
//console.log("asdf");
        var Y_point         = 37.5608439;        // Y 좌표
        var X_point         = 126.9355021;       // X 좌표

    var sql = "select aed_call,userX,userY from aed_list where wgs84Lon = ? and wgs84Lat = ?"
    var list = [X_point, Y_point]
    db.query(sql, list, (err, rows, field) =>{
		//console.log(rows[0]);
		if(err){
	       	console.log(err);
	       	res.status(500).send('Internal Server Error');
     	}
        if(rows[0].aed_call == 1) {
             console.log("warning")
            res.send(JSON.stringify(rows[0]));
            var sql2 = "update aed_list set aed_call = 0, userX = 0, userY = 0 where wgs84Lon = ? and wgs84Lat = ?"
                db.query(sql2, list, (err,rows,field) => {

                })

        }
        else {
            console.log("wait")
            res.send('0');  
        }
	})
})

app.get('/aedClient', (req,res)=> {
    res.render('test');
})


app.listen("3000", ()=>{
	console.log("3000 port connected")
});
