import {
  appendTransactionMessageInstruction,
  type BaseTransactionMessage,
  type TransactionMessageWithFeePayer,
  type Rpc,
  type SolanaRpcApi,
} from "@solana/kit";
import {
  estimateComputeUnitLimitFactory,
  getSetComputeUnitLimitInstruction,
} from "@solana-program/compute-budget";

/**
 * Estimates the compute units needed and adds the limit instruction
 */
export function createComputeUnitEstimator(rpc: Rpc<SolanaRpcApi>) {
  const estimateComputeUnitLimit = estimateComputeUnitLimitFactory({ rpc });

  return async function estimateAndAddComputeUnitLimit<
    T extends BaseTransactionMessage & TransactionMessageWithFeePayer,
  >(transactionMessage: T) {
    const computeUnitsEstimate =
      await estimateComputeUnitLimit(transactionMessage);

    const computeUnitInstruction = getSetComputeUnitLimitInstruction({
      units: computeUnitsEstimate,
    });

    return appendTransactionMessageInstruction(
      computeUnitInstruction,
      transactionMessage,
    );
  };
}
