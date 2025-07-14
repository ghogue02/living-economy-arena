"""
International Economic Indicators - Phase 3 Market Complexity
Cross-border economic comparison frameworks and global indicators
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, field
from enum import Enum
import json
from economic_indicators import EconomicIndicator, IndicatorMetadata, EconomicDataPoint

class Country(Enum):
    USA = "USA"
    CHINA = "CHN"
    GERMANY = "DEU"
    JAPAN = "JPN"
    UNITED_KINGDOM = "GBR"
    FRANCE = "FRA"
    INDIA = "IND"
    ITALY = "ITA"
    BRAZIL = "BRA"
    CANADA = "CAN"
    RUSSIA = "RUS"
    SOUTH_KOREA = "KOR"
    SPAIN = "ESP"
    AUSTRALIA = "AUS"
    MEXICO = "MEX"

class Currency(Enum):
    USD = "USD"
    EUR = "EUR"
    JPY = "JPY"
    GBP = "GBP"
    CNY = "CNY"
    INR = "INR"
    BRL = "BRL"
    CAD = "CAD"
    RUB = "RUB"
    KRW = "KRW"

class DevelopmentLevel(Enum):
    DEVELOPED = "developed"
    EMERGING = "emerging"
    DEVELOPING = "developing"
    FRONTIER = "frontier"

@dataclass
class CountryProfile:
    """Profile of a country's economic characteristics"""
    country: Country
    currency: Currency
    development_level: DevelopmentLevel
    gdp_nominal: float  # in USD billions
    gdp_per_capita: float  # in USD
    population: int
    land_area: float  # in sq km
    primary_exports: List[str]
    trade_partners: List[Country]
    last_updated: datetime

@dataclass
class ExchangeRate:
    """Currency exchange rate data"""
    base_currency: Currency
    target_currency: Currency
    rate: float
    timestamp: datetime
    source: str
    volatility: float = 0.0

@dataclass
class InternationalComparison:
    """Results of international economic comparison"""
    indicator_name: str
    comparison_date: datetime
    country_values: Dict[Country, float]
    rankings: List[Tuple[Country, float, int]]  # (country, value, rank)
    regional_averages: Dict[str, float]
    global_average: float
    outliers: List[Country]
    convergence_measure: float

class GlobalEconomicIndicator(EconomicIndicator):
    """Base class for global economic indicators"""
    
    def __init__(self, indicator_id: str, metadata: IndicatorMetadata):
        super().__init__(indicator_id, metadata)
        self.country_data: Dict[Country, List[EconomicDataPoint]] = {}
        self.exchange_rates: Dict[Tuple[Currency, Currency], ExchangeRate] = {}
    
    def add_country_data(self, country: Country, data_point: EconomicDataPoint):
        """Add data point for specific country"""
        if country not in self.country_data:
            self.country_data[country] = []
        
        if self.validate_data(data_point):
            self.country_data[country].append(data_point)
            self.country_data[country].sort(key=lambda x: x.timestamp)
    
    def get_country_latest_value(self, country: Country) -> Optional[float]:
        """Get latest value for specific country"""
        if country in self.country_data and self.country_data[country]:
            return self.country_data[country][-1].value
        return None
    
    def convert_to_common_currency(self, value: float, from_currency: Currency, 
                                 to_currency: Currency = Currency.USD) -> float:
        """Convert value to common currency for comparison"""
        if from_currency == to_currency:
            return value
        
        rate_key = (from_currency, to_currency)
        if rate_key in self.exchange_rates:
            return value * self.exchange_rates[rate_key].rate
        
        # Use placeholder exchange rate if not available
        placeholder_rates = {
            (Currency.EUR, Currency.USD): 1.08,
            (Currency.JPY, Currency.USD): 0.0067,
            (Currency.GBP, Currency.USD): 1.27,
            (Currency.CNY, Currency.USD): 0.138,
            (Currency.INR, Currency.USD): 0.012
        }
        
        return value * placeholder_rates.get(rate_key, 1.0)

class GlobalGDPIndicator(GlobalEconomicIndicator):
    """Global GDP comparison indicator"""
    
    def __init__(self):
        metadata = IndicatorMetadata(
            name="Global GDP Comparison",
            description="GDP comparison across countries",
            category="international",
            frequency="quarterly",
            unit="billions_usd",
            source_agency="IMF/World Bank",
            calculation_method="purchasing_power_parity",
            historical_range=(datetime(1960, 1, 1), datetime.now())
        )
        super().__init__("global_gdp", metadata)
    
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate GDP value for a country"""
        return raw_data.get('gdp_nominal', 0)
    
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate GDP data point"""
        return data_point.value >= 0

class GlobalInflationIndicator(GlobalEconomicIndicator):
    """Global inflation comparison indicator"""
    
    def __init__(self):
        metadata = IndicatorMetadata(
            name="Global Inflation Comparison",
            description="Inflation rates across countries",
            category="international",
            frequency="monthly",
            unit="percentage",
            source_agency="OECD/National Statistics",
            calculation_method="consumer_price_index",
            historical_range=(datetime(1960, 1, 1), datetime.now())
        )
        super().__init__("global_inflation", metadata)
    
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate inflation rate"""
        current_cpi = raw_data.get('current_cpi', 100)
        previous_cpi = raw_data.get('previous_cpi', 100)
        
        if previous_cpi > 0:
            return ((current_cpi - previous_cpi) / previous_cpi) * 100
        return 0
    
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate inflation data"""
        return -50 <= data_point.value <= 100  # Reasonable inflation range

class GlobalUnemploymentIndicator(GlobalEconomicIndicator):
    """Global unemployment comparison indicator"""
    
    def __init__(self):
        metadata = IndicatorMetadata(
            name="Global Unemployment Comparison",
            description="Unemployment rates across countries",
            category="international",
            frequency="monthly",
            unit="percentage",
            source_agency="ILO/National Statistics",
            calculation_method="labor_force_survey",
            historical_range=(datetime(1960, 1, 1), datetime.now())
        )
        super().__init__("global_unemployment", metadata)
    
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate unemployment rate"""
        unemployed = raw_data.get('unemployed_persons', 0)
        labor_force = raw_data.get('labor_force', 1)
        
        return (unemployed / labor_force) * 100 if labor_force > 0 else 0
    
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate unemployment data"""
        return 0 <= data_point.value <= 50

class GlobalTradeIndicator(GlobalEconomicIndicator):
    """Global trade balance indicator"""
    
    def __init__(self):
        metadata = IndicatorMetadata(
            name="Global Trade Balance",
            description="Trade balance across countries",
            category="international",
            frequency="monthly",
            unit="billions_usd",
            source_agency="WTO/National Customs",
            calculation_method="exports_minus_imports",
            historical_range=(datetime(1960, 1, 1), datetime.now())
        )
        super().__init__("global_trade", metadata)
    
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate trade balance"""
        exports = raw_data.get('exports', 0)
        imports = raw_data.get('imports', 0)
        return exports - imports
    
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate trade data"""
        return True  # Trade balance can be positive or negative

class InternationalComparisonEngine:
    """Engine for international economic comparisons"""
    
    def __init__(self):
        self.country_profiles: Dict[Country, CountryProfile] = {}
        self.global_indicators: Dict[str, GlobalEconomicIndicator] = {
            'gdp': GlobalGDPIndicator(),
            'inflation': GlobalInflationIndicator(),
            'unemployment': GlobalUnemploymentIndicator(),
            'trade': GlobalTradeIndicator()
        }
        self.regional_groups = self._initialize_regional_groups()
        self.comparison_history: List[InternationalComparison] = []
    
    def _initialize_regional_groups(self) -> Dict[str, List[Country]]:
        """Initialize regional country groups"""
        return {
            'North America': [Country.USA, Country.CANADA, Country.MEXICO],
            'Europe': [Country.GERMANY, Country.FRANCE, Country.ITALY, Country.SPAIN, Country.UNITED_KINGDOM],
            'Asia Pacific': [Country.CHINA, Country.JAPAN, Country.SOUTH_KOREA, Country.INDIA, Country.AUSTRALIA],
            'Latin America': [Country.BRAZIL, Country.MEXICO],
            'BRICS': [Country.BRAZIL, Country.RUSSIA, Country.INDIA, Country.CHINA],
            'G7': [Country.USA, Country.GERMANY, Country.JAPAN, Country.UNITED_KINGDOM, 
                   Country.FRANCE, Country.ITALY, Country.CANADA]
        }
    
    def initialize_country_profile(self, country: Country, profile_data: Dict[str, Any]):
        """Initialize profile for a country"""
        profile = CountryProfile(
            country=country,
            currency=Currency(profile_data.get('currency', 'USD')),
            development_level=DevelopmentLevel(profile_data.get('development_level', 'developed')),
            gdp_nominal=profile_data.get('gdp_nominal', 0),
            gdp_per_capita=profile_data.get('gdp_per_capita', 0),
            population=profile_data.get('population', 0),
            land_area=profile_data.get('land_area', 0),
            primary_exports=profile_data.get('primary_exports', []),
            trade_partners=profile_data.get('trade_partners', []),
            last_updated=datetime.now()
        )
        self.country_profiles[country] = profile
    
    def compare_indicator_globally(self, indicator_name: str, 
                                 countries: Optional[List[Country]] = None) -> InternationalComparison:
        """Compare an economic indicator across countries"""
        if indicator_name not in self.global_indicators:
            raise ValueError(f"Unknown indicator: {indicator_name}")
        
        indicator = self.global_indicators[indicator_name]
        comparison_countries = countries or list(Country)
        
        # Get latest values for each country
        country_values = {}
        for country in comparison_countries:
            value = indicator.get_country_latest_value(country)
            if value is not None:
                # Convert to common currency if needed
                if country in self.country_profiles:
                    profile = self.country_profiles[country]
                    if indicator_name in ['gdp', 'trade']:
                        value = indicator.convert_to_common_currency(
                            value, profile.currency, Currency.USD
                        )
                country_values[country] = value
        
        # Create rankings
        rankings = []
        for i, (country, value) in enumerate(
            sorted(country_values.items(), key=lambda x: x[1], reverse=True), 1
        ):
            rankings.append((country, value, i))
        
        # Calculate regional averages
        regional_averages = {}
        for region, region_countries in self.regional_groups.items():
            region_values = [
                country_values[country] for country in region_countries
                if country in country_values
            ]
            if region_values:
                regional_averages[region] = np.mean(region_values)
        
        # Calculate global average
        global_average = np.mean(list(country_values.values())) if country_values else 0
        
        # Identify outliers (more than 2 standard deviations from mean)
        if len(country_values) > 3:
            values = list(country_values.values())
            mean_val = np.mean(values)
            std_val = np.std(values)
            outliers = [
                country for country, value in country_values.items()
                if abs(value - mean_val) > 2 * std_val
            ]
        else:
            outliers = []
        
        # Calculate convergence measure (coefficient of variation)
        if len(country_values) > 1:
            values = list(country_values.values())
            convergence_measure = np.std(values) / np.mean(values) if np.mean(values) != 0 else 0
        else:
            convergence_measure = 0
        
        comparison = InternationalComparison(
            indicator_name=indicator_name,
            comparison_date=datetime.now(),
            country_values=country_values,
            rankings=rankings,
            regional_averages=regional_averages,
            global_average=global_average,
            outliers=outliers,
            convergence_measure=convergence_measure
        )
        
        self.comparison_history.append(comparison)
        return comparison
    
    def analyze_convergence_trends(self, indicator_name: str, 
                                 time_periods: int = 12) -> Dict[str, Any]:
        """Analyze convergence trends over time"""
        relevant_comparisons = [
            comp for comp in self.comparison_history
            if comp.indicator_name == indicator_name
        ]
        
        if len(relevant_comparisons) < 2:
            return {'status': 'insufficient_data'}
        
        # Sort by date
        relevant_comparisons.sort(key=lambda x: x.comparison_date)
        recent_comparisons = relevant_comparisons[-time_periods:]
        
        # Calculate convergence trend
        convergence_values = [comp.convergence_measure for comp in recent_comparisons]
        
        if len(convergence_values) >= 3:
            trend_slope = np.polyfit(range(len(convergence_values)), convergence_values, 1)[0]
            
            if trend_slope < -0.01:
                trend = "converging"
            elif trend_slope > 0.01:
                trend = "diverging"
            else:
                trend = "stable"
        else:
            trend = "unknown"
        
        return {
            'status': 'success',
            'trend': trend,
            'trend_slope': trend_slope if 'trend_slope' in locals() else 0,
            'current_convergence': convergence_values[-1] if convergence_values else 0,
            'periods_analyzed': len(convergence_values)
        }
    
    def calculate_economic_similarity(self, country1: Country, country2: Country) -> float:
        """Calculate economic similarity between two countries"""
        if country1 not in self.country_profiles or country2 not in self.country_profiles:
            return 0.0
        
        profile1 = self.country_profiles[country1]
        profile2 = self.country_profiles[country2]
        
        # Compare various economic factors
        similarity_factors = []
        
        # GDP per capita similarity
        if profile1.gdp_per_capita > 0 and profile2.gdp_per_capita > 0:
            gdp_ratio = min(profile1.gdp_per_capita, profile2.gdp_per_capita) / \
                       max(profile1.gdp_per_capita, profile2.gdp_per_capita)
            similarity_factors.append(gdp_ratio)
        
        # Development level similarity
        dev_levels = {'developed': 3, 'emerging': 2, 'developing': 1, 'frontier': 0}
        dev_diff = abs(dev_levels[profile1.development_level.value] - 
                      dev_levels[profile2.development_level.value])
        dev_similarity = 1 - (dev_diff / 3)
        similarity_factors.append(dev_similarity)
        
        # Trade partner overlap
        common_partners = set(profile1.trade_partners) & set(profile2.trade_partners)
        total_partners = set(profile1.trade_partners) | set(profile2.trade_partners)
        
        if total_partners:
            trade_similarity = len(common_partners) / len(total_partners)
            similarity_factors.append(trade_similarity)
        
        return np.mean(similarity_factors) if similarity_factors else 0.0
    
    def identify_peer_countries(self, target_country: Country, 
                              similarity_threshold: float = 0.6) -> List[Tuple[Country, float]]:
        """Identify peer countries based on economic similarity"""
        if target_country not in self.country_profiles:
            return []
        
        peer_countries = []
        
        for country in self.country_profiles:
            if country != target_country:
                similarity = self.calculate_economic_similarity(target_country, country)
                if similarity >= similarity_threshold:
                    peer_countries.append((country, similarity))
        
        # Sort by similarity
        peer_countries.sort(key=lambda x: x[1], reverse=True)
        return peer_countries
    
    def generate_country_report(self, country: Country) -> Dict[str, Any]:
        """Generate comprehensive country economic report"""
        if country not in self.country_profiles:
            return {'error': 'Country profile not found'}
        
        profile = self.country_profiles[country]
        
        # Get latest indicator values
        indicator_values = {}
        for indicator_name, indicator in self.global_indicators.items():
            value = indicator.get_country_latest_value(country)
            if value is not None:
                indicator_values[indicator_name] = value
        
        # Get peer countries
        peer_countries = self.identify_peer_countries(country)
        
        # Get regional ranking for each indicator
        regional_rankings = {}
        for region, region_countries in self.regional_groups.items():
            if country in region_countries:
                for indicator_name in self.global_indicators:
                    comparison = self.compare_indicator_globally(indicator_name, region_countries)
                    country_rank = next(
                        (rank for ctry, val, rank in comparison.rankings if ctry == country),
                        None
                    )
                    if country_rank:
                        regional_rankings[f"{region}_{indicator_name}"] = country_rank
        
        return {
            'country': country.value,
            'profile': profile,
            'latest_indicators': indicator_values,
            'peer_countries': peer_countries[:5],  # Top 5 peers
            'regional_rankings': regional_rankings,
            'development_level': profile.development_level.value,
            'currency': profile.currency.value,
            'report_date': datetime.now()
        }

# Example usage and testing
if __name__ == "__main__":
    print("International Economic Indicators - Phase 3 Market Complexity")
    print("=" * 70)
    
    # Initialize comparison engine
    comparison_engine = InternationalComparisonEngine()
    
    # Initialize sample country profiles
    sample_countries = {
        Country.USA: {
            'currency': 'USD',
            'development_level': 'developed',
            'gdp_nominal': 26900,  # billions USD
            'gdp_per_capita': 80000,
            'population': 331000000,
            'land_area': 9834000,
            'primary_exports': ['technology', 'aircraft', 'machinery'],
            'trade_partners': [Country.CHINA, Country.CANADA, Country.MEXICO]
        },
        Country.CHINA: {
            'currency': 'CNY',
            'development_level': 'emerging',
            'gdp_nominal': 17900,
            'gdp_per_capita': 12700,
            'population': 1412000000,
            'land_area': 9597000,
            'primary_exports': ['electronics', 'machinery', 'textiles'],
            'trade_partners': [Country.USA, Country.JAPAN, Country.GERMANY]
        },
        Country.GERMANY: {
            'currency': 'EUR',
            'development_level': 'developed',
            'gdp_nominal': 4300,
            'gdp_per_capita': 51000,
            'population': 83000000,
            'land_area': 358000,
            'primary_exports': ['machinery', 'vehicles', 'chemicals'],
            'trade_partners': [Country.USA, Country.CHINA, Country.FRANCE]
        }
    }
    
    for country, data in sample_countries.items():
        comparison_engine.initialize_country_profile(country, data)
    
    # Add sample indicator data
    sample_indicator_data = {
        Country.USA: {
            'gdp': 26900,
            'inflation': 3.2,
            'unemployment': 3.6,
            'trade': -948  # trade deficit
        },
        Country.CHINA: {
            'gdp': 17900,
            'inflation': 2.1,
            'unemployment': 5.2,
            'trade': 676  # trade surplus
        },
        Country.GERMANY: {
            'gdp': 4300,
            'inflation': 2.8,
            'unemployment': 3.1,
            'trade': 310  # trade surplus
        }
    }
    
    # Add data to indicators
    for country, indicators in sample_indicator_data.items():
        for indicator_name, value in indicators.items():
            if indicator_name in comparison_engine.global_indicators:
                data_point = EconomicDataPoint(
                    indicator_id=f"global_{indicator_name}",
                    value=value,
                    timestamp=datetime.now(),
                    source="sample_data",
                    confidence=0.9
                )
                comparison_engine.global_indicators[indicator_name].add_country_data(
                    country, data_point
                )
    
    # Perform global comparisons
    print("Global Economic Comparisons:")
    print("-" * 40)
    
    for indicator_name in ['gdp', 'inflation', 'unemployment', 'trade']:
        comparison = comparison_engine.compare_indicator_globally(
            indicator_name, list(sample_countries.keys())
        )
        
        print(f"\n{indicator_name.upper()} Rankings:")
        for country, value, rank in comparison.rankings:
            print(f"  {rank}. {country.value}: {value:.1f}")
        
        print(f"  Global Average: {comparison.global_average:.1f}")
        print(f"  Convergence Measure: {comparison.convergence_measure:.3f}")
        
        if comparison.outliers:
            print(f"  Outliers: {[c.value for c in comparison.outliers]}")
    
    # Calculate economic similarities
    print(f"\nEconomic Similarities:")
    print("-" * 30)
    
    for country1 in sample_countries.keys():
        for country2 in sample_countries.keys():
            if country1 != country2 and country1.value < country2.value:  # Avoid duplicates
                similarity = comparison_engine.calculate_economic_similarity(country1, country2)
                print(f"{country1.value} - {country2.value}: {similarity:.3f}")
    
    # Generate country reports
    print(f"\nCountry Report - USA:")
    print("-" * 25)
    
    usa_report = comparison_engine.generate_country_report(Country.USA)
    print(f"Development Level: {usa_report['development_level']}")
    print(f"Currency: {usa_report['currency']}")
    print(f"Latest GDP: ${usa_report['latest_indicators']['gdp']:.0f}B")
    print(f"Latest Inflation: {usa_report['latest_indicators']['inflation']:.1f}%")
    print(f"Latest Unemployment: {usa_report['latest_indicators']['unemployment']:.1f}%")
    
    if usa_report['peer_countries']:
        print("Peer Countries:")
        for peer_country, similarity in usa_report['peer_countries']:
            print(f"  {peer_country.value}: {similarity:.3f}")
    
    print("\nInternational Economic Indicators initialized successfully!")