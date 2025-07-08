export const cityNameUrduMap: Record<string, string> = {
  'Lahore': 'لاہور',
  'Karachi': 'کراچی',
  'Islamabad': 'اسلام آباد',
  'Faisalabad': 'فیصل آباد',
  'Rawalpindi': 'راولپنڈی',
  'Multan': 'ملتان',
  'Peshawar': 'پشاور',
  'Quetta': 'کوئٹہ',
  'Sialkot': 'سیالکوٹ',
  'Gujranwala': 'گوجرانوالہ',
  'Hyderabad': 'حیدرآباد',
  'Sargodha': 'سرگودھا',
  'Bahawalpur': 'بہاولپور',
  'Sahiwal': 'ساہیوال',
  'Sukkur': 'سکھر',
  'Larkana': 'لاڑکانہ',
  'Sheikhupura': 'شیخوپورہ',
  'Rahim Yar Khan': 'رحیم یار خان',
  'Jhang': 'جھنگ',
  'Dera Ghazi Khan': 'ڈیرہ غازی خان',
  'New York': 'نیویارک',
  'London': 'لندن',
  'Paris': 'پیرس',
  'Tokyo': 'ٹوکیو',
  'Beijing': 'بیجنگ',
  'Delhi': 'دہلی',
  'Istanbul': 'استنبول',
  'Moscow': 'ماسکو',
  'Dubai': 'دبئی',
  'Sydney': 'سڈنی',
  'Berlin': 'برلن',
  'Madrid': 'میڈرڈ',
  'Rome': 'روم',
  'Toronto': 'ٹورنٹو',
  'Los Angeles': 'لاس اینجلس',
  'Chicago': 'شکاگو',
  'Bangkok': 'بنکاک',
  'Cairo': 'قاہرہ',
  'Johannesburg': 'جوہانسبرگ',
  'Kuala Lumpur': 'کوالالمپور',
};

export function getTranslatedCityName(city: string, language: string) {
  if (language === 'ur' && cityNameUrduMap[city]) {
    return cityNameUrduMap[city];
  }
  return city;
} 