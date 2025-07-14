/**
 * Integration Monitoring and Analytics System - Phase 4 Ecosystem Integration
 * Comprehensive monitoring, analytics, and performance tracking for the entire ecosystem
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class IntegrationMonitoringAnalytics extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            metricsRetention: config.metricsRetention || 30 * 24 * 60 * 60 * 1000, // 30 days
            alertThresholds: {
                errorRate: 0.05, // 5%
                responseTime: 5000, // 5 seconds
                resourceUsage: 0.9, // 90%
                ...config.alertThresholds
            },
            enablePredictiveAnalytics: config.enablePredictiveAnalytics !== false,
            enableRealTimeAlerts: config.enableRealTimeAlerts !== false,
            samplingRate: config.samplingRate || 1.0,
            ...config
        };
        
        this.metrics = new Map();
        this.alerts = new Map();
        this.dashboards = new Map();
        this.reports = new Map();
        this.timeSeries = new Map();
        this.anomalyDetectors = new Map();
        
        this.statistics = {
            totalMetrics: 0,
            activeAlerts: 0,
            systemHealth: 'unknown',
            lastUpdate: null,
            uptime: process.uptime()
        };
        
        this.setupSystemMetrics();
        this.setupAnomalyDetection();
        this.setupPredictiveModels();
        this.startMonitoring();
    }

    setupSystemMetrics() {
        // Gateway Metrics
        this.registerMetric('gateway.requests_per_second', {
            type: 'counter',
            description: 'Number of requests per second through the gateway',
            tags: ['service', 'endpoint', 'status_code'],
            thresholds: { critical: 1000, warning: 500 }
        });

        this.registerMetric('gateway.response_time', {
            type: 'histogram',
            description: 'Response time distribution for gateway requests',
            tags: ['service', 'endpoint'],
            thresholds: { critical: 5000, warning: 2000 }
        });

        this.registerMetric('gateway.error_rate', {
            type: 'gauge',
            description: 'Error rate percentage for gateway requests',
            tags: ['service'],
            thresholds: { critical: 0.1, warning: 0.05 }
        });

        // Data Harmonization Metrics
        this.registerMetric('harmonization.transformation_latency', {
            type: 'histogram',
            description: 'Data transformation processing time',
            tags: ['data_type', 'format'],
            thresholds: { critical: 1000, warning: 500 }
        });

        this.registerMetric('harmonization.validation_failures', {
            type: 'counter',
            description: 'Number of data validation failures',
            tags: ['data_type', 'error_type'],
            thresholds: { critical: 100, warning: 50 }
        });

        this.registerMetric('harmonization.cache_hit_rate', {
            type: 'gauge',
            description: 'Cache hit rate for data transformations',
            tags: ['data_type'],
            thresholds: { critical: 0.5, warning: 0.7 }
        });

        // Workflow Automation Metrics
        this.registerMetric('workflow.execution_time', {
            type: 'histogram',
            description: 'Workflow execution time distribution',
            tags: ['template', 'priority'],
            thresholds: { critical: 300000, warning: 120000 }
        });

        this.registerMetric('workflow.success_rate', {
            type: 'gauge',
            description: 'Workflow success rate percentage',
            tags: ['template'],
            thresholds: { critical: 0.9, warning: 0.95 }
        });

        this.registerMetric('workflow.queue_depth', {
            type: 'gauge',
            description: 'Number of workflows in queue',
            tags: ['priority'],
            thresholds: { critical: 1000, warning: 500 }
        });

        // Interoperability Metrics
        this.registerMetric('interop.message_throughput', {
            type: 'counter',
            description: 'Messages processed per second',
            tags: ['protocol', 'service'],
            thresholds: { critical: 10000, warning: 5000 }
        });

        this.registerMetric('interop.circuit_breaker_trips', {
            type: 'counter',
            description: 'Circuit breaker activations',
            tags: ['service'],
            thresholds: { critical: 10, warning: 5 }
        });

        this.registerMetric('interop.service_availability', {
            type: 'gauge',
            description: 'Service availability percentage',
            tags: ['service'],
            thresholds: { critical: 0.95, warning: 0.98 }
        });

        // Event System Metrics
        this.registerMetric('events.publish_rate', {
            type: 'counter',
            description: 'Events published per second',
            tags: ['event_type', 'source'],
            thresholds: { critical: 50000, warning: 30000 }
        });

        this.registerMetric('events.correlation_rate', {
            type: 'gauge',
            description: 'Event correlation success rate',
            tags: ['rule'],
            thresholds: { critical: 0.8, warning: 0.9 }
        });

        this.registerMetric('events.subscription_lag', {
            type: 'histogram',
            description: 'Event subscription processing lag',
            tags: ['event_type', 'subscriber'],
            thresholds: { critical: 10000, warning: 5000 }
        });

        // System Resource Metrics
        this.registerMetric('system.cpu_usage', {
            type: 'gauge',
            description: 'CPU usage percentage',
            tags: ['component'],
            thresholds: { critical: 0.9, warning: 0.8 }
        });

        this.registerMetric('system.memory_usage', {
            type: 'gauge',
            description: 'Memory usage percentage',
            tags: ['component'],
            thresholds: { critical: 0.9, warning: 0.8 }
        });

        this.registerMetric('system.disk_io', {
            type: 'counter',
            description: 'Disk I/O operations per second',
            tags: ['operation_type'],
            thresholds: { critical: 10000, warning: 5000 }
        });
    }

    setupAnomalyDetection() {
        // Statistical anomaly detection for key metrics
        this.anomalyDetectors.set('response_time', {
            type: 'statistical',
            metric: 'gateway.response_time',
            algorithm: 'z_score',
            threshold: 3.0,
            windowSize: 100,
            data: []
        });

        this.anomalyDetectors.set('error_spike', {
            type: 'trend',
            metric: 'gateway.error_rate',
            algorithm: 'moving_average',
            threshold: 0.1,
            windowSize: 20,
            data: []
        });

        this.anomalyDetectors.set('throughput_drop', {
            type: 'pattern',
            metric: 'events.publish_rate',
            algorithm: 'exponential_smoothing',
            threshold: 0.3, // 30% drop
            alpha: 0.3,
            data: []
        });

        this.anomalyDetectors.set('resource_exhaustion', {
            type: 'multivariate',
            metrics: ['system.cpu_usage', 'system.memory_usage'],
            algorithm: 'mahalanobis_distance',
            threshold: 2.0,
            data: []
        });
    }

    setupPredictiveModels() {
        if (!this.config.enablePredictiveAnalytics) return;

        // Simple linear regression for trend prediction
        this.predictiveModels = {
            loadForecast: {
                type: 'linear_regression',
                metric: 'gateway.requests_per_second',
                lookbackPeriod: 3600000, // 1 hour
                forecastHorizon: 1800000, // 30 minutes
                data: []
            },
            capacityPlanning: {
                type: 'exponential_smoothing',
                metrics: ['system.cpu_usage', 'system.memory_usage'],
                alpha: 0.3,
                beta: 0.1,
                data: []
            },
            failurePrediction: {
                type: 'pattern_matching',
                metrics: ['gateway.error_rate', 'interop.circuit_breaker_trips'],
                patterns: [],
                confidence: 0.8
            }
        };
    }

    registerMetric(name, definition) {
        this.metrics.set(name, {
            ...definition,
            values: [],
            lastValue: null,
            lastUpdate: null,
            alerts: []
        });
        
        this.emit('metric_registered', { name, definition });
    }

    recordMetric(name, value, tags = {}, timestamp = Date.now()) {
        if (Math.random() > this.config.samplingRate) return;

        const metric = this.metrics.get(name);
        if (!metric) {
            throw new Error(`Metric ${name} not registered`);
        }

        const dataPoint = {
            value,
            tags,
            timestamp
        };

        metric.values.push(dataPoint);
        metric.lastValue = value;
        metric.lastUpdate = timestamp;
        this.statistics.totalMetrics++;

        // Maintain time series
        this.updateTimeSeries(name, dataPoint);

        // Check thresholds and generate alerts
        this.checkThresholds(name, value, tags);

        // Feed to anomaly detection
        this.feedAnomalyDetection(name, value, timestamp);

        // Predictive analytics
        if (this.config.enablePredictiveAnalytics) {
            this.updatePredictiveModels(name, value, timestamp);
        }

        this.emit('metric_recorded', { name, value, tags, timestamp });
    }

    updateTimeSeries(metricName, dataPoint) {
        if (!this.timeSeries.has(metricName)) {
            this.timeSeries.set(metricName, []);
        }
        
        const series = this.timeSeries.get(metricName);
        series.push(dataPoint);
        
        // Maintain retention period
        const cutoff = dataPoint.timestamp - this.config.metricsRetention;
        const filteredSeries = series.filter(point => point.timestamp > cutoff);
        this.timeSeries.set(metricName, filteredSeries);
    }

    checkThresholds(metricName, value, tags) {
        const metric = this.metrics.get(metricName);
        if (!metric.thresholds) return;

        let alertLevel = null;
        if (metric.thresholds.critical && value >= metric.thresholds.critical) {
            alertLevel = 'critical';
        } else if (metric.thresholds.warning && value >= metric.thresholds.warning) {
            alertLevel = 'warning';
        }

        if (alertLevel) {
            this.generateAlert({
                type: 'threshold',
                level: alertLevel,
                metric: metricName,
                value,
                threshold: metric.thresholds[alertLevel],
                tags,
                timestamp: Date.now()
            });
        }
    }

    feedAnomalyDetection(metricName, value, timestamp) {
        for (const [detectorName, detector] of this.anomalyDetectors) {
            if (detector.metric === metricName || 
                (detector.metrics && detector.metrics.includes(metricName))) {
                
                detector.data.push({ value, timestamp });
                
                // Maintain window size
                if (detector.data.length > detector.windowSize) {
                    detector.data = detector.data.slice(-detector.windowSize);
                }
                
                // Run anomaly detection
                if (detector.data.length >= detector.windowSize) {
                    const anomaly = this.detectAnomaly(detector);
                    if (anomaly) {
                        this.generateAlert({
                            type: 'anomaly',
                            level: 'warning',
                            detector: detectorName,
                            metric: metricName,
                            value,
                            score: anomaly.score,
                            timestamp
                        });
                    }
                }
            }
        }
    }

    detectAnomaly(detector) {
        const values = detector.data.map(d => d.value);
        
        switch (detector.algorithm) {
            case 'z_score':
                return this.detectZScoreAnomaly(values, detector.threshold);
            case 'moving_average':
                return this.detectMovingAverageAnomaly(values, detector.threshold);
            case 'exponential_smoothing':
                return this.detectExponentialSmoothingAnomaly(values, detector.threshold, detector.alpha);
            default:
                return null;
        }
    }

    detectZScoreAnomaly(values, threshold) {
        if (values.length < 10) return null;
        
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        const lastValue = values[values.length - 1];
        const zScore = Math.abs((lastValue - mean) / stdDev);
        
        return zScore > threshold ? { score: zScore, type: 'z_score' } : null;
    }

    detectMovingAverageAnomaly(values, threshold) {
        if (values.length < 10) return null;
        
        const windowSize = Math.min(10, values.length);
        const recent = values.slice(-windowSize);
        const previous = values.slice(-(windowSize * 2), -windowSize);
        
        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const previousAvg = previous.reduce((a, b) => a + b) / previous.length;
        
        const change = Math.abs((recentAvg - previousAvg) / previousAvg);
        
        return change > threshold ? { score: change, type: 'trend_change' } : null;
    }

    detectExponentialSmoothingAnomaly(values, threshold, alpha) {
        if (values.length < 5) return null;
        
        let smoothed = values[0];
        for (let i = 1; i < values.length - 1; i++) {
            smoothed = alpha * values[i] + (1 - alpha) * smoothed;
        }
        
        const lastValue = values[values.length - 1];
        const deviation = Math.abs((lastValue - smoothed) / smoothed);
        
        return deviation > threshold ? { score: deviation, type: 'smoothing_deviation' } : null;
    }

    generateAlert(alert) {
        const alertId = this.generateAlertId();
        const fullAlert = {
            id: alertId,
            ...alert,
            status: 'active',
            generatedAt: alert.timestamp || Date.now(),
            acknowledgedAt: null,
            resolvedAt: null
        };
        
        this.alerts.set(alertId, fullAlert);
        this.statistics.activeAlerts++;
        
        if (this.config.enableRealTimeAlerts) {
            this.sendRealTimeAlert(fullAlert);
        }
        
        this.emit('alert_generated', fullAlert);
        
        return alertId;
    }

    acknowledgeAlert(alertId, acknowledgedBy) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.status = 'acknowledged';
            alert.acknowledgedAt = Date.now();
            alert.acknowledgedBy = acknowledgedBy;
            this.emit('alert_acknowledged', alert);
            return true;
        }
        return false;
    }

    resolveAlert(alertId, resolvedBy, resolution) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.status = 'resolved';
            alert.resolvedAt = Date.now();
            alert.resolvedBy = resolvedBy;
            alert.resolution = resolution;
            this.statistics.activeAlerts--;
            this.emit('alert_resolved', alert);
            return true;
        }
        return false;
    }

    sendRealTimeAlert(alert) {
        // Implementation would send to external alerting systems
        // (Slack, PagerDuty, email, etc.)
        console.log(`🚨 ${alert.level.toUpperCase()} ALERT: ${alert.metric || alert.detector}`);
        console.log(`Value: ${alert.value}, Threshold: ${alert.threshold || 'N/A'}`);
        console.log(`Tags: ${JSON.stringify(alert.tags || {})}`);
    }

    createDashboard(name, config) {
        const dashboard = {
            id: this.generateDashboardId(),
            name,
            config,
            widgets: config.widgets || [],
            refreshInterval: config.refreshInterval || 60000,
            createdAt: Date.now(),
            lastUpdate: null
        };
        
        this.dashboards.set(name, dashboard);
        this.emit('dashboard_created', { name, dashboard });
        
        return dashboard;
    }

    generateReport(type, options = {}) {
        const reportId = this.generateReportId();
        const report = {
            id: reportId,
            type,
            options,
            generatedAt: Date.now(),
            data: this.generateReportData(type, options)
        };
        
        this.reports.set(reportId, report);
        this.emit('report_generated', report);
        
        return report;
    }

    generateReportData(type, options) {
        const timeRange = options.timeRange || 3600000; // 1 hour default
        const endTime = options.endTime || Date.now();
        const startTime = endTime - timeRange;
        
        switch (type) {
            case 'system_health':
                return this.generateSystemHealthReport(startTime, endTime);
            case 'performance':
                return this.generatePerformanceReport(startTime, endTime);
            case 'integration_status':
                return this.generateIntegrationStatusReport(startTime, endTime);
            case 'sla':
                return this.generateSLAReport(startTime, endTime);
            default:
                throw new Error(`Unknown report type: ${type}`);
        }
    }

    generateSystemHealthReport(startTime, endTime) {
        const metrics = Array.from(this.metrics.keys());
        const healthData = {};
        
        for (const metricName of metrics) {
            const series = this.timeSeries.get(metricName) || [];
            const timeRangeData = series.filter(point => 
                point.timestamp >= startTime && point.timestamp <= endTime
            );
            
            if (timeRangeData.length > 0) {
                healthData[metricName] = {
                    count: timeRangeData.length,
                    min: Math.min(...timeRangeData.map(d => d.value)),
                    max: Math.max(...timeRangeData.map(d => d.value)),
                    avg: timeRangeData.reduce((sum, d) => sum + d.value, 0) / timeRangeData.length,
                    latest: timeRangeData[timeRangeData.length - 1].value
                };
            }
        }
        
        return {
            timeRange: { startTime, endTime },
            metrics: healthData,
            alerts: this.getAlertsInTimeRange(startTime, endTime),
            overallHealth: this.calculateOverallHealth()
        };
    }

    generatePerformanceReport(startTime, endTime) {
        const performanceMetrics = [
            'gateway.response_time',
            'gateway.requests_per_second',
            'workflow.execution_time',
            'events.publish_rate'
        ];
        
        const performanceData = {};
        for (const metric of performanceMetrics) {
            const series = this.timeSeries.get(metric) || [];
            const timeRangeData = series.filter(point => 
                point.timestamp >= startTime && point.timestamp <= endTime
            );
            
            if (timeRangeData.length > 0) {
                performanceData[metric] = this.calculatePerformanceStats(timeRangeData);
            }
        }
        
        return {
            timeRange: { startTime, endTime },
            performance: performanceData,
            bottlenecks: this.identifyBottlenecks(),
            recommendations: this.generatePerformanceRecommendations()
        };
    }

    calculatePerformanceStats(data) {
        const values = data.map(d => d.value).sort((a, b) => a - b);
        return {
            count: values.length,
            min: values[0],
            max: values[values.length - 1],
            mean: values.reduce((a, b) => a + b) / values.length,
            median: values[Math.floor(values.length / 2)],
            p95: values[Math.floor(values.length * 0.95)],
            p99: values[Math.floor(values.length * 0.99)]
        };
    }

    identifyBottlenecks() {
        const bottlenecks = [];
        
        // Check response time bottlenecks
        const responseTime = this.getLatestMetricValue('gateway.response_time');
        if (responseTime > 2000) {
            bottlenecks.push({
                type: 'response_time',
                severity: responseTime > 5000 ? 'high' : 'medium',
                value: responseTime,
                recommendation: 'Investigate slow endpoints and optimize database queries'
            });
        }
        
        // Check throughput bottlenecks
        const throughput = this.getLatestMetricValue('gateway.requests_per_second');
        if (throughput > 500) {
            bottlenecks.push({
                type: 'throughput',
                severity: throughput > 800 ? 'high' : 'medium',
                value: throughput,
                recommendation: 'Consider scaling gateway instances or adding load balancing'
            });
        }
        
        return bottlenecks;
    }

    generatePerformanceRecommendations() {
        const recommendations = [];
        
        // CPU usage recommendations
        const cpuUsage = this.getLatestMetricValue('system.cpu_usage');
        if (cpuUsage > 0.8) {
            recommendations.push({
                priority: 'high',
                category: 'resource',
                description: 'High CPU usage detected. Consider scaling horizontally or optimizing CPU-intensive operations.'
            });
        }
        
        // Memory usage recommendations
        const memoryUsage = this.getLatestMetricValue('system.memory_usage');
        if (memoryUsage > 0.8) {
            recommendations.push({
                priority: 'high',
                category: 'resource',
                description: 'High memory usage detected. Review memory leaks and consider increasing memory allocation.'
            });
        }
        
        return recommendations;
    }

    getLatestMetricValue(metricName) {
        const metric = this.metrics.get(metricName);
        return metric ? metric.lastValue : null;
    }

    getAlertsInTimeRange(startTime, endTime) {
        return Array.from(this.alerts.values()).filter(alert =>
            alert.generatedAt >= startTime && alert.generatedAt <= endTime
        );
    }

    calculateOverallHealth() {
        const healthFactors = [];
        
        // Error rate factor
        const errorRate = this.getLatestMetricValue('gateway.error_rate') || 0;
        healthFactors.push(Math.max(0, 1 - (errorRate / 0.1))); // Normalize to 0-1
        
        // Response time factor
        const responseTime = this.getLatestMetricValue('gateway.response_time') || 0;
        healthFactors.push(Math.max(0, 1 - (responseTime / 5000))); // Normalize to 0-1
        
        // Resource usage factor
        const cpuUsage = this.getLatestMetricValue('system.cpu_usage') || 0;
        const memoryUsage = this.getLatestMetricValue('system.memory_usage') || 0;
        const resourceFactor = 1 - Math.max(cpuUsage, memoryUsage);
        healthFactors.push(Math.max(0, resourceFactor));
        
        const overallScore = healthFactors.reduce((a, b) => a + b, 0) / healthFactors.length;
        
        if (overallScore >= 0.9) return 'excellent';
        if (overallScore >= 0.7) return 'good';
        if (overallScore >= 0.5) return 'fair';
        if (overallScore >= 0.3) return 'poor';
        return 'critical';
    }

    startMonitoring() {
        // Collect system metrics periodically
        setInterval(() => {
            this.collectSystemMetrics();
        }, 10000); // Every 10 seconds
        
        // Update health status
        setInterval(() => {
            this.statistics.systemHealth = this.calculateOverallHealth();
            this.statistics.lastUpdate = Date.now();
            this.statistics.uptime = process.uptime();
        }, 30000); // Every 30 seconds
        
        // Clean up old data
        setInterval(() => {
            this.cleanupOldData();
        }, 3600000); // Every hour
    }

    collectSystemMetrics() {
        // Collect Node.js process metrics
        const memUsage = process.memoryUsage();
        this.recordMetric('system.memory_usage', memUsage.heapUsed / memUsage.heapTotal);
        
        // CPU usage (approximation)
        const cpuUsage = process.cpuUsage();
        this.recordMetric('system.cpu_usage', 
            (cpuUsage.user + cpuUsage.system) / (process.uptime() * 1000000)
        );
        
        // Active handles and requests
        this.recordMetric('system.active_handles', process._getActiveHandles().length);
        this.recordMetric('system.active_requests', process._getActiveRequests().length);
    }

    cleanupOldData() {
        const cutoff = Date.now() - this.config.metricsRetention;
        
        // Clean up time series data
        for (const [name, series] of this.timeSeries) {
            const filteredSeries = series.filter(point => point.timestamp > cutoff);
            this.timeSeries.set(name, filteredSeries);
        }
        
        // Clean up resolved alerts
        for (const [id, alert] of this.alerts) {
            if (alert.status === 'resolved' && alert.resolvedAt < cutoff) {
                this.alerts.delete(id);
            }
        }
        
        this.emit('data_cleanup_completed', { cutoff });
    }

    generateAlertId() {
        return 'alert_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    generateDashboardId() {
        return 'dash_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    generateReportId() {
        return 'report_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    getStatistics() {
        return {
            ...this.statistics,
            registeredMetrics: this.metrics.size,
            timeSeriesPoints: Array.from(this.timeSeries.values()).reduce((sum, series) => sum + series.length, 0),
            activeAlerts: this.statistics.activeAlerts,
            dashboards: this.dashboards.size,
            reports: this.reports.size
        };
    }

    getHealthStatus() {
        return {
            overallHealth: this.statistics.systemHealth,
            metrics: Array.from(this.metrics.entries()).map(([name, metric]) => ({
                name,
                lastValue: metric.lastValue,
                lastUpdate: metric.lastUpdate,
                alerts: metric.alerts.length
            })),
            activeAlerts: Array.from(this.alerts.values()).filter(alert => alert.status === 'active').length
        };
    }

    getDashboardData(dashboardName) {
        const dashboard = this.dashboards.get(dashboardName);
        if (!dashboard) return null;
        
        const data = {};
        for (const widget of dashboard.widgets) {
            data[widget.id] = this.getWidgetData(widget);
        }
        
        return {
            ...dashboard,
            data,
            lastUpdate: Date.now()
        };
    }

    getWidgetData(widget) {
        switch (widget.type) {
            case 'metric':
                return this.getLatestMetricValue(widget.metric);
            case 'chart':
                return this.getTimeSeriesData(widget.metric, widget.timeRange);
            case 'alert_count':
                return this.getActiveAlertCount(widget.filter);
            default:
                return null;
        }
    }

    getTimeSeriesData(metricName, timeRange = 3600000) {
        const series = this.timeSeries.get(metricName) || [];
        const cutoff = Date.now() - timeRange;
        return series.filter(point => point.timestamp > cutoff);
    }

    getActiveAlertCount(filter = {}) {
        return Array.from(this.alerts.values()).filter(alert => {
            if (alert.status !== 'active') return false;
            if (filter.level && alert.level !== filter.level) return false;
            if (filter.metric && alert.metric !== filter.metric) return false;
            return true;
        }).length;
    }

    exportMetrics(format = 'json') {
        const data = {
            timestamp: Date.now(),
            statistics: this.getStatistics(),
            metrics: Object.fromEntries(this.metrics),
            timeSeries: Object.fromEntries(this.timeSeries),
            alerts: Array.from(this.alerts.values())
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(data);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    convertToCSV(data) {
        // Simplified CSV conversion for metrics
        const lines = ['timestamp,metric,value,tags'];
        
        for (const [metricName, series] of this.timeSeries) {
            for (const point of series) {
                const tags = JSON.stringify(point.tags || {}).replace(/"/g, '""');
                lines.push(`${point.timestamp},${metricName},${point.value},"${tags}"`);
            }
        }
        
        return lines.join('\n');
    }
}

module.exports = { IntegrationMonitoringAnalytics };