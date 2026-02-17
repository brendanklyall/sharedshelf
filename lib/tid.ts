// Generate a valid AT Protocol TID (timestamp ID) for record rkeys.
// TIDs are 13-character base32-sortable strings encoding a microsecond
// timestamp with a random clock ID in the lower 10 bits.

const BASE32_CHARS = "abcdefghijklmnopqrstuvwxyz234567";

export function generateTID(): string {
  const timestamp = BigInt(Date.now()) * 1000n; // ms → microseconds
  const clockId = BigInt(Math.floor(Math.random() * 1024)); // 10 bits
  const tid = (timestamp << 10n) | clockId;

  let result = "";
  let n = tid;
  for (let i = 0; i < 13; i++) {
    result = BASE32_CHARS[Number(n & 31n)] + result;
    n >>= 5n;
  }
  return result;
}
