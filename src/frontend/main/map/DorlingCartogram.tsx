import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import Modal from '../Modal';
import ModalContent from '../ModalContent';
import useModal from '../useModal';

let mapNode!: SVGSVGElement | null;
let keyNode!: SVGSVGElement | null;

interface mapProperties {
  city: string;
  responses: number;
  fever_no: number;
  fever_yes: number;
  fever_slight: number;
  fever_high: number;
  cough_no: number;
  cough_yes: number;
  cough_mild: number;
  cough_intense: number;
  general_wellbeing_fine: number;
  general_wellbeing_impaired: number;
  general_wellbeing_bad: number;
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
  population: number;
  x: number;
  y: number;
}

const mapSimplified: any = require('./finland-map-simplified.json');

const Map: React.FunctionComponent<{
  defaultRadius: number;
  mapShapeData: mapProperties[];
  mapScale: number;
  colorRange: string[];
  colorDomain?: number[];
  colorScaleKey: string;
  colorScaleTransform?: string;
  defaultColor: string;
  radiusRange: [number, number];
  radiusScaleKey: string;
  popUpOpen: boolean;
  mapHeight: number;
}> = props => {
  const [activeCityData, setActiveCityData] = useState({});
  const { isShowing, toggleModal } = useModal();
  const { t } = useTranslation(['main']);

  // radius and color scale
  let rScale = d3
    .scaleSqrt()
    .domain([0, d3.max(props.mapShapeData, (el: any) => el[props.radiusScaleKey])])
    .range(props.radiusRange);

  useEffect(() => {
    let mapSVG = d3.select(mapNode);
    let keySVG = d3.select(keyNode);
    mapSVG.selectAll('.mapG').remove();
    keySVG.selectAll('.keyG').remove();

    // projection for the map shape
    const projection = d3
      .geoTransverseMercator()
      .rotate([-27, -65, 0])
      .scale(props.mapScale)
      .translate([2023 / 2 + 60, 900 / 2 - 10]);

    // covert map shape to path
    const path = d3.geoPath().projection(projection);

    let Zoom = d3
      .zoom()
      .scaleExtent([0.8, 8])
      .on('zoom', zoomed);

    mapSVG.call(Zoom);

    let mapG = mapSVG
      .append('g')
      .attr('class', 'masterG')
      .attr('transform', `translate(0,-10)`);

    //g for adding map
    let g = mapG.append('g').attr('class', 'mapG');

    function zoomed() {
      g.attr('transform', d3.event.transform); // updated for d3 v4
    }

    g.append('path')
      .datum(
        topojson.merge(
          mapSimplified,
          mapSimplified.objects.kuntarajat.geometries.filter((d: { id: string }) => true),
        ),
      )
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#ccd2d5');
    g.selectAll(`.cityCircle`)
      .data(props.mapShapeData)
      .enter()
      .append('circle')
      .attr('class', 'cityCircle')
      .attr('cx', (d: mapProperties) => d.x)
      .attr('cy', (d: mapProperties) => d.y)
      .attr('r', (d: any) => {
        if (d[props.radiusScaleKey] === -1) return props.defaultRadius;
        return rScale(d[props.radiusScaleKey]);
      })
      .attr('fill', '#fff')
      .style('cursor', 'pointer')
      .on('click', (d: mapProperties) => {
        setActiveCityData(d);
        toggleModal();
      });

    let keyG = keySVG.append('g').attr('class', 'keyG');
    let colorKey = [...props.colorRange];
    colorKey.reverse().push(props.defaultColor);
    let colorLegend = ['Top 10', '10-20', '20-30', t('main:other'), t('main:noInformation')];
    keyG
      .append('text')
      .attr('x', 5)
      .attr('y', 200 - 55)
      .attr('fill', '#000')
      .attr('font-size', 10)
      .text(t('main:legendInfoLine1'));
    keyG
      .append('text')
      .attr('x', 5)
      .attr('y', 200 - 42)
      .attr('fill', '#000')
      .attr('font-size', 10)
      .text(t('main:legendInfoLine2'));
    keyG
      .selectAll('.keyRect')
      .data(colorKey.reverse())
      .enter()
      .append('rect')
      .attr('class', 'keyRect')
      .attr('x', 5)
      .attr('y', (d: string, i: number) => 200 - i * 20 - 85)
      .attr('fill', (d: string) => d)
      .attr('width', 16)
      .attr('height', 16);
    keyG
      .selectAll('.keyText')
      .data(colorLegend.reverse())
      .enter()
      .append('text')
      .attr('class', 'keyText')
      .attr('x', 23)
      .attr('y', (d: string, i: number) => 200 - i * 20 - 85)
      .attr('dy', 12)
      .attr('fill', '#000')
      .attr('font-size', 12)
      .text((d: string) => d);
    keyG
      .append('text')
      .attr('class', 'keyText')
      .attr('x', 5)
      .attr('y', 180)
      .attr('fill', '#000')
      .attr('font-size', 10)
      .text(t('main:legendInfoLine3'));

    if (t('main:legendInfoLine4') !== '') {
      keyG
        .append('text')
        .attr('class', 'keyText')
        .attr('x', 5)
        .attr('y', 192)
        .attr('fill', '#000')
        .attr('font-size', 10)
        .text(t('main:legendInfoLine4'));
    }

    // eslint-disable-next-line
  }, [i18n.language]);

  useEffect(() => {
    let mapSVG = d3.select(mapNode);
    let sortedData: any = props.mapShapeData
      .filter((a: mapProperties) => a.responses !== -1)
      .sort((a: any, b: any) => d3.descending(a[props.colorScaleKey], b[props.colorScaleKey]));
    let colorDomain = [
      sortedData[29][props.colorScaleKey],
      sortedData[19][props.colorScaleKey],
      sortedData[9][props.colorScaleKey],
    ];
    switch (props.colorScaleTransform) {
      case 'percentPopulation':
        sortedData = props.mapShapeData
          .filter((a: mapProperties) => a.responses !== -1)
          .sort((a: any, b: any) =>
            d3.descending((a[props.colorScaleKey] * 100) / a.population, (b[props.colorScaleKey] * 100) / b.population),
          );
        colorDomain = [
          (sortedData[29][props.colorScaleKey] * 100) / sortedData[29].population,
          (sortedData[19][props.colorScaleKey] * 100) / sortedData[19].population,
          (sortedData[9][props.colorScaleKey] * 100) / sortedData[9].population,
        ];
        break;
      case 'percentResponse':
        sortedData = props.mapShapeData
          .filter((a: mapProperties) => a.responses !== -1)
          .sort((a: any, b: any) =>
            d3.descending((a[props.colorScaleKey] * 100) / a.responses, (b[props.colorScaleKey] * 100) / b.responses),
          );
        colorDomain = [
          (sortedData[29][props.colorScaleKey] * 100) / sortedData[29].responses,
          (sortedData[19][props.colorScaleKey] * 100) / sortedData[19].responses,
          (sortedData[9][props.colorScaleKey] * 100) / sortedData[9].responses,
        ];
        break;
      default:
    }
    let colorScale = d3
      .scaleThreshold()
      .domain(colorDomain)
      .range(props.colorRange);
    if (props.colorDomain) {
      colorScale = d3
        .scaleThreshold()
        .domain(props.colorDomain)
        .range(props.colorRange);
    }
    mapSVG
      .selectAll('.cityCircle')
      .transition()
      .duration(250)
      .attr('fill', (d: any) => {
        if (d[props.colorScaleKey] === -1) return props.defaultColor;
        switch (props.colorScaleTransform) {
          case 'percentPopulation':
            return colorScale((d[props.colorScaleKey] * 100) / d.population);
          case 'percentResponse':
            return colorScale((d[props.colorScaleKey] * 100) / d.responses);
          default:
            return colorScale(d[props.colorScaleKey]);
        }
      });
  }, [
    props.colorScaleKey,
    props.defaultColor,
    props.colorScaleTransform,
    props.colorDomain,
    props.colorRange,
    props.mapShapeData,
  ]);

  useEffect(() => {
    let mapSVG = d3.select(mapNode);
    if (props.popUpOpen) {
      mapSVG.select('.masterG').attr(
        'transform',
        `translate(0,${0 -
          parseFloat(
            d3
              .select('.popUp')
              .style('height')
              .slice(0, -2),
          ) -
          30})`,
      );
      if (props.mapHeight < 345) d3.select(keyNode).style('bottom', '40px');
      else
        d3.select(keyNode).style('bottom', () => {
          return `${parseFloat(
            d3
              .select('.popUp')
              .style('height')
              .slice(0, -2),
          ) + 40}px`;
        });
    } else {
      mapSVG.select('.masterG').attr('transform', `translate(0,-30)`);
      d3.select(keyNode).style('bottom', '40px');
    }
  }, [props.popUpOpen, props.mapHeight]);
  let yOffset = window.innerWidth > props.mapHeight ? 10 : props.popUpOpen ? 90 : 30;
  return (
    <div style={{ height: `${props.mapHeight}px`, width: 'calc(100vW)' }}>
      <svg
        width="100%"
        height="100%"
        ref={node => (mapNode = node)}
        viewBox={`650 ${yOffset} 600 850`}
        preserveAspectRatio="xMidYMid meet"
      />
      <svg
        width="150px"
        height="200px"
        style={{ bottom: '125px', left: '10px', position: 'fixed' }}
        ref={node => (keyNode = node)}
      />
      <Modal isShowing={isShowing} hide={toggleModal} ariaLabel={t('main:cityInformation')}>
        <ModalContent content={activeCityData} hide={toggleModal} />
      </Modal>
    </div>
  );
};

export default Map;
