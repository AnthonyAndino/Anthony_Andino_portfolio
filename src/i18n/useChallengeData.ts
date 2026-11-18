import {
  CHALLENGE_DB as CHALLENGE_DB_ES,
  CHALLENGE_LEVELS as CHALLENGE_LEVELS_ES,
  ChallengeDatabase,
  ChallengeLevelConfig,
} from '../data/challengeData';
import {
  CHALLENGE_DB as CHALLENGE_DB_EN,
  CHALLENGE_LEVELS as CHALLENGE_LEVELS_EN,
} from '../data/challengeData.en';
import { useLanguage } from './LanguageContext';

interface ChallengeData {
  CHALLENGE_LEVELS: ChallengeLevelConfig[];
  CHALLENGE_DB: ChallengeDatabase;
}

export const useChallengeData = (): ChallengeData => {
  const { locale } = useLanguage();

  return locale === 'en'
    ? { CHALLENGE_LEVELS: CHALLENGE_LEVELS_EN, CHALLENGE_DB: CHALLENGE_DB_EN }
    : { CHALLENGE_LEVELS: CHALLENGE_LEVELS_ES, CHALLENGE_DB: CHALLENGE_DB_ES };
};
