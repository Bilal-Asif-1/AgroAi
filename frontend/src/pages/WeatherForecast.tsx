import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, CloudSun, CloudDrizzle, Snowflake, CheckCircle, MapPin, Search, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { fetchFarms } from '../store/farmSlice';

interface DecodedToken {
  _id: string;
}

interface ForecastData {
  dt: number;
  main: {
    temp: number;
    humidity?: number;
    pressure?: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind?: {
    speed?: number;
    deg?: number;
  };
  rain?: {
    [key: string]: number;
  };
}

interface Farm {
  _id: string;
  name: string;
  area: string;
  city: string;
}

const WeatherForecast = () => {
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [farmSearch, setFarmSearch] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const token = localStorage.getItem('token') || '';

  const decoded = jwtDecode<DecodedToken>(token);
  const userId = decoded._id;

  useEffect(() => {
    const fetchFarmsData = async () => {
      const response = await dispatch(fetchFarms(userId));
      const farmsData = response.payload as Farm[];
      setFarms(farmsData);
      if (farmsData.length > 0) {
        setSelectedFarm(farmsData[0]);
      } else {
        setLoading(false); // No farms, stop loading
      }
    };
    fetchFarmsData();
  }, [dispatch, userId]);

  // Fetch weather for selected farm's city
  useEffect(() => {
    const fetchForecast = async () => {
      if (!selectedFarm || !selectedFarm.city) {
        setLoading(false);
        setError('No farm or city selected.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'a9e176c3d2af243a8997f002df2ec957';
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(selectedFarm.city)}&units=metric&appid=${API_KEY}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        const dailyForecasts = data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 4);
        setForecasts(dailyForecasts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };
    if (selectedFarm) {
      fetchForecast();
    }
    // eslint-disable-next-line
  }, [selectedFarm]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-9 h-9 text-yellow-400 drop-shadow-lg" />;
      case 'clouds':
        return <Cloud className="w-9 h-9 text-blue-300 drop-shadow-lg" />;
      case 'rain':
        return <CloudRain className="w-9 h-9 text-blue-500 drop-shadow-lg" />;
      case 'drizzle':
        return <CloudDrizzle className="w-9 h-9 text-blue-400 drop-shadow-lg" />;
      case 'snow':
        return <Snowflake className="w-9 h-9 text-blue-200 drop-shadow-lg" />;
      case 'partly cloudy':
        return <CloudSun className="w-9 h-9 text-yellow-200 drop-shadow-lg" />;
      default:
        return <Cloud className="w-9 h-9 text-blue-200 drop-shadow-lg" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
      return t('weather.days.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('weather.days.tomorrow');
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  };

  // Filter farms by search
  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(farmSearch.toLowerCase()) ||
    farm.city.toLowerCase().includes(farmSearch.toLowerCase()) ||
    farm.area.toLowerCase().includes(farmSearch.toLowerCase())
  );

  // Helper to generate advice/alerts based on weather
  function getWeatherAdvice(forecast: ForecastData) {
    const temp = forecast.main.temp;
    const humidity = forecast.main.humidity ?? 0;
    const wind = forecast.wind?.speed ?? 0;
    const rain = forecast.rain?.['3h'] ?? 0;
    let advice = '';
    let type: 'good' | 'caution' | 'danger' = 'good';

    if (temp >= 36) {
      advice = 'High temperature: Irrigate early and consider mulching to retain soil moisture.';
      type = 'danger';
    } else if (temp >= 32) {
      advice = 'Warm day: Monitor soil moisture and avoid pesticide spraying during peak heat.';
      type = 'caution';
    } else if (temp <= 5) {
      advice = 'Possible frost: Protect sensitive crops and cover seedlings.';
      type = 'danger';
    } else if (rain >= 10) {
      advice = 'Heavy rain expected: Ensure field drainage is clear to prevent waterlogging.';
      type = 'danger';
    } else if (rain >= 3) {
      advice = 'Rain likely: Delay pesticide/fertilizer application.';
      type = 'caution';
    } else if (wind >= 30) {
      advice = 'Strong winds: Secure young plants and structures.';
      type = 'danger';
    } else if (wind >= 15) {
      advice = 'Windy: Monitor for crop lodging or damage.';
      type = 'caution';
    } else {
      advice = 'Weather is favorable for most farm activities.';
      type = 'good';
    }
    return { advice, type };
  }

  // Helper to estimate frost and hail risk
  function estimateFrostRisk(temp: number) {
    return temp <= 5 ? 'High' : temp <= 8 ? 'Moderate' : 'Low';
  }
  function estimateHailRisk(weatherMain: string) {
    return weatherMain.toLowerCase().includes('hail') ? 'Possible' : 'Low';
  }

  // Helper to identify risks
  function getWeatherRisks(forecast: ForecastData) {
    const temp = forecast.main.temp;
    const rain = forecast.rain?.['3h'] ?? 0;
    const wind = forecast.wind?.speed ?? 0;
    const humidity = forecast.main.humidity ?? 0;
    const risks: string[] = [];
    if (rain >= 30) risks.push('Flooding');
    if (rain === 0) risks.push('Drought');
    if (temp <= 5) risks.push('Crop damage from frost');
    if (temp >= 36) risks.push('Crop damage from heatwave');
    if (wind >= 40) risks.push('Lodging/structure damage');
    if (humidity >= 85) risks.push('Disease spread');
    return risks;
  }

  // Helper to generate planning tips
  function getPlanningTip(forecast: ForecastData) {
    const temp = forecast.main.temp;
    const rain = forecast.rain?.['3h'] ?? 0;
    const wind = forecast.wind?.speed ?? 0;
    if (rain === 0 && temp > 10 && temp < 32) return 'Good day for sowing or harvesting.';
    if (rain > 0 && rain < 10) return 'Apply fertilizer before rain.';
    if (rain >= 10) return 'Avoid pesticide spraying before rain.';
    if (wind > 30) return 'Avoid spraying or light tasks during strong winds.';
    return 'Plan regular farm activities.';
  }

  // Helper to generate alerts
  function getWeatherAlerts(forecast: ForecastData) {
    const temp = forecast.main.temp;
    const rain = forecast.rain?.['3h'] ?? 0;
    const wind = forecast.wind?.speed ?? 0;
    const alerts: string[] = [];
    if (rain > 50) alerts.push('Rain > 50mm: Delay irrigation');
    if (wind > 60) alerts.push('Wind > 60km/h: Secure structures');
    if (temp < 5) alerts.push('Temperature < 5°C: Activate frost protection');
    return alerts;
  }

  const weatherDescriptionMap: Record<string, string> = {
    'overcast clouds': 'weather.description.overcastClouds',
    'light rain': 'weather.description.lightRain',
    'clear sky': 'weather.description.clearSky',
    'few clouds': 'weather.description.fewClouds',
    'scattered clouds': 'weather.description.scatteredClouds',
    'broken clouds': 'weather.description.brokenClouds',
    'shower rain': 'weather.description.showerRain',
    'rain': 'weather.description.rain',
    'thunderstorm': 'weather.description.thunderstorm',
    'snow': 'weather.description.snow',
    'mist': 'weather.description.mist',
  };

  // Add risk level and risk name mappings for translation
  const riskLevelMap: Record<string, string> = {
    'low': 'weather.riskLevel.low',
    'moderate': 'weather.riskLevel.moderate',
    'high': 'weather.riskLevel.high',
    'possible': 'weather.riskLevel.possible',
  };
  const riskNameMap: Record<string, string> = {
    'drought': 'weather.risk.drought',
    'flooding': 'weather.risk.flooding',
    'crop damage from frost': 'weather.risk.cropdamagefromfrost',
    'crop damage from heatwave': 'weather.risk.cropdamagefromheatwave',
    'lodging/structure damage': 'weather.risk.lodgingstructuredamage',
    'disease spread': 'weather.risk.diseasespread',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 py-8 px-2 md:px-8 overflow-y-hidden">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center drop-shadow-sm">{t('weather.title')}</h1>
      {/* Farm search bar */}
      {farms.length > 0 ? (
        <div className="mb-4 max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={farmSearch}
              onChange={e => setFarmSearch(e.target.value)}
              placeholder={t('weather.searchFarmPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-2xl font-bold text-gray-400 mb-2">No Farms Found</div>
          <div className="text-md text-gray-500">Add farms to show weather data.</div>
        </div>
      )}
      {/* Farm selection card selector, now wraps and fits page */}
      {Array.isArray(filteredFarms) && filteredFarms.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 w-full justify-center">
          {filteredFarms.map(farm => (
            <div
              key={farm._id}
              onClick={() => setSelectedFarm(farm)}
              className={`flex flex-col items-start min-w-[160px] max-w-[220px] px-4 py-2 rounded-xl shadow transition-all duration-200 cursor-pointer border-2
                ${selectedFarm?._id === farm._id
                  ? 'bg-gradient-to-br from-green-200 to-blue-100 border-green-400 scale-102 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-green-300 hover:scale-102'}
              `}
              style={{ zIndex: selectedFarm?._id === farm._id ? 2 : 1 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-base text-gray-800 truncate max-w-[90px]">{farm.name}</span>
                {selectedFarm?._id === farm._id && <CheckCircle className="w-4 h-4 text-green-600 ml-1" />}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-[120px]">{farm.city}</div>
              <div className="text-xs text-gray-400 mt-1 truncate max-w-[120px]">{farm.area}</div>
            </div>
          ))}
        </div>
      )}
      {/* Weather cards, spacious grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-400"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center max-w-md mx-auto shadow">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {forecasts.map((forecast, index) => {
            const humidity = forecast.main.humidity ?? '-';
            const wind = forecast.wind?.speed ?? '-';
            const rain = forecast.rain?.['3h'] ?? 0;
            const temp = forecast.main.temp;
            const frostRisk = estimateFrostRisk(temp);
            const hailRisk = estimateHailRisk(forecast.weather[0].main);
            const risks = getWeatherRisks(forecast);
            const planningTip = getPlanningTip(forecast);
            const alerts = getWeatherAlerts(forecast);
            const { advice, type } = getWeatherAdvice(forecast);
            const descKey = weatherDescriptionMap[forecast.weather[0].description.toLowerCase()];
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-5 flex flex-col items-center transition-transform duration-200 hover:scale-103 hover:shadow-2xl border border-blue-100"
                style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #f1f8e9 100%)' }}
              >
                <div className="mb-1 text-base font-bold text-blue-700 tracking-wide drop-shadow">
                  {formatDate(forecast.dt)}
                </div>
                <div className="my-2 flex justify-center items-center">
                {getWeatherIcon(forecast.weather[0].main)}
              </div>
                <div className="text-2xl font-extrabold text-gray-900 mb-1 drop-shadow-lg">
                  {Math.round(forecast.main.temp)}°C
                </div>
                <div className="text-xs text-gray-600 capitalize font-medium text-center mb-2">
                  {t(descKey) || forecast.weather[0].description}
                </div>
                {/* Weather details */}
                <div className="flex flex-col gap-1 text-xs text-gray-700 w-full mb-2">
                  <div className="flex justify-between"><span>💧 Humidity:</span> <span>{humidity}%</span></div>
                  <div className="flex justify-between"><span>💨 Wind:</span> <span>{wind} km/h</span></div>
                  <div className="flex justify-between"><span>🌧️ Rain:</span> <span>{rain} mm</span></div>
                  <div className="flex justify-between"><span>❄️ {t('weather.frostRisk')}:</span> <span>{t(riskLevelMap[frostRisk.toLowerCase()]) || frostRisk}</span></div>
                  <div className="flex justify-between"><span>🌩️ {t('weather.hailstorm')}:</span> <span>{t(riskLevelMap[hailRisk.toLowerCase()]) || hailRisk}</span></div>
                </div>
                {/* Risks */}
                {risks.length > 0 && (
                  <div className="w-full text-xs rounded px-2 py-1 mb-1 text-center font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                    <span className="inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t('weather.risks')}: {risks.map(risk => t(riskNameMap[risk.toLowerCase()]) || risk).join(', ')}</span>
                  </div>
                )}
                {/* Alerts */}
                {alerts.length > 0 && alerts.map((alert, i) => (
                  <div key={i} className="w-full text-xs rounded px-2 py-1 mb-1 text-center font-semibold bg-red-100 text-red-700 border border-red-200">
                    <span className="inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {alert}</span>
            </div>
          ))}
                {/* Advice/alert */}
                <div className={`w-full text-xs rounded px-2 py-1 mt-1 text-center font-semibold
                  ${type === 'danger' ? 'bg-red-100 text-red-700 border border-red-200' :
                    type === 'caution' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-green-100 text-green-700 border border-green-200'}
                `}>
                  {t(`weather.advice.${type}`)}
                </div>
                {/* Planning tip */}
                <div className="w-full text-xs rounded px-2 py-1 mt-1 text-center font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  <span className="inline-flex items-center gap-1"><Info className="w-3 h-3" /> {t(`weather.planningTip.${planningTip.replace(/\s+/g, '').toLowerCase()}`)}</span>
                </div>
                {/* How to respond info */}
                <a
                  href="https://www.fao.org/climate-smart-agriculture/knowledge/practices/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-xs rounded px-2 py-1 mt-1 text-center font-medium bg-green-50 text-green-700 border border-green-100 hover:underline block"
                >
                  How to respond to weather risks?
                </a>
                {/* Last updated */}
                <div className="w-full text-[10px] text-right text-gray-400 mt-1">Last updated: {new Date().toLocaleTimeString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;