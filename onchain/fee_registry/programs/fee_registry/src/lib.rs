mod instructions;

use anchor_lang::prelude::*;

use instructions::create_account::CreateAccountContext;
use instructions::*;

declare_id!("Fp2dJXnfZZQF7b4aQ9124rTkFHBGLSTa3NrSR1dTu2Fg");

#[program]
pub mod fee_registry {
    use super::*;

    pub fn create_account(ctx: Context<CreateAccountContext>) -> Result<()> {
        instructions::_create_account(ctx)
    }
}
