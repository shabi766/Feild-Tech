import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  
  const translate = (key, language = currentLanguage) => {
    return t(key, language) || key;
  };
  
  return {
    t: translate,
    currentLanguage,
    isRTL: currentLanguage === 'ar' || currentLanguage === 'ur'
  };
};


