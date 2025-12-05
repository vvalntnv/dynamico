use crate::{
    constats::{MINT_ACCOUNT_SEED, TREASURE_ACCOUNT_SEED, WITHDRAW_ACCOUNT_SEED},
    state::{TreasuryAccount, WithdrawAccount},
};
use anchor_lang::prelude::*;
use anchor_spl::{
    token::Mint,
    token_interface::{
        withdraw_withheld_tokens_from_accounts, withdraw_withheld_tokens_from_mint,
        WithdrawWithheldTokensFromAccounts,
    },
};
use anchor_spl::{token_2022::Token2022, token_interface::WithdrawWithheldTokensFromMint};

pub fn _withdraw_fees<'info>(
    ctx: Context<'info, 'info, 'info, 'info, WithdrawFeesContext<'info>>,
) -> Result<()> {
    let sources = ctx
        .remaining_accounts
        .iter()
        .map(|account_info| account_info.to_owned())
        .collect::<Vec<_>>();

    withdraw_withheld_tokens_from_accounts(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            WithdrawWithheldTokensFromAccounts {
                token_program_id: ctx.accounts.token_program.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                destination: ctx.accounts.treasury.to_account_info(),
                authority: ctx.accounts.withdraw_auth.to_account_info(),
            },
        ),
        sources,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawFeesContext<'info> {
    pub owner: Signer<'info>,

    #[account(
        seeds = [MINT_ACCOUNT_SEED, owner.key().as_ref()],
        bump
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        seeds = [WITHDRAW_ACCOUNT_SEED, mint.key().as_ref()],
        bump
    )]
    pub withdraw_auth: Account<'info, WithdrawAccount>,

    #[account(
        seeds = [TREASURE_ACCOUNT_SEED, owner.key().as_ref()],
        bump
    )]
    pub treasury: Account<'info, TreasuryAccount>,

    pub token_program: Program<'info, Token2022>,
}
