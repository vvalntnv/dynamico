import { createClient } from "./client";
import { createMint } from "./mint/createMint";

/**
 * Main script: Creates a Solana token (mint) with transfer fees
 */
async function main() {
  const client = await createClient();

  const mintAddress = await createMint(client);

  console.log("Token created successfully!");
  console.log("Mint address:", mintAddress);
}

main();
