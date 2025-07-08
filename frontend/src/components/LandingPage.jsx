import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sprout, Package, Cloud, Brain, BadgeDollarSign, GraduationCap } from 'lucide-react';

const features = [
  {
    image: '/feature1.jpg',
    icon: <LayoutDashboard className="w-10 h-10 text-green-700" />,
    title: "Dashboard",
    desc: "Get a quick overview of your farm's performance and key metrics.",
    details: "The Dashboard provides real-time analytics, recent activities, and a summary of your farm's health, helping you make informed decisions quickly."
  },
  {
    image: '/feature3.jpg',
    icon: <Package className="w-10 h-10 text-green-700" />,
    title: "Inventory",
    desc: "Track your seeds, fertilizers, and other farm supplies.",
    details: "Inventory management lets you monitor stock levels, set alerts for low supplies, and optimize your resource usage for better efficiency."
  },
  {
    image: '/feature4.jpg',
    icon: <Cloud className="w-10 h-10 text-green-700" />,
    title: "Weather",
    desc: "Stay updated with real-time weather forecasts for your region.",
    details: "Get hyper-local weather updates, forecasts, and alerts to plan your farming activities and protect your crops from adverse conditions."
  },
  {
    image: '/feature1.jpg',
    icon: <Sprout className="w-10 h-10 text-green-700" />,
    title: "Farms",
    desc: "Manage your farms, crops, and field activities efficiently.",
    details: "Organize your farm plots, track crop cycles, and record all activities for each field to maximize productivity and traceability."
  },
  {
    image: '/feature7.jpg',
    icon: <GraduationCap className="w-10 h-10 text-green-700" />,
    title: "Education",
    desc: "Access guides, tips, and resources to improve your farming.",
    details: "Explore a library of articles, videos, and expert advice to stay updated with the latest farming techniques and best practices."
  },
  {
    image: '/feature5.jpg',
    icon: <Brain className="w-10 h-10 text-green-700" />,
    title: "Pest Control",
    desc: "AI-powered pest detection and smart control recommendations.",
    details: "Upload crop images for instant pest detection and receive tailored recommendations for safe and effective pest management."
  },
  {
    image: '/feature6.jpg',
    icon: <BadgeDollarSign className="w-10 h-10 text-green-700" />,
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
      className="min-h-screen w-full flex flex-col items-center justify-start p-0"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Logo at the top */}
      <img src="/Asset 5.png" alt="AgroAI Logo" className="w-50 h-48 mt-10 mb-4 mx-auto" />
      {/* Hero Section */}
      <div className="w-full flex flex-col items-center justify-center py-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-green-800 mb-4 text-center">Welcome to AgroAi</h1>
        <p className="text-xl text-green-900 mb-8 text-center max-w-2xl">Intelligent solutions for real farming. Harness the power of AI to boost your farm's productivity and sustainability.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-10 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white text-xl font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-800 transition"
        >
          Get Started
        </button>
      </div>
      {/* Features Section */}
      <div className="w-full max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-10 text-center">What’s included in AgroAi?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-8">
          {features.map((f, idx) => {
            const isLast = idx === features.length - 1;
            const needsCenter = features.length % 3 === 1 && isLast;
            return (
              <div
                key={idx}
                className={
                  `flex flex-col items-center justify-start bg-white bg-opacity-90 rounded-2xl shadow-lg max-w-md min-h-[22rem] mx-auto mb-6 p-8 border-2 border-transparent transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:border-green-400 cursor-pointer` +
                  (needsCenter ? ' sm:col-start-2' : '')
                }
                onClick={() => setExpanded(expanded === idx ? null : idx)}
              >
                <div className="w-full h-56 mb-4 overflow-hidden rounded-xl">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full h-full object-cover rounded-xl transition-all duration-300 ease-in-out hover:scale-110"
                  />
                </div>
                <div className="mb-2">{f.icon}</div>
                <div className="font-bold text-green-800 text-2xl mb-1 text-center">{f.title}</div>
                <div className="text-green-700 text-center text-lg px-2">{f.desc}</div>
                {/* Expandable details box */}
                {expanded === idx && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 text-base shadow transition-all duration-300 w-full">
                    <div className="font-semibold mb-2">How it works:</div>
                    <div>{f.details}</div>
                    <button
                      className="mt-4 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
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