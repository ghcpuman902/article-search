import { Buffer } from 'buffer';
import { type NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai';
import { inflate } from 'pako';
import { kv } from '@vercel/kv';

import { customHash } from '../../lib/utils'

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const getEmbeddingFromOpenAI = async (text: string) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
    });
    const embedding = response['data'][0]['embedding'];
    return new Float64Array(embedding);
};

export async function POST(request: NextRequest) {
    const rawData = await request.arrayBuffer();

    const decompressedData = inflate(rawData, { to: 'string' });

    const { texts } = JSON.parse(decompressedData); 
    // Function to encode a Float64Array to a base64 string
    function encodeBase64(float64Array) {
        // Create a Buffer from the float64Array's ArrayBuffer
        let buffer = Buffer.from(float64Array.buffer, float64Array.byteOffset, float64Array.byteLength);

        // Convert the Buffer to a base64 string
        let base64 = buffer.toString('base64');

        return base64;
    }

    // Function to decode a Float64Array from a base64 string
    function decodeBase64(base64String) {
        let buffer = Buffer.from(base64String, 'base64');

        // Its important to use the buffer created directly from the base64String
        let float64Array = new Float64Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Float64Array.BYTES_PER_ELEMENT);

        return float64Array;
    }
    
    const embeddingPromises = texts.map(async text => {
        const dependencyHash = 'AS::' + customHash(text);

        let cachedEmbeddings = await kv.get(dependencyHash);
        if (cachedEmbeddings) {
            // console.log('Cache hit:', dependencyHash);
            //@ts-ignore
            return decodeBase64(cachedEmbeddings);
        }

        // console.log('Cache miss:', dependencyHash);
        const embedding = await getEmbeddingFromOpenAI(text);
        kv.set(dependencyHash, encodeBase64(embedding),
            { ex: 7 * 24 * 60 * 60 });
        return embedding;
    });

    const results = await Promise.allSettled(embeddingPromises);

    const embeddings = results.filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value); // map the value from the result

    // const binaryEmbeddings = Buffer.from(new Float64Array(embeddings).buffer);
    // const stringifiedEmbeddings = JSON.stringify(embeddings);
    // const sizeBinary = binaryEmbeddings.length / 1024;
    // const sizeBinaryBase64 = Buffer.byteLength(binaryEmbeddings.toString('base64'), 'utf8') / 1024;
    // const sizeJSON = Buffer.byteLength(stringifiedEmbeddings, 'utf8') / 1024;
    // console.log(`binary length: ${sizeBinary}, binary base64 length: ${sizeBinaryBase64} stringified length: ${sizeJSON}; ratio: ${sizeBinary / sizeJSON}; ratio64: ${sizeBinaryBase64 / sizeJSON}`);

    const totalLength = embeddings.reduce((total, arr) => total + arr.length, 0);
    const responseArray = new Float64Array(totalLength);
    // console.log("Size of individual arrays in embeddings:", embeddings.map(arr => arr.length));
    // console.log("Total size required: ", totalLength);
    let currIdx = 0;
    for (let array of embeddings) {
        responseArray.set(array, currIdx); // copy each array into the new large array.
        currIdx += array.length;
    }
    const binaryData = Buffer.from(responseArray.buffer);
    return new Response(binaryData, {
        headers:{
            'Content-Type': 'application/octet-stream',
        }
    });
}
