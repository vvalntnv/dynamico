use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ProjectState {
    // TODO: Add optional mint auth
    pub mint_authority: Pubkey,
    pub freeze_authority: Pubkey,
    pub founder: Pubkey,

    #[max_len(10)]
    pub admins: Vec<Pubkey>,
    pub withdraw_authority: Pubkey,
    pub treasury: Pubkey,
    pub max_fee_bps: u16,
}

#[account]
pub struct WithdrawAccount;

#[account]
pub struct TreasuryAccount;

#[account]
pub struct MintAccountPDA;

#[account]
pub struct FreezeAccountPDA;
