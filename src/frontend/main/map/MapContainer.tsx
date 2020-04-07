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
        colorRange={['#fed976', '#feb24c', '#fd8d3c','#fc4e2a','#e31a1c','#b10026']}
        colorDomain={[10,15,20,25,30]}
        colorScaleKey={props.selectedFilter}
        defaultColor={'#ccd2d5'}
        colorScaleTransform={'percentResponse'}
        popUpOpen={props.popUpOpen}
      />
    </div>
  );
};

export default App;
