import { ErgoBox } from '@fleet-sdk/core';
import { LosslessNumber, parse } from 'lossless-json';

export const EXPLORER_API = 'https://api.ergoplatform.com/api/v1';

function record(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
  return value;
}

function integer(value, name, minimum = 0n) {
  // Never repair an already-rounded Number by converting it to BigInt.
  if (typeof value === 'number' && !Number.isSafeInteger(value)) {
    throw new TypeError(`${name} must be an exact integer; parse the response text losslessly`);
  }
  if (!['bigint', 'number', 'string'].includes(typeof value) || !/^\d+$/.test(String(value))) {
    throw new TypeError(`${name} must be a non-negative integer`);
  }
  const result = BigInt(value);
  if (result < minimum) throw new RangeError(`${name} is too small`);
  return result;
}

function smallInteger(value, name, maximum = Number.MAX_SAFE_INTEGER) {
  const result = integer(value, name);
  if (result > BigInt(maximum)) throw new RangeError(`${name} is too large (maximum ${maximum})`);
  return Number(result);
}

function hex(value, name, length) {
  if (typeof value !== 'string' || !/^(?:[0-9a-fA-F]{2})+$/.test(value) ||
      (length !== undefined && value.length !== length)) {
    throw new TypeError(`${name} must be ${length ?? 'an even number of'} hexadecimal characters`);
  }
  return value.toLowerCase();
}

/** Project one Explorer REST box into the EIP-12 shape Fleet accepts. */
export function toFleetBox(source) {
  record(source, 'box');
  if (!Array.isArray(source.assets)) throw new TypeError('assets must be an array');
  const registers = record(source.additionalRegisters, 'additionalRegisters');
  const additionalRegisters = {};
  for (const [position, name] of Object.keys(registers).sort().entries()) {
    if (!/^R[4-9]$/.test(name)) throw new TypeError(`Unexpected register ${name}`);
    if (name !== `R${position + 4}`) throw new TypeError('Registers must be densely packed from R4');
    additionalRegisters[name] = hex(record(registers[name], name).serializedValue, name);
  }
  const box = {
    boxId: hex(source.boxId, 'boxId', 64),
    transactionId: hex(source.transactionId, 'transactionId', 64),
    index: smallInteger(source.index, 'index', 65535),
    value: integer(source.value, 'value', 1n).toString(),
    // Fleet 0.12.0 uses signed bitwise shifts here; its supported range is narrower than wire u32.
    creationHeight: smallInteger(source.creationHeight, 'creationHeight', 2147483647),
    ergoTree: hex(source.ergoTree, 'ergoTree'),
    assets: source.assets.map((asset) => ({
      tokenId: hex(record(asset, 'asset').tokenId, 'tokenId', 64),
      amount: integer(asset.amount, 'amount', 1n).toString()
    })),
    additionalRegisters
  };
  // This detects inconsistent serialized content, not chain membership or ownership.
  if (!ErgoBox.validate(box)) throw new Error(`Box content does not match boxId ${box.boxId}`);
  return box;
}

/** Preserve JSON integer lexemes before selecting fields for Fleet. */
export function parseExplorerPage(text) {
  const source = record(parse(text, undefined, (number) => {
    // Keep other numeric lexemes exact too; integer schema fields reject these objects.
    return /^-?\d+$/.test(number) ? BigInt(number) : new LosslessNumber(number);
  }), 'page');
  if (!Array.isArray(source.items)) throw new TypeError('page.items must be an array');
  return {
    total: smallInteger(source.total, 'page.total'),
    boxes: source.items.map(toFleetBox)
  };
}

/** Fetch one page. Callers choose additional pages and an AbortSignal. */
export async function fetchBoxPage({ address, tokenId, limit = 20, offset = 0, signal } = {}, fetchImpl = fetch) {
  if ((address === undefined) === (tokenId === undefined)) {
    throw new TypeError('Provide exactly one address or tokenId');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
      !Number.isSafeInteger(offset) || offset < 0) {
    throw new RangeError('Use limit 1..100 and a non-negative integer offset');
  }
  const value = tokenId === undefined ? address : hex(tokenId, 'tokenId', 64);
  if (typeof value !== 'string' || value.length === 0) throw new TypeError('address must be nonempty');
  const endpoint = tokenId === undefined ? 'byAddress' : 'byTokenId';
  const url = new URL(`${EXPLORER_API}/boxes/unspent/${endpoint}/${encodeURIComponent(value)}`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  const response = await fetchImpl(url, { headers: { accept: 'application/json' }, signal });
  if (!response.ok) throw new Error(`Explorer returned HTTP ${response.status}`);
  const page = parseExplorerPage(await response.text());
  return { ...page, offset, limit };
}
