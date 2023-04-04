import { Buffer } from 'buffer/';

/**
 * Partitions a Buffer into chunks of a certain size. The final chunk
 * may have a different size than the provided size.
 * @param array the Buffer to chunk
 * @param chunkSize the size of each chunk
 */
export function chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
    if (chunkSize <= 0) {
        throw new Error('Chunk size has to be a positive number.');
    }
    const chunks: Buffer[] = [];
    for (let i = 0; i < buffer.length; i += chunkSize) {
        chunks.push(buffer.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Async timeout
 * time: timeout length, in milliseconds.
 */
export async function sleep(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
