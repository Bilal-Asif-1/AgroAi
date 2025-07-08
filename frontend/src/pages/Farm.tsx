import { useLanguage } from '../context/LanguageContext';
import { getTranslatedCityName } from '../utils/cityTranslations';

interface FarmActivity {
  _id: string;
  type: string;
  date: string;
  description: string;
  quantity?: string;
  notes?: string;
}

interface Farm {
  _id: string;
  name: string;
  location: string;
  size: number;
  activities?: FarmActivity[];
  status?: string;
  waterStatus?: string;
  cropType?: string;
}

// Add this function to calculate pesticide usage
const calculatePesticideUsage = (activities?: FarmActivity[]) => {
  if (!activities) return [];
  
  const pestControlActivities = activities.filter(activity => 
    activity.type === 'pest_control'
  );

  const usageByPesticide = pestControlActivities.reduce((acc, activity) => {
    const pesticideName = activity.description.split(' - ')[0];
    if (!acc[pesticideName]) {
      acc[pesticideName] = {
        totalUsed: 0,
        lastUsed: activity.date,
        notes: activity.notes
      };
    }
    acc[pesticideName].totalUsed += parseInt(activity.quantity || '0');
    return acc;
  }, {} as Record<string, { totalUsed: number; lastUsed: string; notes?: string }>);

  return Object.entries(usageByPesticide).map(([name, data]) => ({
    name,
    ...data
  }));
};

const { t, language } = useLanguage();

// Update the farm card to show pesticide usage
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
      <p className="text-sm text-gray-500">{getTranslatedCityName(farm.location, language)}</p>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditFarm(farm)}
        className="p-2 text-gray-600 hover:text-gray-900"
        title={t('farm.editFarm')}
      >
        <Edit2 className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleDeleteFarm(farm)}
        className="p-2 text-red-600 hover:text-red-900"
        title={t('farm.deleteFarm')}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </div>
  
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-500">{t('farm.area')}</div>
      <div className="text-lg font-semibold text-gray-900">{farm.size} {t('farm.acres')}</div>
    </div>
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-500">{t('farm.health')}</div>
      <div className="text-lg font-semibold text-gray-900">{t(`farm.status.${farm.status?.toLowerCase()}`) || farm.status}</div>
      </div>
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-500">{t('farm.watered')}</div>
      <div className="text-lg font-semibold text-gray-900">{farm.lastWateredDate} {t(`farm.status.${farm.waterStatus?.toLowerCase()}`) || farm.waterStatus}</div>
    </div>
  </div>

  {/* Crop and Pesticides Section */}
  <div className="flex flex-row items-center flex-wrap gap-3 mb-2">
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium shadow-sm justify-center">
      <Leaf className="w-3 h-3 text-green-500" />
      {t(`crops.${farm.cropType?.toLowerCase()}`) || farm.cropType}
    </span>
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium shadow-sm justify-center">
      <Droplet className="w-3 h-3 text-blue-500" />
      {t('farm.pesticidesList')}
    </span>
  </div>

  <span className="text-sm text-gray-500 flex items-center gap-1 mb-2">
    <Calendar className="w-4 h-4" />
    {t('farm.recentActivities')}
  </span>

  {/* Add Pesticide Usage Section */}
  {farm.activities && farm.activities.length > 0 && (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{t('farm.pesticideUsage')}</h4>
      <div className="space-y-2">
        {calculatePesticideUsage(farm.activities).map((usage, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900">{usage.name}</div>
                <div className="text-sm text-gray-500">
                  {t('farm.totalUsed')}: {usage.totalUsed}
                </div>
                {usage.notes && (
                  <div className="text-xs text-gray-500 mt-1">{usage.notes}</div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {t('farm.lastUsed')}: {new Date(usage.lastUsed).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  <div className="mt-4">
    <button
      onClick={() => handleAddActivity(farm)}
      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
    >
      {t('farm.addActivity')}
    </button>
  </div>
</div> 