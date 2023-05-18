export function stringToArrayBuffer(s) {
    let buf = new ArrayBuffer(s.length);
    let bytes = new Uint8Array(buf);
    for (let i=0; i<s.length; i++) {
        bytes[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
}