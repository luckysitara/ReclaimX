use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use oapp_solana_sdk::endpoint::{
    instructions::{RegisterOAppParams, SendParams, QuoteParams},
    cpi::{register_oapp, send, quote},
    accounts::{RegisterOApp, Send, Quote},
};
use oapp_solana_sdk::oft::{
    instructions::{SendOFTParams, QuoteOFTParams},
    cpi::{send_oft, quote_oft},
    accounts::{SendOFT, QuoteOFT},
};
use solana_program::pubkey::Pubkey;

declare_id!("YourDeployedReclaimXVaultProgramId"); // Replace post-deployment

// LayerZero V2 Solana Devnet Endpoint - Official Address
pub const LAYERZERO_ENDPOINT: Pubkey = solana_program::pubkey!("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6");

// LayerZero V2 Chain IDs
pub const ETHEREUM_EID: u32 = 30101; // Ethereum Mainnet
pub const SOLANA_EID: u32 = 40168;   // Solana Devnet
pub const SEPOLIA_EID: u32 = 40161;  // Sepolia Testnet (for testing)

#[program]
pub mod reclaimx {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        guardians: Vec<Pubkey>,
        threshold: u8,
        timelock: u64,
        inactivity_period: u64,
        backup_wallet: Pubkey,
        stake_amount: u64,
        assets: Vec<Asset>,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(guardians.len() >= threshold as usize && threshold > 0, ErrorCode::InvalidThreshold);
        
        vault.owner = ctx.accounts.owner.key();
        vault.guardians = guardians;
        vault.threshold = threshold;
        vault.timelock = timelock;
        vault.inactivity_period = inactivity_period;
        vault.backup_wallet = backup_wallet;
        vault.stake_amount = stake_amount;
        vault.assets = assets;
        vault.recovery_state = RecoveryState::None;
        vault.last_active_timestamp = Clock::get()?.unix_timestamp;
        vault.recovery_id = 0;
        vault.bump = ctx.bumps.vault;

        // Register as OApp with LayerZero endpoint
        let register_params = RegisterOAppParams {
            delegate: ctx.accounts.owner.key(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.endpoint_program.to_account_info(),
            RegisterOApp {
                payer: ctx.accounts.payer.to_account_info(),
                oapp: ctx.accounts.vault.to_account_info(),
                endpoint: ctx.accounts.endpoint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
        );

        register_oapp(cpi_ctx, register_params)?;

        msg!("Vault initialized with {} guardians, threshold: {}", vault.guardians.len(), vault.threshold);
        Ok(())
    }

    pub fn initiate_recovery(
        ctx: Context<InitiateRecovery>, 
        new_owner: Pubkey,
        dst_eid: u32,
        options: Vec<u8>,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(
            ctx.accounts.initiator.key() == vault.owner || 
            vault.guardians.contains(&ctx.accounts.initiator.key()), 
            ErrorCode::Unauthorized
        );

        vault.recovery_id += 1;
        vault.recovery_state = RecoveryState::Pending {
            new_owner,
            approvals: vec![],
            malicious_approvals: vec![],
            start_timestamp: Clock::get()?.unix_timestamp,
            recovery_id: vault.recovery_id,
        };

        // Prepare cross-chain message payload
        let message = RecoveryMessage {
            vault_id: ctx.accounts.vault.key(),
            new_owner,
            recovery_id: vault.recovery_id,
            action: RecoveryAction::Initiate,
        };
        let payload = message.try_to_vec()?;

        // Get quote for cross-chain message
        let quote_params = QuoteParams {
            dst_eid,
            to: ctx.accounts.peer.key().to_bytes().to_vec(),
            message: payload.clone(),
            options: options.clone(),
            pay_in_lz_token: false,
        };

        let quote_ctx = CpiContext::new(
            ctx.accounts.endpoint_program.to_account_info(),
            Quote {
                endpoint: ctx.accounts.endpoint.to_account_info(),
            },
        );

        let messaging_fee = quote(quote_ctx, quote_params)?;

        // Send cross-chain message
        let send_params = SendParams {
            dst_eid,
            to: ctx.accounts.peer.key().to_bytes().to_vec(),
            message: payload,
            options,
            native_fee: messaging_fee.native_fee,
            lz_token_fee: messaging_fee.lz_token_fee,
        };

        let vault_seeds = &[
            b"vault",
            vault.owner.as_ref(),
            &[vault.bump],
        ];
        let signer_seeds = &[&vault_seeds[..]];

        let send_ctx = CpiContext::new_with_signer(
            ctx.accounts.endpoint_program.to_account_info(),
            Send {
                payer: ctx.accounts.payer.to_account_info(),
                oapp: ctx.accounts.vault.to_account_info(),
                endpoint: ctx.accounts.endpoint.to_account_info(),
            },
            signer_seeds,
        );

        send(send_ctx, send_params)?;

        msg!("Recovery initiated for vault: {}, new owner: {}, recovery_id: {}", 
             vault.key(), new_owner, vault.recovery_id);

        Ok(())
    }

    pub fn approve_recovery(ctx: Context<ApproveRecovery>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.guardians.contains(&ctx.accounts.guardian.key()), ErrorCode::Unauthorized);

        if let RecoveryState::Pending { 
            approvals, 
            malicious_approvals, 
            new_owner, 
            start_timestamp, 
            recovery_id 
        } = &mut vault.recovery_state {
            require!(!approvals.contains(&ctx.accounts.guardian.key()), ErrorCode::DuplicateApproval);
            approvals.push(ctx.accounts.guardian.key());

            msg!("Guardian {} approved recovery. Approvals: {}/{}", 
                 ctx.accounts.guardian.key(), approvals.len(), vault.threshold);

            // Check if threshold is met and timelock has passed
            if approvals.len() >= vault.threshold as usize && 
               Clock::get()?.unix_timestamp >= start_timestamp + vault.timelock {
                
                vault.owner = *new_owner;
                vault.recovery_state = RecoveryState::Completed;
                
                msg!("Recovery completed! New owner: {}", new_owner);

                // Transfer assets to new owner
                for asset in &vault.assets {
                    match asset.asset_type {
                        AssetType::Token => {
                            let cpi_accounts = Transfer {
                                from: ctx.accounts.vault_token_account.to_account_info(),
                                to: ctx.accounts.new_owner_token_account.to_account_info(),
                                authority: ctx.accounts.vault.to_account_info(),
                            };
                            let vault_seeds = &[
                                b"vault",
                                vault.owner.as_ref(),
                                &[vault.bump],
                            ];
                            let signer_seeds = &[&vault_seeds[..]];
                            let cpi_ctx = CpiContext::new_with_signer(
                                ctx.accounts.token_program.to_account_info(),
                                cpi_accounts,
                                signer_seeds,
                            );
                            token::transfer(cpi_ctx, asset.amount)?;
                        }
                        AssetType::NFT => {
                            let cpi_accounts = Transfer {
                                from: ctx.accounts.vault_token_account.to_account_info(),
                                to: ctx.accounts.new_owner_token_account.to_account_info(),
                                authority: ctx.accounts.vault.to_account_info(),
                            };
                            let vault_seeds = &[
                                b"vault",
                                vault.owner.as_ref(),
                                &[vault.bump],
                            ];
                            let signer_seeds = &[&vault_seeds[..]];
                            let cpi_ctx = CpiContext::new_with_signer(
                                ctx.accounts.token_program.to_account_info(),
                                cpi_accounts,
                                signer_seeds,
                            );
                            token::transfer(cpi_ctx, 1)?;
                        }
                    }
                }
            }
        } else {
            return err!(ErrorCode::NoActiveRecovery);
        }

        Ok(())
    }

    pub fn stake_guardian_oft(
        ctx: Context<StakeGuardianOFT>,
        amount: u64,
        dst_eid: u32,
        options: Vec<u8>,
    ) -> Result<()> {
        let vault = &ctx.accounts.vault;
        require!(vault.guardians.contains(&ctx.accounts.guardian.key()), ErrorCode::Unauthorized);
        require!(amount >= vault.stake_amount, ErrorCode::InsufficientStake);

        // Send OFT tokens cross-chain for staking
        let send_params = SendOFTParams {
            dst_eid,
            to: ctx.accounts.peer.key().to_bytes().to_vec(),
            amount_ld: amount,
            min_amount_ld: amount,
            options,
            native_fee: 0, // Will be calculated
            lz_token_fee: 0,
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.oft_program.to_account_info(),
            SendOFT {
                payer: ctx.accounts.guardian.to_account_info(),
                oft: ctx.accounts.oft.to_account_info(),
                token_mint: ctx.accounts.token_mint.to_account_info(),
                from_token_account: ctx.accounts.guardian_token_account.to_account_info(),
                endpoint: ctx.accounts.endpoint.to_account_info(),
            },
        );

        send_oft(cpi_ctx, send_params)?;

        msg!("Guardian {} staked {} RXOFT tokens via OFT", ctx.accounts.guardian.key(), amount);
        Ok(())
    }

    pub fn mark_malicious(ctx: Context<MarkMalicious>, guardian: Pubkey) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.guardians.contains(&ctx.accounts.signer.key()), ErrorCode::Unauthorized);

        if let RecoveryState::Pending { malicious_approvals, .. } = &mut vault.recovery_state {
            require!(!malicious_approvals.contains(&ctx.accounts.signer.key()), ErrorCode::DuplicateApproval);
            malicious_approvals.push(ctx.accounts.signer.key());

            msg!("Guardian {} marked as malicious by {}. Malicious votes: {}", 
                 guardian, ctx.accounts.signer.key(), malicious_approvals.len());

            // If 3 or more guardians mark as malicious, slash the guardian
            if malicious_approvals.len() >= 3 {
                // Slash guardian by burning their staked tokens via OFT
                msg!("Guardian {} slashed for malicious behavior!", guardian);
                
                // Emit event for off-chain slashing process
                emit!(GuardianSlashedEvent {
                    vault_id: vault.key(),
                    guardian,
                    amount: vault.stake_amount,
                });
            }
        }
        Ok(())
    }

    pub fn check_inactivity(ctx: Context<CheckInactivity>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let current_time = Clock::get()?.unix_timestamp;

        if current_time >= vault.last_active_timestamp + vault.inactivity_period {
            vault.recovery_id += 1;
            vault.recovery_state = RecoveryState::Pending {
                new_owner: vault.backup_wallet,
                approvals: vec![],
                malicious_approvals: vec![],
                start_timestamp: current_time,
                recovery_id: vault.recovery_id,
            };

            msg!("Inactivity detected! Auto-recovery initiated to backup wallet: {}", vault.backup_wallet);
        }
        Ok(())
    }

    pub fn update_last_active(ctx: Context<UpdateLastActive>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(ctx.accounts.owner.key() == vault.owner, ErrorCode::Unauthorized);
        
        vault.last_active_timestamp = Clock::get()?.unix_timestamp;
        msg!("Vault activity updated for owner: {}", vault.owner);
        Ok(())
    }

    // LayerZero receive function - called by the endpoint
    pub fn lz_receive(
        ctx: Context<LzReceive>,
        params: LzReceiveParams,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        // Verify the message is from our trusted peer
        require!(
            params.src_eid == ETHEREUM_EID,
            ErrorCode::UnauthorizedSource
        );

        let message: RecoveryMessage = RecoveryMessage::try_from_slice(&params.message)?;
        require!(message.vault_id == ctx.accounts.vault.key(), ErrorCode::InvalidVault);

        match message.action {
            RecoveryAction::Initiate => {
                // Handle cross-chain recovery initiation from EVM
                vault.recovery_id += 1;
                vault.recovery_state = RecoveryState::Pending {
                    new_owner: message.new_owner,
                    approvals: vec![],
                    malicious_approvals: vec![],
                    start_timestamp: Clock::get()?.unix_timestamp,
                    recovery_id: vault.recovery_id,
                };
                msg!("Received cross-chain recovery initiation from EID: {}", params.src_eid);
            }
            RecoveryAction::Approve => {
                // Handle cross-chain approval from EVM
                if let RecoveryState::Pending { recovery_id, approvals, .. } = &mut vault.recovery_state {
                    require!(message.recovery_id == *recovery_id, ErrorCode::InvalidRecoveryId);
                    // Add cross-chain approval (could be from EVM guardian)
                    msg!("Received cross-chain approval for recovery_id: {}", recovery_id);
                }
            }
        }

        Ok(())
    }

    pub fn set_peer(
        ctx: Context<SetPeer>,
        dst_eid: u32,
        peer: [u8; 32],
    ) -> Result<()> {
        // Only vault owner can set peers
        let vault = &ctx.accounts.vault;
        require!(ctx.accounts.owner.key() == vault.owner, ErrorCode::Unauthorized);

        // Store peer information
        let peer_info = &mut ctx.accounts.peer_info;
        peer_info.eid = dst_eid;
        peer_info.peer = peer;
        peer_info.vault = vault.key();

        msg!("Peer set for EID {}: {:?}", dst_eid, peer);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + Vault::SPACE,
        seeds = [b"vault", owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: LayerZero endpoint
    pub endpoint: AccountInfo<'info>,
    /// CHECK: LayerZero endpoint program
    pub endpoint_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitiateRecovery<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub initiator: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: LayerZero endpoint
    pub endpoint: AccountInfo<'info>,
    /// CHECK: LayerZero endpoint program
    pub endpoint_program: AccountInfo<'info>,
    /// CHECK: Peer address for cross-chain messaging
    pub peer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ApproveRecovery<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub guardian: Signer<'info>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub new_owner_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeGuardianOFT<'info> {
    pub vault: Account<'info, Vault>,
    pub guardian: Signer<'info>,
    #[account(mut)]
    pub guardian_token_account: Account<'info, TokenAccount>,
    /// CHECK: OFT program
    pub oft_program: AccountInfo<'info>,
    /// CHECK: OFT account
    pub oft: AccountInfo<'info>,
    pub token_mint: Account<'info, Mint>,
    /// CHECK: LayerZero endpoint
    pub endpoint: AccountInfo<'info>,
    /// CHECK: Peer address
    pub peer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct MarkMalicious<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckInactivity<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
}

#[derive(Accounts)]
pub struct UpdateLastActive<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct LzReceive<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    /// CHECK: LayerZero endpoint
    pub endpoint: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SetPeer<'info> {
    pub vault: Account<'info, Vault>,
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + PeerInfo::SPACE,
        seeds = [b"peer", vault.key().as_ref(), &dst_eid.to_le_bytes()],
        bump
    )]
    pub peer_info: Account<'info, PeerInfo>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub owner: Pubkey,
    pub guardians: Vec<Pubkey>,
    pub threshold: u8,
    pub timelock: u64,
    pub inactivity_period: u64,
    pub backup_wallet: Pubkey,
    pub stake_amount: u64,
    pub assets: Vec<Asset>,
    pub recovery_state: RecoveryState,
    pub recovery_id: u64,
    pub last_active_timestamp: i64,
    pub bump: u8,
}

impl Vault {
    pub const SPACE: usize = 32 + // owner
        4 + (32 * 10) + // guardians (max 10)
        1 + // threshold
        8 + // timelock
        8 + // inactivity_period
        32 + // backup_wallet
        8 + // stake_amount
        4 + (64 * 10) + // assets (max 10)
        1 + 200 + // recovery_state (enum + data)
        8 + // recovery_id
        8 + // last_active_timestamp
        1; // bump
}

#[account]
pub struct PeerInfo {
    pub vault: Pubkey,
    pub eid: u32,
    pub peer: [u8; 32],
}

impl PeerInfo {
    pub const SPACE: usize = 32 + 4 + 32;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RecoveryState {
    None,
    Pending {
        new_owner: Pubkey,
        approvals: Vec<Pubkey>,
        malicious_approvals: Vec<Pubkey>,
        start_timestamp: i64,
        recovery_id: u64,
    },
    Completed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Asset {
    pub asset_type: AssetType,
    pub amount: u64,
    pub token_account: Pubkey,
    pub mint: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum AssetType {
    Token,
    NFT,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RecoveryMessage {
    pub vault_id: Pubkey,
    pub new_owner: Pubkey,
    pub recovery_id: u64,
    pub action: RecoveryAction,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RecoveryAction {
    Initiate,
    Approve,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct LzReceiveParams {
    pub src_eid: u32,
    pub sender: [u8; 32],
    pub nonce: u64,
    pub guid: [u8; 32],
    pub message: Vec<u8>,
    pub extra_data: Vec<u8>,
}

#[event]
pub struct GuardianSlashedEvent {
    pub vault_id: Pubkey,
    pub guardian: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid threshold")]
    InvalidThreshold,
    #[msg("Duplicate approval")]
    DuplicateApproval,
    #[msg("No active recovery")]
    NoActiveRecovery,
    #[msg("Invalid vault ID")]
    InvalidVault,
    #[msg("Invalid recovery ID")]
    InvalidRecoveryId,
    #[msg("Insufficient stake")]
    InsufficientStake,
    #[msg("Unauthorized source")]
    UnauthorizedSource,
}
