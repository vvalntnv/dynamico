mod constats;
mod instructions;
mod state;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("Fp2dJXnfZZQF7b4aQ9124rTkFHBGLSTa3NrSR1dTu2Fg");

#[program]
pub mod fee_registry {
    use super::*;

    pub fn initialize_project(ctx: Context<InitializeProjectContext>, max_fee: u64) -> Result<()> {
        instructions::_initialize_project(ctx, max_fee)
    }

    pub fn withdraw_fees<'info>(
        ctx: Context<'info, 'info, 'info, 'info, WithdrawFeesContext<'info>>,
    ) -> Result<()> {
        instructions::_withdraw_fees(ctx)
    }
}
