import {
  generateKeyPairSigner,
  lamports,
  type Rpc,
  type RpcSubscriptions,
  type SolanaRpcApi,
  type SolanaRpcSubscriptionsApi,
  type TransactionSigner,
  type MessageSigner,
  airdropFactory,
} from "@solana/kit";
import { AIRDROP_AMOUNT } from "../config/constants";

/**
 * Creates a new wallet (keypair signer)
 */
export async function createWallet() {
  const wallet = await generateKeyPairSigner();
  return wallet;
}

/**
 * Funds a wallet with SOL from the faucet
 */
export async function fundWallet(
  wallet: TransactionSigner & MessageSigner,
  rpc: Rpc<SolanaRpcApi>,
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
) {
  const airdrop = airdropFactory({ rpc, rpcSubscriptions });

  await airdrop({
    recipientAddress: wallet.address,
    lamports: lamports(AIRDROP_AMOUNT),
    commitment: "confirmed",
  });
}

/**
 * Creates and funds a new wallet
 */
export async function createAndFundWallet(
  rpc: Rpc<SolanaRpcApi>,
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
) {
  const wallet = await createWallet();
  await fundWallet(wallet, rpc, rpcSubscriptions);
  return wallet;
}
