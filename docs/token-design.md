# TiberMancini Token Design

## Basic Info

- Name: TiberMancini
- Symbol: TIBER
- Decimals: 6

## Supply

- Initial supply: 1,000,000 TIBER
- Base units: 1,000,000 * 10^6 = 1,000,000,000,000

Minted to:
- Admin wallet ATA for TIBER

## Transfer Fee (Token-2022)

- Fee basis points (BPS): 50  (0.50%)
- Max fee (base units): 10,000  (= 0.01 TIBER)

Fee receiver:
- Treasury account: ATA(TIBER_MINT, ADMIN_WALLET)

## Roles

- Admin wallet (mint + fee authority): <TO_FILL>
- Treasury ATA: <TO_FILL AFTER CREATION>

## Notes

- Fees are sent automatically by Token-2022 to the Treasury ATA on each transfer.
- Backend `/admin/set_fee` endpoint will be used to adjust BPS and max fee over time.


(method) def create_mint(
    conn: AsyncClient,
    payer: Keypair,
    mint_authority: Pubkey,
    decimals: int,
    program_id: Pubkey,
    freeze_authority: Pubkey | None = None,
    skip_confirmation: bool = False,
    recent_blockhash: Hash | None = None
) -> CoroutineType[Any, Any, AsyncToken]
