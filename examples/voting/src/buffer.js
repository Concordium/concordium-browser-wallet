/* eslint-disable import/no-unresolved */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import { toBuffer } from '@concordium/web-sdk';
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

export function decodeView(result) {
    const offset0 = 0;
    const buffer = toBuffer(result, 'hex');
    const [descriptionText, offset1] = decodeString(buffer, offset0);
    const endTimestamp = buffer.readBigUInt64LE(offset1);
    const endTime = moment.unix(Number(endTimestamp / BigInt(1000)));
    const [opts, offset2] = decodeStrings(buffer, offset1 + 8);
    const numOptions = buffer.readUInt32LE(offset2);
    return {
        descriptionText,
        endTime,
        opts,
        numOptions,
    };
}

export function decodeVotes(votesResult) {
    const votes = new Array(0);
    votesResult.forEach((element) => {
        const offset0 = 0;
        const buffer = toBuffer(element.returnValue, 'hex');
        const [voteCount] = [buffer.readUInt32LE(offset0), offset0 + 4];
        votes.push(voteCount);
    });
    return votes;
}
