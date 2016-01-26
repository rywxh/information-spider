var child_process = require("child_process"),
    fs = require("fs"),
    async = require('async'),
    mysql = require('node-mysql'),
    configjson = JSON.parse(fs.readFileSync("conf/config.json")),
    listjson = JSON.parse(fs.readFileSync("conf/list.json")),
    arcjson = JSON.parse(fs.readFileSync("conf/arc.json"));

var index = 0,
    step = 10,
    MaxRuntime = 10,
    nextTotal = 0,
    overTime,
    start,
    total;

if (configjson.type == "list") {
    list_init();
} else {
    arc_init();
}

function arc_init() {
    var lisnum = configjson["listname"].length;
    async.whilst(
        function() {
            return index < lisnum;
        },
        handerarc,
        function(err) {
            console.log('抓取结束'.red)
        }
    )
}

function list_init() {
    var lisnum = listjson[configjson.arctype].length;
    async.whilst(
        function() {
            return index < lisnum;
        },
        handerlist,
        function(err) {
            console.log('抓取结束'.red)
        }
    )
}

function handerarc(callback) {
    var sql = "SELECT count(*) FROM spider_list_" + configjson["listname"][index];
    mysql.clientMysql(sql, function(error, result) {
        if (error) return console.log(index + " error");
        total = result[0]["count(*)"];
        start = 0;
        if (total < step) {
            MaxRuntime = 1;
            overTime = 0;
            return runNewArc(start, total, callback);
        }
        Start(total, callback);
    })
}

function handerlist(callback) {
    total = listjson[configjson.arctype][index].total,
        start = listjson[configjson.arctype][index].start;

    if (total < step) {
        MaxRuntime = 1;
        overTime = 0;
        return runNewList(start, total, callback);
    }
    Start(total, callback);
}

function Start(stotal, callback) {
    if (stotal > step * MaxRuntime) {
        nextTotal = stotal - (step * MaxRuntime);
        stotal = step * MaxRuntime;
    } else {
        nextTotal = 0;
    }
    var runTime = Math.ceil(stotal / step);

    if (runTime < MaxRuntime) {
        step = Math.ceil(stotal / MaxRuntime);
    }
    runTime = MaxRuntime;
    overTime = 0;
    if (stotal < step) step = stotal;
    for (var i = 0; i < runTime; i++) {
        var newstart = step * i + start;
        if (configjson.type == "list") {
            runNewList(newstart, step, callback);
        } else {
            runNewArc(newstart, step, callback);
        }
    }
}


function runNewArc(newstart, atotal, callback) {
    console.log(newstart);
    // overTime++;
    // if (overTime == MaxRuntime) {
    //     if (nextTotal > 0) return Start(nextTotal, callback);
    //     console.log(listjson[configjson.arctype][index].url + "end");
    //     index++;
    //     callback();
    // }
    // var one = child_process.exec('node runarc.js ' + start + ' ' + total + ' ' + index, {
    //     cwd: process.cwd()
    // });

    // one.stdout.on('data', function(data) {
    //     console.log('stdout: ' + data);
    // });

    // one.stderr.on('data', function(data) {
    //     console.log('stderr: ' + data);
    //     overTime++;
    //     if (overTime == MaxRuntime) {
    //         if (nextTotal > 0) return Start(nextTotal,callback);
    //         console.log(listjson[configjson.arctype][index].url + "end");
    //         index++;
    //         callback();
    //     }
    // });

    // one.on('exit', function() {
    //     overTime++;
    //     if (overTime == MaxRuntime) {
    //         if (nextTotal > 0) return Start(nextTotal,callback);
    //         console.log(listjson[configjson.arctype][index].url + "end");
    //         index++;
    //         callback();
    //     }
    // })
}

function runNewList(start, total, callback) {

    var one = child_process.exec('node runlist.js ' + start + ' ' + total + ' ' + index, {
        cwd: process.cwd()
    });

    one.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });

    one.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
        overTime++;
        if (overTime == MaxRuntime) {
            if (nextTotal > 0) return Start(nextTotal, callback);
            console.log(listjson[configjson.arctype][index].url + "end");
            index++;
            callback();

        }
    });

    one.on('exit', function() {
        overTime++;
        if (overTime == MaxRuntime) {
            if (nextTotal > 0) return Start(nextTotal, callback);
            console.log(listjson[configjson.arctype][index].url + "end");
            index++;
            callback()

        }
    })
}
