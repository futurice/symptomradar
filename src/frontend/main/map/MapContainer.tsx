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
        colorRange={['#bee7fa', '#00bdf2', '#082163']}
        colorScaleKey={props.selectedFilter}
        defaultColor={'#ccd2d5'}
        colorScaleTransform={'percentResponse'}
        popUpOpen={props.popUpOpen}
      />
    </div>
  );
};

export default App;
