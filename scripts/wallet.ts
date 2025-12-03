import { createKeyPairSignerFromBytes } from "@solana/kit";
import path from "path";
import fs from "fs";
import os from "os";

export async function loadLocalWallet() {
  const keypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const raw = fs.readFileSync(keypairPath, "utf8");
  const keypairBytes = Uint8Array.from(JSON.parse(raw)); // 64-byte secret key array

  const signer = await createKeyPairSignerFromBytes(keypairBytes);
  return signer;
}
