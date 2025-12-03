import { getInitializeMintInstruction } from "@solana-program/token";
import { MINT_DECIMALS } from "../config/constants";
import type { Address } from "@solana/kit";

/**
 * Creates the instruction to initialize a mint
 */
export function createInitializeMintInstruction(
  mintAddress: Address,
  authorityAddress: Address,
) {
  return getInitializeMintInstruction({
    mint: mintAddress,
    decimals: MINT_DECIMALS,
    mintAuthority: authorityAddress,
    freezeAuthority: authorityAddress,
  });
}
