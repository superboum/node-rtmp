var Packet = require('./packet');

//Client State
var stateEnum = {
    ERROR: 0,
    DISCONNECTED: 1,
    HANDSHAKE: 2,
    CONNECTED: 3
}

var protocolVersion = 0x03;

//Random Data size
var randomDataSize = 1536;

/**
 * Constructor
 */
function Client() {
    this.state = stateEnum.DISCONNECTED;
}

/**
 * Reply to client
 * Called when data are received
 *
 * @param data Buffer a buffer containing raw data
 *
 * @return Buffer|null whether or not a response is required
 **/
Client.prototype.replyTo = function(data) {
    switch(this.state) {
        case stateEnum.ERROR:
            console.log('Error. An error occured');
            return null;
        case stateEnum.DISCONNECTED:
            console.log('Starting handshake');
            return this._handleHandshake(data);
        case stateEnum.HANDSHAKE:
            console.log('Finalize handshake');
            this._handleConfirmation(data);
            return null;
        case stateEnum.CONNECTED:
            console.log("Receiving data...");
            var p = new Packet(data);
            console.log(p.toString());
            console.log(p.raw);
            return null;
        default:
            console.log('Error. Unknown state');
            return null;
    }
}

/**
 * Handle handshake
 * Check handshake and extract data
 *
 * @param Buffer The raw data buffer
 *
 * @return Buffer
 */
Client.prototype._handleHandshake = function(data) {   
    //Handshake control. First byte (should be 0x03)
    if (data[0] != protocolVersion) {
        console.log("Wrong protocol version");
        this.state = stateEnum.ERROR;
        return null;
    }
    this.state = stateEnum.HANDSHAKE;

    //Extract 1536 bytes payload (0 to 1535). This is random data.
    var clientRandomData = data.slice(1, randomDataSize+1); 
    this.serverRandomData = new Buffer(randomDataSize);
    var headersData = new Buffer(1); headersData[0] = protocolVersion; 

    //Response to client (header + handshake server + client random data)
    var res = Buffer.concat(
            [headersData, this.serverRandomData, clientRandomData], 
            1+2*randomDataSize
    );
    return res;
}

/**
 * Handle confirmation
 * Check if response corresponds to our random data
 *
 * @param Buffer The raw data buffer
 *
 * @return null
 */
Client.prototype._handleConfirmation = function(data) {
    //console.log(data);
    if (data.equals(this.serverRandomData)) {
        this.state = stateEnum.CONNECTED;
    } else {
        this.state = stateEnum.ERROR;
    }
    return null;
}

module.exports = Client;
