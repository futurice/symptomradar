import i18n from 'i18next';

export function getCurrentLocale(): string {
  const lang = i18n.language;
  // Default to locale en-GB if English. Otherwise the default is decided
  // (probably by i18n) to be en-US
  const locale = lang === 'en' ? 'en-GB' : `${lang}-${lang.toUpperCase()}`;
  return locale;
}

export function getLocaleDateMonth(date: Date): string {
  const currentLocale = getCurrentLocale();
  const dmyString = date.toLocaleDateString(currentLocale);
  // Assuming the last 4 digits are always years, and there is a
  // preceeding separator character, and we only want to display
  // day and month.
  const dmString = dmyString.substring(0, dmyString.length - 5);
  // However, Finnish date.month. format includes a trailing dot
  return currentLocale === 'fi-FI' ? `${dmString}.` : dmString;
}

export function getLocaleDecimalString(n: number, dec: number = 2): string {
  const multiplier = Math.pow(10, dec);
  const currentLocale = getCurrentLocale();
  return (Math.round(n * multiplier) / multiplier).toLocaleString(currentLocale);
}

export default {
  en: {
    format: {
      percentage: '{{percentage}}%',
    },
    symptomLabels: {
      corona_infection_suspicion: 'Corona infection suspicion',
      corona_suspicion: 'Corona suspicion',
      cough: 'Cough',
      fever: 'Fever',
      breathing_difficulties: 'Breathing difficulties',
      muscle_pain: 'Muscle pain',
      headache: 'Headache',
      sore_throat: 'Sore throat',
      rhinitis: 'Rhinitis',
      stomach_issues: 'Stomach issues',
      sensory_issues: 'Sensory issues',
      loss_smell_or_taste: 'Loss of smell or taste',
    },
    main: {
      ofAllResponses: 'of all responses',
      approxOutOf: 'Approx. 1 out of {{denominator}} respondents suspect they have a corona infection.',
      respondantSuspectingCorona: 'Respondents with suspected corona symptoms',
      goToMap: 'Go to map',
      selectTwoSymptomsToCompare: 'Select two symptoms to compair their development over time.',
      timeDevelopment: 'Timeline',
      positiveResponses: '+ve Responses',
      topSymptoms: 'Top symptoms',
      loading: 'Loading...',
      errorLoadingData: 'Error loading data',
      languageSelector: 'Language',
      cityInformation: 'City information',
      openOrCloseMenu: 'Open/Close menu',
      close: 'Close',
      navigation: 'Navigation',
      allMunicipalities: 'All municipalities',
      allOfFinland: 'All of Finland',
      chooseMunicipality: 'Choose a municipality',
      filter: 'Filter',
      filterResponses: 'Filter responses',
      filterDialogTitle: 'Filter responses',
      symptoms: 'Symptoms',
      legendInfoLine1: 'Color coded by amount',
      legendInfoLine2: 'of symptoms reported',
      legendInfoLine3: 'The size of the circle illustrates',
      legendInfoLine4: 'population size',
      mapInfo:
        'The map shows symptoms the respondents have in various municipalities. Only municipalities with over 25 answers are included.',
      responses: 'Responses',
      shareOfPopulation: 'Share of population',
      totalResponses: 'Total responses',
      lastUpdated: 'last updated',
      other: 'Other',
      noInformation: 'No information',
      totalResponsesModalInfoText: 'Total responses: {{total}} ({{percentage}}% of the population)',
      comparedToMunicipalityPopulation: 'Compared to municipality population',
      ofPopulation: 'of the population',
      notEnoughResponses: 'Not enough responses from this area yet',
      municipality: 'Municipality',
    },
    navigation: {
      overview: 'Overview',
      map: 'Map',
      survey: 'Survey',
      info: 'Info',
    },
    aboutPage: {
      content: `
<0>Symptom Radar collects information about the coronavirus</0>

<1>
Symptom Radar is a collaborative project between Helsingin Sanomat and digital engineering and innovation consultancy Futurice. It collects information about symptoms people have experienced all around Finland and disseminates this information to readers. Other Finnish medias are also taking part in collecting the information. The goal is to gain a better understanding of how the coronavirus might be spreading in Finland. The project follows open source principles. <2>The source code for the site is available here.</2>
</1>

<2>
The information was collected using a questionnaire form. This site displays the results of the questionnaire. <2>Read more about the privacy policy (in Finnish).</2>
</2>
      `,
    },
  },
  fi: {
    format: {
      percentage: '{{percentage}} %',
    },
    symptomLabels: {
      // NOTE: the character "­" in "koronavirus­tartunnasta" is not a normal "-", but
      // rather a "soft hyphen", added here via copy-pasting.
      // "­" is used in conjunction with css style `hyphens: manual`
      // Using &shy; (the html code for ­) seems to be too troublesome since it will be
      // is escaped by default by both i18next and React.
      corona_infection_suspicion: 'Epäilys koronavirus­tartunnasta',
      corona_suspicion: 'Epäilys koronasta',
      cough: 'Yskää',
      fever: 'Kuumetta',
      breathing_difficulties: 'Vaikeuksia hengittää',
      muscle_pain: 'Lihaskipuja',
      headache: 'Päänsärkyä',
      sore_throat: 'Kurkkukipua',
      rhinitis: 'Nuhaa',
      stomach_issues: 'Vatsaoireita',
      sensory_issues: 'Aistien heikkenemistä',
      loss_smell_or_taste: 'Hajuaistin tai makuaistin heikkenemistä',
    },
    main: {
      ofAllResponses: 'kaikista vastauksista',
      approxOutOf: 'Vastaajista noin 1/{{denominator}} epäilee koronatartuntaa',
      respondantSuspectingCorona: 'Vastaajia jotka epäilevät koronaa',
      goToMap: 'Karttaan',
      selectTwoSymptomsToCompare: 'Select two symptoms to compair their development over time.',
      timeDevelopment: 'aikajana',
      positiveResponses: 'Positiivisia vastauksia',
      respondents: 'Respondents',
      topSymptoms: 'Oirejärjestys',
      loading: 'Ladataan...',
      errorLoadingData: 'Virhe tietojen latauksessa',
      languageSelector: 'Kieli',
      cityInformation: 'Kaupungin tiedot',
      openOrCloseMenu: 'Avaa/sulje valikko',
      navigation: 'Navigaatio',
      close: 'Sulje',
      allMunicipalities: 'Kaikki kunnat',
      allOfFinland: 'Koko Suomi',
      chooseMunicipality: 'Valitse kunta',
      filter: 'Rajaa',
      filterResponses: 'Rajaa vastauksia',
      filterDialogTitle: 'Rajaa vastauksia',
      symptoms: 'Oireet',
      legendInfoLine1: 'Väri kertoo, missä oireita',
      legendInfoLine2: 'on raportoitu eniten',
      legendInfoLine3: 'Ympyrän koko kuvaa väkilukua',
      legendInfoLine4: '',
      mapInfo:
        'Kartta näyttää, millaisia oireita vastaajilla on eri kunnissa. Mukana ovat kunnat, joista on saatu yli 25 vastausta.',
      responses: 'Vastauksia',
      shareOfPopulation: 'Osuus väkiluvusta',
      totalResponses: 'Vastauksia yhteensä',
      lastUpdated: 'päivitetty',
      other: 'Muut',
      noInformation: 'Ei tietoa',
      totalResponsesModalInfoText: 'Vastauksia yhteensä: {{total}} ({{percentage}} % väkiluvusta)',
      comparedToMunicipalityPopulation: 'Verrattuna kunnan väkilukuun',
      ofPopulation: 'väkiluvusta',
      notEnoughResponses: 'Alueelta ei ole vielä tarpeeksi vastauksia',
      municipality: 'Kunta',
    },
    navigation: {
      overview: 'Kokonaiskuva',
      map: 'Kartta',
      survey: 'Kyselylomake',
      info: 'Info',
    },
    aboutPage: {
      content: `
<0>Oiretutka kerää tietoa koronaviruksesta</0>

<1>
Oiretutka on Helsingin Sanomien ja teknologiayhtiö Futuricen kehittämä hanke, jonka tarkoituksena on kerätä suomalaisilta tietoja heidän kokemistaan oireista ja kertoa niistä lukijoille. Myös muita suomalaisia medioita osallistuu tiedonkeruuseen. Tiedon avulla on tarkoitus ymmärtää paremmin, miten koronavirus mahdollisesti leviää Suomessa. Hanke tehdään avoimen lähdekoodin periaatteella. <2>Sivuston lähdekoodi löytyy täältä.</2>
</1>

<2>
Tiedot ovat kerätty kyselylomakkeen avulla. Tällä sivustolla näytämme kyselyn tuloksia. <2>Lue lisää tietosuojasta täältä.</2>
</2>
      `,
    },
  },
};
