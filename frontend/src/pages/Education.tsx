import React, { useState, useEffect } from 'react';
import { BookOpen, Video, Download, Info, HelpCircle, ListChecks, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const articles = [
  {
    title: "Safe pesticide handling and storage",
    url: "https://www.epa.gov/safepestcontrol/safe-pesticide-use"
  },
  {
    title: "How to choose the right pesticide",
    url: "https://www.agriculture.com/crops/pesticides/how-to-choose-the-right-pesticide"
  },
  {
    title: "Effects of overuse and misuse of pesticides",
    url: "https://www.who.int/news-room/fact-sheets/detail/pesticide-residues-in-food"
  },
  {
    title: "Organic and eco-friendly alternatives",
    url: "https://www.planetnatural.com/pest-problem-solver/organic-pesticides/"
  },
  {
    title: "Government regulations and legal use",
    url: "https://www.fao.org/faolex/results/details/en/c/LEX-FAOC197995/"
  }
];

const videos = [
  {
    title: "How-to: Safe Pesticide Application",
    url: "https://www.youtube.com/watch?v=Qw3S5bJQ1h8"
  },
  {
    title: "Crop-specific pest control methods",
    url: "https://www.youtube.com/watch?v=6Qw1QwQwQwQ"
  },
  {
    title: "Equipment cleaning and maintenance",
    url: "https://www.youtube.com/watch?v=2Qw1QwQwQwQ"
  },
  {
    title: "Real farmer experiences",
    url: "https://www.youtube.com/watch?v=3Qw1QwQwQwQ"
  }
];

const pdfs = [
  {
    title: "Pesticide usage chart by crop type",
    url: "https://www.cabi.org/Uploads/CABI/expertise/pesticide-usage-chart.pdf"
  },
  {
    title: "Weather-wise spraying schedules",
    url: "https://www.agriculture.gov.ie/media/migration/farmingsectors/crops/WeatherwiseSpraying.pdf"
  },
  {
    title: "Disease identification and treatment manual",
    url: "https://www.apsnet.org/edcenter/resources/commonnames/Pages/DiseaseManual.aspx"
  }
];

const tips = [
  "Always read and follow the label instructions on pesticides.",
  "Rotate pesticides to prevent resistance in pests.",
  "Use personal protective equipment (PPE) when handling chemicals.",
  "Spray in the early morning or late afternoon to avoid harming pollinators.",
  "Keep a record of all pesticide applications for future reference.",
  "Store pesticides in a cool, dry, and locked place away from children and animals.",
  "Use integrated pest management (IPM) practices to reduce chemical use.",
  "Clean equipment thoroughly after each use to prevent cross-contamination."
];

const faqs = [
  {
    q: "What should I do if I spill pesticide on my skin?",
    a: "Remove contaminated clothing and wash skin thoroughly with soap and water. Seek medical attention if irritation persists."
  },
  {
    q: "How do I know if a pesticide is safe for my crop?",
    a: "Check the label for approved crops and consult local agricultural extension services."
  },
  {
    q: "What is the re-entry interval (REI)?",
    a: "The REI is the minimum time that must pass before people can re-enter a field after pesticide application."
  },
  {
    q: "What to do if crop burns after spraying?",
    a: "Stop using the product, irrigate the field if possible, and consult an expert for further advice."
  }
];

const glossary = [
  { term: "Herbicide", def: "A chemical for killing weeds." },
  { term: "Fungicide", def: "A chemical for controlling fungal diseases." },
  { term: "Residual effect", def: "How long a pesticide remains active after application." },
  { term: "IPM", def: "Integrated Pest Management, a holistic approach to pest control." },
  { term: "REI", def: "Re-entry Interval, the time before people can re-enter a treated area." }
];

const regulations = [
  {
    title: "New rules from agriculture departments",
    url: "https://www.agrilaws.com/latest-pesticide-regulations"
  },
  {
    title: "Banned pesticides in Pakistan (2024)",
    url: "https://www.fao.org/faolex/results/details/en/c/LEX-FAOC197995/",
    details: [
      "Aldrin",
      "Chlordane",
      "DDT",
      "Dieldrin",
      "Endrin",
      "Heptachlor",
      "Lindane",
      "Mirex",
      "Toxaphene"
    ]
  },
  {
    title: "Approved pesticides (2024)",
    url: "https://www.pcpb.gov.pk/approved-pesticides",
    details: [
      "Imidacloprid",
      "Lambda-cyhalothrin",
      "Carbendazim",
      "Mancozeb",
      "Glyphosate"
    ]
  }
];

type ExpandableCardProps = {
  icon: React.ReactNode;
  title: string;
  children: (visible: number) => React.ReactNode;
  maxItems?: number;
  itemsLength: number;
};

const ExpandableCard: React.FC<ExpandableCardProps> = ({ icon, title, children, maxItems = 4, itemsLength }) => {
  const [expanded, setExpanded] = useState(false);
  const showExpand = itemsLength > maxItems;
  const contentClass = showExpand && expanded
    ? "overflow-y-auto max-h-[280px] pr-2"
    : "overflow-y-auto max-h-[280px] pr-2";
  const visibleCount = showExpand && !expanded ? maxItems : itemsLength;
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6 border border-gray-100 flex flex-col h-[260px] sm:h-[370px]">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className={contentClass + " flex-1"}>
          {children(visibleCount)}
        </div>
        {showExpand && (
          <button
            className="mt-4 text-blue-600 hover:underline font-semibold self-center"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    </div>
  );
};

const useRegulations = () => {
  const [regulations, setRegulations] = useState([
    {
      title: "New rules from agriculture departments",
      url: "https://www.agrilaws.com/latest-pesticide-regulations",
      lastUpdated: new Date()
    },
    {
      title: "Banned pesticides in Pakistan (2024)",
      url: "https://www.fao.org/faolex/results/details/en/c/LEX-FAOC197995/",
      lastUpdated: new Date(),
      details: [
        "Aldrin",
        "Chlordane",
        "DDT",
        "Dieldrin",
        "Endrin",
        "Heptachlor",
        "Lindane",
        "Mirex",
        "Toxaphene"
      ]
    },
    {
      title: "Approved pesticides (2024)",
      url: "https://www.pcpb.gov.pk/approved-pesticides",
      lastUpdated: new Date(),
      details: [
        "Imidacloprid",
        "Lambda-cyhalothrin",
        "Carbendazim",
        "Mancozeb",
        "Glyphosate"
      ]
    }
  ]);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const response = await fetch('https://api.example.com/regulations');
        if (response.ok) {
          const newData = await response.json();
          setRegulations(prev => [...newData]);
        }
      } catch (error) {
        console.log('Error fetching updates:', error);
      }
    };

    const interval = setInterval(checkForUpdates, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return regulations;
};

const Education = () => {
  const { t } = useLanguage();
  const updatedRegulations = useRegulations();
  
  // Cards in order, with regulations moved up
  const cards = [
    <ExpandableCard key="articles" icon={<BookOpen className="w-7 h-7 text-blue-500" />} title={t('education.articlesGuides')} itemsLength={articles.length}>
      {(visible) => (
        <div className="flex flex-col gap-3">
          {articles.slice(0, visible).map((a, idx) => (
            <a key={idx} href={a.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 transition rounded-lg px-4 py-3 shadow-sm group">
              <FileText className="w-5 h-5 text-blue-400 group-hover:text-blue-600" />
              <span className="font-medium text-blue-900 group-hover:underline">{t(`education.article.${idx}`) || a.title}</span>
              <ExternalLink className="w-4 h-4 text-blue-300 group-hover:text-blue-600 ml-auto" />
            </a>
          ))}
        </div>
      )}
    </ExpandableCard>,
    <ExpandableCard key="videos" icon={<Video className="w-7 h-7 text-green-500" />} title={t('education.videosTutorials')} itemsLength={videos.length}>
      {(visible) => (
        <div className="flex flex-col gap-3">
          {videos.slice(0, visible).map((v, idx) => (
            <a key={idx} href={v.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 transition rounded-lg px-4 py-3 shadow-sm group">
              <Video className="w-5 h-5 text-green-400 group-hover:text-green-600" />
              <span className="font-medium text-green-900 group-hover:underline">{t(`education.video.${idx}`) || v.title}</span>
              <ExternalLink className="w-4 h-4 text-green-300 group-hover:text-green-600 ml-auto" />
            </a>
          ))}
        </div>
      )}
    </ExpandableCard>,
    <ExpandableCard key="regulations" icon={<AlertCircle className="w-7 h-7 text-red-500" />} title={t('education.regulatoryUpdates')} itemsLength={updatedRegulations.length}>
      {(visible) => (
        <div className="flex flex-col gap-3">
          {updatedRegulations.slice(0, visible).map((r, idx) => (
            <div key={idx} className="bg-red-50 rounded-lg px-4 py-3 shadow-sm">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-red-700 font-semibold hover:underline flex items-center gap-1 text-sm">
                {t(`education.regulation.${idx}`) || r.title}
                <ExternalLink className="w-4 h-4 text-red-400 flex-shrink-0" />
              </a>
              {r.details && (
                <div className="mt-2">
                  <ul className="ml-4 list-disc text-red-800 space-y-1">
                    {r.details.map((d, i) => (
                      <li key={i} className="text-xs leading-tight">{t(`education.regulation.${idx}.detail.${i}`) || d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ExpandableCard>,
    <ExpandableCard key="tips" icon={<Info className="w-7 h-7 text-purple-500" />} title={t('education.tipsFarming')} itemsLength={tips.length}>
      {(visible) => (
        <div className="flex flex-col gap-3">
          {tips.slice(0, visible).map((tip, idx) => (
            <div key={idx} className="bg-purple-50 border-l-4 border-purple-400 rounded-lg px-4 py-3 shadow-sm text-purple-900">
              {t(`education.tip.${idx}`) || tip}
            </div>
          ))}
        </div>
      )}
    </ExpandableCard>,
    <ExpandableCard key="faqs" icon={<HelpCircle className="w-7 h-7 text-pink-500" />} title={t('education.faqsHelp')} itemsLength={faqs.length}>
      {(visible) => (
        <div className="flex flex-col gap-3">
          {faqs.slice(0, visible).map((faq, idx) => {
            const [isExpanded, setIsExpanded] = useState(false);
            return (
              <div key={idx} className="bg-pink-50 rounded-lg px-4 py-3 shadow-sm">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-pink-900">{t(`education.faq.${idx}.q`) || faq.q}</span>
                  <svg 
                    className={`w-5 h-5 text-pink-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="mt-2 text-pink-800 pl-2 border-l-2 border-pink-300">
                    {t(`education.faq.${idx}.a`) || faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ExpandableCard>,
    <ExpandableCard key="pdfs" icon={<Download className="w-7 h-7 text-amber-500" />} title={t('education.pdfDownloads')} itemsLength={pdfs.length}>
      {(visible) => (
        <div className="flex flex-col gap-3">
          {pdfs.slice(0, visible).map((p, idx) => (
            <a key={idx} href={p.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 transition rounded-lg px-4 py-3 shadow-sm group">
              <Download className="w-5 h-5 text-amber-400 group-hover:text-amber-600" />
              <span className="font-medium text-amber-900 group-hover:underline">{t(`education.pdf.${idx}`) || p.title}</span>
              <ExternalLink className="w-4 h-4 text-amber-300 group-hover:text-amber-600 ml-auto" />
            </a>
          ))}
        </div>
      )}
    </ExpandableCard>,
    <ExpandableCard key="glossary" icon={<ListChecks className="w-7 h-7 text-gray-500" />} title={t('education.glossary')} itemsLength={glossary.length}>
      {(visible) => (
        <div className="flex flex-col gap-3">
          {glossary.slice(0, visible).map((g, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg px-4 py-3 shadow-sm">
              <span className="font-semibold text-gray-800">{t(`education.glossary.${idx}.term`) || g.term}:</span> <span className="text-gray-700">{t(`education.glossary.${idx}.def`) || g.def}</span>
            </div>
          ))}
        </div>
      )}
    </ExpandableCard>
  ];

  // Center the last card if odd number of cards
  const gridCols = 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8';
  const lastCardCentered = cards.length % 2 !== 0 ? cards.length - 1 : null;

  return (
    <div className="space-y-10 px-2 md:px-0 max-w-5xl mx-auto py-8">
      <h1 className="text-4xl font-extrabold text-center text-green-700 mb-8 drop-shadow">{t('education.title')}</h1>
      <div className={gridCols}>
        {cards.map((card, idx) =>
          lastCardCentered === idx ? (
            <div key={idx} className="col-span-2 flex justify-center">{card}</div>
          ) : (
            <div key={idx}>{card}</div>
          )
        )}
      </div>
    </div>
  );
};

export default Education;