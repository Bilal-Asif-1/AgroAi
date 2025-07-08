import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchFarms, deleteFarm, Farm } from '../store/farmSlice';
import { activityAPI, Activity, CreateActivity } from '../services/api';
import { inventoryAPI, InventoryItem } from '../services/api';
import FarmForm from '../components/FarmForm';
import { jwtDecode } from 'jwt-decode';
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
  type: Activity['type'];
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
interface Activity {
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
  const [activities, setActivities] = useState<Record<string, Activity[]>>({});
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
          <p className="text-gray-600 mt-1">Manage your farm locations and details</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          onClick={() => { setEditingFarm(null); setShowForm(true); }}
        >
          <Plus className="w-5 h-5" />
          Add Farm
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search farms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
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
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-green-50 text-green-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-5 h-5" />
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
        <div className="bg-red-50 p-4 rounded-lg text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-xl text-center">
          <div className="flex flex-col items-center gap-3">
            <Sprout className="w-12 h-12 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-900">No Farms Found</h3>
            <p className="text-gray-600">Try adjusting your search or add a new farm</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        health.status === 'good'
                          ? 'bg-green-100 text-green-600'
                          : health.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                      }`}>
                        <Sprout className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{farm.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {farm.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(farm)}
                        className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(farm._id!)}
                        className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Crop and Health Status */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
                      <Crop className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900 mt-1">{farm.area}</span>
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
                        <CheckCircle className="w-4 h-4" />
                      ) : health.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium mt-1">
                        {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">Health</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50">
                      <div className="flex items-center gap-1">
                        <Droplet className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Watered</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 mt-1">
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
                      <div className="flex flex-row items-center justify-center flex-wrap gap-3 relative">
                        {/* Crop Badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium shadow-sm justify-center">
                          <Leaf className="w-3 h-3 text-green-500" />
                          {farm.pesticides.split('\n')[0]}
                        </span>
                        {/* Pesticides List Button */}
                        {(() => {
                          const pesticides = farm.pesticides.split('\n').slice(1).filter(p => p.trim());
                          return pesticides.length > 0 ? (
                            <div className="relative">
                              <button
                                ref={pesticidesButtonRef}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium shadow-sm justify-center hover:bg-blue-200 transition"
                                onClick={() => handlePesticideListToggle(farm._id!)}
                              >
                                <Package className="w-3 h-3 text-blue-400" />
                                Pesticides List
                              </button>
                              {openPesticideList === farm._id! && (
                                <div
                                  ref={pesticidesPopoverRef}
                                  className="absolute left-0 mt-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px] max-w-xs"
                                >
                                  <div className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1">
                                    <Package className="w-3 h-3 text-blue-400" /> Pesticides Used
                                  </div>
                                  <ul className="list-disc ml-5 text-xs text-gray-700">
                                    {pesticides.map((p, i) => (
                                      <li key={i}>{p}</li>
                                    ))}
                                  </ul>
                                  <button
                                    className="mt-2 text-xs text-blue-600 hover:underline"
                                    onClick={() => setOpenPesticideList(null)}
                                  >
                                    Close
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No pesticides</span>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Recent Activities */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Recent Activities
                      </span>
                      <button
                        onClick={() => handleAddActivity(farm)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-medium shadow hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Activity
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {(activities[farm._id!] || []).slice(0, expandedActivities.has(farm._id!) ? undefined : 2).map((activity) => (
                        <div key={activity._id} className="flex items-start gap-2 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className={`p-1 rounded-full ${activity.type === 'Planting' ? 'bg-green-100' : 
                            activity.type === 'Fertilizing' ? 'bg-purple-100' :
                            activity.type === 'Pest Control' ? 'bg-red-100' :
                            activity.type === 'Irrigation' ? 'bg-blue-100' :
                            activity.type === 'Harvesting' ? 'bg-amber-100' :
                            activity.type === 'Maintenance' ? 'bg-brown-100' : 'bg-gray-100'} bg-opacity-10`}>
                            {activity.type === 'Planting' ? <Leaf className="w-4 h-4" /> :
                              activity.type === 'Fertilizing' ? <Package className="w-4 h-4" /> :
                              activity.type === 'Pest Control' ? <AlertTriangle className="w-4 h-4" /> :
                              activity.type === 'Irrigation' ? <Droplets className="w-4 h-4" /> :
                              activity.type === 'Harvesting' ? <Wheat className="w-4 h-4" /> :
                              activity.type === 'Maintenance' ? <Crop className="w-4 h-4" /> :
                              <FileText className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-900 truncate">{activity.description}</span>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {new Date(activity.date).toLocaleDateString()}
                              </span>
                            </div>
                            {activity.notes && (
                              <div className="mt-0.5 text-xs text-gray-600 flex items-start gap-1">
                                <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span className="truncate">{activity.notes}</span>
                              </div>
                            )}
                            {activity.inventoryItems.length > 0 && (
                              <div className="mt-0.5 text-xs text-gray-600">
                                Used: {activity.inventoryItems.map(item => 
                                  `${item.quantity} ${item.unit}`
                                ).join(', ')}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteActivity(farm._id!, activity._id)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-600"
                            title="Delete Activity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(activities[farm._id!] || []).length > 2 && (
                        <button
                          onClick={() => toggleActivitiesExpansion(farm._id!)}
                          className="w-full flex items-center justify-center gap-1 p-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        >
                          {expandedActivities.has(farm._id!) ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Show All Activities ({activities[farm._id!].length})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
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
                className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
                  health.status === 'good' 
                    ? 'border-green-200 hover:border-green-300 bg-white' 
                    : health.status === 'warning'
                      ? 'border-yellow-200 hover:border-yellow-300 bg-white'
                      : 'border-red-200 hover:border-red-300 bg-white'
                }`}
              >
                <div className="p-3 flex flex-col md:flex-row md:items-center md:gap-6 gap-2">
                  {/* Main Info Row */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
                    {/* Farm Name */}
                    <span className="font-bold text-lg text-gray-900 mr-2 min-w-[100px]">{farm.name}</span>
                    {/* Crop Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium shadow-sm justify-center">
                      <Leaf className="w-3 h-3 text-green-500" />
                      {crop}
                    </span>
                    {/* Pesticides List Button */}
                    {pesticides.length > 0 && (
                      <div className="relative">
                        <button
                          ref={pesticidesButtonRef}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium shadow-sm justify-center hover:bg-blue-200 transition"
                          onClick={() => handlePesticideListToggle(farm._id!)}
                        >
                          <Package className="w-3 h-3 text-blue-400" />
                          Pesticides List
                        </button>
                        {openPesticideList === farm._id! && (
                          <div
                            ref={pesticidesPopoverRef}
                            className="absolute left-0 mt-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px] max-w-xs"
                          >
                            <div className="font-semibold text-xs text-gray-700 mb-2 flex items-center gap-1">
                              <Package className="w-3 h-3 text-blue-400" /> Pesticides Used
                            </div>
                            <ul className="list-disc ml-5 text-xs text-gray-700">
                              {pesticides.map((p, i) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                            <button
                              className="mt-2 text-xs text-blue-600 hover:underline"
                              onClick={() => setOpenPesticideList(null)}
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Water Status */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">Watered</span>
                      <span className="text-xs text-gray-700 ml-1">{waterStatusObj.lastWatered}</span>
                      <span className={`text-xs ml-2 ${
                        waterStatusObj.status === 'good'
                          ? 'text-green-600'
                          : waterStatusObj.status === 'needs_water'
                            ? 'text-yellow-600'
                            : waterStatusObj.status === 'overwatered'
                              ? 'text-red-600'
                              : 'text-blue-600'
                      }`}>
                        {waterStatusObj.status === 'good'
                          ? 'Good'
                          : waterStatusObj.status === 'needs_water'
                            ? 'Needs Water'
                            : waterStatusObj.status === 'overwatered'
                              ? 'Overwatered'
                              : 'Pending'}
                      </span>
                    </div>
                    {/* Area */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50">
                      <Crop className="w-4 h-4 text-gray-600" />
                      <span className="text-xs text-gray-900 font-medium">{farm.area}</span>
                      <span className="text-xs text-gray-500 ml-1">Area</span>
                    </div>
                    {/* Health Status */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                        health.status === 'good'
                          ? 'bg-green-50 text-green-600'
                          : health.status === 'warning'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-600'
                      }`}>
                      {health.status === 'good' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : health.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium ml-1">
                        {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                      </span>
                    </div>
                    {/* Recent Activities Count */}
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-900 font-medium">{(activities[farm._id!] || []).length}</span>
                      <span className="text-xs text-gray-500 ml-1">Activities</span>
                    </div>
                  </div>
                  {/* Expand/Collapse Button */}
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => toggleFarmExpansion(farm._id!)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    <button
                      onClick={() => handleEdit(farm)}
                      className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(farm._id!)}
                      className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Expanded Details */}
                  {isExpanded && (
                  <div className="mt-3 border-t pt-3">
                    {/* All Activities */}
                    <div className="mb-2">
                      <div className="font-semibold text-xs text-gray-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" /> All Activities
                      </div>
                      <div className="space-y-1.5">
                        {(activities[farm._id!] || []).map((activity) => (
                          <div key={activity._id} className="flex items-start gap-2 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className={`p-1 rounded-full ${activity.type === 'Planting' ? 'bg-green-100' : 
                              activity.type === 'Fertilizing' ? 'bg-purple-100' :
                              activity.type === 'Pest Control' ? 'bg-red-100' :
                              activity.type === 'Irrigation' ? 'bg-blue-100' :
                              activity.type === 'Harvesting' ? 'bg-amber-100' :
                              activity.type === 'Maintenance' ? 'bg-brown-100' : 'bg-gray-100'} bg-opacity-10`}>
                              {activity.type === 'Planting' ? <Leaf className="w-4 h-4" /> :
                                activity.type === 'Fertilizing' ? <Package className="w-4 h-4" /> :
                                activity.type === 'Pest Control' ? <AlertTriangle className="w-4 h-4" /> :
                                activity.type === 'Irrigation' ? <Droplets className="w-4 h-4" /> :
                                activity.type === 'Harvesting' ? <Wheat className="w-4 h-4" /> :
                                activity.type === 'Maintenance' ? <Crop className="w-4 h-4" /> :
                                <FileText className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-900 truncate">{activity.description}</span>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {new Date(activity.date).toLocaleDateString()}
                                </span>
                              </div>
                              {activity.notes && (
                                <div className="mt-0.5 text-xs text-gray-600 flex items-start gap-1">
                                  <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span className="truncate">{activity.notes}</span>
                                </div>
                              )}
                              {activity.inventoryItems.length > 0 && (
                                <div className="mt-0.5 text-xs text-gray-600">
                                  Used: {activity.inventoryItems.map(item => 
                                    `${item.quantity} ${item.unit}`
                                  ).join(', ')}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteActivity(farm._id!, activity._id)}
                              className="ml-2 p-1 text-gray-400 hover:text-red-600"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* All Pesticides */}
                    {pesticides.length > 0 && (
                      <div className="mb-2">
                        <div className="font-semibold text-xs text-gray-700 mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3 text-blue-400" /> All Pesticides
                        </div>
                        <ul className="list-disc ml-5 text-xs text-gray-700">
                          {pesticides.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                    </div>
                  )}
                </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Form Modal */}
      {showActivityForm && selectedFarmForActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Activity for {selectedFarmForActivity.name}</h3>
              <button
                onClick={() => setShowActivityForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Activity Type</label>
                  <select
                    value={activityFormData.type}
                    onChange={(e) => setActivityFormData(prev => ({ ...prev, type: e.target.value as Activity['type'] }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                  >
                    {activityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={activityFormData.date}
                    onChange={(e) => setActivityFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  value={activityFormData.description}
                  onChange={(e) => setActivityFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What was done?"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Inventory Item</label>
                <select
                  value={activityFormData.selectedItem}
                  onChange={(e) => setActivityFormData(prev => ({ ...prev, selectedItem: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="">Select an item</option>
                  {farmInventory[selectedFarmForActivity._id!]?.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                  <input
                    type="text"
                    value={activityFormData.quantity}
                    onChange={(e) => setActivityFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Amount"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Unit</label>
                  <input
                    type="text"
                    value={activityFormData.unit}
                    onChange={(e) => setActivityFormData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="kg, liters, etc."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Notes</label>
                <textarea
                  value={activityFormData.notes}
                  onChange={(e) => setActivityFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowActivityForm(false)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmPage; 