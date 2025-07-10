import React, { useEffect, useState } from 'react';
import { 
  Sprout, CloudRain, Bug, LineChart, Thermometer, Wind, Droplets, MapPin, 
  Bell, ArrowUpRight, ArrowDownRight, Clock, Plus, Trash2, Edit2, ChevronDown, 
  CheckCircle, AlertCircle, ChevronRight, Building2, Leaf, Crop, Sun, Droplet
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { fetchFarms } from '../store/farmSlice';
import { AppDispatch } from '../store';
import ChatBot from '../components/ChatBot/ChatBot';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'normal';
  bgColor?: string;
}

interface AlertProps {
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  time: string;
}

interface MetricProps {
  label: string;
  value: string;
  color: 'green' | 'yellow' | 'blue' | 'purple';
}

interface DecodedToken {
  _id: string;
}

interface Farm {
  _id: string;
  name: string;
  area: string;
  city: string;
}

interface FarmTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  type: 'task' | 'suggestion';
  date: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

type ColorClasses = {
  [K in MetricProps['color']]: string;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [farmError, setFarmError] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [health, setHealth] = useState({ cropHealth: 0, pestRisk: 0, waterUsage: 0, soilQuality: 0 });
  const [farmTasks, setFarmTasks] = useState<FarmTask[]>([
    {
      id: '1',
      title: 'dashboard.taskSoilTesting',
      description: 'dashboard.descSoilTesting',
      status: 'pending',
      type: 'task',
      date: '2024-03-15',
      priority: 'high',
      dueDate: '2024-03-20'
    },
    {
      id: '2',
      title: 'dashboard.taskIrrigation',
      description: 'dashboard.descIrrigation',
      status: 'completed',
      type: 'task',
      date: '2024-03-10',
      priority: 'medium',
      dueDate: '2024-03-12'
    },
    {
      id: '3',
      title: 'dashboard.taskCropRotation',
      description: 'dashboard.descCropRotation',
      status: 'pending',
      type: 'suggestion',
      date: '2024-03-14',
      priority: 'low'
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'task' as 'task' | 'suggestion',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<FarmTask | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'task' | 'suggestion'>('all');

  const dispatch = useDispatch<AppDispatch>();
  const token = localStorage.getItem('token') || '';

  const decoded = jwtDecode<DecodedToken>(token);
  const userId = decoded._id;


  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchFarmsData = async () => {
      try {
        const response = await dispatch(fetchFarms(userId));
        const farmsData = response.payload as Farm[];
        setFarms(farmsData);
        if (Array.isArray(farmsData) && farmsData.length > 0) {
          setSelectedFarm((prev) => prev || farmsData[0]);
        }
        setLoadingFarms(false);
      } catch (err) {
        setLoadingFarms(false);
        setFarmError('Failed to fetch farms');
      }
    };
    fetchFarmsData();
  }, [dispatch, userId]);

  // Fetch weather for selected farm
  useEffect(() => {
    const fetchWeather = async () => {
      if (!selectedFarm) return;
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'a9e176c3d2af243a8997f002df2ec957';
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(selectedFarm.city)}&units=metric&appid=${API_KEY}`);
        const data = await res.json();
        setWeather(data);
        if (Array.isArray(data.list)) {
          setHealth(calculateFarmHealth(data.list));
        }
      } catch {
        setWeather(null);
        setHealth({ cropHealth: 0, pestRisk: 0, waterUsage: 0, soilQuality: 0 });
      }
    };
    fetchWeather();
  }, [selectedFarm]);

  // Farm health calculation algorithm
  function calculateFarmHealth(weatherList: any[]) {
    const next24h = weatherList.slice(0, 8);
    const avgTemp = next24h.reduce((sum, w) => sum + w.main.temp, 0) / next24h.length;
    const avgHumidity = next24h.reduce((sum, w) => sum + w.main.humidity, 0) / next24h.length;
    const totalRain = next24h.reduce((sum, w) => sum + (w.rain?.['3h'] || 0), 0);
    const avgPop = next24h.reduce((sum, w) => sum + (w.pop || 0), 0) / next24h.length;
    let cropHealth = 100;
    if (avgTemp < 20 || avgTemp > 32) cropHealth -= 30;
    if (avgHumidity < 40 || avgHumidity > 70) cropHealth -= 30;
    if (totalRain > 10) cropHealth -= 10;
    cropHealth = Math.max(0, Math.min(100, cropHealth));
    let pestRisk = Math.round((avgHumidity / 100) * 50 + (totalRain > 2 ? 30 : 0) + avgPop * 20);
    pestRisk = Math.max(0, Math.min(100, pestRisk));
    let waterUsage = Math.round((avgTemp > 30 ? 60 : 30) + (totalRain < 1 ? 30 : 0));
    waterUsage = Math.max(0, Math.min(100, waterUsage));
    let soilQuality = Math.round((avgHumidity / 100) * 60 + (totalRain > 2 ? 20 : 0));
    soilQuality = Math.max(0, Math.min(100, soilQuality));
    return {
      cropHealth,
      pestRisk,
      waterUsage,
      soilQuality,
    };
  }

  // Calculate weather metrics for cards
  const next24h = weather?.list?.slice(0, 8) || [];
  const avgTemp = next24h.length ? (next24h.reduce((sum: number, w: any) => sum + w.main.temp, 0) / next24h.length) : 0;
  const avgHumidity = next24h.length ? (next24h.reduce((sum: number, w: any) => sum + w.main.humidity, 0) / next24h.length) : 0;
  const avgWind = next24h.length ? (next24h.reduce((sum: number, w: any) => sum + w.wind.speed, 0) / next24h.length) : 0;
  const totalRain = next24h.length ? (next24h.reduce((sum: number, w: any) => sum + (w.rain?.['3h'] || 0), 0)) : 0;

  const handleAddTask = () => {
    if (newTask.title.trim() && newTask.description.trim()) {
      const task: FarmTask = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        status: 'pending',
        type: newTask.type,
        date: new Date().toISOString().split('T')[0],
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined
      };
      setFarmTasks([task, ...farmTasks]);
      setNewTask({ title: '', description: '', type: 'task', priority: 'medium', dueDate: '' });
      setShowAddTask(false);
    }
  };

  const handleEditTask = (task: FarmTask) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      dueDate: task.dueDate || ''
    });
    setShowAddTask(true);
  };

  const handleUpdateTask = () => {
    if (editingTask && newTask.title.trim() && newTask.description.trim()) {
      setFarmTasks(farmTasks.map(task => 
        task.id === editingTask.id
          ? {
              ...task,
              title: newTask.title,
              description: newTask.description,
              type: newTask.type,
              priority: newTask.priority,
              dueDate: newTask.dueDate || undefined
            }
          : task
      ));
      setEditingTask(null);
      setNewTask({ title: '', description: '', type: 'task', priority: 'medium', dueDate: '' });
      setShowAddTask(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setFarmTasks(farmTasks.filter(task => task.id !== taskId));
  };

  const toggleTaskStatus = (taskId: string) => {
    setFarmTasks(farmTasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
    }
  };

  const filteredAndSortedTasks = farmTasks
    .filter(task => 
      (filterStatus === 'all' || task.status === filterStatus) &&
      (filterType === 'all' || task.type === filterType)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{t('dashboard.lastUpdated')}</span>
            </div>
          </div>
        </div>

        {/* Compact Farm Selection */}
        {loadingFarms ? (
          <div className="flex justify-center items-center h-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : farmError ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-700 text-sm sm:text-base">{farmError}</div>
        ) : Array.isArray(farms) && farms.length > 0 ? (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-700">{t('Select Farm')}</h2>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {farms.map((farm) => (
                <div
                  key={farm._id}
                  onClick={() => setSelectedFarm(farm)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                    selectedFarm?._id === farm._id
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                  }`}
                >
                  <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">{farm.name}</span>
                  <span className="text-xs sm:text-sm opacity-75">({farm.city})</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 flex items-center gap-3 text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <p>{t('No farms available. Please add a farm to get started.')}</p>
          </div>
        )}
        
        {/* Weather Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <DashboardCard
            title={t('common.temperature')}
            value={`${avgTemp.toFixed(1)}°C`}
            subtext="24h avg"
            icon={<Thermometer className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />}
            trend="normal"
            bgColor="bg-orange-50"
          />
          <DashboardCard
            title={t('common.humidity')}
            value={`${avgHumidity.toFixed(0)}%`}
            subtext="24h avg"
            icon={<Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />}
            trend="normal"
            bgColor="bg-blue-50"
          />
          <DashboardCard
            title={t('common.windSpeed')}
            value={`${avgWind.toFixed(1)} km/h`}
            subtext="24h avg"
            icon={<Wind className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-500" />}
            trend="normal"
            bgColor="bg-cyan-50"
          />
          <DashboardCard
            title="Rainfall"
            value={`${totalRain.toFixed(1)} mm`}
            subtext="24h total"
            icon={<CloudRain className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />}
            trend="normal"
            bgColor="bg-indigo-50"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Alerts and Tasks Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                {t('dashboard.activities')}
              </h2>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setNewTask({ title: '', description: '', type: 'task', priority: 'medium', dueDate: '' });
                    setShowAddTask(!showAddTask);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('dashboard.addActivity')}</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'status')}
                className="px-3 py-2 border rounded-lg text-sm sm:text-base"
              >
                <option value="date">{t('dashboard.sortByDate')}</option>
                <option value="priority">{t('dashboard.sortByPriority')}</option>
                <option value="status">{t('dashboard.sortByStatus')}</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed')}
                className="px-3 py-2 border rounded-lg text-sm sm:text-base"
              >
                <option value="all">{t('dashboard.allActivities')}</option>
                <option value="pending">{t('dashboard.pendingActivities')}</option>
                <option value="completed">{t('dashboard.completedActivities')}</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'task' | 'suggestion')}
                className="px-3 py-2 border rounded-lg text-sm sm:text-base"
              >
                <option value="all">{t('dashboard.allTypes')}</option>
                <option value="task">{t('dashboard.tasks')}</option>
                <option value="suggestion">{t('dashboard.recommendations')}</option>
              </select>
            </div>

            {showAddTask && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={t('dashboard.activityTitle')}
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  />
                  <textarea
                    placeholder={t('dashboard.activityDescription')}
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                    rows={3}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({ ...newTask, type: e.target.value as 'task' | 'suggestion' })}
                      className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                    >
                      <option value="task">{t('dashboard.task')}</option>
                      <option value="suggestion">{t('dashboard.recommendation')}</option>
                    </select>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                    >
                      <option value="low">{t('dashboard.lowPriority')}</option>
                      <option value="medium">{t('dashboard.mediumPriority')}</option>
                      <option value="high">{t('dashboard.highPriority')}</option>
                    </select>
                  </div>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddTask}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      {t('dashboard.addActivity')}
                    </button>
                    <button
                      onClick={() => setShowAddTask(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredAndSortedTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`p-1 rounded-full transition-colors ${
                              task.status === 'completed'
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <CheckCircle className={`w-5 h-5 ${task.status === 'completed' ? 'fill-current' : ''}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium text-sm sm:text-base ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {t(task.title)}
                            </h3>
                            <div className="flex items-center gap-2 text-xs sm:text-sm mt-1">
                              <span className={`${getPriorityColor(task.priority)}`}>
                                {t(`dashboard.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
                              </span>
                              {task.dueDate && (
                                <span className="text-gray-500">
                                  {t('dashboard.due')}: {task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm text-gray-500">{task.date}</span>
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                            title={t('dashboard.editActivity')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title={t('dashboard.deleteActivity')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-gray-600">{t(task.description)}</p>
                      {task.type === 'suggestion' && (
                        <div className="mt-2 text-xs text-indigo-600">
                          {t('dashboard.recommendation')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farm Health Overview */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              {t('common.farmHealth')}
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <HealthMetric
                label={t('common.cropHealth')}
                value={health.cropHealth.toString()}
                color="green"
              />
              <HealthMetric
                label={t('common.pestRisk')}
                value={health.pestRisk.toString()}
                color="yellow"
              />
              <HealthMetric
                label={t('common.waterUsage')}
                value={health.waterUsage.toString()}
                color="blue"
              />
              <HealthMetric
                label={t('common.soilQuality')}
                value={health.soilQuality.toString()}
                color="purple"
              />
            </div>
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  );
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend = 'normal',
  bgColor = 'bg-white'
}) => {
  return (
    <div className={`${bgColor} p-3 sm:p-4 lg:p-6 rounded-lg shadow transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700">{title}</h2>
        {icon}
      </div>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-gray-900">{value}</p>
      <div className="flex items-center text-xs sm:text-sm text-gray-600">
        <span>{subtext}</span>
        {trend !== 'normal' && (
          <span className={`ml-1 sm:ml-2 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
};

const Alert: React.FC<AlertProps> = (props: AlertProps) => {
  const { type, title, message, time } = props;
  const bgColor: Record<AlertProps['type'], string> = {
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
    info: 'bg-blue-50'
  };

  const textColor: Record<AlertProps['type'], string> = {
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`${bgColor[type]} p-4 rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold ${textColor[type]}`}>{title}</h3>
        <span className="text-sm text-gray-500">{time}</span>
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

const AlertItem: React.FC<AlertProps> = ({ type, title, message, time }) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getAlertStyle()}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
};

const HealthMetric: React.FC<MetricProps> = ({ label, value, color }) => {
  const getColorClass = () => {
    const colors: ColorClasses = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500'
    };
    return colors[color] || colors.green;
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className={`h-2 rounded-full ${getColorClass()}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

const Metric: React.FC<MetricProps> = (props: MetricProps) => {
  const { label, value, color } = props;
  const colorClasses: ColorClasses = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className={`${colorClasses[color]} px-3 py-1 rounded-full text-sm`}>
      {label}: {value}
    </div>
  );
};

export default Dashboard;