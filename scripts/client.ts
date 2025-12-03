import {
  airdropFactory,
  generateKeyPairSigner,
  lamports,
  MessageSigner,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
  TransactionSigner,
} from "@solana/kit";

import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

export type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  wallet: TransactionSigner & MessageSigner;
};

let client: Client | undefined;
export async function createClient(): Promise<Client> {
  if (!client) {
    const signer = await generateKeyPairSigner();
    const rpc = createSolanaRpc("http://127.0.0.1:8899");
    const rpcSubscriptions = createSolanaRpcSubscriptions(
      "ws://127.0.0.1:8900",
    );

    const airdrop = airdropFactory({ rpc, rpcSubscriptions });

    await airdrop({
      recipientAddress: signer.address,
      lamports: lamports(100_000_000_000n),
      commitment: "confirmed",
    });

    client = {
      rpc,
      rpcSubscriptions,
      wallet: signer,
    };
  }
  return client;
}
