import { kv } from '@vercel/kv';
import { type NextRequest, NextResponse } from 'next/server'
import { Buffer } from 'buffer';
// DELETE method for deleting all keys
export async function DELETE(request: NextRequest) {
    return NextResponse.json('Unauthorized', { status: 401 });
    // const query = "AS::";
    // // scan all keys
    // for await (const key of kv.scanIterator()) {
    //     // check if key starts with 'AS::'
    //     if (key.startsWith(query)) {
    //         // delete the key
    //         await kv.del(key);
    //     }
    // }

    // return NextResponse.json('Keys deleted');
}

// POST method for listing all keys with query
export async function POST(request: NextRequest) {
    return NextResponse.json('Unauthorized', { status: 401 });
    // const query = "AS::";
    // let results: { key: string, value: any }[] = [];

    // function decodeBase64(base64String) {
    //     let buffer = Buffer.from(base64String, 'base64');

    //     // Its important to use the buffer created directly from the base64String
    //     let float64Array = new Float64Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Float64Array.BYTES_PER_ELEMENT);

    //     return float64Array;
    // }

    // // scan all keys
    // for await (const key of kv.scanIterator()) {
    //     // check if key starts with 'AS::'
    //     if (key.startsWith(query)) {
    //         // get the value of the key
    //         let value = JSON.stringify(await kv.get(key));

    //         // slice the value to first 100 characters
    //         //   value = value ? value.slice(0, 100) : '';
    //         // Function to decode a Float64Array from a base64 string


    //         // store the key and sliced value
    //         results.push({ key, value: Array.from(decodeBase64(value)) });
    //     }
    // }

    // return NextResponse.json(results);
}