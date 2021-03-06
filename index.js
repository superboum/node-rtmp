var net = require('net');
var Client = require('./lib/net/client');

net.createServer(function (socket) {


    var currentClient = new Client();
    console.log("New connection from "+socket.remoteAddress);

    socket.on('data', function(data) {
        console.log("New data from "+socket.remoteAddress);
        var res = currentClient.replyTo(data);
        if (res !== null) 
            socket.write(res);
    });

    socket.on('end', function () {
        console.log("Disconnection from "+socket.remoteAddress);
        currentClient = new Client();
    });
    socket.on("error", function (err) {
        console.log("Caught an error");
        currentClient = new Client();
    });
}).listen(1935);

console.log("RTMP server running on port 1935");
