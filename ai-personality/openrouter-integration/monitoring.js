/**
 * OpenRouter Integration Monitoring and Analytics System
 * Real-time performance tracking, bottleneck analysis, and optimization
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class OpenRouterMonitor extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = config;
        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                rateLimited: 0,
                byModel: new Map(),
                byType: new Map(),
                hourly: new Array(24).fill(0),
                daily: new Array(30).fill(0)
            },
            
            performance: {
                responseTime: {
                    average: 0,
                    min: Infinity,
                    max: 0,
                    p95: 0,
                    p99: 0,
                    samples: []
                },
                throughput: {
                    requestsPerSecond: 0,
                    requestsPerMinute: 0,
                    requestsPerHour: 0
                },
                reliability: {
                    uptime: 0,
                    availability: 1.0,
                    mtbf: 0, // Mean Time Between Failures
                    mttr: 0  // Mean Time To Recovery
                }
            },
            
            costs: {
                totalSpent: 0,
                byModel: new Map(),
                projectedMonthly: 0,
                efficiency: 1.0
            },
            
            rateLimits: {
                currentUsage: {
                    perMinute: 0,
                    perHour: 0,
                    perDay: 0
                },
                violations: 0,
                nearMisses: 0
            },
            
            errors: {
                byType: new Map(),
                byModel: new Map(),
                trends: [],
                patterns: new Map()
            }
        };
        
        this.alerts = {
            active: new Set(),
            history: [],
            rules: new Map()
        };
        
        this.startTime = Date.now();
        this.setupAlertRules();
        this.startPeriodicReporting();
    }
    
    /**
     * Record a request event
     */
    recordRequest(event) {
        const { model, requestType, success, responseTime, error, tokens, cost } = event;
        
        // Update basic counters
        this.metrics.requests.total++;
        if (success) {
            this.metrics.requests.successful++;
        } else {
            this.metrics.requests.failed++;
            if (error === 'rate_limit') {
                this.metrics.requests.rateLimited++;
            }
        }
        
        // Update model-specific metrics
        if (!this.metrics.requests.byModel.has(model)) {
            this.metrics.requests.byModel.set(model, {
                total: 0,
                successful: 0,
                failed: 0,
                averageResponseTime: 0,
                tokens: 0,
                cost: 0
            });
        }
        
        const modelMetrics = this.metrics.requests.byModel.get(model);
        modelMetrics.total++;
        if (success) {
            modelMetrics.successful++;
        } else {
            modelMetrics.failed++;
        }
        
        // Update request type metrics
        if (!this.metrics.requests.byType.has(requestType)) {
            this.metrics.requests.byType.set(requestType, { total: 0, successful: 0, failed: 0 });
        }
        const typeMetrics = this.metrics.requests.byType.get(requestType);
        typeMetrics.total++;
        if (success) typeMetrics.successful++;
        else typeMetrics.failed++;
        
        // Update performance metrics
        if (responseTime !== undefined) {
            this.updateResponseTimeMetrics(responseTime, model);
        }
        
        // Update cost metrics
        if (cost !== undefined) {
            this.metrics.costs.totalSpent += cost;
            if (!this.metrics.costs.byModel.has(model)) {
                this.metrics.costs.byModel.set(model, 0);
            }
            this.metrics.costs.byModel.set(model, this.metrics.costs.byModel.get(model) + cost);
        }
        
        // Update hourly/daily tracking
        this.updateTimeBasedMetrics();
        
        // Check for alerts
        this.checkAlerts(event);
        
        // Emit monitoring event
        this.emit('requestRecorded', { event, metrics: this.getMetricsSummary() });
    }
    
    /**
     * Update response time metrics
     */
    updateResponseTimeMetrics(responseTime, model) {
        const perfMetrics = this.metrics.performance.responseTime;
        
        // Update global response time metrics
        perfMetrics.samples.push(responseTime);
        if (perfMetrics.samples.length > 1000) {
            perfMetrics.samples = perfMetrics.samples.slice(-1000); // Keep last 1000 samples
        }
        
        perfMetrics.min = Math.min(perfMetrics.min, responseTime);
        perfMetrics.max = Math.max(perfMetrics.max, responseTime);
        
        // Calculate new average
        const total = this.metrics.requests.total;
        perfMetrics.average = (perfMetrics.average * (total - 1) + responseTime) / total;
        
        // Calculate percentiles
        const sorted = [...perfMetrics.samples].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        const p99Index = Math.floor(sorted.length * 0.99);
        perfMetrics.p95 = sorted[p95Index] || 0;
        perfMetrics.p99 = sorted[p99Index] || 0;
        
        // Update model-specific response time
        const modelMetrics = this.metrics.requests.byModel.get(model);
        if (modelMetrics) {
            const modelTotal = modelMetrics.total;
            modelMetrics.averageResponseTime = 
                (modelMetrics.averageResponseTime * (modelTotal - 1) + responseTime) / modelTotal;
        }
    }
    
    /**
     * Update time-based metrics
     */
    updateTimeBasedMetrics() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDate() - 1; // 0-based for array
        
        this.metrics.requests.hourly[hour]++;
        this.metrics.requests.daily[day % 30]++;
        
        // Calculate throughput
        const elapsed = (Date.now() - this.startTime) / 1000;
        const total = this.metrics.requests.total;
        
        this.metrics.performance.throughput.requestsPerSecond = total / elapsed;
        this.metrics.performance.throughput.requestsPerMinute = total / (elapsed / 60);
        this.metrics.performance.throughput.requestsPerHour = total / (elapsed / 3600);
    }
    
    /**
     * Setup alert rules
     */
    setupAlertRules() {
        // High error rate alert
        this.alerts.rules.set('high_error_rate', {
            condition: () => {
                const total = this.metrics.requests.total;
                const failed = this.metrics.requests.failed;
                return total > 10 && (failed / total) > 0.2; // >20% error rate
            },
            severity: 'warning',
            message: 'High error rate detected (>20%)',
            cooldown: 300000 // 5 minutes
        });
        
        // Rate limit approaching alert
        this.alerts.rules.set('rate_limit_approaching', {
            condition: () => {
                const current = this.metrics.rateLimits.currentUsage.perMinute;
                return current >= 16; // 80% of 20 requests per minute
            },
            severity: 'warning',
            message: 'Approaching rate limit (80% of capacity)',
            cooldown: 60000 // 1 minute
        });
        
        // Slow response time alert
        this.alerts.rules.set('slow_response', {
            condition: () => {
                return this.metrics.performance.responseTime.p95 > 30000; // >30 seconds
            },
            severity: 'warning',
            message: 'Slow response times detected (P95 > 30s)',
            cooldown: 600000 // 10 minutes
        });
        
        // Model failure alert
        this.alerts.rules.set('model_failure', {
            condition: () => {
                for (const [model, metrics] of this.metrics.requests.byModel) {
                    if (metrics.total >= 5 && (metrics.failed / metrics.total) > 0.8) {
                        return true; // >80% failure rate for a model
                    }
                }
                return false;
            },
            severity: 'critical',
            message: 'High failure rate for specific model (>80%)',
            cooldown: 300000 // 5 minutes
        });
    }
    
    /**
     * Check alert conditions
     */
    checkAlerts(event) {
        for (const [alertId, rule] of this.alerts.rules) {
            if (rule.condition()) {
                this.triggerAlert(alertId, rule);
            }
        }
    }
    
    /**
     * Trigger an alert
     */
    triggerAlert(alertId, rule) {
        const now = Date.now();
        const lastAlert = this.alerts.history.find(a => a.id === alertId);
        
        // Check cooldown
        if (lastAlert && (now - lastAlert.timestamp) < rule.cooldown) {
            return; // Still in cooldown
        }
        
        const alert = {
            id: alertId,
            severity: rule.severity,
            message: rule.message,
            timestamp: now,
            metrics: this.getMetricsSummary()
        };
        
        this.alerts.active.add(alertId);
        this.alerts.history.push(alert);
        
        // Emit alert event
        this.emit('alert', alert);
        
        // Log alert
        console.warn(`[ALERT] ${rule.severity.toUpperCase()}: ${rule.message}`);
        
        // Auto-resolve after cooldown
        setTimeout(() => {
            this.alerts.active.delete(alertId);
            this.emit('alertResolved', { id: alertId, timestamp: Date.now() });
        }, rule.cooldown);
    }
    
    /**
     * Get comprehensive metrics summary
     */
    getMetricsSummary() {
        const uptime = Date.now() - this.startTime;
        const availability = this.metrics.requests.total > 0 ? 
            this.metrics.requests.successful / this.metrics.requests.total : 1.0;
        
        return {
            timestamp: Date.now(),
            uptime: uptime,
            
            requests: {
                total: this.metrics.requests.total,
                successful: this.metrics.requests.successful,
                failed: this.metrics.requests.failed,
                successRate: this.metrics.requests.total > 0 ? 
                    this.metrics.requests.successful / this.metrics.requests.total : 0,
                rateLimited: this.metrics.requests.rateLimited
            },
            
            performance: {
                responseTime: {
                    average: Math.round(this.metrics.performance.responseTime.average),
                    p95: Math.round(this.metrics.performance.responseTime.p95),
                    p99: Math.round(this.metrics.performance.responseTime.p99)
                },
                throughput: this.metrics.performance.throughput,
                availability: availability
            },
            
            modelPerformance: Array.from(this.metrics.requests.byModel.entries()).map(([model, metrics]) => ({
                model,
                requests: metrics.total,
                successRate: metrics.total > 0 ? metrics.successful / metrics.total : 0,
                averageResponseTime: Math.round(metrics.averageResponseTime),
                tokens: metrics.tokens,
                cost: metrics.cost
            })),
            
            costs: {
                total: this.metrics.costs.totalSpent,
                projectedMonthly: this.estimateMonthlyProjection(),
                efficiency: this.calculateCostEfficiency()
            },
            
            alerts: {
                active: Array.from(this.alerts.active),
                recentHistory: this.alerts.history.slice(-10)
            }
        };
    }
    
    /**
     * Estimate monthly cost projection
     */
    estimateMonthlyProjection() {
        const elapsed = Date.now() - this.startTime;
        const monthlyMs = 30 * 24 * 60 * 60 * 1000;
        const ratio = monthlyMs / elapsed;
        
        return this.metrics.costs.totalSpent * ratio;
    }
    
    /**
     * Calculate cost efficiency
     */
    calculateCostEfficiency() {
        const totalTokens = Array.from(this.metrics.requests.byModel.values())
            .reduce((sum, metrics) => sum + metrics.tokens, 0);
        
        if (totalTokens === 0 || this.metrics.costs.totalSpent === 0) return 1.0;
        
        return totalTokens / this.metrics.costs.totalSpent; // Tokens per dollar
    }
    
    /**
     * Generate performance report
     */
    generateReport(format = 'json') {
        const summary = this.getMetricsSummary();
        
        if (format === 'json') {
            return JSON.stringify(summary, null, 2);
        }
        
        if (format === 'text') {
            return this.formatTextReport(summary);
        }
        
        return summary;
    }
    
    /**
     * Format text report
     */
    formatTextReport(summary) {
        return `
OpenRouter Integration Performance Report
========================================
Generated: ${new Date().toISOString()}
Uptime: ${Math.round(summary.uptime / 1000 / 60)} minutes

REQUEST METRICS
Total Requests: ${summary.requests.total}
Success Rate: ${(summary.requests.successRate * 100).toFixed(1)}%
Failed Requests: ${summary.requests.failed}
Rate Limited: ${summary.requests.rateLimited}

PERFORMANCE METRICS
Average Response Time: ${summary.performance.responseTime.average}ms
95th Percentile: ${summary.performance.responseTime.p95}ms
99th Percentile: ${summary.performance.responseTime.p99}ms
Requests/Second: ${summary.performance.throughput.requestsPerSecond.toFixed(2)}
Availability: ${(summary.performance.availability * 100).toFixed(2)}%

MODEL PERFORMANCE
${summary.modelPerformance.map(model => 
    `${model.model}: ${model.requests} requests, ${(model.successRate * 100).toFixed(1)}% success, ${model.averageResponseTime}ms avg`
).join('\n')}

COST METRICS
Total Spent: $${summary.costs.total.toFixed(4)}
Projected Monthly: $${summary.costs.projectedMonthly.toFixed(2)}
Efficiency: ${summary.costs.efficiency.toFixed(0)} tokens/$

ACTIVE ALERTS
${summary.alerts.active.length > 0 ? summary.alerts.active.join(', ') : 'None'}
        `.trim();
    }
    
    /**
     * Start periodic reporting
     */
    startPeriodicReporting() {
        // Every 5 minutes, emit a status report
        setInterval(() => {
            const summary = this.getMetricsSummary();
            this.emit('periodicReport', summary);
        }, 5 * 60 * 1000);
        
        // Every hour, save metrics to file
        setInterval(async () => {
            await this.saveMetricsToFile();
        }, 60 * 60 * 1000);
    }
    
    /**
     * Save metrics to file for persistence
     */
    async saveMetricsToFile() {
        try {
            const metricsDir = path.join(__dirname, '../../memory/openrouter-metrics');
            await fs.mkdir(metricsDir, { recursive: true });
            
            const timestamp = new Date().toISOString().slice(0, 13); // Hour precision
            const filename = `metrics-${timestamp}.json`;
            const filepath = path.join(metricsDir, filename);
            
            const data = {
                timestamp: Date.now(),
                metrics: this.getMetricsSummary(),
                rawMetrics: {
                    requests: Object.fromEntries(this.metrics.requests.byModel),
                    errors: Object.fromEntries(this.metrics.errors.byType),
                    alerts: this.alerts.history.slice(-50) // Keep last 50 alerts
                }
            };
            
            await fs.writeFile(filepath, JSON.stringify(data, null, 2));
            
            // Clean up old files (keep last 30 days)
            const files = await fs.readdir(metricsDir);
            const oldFiles = files
                .filter(f => f.startsWith('metrics-'))
                .sort()
                .slice(0, -24 * 30); // Keep last 30 days of hourly files
            
            for (const oldFile of oldFiles) {
                await fs.unlink(path.join(metricsDir, oldFile));
            }
            
        } catch (error) {
            console.error('Failed to save metrics to file:', error);
        }
    }
    
    /**
     * Reset metrics (for testing or new periods)
     */
    resetMetrics() {
        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                rateLimited: 0,
                byModel: new Map(),
                byType: new Map(),
                hourly: new Array(24).fill(0),
                daily: new Array(30).fill(0)
            },
            performance: {
                responseTime: {
                    average: 0,
                    min: Infinity,
                    max: 0,
                    p95: 0,
                    p99: 0,
                    samples: []
                },
                throughput: {
                    requestsPerSecond: 0,
                    requestsPerMinute: 0,
                    requestsPerHour: 0
                }
            },
            costs: {
                totalSpent: 0,
                byModel: new Map(),
                projectedMonthly: 0,
                efficiency: 1.0
            },
            rateLimits: {
                currentUsage: {
                    perMinute: 0,
                    perHour: 0,
                    perDay: 0
                },
                violations: 0,
                nearMisses: 0
            },
            errors: {
                byType: new Map(),
                byModel: new Map(),
                trends: [],
                patterns: new Map()
            }
        };
        
        this.startTime = Date.now();
        this.emit('metricsReset', { timestamp: this.startTime });
    }
}

module.exports = OpenRouterMonitor;