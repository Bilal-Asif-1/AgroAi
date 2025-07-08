import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Supplier {
  _id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateSupplier {
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface CreateInventoryItem {
  name: string;
  description?: string;
  category: 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Equipment' | 'Tools' | 'Other';
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'box' | 'pack';
  price: number;
  supplier: string;
  farms?: string[];
  stockLevel: number;
  minimumStockLevel: number;
  lastRestocked?: Date;
}

export interface InventoryItem extends CreateInventoryItem {
  _id: string;
  user: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivity {
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
}

export interface Activity extends CreateActivity {
  _id: string;
  user: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export const authAPI = {
  login: (email: string, password: string) => 
    api.post<{ user: { _id: string; name: string; email: string }; token: string }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => 
    api.post<{ user: { _id: string; name: string; email: string }; token: string }>('/auth/register', { name, email, password }),
};

export const inventoryAPI = {
  getAll: () => api.get<InventoryItem[]>('/inventory'),
  getFarmInventory: (farmId: string) => api.get<InventoryItem[]>(`/inventory/farm/${farmId}`),
  create: (data: CreateInventoryItem) => api.post<InventoryItem>('/inventory', data),
  update: (id: string, data: Partial<CreateInventoryItem>) => api.put<InventoryItem>(`/inventory/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/inventory/${id}`),
};

export const supplierAPI = {
  getAll: () => api.get<Supplier[]>('/suppliers'),
  create: (data: CreateSupplier) => api.post<Supplier>('/suppliers', data),
  update: (id: string, data: Partial<CreateSupplier>) => api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/suppliers/${id}`),
};

export const activityAPI = {
  create: (data: CreateActivity) => api.post<Activity>('/activities', data),
  getFarmActivities: (farmId: string) => api.get<Activity[]>(`/activities/farm/${farmId}`),
  updateStatus: (activityId: string, status: Activity['status']) => 
    api.patch<Activity>(`/activities/${activityId}/status`, { status }),
  getDetails: (activityId: string) => api.get<Activity>(`/activities/${activityId}`),
};

export default api; 