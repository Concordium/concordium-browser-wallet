import {toBuffer} from "@concordium/web-sdk";
import moment from 'moment';

export function decodeString(buffer, offset) {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    return [buffer.slice(offset, offset + length).toString('utf8'), offset + length];
}

export function decodeStrings(buffer, offset) {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    const res = [];
    for (let i = 0; i < length; i++) {
        const [str, nextOffset] = decodeString(buffer, offset);
        offset = nextOffset;
        res.push(str);
    }
    return [res, offset];
}

export function decodeStringIntMap(buffer, offset) {
    const length = buffer.readUInt32LE(offset);
    offset += 4;
    const res = {};
    for (let i = 0; i < length; i++) {
        const [key, nextOffset1] = decodeString(buffer, offset);
        const [val, nextOffset2] = [buffer.readUInt32LE(nextOffset1), nextOffset1 + 4];
        offset = nextOffset2;
        res[key] = val;
    }
    return [res, offset];
}

export function decodeVotingView(result) {
    const offset0 = 0;
    const buffer = toBuffer(result, 'hex');
    const [descriptionText, offset1] = decodeString(buffer, offset0);
    const [opts, offset2] = decodeStrings(buffer, offset1);
    const [tally, offset3] = decodeStringIntMap(buffer, offset2);
    const [voteCount, offset4] = [buffer.readUInt32LE(offset3), offset3 + 4];
    const endTimestamp = buffer.readBigUInt64LE(offset4);
    const endTime = moment.unix(Number(endTimestamp / BigInt(1000)));
    return {
        descriptionText,
        opts,
        tally,
        voteCount,
        endTime,
    };
}
