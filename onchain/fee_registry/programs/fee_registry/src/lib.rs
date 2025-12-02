use anchor_lang::prelude::*;

declare_id!("Fp2dJXnfZZQF7b4aQ9124rTkFHBGLSTa3NrSR1dTu2Fg");

#[program]
pub mod fee_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
