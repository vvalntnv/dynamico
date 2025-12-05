use crate::constats::{MINT_ACCOUNT_SEED, PROJECT_DATA_SEED, WITHDRAW_ACCOUNT_SEED};
use crate::state::{
    FreezeAccountPDA, MintAccountPDA, ProjectState, TreasuryAccount, WithdrawAccount,
};
use crate::ID;
use anchor_lang::prelude::*;
use anchor_lang::system_program::{create_account, CreateAccount};
use anchor_spl::token_2022::spl_token_2022::extension::ExtensionType;
use anchor_spl::token_2022::spl_token_2022::pod::PodMint;
use anchor_spl::token_2022::{initialize_mint2, InitializeMint2, Token2022};
use anchor_spl::token_interface::{transfer_fee_initialize, TransferFeeInitialize};

pub fn _initialize_project(ctx: Context<InitializeProjectContext>, max_fee: u64) -> Result<()> {
    msg!("tukalie?");
    let owner = &ctx.accounts.owner;

    let mint_size =
        ExtensionType::try_calculate_account_len::<PodMint>(&[ExtensionType::TransferFeeConfig])?;

    let lamports = Rent::get()?.minimum_balance(mint_size);

    let owner_key = owner.key();
    let mint_seeds: &[&[&[u8]]] = &[&[MINT_ACCOUNT_SEED, owner_key.as_ref(), &[ctx.bumps.mint]]];

    create_account(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            CreateAccount {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.mint.to_account_info(),
            },
            mint_seeds,
        ),
        lamports,
        mint_size as u64,
        &ctx.accounts.token_program.key(),
    )?;

    transfer_fee_initialize(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferFeeInitialize {
                token_program_id: ctx.accounts.token_program.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
            mint_seeds,
        ),
        Some(&ctx.accounts.mint_auth_pda.key()),
        Some(&ctx.accounts.withdraw_auth.key()),
        50,
        max_fee,
    )?;

    let mint_auth_key = ctx.accounts.mint_auth_pda.key();
    let freeze_auth_key = ctx.accounts.freeze_auth_pda.key();

    initialize_mint2(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            InitializeMint2 {
                mint: ctx.accounts.mint.to_account_info(),
            },
            mint_seeds,
        ),
        6,
        &mint_auth_key,
        Some(&freeze_auth_key),
    )?;

    // 2. Set the data inside of the project state
    let project_state = &mut ctx.accounts.project_state;

    project_state.mint_authority = ctx.accounts.mint_auth_pda.key();
    project_state.freeze_authority = ctx.accounts.freeze_auth_pda.key();
    project_state.founder = ctx.accounts.owner.key();
    project_state.withdraw_authority = ctx.accounts.withdraw_auth.key();
    project_state.treasury = ctx.accounts.treasury.key();

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeProjectContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [MINT_ACCOUNT_SEED, owner.key().as_ref()],
        bump
    )]
    /// CHECK: mint account is created inside of the instruction
    pub mint: UncheckedAccount<'info>,

    #[account(
        init,
        payer = owner,
        owner = ID,
        space = 8,
        seeds = [WITHDRAW_ACCOUNT_SEED, mint.key().as_ref()],
        bump
    )]
    pub withdraw_auth: Account<'info, WithdrawAccount>,

    #[account(
        init,
        payer = owner,
        owner = ID,
        space = 8 + ProjectState::INIT_SPACE,
        seeds = [PROJECT_DATA_SEED , mint.key().as_ref()],
        bump
    )]
    pub project_state: Account<'info, ProjectState>,

    #[account(
        init,
        payer = owner,
        owner = ID,
        space = 8,
        seeds = [b"treasure", owner.key().as_ref()],
        bump
    )]
    pub treasury: Account<'info, TreasuryAccount>,

    #[account(
        init,
        payer = owner,
        owner = ID,
        space = 8,
        seeds = [b"mint_auth", owner.key().as_ref()],
        bump
    )]
    pub mint_auth_pda: Account<'info, MintAccountPDA>,

    #[account(
        init,
        payer = owner,
        owner = ID,
        space = 8,
        seeds = [b"freeze_auth", owner.key().as_ref()],
        bump
    )]
    pub freeze_auth_pda: Account<'info, FreezeAccountPDA>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token2022>,
}
