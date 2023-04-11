import { TextDecoder, TextEncoder } from 'util';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-var-requires
Object.assign(global, require('jest-chrome'));
