//Headers size
var headerSize = {
    0b00: 12,
    0b01: 8,
    0b10: 4,
    0b11: 1
}

var position = {
    chunkHeaderType: 0,
    timestampDelta: 1,
    packetLength: 4,
    messageTypeId: 7,
    messageStreamId: 8
}

/**
 * Constructor
 */
function Packet(raw) {
    this.raw = raw;
    this._parse();
}

Packet.prototype.toString = function() {
    var s = "--HEADERS--\n";
    s += "Header Size: "+this.headerSize+" (id: "+this.headerId+")\n"
    s += "Stream id: "+this.streamId + "\n";
    s += "Timestamp delta: "+this.timestampDelta + "\n";
    s += "Packet length: "+this.packetLength + "\n";
    s += "Message Type ID: "+this.messageTypeId + "\n";
    s += "Message Stream ID: "+this.messageStreamId + "\n";
    s += "-----------";
    return s;
}

Packet.prototype._parse = function() {
    //first byte
    this.headerId = this.raw[position.chunkHeaderType] >> 6; 
    this.headerSize = headerSize[this.headerId]; 
    this.streamId = this.raw[position.chunkHeaderType] & 0b00111111;

    if (this.headerSize < 1) { return; }
    this.timestampDelta = int6(this.raw, position.timestampDelta);
    
    if (this.headerSize < 2) { return; }
    this.packetLength = int6(this.raw, position.packetLength);
    
    if (this.headerSize < 3) { return; }
    this.messageTypeId = this.raw[position.messageTypeId];
    
    if (this.headerSize < 4) { return; }
    this.messageStreamId = this.raw.readUInt32LE(position.messageStreamId);
}

function int6(raw, start) {
    return (raw[start] << 8*2) + (raw[start+1] << 8) + raw[start+2];
}

module.exports = Packet;
