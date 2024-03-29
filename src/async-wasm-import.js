import load, { create } from "../gen/wasm.js"
import { name, code, DIGEST_SIZE_LENGTH, CODE_LENGTH } from './constant.js'
export * from "./type.js"
export { name, code, DIGEST_SIZE_LENGTH, CODE_LENGTH }

// load bytecode with import
// there are runtimes like cloudflare workers where
// all other paths are disallowed by embedder
// @ts-expect-error
import bytecode from "../gen/wasm_bg.wasm"

let ready = load(bytecode)

/**
 * @param {Uint8Array} payload
 * @returns {Promise<import("multiformats/link").MultihashDigest<typeof code>>}
 */
export const digest = async (payload) => {
  await ready
  const hasher = create()
  hasher.write(payload)
  const bytes = new Uint8Array(hasher.multihashByteLength())
  hasher.digestInto(bytes, 0, true)
  hasher.free()
  return {
    code,
    // next byte will hold digest varint and it never exceeds the one byte
    size: bytes[CODE_LENGTH],
    digest: bytes.subarray(CODE_LENGTH + DIGEST_SIZE_LENGTH),
    bytes
  }
}