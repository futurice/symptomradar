import React, { useState } from 'react';
import DorlingCartogram from './DorlingCartogram';

const App: React.FunctionComponent<{ mapShapeData: any }> = props => {
  const [width, setWidth] = useState(window.innerWidth > 820 ? 500 : window.innerWidth - 20);
  window.addEventListener('resize', () => {
    setWidth(window.innerWidth > 820 ? 500 : window.innerWidth - 20);
  });

  return (
    <div className="App">
      <DorlingCartogram
        mapShapeData={props.mapShapeData}
        width={width}
        height={(width * 920) / 500}
        mapScale={width * 10}
        radiusRange={[2, (width * 30) / 500]}
        radiusScaleKey={'Population'}
        defaultRadius={2}
        colorRange={['#bee7fa', '#00bdf2', '#082163']}
        colorScaleKey={'corona_suspicion_yes'}
        defaultColor={'#ccd2d5'}
        colorScaleTransform={'percentResponse'}
      />
    </div>
  );
};

export default App;
