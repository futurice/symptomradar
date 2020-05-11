import { getCurrentLocale } from './translations';

export interface ResponseData {
  responsesTotal: string | null;
  percentageOfPopulation: string | null;
  suspicionTotal: string | null;
  suspicionPercentage: string | null;
  coughTotal: string | null;
  coughPercentage: string | null;
  feverTotal: string | null;
  feverPercentage: string | null;
  breathingDifficultiesTotal: string | null;
  breathingDifficultiesPercentage: string | null;
  musclePainTotal: string | null;
  musclePainPercentage: string | null;
  headacheTotal: string | null;
  headachePercentage: string | null;
  soreThroatTotal: string | null;
  soreThroatPercentage: string | null;
  rhinitisTotal: string | null;
  rhinitisPercentage: string | null;
  stomachIssuesTotal: string | null;
  stomachIssuesPercentage: string | null;
  sensoryIssuesTotal: string | null;
  sensoryIssuesPercentage: string | null;
}

export type ResponseDataKey = keyof ResponseData;

const handleResponseData = (data: any): ResponseData => {
  const currentLocale = getCurrentLocale();
  const handleData = (value: number) => {
    return value >= 0 ? value.toLocaleString(currentLocale) : null;
  };

  const handlePercentageData = (value: number) => {
    return data.responses > 25
      ? (Math.round(((value * 100) / data.population) * 100) / 100).toLocaleString(currentLocale)
      : null;
  };

  return {
    responsesTotal: handleData(data.responses),
    percentageOfPopulation: handlePercentageData(data.responses),
    suspicionTotal: handleData(data.corona_suspicion_yes),
    suspicionPercentage: handlePercentageData(data.corona_suspicion_yes),
    coughTotal: handleData(data.cough_mild + data.cough_intense),
    coughPercentage: handlePercentageData(data.cough_mild + data.cough_intense),
    feverTotal: handleData(data.fever_slight + data.fever_high),
    feverPercentage: handlePercentageData(data.fever_slight + data.fever_high),
    breathingDifficultiesTotal: handleData(data.breathing_difficulties_yes),
    breathingDifficultiesPercentage: handlePercentageData(data.breathing_difficulties_yes),
    musclePainTotal: handleData(data.muscle_pain_yes),
    musclePainPercentage: handlePercentageData(data.muscle_pain_yes),
    headacheTotal: handleData(data.headache_yes),
    headachePercentage: handlePercentageData(data.headache_yes),
    soreThroatTotal: handleData(data.sore_throat_yes),
    soreThroatPercentage: handlePercentageData(data.sore_throat_yes),
    rhinitisTotal: handleData(data.rhinitis_yes),
    rhinitisPercentage: handlePercentageData(data.rhinitis_yes),
    stomachIssuesTotal: handleData(data.stomach_issues_yes),
    stomachIssuesPercentage: handlePercentageData(data.stomach_issues_yes),
    sensoryIssuesTotal: handleData(data.sensory_issues_yes),
    sensoryIssuesPercentage: handlePercentageData(data.sensory_issues_yes),
  };
};

export default handleResponseData;
