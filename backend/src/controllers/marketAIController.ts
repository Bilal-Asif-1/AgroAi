import { Request, Response } from 'express';

const parseChangeValue = (change: string): number => {
  const match = change.match(/([+-]?\d+\.?\d*)/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return change.trim().startsWith('-') ? -Math.abs(value) : Math.abs(value);
};

const demoCropsByRegion: Record<string, { name: string; type: string; price: string; trend: 'up' | 'down'; change: string; marketIndex: number; changeValue: number }[]> = {
  'South Asia': [
    { name: 'Rice', type: 'Grain', price: '$320/ton', trend: 'up', change: '+2.1%', marketIndex: 320, changeValue: 2.1 },
    { name: 'Wheat', type: 'Grain', price: '$280/ton', trend: 'down', change: '-1.3%', marketIndex: 280, changeValue: -1.3 },
    { name: 'Sugarcane', type: 'Cash Crop', price: '$40/ton', trend: 'up', change: '+0.8%', marketIndex: 40, changeValue: 0.8 },
    { name: 'Cotton', type: 'Fiber', price: '$1.60/kg', trend: 'down', change: '-0.5%', marketIndex: 160, changeValue: -0.5 },
    { name: 'Maize', type: 'Grain', price: '$210/ton', trend: 'up', change: '+1.7%', marketIndex: 210, changeValue: 1.7 },
    { name: 'Millets', type: 'Grain', price: '$190/ton', trend: 'up', change: '+0.9%', marketIndex: 190, changeValue: 0.9 },
    { name: 'Pulses', type: 'Legume', price: '$650/ton', trend: 'down', change: '-2.0%', marketIndex: 650, changeValue: -2.0 },
    { name: 'Tea', type: 'Beverage', price: '$2.80/kg', trend: 'up', change: '+1.2%', marketIndex: 280, changeValue: 1.2 },
    { name: 'Jute', type: 'Fiber', price: '$0.45/kg', trend: 'down', change: '-0.7%', marketIndex: 45, changeValue: -0.7 },
    { name: 'Barley', type: 'Grain', price: '$230/ton', trend: 'up', change: '+0.5%', marketIndex: 230, changeValue: 0.5 },
  ],
  'North America': [
    { name: 'Corn', type: 'Grain', price: '$250/ton', trend: 'up', change: '+1.5%', marketIndex: 250, changeValue: 1.5 },
    { name: 'Soybeans', type: 'Legume', price: '$520/ton', trend: 'down', change: '-0.8%', marketIndex: 520, changeValue: -0.8 },
    { name: 'Wheat', type: 'Grain', price: '$300/ton', trend: 'up', change: '+0.9%', marketIndex: 300, changeValue: 0.9 },
    { name: 'Cotton', type: 'Fiber', price: '$1.75/kg', trend: 'down', change: '-1.1%', marketIndex: 175, changeValue: -1.1 },
    { name: 'Sorghum', type: 'Grain', price: '$210/ton', trend: 'up', change: '+2.3%', marketIndex: 210, changeValue: 2.3 },
    { name: 'Barley', type: 'Grain', price: '$240/ton', trend: 'down', change: '-0.6%', marketIndex: 240, changeValue: -0.6 },
    { name: 'Oats', type: 'Grain', price: '$180/ton', trend: 'up', change: '+1.0%', marketIndex: 180, changeValue: 1.0 },
    { name: 'Rice', type: 'Grain', price: '$340/ton', trend: 'up', change: '+0.7%', marketIndex: 340, changeValue: 0.7 },
    { name: 'Peanuts', type: 'Legume', price: '$1.20/kg', trend: 'down', change: '-0.4%', marketIndex: 120, changeValue: -0.4 },
    { name: 'Sunflower', type: 'Oilseed', price: '$420/ton', trend: 'up', change: '+1.8%', marketIndex: 420, changeValue: 1.8 },
  ],
  'Africa': [
    { name: 'Maize', type: 'Grain', price: '$200/ton', trend: 'up', change: '+2.0%', marketIndex: 200, changeValue: 2.0 },
    { name: 'Cassava', type: 'Root', price: '$90/ton', trend: 'down', change: '-0.9%', marketIndex: 90, changeValue: -0.9 },
    { name: 'Yams', type: 'Root', price: '$110/ton', trend: 'up', change: '+1.1%', marketIndex: 110, changeValue: 1.1 },
    { name: 'Sorghum', type: 'Grain', price: '$180/ton', trend: 'up', change: '+0.6%', marketIndex: 180, changeValue: 0.6 },
    { name: 'Millets', type: 'Grain', price: '$170/ton', trend: 'down', change: '-0.5%', marketIndex: 170, changeValue: -0.5 },
    { name: 'Rice', type: 'Grain', price: '$310/ton', trend: 'up', change: '+1.3%', marketIndex: 310, changeValue: 1.3 },
    { name: 'Wheat', type: 'Grain', price: '$270/ton', trend: 'down', change: '-1.2%', marketIndex: 270, changeValue: -1.2 },
    { name: 'Sugarcane', type: 'Cash Crop', price: '$38/ton', trend: 'up', change: '+0.4%', marketIndex: 38, changeValue: 0.4 },
    { name: 'Coffee', type: 'Beverage', price: '$3.10/kg', trend: 'up', change: '+2.2%', marketIndex: 310, changeValue: 2.2 },
    { name: 'Cocoa', type: 'Beverage', price: '$2.50/kg', trend: 'down', change: '-0.7%', marketIndex: 250, changeValue: -0.7 },
  ],
  'Europe': [
    { name: 'Wheat', type: 'Grain', price: '$320/ton', trend: 'up', change: '+1.2%', marketIndex: 320, changeValue: 1.2 },
    { name: 'Barley', type: 'Grain', price: '$250/ton', trend: 'down', change: '-0.8%', marketIndex: 250, changeValue: -0.8 },
    { name: 'Oats', type: 'Grain', price: '$200/ton', trend: 'up', change: '+0.6%', marketIndex: 200, changeValue: 0.6 },
    { name: 'Rye', type: 'Grain', price: '$210/ton', trend: 'up', change: '+0.9%', marketIndex: 210, changeValue: 0.9 },
    { name: 'Potatoes', type: 'Root', price: '$90/ton', trend: 'down', change: '-1.0%', marketIndex: 90, changeValue: -1.0 },
    { name: 'Sugar Beet', type: 'Root', price: '$45/ton', trend: 'up', change: '+0.3%', marketIndex: 45, changeValue: 0.3 },
    { name: 'Maize', type: 'Grain', price: '$230/ton', trend: 'up', change: '+1.4%', marketIndex: 230, changeValue: 1.4 },
    { name: 'Rapeseed', type: 'Oilseed', price: '$410/ton', trend: 'down', change: '-0.5%', marketIndex: 410, changeValue: -0.5 },
    { name: 'Sunflower', type: 'Oilseed', price: '$430/ton', trend: 'up', change: '+1.7%', marketIndex: 430, changeValue: 1.7 },
    { name: 'Grapes', type: 'Fruit', price: '$1.80/kg', trend: 'down', change: '-0.6%', marketIndex: 180, changeValue: -0.6 },
  ],
  'South America': [
    { name: 'Soybeans', type: 'Legume', price: '$500/ton', trend: 'up', change: '+2.0%', marketIndex: 500, changeValue: 2.0 },
    { name: 'Coffee', type: 'Beverage', price: '$3.20/kg', trend: 'down', change: '-0.9%', marketIndex: 320, changeValue: -0.9 },
    { name: 'Sugarcane', type: 'Cash Crop', price: '$42/ton', trend: 'up', change: '+0.7%', marketIndex: 42, changeValue: 0.7 },
    { name: 'Maize', type: 'Grain', price: '$220/ton', trend: 'up', change: '+1.1%', marketIndex: 220, changeValue: 1.1 },
    { name: 'Wheat', type: 'Grain', price: '$290/ton', trend: 'down', change: '-1.4%', marketIndex: 290, changeValue: -1.4 },
    { name: 'Rice', type: 'Grain', price: '$330/ton', trend: 'up', change: '+0.8%', marketIndex: 330, changeValue: 0.8 },
    { name: 'Barley', type: 'Grain', price: '$210/ton', trend: 'down', change: '-0.6%', marketIndex: 210, changeValue: -0.6 },
    { name: 'Cotton', type: 'Fiber', price: '$1.65/kg', trend: 'up', change: '+0.5%', marketIndex: 165, changeValue: 0.5 },
    { name: 'Cocoa', type: 'Beverage', price: '$2.60/kg', trend: 'down', change: '-0.7%', marketIndex: 260, changeValue: -0.7 },
    { name: 'Banana', type: 'Fruit', price: '$0.35/kg', trend: 'up', change: '+1.3%', marketIndex: 35, changeValue: 1.3 },
  ],
  'Australia': [
    { name: 'Wheat', type: 'Grain', price: '$310/ton', trend: 'up', change: '+1.0%', marketIndex: 310, changeValue: 1.0 },
    { name: 'Barley', type: 'Grain', price: '$240/ton', trend: 'down', change: '-0.7%', marketIndex: 240, changeValue: -0.7 },
    { name: 'Canola', type: 'Oilseed', price: '$420/ton', trend: 'up', change: '+1.5%', marketIndex: 420, changeValue: 1.5 },
    { name: 'Lentils', type: 'Legume', price: '$600/ton', trend: 'down', change: '-0.8%', marketIndex: 600, changeValue: -0.8 },
    { name: 'Chickpeas', type: 'Legume', price: '$650/ton', trend: 'up', change: '+2.2%', marketIndex: 650, changeValue: 2.2 },
    { name: 'Oats', type: 'Grain', price: '$190/ton', trend: 'up', change: '+0.6%', marketIndex: 190, changeValue: 0.6 },
    { name: 'Sorghum', type: 'Grain', price: '$210/ton', trend: 'down', change: '-0.5%', marketIndex: 210, changeValue: -0.5 },
    { name: 'Cotton', type: 'Fiber', price: '$1.70/kg', trend: 'up', change: '+0.9%', marketIndex: 170, changeValue: 0.9 },
    { name: 'Sugarcane', type: 'Cash Crop', price: '$39/ton', trend: 'down', change: '-0.4%', marketIndex: 39, changeValue: -0.4 },
    { name: 'Grapes', type: 'Fruit', price: '$1.90/kg', trend: 'up', change: '+1.1%', marketIndex: 190, changeValue: 1.1 },
  ],
  'East Asia': [
    { name: 'Rice', type: 'Grain', price: '$340/ton', trend: 'up', change: '+1.4%', marketIndex: 340, changeValue: 1.4 },
    { name: 'Wheat', type: 'Grain', price: '$295/ton', trend: 'down', change: '-0.6%', marketIndex: 295, changeValue: -0.6 },
    { name: 'Soybeans', type: 'Legume', price: '$510/ton', trend: 'up', change: '+1.9%', marketIndex: 510, changeValue: 1.9 },
    { name: 'Barley', type: 'Grain', price: '$220/ton', trend: 'down', change: '-0.7%', marketIndex: 220, changeValue: -0.7 },
    { name: 'Corn', type: 'Grain', price: '$260/ton', trend: 'up', change: '+1.2%', marketIndex: 260, changeValue: 1.2 },
    { name: 'Tea', type: 'Beverage', price: '$2.90/kg', trend: 'up', change: '+0.8%', marketIndex: 290, changeValue: 0.8 },
    { name: 'Cotton', type: 'Fiber', price: '$1.60/kg', trend: 'down', change: '-0.5%', marketIndex: 160, changeValue: -0.5 },
    { name: 'Sweet Potato', type: 'Root', price: '$120/ton', trend: 'up', change: '+1.0%', marketIndex: 120, changeValue: 1.0 },
    { name: 'Peanuts', type: 'Legume', price: '$1.10/kg', trend: 'up', change: '+0.6%', marketIndex: 110, changeValue: 0.6 },
    { name: 'Millets', type: 'Grain', price: '$180/ton', trend: 'down', change: '-0.4%', marketIndex: 180, changeValue: -0.4 },
  ],
  'Middle East': [
    { name: 'Wheat', type: 'Grain', price: '$305/ton', trend: 'up', change: '+1.3%', marketIndex: 305, changeValue: 1.3 },
    { name: 'Barley', type: 'Grain', price: '$235/ton', trend: 'down', change: '-0.7%', marketIndex: 235, changeValue: -0.7 },
    { name: 'Dates', type: 'Fruit', price: '$1.50/kg', trend: 'up', change: '+2.0%', marketIndex: 150, changeValue: 2.0 },
    { name: 'Olives', type: 'Fruit', price: '$2.10/kg', trend: 'down', change: '-0.5%', marketIndex: 210, changeValue: -0.5 },
    { name: 'Citrus', type: 'Fruit', price: '$0.80/kg', trend: 'up', change: '+1.1%', marketIndex: 80, changeValue: 1.1 },
    { name: 'Grapes', type: 'Fruit', price: '$1.70/kg', trend: 'down', change: '-0.6%', marketIndex: 170, changeValue: -0.6 },
    { name: 'Tomatoes', type: 'Vegetable', price: '$0.60/kg', trend: 'up', change: '+0.9%', marketIndex: 60, changeValue: 0.9 },
    { name: 'Cucumbers', type: 'Vegetable', price: '$0.55/kg', trend: 'down', change: '-0.3%', marketIndex: 55, changeValue: -0.3 },
    { name: 'Onions', type: 'Vegetable', price: '$0.40/kg', trend: 'up', change: '+0.7%', marketIndex: 40, changeValue: 0.7 },
    { name: 'Pistachios', type: 'Nut', price: '$8.00/kg', trend: 'up', change: '+1.5%', marketIndex: 800, changeValue: 1.5 },
  ],
};

const demoSuggestionsByRegion: Record<string, string[]> = {
  'South Asia': [
    'Rotate rice and wheat to maintain soil fertility.',
    'Monitor for pests during the monsoon season.',
    'Consider drip irrigation for sugarcane fields.',
  ],
  'North America': [
    'Scout for corn rootworm in maize fields.',
    'Plant cover crops after soybean harvest.',
    'Monitor cotton for bollworm infestations.',
  ],
  'Africa': [
    'Practice intercropping maize and legumes.',
    'Store yams in cool, dry places to prevent rot.',
    'Watch for armyworm outbreaks in sorghum.',
  ],
  'Europe': [
    'Rotate grains with root crops for better yields.',
    'Monitor potatoes for late blight.',
    'Use certified seeds for oilseed crops.',
  ],
  'South America': [
    'Scout for soybean rust in wet conditions.',
    'Harvest coffee cherries at peak ripeness.',
    'Apply organic mulch to banana plantations.',
  ],
  'Australia': [
    'Monitor wheat for rust diseases.',
    'Use minimum tillage for lentils and chickpeas.',
    'Irrigate grapes during dry spells.',
  ],
  'East Asia': [
    'Flood rice paddies at transplanting.',
    'Rotate soybeans with grains for soil health.',
    'Prune tea bushes after harvest.',
  ],
  'Middle East': [
    'Irrigate olive trees deeply but infrequently.',
    'Harvest dates when fully ripe.',
    'Use drip irrigation for vegetable crops.',
  ],
};

export const getAICropData = async (req: Request, res: Response) => {
  const region = req.query.region as string;
  const crops = demoCropsByRegion[region] || [];
  const suggestions = demoSuggestionsByRegion[region] || [];
  res.json({ crops, suggestions });
}; 