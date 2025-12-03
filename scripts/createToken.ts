import * as solana from "@solana/kit";
import { createClient } from "./client";
import { getCreateAccountInstruction } from "@solana-program/system";

main();

async function main() {
  const client = await createClient();
}
