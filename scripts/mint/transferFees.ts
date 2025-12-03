import { extension } from "@solana-program/token-2022";
import { getInitializeTransferFeeConfigInstruction } from "@solana-program/token-2022";
import {
  TRANSFER_FEE_BASIS_POINTS,
  TRANSFER_FEE_MAXIMUM,
} from "../config/constants";
import type { Address } from "@solana/kit";

/**
 * Creates transfer fee configuration
 */
export function createTransferFeeConfig(authorityAddress: Address) {
  const transferFees = {
    epoch: 0,
    transferFeeBasisPoints: TRANSFER_FEE_BASIS_POINTS,
    maximumFee: TRANSFER_FEE_MAXIMUM,
  };

  return extension("TransferFeeConfig", {
    transferFeeConfigAuthority: authorityAddress,
    withdrawWithheldAuthority: authorityAddress,
    withheldAmount: 0n,
    olderTransferFee: transferFees,
    newerTransferFee: transferFees,
  });
}

/**
 * Creates the instruction to initialize transfer fees on a mint
 */
export function createInitializeTransferFeeInstruction(
  mintAddress: Address,
  authorityAddress: Address,
) {
  return getInitializeTransferFeeConfigInstruction({
    mint: mintAddress,
    withdrawWithheldAuthority: authorityAddress,
    transferFeeConfigAuthority: authorityAddress,
    transferFeeBasisPoints: TRANSFER_FEE_BASIS_POINTS,
    maximumFee: TRANSFER_FEE_MAXIMUM,
  });
}
