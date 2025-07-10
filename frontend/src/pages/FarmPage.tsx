import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchFarms, deleteFarm, Farm } from '../store/farmSlice';
import { activityAPI, Activity as ApiActivity, CreateActivity } from '../services/api';
import { inventoryAPI, InventoryItem } from '../services/api';
import FarmForm from '../components/FarmForm';
import { jwtDecode } from 'jwt-decode';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sprout, MapPin, Edit2, Trash2, Plus, 
  Crop, Sun, Droplet, Clock, AlertCircle,
  CheckCircle, AlertTriangle, XCircle,
  Calendar, Droplets, Leaf, Wheat, Package,
  Filter, ChevronDown, Image, FileText, X,
  Search, ChevronRight, ChevronDown as ChevronDownIcon,
  Grid, List, ChevronUp
} from 'lucide-react';

interface DecodedToken {
  _id: string;
}

interface FarmHealth {
  status: 'good' | 'warning' | 'critical';
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

interface FarmActivity {
  id: string;
  type: 'watering' | 'planting' | 'harvesting' | 'fertilizing' | 'pest_control' | 'soil_testing';
  date: string;
  description: string;
  notes?: string;
  quantity?: string;
  unit?: string;
  imageUrl?: string;
  icon: React.ReactNode;
  color: string;
}

interface ActivityFormData {
  type: ApiActivity['type'];
  date: string;
  description: string;
  notes: string;
  quantity: string;
  unit: string;
  selectedItem: string;
}

const cropWaterRequirements: Record<string, { min: number; max: number }> = {
  Wheat: { min: 3, max: 5 },
  Maize: { min: 2, max: 4 },
  Rice: { min: 1, max: 2 },
  Potato: { min: 2, max: 3 },
  Tomato: { min: 2, max: 4 },
  Vegetables: { min: 2, max: 3 },
  Cotton: { min: 3, max: 5 },
  'Eco-Friendly / Organic': { min: 2, max: 4 }
};

function calculateWaterStatus(lastWatered: string, cropType: string): 'good' | 'needs_water' | 'overwatered' | 'pending' {
  if (!cropType || !lastWatered) return 'good';
  const lastWateredDate = new Date(lastWatered);
  const today = new Date();
  today.setHours(0,0,0,0);
  lastWateredDate.setHours(0,0,0,0);
  if (lastWateredDate > today) return 'pending';
  const diffTime = Math.abs(today.getTime() - lastWateredDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const requirements = cropWaterRequirements[cropType] || { min: 3, max: 5 };
  if (diffDays < requirements.min) return 'overwatered';
  if (diffDays > requirements.max) return 'needs_water';
  return 'good';
}

const getFarmHealth = (farm: Farm): FarmHealth => {
  // Calculate health based on meaningful factors
  // In a real app, this would come from actual farm data
  const lastActivity = getFarmActivities(farm)[0];
  const daysSinceLastActivity = lastActivity ? 
    Math.floor((new Date().getTime() - new Date(lastActivity.date).getTime()) / (1000 * 60 * 60 * 24)) : 
    0;

  // Health rules:
  // - Good: Recent activity (within 3 days) and no critical issues
  // - Warning: Activity between 3-7 days ago
  // - Critical: No activity for more than 7 days or critical issues
  if (daysSinceLastActivity <= 3) {
    return {
      status: 'good',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    };
  } else if (daysSinceLastActivity <= 7) {
    return {
      status: 'warning',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />
    };
  } else {
    return {
      status: 'critical',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: <XCircle className="w-5 h-5 text-red-600" />
    };
  }
};

const activityTypes = [
  { value: 'Planting', label: 'Planting', icon: <Leaf className="w-4 h-4" />, color: 'text-green-500' },
  { value: 'Fertilizing', label: 'Fertilizing', icon: <Package className="w-4 h-4" />, color: 'text-purple-500' },
  { value: 'Pest Control', label: 'Pest Control', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500' },
  { value: 'Irrigation', label: 'Irrigation', icon: <Droplets className="w-4 h-4" />, color: 'text-blue-500' },
  { value: 'Harvesting', label: 'Harvesting', icon: <Wheat className="w-4 h-4" />, color: 'text-amber-500' },
  { value: 'Maintenance', label: 'Maintenance', icon: <Crop className="w-4 h-4" />, color: 'text-brown-500' },
  { value: 'Other', label: 'Other', icon: <FileText className="w-4 h-4" />, color: 'text-gray-500' }
];

const getFarmActivities = (farm: Farm): FarmActivity[] => {
  // Mock data - in a real app, this would come from your backend
  const today = new Date();
  const activities: FarmActivity[] = [
    {
      id: '1',
      type: 'watering',
      date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0],
      description: 'Regular irrigation',
      notes: 'Used drip irrigation system',
      quantity: '500',
      unit: 'liters',
      icon: <Droplets className="w-4 h-4" />,
      color: 'text-blue-500'
    },
    {
      id: '2',
      type: 'planting',
      date: new Date(today.setDate(today.getDate() - 5)).toISOString().split('T')[0],
      description: 'Wheat seeds planted',
      notes: 'Used certified organic seeds',
      quantity: '50',
      unit: 'kg',
      icon: <Leaf className="w-4 h-4" />,
      color: 'text-green-500'
    },
    {
      id: '3',
      type: 'fertilizing',
      date: new Date(today.setDate(today.getDate() - 10)).toISOString().split('T')[0],
      description: 'Organic fertilizer applied',
      notes: 'Composted manure from local farm',
      quantity: '100',
      unit: 'kg',
      icon: <Package className="w-4 h-4" />,
      color: 'text-purple-500'
    },
    {
      id: '4',
      type: 'harvesting',
      date: new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0],
      description: 'Previous crop harvested',
      notes: 'Good yield this season',
      quantity: '2000',
      unit: 'kg',
      icon: <Wheat className="w-4 h-4" />,
      color: 'text-amber-500'
    }
  ];
  return activities;
};

const getWaterStatusInfo = (farm: Farm) => {
  if (!farm.waterStatus) return { text: 'Not watered', status: 'needs_water' };
  
  try {
    const waterStatus = JSON.parse(farm.waterStatus);
    const lastWateredDate = new Date(waterStatus.lastWatered);
    const today = new Date();
    today.setHours(0,0,0,0);
    lastWateredDate.setHours(0,0,0,0);
    let text = '';
    if (lastWateredDate > today) text = 'Pending';
    else {
      const diffTime = Math.abs(today.getTime() - lastWateredDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) text = 'Today';
      else if (diffDays === 1) text = 'Yesterday';
      else text = `${diffDays} days ago`;
    }
    return {
      text,
      status: waterStatus.status
    };
  } catch (error) {
    return { text: 'Not watered', status: 'needs_water' };
  }
};

// Update the Activity interface to include color and icon


interface FarmActivityItem {
  _id: string;
  farm: string;
  type: 'Planting' | 'Fertilizing' | 'Pest Control' | 'Irrigation' | 'Harvesting' | 'Maintenance' | 'Other';
  description: string;
  date: Date;
  inventoryItems: {
    item: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  user: string;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  icon: React.ReactNode;
}

const FarmPage: React.FC = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { farms, loading, error } = useSelector((state: RootState) => state.farms);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [showForm, setShowForm] = useState(false);
  const token = localStorage.getItem('token') || '';
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedFarmForActivity, setSelectedFarmForActivity] = useState<Farm | null>(null);
  const [activityFilter, setActivityFilter] = useState<FarmActivity['type'] | 'all'>('all');
  const [activityFormData, setActivityFormData] = useState<ActivityFormData>({
    type: 'Planting',
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
    quantity: '',
    unit: '',
    selectedItem: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFarms, setExpandedFarms] = useState<Set<string>>(new Set());
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [activities, setActivities] = useState<Record<string, ApiActivity[]>>({});
  const [loadingActivities, setLoadingActivities] = useState<Record<string, boolean>>({});
  const [expandedPesticides, setExpandedPesticides] = useState<Set<string>>(new Set());
  const [openPesticideList, setOpenPesticideList] = useState<string | null>(null);
  const [farmInventory, setFarmInventory] = useState<Record<string, InventoryItem[]>>({});
  const [loadingInventory, setLoadingInventory] = useState<Record<string, boolean>>({});

  const decoded = jwtDecode<DecodedToken>(token);
  const userId = decoded._id;

  // Add a ref for the pesticides popover
  const pesticidesPopoverRef = useRef<HTMLDivElement | null>(null);
  const pesticidesButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
      dispatch(fetchFarms(userId));
  }, [dispatch]);

  // Load activities for a farm
  const loadFarmActivities = async (farmId: string) => {
    try {
      setLoadingActivities(prev => ({ ...prev, [farmId]: true }));
      const response = await activityAPI.getFarmActivities(farmId);
      setActivities(prev => ({ ...prev, [farmId]: response.data }));
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoadingActivities(prev => ({ ...prev, [farmId]: false }));
    }
  };

  // Load activities when farms are loaded
  useEffect(() => {
    farms.forEach(farm => {
      if (farm._id) {
        loadFarmActivities(farm._id);
      }
    });
  }, [farms]);

  // Load inventory for a farm
  const loadFarmInventory = async (farmId: string) => {
    try {
      setLoadingInventory(prev => ({ ...prev, [farmId]: true }));
      const response = await inventoryAPI.getFarmInventory(farmId);
      setFarmInventory(prev => ({ ...prev, [farmId]: response.data }));
    } catch (error) {
      console.error('Failed to load farm inventory:', error);
    } finally {
      setLoadingInventory(prev => ({ ...prev, [farmId]: false }));
    }
  };

  // Load inventory when a farm is selected for activity
  useEffect(() => {
    if (selectedFarmForActivity?._id) {
      loadFarmInventory(selectedFarmForActivity._id);
    }
  }, [selectedFarmForActivity]);

  // Add effect to close pesticides popover on outside click
  useEffect(() => {
    if (!openPesticideList) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        pesticidesPopoverRef.current &&
        !pesticidesPopoverRef.current.contains(event.target as Node) &&
        pesticidesButtonRef.current &&
        !pesticidesButtonRef.current.contains(event.target as Node)
      ) {
        setOpenPesticideList(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPesticideList]);

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setShowForm(true);
  };

  const handleDelete = (farmId: string) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      dispatch(deleteFarm(farmId));
    }
  };

  const handleFormSuccess = () => {
    setEditingFarm(null);
    setShowForm(false);
    if (user?.id) {
      dispatch(fetchFarms(user.id));
    }
  };

  const handleAddActivity = (farm: Farm) => {
    setSelectedFarmForActivity(farm);
    setShowActivityForm(true);
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmForActivity?._id) return;

    try {
      const newActivity: CreateActivity = {
        farm: selectedFarmForActivity._id,
        type: activityFormData.type,
        description: activityFormData.description,
        date: new Date(activityFormData.date),
        inventoryItems: activityFormData.quantity ? [{
          item: activityFormData.selectedItem || '', // Use selected item
          quantity: Number(activityFormData.quantity),
          unit: activityFormData.unit
        }] : [],
        notes: activityFormData.notes
      };

      console.log('Creating activity:', newActivity);
      const response = await activityAPI.create(newActivity);
      console.log('Activity created:', response.data);

      setActivities(prev => ({
        ...prev,
        [selectedFarmForActivity._id!]: [response.data, ...(prev[selectedFarmForActivity._id!] || [])]
      }));

      setShowActivityForm(false);
      setActivityFormData({
        type: 'Planting',
        date: new Date().toISOString().split('T')[0],
        description: '',
        notes: '',
        quantity: '',
        unit: '',
        selectedItem: ''
      });
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleDeleteActivity = async (farmId: string, activityId: string) => {
    try {
      await activityAPI.updateStatus(activityId, 'Cancelled');
      setActivities(prev => ({
        ...prev,
        [farmId]: (prev[farmId] || []).filter(activity => activity._id !== activityId)
      }));
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const toggleFarmExpansion = (farmId: string) => {
    const newExpanded = new Set(expandedFarms);
    if (newExpanded.has(farmId)) {
      newExpanded.delete(farmId);
    } else {
      newExpanded.add(farmId);
    }
    setExpandedFarms(newExpanded);
  };

  const toggleActivitiesExpansion = (farmId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(farmId)) {
      newExpanded.delete(farmId);
    } else {
      newExpanded.add(farmId);
    }
    setExpandedActivities(newExpanded);
  };

  const togglePesticidesExpansion = (farmId: string) => {
    setExpandedPesticides(prev => {
      const newSet = new Set(prev);
      if (newSet.has(farmId)) newSet.delete(farmId);
      else newSet.add(farmId);
      return newSet;
    });
  };

  const handlePesticideListToggle = (farmId: string) => {
    setOpenPesticideList(prev => (prev === farmId ? null : farmId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('farm.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{t('farm.subtitle')}</p>
        </div>
        <button
            onClick={() => {
              setEditingFarm(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('farm.addFarm')}</span>
            <span className="sm:hidden">Add Farm</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <div className="relative flex-1 min-w-[200px] w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search farms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm sm:text-base"
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-green-50 text-green-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
              <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-green-50 text-green-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {showForm && (
        <FarmForm farm={editingFarm || undefined} onSuccess={handleFormSuccess} />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700 flex items-center gap-3 text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <p>{error}</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-xl text-center">
          <div className="flex flex-col items-center gap-3">
            <Sprout className="w-12 h-12 text-yellow-600" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">No Farms Found</h3>
              <p className="text-sm sm:text-base text-gray-600">Try adjusting your search or add a new farm</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {farms.map((farm) => {
            const health = getFarmHealth(farm);
            const isExpanded = expandedFarms.has(farm._id!);
            const crop = farm.pesticides ? farm.pesticides.split('\n')[0] : '';
            const pesticides = farm.pesticides ? farm.pesticides.split('\n').slice(1).filter(p => p.trim()) : [];
            const waterStatusObj = (() => {
              if (!farm.waterStatus) return { lastWatered: '', status: 'needs_water' };
              try {
                return JSON.parse(farm.waterStatus);
              } catch { return { lastWatered: '', status: 'needs_water' }; }
            })();
            return (
              <div
                key={farm._id}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  health.status === 'good' 
                    ? 'border-green-200 hover:border-green-300 bg-white' 
                    : health.status === 'warning'
                      ? 'border-yellow-200 hover:border-yellow-300 bg-white'
                      : 'border-red-200 hover:border-red-300 bg-white'
                }`}
              >
                  <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-full ${
                        health.status === 'good'
                          ? 'bg-green-100 text-green-600'
                          : health.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                      }`}>
                          <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{farm.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{farm.city}</span>
                        </p>
                      </div>
                    </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEdit(farm)}
                          className="p-1 sm:p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                      >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(farm._id!)}
                          className="p-1 sm:p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                      >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Crop and Health Status */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
                        <Crop className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900 mt-1">{farm.area}</span>
                      <span className="text-xs text-gray-500">Area</span>
                    </div>
                    <div className={`flex flex-col items-center p-2 rounded-lg ${
                      health.status === 'good'
                        ? 'bg-green-50 text-green-600'
                        : health.status === 'warning'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-red-50 text-red-600'
                    }`}>
                      {health.status === 'good' ? (
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : health.status === 'warning' ? (
                          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                        <span className="text-xs sm:text-sm font-medium mt-1">
                        {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">Health</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
                      <div className="flex items-center gap-1">
                          <Droplet className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Watered</span>
                      </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 mt-1">
                        {(() => {
                          if (!farm.waterStatus) return null;
                          try {
                            const waterStatus = JSON.parse(farm.waterStatus);
                            if (waterStatus.lastWatered) {
                              return (
                                <span className="text-xs text-gray-700">{waterStatus.lastWatered}</span>
                              );
                            }
                          } catch {}
                          return null;
                        })()}
                      </span>
                      <span className={`text-xs ${
                        getWaterStatusInfo(farm).status === 'good'
                          ? 'text-green-600'
                          : getWaterStatusInfo(farm).status === 'needs_water'
                            ? 'text-yellow-600'
                            : getWaterStatusInfo(farm).status === 'overwatered'
                              ? 'text-red-600'
                              : 'text-blue-600'
                      }`}>
                        {getWaterStatusInfo(farm).status === 'good'
                          ? 'Good'
                          : getWaterStatusInfo(farm).status === 'needs_water'
                            ? 'Needs Water'
                            : getWaterStatusInfo(farm).status === 'overwatered'
                              ? 'Overwatered'
                              : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Crop and Pesticides Section */}
                  {farm.pesticides && farm.pesticides.trim() !== '' && (
                    <div className="mt-3">
                        <div className="flex flex-row items-center justify-center flex-wrap gap-2 sm:gap-3 relative">
                        {/* Crop Badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium shadow-sm justify-center">
                          <Leaf className="w-3 h-3 text-green-500" />
                            <span className="truncate max-w-20">{farm.pesticides.split('\n')[0]}</span>
                        </span>
                        {/* Pesticides List Button */}
                        {(() => {
                          const pesticides = farm.pesticides.split('\n').slice(1).filter(p => p.trim());
                          return pesticides.length > 0 ? (
                            <div className="relative">
                              <button
                                ref={pesticidesButtonRef}
                                onClick={() => handlePesticideListToggle(farm._id!)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium shadow-sm hover:bg-blue-200 transition-colors"
                                >
                                  <Package className="w-3 h-3 text-blue-500" />
                                  <span className="hidden sm:inline">{t('farm.pesticidesList')}</span>
                                  <span className="sm:hidden">Pesticides</span>
                                  {expandedPesticides.has(farm._id!) ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                              </button>
                                
                                {/* Pesticides Dropdown */}
                                {expandedPesticides.has(farm._id!) && (
                                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                                    <div className="text-xs font-medium text-gray-700 mb-2">{t('farm.pesticidesList')}</div>
                                    <div className="space-y-1">
                                      {pesticides.map((pesticide, index) => (
                                        <div key={index} className="text-xs text-gray-600 p-1 rounded bg-gray-50">
                                          {pesticide}
                                  </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>
                            ) : null;
                        })()}
                      </div>
                    </div>
                  )}

                    {/* Expandable Activities Section */}
                  <div className="mt-3">
                        <button
                          onClick={() => toggleActivitiesExpansion(farm._id!)}
                        className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {t('farm.recentActivities')}
                        </span>
                          {expandedActivities.has(farm._id!) ? (
                          <ChevronUp className="w-4 h-4" />
                          ) : (
                          <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      
                      {expandedActivities.has(farm._id!) && (
                        <div className="mt-2 space-y-2">
                          {getFarmActivities(farm).slice(0, 3).map((activity) => (
                            <div key={activity.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <div className={`p-1 rounded-full ${activity.color} bg-opacity-10`}>
                                {activity.icon}
                    </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">{activity.description}</p>
                                <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                          ))}
                          </div>
                        )}
                      </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleAddActivity(farm)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
                      >
                        {t('farm.addActivity')}
                      </button>
                    <button
                        onClick={() => toggleFarmExpansion(farm._id!)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-xs sm:text-sm"
                      >
                        {isExpanded ? 'Less' : 'More'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          // List view implementation would go here
          <div className="space-y-4">
            {/* List view content */}
        </div>
      )}
      </div>
    </div>
  );
};

export default FarmPage; 