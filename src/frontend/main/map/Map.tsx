import React from 'react';
import MapContainer from './MapContainer';
import * as topojson from 'topojson';

const mapShape: {
  type: string;
  transform: { scale: [number, number]; translate: [number, number] };
  objects: { kuntarajat: { geometries: { properties: { code: string; name: string } }[] } };
} = require('./finland-map-without-aland.json'); //map file

const mapShapeData = topojson.feature(mapShape, mapShape.objects.kuntarajat); // creat a features data for the map

interface mapProperties {
  City?: string;
  name?: string;
  responses: number;
  fever_no: number;
  fever_yes?: number;
  fever_slight: number;
  fever_high: number;
  cough_no: number;
  cough_yes?: number;
  cough_mild: number;
  cough_intense: number;
  cough_fine: number;
  cough_impaired: number;
  cough_bad: number;
  breathing_difficulties_no: number;
  breathing_difficulties_yes: number;
  muscle_pain_no: number;
  muscle_pain_yes: number;
  headache_no: number;
  headache_yes: number;
  sore_throat_no: number;
  sore_throat_yes: number;
  rhinitis_no: number;
  rhinitis_yes: number;
  stomach_issues_no: number;
  stomach_issues_yes: number;
  sensory_issues_no: number;
  sensory_issues_yes: number;
  longterm_medication_no: number;
  longterm_medication_yes: number;
  smoking_no: number;
  smoking_yes: number;
  corona_suspicion_no: number;
  corona_suspicion_yes: number;
  Population: number;
}

const data: mapProperties[] = require('./citylevel-opendata-3-4-2020.json');

const populationData: { City: string; population: number }[] = require('./population.json');

const App: React.FunctionComponent<{}> = () => {
  // Data Manipulation
  mapShapeData.features.forEach((d: { properties: mapProperties }) => {
    let index = data.findIndex((el: mapProperties) => d.properties.name === el.City);
    if (index !== -1) {
      d.properties = data[index];
      d.properties.fever_yes = d.properties.responses - d.properties.fever_no;
      d.properties.cough_yes = d.properties.responses - d.properties.cough_no;
    } else {
      let indx = populationData.findIndex((el: { City: string; population: number }) => d.properties.name === el.City);
      console.log(indx, d.properties.name);
      let obj = {
        name: d.properties.name,
        responses: -1,
        fever_no: -1,
        fever_yes: -1,
        fever_slight: -1,
        fever_high: -1,
        cough_no: -1,
        cough_yes: -1,
        cough_mild: -1,
        cough_intense: -1,
        cough_fine: -1,
        cough_impaired: -1,
        cough_bad: -1,
        breathing_difficulties_no: -1,
        breathing_difficulties_yes: -1,
        muscle_pain_no: -1,
        muscle_pain_yes: -1,
        headache_no: -1,
        headache_yes: -1,
        sore_throat_no: -1,
        sore_throat_yes: -1,
        rhinitis_no: -1,
        rhinitis_yes: -1,
        stomach_issues_no: -1,
        stomach_issues_yes: -1,
        sensory_issues_no: -1,
        sensory_issues_yes: -1,
        longterm_medication_no: -1,
        longterm_medication_yes: -1,
        smoking_no: -1,
        smoking_yes: -1,
        corona_suspicion_no: -1,
        corona_suspicion_yes: -1,
        Population: populationData[indx].population,
      };
      d.properties = obj;
    }
  });

  // Data Manipulation Ends

  return (
    <div className="App">
      <MapContainer mapShapeData={mapShapeData} />
    </div>
  );
};

export default App;
