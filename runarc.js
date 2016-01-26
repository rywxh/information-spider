var colors = require('colors'),
    jsdom = require('jsdom').jsdom,
    async = require('async'),
    http = require('http'),
    fs = require('fs'),
    iconv = require('iconv-lite'),
    jquery = fs.readFileSync("./jquery.js", "utf-8"),
    mysql = require('node-mysql'),
    BufferHelper = require('bufferhelper'),
    configjson = JSON.parse(fs.readFileSync("conf/config.json")),
    arcjson = JSON.parse(fs.readFileSync("conf/arc.json"));

var args = process.argv;
var arcindex = 0;

var start = args[2],
    total = args[3];

var formid = args[4];

var listtablename = "spider_list_" + configjson.listname[formid];
var tablename = "spider_arc_"+configjson.listname[formid];

console.log(start+" "+total);
//var oneFrom = arctype["http://www.3366.com/heji/340.shtml"];

// var options = {
//     hostname: oneFrom.host,
//     port: 80,
//     method: 'GET'
// };

// function makeDom(html, callback) {
//     jsdom.env({
//         html: html,
//         src: [jquery],
//         done: function(errors, window) {
//             var $ = window.$;
//             callback(errors, $);
//             window.close(); // 释放window相关资源，否则将会占用很高的内存
//         }
//     });
// }

// function setOption(result) {
//     return function(callback) {
//         var id = result[arcindex].id;
//         var href = result[arcindex].archref;
//         var title = result[arcindex].title;
//         var icon = result[arcindex].icon;
//         options.path ="http://"+href;
//         crawl(id, title, icon, callback);
//     }
// }

// function crawl(id, title, icon, callback) {
//     var req = http.request(options, function(res) {
//         var bufferHelper = new BufferHelper();
//         res.on('data', function(chunk) {
//             bufferHelper.concat(chunk);
//         });
//         res.on('end', function() {
//             var val = iconv.decode(bufferHelper.toBuffer(), 'gb2312');
//             parseArclist(id, title, icon, val, callback);
//         });
//     });

//     req.on('error', function(e) {
//         console.log(('请求文章页失败: ' + e.message).red);
//     });

//     req.end();
//     console.log(('开始抓取文章页').green);
// }


// function parseArclist(id,title,icon,html,callback) {
//     makeDom(html, function(errors, $) {
//         var sql = "INSERT INTO spider_arc_zhanqi (id,title,icon,";
//         oneFrom.getname.forEach(function(onevalue) {
//             sql += onevalue + ",";
//         })
//         sql += "status) VALUES(null,'"+title+"','"+icon+"',";
//         oneFrom.getname.forEach(function(onevalue) {
//             var getonevalue = eval(oneFrom[onevalue]);
//             if(onevalue=="playaddress"){
//                   getonevalue = getonevalue.match(/\'.*\'/)[0];
//             }
//             var parsedvalue = getonevalue.replace(/[\']/g, '"');
//             sql += "'" + parsedvalue + "',"
//         })
//         sql += "0)";
//     console.log(sql)
//         // mysql.clientMysql(sql, function(error, result) {
//         //     if (error) return mysql.clientMysql("DELETE FROM spider_list_juese WHERE id=" + id, function() {});
//         //     mysql.clientMysql("UPDATE spider_list_juese SET status = 1 WHERE id=" + id, function() {})
//         // })
//         // console.log(('id: ' + id + '抓取完毕').yellow);
//         // arcindex++;
//         // callback();
//     });
// }

// function checkTable(cb) {
//     var sql = "create table if not exists " + tablename + " (id INT NOT NULL AUTO_INCREMENT ,";
//     oneFrom.getname.forEach(function(onevalue) {
//         sql += onevalue + " VARCHAR(255) NULL ,";
//     })
//     sql += " arcid INT(255) NOT NULL , status BOOLEAN NOT NULL DEFAULT FALSE , PRIMARY KEY  (`id`) , UNIQUE (`archref`)) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_general_ci";
//     mysql.clientMysql(sql, function(error, result) {
//         if (error) return console.log(error) //console.log("create table failed");
//         cb();
//     })
// }

// var sql = "SELECT id,title,icon,archref FROM "+listtablename+" WHERE status=0 LIMIT " + start + "," + total;
// mysql.clientMysql(sql, function(error, result) {
//     async.whilst(
//         function() {
//             return arcindex < result.length;
//         },
//         setOption(result),
//         function(err) {
//             console.log('抓取结束'.red)
//         }
//     )
// })
