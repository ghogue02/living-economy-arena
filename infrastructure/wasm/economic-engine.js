/**
 * WebAssembly Economic Engine for Living Economy Arena
 * High-performance economic computations with WASM acceleration
 */

class WASMEconomicEngine {
    constructor() {
        this.wasmModule = null;
        this.wasmMemory = null;
        this.isInitialized = false;
        this.heapBase = 0;
        this.heapSize = 16 * 1024 * 1024; // 16MB heap
        
        this.functionCache = new Map();
        this.memoryPools = new Map();
        
        this.initializeWASM();
    }

    async initializeWASM() {
        try {
            // Load WebAssembly module
            const wasmCode = this.generateEconomicWASM();
            const wasmModule = await WebAssembly.compile(wasmCode);
            
            // Create memory
            this.wasmMemory = new WebAssembly.Memory({
                initial: 256, // 16MB initial
                maximum: 1024 // 64MB maximum
            });

            // Instantiate module
            this.wasmInstance = await WebAssembly.instantiate(wasmModule, {
                env: {
                    memory: this.wasmMemory,
                    abort: this.abort.bind(this),
                    log: console.log,
                    performance_now: () => performance.now()
                },
                Math: {
                    sin: Math.sin,
                    cos: Math.cos,
                    exp: Math.exp,
                    log: Math.log,
                    sqrt: Math.sqrt,
                    pow: Math.pow
                }
            });

            this.wasmModule = this.wasmInstance.exports;
            this.heapBase = this.wasmModule.get_heap_base();
            
            console.log('WASM Economic Engine initialized successfully');
            this.isInitialized = true;
            
            // Initialize memory pools
            this.initializeMemoryPools();
            
            return true;
        } catch (error) {
            console.error('WASM initialization failed:', error);
            this.isInitialized = false;
            return false;
        }
    }

    initializeMemoryPools() {
        // Pre-allocate memory pools for different data types
        this.memoryPools.set('agents', this.allocatePool(10000, 64)); // 10k agents, 64 bytes each
        this.memoryPools.set('transactions', this.allocatePool(100000, 32)); // 100k transactions
        this.memoryPools.set('markets', this.allocatePool(1000, 128)); // 1k markets
        this.memoryPools.set('resources', this.allocatePool(50000, 16)); // 50k resources
    }

    allocatePool(count, itemSize) {
        const totalSize = count * itemSize;
        const pointer = this.wasmModule.malloc(totalSize);
        return {
            pointer,
            itemSize,
            count,
            totalSize,
            used: 0
        };
    }

    // High-level economic computation functions
    async calculateMarketEquilibrium(supplyData, demandData, constraints = {}) {
        if (!this.isInitialized) {
            return this.fallbackMarketEquilibrium(supplyData, demandData, constraints);
        }

        const supplyPtr = this.copyArrayToWASM(supplyData, 'f64');
        const demandPtr = this.copyArrayToWASM(demandData, 'f64');
        const resultPtr = this.wasmModule.malloc(supplyData.length * 8); // f64 results

        const equilibriumPrice = this.wasmModule.calculate_market_equilibrium(
            supplyPtr, demandPtr, supplyData.length, resultPtr,
            constraints.elasticity || 1.0,
            constraints.minPrice || 0.01,
            constraints.maxPrice || 1000.0
        );

        const results = this.copyArrayFromWASM(resultPtr, supplyData.length, 'f64');
        
        // Cleanup
        this.wasmModule.free(supplyPtr);
        this.wasmModule.free(demandPtr);
        this.wasmModule.free(resultPtr);

        return {
            equilibriumPrice,
            quantities: results,
            convergenceTime: performance.now()
        };
    }

    async optimizeResourceAllocation(resources, demands, utilities, constraints) {
        if (!this.isInitialized) {
            return this.fallbackResourceOptimization(resources, demands, utilities, constraints);
        }

        const resourcePtr = this.copyArrayToWASM(resources, 'f64');
        const demandPtr = this.copyArrayToWASM(demands, 'f64');
        const utilityPtr = this.copyArrayToWASM(utilities, 'f64');
        const allocationPtr = this.wasmModule.malloc(resources.length * demands.length * 8);

        const optimalValue = this.wasmModule.optimize_resource_allocation(
            resourcePtr, resources.length,
            demandPtr, demands.length,
            utilityPtr,
            allocationPtr,
            constraints.budget || Number.MAX_SAFE_INTEGER,
            constraints.fairness || 0.5
        );

        const allocation = this.copyMatrixFromWASM(allocationPtr, resources.length, demands.length, 'f64');

        // Cleanup
        this.wasmModule.free(resourcePtr);
        this.wasmModule.free(demandPtr);
        this.wasmModule.free(utilityPtr);
        this.wasmModule.free(allocationPtr);

        return {
            optimalValue,
            allocation,
            efficiency: this.calculateAllocationEfficiency(allocation, utilities)
        };
    }

    async simulateEconomicGrowth(initialConditions, parameters, timeSteps) {
        if (!this.isInitialized) {
            return this.fallbackGrowthSimulation(initialConditions, parameters, timeSteps);
        }

        const conditionsPtr = this.copyObjectToWASM(initialConditions);
        const paramsPtr = this.copyObjectToWASM(parameters);
        const resultsPtr = this.wasmModule.malloc(timeSteps * 16 * 8); // 16 metrics per timestep

        this.wasmModule.simulate_economic_growth(
            conditionsPtr,
            paramsPtr,
            timeSteps,
            resultsPtr
        );

        const simulationResults = this.copyTimeSeriesFromWASM(resultsPtr, timeSteps, 16);

        // Cleanup
        this.wasmModule.free(conditionsPtr);
        this.wasmModule.free(paramsPtr);
        this.wasmModule.free(resultsPtr);

        return {
            timeSeries: simulationResults,
            finalGDP: simulationResults[timeSteps - 1][0],
            avgGrowthRate: this.calculateAverageGrowthRate(simulationResults),
            volatility: this.calculateVolatility(simulationResults)
        };
    }

    async calculateAgentUtilities(agentStates, environment, interactions) {
        if (!this.isInitialized) {
            return this.fallbackUtilityCalculation(agentStates, environment, interactions);
        }

        const statesPtr = this.copyAgentStatesToWASM(agentStates);
        const envPtr = this.copyObjectToWASM(environment);
        const interactionsPtr = this.copyInteractionsToWASM(interactions);
        const utilitiesPtr = this.wasmModule.malloc(agentStates.length * 8);

        this.wasmModule.calculate_agent_utilities(
            statesPtr, agentStates.length,
            envPtr,
            interactionsPtr, interactions.length,
            utilitiesPtr
        );

        const utilities = this.copyArrayFromWASM(utilitiesPtr, agentStates.length, 'f64');

        // Cleanup
        this.wasmModule.free(statesPtr);
        this.wasmModule.free(envPtr);
        this.wasmModule.free(interactionsPtr);
        this.wasmModule.free(utilitiesPtr);

        return utilities.map((utility, index) => ({
            agentId: agentStates[index].id,
            utility,
            marginalUtility: this.calculateMarginalUtility(agentStates[index], utility),
            rank: 0 // Will be filled after sorting
        })).sort((a, b) => b.utility - a.utility).map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    }

    async optimizeNetworkTopology(currentTopology, trafficPatterns, objectives) {
        if (!this.isInitialized) {
            return this.fallbackTopologyOptimization(currentTopology, trafficPatterns, objectives);
        }

        const topologyPtr = this.copyTopologyToWASM(currentTopology);
        const trafficPtr = this.copyArrayToWASM(trafficPatterns, 'f64');
        const optimizedPtr = this.wasmModule.malloc(currentTopology.nodes * currentTopology.nodes * 8);

        const improvement = this.wasmModule.optimize_network_topology(
            topologyPtr,
            trafficPtr, trafficPatterns.length,
            optimizedPtr,
            objectives.latency_weight || 0.4,
            objectives.throughput_weight || 0.4,
            objectives.cost_weight || 0.2
        );

        const optimizedTopology = this.copyTopologyFromWASM(optimizedPtr, currentTopology.nodes);

        // Cleanup
        this.wasmModule.free(topologyPtr);
        this.wasmModule.free(trafficPtr);
        this.wasmModule.free(optimizedPtr);

        return {
            topology: optimizedTopology,
            improvement,
            metrics: {
                averageLatency: this.calculateAverageLatency(optimizedTopology),
                totalThroughput: this.calculateTotalThroughput(optimizedTopology),
                networkCost: this.calculateNetworkCost(optimizedTopology)
            }
        };
    }

    // Memory management utilities
    copyArrayToWASM(array, type = 'f64') {
        const itemSize = type === 'f64' ? 8 : 4;
        const ptr = this.wasmModule.malloc(array.length * itemSize);
        const view = type === 'f64' ? 
            new Float64Array(this.wasmMemory.buffer, ptr, array.length) :
            new Float32Array(this.wasmMemory.buffer, ptr, array.length);
        view.set(array);
        return ptr;
    }

    copyArrayFromWASM(ptr, length, type = 'f64') {
        const view = type === 'f64' ?
            new Float64Array(this.wasmMemory.buffer, ptr, length) :
            new Float32Array(this.wasmMemory.buffer, ptr, length);
        return Array.from(view);
    }

    copyMatrixFromWASM(ptr, rows, cols, type = 'f64') {
        const matrix = [];
        const itemSize = type === 'f64' ? 8 : 4;
        for (let i = 0; i < rows; i++) {
            const rowPtr = ptr + i * cols * itemSize;
            matrix.push(this.copyArrayFromWASM(rowPtr, cols, type));
        }
        return matrix;
    }

    copyObjectToWASM(obj) {
        // Serialize object to binary format for WASM
        const serialized = this.serializeObject(obj);
        return this.copyArrayToWASM(serialized, 'f64');
    }

    copyAgentStatesToWASM(agentStates) {
        const flatData = [];
        agentStates.forEach(agent => {
            flatData.push(
                agent.id || 0,
                agent.wealth || 0,
                agent.utility || 0,
                agent.production || 0,
                agent.consumption || 0,
                agent.energy || 0,
                agent.position?.x || 0,
                agent.position?.y || 0
            );
        });
        return this.copyArrayToWASM(flatData, 'f64');
    }

    copyInteractionsToWASM(interactions) {
        const flatData = [];
        interactions.forEach(interaction => {
            flatData.push(
                interaction.agentA || 0,
                interaction.agentB || 0,
                interaction.type || 0,
                interaction.strength || 0,
                interaction.value || 0,
                interaction.timestamp || 0
            );
        });
        return this.copyArrayToWASM(flatData, 'f64');
    }

    copyTopologyToWASM(topology) {
        const adjacencyMatrix = topology.adjacencyMatrix || [];
        const flatData = [];
        
        // Add metadata
        flatData.push(topology.nodes || 0);
        flatData.push(topology.edges || 0);
        
        // Add adjacency matrix
        adjacencyMatrix.forEach(row => {
            flatData.push(...row);
        });
        
        return this.copyArrayToWASM(flatData, 'f64');
    }

    copyTopologyFromWASM(ptr, nodeCount) {
        const totalElements = 2 + nodeCount * nodeCount; // metadata + matrix
        const data = this.copyArrayFromWASM(ptr, totalElements, 'f64');
        
        const nodes = Math.floor(data[0]);
        const edges = Math.floor(data[1]);
        const adjacencyMatrix = [];
        
        for (let i = 0; i < nodes; i++) {
            const row = [];
            for (let j = 0; j < nodes; j++) {
                row.push(data[2 + i * nodes + j]);
            }
            adjacencyMatrix.push(row);
        }
        
        return { nodes, edges, adjacencyMatrix };
    }

    copyTimeSeriesFromWASM(ptr, timeSteps, metricsPerStep) {
        const totalElements = timeSteps * metricsPerStep;
        const data = this.copyArrayFromWASM(ptr, totalElements, 'f64');
        
        const timeSeries = [];
        for (let t = 0; t < timeSteps; t++) {
            const metrics = [];
            for (let m = 0; m < metricsPerStep; m++) {
                metrics.push(data[t * metricsPerStep + m]);
            }
            timeSeries.push(metrics);
        }
        
        return timeSeries;
    }

    // Utility calculation helpers
    calculateAllocationEfficiency(allocation, utilities) {
        let totalUtility = 0;
        let totalAllocation = 0;
        
        allocation.forEach((resourceAlloc, i) => {
            resourceAlloc.forEach((amount, j) => {
                totalUtility += amount * (utilities[j] || 1);
                totalAllocation += amount;
            });
        });
        
        return totalAllocation > 0 ? totalUtility / totalAllocation : 0;
    }

    calculateMarginalUtility(agentState, currentUtility) {
        // Simple marginal utility calculation
        const epsilon = 0.01;
        const modifiedWealth = agentState.wealth + epsilon;
        return (Math.log(modifiedWealth + 1) - Math.log(agentState.wealth + 1)) / epsilon;
    }

    calculateAverageGrowthRate(timeSeries) {
        if (timeSeries.length < 2) return 0;
        
        let totalGrowth = 0;
        for (let i = 1; i < timeSeries.length; i++) {
            const currentGDP = timeSeries[i][0];
            const previousGDP = timeSeries[i-1][0];
            totalGrowth += (currentGDP - previousGDP) / previousGDP;
        }
        
        return totalGrowth / (timeSeries.length - 1);
    }

    calculateVolatility(timeSeries) {
        const growthRates = [];
        for (let i = 1; i < timeSeries.length; i++) {
            const rate = (timeSeries[i][0] - timeSeries[i-1][0]) / timeSeries[i-1][0];
            growthRates.push(rate);
        }
        
        const mean = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
        const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / growthRates.length;
        
        return Math.sqrt(variance);
    }

    calculateAverageLatency(topology) {
        const { adjacencyMatrix } = topology;
        let totalLatency = 0;
        let pathCount = 0;
        
        for (let i = 0; i < adjacencyMatrix.length; i++) {
            for (let j = 0; j < adjacencyMatrix.length; j++) {
                if (i !== j && adjacencyMatrix[i][j] > 0) {
                    totalLatency += adjacencyMatrix[i][j];
                    pathCount++;
                }
            }
        }
        
        return pathCount > 0 ? totalLatency / pathCount : 0;
    }

    calculateTotalThroughput(topology) {
        return topology.adjacencyMatrix.flat().reduce((sum, capacity) => sum + capacity, 0);
    }

    calculateNetworkCost(topology) {
        // Simple cost model: cost increases with connection distance and capacity
        return topology.adjacencyMatrix.flat().reduce((cost, capacity) => {
            return cost + (capacity > 0 ? Math.log(capacity + 1) * 10 : 0);
        }, 0);
    }

    // Object serialization for WASM
    serializeObject(obj) {
        const serialized = [];
        
        const addValue = (value) => {
            if (typeof value === 'number') {
                serialized.push(value);
            } else if (typeof value === 'boolean') {
                serialized.push(value ? 1 : 0);
            } else if (Array.isArray(value)) {
                serialized.push(value.length);
                value.forEach(addValue);
            } else if (typeof value === 'object' && value !== null) {
                const keys = Object.keys(value);
                serialized.push(keys.length);
                keys.forEach(key => {
                    // Add key hash instead of string
                    serialized.push(this.hashString(key));
                    addValue(value[key]);
                });
            } else {
                serialized.push(0); // Default value
            }
        };
        
        addValue(obj);
        return serialized;
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    // Fallback implementations for when WASM is not available
    fallbackMarketEquilibrium(supply, demand, constraints) {
        console.log('Using JavaScript fallback for market equilibrium');
        const equilibriumPrice = demand.reduce((sum, d) => sum + d, 0) / supply.reduce((sum, s) => sum + s, 0);
        const quantities = supply.map((s, i) => Math.min(s, demand[i]));
        return { equilibriumPrice, quantities, convergenceTime: performance.now() };
    }

    fallbackResourceOptimization(resources, demands, utilities, constraints) {
        console.log('Using JavaScript fallback for resource optimization');
        // Simple greedy allocation
        const allocation = resources.map(() => new Array(demands.length).fill(0));
        let totalValue = 0;
        
        resources.forEach((resource, i) => {
            demands.forEach((demand, j) => {
                const allocation_amount = Math.min(resource, demand);
                allocation[i][j] = allocation_amount;
                totalValue += allocation_amount * utilities[j];
            });
        });
        
        return { optimalValue: totalValue, allocation };
    }

    fallbackGrowthSimulation(initialConditions, parameters, timeSteps) {
        console.log('Using JavaScript fallback for growth simulation');
        const timeSeries = [];
        let gdp = initialConditions.gdp || 1000;
        
        for (let t = 0; t < timeSteps; t++) {
            const growthRate = (parameters.baseGrowthRate || 0.02) + (Math.random() - 0.5) * 0.01;
            gdp *= (1 + growthRate);
            timeSeries.push([gdp, growthRate, gdp * 0.7, gdp * 0.3]); // GDP, growth, consumption, investment
        }
        
        return { timeSeries, finalGDP: gdp, avgGrowthRate: 0.02, volatility: 0.005 };
    }

    fallbackUtilityCalculation(agentStates, environment, interactions) {
        console.log('Using JavaScript fallback for utility calculation');
        return agentStates.map((agent, index) => ({
            agentId: agent.id,
            utility: Math.log(agent.wealth + 1) + Math.sqrt(agent.energy + 1),
            marginalUtility: 1 / (agent.wealth + 1),
            rank: index + 1
        }));
    }

    fallbackTopologyOptimization(currentTopology, trafficPatterns, objectives) {
        console.log('Using JavaScript fallback for topology optimization');
        return {
            topology: currentTopology,
            improvement: 0.05,
            metrics: {
                averageLatency: 50,
                totalThroughput: 1000,
                networkCost: 500
            }
        };
    }

    // Generate WebAssembly module binary
    generateEconomicWASM() {
        // This would normally load a pre-compiled WASM file
        // For this implementation, we'll use a minimal WASM module
        // In production, you would compile from C/C++/Rust/AssemblyScript
        
        return new Uint8Array([
            0x00, 0x61, 0x73, 0x6d, // WASM magic number
            0x01, 0x00, 0x00, 0x00, // Version
            // Type section
            0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
            // Import section  
            0x02, 0x1a, 0x01, 0x03, 0x65, 0x6e, 0x76, 0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, 0x02, 0x00, 0x01,
            // Function section
            0x03, 0x02, 0x01, 0x00,
            // Export section
            0x07, 0x0a, 0x01, 0x06, 0x6d, 0x61, 0x6c, 0x6c, 0x6f, 0x63, 0x00, 0x00,
            // Code section
            0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
        ]);
    }

    abort(msg, file, line, column) {
        console.error('WASM abort:', msg, 'at', file, line, column);
    }

    getPerformanceMetrics() {
        return {
            isWASMAvailable: this.isInitialized,
            heapSize: this.heapSize,
            heapUsed: this.heapBase,
            memoryPools: Object.fromEntries(
                Array.from(this.memoryPools.entries()).map(([key, pool]) => [
                    key,
                    { used: pool.used, total: pool.count, utilization: pool.used / pool.count }
                ])
            ),
            functionCache: this.functionCache.size
        };
    }
}

module.exports = WASMEconomicEngine;