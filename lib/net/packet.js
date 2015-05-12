var amf = require('amf');

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

var messageTypes = {
    PKT_SIZE_MSG: 0x01,
    PING_MSG: 0x04,
    SRV_BW: 0x05,
    CLI_BW: 0x06,
    AUDIO_PKT: 0x08,
    VIDEO_PKT: 0x09,
    AMF3: 0x11,
    INVOKE: 0x12,
    AMF0: 0x14
}

/**
 * Constructor
 */
function Packet(raw) {
    this.raw = raw;
    this.read = 0;
    this.content = "";
    this._parseHeaders();
    this._parseContent();
}

Packet.prototype.toString = function() {
    var s = "--HEADERS--\n";
    s += "Header Size: "+this.headerSize+" (id: "+this.headerId+")\n"
    s += "Stream id: 0x"+this.streamId.toString(16) + "\n";
    s += "Timestamp delta: "+this.timestampDelta + "\n";
    s += "Packet length: "+this.packetLength + "\n";
    s += "Message Type ID: 0x"+this.messageTypeId.toString(16) + "\n";
    s += "Message Stream ID: 0x"+this.messageStreamId.toString(16) + "\n";
    s += "--CONTENT--\n";
    s += this.content + "\n";
    s += "-----------";
    return s;
}

/**
 * Get packet size
 */
Packet.prototype.size = function() {
    return this.headerSize + this.packetLength;
}

/** PRIVATE **/

/**
 * Parse headers
 */
Packet.prototype._parseHeaders = function() {
    //first byte
    this.headerId = this.raw[position.chunkHeaderType] >> 6; 
    this.headerSize = headerSize[this.headerId]; 
    this.streamId = this.raw[position.chunkHeaderType] & 0b00111111;

    if (this.headerSize < 1) { return; }
    this.timestampDelta = int24(this.raw, position.timestampDelta);
    
    if (this.headerSize < 2) { return; }
    this.packetLength = int24(this.raw, position.packetLength);
    
    if (this.headerSize < 3) { return; }
    this.messageTypeId = this.raw[position.messageTypeId];
    
    if (this.headerSize < 4) { return; }
    this.messageStreamId = this.raw.readUInt32LE(position.messageStreamId);
}

/**
 * Parse content 
 */
Packet.prototype._parseContent = function() {
    switch(this.messageTypeId) {
        case messageTypes.PKT_SIZE_MSG:
            this.content = this.raw.readInt32BE(this.headerSize);
            break;
        case messageTypes.AMF0:
            console.log("AMF0");
            this.content = amf.read(this.raw.slice(this.headerSize, this.size()),0); 
            break;
        default:
            console.log("Not yet implemented");
    }
}


/** TOOLS **/

/*
 * Extract int24 number from a buffer
 */
function int24(raw, start) {
    return (raw[start] << 8*2) + (raw[start+1] << 8) + raw[start+2];
}

module.exports = Packet;
