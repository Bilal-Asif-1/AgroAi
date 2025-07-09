import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Plus, Search, Edit2, Trash2, AlertTriangle, 
  CheckCircle, Leaf, BarChart2, Filter, Download, 
  Users, Truck, ShoppingCart, FileText, Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { inventoryAPI, InventoryItem, CreateInventoryItem } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Farm } from '../store/farmSlice';
import { supplierAPI } from '../services/api';

// Types
interface Supplier {
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

interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  status: 'pending' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
}

interface SalesRecord {
  id: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  date: string;
}

interface UsageRecord {
  id: string;
  productId: string;
  farmId: string;
  cropId: string;
  quantity: number;
  date: string;
  notes: string;
}

interface CreateInventoryItem {
  name: string;
  description: string;
  category: 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Equipment' | 'Tools' | 'Other';
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'box' | 'pack';
  price: number;
  supplier: string;
  farms: string[];
  stockLevel: number;
  minimumStockLevel: number;
}

const Inventory = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const [formData, setFormData] = useState<Partial<CreateInventoryItem>>({
    name: '',
    description: '',
    category: 'Pesticides',
    quantity: 0,
    unit: 'kg',
    price: 0,
    supplier: '',
    farms: [],
    stockLevel: 0,
    minimumStockLevel: 0
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  const farms = useSelector((state: RootState) => state.farms.farms);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);

  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', email: '', address: '' });
  const [addSupplierError, setAddSupplierError] = useState('');

  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const farmDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (farmDropdownRef.current && !farmDropdownRef.current.contains(event.target as Node)) {
        setFarmDropdownOpen(false);
      }
    }
    if (farmDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [farmDropdownOpen]);

  // Load data on component mount
  useEffect(() => {
    loadInventory();
    loadSuppliers();
    loadPurchaseOrders();
    loadSalesRecords();
    loadUsageRecords();
  }, []);

    const loadInventory = async () => {
      try {
        const response = await inventoryAPI.getAll();
      setInventory(response.data);
      } catch (error) {
        console.error('Failed to load inventory:', error);
      }
    };

  const loadSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const loadPurchaseOrders = async () => {
    // TODO: Implement purchase orders API call
  };

  const loadSalesRecords = async () => {
    // TODO: Implement sales records API call
  };

  const loadUsageRecords = async () => {
    // TODO: Implement usage records API call
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = !selectedSupplier || item.supplier === selectedSupplier;
    const matchesType = !selectedType || item.category === selectedType;
    
    return matchesSearch && matchesSupplier && matchesType;
  });

  // Check for items with low quantity
  const lowStockItems = inventory.filter(item => item.quantity < item.minimumStockLevel);

  // Calculate analytics
  const totalStockValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalSales = salesRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  const totalUsage = usageRecords.reduce((sum, record) => sum + record.quantity, 0);

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      supplier: item.supplier,
      farms: item.farms || [],
      stockLevel: item.stockLevel,
      minimumStockLevel: item.minimumStockLevel
    });
    setShowEditModal(true);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const errors: { [key: string]: string } = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.quantity) errors.quantity = 'Quantity is required';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.supplier) errors.supplier = 'Supplier is required';
    if (!formData.stockLevel) errors.stockLevel = 'Stock level is required';
    if (!formData.minimumStockLevel) errors.minimumStockLevel = 'Minimum stock level is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const newItem: CreateInventoryItem = {
        name: formData.name!,
        description: formData.description || '',
        category: formData.category!,
        quantity: Number(formData.quantity),
        unit: formData.unit!,
        price: Number(formData.price),
        supplier: formData.supplier!,
        farms: formData.farms || [],
        stockLevel: Number(formData.stockLevel),
        minimumStockLevel: Number(formData.minimumStockLevel)
      };
      
      const response = await inventoryAPI.create(newItem);
      setInventory(prev => [...prev, response.data]);
      setShowAddModal(false);
      resetForm();
      setFormErrors({});
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formData.name || !formData.quantity) return;
    
    try {
      const updatedItem: CreateInventoryItem = {
        name: formData.name,
        type: formData.type || 'Herbicide',
        quantity: Number(formData.quantity),
        unit: formData.unit || 'Liters',
        expiryDate: formData.expiryDate || '',
        manufacturer: formData.manufacturer || '',
        batchNo: formData.batchNo || '',
        safetyInfo: formData.safetyInfo || '',
        supplierId: formData.supplierId || '',
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        notes: formData.notes || ''
      };
      
      const response = await inventoryAPI.update(selectedItem._id, updatedItem);
      setInventory(prev => prev.map(item => item._id === selectedItem._id ? response.data : item));
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await inventoryAPI.delete(selectedItem._id);
      setInventory(prev => prev.filter(item => item._id !== selectedItem._id));
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Pesticides',
      quantity: 0,
      unit: 'kg',
      price: 0,
      supplier: '',
      farms: [],
      stockLevel: 0,
      minimumStockLevel: 0
    });
    setFormErrors({});
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSupplierError('');
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.email || !newSupplier.address) {
      setAddSupplierError('All fields are required');
      return;
    }
    try {
      const response = await supplierAPI.create(newSupplier);
      await loadSuppliers();
      setFormData(prev => ({ ...prev, supplierId: response.data._id }));
      setShowAddSupplierModal(false);
      setNewSupplier({ name: '', contact: '', email: '', address: '' });
    } catch (error) {
      setAddSupplierError('Failed to add supplier');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('inventory.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{t('inventory.subtitle')}</p>
        </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm sm:text-base font-medium"
        >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add New Item</span>
              <span className="sm:hidden">Add Item</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm text-sm sm:text-base font-medium"
          >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Alerts ({lowStockItems.length})</span>
              <span className="sm:hidden">Alerts</span>
          </button>
          <button
            onClick={() => {/* TODO: Implement export */}}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base font-medium"
          >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
        </button>
        </div>
      </div>

      {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Stock Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">${totalStockValue.toFixed(2)}</p>
            </div>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                <Package className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
        </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Sales</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
            </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
            </div>
          </div>
        </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Usage</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalUsage} units</p>
            </div>
              <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500" />
            </div>
          </div>
        </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-xs sm:text-sm text-gray-500">Active Suppliers</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
              <div className="bg-amber-50 p-2 sm:p-3 rounded-lg">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
                className={`px-3 sm:px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
          </nav>
        </div>

        {/* Tab Content */}
          <div className="p-3 sm:p-4">
          {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
              {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
                      placeholder="Search products..."
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <select
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier.name}>{supplier.name}</option>
                  ))}
                </select>
                <select
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Pesticides">Pesticides</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
                  </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                      className="w-full min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <input
                    type="date"
                      className="w-full min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

                {/* Products Table - Mobile Responsive */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                    <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.supplier}</div>
                            </div>
                    </div>
                  </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.category === 'Pesticides' ? 'bg-green-100 text-green-800' :
                            item.category === 'Fertilizers' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'Seeds' ? 'bg-purple-100 text-purple-800' :
                            item.category === 'Equipment' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.category}
                    </span>
                  </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                          <div className="text-xs text-gray-500">${item.price} per unit</div>
                  </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">${(item.quantity * item.price).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                          {item.quantity < item.minimumStockLevel ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              In Stock
                            </span>
                    )}
                  </td>
                        <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditItem(item)}
                                  className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                      >
                                  <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                              onClick={() => handleDeleteItem(item)}
                                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                                  <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3 p-3">
                    {filteredInventory.map((item) => (
                      <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-500" />
        </div>
                <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.supplier}</div>
                </div>
                </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                <button
                              onClick={() => handleDeleteItem(item)}
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                              <Trash2 className="w-4 h-4" />
                </button>
              </div>
          </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.category === 'Pesticides' ? 'bg-green-100 text-green-800' :
                              item.category === 'Fertilizers' ? 'bg-blue-100 text-blue-800' :
                              item.category === 'Seeds' ? 'bg-purple-100 text-purple-800' :
                              item.category === 'Equipment' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.category}
                            </span>
              </div>
                          <div className="text-right">
                            {item.quantity < item.minimumStockLevel ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                In Stock
                              </span>
                            )}
                </div>
                </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                            <div className="text-gray-900">{item.quantity} {item.unit}</div>
                            <div className="text-xs text-gray-500">${item.price} per unit</div>
                </div>
                          <div className="text-right">
                            <div className="text-gray-900 font-medium">${(item.quantity * item.price).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Total Value</div>
                </div>
                </div>
                </div>
                    ))}
                </div>
          </div>
        </div>
      )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default Inventory;