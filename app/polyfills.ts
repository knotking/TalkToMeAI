import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { decode, encode } from 'base-64';
const TextEncodingPolyfill = require('text-encoding');

if (!global.btoa) {
    global.btoa = encode;
}

if (!global.atob) {
    global.atob = decode;
}

if (!global.TextEncoder) {
    global.TextEncoder = TextEncodingPolyfill.TextEncoder;
}

if (!global.TextDecoder) {
    global.TextDecoder = TextEncodingPolyfill.TextDecoder;
}

