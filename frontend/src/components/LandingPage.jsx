import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sprout, Package, Cloud, Brain, BadgeDollarSign, GraduationCap } from 'lucide-react';

const features = [
  {
    image: '/feature1.jpg',
    icon: <LayoutDashboard className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />,
    title: "Dashboard",
    desc: "Get a quick overview of your farm's performance and key metrics.",
    details: "The Dashboard provides real-time analytics, recent activities, and a summary of your farm's health, helping you make informed decisions quickly."
  },
  {
    image: '/feature3.jpg',
    icon: <Package className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />,
    title: "Inventory",
    desc: "Track your seeds, fertilizers, and other farm supplies.",
    details: "Inventory management lets you monitor stock levels, set alerts for low supplies, and optimize your resource usage for better efficiency."
  },
  {
    image: '/feature4.jpg',
    icon: <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />,
    title: "Weather",
    desc: "Stay updated with real-time weather forecasts for your region.",
    details: "Get hyper-local weather updates, forecasts, and alerts to plan your farming activities and protect your crops from adverse conditions."
  },
  {
    image: '/feature1.jpg',
    icon: <Sprout className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />,
    title: "Farms",
    desc: "Manage your farms, crops, and field activities efficiently.",
    details: "Organize your farm plots, track crop cycles, and record all activities for each field to maximize productivity and traceability."
  },
  {
    image: '/feature7.jpg',
    icon: <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />,
    title: "Education",
    desc: "Access guides, tips, and resources to improve your farming.",
    details: "Explore a library of articles, videos, and expert advice to stay updated with the latest farming techniques and best practices."
  },
  {
    image: '/feature5.jpg',
    icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />,
    title: "Pest Control",
    desc: "AI-powered pest detection and smart control recommendations.",
    details: "Upload crop images for instant pest detection and receive tailored recommendations for safe and effective pest management."
  },
  {
    image: '/feature6.jpg',
    icon: <BadgeDollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" />,
    title: "Market",
    desc: "Check the latest market prices and trends for your crops.",
    details: "Stay ahead with real-time market data, price trends, and selling tips to maximize your profits and plan your sales."
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start p-0 overflow-x-hidden"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Logo at the top */}
      <div className="w-full flex justify-center pt-4 sm:pt-6 lg:pt-10 pb-4">
        <div className="logo-container">
          <img 
            src="/Asset 5.png" 
            alt="AgroAI Logo" 
            className="logo-img" 
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full flex flex-col items-center justify-center py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-800 mb-3 sm:mb-4 text-center leading-tight">
          Welcome to AgroAi
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-green-900 mb-6 sm:mb-8 text-center max-w-2xl px-4 leading-relaxed">
          Intelligent solutions for real farming. Harness the power of AI to boost your farm's productivity and sustainability.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-700 text-white text-lg sm:text-xl font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          Get Started
        </button>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-8 sm:mb-10 text-center px-4">
          What's included in AgroAi?
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((f, idx) => {
            const isLast = idx === features.length - 1;
            const needsCenter = features.length % 3 === 1 && isLast;
            
            return (
              <div
                key={idx}
                className={`
                  flex flex-col items-center justify-start bg-white bg-opacity-90 rounded-2xl shadow-lg 
                  min-h-[20rem] sm:min-h-[22rem] lg:min-h-[24rem] mx-auto mb-4 sm:mb-6 p-4 sm:p-6 lg:p-8 
                  border-2 border-transparent transition-all duration-300 ease-in-out 
                  hover:scale-105 hover:shadow-2xl hover:border-green-400 cursor-pointer
                  ${needsCenter ? 'lg:col-start-2' : ''}
                `}
                onClick={() => setExpanded(expanded === idx ? null : idx)}
              >
                <div className="w-full h-40 sm:h-48 lg:h-56 mb-3 sm:mb-4 overflow-hidden rounded-xl">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full h-full object-cover rounded-xl transition-all duration-300 ease-in-out hover:scale-110"
                  />
                </div>
                
                <div className="mb-2 sm:mb-3">{f.icon}</div>
                
                <div className="font-bold text-green-800 text-xl sm:text-2xl mb-1 sm:mb-2 text-center">
                  {f.title}
                </div>
                
                <div className="text-green-700 text-center text-sm sm:text-base lg:text-lg px-2 leading-relaxed">
                  {f.desc}
                </div>
                
                {/* Expandable details box */}
                {expanded === idx && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 text-sm sm:text-base shadow transition-all duration-300 w-full">
                    <div className="font-semibold mb-2">How it works:</div>
                    <div className="leading-relaxed">{f.details}</div>
                    <button
                      className="mt-3 sm:mt-4 px-3 sm:px-4 py-1 sm:py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm sm:text-base"
                      onClick={e => { e.stopPropagation(); setExpanded(null); }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 