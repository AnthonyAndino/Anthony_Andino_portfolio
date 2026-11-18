import * as englishData from '../data/portfolioData.en';
import * as spanishData from '../data/portfolioData';
import { useLanguage } from './LanguageContext';

export const usePortfolioData = () => {
  const { locale } = useLanguage();
  return locale === 'en' ? englishData : spanishData;
};
