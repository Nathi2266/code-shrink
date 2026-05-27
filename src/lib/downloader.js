/**
 * Client-side file download utilities
 */

export function downloadAsText(code, filename = 'shortened_code.txt') {
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadAsZip(code, filename = 'shortened_code.txt') {
  // Build a minimal ZIP file manually (no external lib needed for single file)
  const encoder = new TextEncoder();
  const fileData = encoder.encode(code);
  const fileNameBytes = encoder.encode(filename);

  // Local file header
  const localHeader = buildLocalFileHeader(fileNameBytes, fileData);
  const centralDir = buildCentralDirEntry(fileNameBytes, fileData, 0);
  const endOfCentral = buildEndOfCentralDir(1, centralDir.length, localHeader.length + fileData.length);

  const zipParts = [localHeader, fileData, centralDir, endOfCentral];
  const totalLength = zipParts.reduce((acc, part) => acc + part.length, 0);
  const zipData = new Uint8Array(totalLength);

  let offset = 0;
  for (const part of zipParts) {
    zipData.set(part, offset);
    offset += part.length;
  }

  const blob = new Blob([zipData], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/\.[^.]+$/, '') + '.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function writeUint16LE(val) {
  return new Uint8Array([val & 0xff, (val >> 8) & 0xff]);
}
function writeUint32LE(val) {
  return new Uint8Array([val & 0xff, (val >> 8) & 0xff, (val >> 16) & 0xff, (val >> 24) & 0xff]);
}

function crc32(data) {
  const table = makeCRC32Table();
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeCRC32Table() {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

function buildLocalFileHeader(fileNameBytes, fileData) {
  const crc = crc32(fileData);
  const parts = [
    new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // signature
    writeUint16LE(20), // version needed
    writeUint16LE(0),  // flags
    writeUint16LE(0),  // compression (store)
    writeUint16LE(0),  // mod time
    writeUint16LE(0),  // mod date
    writeUint32LE(crc),
    writeUint32LE(fileData.length),
    writeUint32LE(fileData.length),
    writeUint16LE(fileNameBytes.length),
    writeUint16LE(0),  // extra field length
    fileNameBytes,
  ];
  const total = parts.reduce((a, p) => a + p.length, 0);
  const result = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { result.set(p, off); off += p.length; }
  return result;
}

function buildCentralDirEntry(fileNameBytes, fileData, localHeaderOffset) {
  const crc = crc32(fileData);
  const parts = [
    new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
    writeUint16LE(20), writeUint16LE(20),
    writeUint16LE(0), writeUint16LE(0),
    writeUint16LE(0), writeUint16LE(0),
    writeUint32LE(crc),
    writeUint32LE(fileData.length),
    writeUint32LE(fileData.length),
    writeUint16LE(fileNameBytes.length),
    writeUint16LE(0), writeUint16LE(0),
    writeUint16LE(0), writeUint16LE(0),
    writeUint32LE(0),
    writeUint32LE(localHeaderOffset),
    fileNameBytes,
  ];
  const total = parts.reduce((a, p) => a + p.length, 0);
  const result = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { result.set(p, off); off += p.length; }
  return result;
}

function buildEndOfCentralDir(entryCount, centralDirSize, centralDirOffset) {
  const parts = [
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    writeUint16LE(0), writeUint16LE(0),
    writeUint16LE(entryCount), writeUint16LE(entryCount),
    writeUint32LE(centralDirSize),
    writeUint32LE(centralDirOffset),
    writeUint16LE(0),
  ];
  const total = parts.reduce((a, p) => a + p.length, 0);
  const result = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { result.set(p, off); off += p.length; }
  return result;
}
