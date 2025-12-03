import { ExtensionArgs, getMintSize } from "@solana-program/token-2022";
import { getCreateAccountInstruction } from "@solana-program/system";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@solana-program/token-2022";
import type {
  Rpc,
  SolanaRpcApi,
  TransactionSigner,
  MessageSigner,
} from "@solana/kit";

/**
 * Calculates the size needed for a mint account with extensions
 */
export function calculateMintSize(extensions: ExtensionArgs[]) {
  return getMintSize(extensions);
}

/**
 * Gets the rent amount needed for a mint account
 */
export async function getMintRentAmount(
  mintSize: number,
  rpc: Rpc<SolanaRpcApi>,
) {
  const rentAmount = await rpc
    .getMinimumBalanceForRentExemption(BigInt(mintSize))
    .send();

  return rentAmount;
}

/**
 * Creates the instruction to create a new mint account
 */
export async function createMintAccountInstruction(
  mint: TransactionSigner & MessageSigner,
  wallet: TransactionSigner & MessageSigner,
  extensions: any[],
  rpc: Rpc<SolanaRpcApi>,
) {
  const mintSize = calculateMintSize(extensions);
  const rentAmount = await getMintRentAmount(mintSize, rpc);

  return getCreateAccountInstruction({
    payer: wallet,
    newAccount: mint,
    space: mintSize,
    lamports: rentAmount,
    programAddress: TOKEN_2022_PROGRAM_ADDRESS,
  });
}
