import * as solana from "@solana/kit";
import { createClient } from "./client";

main();

async function main() {
  const client = createClient();
  const account = solana.address("67DhuD4uGmeLhpaU5QSvw856P3TMfbzErt62yGQJuoYS")
  const balance = await client.rpc.getBalance(account).send();

  console.log("Total: ", balance);
}
