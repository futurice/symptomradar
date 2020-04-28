const handleResponseData = (data: any) => {
  const responsesTotalValue = data.responses !== -1 ? data.responses.toLocaleString('fi-FI') : '< 25';
  const percentageOfPopulationValue =
    responsesTotalValue !== '< 25' ? ((data.responses * 100) / data.population).toFixed(2).replace('.', ',') : null;

  const suspicionTotalValue =
    data.corona_suspicion_yes !== -1 ? data.corona_suspicion_yes.toLocaleString('fi-FI') : 'ei tietoa';
  const suspicionPercentageValue =
    data.corona_suspicion_yes !== -1
      ? ((data.corona_suspicion_yes * 100) / data.population).toFixed(2).replace('.', ',')
      : null;

  const coughTotalValue =
    data.cough_mild + data.cough_intense !== -2
      ? (data.cough_mild + data.cough_intense).toLocaleString('fi-FI')
      : 'ei tietoa';
  const coughPercentageValue =
    data.cough_mild + data.cough_intense !== -2
      ? (((data.cough_mild + data.cough_intense) * 100) / data.population).toFixed(2).replace('.', ',')
      : null;

  const feverTotalValue =
    data.fever_slight + data.fever_high !== -2
      ? (data.fever_slight + data.fever_high).toLocaleString('fi-FI')
      : 'ei tietoa';
  const feverPercentageValue =
    data.fever_slight + data.fever_high !== -2
      ? (((data.fever_slight + data.fever_high) * 100) / data.population).toFixed(2).replace('.', ',')
      : null;

  const breathingDifficultiesTotalValue =
    data.breathing_difficulties_yes !== -1 ? data.breathing_difficulties_yes.toLocaleString('fi-FI') : 'ei tietoa';
  const breathingDifficultiesPercentageValue =
    data.breathing_difficulties_yes !== -1
      ? ((data.breathing_difficulties_yes * 100) / data.population).toFixed(2).replace('.', ',')
      : null;

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
