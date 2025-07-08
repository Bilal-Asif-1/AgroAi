import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const regions = [
  'South Asia',
  'North America',
  'Africa',
  'Europe',
  'South America',
  'Australia',
  'East Asia',
  'Middle East',
];

type Trend = 'up' | 'down';
type Crop = {
  name: string;
  type: string;
  price: string;
  trend: Trend;
  change: string;
};

const cropTypeColors: Record<string, string> = {
  Grain: '#34d399',
  Legume: '#f59e42',
  'Cash Crop': '#f43f5e',
  Fiber: '#6366f1',
  Beverage: '#fbbf24',
  Root: '#a3e635',
  Oilseed: '#f472b6',
  Fruit: '#38bdf8',
  Vegetable: '#facc15',
  Nut: '#a78bfa',
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
} as const;

const RegionCropData: React.FC = () => {
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState('South Asia');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCropData = async (region: string) => {
    setLoading(true);
    setError('');
    setCrops([]);
    setSuggestions([]);
    try {
      const response = await fetch(`/api/market/ai-crop-data?region=${encodeURIComponent(region)}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setCrops(result.crops || []);
      setSuggestions(result.suggestions || []);
    } catch (err) {
      setError('Could not load crop data.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCropData(selectedRegion);
  }, [selectedRegion]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto mt-10 border border-emerald-100">
      <h2 className="text-2xl font-bold text-emerald-700 mb-4 text-center">{t('market.regionTitle')}</h2>
      <div className="mb-6 flex justify-center">
        <select
          className="border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
        >
          {regions.map(region => (
            <option key={region} value={region}>{t(`market.region.${region.replace(/\s+/g, '').toLowerCase()}`) || region}</option>
          ))}
        </select>
      </div>
      {loading && <div className="text-emerald-600 text-center">{t('market.loading')}</div>}
      {error && <div className="text-red-600 text-center">{t('market.error')}</div>}
      {!loading && !error && crops.length > 0 && (
        <>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">{t('market.cropIndexTable')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-emerald-100 rounded-xl bg-emerald-50">
                <thead>
                  <tr className="bg-emerald-100 text-emerald-800">
                    <th className="px-4 py-2 text-left">{t('market.crop')}</th>
                    <th className="px-4 py-2 text-left">{t('market.type')}</th>
                    <th className="px-4 py-2 text-left">{t('market.price')}</th>
                    <th className="px-4 py-2 text-left">{t('market.trend')}</th>
                    <th className="px-4 py-2 text-left">{t('market.change')}</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((crop, idx) => (
                    <tr key={crop.name} className="border-t border-emerald-100 hover:bg-emerald-100/60 transition">
                      <td className="px-4 py-2 font-medium flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: cropTypeColors[crop.type] || '#34d399' }}></span>
                        {t(`market.cropName.${crop.name.replace(/\s+/g, '').toLowerCase()}`) || crop.name}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-700">{t(`market.cropType.${crop.type.replace(/\s+/g, '').toLowerCase()}`) || crop.type}</td>
                      <td className="px-4 py-2 text-gray-800">{crop.price}</td>
                      <td className={`px-4 py-2 font-semibold flex items-center gap-1 ${trendColors[crop.trend as keyof typeof trendColors]}`}>{crop.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}{t(`market.trend.${crop.trend}`) || (crop.trend.charAt(0).toUpperCase() + crop.trend.slice(1))}</td>
                      <td className={`px-4 py-2 font-semibold ${crop.change.trim().startsWith('+') ? 'text-green-600' : crop.change.trim().startsWith('-') ? 'text-red-600' : ''}`}>{crop.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">{t('market.topCropsDistribution')}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={crops} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(_, __, props) => t(`market.cropType.${props.payload.type.replace(/\s+/g, '').toLowerCase()}`) || props.payload.type} />
                <Bar dataKey="changeValue" isAnimationActive fill="#34d399">
                  {crops.map((crop, idx) => (
                    <Cell key={crop.name} fill={cropTypeColors[crop.type] || '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-700 mb-2">{t('market.farmSuggestions')}</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              {suggestions.map((s, idx) => (
                <li key={idx}>{t(`market.suggestion.${idx}`) || s}</li>
              ))}
            </ul>
          </div>
        </>
      )}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {t('market.infoDisclaimer1')} <span className="font-semibold">{t('market.infoDisclaimer2')}</span> {t('market.infoDisclaimer3')}
      </div>
    </div>
  );
};

export default RegionCropData; 