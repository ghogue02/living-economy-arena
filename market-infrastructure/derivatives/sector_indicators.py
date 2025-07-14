"""
Sector-Specific Economic Indicators - Phase 3 Market Complexity
Industry-specific indicators and sector analysis systems
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import json
from economic_indicators import EconomicIndicator, IndicatorMetadata, EconomicDataPoint, EconomicSector

class SectorHealthStatus(Enum):
    THRIVING = "thriving"
    HEALTHY = "healthy"
    STABLE = "stable"
    DECLINING = "declining"
    CRISIS = "crisis"

@dataclass
class SectorMetrics:
    """Comprehensive sector performance metrics"""
    sector: EconomicSector
    employment_index: float
    production_index: float
    investment_index: float
    profitability_index: float
    innovation_index: float
    trade_balance: float
    capacity_utilization: float
    business_confidence: float
    health_status: SectorHealthStatus
    trend_direction: str
    last_updated: datetime

class ManufacturingIndicators:
    """Manufacturing sector indicators"""
    
    def __init__(self):
        self.pmi_indicator = self._create_pmi_indicator()
        self.capacity_utilization = self._create_capacity_indicator()
        self.industrial_production = self._create_production_indicator()
        self.factory_orders = self._create_orders_indicator()
        self.inventory_levels = self._create_inventory_indicator()
    
    def _create_pmi_indicator(self) -> EconomicIndicator:
        """Purchasing Managers Index for manufacturing"""
        class PMIIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                # PMI calculation from survey components
                components = {
                    'new_orders': raw_data.get('new_orders', 50),
                    'production': raw_data.get('production', 50),
                    'employment': raw_data.get('employment', 50),
                    'supplier_deliveries': raw_data.get('supplier_deliveries', 50),
                    'inventories': raw_data.get('inventories', 50)
                }
                
                # Weighted PMI calculation
                weights = {'new_orders': 0.3, 'production': 0.25, 'employment': 0.2, 
                          'supplier_deliveries': 0.15, 'inventories': 0.1}
                
                pmi = sum(components[comp] * weights[comp] for comp in components)
                return pmi
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return 0 <= data_point.value <= 100
        
        metadata = IndicatorMetadata(
            name="Manufacturing PMI",
            description="Manufacturing Purchasing Managers Index",
            category="manufacturing",
            frequency="monthly",
            unit="index_value",
            source_agency="Institute for Supply Management",
            calculation_method="survey_weighted_average",
            historical_range=(datetime(1948, 1, 1), datetime.now())
        )
        
        return PMIIndicator("manufacturing_pmi", metadata)
    
    def _create_capacity_indicator(self) -> EconomicIndicator:
        """Manufacturing capacity utilization"""
        class CapacityIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                actual_output = raw_data.get('actual_output', 0)
                potential_output = raw_data.get('potential_output', 1)
                return (actual_output / potential_output) * 100 if potential_output > 0 else 0
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return 0 <= data_point.value <= 120  # Can exceed 100% temporarily
        
        metadata = IndicatorMetadata(
            name="Manufacturing Capacity Utilization",
            description="Percentage of manufacturing capacity being used",
            category="manufacturing",
            frequency="monthly",
            unit="percentage",
            source_agency="Federal Reserve",
            calculation_method="output_capacity_ratio",
            historical_range=(datetime(1967, 1, 1), datetime.now())
        )
        
        return CapacityIndicator("manufacturing_capacity", metadata)
    
    def _create_production_indicator(self) -> EconomicIndicator:
        """Industrial production index"""
        class ProductionIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                # Weighted production by industry subsectors
                production_data = raw_data.get('subsector_production', {})
                weights = raw_data.get('subsector_weights', {})
                
                if not production_data:
                    return 100.0  # Base index value
                
                weighted_production = sum(
                    production_data.get(sector, 100) * weights.get(sector, 0)
                    for sector in production_data.keys()
                )
                
                return weighted_production
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return data_point.value >= 0
        
        metadata = IndicatorMetadata(
            name="Industrial Production Index",
            description="Measure of manufacturing, mining, and utilities output",
            category="manufacturing",
            frequency="monthly",
            unit="index_value",
            source_agency="Federal Reserve",
            calculation_method="weighted_production_index",
            historical_range=(datetime(1919, 1, 1), datetime.now())
        )
        
        return ProductionIndicator("industrial_production", metadata)
    
    def _create_orders_indicator(self) -> EconomicIndicator:
        """Factory orders indicator"""
        class OrdersIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                new_orders = raw_data.get('new_orders', 0)
                shipments = raw_data.get('shipments', 1)
                return (new_orders / shipments) if shipments > 0 else 0
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return data_point.value >= 0
        
        metadata = IndicatorMetadata(
            name="Factory Orders",
            description="Value of new orders for manufactured goods",
            category="manufacturing",
            frequency="monthly",
            unit="billions_usd",
            source_agency="Census Bureau",
            calculation_method="survey_aggregation",
            historical_range=(datetime(1992, 1, 1), datetime.now())
        )
        
        return OrdersIndicator("factory_orders", metadata)
    
    def _create_inventory_indicator(self) -> EconomicIndicator:
        """Manufacturing inventory levels"""
        class InventoryIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                inventory_value = raw_data.get('inventory_value', 0)
                monthly_sales = raw_data.get('monthly_sales', 1)
                return inventory_value / monthly_sales if monthly_sales > 0 else 0
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return data_point.value >= 0
        
        metadata = IndicatorMetadata(
            name="Manufacturing Inventories",
            description="Inventory-to-sales ratio for manufacturing",
            category="manufacturing",
            frequency="monthly",
            unit="ratio",
            source_agency="Census Bureau",
            calculation_method="inventory_sales_ratio",
            historical_range=(datetime(1992, 1, 1), datetime.now())
        )
        
        return InventoryIndicator("manufacturing_inventories", metadata)

class ServicesIndicators:
    """Services sector indicators"""
    
    def __init__(self):
        self.services_pmi = self._create_services_pmi()
        self.consumer_confidence = self._create_confidence_indicator()
        self.retail_sales = self._create_retail_indicator()
        self.services_employment = self._create_employment_indicator()
    
    def _create_services_pmi(self) -> EconomicIndicator:
        """Services PMI indicator"""
        class ServicesPMIIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                components = {
                    'business_activity': raw_data.get('business_activity', 50),
                    'new_orders': raw_data.get('new_orders', 50),
                    'employment': raw_data.get('employment', 50),
                    'prices': raw_data.get('prices', 50),
                    'business_expectations': raw_data.get('business_expectations', 50)
                }
                
                weights = {'business_activity': 0.3, 'new_orders': 0.25, 'employment': 0.2,
                          'prices': 0.15, 'business_expectations': 0.1}
                
                return sum(components[comp] * weights[comp] for comp in components)
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return 0 <= data_point.value <= 100
        
        metadata = IndicatorMetadata(
            name="Services PMI",
            description="Services Purchasing Managers Index",
            category="services",
            frequency="monthly",
            unit="index_value",
            source_agency="Institute for Supply Management",
            calculation_method="survey_weighted_average",
            historical_range=(datetime(1997, 1, 1), datetime.now())
        )
        
        return ServicesPMIIndicator("services_pmi", metadata)
    
    def _create_confidence_indicator(self) -> EconomicIndicator:
        """Consumer confidence indicator"""
        class ConfidenceIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                present_situation = raw_data.get('present_situation', 100)
                expectations = raw_data.get('expectations', 100)
                return (present_situation + expectations) / 2
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return data_point.value >= 0
        
        metadata = IndicatorMetadata(
            name="Consumer Confidence Index",
            description="Consumer sentiment about economic conditions",
            category="services",
            frequency="monthly",
            unit="index_value",
            source_agency="Conference Board",
            calculation_method="survey_average",
            historical_range=(datetime(1967, 1, 1), datetime.now())
        )
        
        return ConfidenceIndicator("consumer_confidence", metadata)
    
    def _create_retail_indicator(self) -> EconomicIndicator:
        """Retail sales indicator"""
        class RetailIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                total_sales = raw_data.get('total_retail_sales', 0)
                return total_sales
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return data_point.value >= 0
        
        metadata = IndicatorMetadata(
            name="Retail Sales",
            description="Total retail and food services sales",
            category="services",
            frequency="monthly",
            unit="billions_usd",
            source_agency="Census Bureau",
            calculation_method="survey_aggregation",
            historical_range=(datetime(1992, 1, 1), datetime.now())
        )
        
        return RetailIndicator("retail_sales", metadata)
    
    def _create_employment_indicator(self) -> EconomicIndicator:
        """Services employment indicator"""
        class ServicesEmploymentIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                services_jobs = raw_data.get('services_employment', 0)
                total_jobs = raw_data.get('total_employment', 1)
                return (services_jobs / total_jobs) * 100 if total_jobs > 0 else 0
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return 0 <= data_point.value <= 100
        
        metadata = IndicatorMetadata(
            name="Services Employment Share",
            description="Percentage of employment in services sector",
            category="services",
            frequency="monthly",
            unit="percentage",
            source_agency="Bureau of Labor Statistics",
            calculation_method="employment_ratio",
            historical_range=(datetime(1939, 1, 1), datetime.now())
        )
        
        return ServicesEmploymentIndicator("services_employment", metadata)

class TechnologyIndicators:
    """Technology sector indicators"""
    
    def __init__(self):
        self.innovation_index = self._create_innovation_indicator()
        self.tech_employment = self._create_tech_employment_indicator()
        self.rd_spending = self._create_rd_indicator()
        self.patent_applications = self._create_patent_indicator()
        self.digital_adoption = self._create_digital_indicator()
    
    def _create_innovation_indicator(self) -> EconomicIndicator:
        """Technology innovation index"""
        class InnovationIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                patents = raw_data.get('patent_applications', 0)
                rd_spending = raw_data.get('rd_spending', 0)
                tech_startups = raw_data.get('tech_startups', 0)
                
                # Normalize and weight components
                normalized_score = (
                    (patents / 1000) * 0.4 +
                    (rd_spending / 1000000) * 0.35 +
                    (tech_startups / 100) * 0.25
                )
                
                return min(normalized_score, 100)  # Cap at 100
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return 0 <= data_point.value <= 100
        
        metadata = IndicatorMetadata(
            name="Technology Innovation Index",
            description="Composite measure of technological innovation",
            category="technology",
            frequency="quarterly",
            unit="index_value",
            source_agency="Bureau of Economic Analysis",
            calculation_method="weighted_composite",
            historical_range=(datetime(1990, 1, 1), datetime.now())
        )
        
        return InnovationIndicator("tech_innovation", metadata)
    
    def _create_tech_employment_indicator(self) -> EconomicIndicator:
        """Technology employment indicator"""
        class TechEmploymentIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                tech_jobs = raw_data.get('tech_employment', 0)
                total_jobs = raw_data.get('total_employment', 1)
                return (tech_jobs / total_jobs) * 100 if total_jobs > 0 else 0
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return 0 <= data_point.value <= 20  # Tech employment unlikely > 20%
        
        metadata = IndicatorMetadata(
            name="Technology Employment Share",
            description="Percentage of employment in technology sector",
            category="technology",
            frequency="monthly",
            unit="percentage",
            source_agency="Bureau of Labor Statistics",
            calculation_method="employment_ratio",
            historical_range=(datetime(1990, 1, 1), datetime.now())
        )
        
        return TechEmploymentIndicator("tech_employment", metadata)
    
    def _create_rd_indicator(self) -> EconomicIndicator:
        """R&D spending indicator"""
        class RDIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                rd_spending = raw_data.get('rd_spending', 0)
                gdp = raw_data.get('gdp', 1)
                return (rd_spending / gdp) * 100 if gdp > 0 else 0
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return 0 <= data_point.value <= 10  # R&D unlikely > 10% of GDP
        
        metadata = IndicatorMetadata(
            name="R&D Intensity",
            description="R&D spending as percentage of GDP",
            category="technology",
            frequency="annual",
            unit="percentage",
            source_agency="National Science Foundation",
            calculation_method="spending_gdp_ratio",
            historical_range=(datetime(1953, 1, 1), datetime.now())
        )
        
        return RDIndicator("rd_intensity", metadata)
    
    def _create_patent_indicator(self) -> EconomicIndicator:
        """Patent applications indicator"""
        class PatentIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                patent_applications = raw_data.get('patent_applications', 0)
                return patent_applications
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return data_point.value >= 0
        
        metadata = IndicatorMetadata(
            name="Patent Applications",
            description="Number of patent applications filed",
            category="technology",
            frequency="monthly",
            unit="count",
            source_agency="USPTO",
            calculation_method="application_count",
            historical_range=(datetime(1963, 1, 1), datetime.now())
        )
        
        return PatentIndicator("patent_applications", metadata)
    
    def _create_digital_indicator(self) -> EconomicIndicator:
        """Digital adoption indicator"""
        class DigitalIndicator(EconomicIndicator):
            def calculate_value(self, raw_data: Dict[str, Any]) -> float:
                internet_users = raw_data.get('internet_users', 0)
                population = raw_data.get('population', 1)
                return (internet_users / population) * 100 if population > 0 else 0
            
            def validate_data(self, data_point: EconomicDataPoint) -> bool:
                return 0 <= data_point.value <= 100
        
        metadata = IndicatorMetadata(
            name="Digital Adoption Rate",
            description="Percentage of population using internet",
            category="technology",
            frequency="annual",
            unit="percentage",
            source_agency="FCC",
            calculation_method="penetration_rate",
            historical_range=(datetime(1995, 1, 1), datetime.now())
        )
        
        return DigitalIndicator("digital_adoption", metadata)

class SectorAnalysisEngine:
    """Engine for comprehensive sector analysis"""
    
    def __init__(self):
        self.manufacturing = ManufacturingIndicators()
        self.services = ServicesIndicators()
        self.technology = TechnologyIndicators()
        self.sector_correlations: Dict[str, float] = {}
        self.sector_rankings: List[Tuple[EconomicSector, float]] = []
    
    def calculate_sector_health(self, sector: EconomicSector) -> SectorMetrics:
        """Calculate comprehensive sector health metrics"""
        current_time = datetime.now()
        
        if sector == EconomicSector.MANUFACTURING:
            indicators = [
                self.manufacturing.pmi_indicator,
                self.manufacturing.capacity_utilization,
                self.manufacturing.industrial_production,
                self.manufacturing.factory_orders,
                self.manufacturing.inventory_levels
            ]
        elif sector == EconomicSector.SERVICES:
            indicators = [
                self.services.services_pmi,
                self.services.consumer_confidence,
                self.services.retail_sales,
                self.services.services_employment
            ]
        elif sector == EconomicSector.TECHNOLOGY:
            indicators = [
                self.technology.innovation_index,
                self.technology.tech_employment,
                self.technology.rd_spending,
                self.technology.patent_applications,
                self.technology.digital_adoption
            ]
        else:
            # Default indicators for other sectors
            indicators = []
        
        # Calculate component indices
        employment_index = self._calculate_employment_index(indicators)
        production_index = self._calculate_production_index(indicators)
        investment_index = self._calculate_investment_index(indicators)
        profitability_index = self._calculate_profitability_index(indicators)
        innovation_index = self._calculate_innovation_index(indicators)
        
        # Calculate overall health status
        overall_score = (
            employment_index * 0.25 +
            production_index * 0.25 +
            investment_index * 0.2 +
            profitability_index * 0.2 +
            innovation_index * 0.1
        )
        
        health_status = self._determine_health_status(overall_score)
        trend_direction = self._calculate_trend_direction(indicators)
        
        return SectorMetrics(
            sector=sector,
            employment_index=employment_index,
            production_index=production_index,
            investment_index=investment_index,
            profitability_index=profitability_index,
            innovation_index=innovation_index,
            trade_balance=0.0,  # Would be calculated from trade data
            capacity_utilization=75.0,  # Would be calculated from capacity data
            business_confidence=60.0,  # Would be calculated from confidence surveys
            health_status=health_status,
            trend_direction=trend_direction,
            last_updated=current_time
        )
    
    def _calculate_employment_index(self, indicators: List[EconomicIndicator]) -> float:
        """Calculate employment component of sector health"""
        employment_indicators = [
            ind for ind in indicators 
            if 'employment' in ind.indicator_id.lower()
        ]
        
        if not employment_indicators:
            return 50.0  # Neutral score
        
        values = [ind.get_latest_value() for ind in employment_indicators if ind.get_latest_value() is not None]
        return np.mean(values) if values else 50.0
    
    def _calculate_production_index(self, indicators: List[EconomicIndicator]) -> float:
        """Calculate production component of sector health"""
        production_indicators = [
            ind for ind in indicators 
            if any(term in ind.indicator_id.lower() for term in ['production', 'output', 'sales'])
        ]
        
        if not production_indicators:
            return 50.0
        
        values = [ind.get_latest_value() for ind in production_indicators if ind.get_latest_value() is not None]
        return np.mean(values) if values else 50.0
    
    def _calculate_investment_index(self, indicators: List[EconomicIndicator]) -> float:
        """Calculate investment component of sector health"""
        investment_indicators = [
            ind for ind in indicators 
            if any(term in ind.indicator_id.lower() for term in ['investment', 'orders', 'spending'])
        ]
        
        if not investment_indicators:
            return 50.0
        
        values = [ind.get_latest_value() for ind in investment_indicators if ind.get_latest_value() is not None]
        return np.mean(values) if values else 50.0
    
    def _calculate_profitability_index(self, indicators: List[EconomicIndicator]) -> float:
        """Calculate profitability component of sector health"""
        # This would use profit margin, earnings data, etc.
        # For now, return a placeholder based on general indicators
        return 55.0
    
    def _calculate_innovation_index(self, indicators: List[EconomicIndicator]) -> float:
        """Calculate innovation component of sector health"""
        innovation_indicators = [
            ind for ind in indicators 
            if any(term in ind.indicator_id.lower() for term in ['innovation', 'patent', 'rd', 'tech'])
        ]
        
        if not innovation_indicators:
            return 50.0
        
        values = [ind.get_latest_value() for ind in innovation_indicators if ind.get_latest_value() is not None]
        return np.mean(values) if values else 50.0
    
    def _determine_health_status(self, score: float) -> SectorHealthStatus:
        """Determine sector health status from score"""
        if score >= 80:
            return SectorHealthStatus.THRIVING
        elif score >= 65:
            return SectorHealthStatus.HEALTHY
        elif score >= 45:
            return SectorHealthStatus.STABLE
        elif score >= 30:
            return SectorHealthStatus.DECLINING
        else:
            return SectorHealthStatus.CRISIS
    
    def _calculate_trend_direction(self, indicators: List[EconomicIndicator]) -> str:
        """Calculate overall trend direction for sector"""
        trends = [ind.get_trend() for ind in indicators if ind.data_points]
        
        if not trends:
            return "unknown"
        
        trend_scores = {'rising': 1, 'stable': 0, 'falling': -1, 'insufficient_data': 0}
        average_trend = np.mean([trend_scores.get(trend, 0) for trend in trends])
        
        if average_trend > 0.2:
            return "rising"
        elif average_trend < -0.2:
            return "falling"
        else:
            return "stable"
    
    def analyze_sector_correlations(self) -> Dict[str, float]:
        """Analyze correlations between sectors"""
        sectors = [EconomicSector.MANUFACTURING, EconomicSector.SERVICES, EconomicSector.TECHNOLOGY]
        correlations = {}
        
        for i, sector1 in enumerate(sectors):
            for j, sector2 in enumerate(sectors[i+1:], i+1):
                # Calculate correlation between sector indicators
                # This is a simplified calculation
                corr_key = f"{sector1.value}_{sector2.value}"
                correlations[corr_key] = np.random.uniform(0.3, 0.8)  # Placeholder
        
        self.sector_correlations = correlations
        return correlations
    
    def rank_sectors(self) -> List[Tuple[EconomicSector, float]]:
        """Rank sectors by overall performance"""
        rankings = []
        
        for sector in EconomicSector:
            if sector in [EconomicSector.MANUFACTURING, EconomicSector.SERVICES, EconomicSector.TECHNOLOGY]:
                metrics = self.calculate_sector_health(sector)
                overall_score = (
                    metrics.employment_index * 0.25 +
                    metrics.production_index * 0.25 +
                    metrics.investment_index * 0.2 +
                    metrics.profitability_index * 0.2 +
                    metrics.innovation_index * 0.1
                )
                rankings.append((sector, overall_score))
        
        rankings.sort(key=lambda x: x[1], reverse=True)
        self.sector_rankings = rankings
        return rankings

# Example usage and testing
if __name__ == "__main__":
    print("Sector-Specific Economic Indicators - Phase 3 Market Complexity")
    print("=" * 70)
    
    # Initialize sector analysis engine
    sector_engine = SectorAnalysisEngine()
    
    # Add sample data to indicators
    sample_manufacturing_data = {
        'new_orders': 55.2,
        'production': 52.8,
        'employment': 51.5,
        'supplier_deliveries': 48.9,
        'inventories': 47.3
    }
    
    # Calculate PMI
    pmi_value = sector_engine.manufacturing.pmi_indicator.calculate_value(sample_manufacturing_data)
    pmi_data_point = EconomicDataPoint(
        indicator_id="manufacturing_pmi",
        value=pmi_value,
        timestamp=datetime.now(),
        source="sample_survey",
        confidence=0.9
    )
    sector_engine.manufacturing.pmi_indicator.add_data_point(pmi_data_point)
    
    print(f"Manufacturing PMI: {pmi_value:.1f}")
    
    # Sample services data
    sample_services_data = {
        'business_activity': 58.4,
        'new_orders': 56.7,
        'employment': 54.2,
        'prices': 62.1,
        'business_expectations': 59.8
    }
    
    services_pmi_value = sector_engine.services.services_pmi.calculate_value(sample_services_data)
    services_data_point = EconomicDataPoint(
        indicator_id="services_pmi",
        value=services_pmi_value,
        timestamp=datetime.now(),
        source="sample_survey",
        confidence=0.9
    )
    sector_engine.services.services_pmi.add_data_point(services_data_point)
    
    print(f"Services PMI: {services_pmi_value:.1f}")
    
    # Sample technology data
    sample_tech_data = {
        'patent_applications': 15000,
        'rd_spending': 500000000,  # $500M
        'tech_startups': 1200
    }
    
    tech_innovation_value = sector_engine.technology.innovation_index.calculate_value(sample_tech_data)
    tech_data_point = EconomicDataPoint(
        indicator_id="tech_innovation",
        value=tech_innovation_value,
        timestamp=datetime.now(),
        source="sample_data",
        confidence=0.85
    )
    sector_engine.technology.innovation_index.add_data_point(tech_data_point)
    
    print(f"Technology Innovation Index: {tech_innovation_value:.1f}")
    
    # Calculate sector health metrics
    print("\nSector Health Analysis:")
    print("-" * 40)
    
    for sector in [EconomicSector.MANUFACTURING, EconomicSector.SERVICES, EconomicSector.TECHNOLOGY]:
        metrics = sector_engine.calculate_sector_health(sector)
        print(f"\n{sector.value.title()} Sector:")
        print(f"  Health Status: {metrics.health_status.value}")
        print(f"  Trend Direction: {metrics.trend_direction}")
        print(f"  Employment Index: {metrics.employment_index:.1f}")
        print(f"  Production Index: {metrics.production_index:.1f}")
        print(f"  Innovation Index: {metrics.innovation_index:.1f}")
    
    # Analyze sector correlations
    correlations = sector_engine.analyze_sector_correlations()
    print(f"\nSector Correlations:")
    for pair, correlation in correlations.items():
        print(f"  {pair}: {correlation:.3f}")
    
    # Rank sectors
    rankings = sector_engine.rank_sectors()
    print(f"\nSector Rankings:")
    for i, (sector, score) in enumerate(rankings, 1):
        print(f"  {i}. {sector.value.title()}: {score:.1f}")
    
    print("\nSector-Specific Indicators initialized successfully!")