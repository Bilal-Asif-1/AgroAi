import React from 'react';
import { FaLinkedin, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const ContactUs: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-6 mt-6 mb-6 border border-emerald-100">
      <h2 className="text-3xl font-bold text-emerald-700 mb-4 text-center">{t('contact.heading')}</h2>
      <p className="text-gray-500 mb-8 text-center">{t('contact.subheading')}</p>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">{t('contact.name')}</label>
          <input type="text" id="name" name="name" className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition" required placeholder={t('contact.namePlaceholder')} />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">{t('contact.email')}</label>
          <input type="email" id="email" name="email" className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition" required placeholder={t('contact.emailPlaceholder')} />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="message">{t('contact.message')}</label>
          <textarea id="message" name="message" rows={3} className="w-full px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none" required placeholder={t('contact.messagePlaceholder')}></textarea>
        </div>
        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl shadow-lg hover:bg-emerald-700 transition-all text-base">{t('contact.sendButton')}</button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-gray-600">{t('contact.orReachUs')}</p>
        <p className="text-emerald-700 font-semibold">support@agroai.com</p>
        <p className="text-gray-500">{t('contact.address')}</p>
        <p className="text-gray-500">+1 (234) 567-8901</p>
        <div className="flex justify-center gap-6 mt-6">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 text-2xl transition-colors" aria-label={t('contact.linkedin')}><FaLinkedin /></a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 text-2xl transition-colors" aria-label={t('contact.facebook')}><FaFacebook /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 text-2xl transition-colors" aria-label={t('contact.twitter')}><FaTwitter /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 text-2xl transition-colors" aria-label={t('contact.instagram')}><FaInstagram /></a>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 