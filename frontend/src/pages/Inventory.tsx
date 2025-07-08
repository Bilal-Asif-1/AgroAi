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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your pesticide inventory and track usage across farms</p>
        </div>
        <div className="flex gap-3">
        <button
          onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
            Add New Item
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-5 h-5" />
            Alerts ({lowStockItems.length})
          </button>
          <button
            onClick={() => {/* TODO: Implement export */}}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Export
        </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
              <div>
              <p className="text-sm text-gray-500">Total Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalStockValue.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsage} units</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Leaf className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium ${
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
        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier.name}>{supplier.name}</option>
                  ))}
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

              {/* Products Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditItem(item)}
                              className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                              onClick={() => handleDeleteItem(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              </div>
            </div>
          )}

          {/* Other tab contents will be implemented similarly */}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
            <form className="space-y-4" onSubmit={handleAddItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Tools">Tools</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input 
                    type="number" 
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                    min="0"
                  />
                  {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  >
                    <option value="kg">Kilograms</option>
                    <option value="g">Grams</option>
                    <option value="l">Liters</option>
                    <option value="ml">Milliliters</option>
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                  {formErrors.unit && <p className="mt-1 text-sm text-red-600">{formErrors.unit}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                    min="0"
                    step="0.01"
                  />
                  {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                    placeholder="Enter supplier name"
                  />
                  {formErrors.supplier && <p className="mt-1 text-sm text-red-600">{formErrors.supplier}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Level</label>
                  <input
                    type="number"
                    name="stockLevel"
                    value={formData.stockLevel}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                    min="0"
                  />
                  {formErrors.stockLevel && <p className="mt-1 text-sm text-red-600">{formErrors.stockLevel}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
                  <input
                    type="number"
                    name="minimumStockLevel"
                    value={formData.minimumStockLevel}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                    min="0"
                  />
                  {formErrors.minimumStockLevel && <p className="mt-1 text-sm text-red-600">{formErrors.minimumStockLevel}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Farms</label>
                <div className="mt-1 relative" ref={farmDropdownRef}>
                  <div
                    className="min-h-[38px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer flex items-center flex-wrap gap-2"
                    onClick={() => setFarmDropdownOpen(open => !open)}
                  >
                    {formData.farms && formData.farms.length > 0 ? (
                      formData.farms.map(farmId => {
                        const farm = farms.find(f => f._id === farmId);
                        return farm ? (
                          <span
                            key={farm._id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm"
                          >
                            {farm.name}
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setFormData(prev => ({
                                  ...prev,
                                  farms: prev.farms?.filter(id => id !== farm._id) || []
                                }));
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-gray-400 select-none">Select farms...</span>
                    )}
                    <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {farmDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {farms.length === 0 && (
                        <div className="px-4 py-2 text-gray-400">No farms available</div>
                      )}
                      {farms.map(farm => (
                        <label key={farm._id} className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.farms?.includes(farm._id) || false}
                            onChange={e => {
                              e.stopPropagation();
                              setFormData(prev => {
                                const selected = prev.farms || [];
                                if (e.target.checked) {
                                  return { ...prev, farms: [...selected, farm._id] };
                                } else {
                                  return { ...prev, farms: selected.filter(id => id !== farm._id) };
                                }
                              });
                            }}
                            className="mr-2"
                          />
                          {farm.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Edit Item</h2>
            <form className="space-y-4" onSubmit={handleUpdateItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="Herbicide">Herbicide</option>
                    <option value="Insecticide">Insecticide</option>
                    <option value="Fungicide">Fungicide</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input 
                    type="number" 
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  >
                    <option value="Liters">Liters</option>
                    <option value="Kg">Kilograms</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                  <input
                    type="text"
                    name="batchNo"
                    value={formData.batchNo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input 
                    type="date" 
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                    placeholder="Enter supplier name"
                  />
                  {formErrors.supplier && <p className="mt-1 text-sm text-red-600">{formErrors.supplier}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Safety Information</label>
                <textarea
                  name="safetyInfo"
                  value={formData.safetyInfo}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Item</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <b>{selectedItem.name}</b>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Supplier</h2>
            <form className="space-y-4" onSubmit={handleAddSupplier}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier(s => ({ ...s, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact</label>
                <input
                  type="text"
                  value={newSupplier.contact}
                  onChange={e => setNewSupplier(s => ({ ...s, contact: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={e => setNewSupplier(s => ({ ...s, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={e => setNewSupplier(s => ({ ...s, address: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              {addSupplierError && <p className="text-red-600 text-sm">{addSupplierError}</p>}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSupplierModal(false);
                    setAddSupplierError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;