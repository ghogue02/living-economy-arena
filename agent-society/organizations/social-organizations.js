/**
 * Social Organizations System
 * Handles corporations, cartels, unions, criminal organizations, and other social structures
 */

const EventEmitter = require('eventemitter3');
const { v4: uuidv4 } = require('uuid');

class SocialOrganizations extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxOrganizations: config.maxOrganizations || 10000,
            corporationFormationCost: config.corporationFormationCost || 5000,
            unionMinMembers: config.unionMinMembers || 5,
            cartelDetectionThreshold: config.cartelDetectionThreshold || 0.3, // 30% price coordination
            criminalOrgGrowthRate: config.criminalOrgGrowthRate || 0.1,
            organizationTaxRate: config.organizationTaxRate || 0.15,
            ...config
        };

        this.organizations = new Map();
        this.membershipIndex = new Map(); // agent -> [organization IDs]
        this.industryIndex = new Map(); // industry -> [corporation IDs]
        
        this.state = {
            totalOrganizations: 0,
            activeCorporations: 0,
            activeUnions: 0,
            activeCriminalOrgs: 0,
            detectedCartels: 0,
            totalRevenue: 0,
            totalTaxes: 0
        };

        this.initializeOrganizationTypes();
    }

    initializeOrganizationTypes() {
        this.organizationTypes = {
            corporation: {
                formation: this.formCorporation.bind(this),
                management: this.manageCorporation.bind(this),
                dissolution: this.dissolveCorporation.bind(this)
            },
            union: {
                formation: this.formUnion.bind(this),
                management: this.manageUnion.bind(this),
                dissolution: this.dissolveUnion.bind(this)
            },
            cartel: {
                formation: this.formCartel.bind(this),
                management: this.manageCartel.bind(this),
                dissolution: this.dissolveCartel.bind(this)
            },
            criminal: {
                formation: this.formCriminalOrganization.bind(this),
                management: this.manageCriminalOrganization.bind(this),
                dissolution: this.dissolveCriminalOrganization.bind(this)
            },
            professional: {
                formation: this.formProfessionalAssociation.bind(this),
                management: this.manageProfessionalAssociation.bind(this),
                dissolution: this.dissolveProfessionalAssociation.bind(this)
            }
        };
    }

    // Corporation formation and management
    createCorporation(founderId, corporationData) {
        const orgId = uuidv4();
        
        const corporation = {
            id: orgId,
            type: 'corporation',
            name: corporationData.name || `Corp-${orgId.slice(0, 8)}`,
            founderId,
            industry: corporationData.industry || 'technology',
            capital: corporationData.initialCapital || 10000,
            employees: new Set([founderId]),
            shareholders: new Map([[founderId, 1.0]]), // founder owns 100%
            revenue: 0,
            expenses: 0,
            marketShare: 0,
            reputation: 50,
            established: Date.now(),
            
            // Corporate governance
            boardMembers: new Set([founderId]),
            ceo: founderId,
            policies: {
                dividendRate: 0.3,
                salaryMultiplier: 1.0,
                ethicsScore: 50,
                environmentalScore: 50
            },
            
            // Market activities
            priceStrategy: 'competitive',
            coordinationLevel: 0, // Used for cartel detection
            lastCartelCheck: Date.now(),
            
            // Performance metrics
            profitHistory: [],
            employeeCount: 1,
            growthRate: 0,
            
            ...corporationData
        };

        this.organizations.set(orgId, corporation);
        this.addMembership(founderId, orgId);
        this.addToIndustryIndex(corporation.industry, orgId);
        
        this.state.totalOrganizations++;
        this.state.activeCorporations++;

        this.emit('corporation_formed', {
            organizationId: orgId,
            founderId,
            industry: corporation.industry,
            initialCapital: corporation.capital
        });

        return corporation;
    }

    manageCorporation(orgId) {
        const corp = this.organizations.get(orgId);
        if (!corp || corp.type !== 'corporation') return;

        // Calculate revenue based on market conditions and employees
        const baseRevenue = corp.employeeCount * 1000 + corp.capital * 0.05;
        const marketBonus = corp.marketShare * baseRevenue * 0.5;
        const reputationBonus = (corp.reputation - 50) * baseRevenue * 0.01;
        
        corp.revenue = baseRevenue + marketBonus + reputationBonus;
        
        // Calculate expenses
        corp.expenses = corp.employeeCount * 500 + corp.capital * 0.02;
        
        // Calculate profit
        const profit = corp.revenue - corp.expenses;
        corp.profitHistory.push({
            timestamp: Date.now(),
            profit,
            revenue: corp.revenue,
            expenses: corp.expenses
        });

        // Distribute dividends to shareholders
        this.distributeDividends(corp, profit);
        
        // Check for cartel behavior
        this.checkForCartelBehavior(corp);
        
        // Update market share based on performance
        this.updateMarketShare(corp);
        
        // Tax obligations
        const taxes = Math.max(0, profit * this.config.organizationTaxRate);
        this.state.totalTaxes += taxes;
        
        return {
            profit,
            taxes,
            marketShare: corp.marketShare,
            employeeCount: corp.employeeCount
        };
    }

    distributeDividends(corporation, profit) {
        if (profit <= 0) return;
        
        const dividendPool = profit * corporation.policies.dividendRate;
        
        for (const [shareholderId, sharePercent] of corporation.shareholders) {
            const dividend = dividendPool * sharePercent;
            this.emit('dividend_payment', {
                agentId: shareholderId,
                amount: dividend,
                corporationId: corporation.id
            });
        }
    }

    checkForCartelBehavior(corporation) {
        const now = Date.now();
        if (now - corporation.lastCartelCheck < 86400000) return; // Check daily
        
        corporation.lastCartelCheck = now;
        
        // Get other corporations in same industry
        const industryCorps = this.getIndustryCompetitors(corporation);
        if (industryCorps.length < 2) return;
        
        // Analyze price coordination
        const coordinationLevel = this.analyzePriceCoordination(corporation, industryCorps);
        corporation.coordinationLevel = coordinationLevel;
        
        if (coordinationLevel > this.config.cartelDetectionThreshold) {
            this.detectCartel(corporation, industryCorps);
        }
    }

    analyzePriceCoordination(corporation, competitors) {
        // Simplified cartel detection based on pricing similarity
        const corporationPricing = corporation.priceStrategy;
        
        let coordinationScore = 0;
        competitors.forEach(competitor => {
            if (competitor.priceStrategy === corporationPricing) {
                coordinationScore += 0.1;
            }
            
            // Check for synchronized price changes
            if (this.haveSynchronizedPriceChanges(corporation, competitor)) {
                coordinationScore += 0.2;
            }
        });
        
        return Math.min(1.0, coordinationScore);
    }

    haveSynchronizedPriceChanges(corp1, corp2) {
        // Check if corporations have made similar pricing changes recently
        // Simplified implementation
        return Math.random() < 0.1; // 10% chance of detected synchronization
    }

    detectCartel(leadCorporation, suspectedMembers) {
        const cartelId = uuidv4();
        const cartelMembers = [leadCorporation, ...suspectedMembers.filter(() => Math.random() < 0.7)];
        
        const cartel = {
            id: cartelId,
            type: 'cartel',
            industry: leadCorporation.industry,
            members: cartelMembers.map(corp => corp.id),
            coordinationLevel: leadCorporation.coordinationLevel,
            detectedAt: Date.now(),
            status: 'suspected',
            estimatedDamage: this.calculateCartelDamage(cartelMembers)
        };
        
        this.organizations.set(cartelId, cartel);
        this.state.detectedCartels++;
        
        this.emit('cartel_detected', {
            cartelId,
            industry: cartel.industry,
            members: cartel.members,
            estimatedDamage: cartel.estimatedDamage
        });
        
        return cartel;
    }

    calculateCartelDamage(cartelMembers) {
        return cartelMembers.reduce((total, corp) => total + corp.revenue * 0.1, 0);
    }

    updateMarketShare(corporation) {
        const industryCorps = this.getIndustryCompetitors(corporation);
        const totalIndustryRevenue = industryCorps.reduce((sum, corp) => sum + corp.revenue, 0) + corporation.revenue;
        
        if (totalIndustryRevenue > 0) {
            corporation.marketShare = corporation.revenue / totalIndustryRevenue;
        }
    }

    // Union formation and management
    createOrJoinUnion(agentId, agentWealth) {
        // Look for existing union for this wealth level
        const existingUnion = this.findCompatibleUnion(agentWealth);
        
        if (existingUnion) {
            return this.joinUnion(agentId, existingUnion.id);
        } else {
            return this.formUnion(agentId, agentWealth);
        }
    }

    findCompatibleUnion(agentWealth) {
        for (const [orgId, org] of this.organizations) {
            if (org.type === 'union' && 
                agentWealth >= org.minWealth && 
                agentWealth <= org.maxWealth) {
                return org;
            }
        }
        return null;
    }

    formUnion(leaderId, initialWealth) {
        const orgId = uuidv4();
        
        const union = {
            id: orgId,
            type: 'union',
            name: `Union-${orgId.slice(0, 8)}`,
            leaderId,
            members: new Set([leaderId]),
            minWealth: Math.max(0, initialWealth - 2000),
            maxWealth: initialWealth + 2000,
            
            // Union activities
            collectiveBargainingPower: 1,
            strikeHistory: [],
            negotiatedRaises: [],
            memberBenefits: {
                healthcare: false,
                pension: false,
                insurance: false
            },
            
            // Union finances
            dues: 50, // Monthly dues per member
            strikeFound: 0,
            established: Date.now(),
            
            // Political activity
            politicalInfluence: 0,
            endorsements: [],
            
            ...initialWealth
        };

        this.organizations.set(orgId, union);
        this.addMembership(leaderId, orgId);
        this.state.totalOrganizations++;
        this.state.activeUnions++;

        this.emit('union_formed', {
            unionId: orgId,
            leaderId,
            targetWealthRange: [union.minWealth, union.maxWealth]
        });

        return union;
    }

    joinUnion(agentId, unionId) {
        const union = this.organizations.get(unionId);
        if (!union || union.type !== 'union') return null;

        union.members.add(agentId);
        this.addMembership(agentId, unionId);
        
        // Update collective bargaining power
        union.collectiveBargainingPower = Math.sqrt(union.members.size);
        
        this.emit('union_membership_change', {
            unionId,
            agentId,
            action: 'joined',
            newMemberCount: union.members.size
        });

        return union;
    }

    manageUnion(unionId) {
        const union = this.organizations.get(unionId);
        if (!union || union.type !== 'union') return;

        // Collect dues
        const totalDues = union.members.size * union.dues;
        union.strikeFound += totalDues * 0.3; // 30% goes to strike fund
        
        // Determine if union should strike
        if (this.shouldUnionStrike(union)) {
            this.initiateStrike(union);
        }
        
        // Political lobbying
        if (union.strikeFound > 5000) {
            union.politicalInfluence += 1;
            union.strikeFound -= 1000; // Cost of lobbying
        }
        
        return {
            memberCount: union.members.size,
            bargainingPower: union.collectiveBargainingPower,
            strikeFund: union.strikeFound,
            politicalInfluence: union.politicalInfluence
        };
    }

    shouldUnionStrike(union) {
        // Strike probability based on member dissatisfaction and resources
        const resourceFactor = Math.min(1, union.strikeFound / 10000);
        const sizeFactor = Math.min(1, union.members.size / 50);
        const randomFactor = Math.random();
        
        return (resourceFactor * sizeFactor * randomFactor) > 0.8;
    }

    initiateStrike(union) {
        const strikeData = {
            unionId: union.id,
            participants: Array.from(union.members),
            startDate: Date.now(),
            estimatedDuration: Math.floor(Math.random() * 14) + 1, // 1-14 days
            demands: this.generateStrikeDemands(union)
        };
        
        union.strikeHistory.push(strikeData);
        
        // Deplete strike fund
        union.strikeFound *= 0.5;
        
        this.emit('union_strike', strikeData);
        
        return strikeData;
    }

    generateStrikeDemands(union) {
        const possibleDemands = [
            'wage_increase',
            'better_benefits',
            'job_security',
            'safer_conditions',
            'reduced_hours'
        ];
        
        const demandCount = Math.floor(Math.random() * 3) + 1;
        return possibleDemands.slice(0, demandCount);
    }

    // Criminal organization management
    createCriminalOrganization(leaderId, orgType = 'gang') {
        const orgId = uuidv4();
        
        const criminalOrg = {
            id: orgId,
            type: 'criminal',
            subtype: orgType, // gang, mafia, syndicate
            name: `${orgType}-${orgId.slice(0, 8)}`,
            leaderId,
            members: new Set([leaderId]),
            hierarchy: {
                leader: leaderId,
                lieutenants: new Set(),
                soldiers: new Set(),
                associates: new Set()
            },
            
            // Criminal activities
            territories: new Set(),
            activities: {
                extortion: { active: false, revenue: 0 },
                smuggling: { active: false, revenue: 0 },
                fraud: { active: false, revenue: 0 },
                blackmarket: { active: true, revenue: 0 }
            },
            
            // Organization metrics
            criminalReputation: 10,
            lawEnforcementHeat: 0,
            violence: 20,
            established: Date.now(),
            
            // Financial
            illegalRevenue: 0,
            expenses: 0,
            territory: 1
        };

        this.organizations.set(orgId, criminalOrg);
        this.addMembership(leaderId, orgId);
        this.state.totalOrganizations++;
        this.state.activeCriminalOrgs++;

        this.emit('criminal_organization_formed', {
            organizationId: orgId,
            leaderId,
            type: orgType
        });

        return criminalOrg;
    }

    manageCriminalOrganization(orgId) {
        const org = this.organizations.get(orgId);
        if (!org || org.type !== 'criminal') return;

        // Calculate illegal revenue from activities
        org.illegalRevenue = 0;
        Object.keys(org.activities).forEach(activity => {
            if (org.activities[activity].active) {
                const baseRevenue = org.members.size * 100;
                const reputationBonus = org.criminalReputation * 10;
                const territoryBonus = org.territory * 200;
                
                org.activities[activity].revenue = baseRevenue + reputationBonus + territoryBonus;
                org.illegalRevenue += org.activities[activity].revenue;
            }
        });

        // Calculate law enforcement heat
        org.lawEnforcementHeat += org.illegalRevenue * 0.001 + org.violence * 0.1;
        
        // Risk of being caught
        if (org.lawEnforcementHeat > 50 && Math.random() < 0.1) {
            this.raid_criminalOrganization(org);
        }
        
        // Expand territory randomly
        if (Math.random() < 0.05) {
            org.territory += 1;
            org.criminalReputation += 2;
        }
        
        return {
            revenue: org.illegalRevenue,
            memberCount: org.members.size,
            lawEnforcementHeat: org.lawEnforcementHeat,
            territory: org.territory
        };
    }

    raid_criminalOrganization(org) {
        // Law enforcement raid
        const arrestedMembers = [];
        
        org.members.forEach(memberId => {
            if (Math.random() < 0.3) { // 30% chance of arrest
                arrestedMembers.push(memberId);
                org.members.delete(memberId);
                this.removeMembership(memberId, org.id);
            }
        });
        
        // Reduce organization strength
        org.criminalReputation *= 0.7;
        org.lawEnforcementHeat *= 0.3;
        org.territory = Math.max(1, Math.floor(org.territory * 0.8));
        
        this.emit('criminal_raid', {
            organizationId: org.id,
            arrestedMembers,
            damageDealt: arrestedMembers.length
        });
        
        // Dissolve if too few members
        if (org.members.size < 2) {
            this.dissolveCriminalOrganization(org.id);
        }
    }

    // Professional Association management
    formProfessionalAssociation(founderId) {
        const orgId = uuidv4();
        
        const association = {
            id: orgId,
            type: 'professional',
            name: `Professional-${orgId.slice(0, 8)}`,
            founderId,
            members: new Set([founderId]),
            
            // Professional development
            certifications: [],
            trainingPrograms: [],
            networkingEvents: 0,
            
            // Member benefits
            jobBoard: true,
            insurance: false,
            legalSupport: false,
            
            // Association metrics
            reputation: 50,
            membershipFees: 100,
            established: Date.now()
        };

        this.organizations.set(orgId, association);
        this.addMembership(founderId, orgId);
        this.state.totalOrganizations++;

        this.emit('professional_association_formed', {
            associationId: orgId,
            founderId
        });

        return association;
    }

    joinProfessionalAssociation(agentId) {
        // Find or create a professional association
        let association = this.findSmallestProfessionalAssociation();
        
        if (!association) {
            association = this.formProfessionalAssociation(agentId);
        } else {
            association.members.add(agentId);
            this.addMembership(agentId, association.id);
        }
        
        return association;
    }

    findSmallestProfessionalAssociation() {
        let smallest = null;
        let smallestSize = Infinity;
        
        for (const [orgId, org] of this.organizations) {
            if (org.type === 'professional' && org.members.size < smallestSize) {
                smallest = org;
                smallestSize = org.members.size;
            }
        }
        
        return smallest;
    }

    manageProfessionalAssociation(orgId) {
        const association = this.organizations.get(orgId);
        if (!association || association.type !== 'professional') return;

        // Collect membership fees
        const totalFees = association.members.size * association.membershipFees;
        
        // Provide networking benefits
        if (Math.random() < 0.1) {
            association.networkingEvents++;
            
            // Random members benefit from networking
            const beneficiaries = Array.from(association.members)
                .filter(() => Math.random() < 0.3);
                
            beneficiaries.forEach(memberId => {
                this.emit('networking_benefit', {
                    agentId: memberId,
                    associationId: orgId,
                    benefit: 'career_advancement'
                });
            });
        }
        
        return {
            memberCount: association.members.size,
            revenue: totalFees,
            networkingEvents: association.networkingEvents
        };
    }

    // Organizational processing
    processOrganizationalActivities() {
        for (const [orgId, org] of this.organizations) {
            const managementFunction = this.organizationTypes[org.type]?.management;
            if (managementFunction) {
                managementFunction(orgId);
            }
        }
    }

    // Utility methods
    addMembership(agentId, orgId) {
        if (!this.membershipIndex.has(agentId)) {
            this.membershipIndex.set(agentId, new Set());
        }
        this.membershipIndex.get(agentId).add(orgId);
    }

    removeMembership(agentId, orgId) {
        const memberships = this.membershipIndex.get(agentId);
        if (memberships) {
            memberships.delete(orgId);
        }
    }

    addToIndustryIndex(industry, corpId) {
        if (!this.industryIndex.has(industry)) {
            this.industryIndex.set(industry, new Set());
        }
        this.industryIndex.get(industry).add(corpId);
    }

    getIndustryCompetitors(corporation) {
        const industryCorps = this.industryIndex.get(corporation.industry);
        if (!industryCorps) return [];
        
        return Array.from(industryCorps)
            .filter(corpId => corpId !== corporation.id)
            .map(corpId => this.organizations.get(corpId))
            .filter(corp => corp && corp.type === 'corporation');
    }

    hasUnionMembership(agentId) {
        const memberships = this.membershipIndex.get(agentId);
        if (!memberships) return false;
        
        for (const orgId of memberships) {
            const org = this.organizations.get(orgId);
            if (org && org.type === 'union') {
                return true;
            }
        }
        return false;
    }

    getActiveOrganizationCount() {
        return this.organizations.size;
    }

    getOrganizationStatistics() {
        const stats = {
            total: this.state.totalOrganizations,
            corporations: this.state.activeCorporations,
            unions: this.state.activeUnions,
            criminalOrgs: this.state.activeCriminalOrgs,
            detectedCartels: this.state.detectedCartels,
            totalRevenue: this.state.totalRevenue,
            totalTaxes: this.state.totalTaxes
        };
        
        // Calculate industry distribution
        stats.industryDistribution = {};
        for (const [industry, corps] of this.industryIndex) {
            stats.industryDistribution[industry] = corps.size;
        }
        
        return stats;
    }

    // Dissolution methods
    dissolveCorporation(corpId) {
        const corp = this.organizations.get(corpId);
        if (!corp || corp.type !== 'corporation') return false;
        
        // Remove from all indexes
        corp.employees.forEach(employeeId => {
            this.removeMembership(employeeId, corpId);
        });
        
        this.industryIndex.get(corp.industry)?.delete(corpId);
        this.organizations.delete(corpId);
        this.state.activeCorporations--;
        
        this.emit('corporation_dissolved', { corpId });
        return true;
    }

    dissolveUnion(unionId) {
        const union = this.organizations.get(unionId);
        if (!union || union.type !== 'union') return false;
        
        union.members.forEach(memberId => {
            this.removeMembership(memberId, unionId);
        });
        
        this.organizations.delete(unionId);
        this.state.activeUnions--;
        
        this.emit('union_dissolved', { unionId });
        return true;
    }

    dissolveCriminalOrganization(orgId) {
        const org = this.organizations.get(orgId);
        if (!org || org.type !== 'criminal') return false;
        
        org.members.forEach(memberId => {
            this.removeMembership(memberId, orgId);
        });
        
        this.organizations.delete(orgId);
        this.state.activeCriminalOrgs--;
        
        this.emit('criminal_organization_dissolved', { orgId });
        return true;
    }

    dissolveCartel(cartelId) {
        this.organizations.delete(cartelId);
        this.state.detectedCartels--;
        return true;
    }

    dissolveProfessionalAssociation(assocId) {
        const assoc = this.organizations.get(assocId);
        if (!assoc || assoc.type !== 'professional') return false;
        
        assoc.members.forEach(memberId => {
            this.removeMembership(memberId, assocId);
        });
        
        this.organizations.delete(assocId);
        
        this.emit('professional_association_dissolved', { assocId });
        return true;
    }
}

module.exports = SocialOrganizations;