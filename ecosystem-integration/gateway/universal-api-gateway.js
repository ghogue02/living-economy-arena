/**
 * Universal API Gateway - Phase 4 Ecosystem Integration
 * Unified access point for all Living Economy Arena systems
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const winston = require('winston');
const { createProxyMiddleware } = require('http-proxy-middleware');

class UniversalAPIGateway {
    constructor(config = {}) {
        this.app = express();
        this.config = {
            port: config.port || 8080,
            rateLimitWindow: config.rateLimitWindow || 15 * 60 * 1000, // 15 minutes
            rateLimitMax: config.rateLimitMax || 1000,
            corsOrigins: config.corsOrigins || ['*'],
            ...config
        };
        
        this.services = new Map();
        this.healthChecks = new Map();
        this.metrics = {
            requests: 0,
            errors: 0,
            avgResponseTime: 0,
            activeConnections: 0
        };
        
        this.setupLogging();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupHealthMonitoring();
    }

    setupLogging() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/gateway-error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/gateway.log' }),
                new winston.transports.Console({
                    format: winston.format.simple()
                })
            ]
        });
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        
        // CORS configuration
        this.app.use(cors({
            origin: this.config.corsOrigins,
            credentials: true
        }));
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: this.config.rateLimitWindow,
            max: this.config.rateLimitMax,
            message: 'Too many requests from this IP',
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use(limiter);
        
        // Request logging and metrics
        this.app.use((req, res, next) => {
            const startTime = Date.now();
            this.metrics.requests++;
            this.metrics.activeConnections++;
            
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                this.metrics.avgResponseTime = 
                    (this.metrics.avgResponseTime + duration) / 2;
                this.metrics.activeConnections--;
                
                if (res.statusCode >= 400) {
                    this.metrics.errors++;
                }
                
                this.logger.info('Request processed', {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    duration,
                    userAgent: req.get('User-Agent')
                });
            });
            
            next();
        });
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                metrics: this.metrics,
                services: Array.from(this.services.keys()).map(name => ({
                    name,
                    status: this.healthChecks.get(name) || 'unknown'
                }))
            });
        });

        // Metrics endpoint
        this.app.get('/metrics', (req, res) => {
            res.json({
                gateway: this.metrics,
                services: Object.fromEntries(this.services),
                uptime: process.uptime()
            });
        });

        // Service registration endpoint
        this.app.post('/admin/register-service', (req, res) => {
            const { name, baseUrl, healthEndpoint, routes } = req.body;
            
            if (!name || !baseUrl) {
                return res.status(400).json({ error: 'Name and baseUrl are required' });
            }

            this.registerService(name, baseUrl, healthEndpoint, routes);
            res.json({ message: `Service ${name} registered successfully` });
        });

        // Dynamic service routes
        this.app.use('/api/:service/*', (req, res, next) => {
            const serviceName = req.params.service;
            const service = this.services.get(serviceName);
            
            if (!service) {
                return res.status(404).json({ 
                    error: `Service ${serviceName} not found`,
                    availableServices: Array.from(this.services.keys())
                });
            }

            // Create proxy middleware dynamically
            const proxy = createProxyMiddleware({
                target: service.baseUrl,
                changeOrigin: true,
                pathRewrite: {
                    [`^/api/${serviceName}`]: ''
                },
                onError: (err, req, res) => {
                    this.logger.error('Proxy error', {
                        service: serviceName,
                        error: err.message,
                        url: req.url
                    });
                    res.status(502).json({ error: 'Service unavailable' });
                },
                onProxyReq: (proxyReq, req, res) => {
                    this.logger.debug('Proxying request', {
                        service: serviceName,
                        method: req.method,
                        url: req.url
                    });
                }
            });

            proxy(req, res, next);
        });

        // Catch-all for undefined routes
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                availableEndpoints: [
                    '/health',
                    '/metrics',
                    '/api/{service}/*'
                ],
                registeredServices: Array.from(this.services.keys())
            });
        });
    }

    registerService(name, baseUrl, healthEndpoint = '/health', routes = []) {
        const service = {
            name,
            baseUrl,
            healthEndpoint,
            routes,
            registeredAt: new Date().toISOString()
        };
        
        this.services.set(name, service);
        this.logger.info('Service registered', { name, baseUrl });
        
        // Start health monitoring for the service
        this.startHealthMonitoring(name, baseUrl + healthEndpoint);
        
        return service;
    }

    unregisterService(name) {
        if (this.services.has(name)) {
            this.services.delete(name);
            this.healthChecks.delete(name);
            this.logger.info('Service unregistered', { name });
            return true;
        }
        return false;
    }

    startHealthMonitoring(serviceName, healthUrl) {
        const checkHealth = async () => {
            try {
                const response = await fetch(healthUrl, { 
                    timeout: 5000,
                    method: 'GET'
                });
                
                const status = response.ok ? 'healthy' : 'unhealthy';
                this.healthChecks.set(serviceName, status);
                
                if (!response.ok) {
                    this.logger.warn('Service health check failed', {
                        service: serviceName,
                        status: response.status,
                        url: healthUrl
                    });
                }
            } catch (error) {
                this.healthChecks.set(serviceName, 'unhealthy');
                this.logger.error('Service health check error', {
                    service: serviceName,
                    error: error.message,
                    url: healthUrl
                });
            }
        };

        // Initial health check
        checkHealth();
        
        // Schedule periodic health checks
        setInterval(checkHealth, 30000); // Every 30 seconds
    }

    setupHealthMonitoring() {
        // Global health monitoring
        setInterval(() => {
            const unhealthyServices = Array.from(this.healthChecks.entries())
                .filter(([name, status]) => status === 'unhealthy')
                .map(([name]) => name);
                
            if (unhealthyServices.length > 0) {
                this.logger.warn('Unhealthy services detected', {
                    services: unhealthyServices,
                    totalServices: this.services.size
                });
            }
        }, 60000); // Every minute
    }

    async start() {
        return new Promise((resolve, reject) => {
            const server = this.app.listen(this.config.port, (err) => {
                if (err) {
                    this.logger.error('Failed to start gateway', { error: err.message });
                    reject(err);
                } else {
                    this.logger.info('Universal API Gateway started', {
                        port: this.config.port,
                        environment: process.env.NODE_ENV || 'development'
                    });
                    resolve(server);
                }
            });

            // Register default services
            this.registerDefaultServices();
        });
    }

    registerDefaultServices() {
        // Register all Phase 1-4 services
        const defaultServices = [
            {
                name: 'ai-personality',
                baseUrl: 'http://localhost:3001',
                healthEndpoint: '/health'
            },
            {
                name: 'economic-engine',
                baseUrl: 'http://localhost:3002',
                healthEndpoint: '/health'
            },
            {
                name: 'market-infrastructure',
                baseUrl: 'http://localhost:3003',
                healthEndpoint: '/health'
            },
            {
                name: 'game-balance',
                baseUrl: 'http://localhost:3004',
                healthEndpoint: '/health'
            },
            {
                name: 'security',
                baseUrl: 'http://localhost:3005',
                healthEndpoint: '/health'
            },
            {
                name: 'visualization',
                baseUrl: 'http://localhost:3006',
                healthEndpoint: '/health'
            },
            {
                name: 'player-interaction',
                baseUrl: 'http://localhost:3007',
                healthEndpoint: '/health'
            },
            {
                name: 'persistence',
                baseUrl: 'http://localhost:3008',
                healthEndpoint: '/health'
            }
        ];

        defaultServices.forEach(service => {
            this.registerService(service.name, service.baseUrl, service.healthEndpoint);
        });
    }

    getMetrics() {
        return {
            ...this.metrics,
            services: Array.from(this.services.entries()).map(([name, service]) => ({
                name,
                status: this.healthChecks.get(name) || 'unknown',
                ...service
            }))
        };
    }
}

module.exports = { UniversalAPIGateway };