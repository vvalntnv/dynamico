use anchor_lang::prelude::*;

pub fn _create_account(ctx: Context<CreateAccountContext>) -> Result<()> {
    msg!("We are working!");
    Ok(())
}

#[derive(Accounts)]
pub struct CreateAccountContext {}
