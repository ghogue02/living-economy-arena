/**
 * WebGPU Acceleration Module for Living Economy Arena
 * Handles parallel agent calculations and economic computations
 */

class WebGPUAccelerator {
    constructor() {
        this.device = null;
        this.adapter = null;
        this.computePipelines = new Map();
        this.buffers = new Map();
        this.isInitialized = false;
        
        this.shaderCache = new Map();
        this.computeQueues = new Map();
        
        this.initializeWebGPU();
    }

    async initializeWebGPU() {
        try {
            // Check WebGPU support
            if (!navigator.gpu) {
                console.warn('WebGPU not supported, falling back to CPU computation');
                return false;
            }

            // Request adapter
            this.adapter = await navigator.gpu.requestAdapter({
                powerPreference: 'high-performance'
            });

            if (!this.adapter) {
                console.warn('WebGPU adapter not available');
                return false;
            }

            // Request device
            this.device = await this.adapter.requestDevice({
                requiredFeatures: ['timestamp-query'],
                requiredLimits: {
                    maxStorageBufferBindingSize: 1024 * 1024 * 1024, // 1GB
                    maxComputeWorkgroupStorageSize: 32768,
                    maxComputeInvocationsPerWorkgroup: 1024,
                    maxComputeWorkgroupsPerDimension: 65535
                }
            });

            console.log('WebGPU initialized successfully');
            console.log('Adapter info:', await this.adapter.requestAdapterInfo());
            
            this.isInitialized = true;
            this.setupComputePipelines();
            
            return true;
        } catch (error) {
            console.error('WebGPU initialization failed:', error);
            return false;
        }
    }

    setupComputePipelines() {
        // Economic calculation pipeline
        this.createComputePipeline('economic_simulation', this.getEconomicSimulationShader());
        
        // Agent decision matrix pipeline
        this.createComputePipeline('agent_decisions', this.getAgentDecisionShader());
        
        // Market price calculation pipeline
        this.createComputePipeline('market_pricing', this.getMarketPricingShader());
        
        // Resource allocation optimization
        this.createComputePipeline('resource_optimization', this.getResourceOptimizationShader());
        
        // Network topology analysis
        this.createComputePipeline('network_analysis', this.getNetworkAnalysisShader());
    }

    createComputePipeline(name, shaderCode) {
        if (!this.isInitialized) return;

        const shaderModule = this.device.createShaderModule({
            code: shaderCode
        });

        const pipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'main'
            }
        });

        this.computePipelines.set(name, pipeline);
        console.log(`Created compute pipeline: ${name}`);
    }

    async runEconomicSimulation(agents, marketData, simulationSteps = 1000) {
        if (!this.isInitialized) {
            return this.fallbackEconomicSimulation(agents, marketData, simulationSteps);
        }

        const pipeline = this.computePipelines.get('economic_simulation');
        if (!pipeline) throw new Error('Economic simulation pipeline not found');

        // Prepare input data
        const agentData = this.serializeAgentData(agents);
        const marketDataSerialized = this.serializeMarketData(marketData);

        // Create buffers
        const agentBuffer = this.createBuffer('agent_input', agentData);
        const marketBuffer = this.createBuffer('market_input', marketDataSerialized);
        const resultBuffer = this.createBuffer('simulation_output', new Float32Array(agents.length * 32));

        // Create bind group
        const bindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: agentBuffer } },
                { binding: 1, resource: { buffer: marketBuffer } },
                { binding: 2, resource: { buffer: resultBuffer } }
            ]
        });

        // Execute computation
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(agents.length / 64), simulationSteps);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        // Read results
        const results = await this.readBuffer(resultBuffer);
        this.cleanupBuffers([agentBuffer, marketBuffer, resultBuffer]);

        return this.deserializeSimulationResults(results, agents.length);
    }

    async calculateAgentDecisions(agentStates, environmentData) {
        if (!this.isInitialized) {
            return this.fallbackAgentDecisions(agentStates, environmentData);
        }

        const pipeline = this.computePipelines.get('agent_decisions');
        const stateData = this.serializeAgentStates(agentStates);
        const envData = this.serializeEnvironmentData(environmentData);

        const stateBuffer = this.createBuffer('agent_states', stateData);
        const envBuffer = this.createBuffer('environment', envData);
        const decisionBuffer = this.createBuffer('decisions', new Float32Array(agentStates.length * 16));

        const bindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: stateBuffer } },
                { binding: 1, resource: { buffer: envBuffer } },
                { binding: 2, resource: { buffer: decisionBuffer } }
            ]
        });

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(agentStates.length / 64));
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        const results = await this.readBuffer(decisionBuffer);
        this.cleanupBuffers([stateBuffer, envBuffer, decisionBuffer]);

        return this.deserializeAgentDecisions(results, agentStates.length);
    }

    async optimizeResourceAllocation(resources, demands, constraints) {
        if (!this.isInitialized) {
            return this.fallbackResourceOptimization(resources, demands, constraints);
        }

        const pipeline = this.computePipelines.get('resource_optimization');
        
        // Serialize optimization problem
        const resourceData = new Float32Array(resources.flat());
        const demandData = new Float32Array(demands.flat());
        const constraintData = new Float32Array(constraints.flat());

        const resourceBuffer = this.createBuffer('resources', resourceData);
        const demandBuffer = this.createBuffer('demands', demandData);
        const constraintBuffer = this.createBuffer('constraints', constraintData);
        const solutionBuffer = this.createBuffer('solution', new Float32Array(resources.length * demands.length));

        const bindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: resourceBuffer } },
                { binding: 1, resource: { buffer: demandBuffer } },
                { binding: 2, resource: { buffer: constraintBuffer } },
                { binding: 3, resource: { buffer: solutionBuffer } }
            ]
        });

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(resources.length / 32), Math.ceil(demands.length / 32));
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        const results = await this.readBuffer(solutionBuffer);
        this.cleanupBuffers([resourceBuffer, demandBuffer, constraintBuffer, solutionBuffer]);

        return this.deserializeOptimizationSolution(results, resources.length, demands.length);
    }

    createBuffer(name, data) {
        const buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });

        new (data.constructor)(buffer.getMappedRange()).set(data);
        buffer.unmap();

        this.buffers.set(name, buffer);
        return buffer;
    }

    async readBuffer(buffer) {
        const readBuffer = this.device.createBuffer({
            size: buffer.size,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, buffer.size);
        this.device.queue.submit([commandEncoder.finish()]);

        await readBuffer.mapAsync(GPUMapMode.READ);
        const arrayBuffer = readBuffer.getMappedRange();
        const result = new Float32Array(arrayBuffer.slice());
        readBuffer.unmap();
        readBuffer.destroy();

        return result;
    }

    cleanupBuffers(buffers) {
        buffers.forEach(buffer => {
            if (buffer) buffer.destroy();
        });
    }

    // WebGPU Compute Shaders
    getEconomicSimulationShader() {
        return `
            @group(0) @binding(0) var<storage, read> agentData: array<f32>;
            @group(0) @binding(1) var<storage, read> marketData: array<f32>;
            @group(0) @binding(2) var<storage, read_write> results: array<f32>;

            @compute @workgroup_size(64)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let index = global_id.x;
                if (index >= arrayLength(&agentData) / 8) {
                    return;
                }

                // Agent economic calculations
                let agentBase = index * 8u;
                let wealth = agentData[agentBase];
                let production = agentData[agentBase + 1u];
                let consumption = agentData[agentBase + 2u];
                let utility = agentData[agentBase + 3u];

                // Market influence calculations
                let marketPrice = marketData[0];
                let supply = marketData[1];
                let demand = marketData[2];

                // Economic simulation step
                let newWealth = wealth + production - consumption;
                let newUtility = utility * (1.0 + (newWealth - wealth) * 0.01);
                let priceImpact = (production - consumption) / supply;

                // Store results
                let resultBase = index * 32u;
                results[resultBase] = newWealth;
                results[resultBase + 1u] = newUtility;
                results[resultBase + 2u] = priceImpact;
                results[resultBase + 3u] = production * marketPrice;
            }
        `;
    }

    getAgentDecisionShader() {
        return `
            @group(0) @binding(0) var<storage, read> agentStates: array<f32>;
            @group(0) @binding(1) var<storage, read> environment: array<f32>;
            @group(0) @binding(2) var<storage, read_write> decisions: array<f32>;

            @compute @workgroup_size(64)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let index = global_id.x;
                if (index >= arrayLength(&agentStates) / 16) {
                    return;
                }

                let stateBase = index * 16u;
                let decisionBase = index * 16u;

                // Agent state variables
                let energy = agentStates[stateBase];
                let resources = agentStates[stateBase + 1u];
                let position_x = agentStates[stateBase + 2u];
                let position_y = agentStates[stateBase + 3u];

                // Environment variables
                let resource_density = environment[0];
                let competition_level = environment[1];

                // Decision neural network simulation
                let input_layer = vec4<f32>(energy, resources, resource_density, competition_level);
                let hidden_layer = activation(input_layer);
                let output_layer = decision_network(hidden_layer);

                // Store decisions
                decisions[decisionBase] = output_layer.x; // move_x
                decisions[decisionBase + 1u] = output_layer.y; // move_y
                decisions[decisionBase + 2u] = output_layer.z; // action_type
                decisions[decisionBase + 3u] = output_layer.w; // action_intensity
            }

            fn activation(input: vec4<f32>) -> vec4<f32> {
                return 1.0 / (1.0 + exp(-input)); // Sigmoid activation
            }

            fn decision_network(hidden: vec4<f32>) -> vec4<f32> {
                // Simplified neural network for agent decisions
                let weights = mat4x4<f32>(
                    vec4<f32>(0.5, -0.3, 0.7, 0.2),
                    vec4<f32>(-0.4, 0.6, -0.1, 0.8),
                    vec4<f32>(0.3, 0.2, -0.5, 0.4),
                    vec4<f32>(-0.7, 0.1, 0.6, -0.3)
                );
                return weights * hidden;
            }
        `;
    }

    getMarketPricingShader() {
        return `
            @group(0) @binding(0) var<storage, read> supply: array<f32>;
            @group(0) @binding(1) var<storage, read> demand: array<f32>;
            @group(0) @binding(2) var<storage, read_write> prices: array<f32>;

            @compute @workgroup_size(32)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let index = global_id.x;
                if (index >= arrayLength(&supply)) {
                    return;
                }

                let s = supply[index];
                let d = demand[index];
                
                // Price calculation based on supply and demand
                let equilibrium_price = d / max(s, 0.001);
                let volatility = abs(s - d) / max(s + d, 0.001);
                
                prices[index] = equilibrium_price * (1.0 + volatility * 0.1);
            }
        `;
    }

    getResourceOptimizationShader() {
        return `
            @group(0) @binding(0) var<storage, read> resources: array<f32>;
            @group(0) @binding(1) var<storage, read> demands: array<f32>;
            @group(0) @binding(2) var<storage, read> constraints: array<f32>;
            @group(0) @binding(3) var<storage, read_write> solution: array<f32>;

            @compute @workgroup_size(32, 32)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let resource_id = global_id.x;
                let demand_id = global_id.y;
                
                if (resource_id >= arrayLength(&resources) || demand_id >= arrayLength(&demands)) {
                    return;
                }

                let allocation_index = resource_id * arrayLength(&demands) + demand_id;
                
                // Simplified linear programming solution
                let resource_available = resources[resource_id];
                let demand_requirement = demands[demand_id];
                let constraint_factor = constraints[min(resource_id, arrayLength(&constraints) - 1u)];
                
                let allocation = min(resource_available, demand_requirement) * constraint_factor;
                solution[allocation_index] = allocation;
            }
        `;
    }

    getNetworkAnalysisShader() {
        return `
            @group(0) @binding(0) var<storage, read> adjacency: array<f32>;
            @group(0) @binding(1) var<storage, read_write> centrality: array<f32>;

            @compute @workgroup_size(64)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let node = global_id.x;
                let n = u32(sqrt(f32(arrayLength(&adjacency))));
                
                if (node >= n) {
                    return;
                }

                // Calculate betweenness centrality
                var total_centrality = 0.0;
                
                for (var i = 0u; i < n; i++) {
                    for (var j = 0u; j < n; j++) {
                        if (i != j && i != node && j != node) {
                            let path_through_node = adjacency[i * n + node] * adjacency[node * n + j];
                            let direct_path = adjacency[i * n + j];
                            
                            if (path_through_node > 0.0 && (direct_path == 0.0 || path_through_node < direct_path)) {
                                total_centrality += 1.0;
                            }
                        }
                    }
                }
                
                centrality[node] = total_centrality;
            }
        `;
    }

    // Fallback CPU implementations
    fallbackEconomicSimulation(agents, marketData, steps) {
        console.log('Using CPU fallback for economic simulation');
        // Implement CPU-based economic simulation
        return agents.map(agent => ({
            wealth: agent.wealth * 1.01,
            utility: agent.utility * 1.005,
            production: agent.production,
            consumption: agent.consumption
        }));
    }

    fallbackAgentDecisions(agentStates, environmentData) {
        console.log('Using CPU fallback for agent decisions');
        return agentStates.map(state => ({
            move_x: Math.random() * 2 - 1,
            move_y: Math.random() * 2 - 1,
            action_type: Math.floor(Math.random() * 4),
            action_intensity: Math.random()
        }));
    }

    fallbackResourceOptimization(resources, demands, constraints) {
        console.log('Using CPU fallback for resource optimization');
        // Simple greedy allocation
        const allocation = [];
        for (let i = 0; i < resources.length; i++) {
            allocation[i] = [];
            for (let j = 0; j < demands.length; j++) {
                allocation[i][j] = Math.min(resources[i], demands[j]) * (constraints[i] || 1);
            }
        }
        return allocation;
    }

    // Data serialization helpers
    serializeAgentData(agents) {
        const data = new Float32Array(agents.length * 8);
        agents.forEach((agent, i) => {
            const offset = i * 8;
            data[offset] = agent.wealth || 0;
            data[offset + 1] = agent.production || 0;
            data[offset + 2] = agent.consumption || 0;
            data[offset + 3] = agent.utility || 0;
            data[offset + 4] = agent.energy || 0;
            data[offset + 5] = agent.position?.x || 0;
            data[offset + 6] = agent.position?.y || 0;
            data[offset + 7] = agent.id || 0;
        });
        return data;
    }

    serializeMarketData(marketData) {
        return new Float32Array([
            marketData.price || 1,
            marketData.supply || 0,
            marketData.demand || 0,
            marketData.volatility || 0
        ]);
    }

    serializeAgentStates(states) {
        const data = new Float32Array(states.length * 16);
        states.forEach((state, i) => {
            const offset = i * 16;
            data[offset] = state.energy || 0;
            data[offset + 1] = state.resources || 0;
            data[offset + 2] = state.position?.x || 0;
            data[offset + 3] = state.position?.y || 0;
            // Add more state variables as needed
        });
        return data;
    }

    serializeEnvironmentData(envData) {
        return new Float32Array([
            envData.resourceDensity || 1,
            envData.competitionLevel || 0.5,
            envData.temperature || 0.5,
            envData.seasonality || 0
        ]);
    }

    deserializeSimulationResults(results, agentCount) {
        const parsed = [];
        for (let i = 0; i < agentCount; i++) {
            const offset = i * 32;
            parsed.push({
                wealth: results[offset],
                utility: results[offset + 1],
                priceImpact: results[offset + 2],
                marketValue: results[offset + 3]
            });
        }
        return parsed;
    }

    deserializeAgentDecisions(results, agentCount) {
        const decisions = [];
        for (let i = 0; i < agentCount; i++) {
            const offset = i * 16;
            decisions.push({
                move_x: results[offset],
                move_y: results[offset + 1],
                action_type: Math.floor(results[offset + 2]),
                action_intensity: results[offset + 3]
            });
        }
        return decisions;
    }

    deserializeOptimizationSolution(results, resourceCount, demandCount) {
        const solution = [];
        for (let i = 0; i < resourceCount; i++) {
            solution[i] = [];
            for (let j = 0; j < demandCount; j++) {
                solution[i][j] = results[i * demandCount + j];
            }
        }
        return solution;
    }

    getPerformanceMetrics() {
        if (!this.isInitialized) return null;

        return {
            isWebGPUAvailable: true,
            adapterInfo: this.adapter ? 'Available' : 'Not Available',
            deviceLimits: this.device ? {
                maxStorageBufferBindingSize: this.device.limits.maxStorageBufferBindingSize,
                maxComputeWorkgroupsPerDimension: this.device.limits.maxComputeWorkgroupsPerDimension
            } : null,
            activePipelines: this.computePipelines.size,
            memoryUsage: this.buffers.size
        };
    }
}

module.exports = WebGPUAccelerator;