use anchor_lang::prelude::*;

declare_id!("3Sizn8R7A1SGkAfnC8qww4xKWTdbUkwZRsS8AXQy6L9f");

#[program]
pub mod counter_anchor {
    use super::*;

    pub fn initialize_counter(_ctx: Context<InitializeCounter>) -> Result<()> {
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        if ctx.accounts.counter.count >= 1 {
            panic!("Intentional panic to test execution PC tracing!");
        }
        ctx.accounts.counter.count = ctx.accounts.counter.count.checked_add(1).unwrap();
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Counter cannot be incremented beyond 1. This is an intentional bug for debugging!")]
    CounterTooHigh,
}

#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        space = 8 + Counter::INIT_SPACE,
        payer = payer
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    count: u64,
}
