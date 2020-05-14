import React from 'react';
import DorlingCartogram from './DorlingCartogram';
import { FilterKey } from '../constants';

const App: React.FunctionComponent<{
  mapShapeData: any;
  selectedFilter: FilterKey;
  mapHeight: number;
  popUpOpen: boolean;
}> = props => {
  return (
    <div>
      <DorlingCartogram
        mapShapeData={props.mapShapeData}
        mapScale={4500}
        mapHeight={props.mapHeight}
        radiusRange={[1, 30]}
        radiusScaleKey={'population'}
        defaultRadius={1}
        colorRange={['#fce1a4', '#f08f6e', '#d12959', '#6e005f']}
        colorScaleKey={props.selectedFilter}
        defaultColor={'#ccd2d5'}
        colorScaleTransform={'percentPopulation'}
        popUpOpen={props.popUpOpen}
      />
    </div>
  );
};

export default App;
