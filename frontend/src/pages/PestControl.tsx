import React, { useState, useEffect } from 'react';
import { Bug, AlertTriangle, CheckCircle, Upload, Loader2, History, Trash2, LogIn } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

// Pest info mapping
const pestInfo: Record<string, { symptoms: string; damage: string; treatment: string }> = {
  'Aphid': {
    symptoms: 'Curled leaves, sticky residue, yellowing.',
    damage: 'Sucks sap, stunts growth, spreads viruses.',
    treatment: 'Neem oil, insecticidal soap, ladybugs.'
  },
  'Whitefly': {
    symptoms: 'White insects on leaves, yellowing.',
    damage: 'Sap loss, honeydew, sooty mold.',
    treatment: 'Yellow sticky traps, neem oil, natural predators.'
  },
  'Armyworm': {
    symptoms: 'Chewed leaves, visible caterpillars.',
    damage: 'Defoliation, reduced yield.',
    treatment: 'Handpick, Bacillus thuringiensis, spinosad.'
  },
  'Healthy': {
    symptoms: 'No visible symptoms.',
    damage: 'No damage.',
    treatment: 'No action needed.'
  }
  // Add more pests as needed
};

// Demo image outputs
const demoOutputs: Record<string, any[]> = {
  '1.jpg': [
    {
      class: 'Early Blight',
      score: 0.85,
      symptoms: 'Brown spots, yellowing',
      damage: 'Leaf tissue dies, yield loss',
      treatment: 'Remove affected leaves, use fungicide.'
    }
  ],
  '2.jpg': [
    {
      class: 'Black Spot',
      score: 0.7,
      symptoms: 'Black spots, yellowing',
      damage: 'Reduced photosynthesis, leaf drop',
      treatment: 'Prune, use fungicide.'
    }
  ],
  '3.jpg': [
    {
      class: 'Healthy',
      score: 1.0,
      symptoms: 'None',
      damage: 'None',
      treatment: 'No action needed.'
    }
  ],
  '4.jpg': [
    {
      class: 'Beetle',
      score: 0.95,
      symptoms: 'Visible insect',
      damage: 'Chewing damage',
      treatment: 'Handpick, use neem oil.'
    }
  ],
  '5.jpg': [
    {
      class: 'Severe Leaf Damage',
      score: 0.6,
      symptoms: 'Holes, heavy discoloration',
      damage: 'Extensive tissue loss',
      treatment: 'Remove leaf, check for pests, use pesticide.'
    }
  ]
};

const API_URL = 'http://localhost:5000';

const PestControl = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication (token in localStorage)
    setIsAuthenticated(!!localStorage.getItem('token'));
    // Load detection history
    const saved = localStorage.getItem('pestDetectionHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetections([]);
      setError(null);
      // Demo mode: check filename
      if (demoOutputs[file.name]) {
        setDetections(demoOutputs[file.name]);
        // Save to history
        const entry = {
          date: new Date().toISOString(),
          image: URL.createObjectURL(file),
          detections: demoOutputs[file.name]
        };
        const newHistory = [entry, ...history].slice(0, 20);
        setHistory(newHistory);
        localStorage.setItem('pestDetectionHistory', JSON.stringify(newHistory));
      }
    }
  };

  const detectPests = async () => {
    if (!selectedImage) return;
    // Demo mode: if already detected, skip API
    if (demoOutputs[selectedImage.name]) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', selectedImage);
    try {
      const response = await axios.post(`${API_URL}/api/ai/detect-pests`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      let predictions: any[] = [];
      if (response.data && typeof response.data === 'object' && 'predictions' in response.data && Array.isArray(response.data.predictions)) {
        predictions = response.data.predictions;
      }
      setDetections(predictions);
      // Save to history
      const entry = {
        date: new Date().toISOString(),
        image: previewUrl,
        detections: predictions
      };
      const newHistory = [entry, ...history].slice(0, 20); // keep last 20
      setHistory(newHistory);
      localStorage.setItem('pestDetectionHistory', JSON.stringify(newHistory));
    } catch (err) {
      setError('Detection failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = (idx: number) => {
    const newHistory = history.filter((_, i) => i !== idx);
    setHistory(newHistory);
    localStorage.setItem('pestDetectionHistory', JSON.stringify(newHistory));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LogIn className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please log in to access Pest Detection</h2>
        <p className="text-gray-600">Sign in to securely use AI pest identification and save your detection history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Pest Detection</h1>
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
          <History className="w-5 h-5" />
          <span>History</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload & Preview */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Upload or drag an image</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            {previewUrl && (
              <div className="relative">
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
              <button onClick={detectPests} disabled={loading} className="absolute bottom-2 right-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Detect Pests'}
                </button>
              </div>
            )}
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>}
              </div>
            {/* Detection Results */}
        <div className="bg-white rounded-lg shadow p-6 min-h-[300px] flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Bug className="w-6 h-6 text-red-500" /> Detection Results
          </h2>
          {detections.length === 0 && !loading && (
            <div className="text-gray-500 text-center">No pests detected yet. Upload an image to start.</div>
          )}
            {detections.length > 0 && (
            <div className="space-y-3">
              {detections.map((detection, idx) => (
                <div key={idx} className="p-4 rounded-lg border flex flex-col gap-2 bg-gray-50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-bold text-lg">{detection.class}</span>
                    <span className="ml-auto text-sm text-gray-600">Confidence: {Math.round((detection.score ?? detection.confidence ?? 0) * 100)}%</span>
                  </div>
                  <div className="text-sm text-gray-700"><b>Symptoms:</b> {detection.symptoms || pestInfo[detection.class]?.symptoms || 'N/A'}</div>
                  <div className="text-sm text-gray-700"><b>Damage:</b> {detection.damage || pestInfo[detection.class]?.damage || 'N/A'}</div>
                  <div className="text-sm text-gray-700"><b>Suggested Treatment:</b> {detection.treatment || pestInfo[detection.class]?.treatment || 'N/A'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Detection History Modal/Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button onClick={() => setShowHistory(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5" /> Detection History</h2>
            {history.length === 0 ? (
              <div className="text-gray-500 text-center">No past detections yet.</div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((entry, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex gap-3 items-center bg-gray-50">
                    <img src={entry.image} alt="Detection" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">{new Date(entry.date).toLocaleString()}</div>
                      {Array.isArray(entry.detections) && entry.detections.length === 0 ? (
                        <div className="text-green-600 font-semibold">No pests detected</div>
                      ) : (
                        <ul className="list-disc ml-4 text-sm">
                          {Array.isArray(entry.detections) && entry.detections.map((d: any, i: number) => (
                            <li key={i}><b>{d.class}</b> ({Math.round((d.score ?? d.confidence ?? 0) * 100)}%)</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button onClick={() => handleDeleteHistory(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PestControl;