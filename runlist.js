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
    listjson = JSON.parse(fs.readFileSync("conf/list.json"));

var args = process.argv;
var start = parseInt(args[2]),
    total = parseInt(args[3]) + start;

var formid = args[4];
var index = start;
// 构造请求信息

var arctype = listjson[configjson.arctype];
var oneFrom = arctype[formid];
var tablename = "spider_list_" + oneFrom.type;

var options = {
    hostname: oneFrom.host,
    port: 80,
    method: 'GET'
};

function makeDom(html, callback) {
    jsdom.env({
        html: html,
        src: [jquery],
        done: function(errors, window) {
            var $ = window.$;
            callback(errors, $);
            window.close();
        }
    });
}

function setOption(callback) {
    if (index == 0) {
        options.path = oneFrom.first;
    } else {
        options.path = oneFrom.else.replace("elsenum", oneFrom.elsenum == 1 ? index : index + 1);
    }
    crawl(callback);
}

function crawl(callback) {
    var req = http.request(options, function(res) {
        var bufferHelper = new BufferHelper();
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function() {
            var val = iconv.decode(bufferHelper.toBuffer(), 'gb2312');
            parseBUFANLISTHtml(val, callback);
        });
    });

    req.on('error', function(e) {
        console.log(('请求列表页失败: ' + e.message).red);
    });

    req.end();
    console.log(('开始抓取列表页').green);
}

function parseBUFANLISTHtml(html, callback) {
    // html = html.replace(/<iframe src="\/ad.*<\/iframe>/,"")
    makeDom(html, function(errors, $) {
        // 游戏列表
        var gameUl = eval(oneFrom.gameul);
        // 获取每一个游戏信息
        gameUl.each(function() {
            var li = $(this);
            var sql = "INSERT INTO " + tablename + " (id,";
            oneFrom.getname.forEach(function(onevalue) {
                sql += onevalue + ",";
            })
            sql += "arcid,status) VALUES(null,";
            oneFrom.getname.forEach(function(onevalue) {
                var getonevalue = eval(oneFrom[onevalue]);
                if (!getonevalue) {
                    getonevalue = "";
                }
                var parsedvalue = getonevalue.replace(/[\']/g, '"');
                sql += "'" + parsedvalue + "',"
            })
            sql += oneFrom.arcid+",0)";
            mysql.clientMysql(sql, function(error, result) {
                if (error) {
                    console.log(index + " error");
                }
            })
        });
        console.log(('第' + index + '页抓取完毕').yellow);
        index++;
        callback();
    });
}

function checkTable(cb) {
    var sql = "create table if not exists " + tablename + " (id INT NOT NULL AUTO_INCREMENT ,";
    oneFrom.getname.forEach(function(onevalue) {
        sql += onevalue + " VARCHAR(255) NULL ,";
    })
    sql += " arcid INT(255) NOT NULL , status BOOLEAN NOT NULL DEFAULT FALSE , PRIMARY KEY  (`id`) , UNIQUE (`archref`)) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_general_ci";
    mysql.clientMysql(sql, function(error, result) {
        if (error) return console.log(error) //console.log("create table failed");
        cb();
    })
}

checkTable(function() {
    async.whilst(
        function() {
            return index < total;
        },
        setOption,
        function(err) {
            console.log('抓取结束'.red)
        }
    )
});
