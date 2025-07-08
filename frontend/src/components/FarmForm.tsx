import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { addFarm, updateFarm, Farm } from '../store/farmSlice';
import { jwtDecode } from 'jwt-decode';
import { MapPin, Leaf, Package, Droplet } from 'lucide-react';

interface FarmFormProps {
  farm?: Farm;
  onSuccess?: () => void;
}

interface DecodedToken {
  _id: string;
  // add other fields if needed
}

const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded._id;
  } catch {
    return null;
  }
};

const cropPesticides: Record<string, string[]> = {
  Wheat: [
    'Imidacloprid (e.g., Confidor – Bayer)',
    'Lambda-Cyhalothrin (e.g., Karate – Syngenta)'
  ],
  Maize: [
    'Spinosad (e.g., Tracer – Dow)',
    'Chlorantraniliprole (e.g., Coragen – FMC)'
  ],
  Rice: [
    'Buprofezin',
    'Cartap Hydrochloride (e.g., Padan – Sandoz)'
  ],
  Potato: [
    'Thiamethoxam (e.g., Cruiser – Syngenta)',
    'Abamectin (e.g., Vertimec – Syngenta)'
  ],
  Tomato: [
    'Emamectin Benzoate (e.g., Proclaim – Syngenta)',
    'Acetamiprid (e.g., Mospilan – Nissan Chemical)'
  ],
  Vegetables: [
    'Spinetoram (e.g., Radiant – Corteva)',
    'Indoxacarb (e.g., Avaunt – FMC)'
  ],
  Cotton: [
    'Fipronil (e.g., Regent – BASF)',
    'Pyriproxyfen + Bifenthrin (e.g., Oberon Star – Bayer)'
  ],
  'Eco-Friendly / Organic': [
    'Neem Oil',
    'Bacillus thuringiensis (Bt)',
    'Spinosad (OMRI-approved)'
  ]
};
const cropOptions = Object.keys(cropPesticides);

const allCities = [
  // Major cities in Pakistan
  'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Sargodha', 'Bahawalpur', 'Sahiwal', 'Sukkur', 'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Dera Ghazi Khan',
  // Major world cities
  'New York', 'London', 'Paris', 'Tokyo', 'Beijing', 'Delhi', 'Istanbul', 'Moscow', 'Dubai', 'Sydney',
  'Berlin', 'Madrid', 'Rome', 'Toronto', 'Los Angeles', 'Chicago', 'Bangkok', 'Cairo', 'Johannesburg', 'Kuala Lumpur',
  // ...add more as needed
];

const FarmForm: React.FC<FarmFormProps> = ({ farm, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState<Farm>({
    name: '',
    area: '',
    city: '',
    user: '',
    pesticides: '',
  });
  const [cropType, setCropType] = useState('');
  const [selectedPesticides, setSelectedPesticides] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customPesticide, setCustomPesticide] = useState('');

  useEffect(() => {
    if (farm) {
      setForm({ ...farm, pesticides: farm.pesticides || '' });
      setCitySearch(farm.city || '');
      if (farm.pesticides) {
        const lines = farm.pesticides.split('\n');
        if (cropOptions.includes(lines[0])) {
          setCropType(lines[0]);
          setSelectedPesticides(lines.slice(1));
        } else {
          setSelectedPesticides(lines);
        }
      }
    }
  }, [farm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCrop = e.target.value;
    setCropType(selectedCrop);
    if (selectedCrop) {
      setSelectedPesticides(cropPesticides[selectedCrop]);
    } else {
      setSelectedPesticides([]);
    }
  };

  const handlePesticideToggle = (pesticide: string) => {
    setSelectedPesticides(prev =>
      prev.includes(pesticide)
        ? prev.filter(p => p !== pesticide)
        : [...prev, pesticide]
    );
  };

  const handleCustomPesticideAdd = () => {
    if (customPesticide.trim() && !selectedPesticides.includes(customPesticide.trim())) {
      setSelectedPesticides(prev => [...prev, customPesticide.trim()]);
      setCustomPesticide('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getUserIdFromToken();
    if (!userId) {
      alert('User not authenticated');
      return;
    }
    // Save crop type and pesticides as a string (cropType + each pesticide on a new line)
    const pesticidesString = cropType
      ? [cropType, ...selectedPesticides].join('\n')
      : selectedPesticides.join('\n');
    
    const farmData = {
      ...form,
      user: userId,
      pesticides: pesticidesString,
    };

    if (farm && farm._id) {
      await dispatch(updateFarm(farmData));
    } else {
      await dispatch(addFarm(farmData));
    }
    setForm({ name: '', area: '', city: '', user: '', pesticides: '' });
    setCropType('');
    setSelectedPesticides([]);
    setCitySearch('');
    if (onSuccess) onSuccess();
  };

  const filteredCities = citySearch
    ? allCities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-500" /> {farm ? 'Edit Farm' : 'Add Farm'}
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Leaf className="w-4 h-4 text-green-500" /> Farm Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow focus:border-green-500 focus:ring focus:ring-green-200 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Package className="w-4 h-4 text-purple-500" /> Area (acres/hectares)
            </label>
            <input
              type="text"
              name="area"
              value={form.area}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow focus:border-green-500 focus:ring focus:ring-green-200 px-3 py-2"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-500" /> City
            </label>
            <input
              type="text"
              name="city"
              value={citySearch}
              onChange={e => {
                setCitySearch(e.target.value);
                setForm({ ...form, city: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow focus:border-green-500 focus:ring focus:ring-green-200 px-3 py-2"
              placeholder="Type to search city..."
              autoComplete="off"
              required
            />
            {citySearch && filteredCities.length > 0 && showSuggestions && (
              <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto mt-1 w-full">
                {filteredCities.map(city => (
                  <li
                    key={city}
                    className="px-3 py-1 hover:bg-green-100 cursor-pointer text-sm"
                    onClick={() => {
                      setForm({ ...form, city });
                      setCitySearch(city);
                      setShowSuggestions(false);
                    }}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Package className="w-4 h-4 text-green-700" /> Pesticides Used
            </label>
            {/* Crop Type Dropdown */}
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow focus:border-green-500 focus:ring focus:ring-green-200 px-3 py-2"
              value={cropType}
              onChange={handleCropChange}
            >
              <option value="">Select Crop Type</option>
              {cropOptions.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            {/* Pesticide Checkboxes */}
            {cropType && (
              <div className="mt-2 space-y-1">
                {cropPesticides[cropType].map(pesticide => (
                  <label key={pesticide} className="flex items-center text-xs gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPesticides.includes(pesticide)}
                      onChange={() => handlePesticideToggle(pesticide)}
                    />
                    {pesticide}
                  </label>
                ))}
                {/* Custom Pesticide Input */}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-lg border-gray-300 shadow focus:border-green-500 focus:ring focus:ring-green-200 text-xs px-2 py-1"
                    placeholder="Add custom pesticide"
                    value={customPesticide}
                    onChange={e => setCustomPesticide(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                    onClick={handleCustomPesticideAdd}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            {/* Show selected pesticides */}
            {selectedPesticides.length > 0 && (
              <div className="mt-2 text-xs text-gray-700">
                <span className="font-medium">Selected:</span> {selectedPesticides.join(', ')}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={() => { if (onSuccess) onSuccess(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 font-semibold shadow"
            >
              {farm ? 'Update' : 'Add Farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmForm; 