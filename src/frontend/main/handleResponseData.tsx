const handleResponseData = (data: any) => {
  console.log(data);
  const handleData = (value: number) => {
    return value >= 0 ? value.toLocaleString('fi-FI') : 'ei tietoa';
  };

  const handlePercetageData = (value: number) => {
    return data.responses > 25 ? ((value * 100) / data.population).toFixed(2).replace('.', ',') : null;
  };

  const responsesTotalValue = data.responses !== -1 ? data.responses.toLocaleString('fi-FI') : '< 25';
  const percentageOfPopulationValue = handlePercetageData(data.responses);
  const suspicionTotalValue = handleData(data.corona_suspicion_yes);
  const suspicionPercentageValue = handlePercetageData(data.corona_suspicion_yes);
  const coughTotalValue = handleData(data.cough_mild + data.cough_intense);
  const coughPercentageValue = handlePercetageData(data.cough_mild + data.cough_intense);
  const feverTotalValue = handleData(data.fever_slight + data.fever_high);
  const feverPercentageValue = handlePercetageData(data.fever_slight + data.fever_high);
  const breathingDifficultiesTotalValue = handleData(data.breathing_difficulties_yes);
  const breathingDifficultiesPercentageValue = handlePercetageData(data.breathing_difficulties_yes);

  return {
    responsesTotal: responsesTotalValue,
    percentageOfPopulation: percentageOfPopulationValue,
    suspicionTotal: suspicionTotalValue,
    suspicionPercentage: suspicionPercentageValue,
    coughTotal: coughTotalValue,
    coughPercentage: coughPercentageValue,
    feverTotal: feverTotalValue,
    feverPercentage: feverPercentageValue,
    breathingDifficultiesTotal: breathingDifficultiesTotalValue,
    breathingDifficultiesPercentage: breathingDifficultiesPercentageValue,
  };
};

export default handleResponseData;
