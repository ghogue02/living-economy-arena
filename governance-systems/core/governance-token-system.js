/**
 * Governance Token System
 * Token-based voting and governance rights management
 */

class GovernanceTokenSystem {
    constructor() {
        this.tokens = new Map();
        this.balances = new Map();
        this.delegations = new Map();
        this.stakingPools = new Map();
        this.vestingSchedules = new Map();
        this.distributions = new Map();
        this.snapshots = new Map();
        this.lockups = new Map();
        
        this.initializeSystemTokens();
    }

    initializeSystemTokens() {
        // Create system governance tokens
        this.createToken('GOV', {
            name: 'Governance Token',
            symbol: 'GOV',
            decimals: 18,
            totalSupply: 1000000,
            transferable: true,
            votingPower: 1,
            features: ['delegation', 'staking', 'snapshot']
        });

        this.createToken('VOTING', {
            name: 'Voting Rights Token',
            symbol: 'VOTE',
            decimals: 0,
            totalSupply: 10000,
            transferable: false,
            votingPower: 1,
            features: ['non-transferable', 'reputation-based']
        });
    }

    // Create governance token
    createToken(tokenId, config) {
        const {
            name,
            symbol,
            decimals = 18,
            totalSupply,
            transferable = true,
            votingPower = 1,
            features = [],
            metadata = {}
        } = config;

        const token = {
            id: tokenId,
            name,
            symbol,
            decimals,
            totalSupply,
            circulatingSupply: 0,
            transferable,
            votingPower,
            features: new Set(features),
            metadata,
            createdAt: Date.now(),
            holders: new Map(),
            distributions: new Map(),
            snapshots: new Map()
        };

        this.tokens.set(tokenId, token);
        this.balances.set(tokenId, new Map());
        this.delegations.set(tokenId, new Map());

        this.emitEvent('token-created', { tokenId, token });

        return token;
    }

    // Mint tokens
    async mintTokens(tokenId, recipient, amount, reason = '') {
        const token = this.tokens.get(tokenId);
        if (!token) {
            throw new Error('Token not found');
        }

        if (token.circulatingSupply + amount > token.totalSupply) {
            throw new Error('Minting would exceed total supply');
        }

        const balances = this.balances.get(tokenId);
        const currentBalance = balances.get(recipient) || 0;
        balances.set(recipient, currentBalance + amount);

        token.circulatingSupply += amount;
        token.holders.set(recipient, (token.holders.get(recipient) || 0) + amount);

        this.emitEvent('tokens-minted', {
            tokenId,
            recipient,
            amount,
            reason,
            newBalance: currentBalance + amount
        });

        return { success: true, newBalance: currentBalance + amount };
    }

    // Transfer tokens
    async transferTokens(tokenId, from, to, amount) {
        const token = this.tokens.get(tokenId);
        if (!token) {
            throw new Error('Token not found');
        }

        if (!token.transferable) {
            throw new Error('Token is not transferable');
        }

        const balances = this.balances.get(tokenId);
        const fromBalance = balances.get(from) || 0;

        if (fromBalance < amount) {
            throw new Error('Insufficient balance');
        }

        // Check lockups
        const availableBalance = await this.getAvailableBalance(tokenId, from);
        if (availableBalance < amount) {
            throw new Error('Tokens are locked');
        }

        balances.set(from, fromBalance - amount);
        balances.set(to, (balances.get(to) || 0) + amount);

        token.holders.set(from, fromBalance - amount);
        token.holders.set(to, (token.holders.get(to) || 0) + amount);

        this.emitEvent('tokens-transferred', {
            tokenId,
            from,
            to,
            amount
        });

        return { success: true };
    }

    // Delegate voting power
    async delegateVotingPower(tokenId, delegator, delegate, amount = null) {
        const token = this.tokens.get(tokenId);
        if (!token || !token.features.has('delegation')) {
            throw new Error('Token does not support delegation');
        }

        const balance = this.getBalance(tokenId, delegator);
        const delegationAmount = amount || balance;

        if (delegationAmount > balance) {
            throw new Error('Cannot delegate more than balance');
        }

        const delegations = this.delegations.get(tokenId);
        const existingDelegation = delegations.get(delegator);

        if (existingDelegation) {
            // Update existing delegation
            existingDelegation.amount = delegationAmount;
            existingDelegation.delegate = delegate;
            existingDelegation.timestamp = Date.now();
        } else {
            // Create new delegation
            delegations.set(delegator, {
                delegate,
                amount: delegationAmount,
                timestamp: Date.now()
            });
        }

        this.emitEvent('voting-power-delegated', {
            tokenId,
            delegator,
            delegate,
            amount: delegationAmount
        });

        return { success: true };
    }

    // Revoke delegation
    async revokeDelegation(tokenId, delegator) {
        const delegations = this.delegations.get(tokenId);
        const removed = delegations.delete(delegator);

        if (removed) {
            this.emitEvent('delegation-revoked', { tokenId, delegator });
        }

        return { success: removed };
    }

    // Calculate voting power
    calculateVotingPower(tokenId, holder, blockNumber = null) {
        const token = this.tokens.get(tokenId);
        if (!token) return 0;

        let balance;
        if (blockNumber) {
            // Use snapshot if available
            balance = this.getSnapshotBalance(tokenId, holder, blockNumber);
        } else {
            balance = this.getBalance(tokenId, holder);
        }

        // Include delegated power
        const delegatedPower = this.getDelegatedVotingPower(tokenId, holder);
        
        const totalBalance = balance + delegatedPower;
        return totalBalance * token.votingPower;
    }

    // Get delegated voting power
    getDelegatedVotingPower(tokenId, delegate) {
        const delegations = this.delegations.get(tokenId);
        let totalDelegated = 0;

        for (const [delegator, delegation] of delegations) {
            if (delegation.delegate === delegate) {
                totalDelegated += delegation.amount;
            }
        }

        return totalDelegated;
    }

    // Stake tokens
    async stakeTokens(tokenId, staker, amount, duration = 0) {
        const token = this.tokens.get(tokenId);
        if (!token || !token.features.has('staking')) {
            throw new Error('Token does not support staking');
        }

        const balance = this.getBalance(tokenId, staker);
        if (balance < amount) {
            throw new Error('Insufficient balance to stake');
        }

        const stakingPools = this.stakingPools.get(tokenId) || new Map();
        const existingStake = stakingPools.get(staker) || { amount: 0, rewards: 0, stakedAt: 0 };

        // Create lockup if duration specified
        if (duration > 0) {
            await this.createLockup(tokenId, staker, amount, duration);
        }

        const newStake = {
            amount: existingStake.amount + amount,
            rewards: existingStake.rewards,
            stakedAt: Date.now(),
            duration,
            unlockTime: duration > 0 ? Date.now() + duration : 0
        };

        stakingPools.set(staker, newStake);
        this.stakingPools.set(tokenId, stakingPools);

        this.emitEvent('tokens-staked', {
            tokenId,
            staker,
            amount,
            duration,
            totalStaked: newStake.amount
        });

        return newStake;
    }

    // Unstake tokens
    async unstakeTokens(tokenId, staker, amount) {
        const stakingPools = this.stakingPools.get(tokenId);
        const stake = stakingPools?.get(staker);

        if (!stake) {
            throw new Error('No stake found');
        }

        if (stake.unlockTime > 0 && Date.now() < stake.unlockTime) {
            throw new Error('Tokens are still locked');
        }

        if (stake.amount < amount) {
            throw new Error('Insufficient staked amount');
        }

        stake.amount -= amount;
        
        if (stake.amount === 0) {
            stakingPools.delete(staker);
        }

        // Remove lockup
        await this.removeLockup(tokenId, staker, amount);

        this.emitEvent('tokens-unstaked', {
            tokenId,
            staker,
            amount,
            remainingStaked: stake.amount
        });

        return { success: true, remainingStaked: stake.amount };
    }

    // Create token lockup
    async createLockup(tokenId, holder, amount, duration) {
        const lockups = this.lockups.get(tokenId) || new Map();
        const holderLockups = lockups.get(holder) || [];

        const lockup = {
            amount,
            unlockTime: Date.now() + duration,
            createdAt: Date.now()
        };

        holderLockups.push(lockup);
        lockups.set(holder, holderLockups);
        this.lockups.set(tokenId, lockups);

        return lockup;
    }

    // Remove lockup
    async removeLockup(tokenId, holder, amount) {
        const lockups = this.lockups.get(tokenId);
        const holderLockups = lockups?.get(holder) || [];

        let remainingAmount = amount;
        const updatedLockups = [];

        for (const lockup of holderLockups) {
            if (remainingAmount <= 0) {
                updatedLockups.push(lockup);
                continue;
            }

            if (lockup.amount <= remainingAmount) {
                remainingAmount -= lockup.amount;
                // Skip this lockup (remove it)
            } else {
                lockup.amount -= remainingAmount;
                remainingAmount = 0;
                updatedLockups.push(lockup);
            }
        }

        if (updatedLockups.length > 0) {
            lockups.set(holder, updatedLockups);
        } else {
            lockups.delete(holder);
        }
    }

    // Get available balance (excluding locked tokens)
    async getAvailableBalance(tokenId, holder) {
        const totalBalance = this.getBalance(tokenId, holder);
        const lockedAmount = this.getLockedAmount(tokenId, holder);
        return totalBalance - lockedAmount;
    }

    // Get locked token amount
    getLockedAmount(tokenId, holder) {
        const lockups = this.lockups.get(tokenId);
        const holderLockups = lockups?.get(holder) || [];
        const now = Date.now();

        return holderLockups
            .filter(lockup => lockup.unlockTime > now)
            .reduce((total, lockup) => total + lockup.amount, 0);
    }

    // Create vesting schedule
    createVestingSchedule(tokenId, beneficiary, totalAmount, startTime, duration, cliffDuration = 0) {
        const scheduleId = `${tokenId}-${beneficiary}-${Date.now()}`;
        
        const schedule = {
            id: scheduleId,
            tokenId,
            beneficiary,
            totalAmount,
            startTime,
            duration,
            cliffDuration,
            cliffTime: startTime + cliffDuration,
            endTime: startTime + duration,
            releasedAmount: 0,
            createdAt: Date.now()
        };

        const schedules = this.vestingSchedules.get(tokenId) || new Map();
        schedules.set(scheduleId, schedule);
        this.vestingSchedules.set(tokenId, schedules);

        this.emitEvent('vesting-schedule-created', { scheduleId, schedule });

        return schedule;
    }

    // Release vested tokens
    async releaseVestedTokens(scheduleId) {
        let schedule = null;
        let tokenId = null;

        // Find the schedule
        for (const [tId, schedules] of this.vestingSchedules) {
            if (schedules.has(scheduleId)) {
                schedule = schedules.get(scheduleId);
                tokenId = tId;
                break;
            }
        }

        if (!schedule) {
            throw new Error('Vesting schedule not found');
        }

        const now = Date.now();
        
        if (now < schedule.cliffTime) {
            throw new Error('Cliff period has not passed');
        }

        const vestedAmount = this.calculateVestedAmount(schedule, now);
        const releasableAmount = vestedAmount - schedule.releasedAmount;

        if (releasableAmount <= 0) {
            throw new Error('No tokens to release');
        }

        // Mint the released tokens
        await this.mintTokens(tokenId, schedule.beneficiary, releasableAmount, 'vesting-release');
        
        schedule.releasedAmount += releasableAmount;

        this.emitEvent('vested-tokens-released', {
            scheduleId,
            beneficiary: schedule.beneficiary,
            amount: releasableAmount,
            totalReleased: schedule.releasedAmount
        });

        return { releasedAmount, totalReleased: schedule.releasedAmount };
    }

    // Calculate vested amount
    calculateVestedAmount(schedule, currentTime) {
        if (currentTime < schedule.cliffTime) {
            return 0;
        }

        if (currentTime >= schedule.endTime) {
            return schedule.totalAmount;
        }

        const timeElapsed = currentTime - schedule.startTime;
        const vestingRatio = timeElapsed / schedule.duration;
        
        return Math.floor(schedule.totalAmount * vestingRatio);
    }

    // Create token snapshot
    createSnapshot(tokenId, blockNumber = null) {
        const token = this.tokens.get(tokenId);
        if (!token) {
            throw new Error('Token not found');
        }

        const snapshotId = blockNumber || Date.now();
        const balances = this.balances.get(tokenId);
        const snapshot = new Map(balances);

        token.snapshots.set(snapshotId, {
            id: snapshotId,
            timestamp: Date.now(),
            balances: snapshot,
            totalSupply: token.circulatingSupply
        });

        this.emitEvent('snapshot-created', { tokenId, snapshotId });

        return snapshotId;
    }

    // Get snapshot balance
    getSnapshotBalance(tokenId, holder, snapshotId) {
        const token = this.tokens.get(tokenId);
        const snapshot = token?.snapshots.get(snapshotId);
        
        if (!snapshot) {
            return 0;
        }

        return snapshot.balances.get(holder) || 0;
    }

    // Token distribution
    async distributeTokens(tokenId, recipients, amounts, reason = '') {
        const token = this.tokens.get(tokenId);
        if (!token) {
            throw new Error('Token not found');
        }

        if (recipients.length !== amounts.length) {
            throw new Error('Recipients and amounts arrays must have same length');
        }

        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
        
        if (token.circulatingSupply + totalAmount > token.totalSupply) {
            throw new Error('Distribution would exceed total supply');
        }

        const results = [];
        
        for (let i = 0; i < recipients.length; i++) {
            const result = await this.mintTokens(tokenId, recipients[i], amounts[i], reason);
            results.push({ recipient: recipients[i], amount: amounts[i], result });
        }

        this.emitEvent('tokens-distributed', {
            tokenId,
            recipients,
            amounts,
            reason,
            totalAmount
        });

        return results;
    }

    // Get token balance
    getBalance(tokenId, holder) {
        const balances = this.balances.get(tokenId);
        return balances?.get(holder) || 0;
    }

    // Get token info
    getTokenInfo(tokenId) {
        const token = this.tokens.get(tokenId);
        if (!token) return null;

        return {
            ...token,
            holders: token.holders.size,
            features: Array.from(token.features)
        };
    }

    // Get holder info
    getHolderInfo(tokenId, holder) {
        const balance = this.getBalance(tokenId, holder);
        const availableBalance = this.getAvailableBalance(tokenId, holder);
        const lockedAmount = this.getLockedAmount(tokenId, holder);
        const votingPower = this.calculateVotingPower(tokenId, holder);
        const delegatedPower = this.getDelegatedVotingPower(tokenId, holder);
        
        const delegations = this.delegations.get(tokenId);
        const delegation = delegations?.get(holder);

        const stakingPools = this.stakingPools.get(tokenId);
        const stake = stakingPools?.get(holder);

        return {
            holder,
            balance,
            availableBalance,
            lockedAmount,
            votingPower,
            delegatedPower,
            delegation,
            stake
        };
    }

    // Get top holders
    getTopHolders(tokenId, limit = 10) {
        const token = this.tokens.get(tokenId);
        if (!token) return [];

        return Array.from(token.holders.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([holder, balance]) => ({
                holder,
                balance,
                percentage: (balance / token.circulatingSupply) * 100
            }));
    }

    // Token analytics
    getTokenAnalytics(tokenId) {
        const token = this.tokens.get(tokenId);
        if (!token) return null;

        const holders = Array.from(token.holders.values());
        const totalHolders = holders.length;
        const averageBalance = totalHolders > 0 ? token.circulatingSupply / totalHolders : 0;
        
        // Calculate Gini coefficient for distribution equality
        const giniCoefficient = this.calculateGiniCoefficient(holders);
        
        // Get staking statistics
        const stakingPools = this.stakingPools.get(tokenId) || new Map();
        const totalStaked = Array.from(stakingPools.values())
            .reduce((sum, stake) => sum + stake.amount, 0);
        const stakingRatio = token.circulatingSupply > 0 ? totalStaked / token.circulatingSupply : 0;

        return {
            tokenId,
            totalSupply: token.totalSupply,
            circulatingSupply: token.circulatingSupply,
            totalHolders,
            averageBalance,
            giniCoefficient,
            totalStaked,
            stakingRatio,
            utilization: token.circulatingSupply / token.totalSupply
        };
    }

    // Calculate Gini coefficient for wealth distribution
    calculateGiniCoefficient(balances) {
        if (balances.length <= 1) return 0;

        const sortedBalances = balances.sort((a, b) => a - b);
        const n = sortedBalances.length;
        const sum = sortedBalances.reduce((a, b) => a + b, 0);
        
        if (sum === 0) return 0;

        let numerator = 0;
        for (let i = 0; i < n; i++) {
            numerator += (2 * (i + 1) - n - 1) * sortedBalances[i];
        }

        return numerator / (n * sum);
    }

    emitEvent(eventType, data) {
        console.log(`[GovernanceToken Event] ${eventType}:`, data);
    }
}

module.exports = { GovernanceTokenSystem };