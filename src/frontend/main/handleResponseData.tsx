const handleResponseData = (data: any) => {
  console.log(data);
  const handleData = (value: number) => {
    return value >= 0 ? value.toLocaleString('fi-FI') : 'ei tietoa';
  };

  const handlePercentageData = (value: number) => {
    return data.responses > 25 ? ((value * 100) / data.population).toFixed(2).replace('.', ',') : null;
  };

  return {
    responsesTotal: data.responses !== -1 ? data.responses.toLocaleString('fi-FI') : '< 25',
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
    rhinitsTotal: handleData(data.rhinitis_yes),
    rhinitsPercentage: handlePercentageData(data.rhinitis_yes),
    stomachIssuesTotal: handleData(data.stomach_issues_yes),
    stomachIssuesPercentage: handlePercentageData(data.stomach_issues_yes),
    sensoryIssuesTotal: handleData(data.sensory_issues_yes),
    sensoryIssuesPercentage: handlePercentageData(data.sensory_issues_yes),
  };
};

export default handleResponseData;
