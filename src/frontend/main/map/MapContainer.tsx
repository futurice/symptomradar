import React from 'react';
import DorlingCartogram from './DorlingCartogram';

const App: React.FunctionComponent<{ mapShapeData: any, selectedFilter :string, mapHeight:number, mapWidth:number, popUpOpen:boolean }> = props => {
  return (
    <div>
      <DorlingCartogram
        mapShapeData={props.mapShapeData}
        svgWidth={props.mapWidth}
        svgHeight={props.mapHeight}
        mapScale={(props.mapHeight * 4750) / 920}
        radiusRange={[2, (props.mapHeight * 30) / 920]}
        radiusScaleKey={'Population'}
        defaultRadius={2}
        colorRange={['#fce1a4', '#f08f6e', '#d12959' ,'#6e005f']}
        colorScaleKey={props.selectedFilter}
        defaultColor={'#ccd2d5'}
        colorScaleTransform={'percentPopulation'}
        popUpOpen={props.popUpOpen}
      />
    </div>
  );
};

export default App;
