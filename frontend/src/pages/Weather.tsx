import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, MapPin, Search, Building2, Leaf, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchFarms } from '../store/farmSlice';
import { jwtDecode } from 'jwt-decode';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  visibility: number;
}

interface Farm {
  _id: string;
  name: string;
  city: string;
}

interface DecodedToken {
  _id: string;
}

const Weather = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const token = localStorage.getItem('token') || '';
  const decoded = jwtDecode<DecodedToken>(token);
  const userId = decoded._id;

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  useEffect(() => {
    const fetchFarmsData = async () => {
      try {
        const response = await dispatch(fetchFarms(userId));
        const farmsData = response.payload as Farm[];
        setFarms(farmsData);
        if (Array.isArray(farmsData) && farmsData.length > 0) {
          setSelectedFarm(farmsData[0]);
        }
        setLoadingFarms(false);
      } catch (err) {
        setLoadingFarms(false);
        setError('Failed to fetch farms');
      }
    };
    fetchFarmsData();
  }, [dispatch, userId]);

  useEffect(() => {
    if (selectedFarm) {
      fetchWeather(selectedFarm.city);
    }
    // eslint-disable-next-line
  }, [selectedFarm]);

  const fetchWeather = async (city: string) => {
      setLoading(true);
      setError('');
    setWeatherData(null);
    if (!API_KEY) {
      setError('Weather API key is missing.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('City not found');
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeather(location.trim());
    }
  };

  const handleFarmChange = (farm: Farm) => {
    setSelectedFarm(farm);
    fetchWeather(farm.city);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-12 h-12 text-yellow-500" />;
      case 'rain':
        return <CloudRain className="w-12 h-12 text-blue-500" />;
      case 'clouds':
        return <Cloud className="w-12 h-12 text-gray-500" />;
      default:
        return <Cloud className="w-12 h-12 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('weather.title')}</h1>
      </div>

      {/* Farm Selection */}
      {loadingFarms ? (
        <div className="flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : farms.length > 0 ? (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-700">{t('weather.selectFarm')}</h2>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {farms.map((farm) => (
              <div
                key={farm._id}
                onClick={() => handleFarmChange(farm)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap ${
                  selectedFarm?._id === farm._id
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                }`}
              >
                <Leaf className="w-4 h-4" />
                <span className="font-medium">{farm.name}</span>
                <span className="text-sm opacity-75">({farm.city})</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{t('weather.noFarmsAvailable')}</p>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('weather.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          {t('weather.search')}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700">{t(error)}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : weatherData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Weather */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{weatherData.name}</h2>
              {getWeatherIcon(weatherData.weather[0].main)}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('weather.temperature')}</span>
                <span className="text-2xl font-bold">{Math.round(weatherData.main.temp)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('weather.feelsLike')}</span>
                <span>{Math.round(weatherData.main.feels_like)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('weather.humidity')}</span>
                <span>{weatherData.main.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('weather.windSpeed')}</span>
                <span className="flex items-center gap-1">
                  <Wind className="w-4 h-4" />
                  {weatherData.wind.speed} m/s
                </span>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('weather.details')}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('weather.condition')}</span>
                <span className="capitalize">{weatherData.weather[0].description}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('weather.pressure')}</span>
                <span>{weatherData.main.pressure} hPa</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('weather.visibility')}</span>
                <span>{(weatherData.visibility || 0) / 1000} km</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">{t('weather.searchPrompt')}</div>
      )}
    </div>
  );
};

export default Weather; 