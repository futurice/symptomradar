import React, { useState } from 'react';
import DorlingCartogram from './DorlingCartogram';

const App: React.FunctionComponent<{ mapShapeData: any }> = props => {
  const headerHeight = 130;
  const mapSelectHeight = 55;
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight - headerHeight - mapSelectHeight);
  window.addEventListener('resize', () => {
    setScreenHeight(window.innerHeight - 20);
    setScreenWidth(window.innerWidth - 20);
  });

  return (
    <div>
      <DorlingCartogram
        mapShapeData={props.mapShapeData}
        svgWidth={screenWidth}
        svgHeight={screenHeight}
        mapScale={(screenHeight * 4750) / 920}
        radiusRange={[2, (screenHeight * 30) / 920]}
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
