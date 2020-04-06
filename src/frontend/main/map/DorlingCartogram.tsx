import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import Modal from '../Modal';
import ModalContent from '../ModalContent';
import useModal from '../useModal';

let mapNode!: SVGSVGElement | null;

interface mapProperties {
  City?: string;
  name?: string;
  responses: number;
  fever_no: number;
  fever_slight: number;
  fever_high: number;
  cough_no: number;
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

const mapSimplified: any = require('./finland-map-simplified.json');

const Map: React.FunctionComponent<{
  defaultRadius: number;
  svgWidth: number;
  svgHeight: number;
  mapShapeData: { features: { properties: mapProperties }[] };
  mapScale: number;
  colorRange: string[];
  colorDomain?: number[];
  colorScaleKey: string;
  colorScaleTransform?: string;
  defaultColor: string;
  radiusRange: [number, number];
  radiusScaleKey: string;
}> = props => {
  const [activeCityData, setActiveCityData] = useState({});
  const { isShowing, toggleModal } = useModal();

  // radius and color scale
  let rScale = d3
    .scaleSqrt()
    .domain([0, d3.max(props.mapShapeData.features, (el: any) => el.properties[props.radiusScaleKey])])
    .range(props.radiusRange);

  useEffect(() => {
    let mapSVG = d3.select(mapNode);
    mapSVG.selectAll('.mapG').remove();

    // projection for the map shape
    const projection = d3
      .geoTransverseMercator()
      .rotate([-27, -65, 0])
      .scale(props.mapScale)
      .translate([props.svgWidth / 2, props.svgHeight / 2]);

    // covert map spahe to path
    const path = d3.geoPath().projection(projection);

    let Zoom = d3
      .zoom()
      .scaleExtent([0.8, 8])
      .on('zoom', zoomed);

    mapSVG.call(Zoom);

    //g for adding map
    let g = mapSVG.append('g').attr('class', 'mapG');

    function zoomed() {
      g.attr('transform', d3.event.transform); // updated for d3 v4
    }

    let mapShapeData: { features: { properties: any }[] } = JSON.parse(JSON.stringify(props.mapShapeData)); // cloning the json

    //fixing Helsinki and Vantaa circle and also giving the center of each circle so they dont animate weirdly
    mapShapeData.features.forEach((d: { properties: any; fx?: number; fy?: number; x?: number; y?: number }) => {
      d.x = path.centroid(d)[0];
      d.y = path.centroid(d)[1];
      if (d.properties.City === 'Helsinki') {
        d.fx = path.centroid(d)[0];
        d.fy = path.centroid(d)[1];
      }
      if (d.properties.City === 'Vantaa') {
        let indexHelsinkiShape = mapShapeData.features.findIndex(
          (el: { properties: { City: string } }) => el.properties.City === 'Helsinki',
        );
        let rHelsinki = rScale(mapShapeData.features[indexHelsinkiShape].properties[props.radiusScaleKey]);
        let rVantaa = rScale(d.properties[props.radiusScaleKey]);
        d.fx =
          path.centroid(mapShapeData.features[indexHelsinkiShape])[0] +
          (rHelsinki + rVantaa + 2) * Math.cos((45 * Math.PI) / 180);
        d.fy =
          path.centroid(mapShapeData.features[indexHelsinkiShape])[1] -
          (rHelsinki + rVantaa + 2) * Math.sin((45 * Math.PI) / 180);
      }
    });
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
      .data(mapShapeData.features)
      .enter()
      .append('circle')
      .attr('class', `cityCircle`)
      .attr('cx', (d: {}) => path.centroid(d)[0])
      .attr('cy', (d: {}) => path.centroid(d)[1])
      .attr('r', (d: { properties: any }) => {
        if (d.properties[props.radiusScaleKey] === -1) return props.defaultRadius;
        return rScale(d.properties[props.radiusScaleKey]);
      })
      .attr('fill', '#fff')
      .on('click', (d: {}) => {
        setActiveCityData(d);
        toggleModal();
      });
    let tick: () => void = () => {
      g.selectAll('.cityCircle')
        .attr('cx', (d: { x: number }) => d.x)
        .attr('cy', (d: { y: number }) => d.y);
    };
    d3.forceSimulation(mapShapeData.features)
      .force('x', d3.forceX((d: {}) => path.centroid(d)[0]).strength(1))
      .force('y', d3.forceY((d: {}) => path.centroid(d)[1]).strength(1))
      .force(
        'collide',
        d3.forceCollide((d: { properties: any }) => {
          if (d.properties[props.radiusScaleKey] === -1) return props.defaultRadius + 1;
          return rScale(d.properties[props.radiusScaleKey]) + 1;
        }),
      )
      .on('tick', tick);
  }, [
    props.mapScale,
    props.mapShapeData,
    rScale,
    props.defaultRadius,
    props.radiusScaleKey,
    props.svgWidth,
    props.svgHeight,
  ]);
  useEffect(() => {
    let mapSVG = d3.select(mapNode);
    let sortedData: any = props.mapShapeData.features
      .filter((a: { properties: { responses: number } }) => a.properties.responses !== -1)
      .sort((a: any, b: any) => d3.descending(a.properties[props.colorScaleKey], b.properties[props.colorScaleKey]));
    let colorDomain = [sortedData[19].properties[props.colorScaleKey], sortedData[9].properties[props.colorScaleKey]];
    switch (props.colorScaleTransform) {
      case 'percentPopulation':
        sortedData = props.mapShapeData.features
          .filter((a: { properties: { responses: number } }) => a.properties.responses !== -1)
          .sort((a: any, b: any) =>
            d3.descending(
              (a.properties[props.colorScaleKey] * 100) / a.properties.Population,
              (b.properties[props.colorScaleKey] * 100) / b.properties.Population,
            ),
          );
        colorDomain = [
          (sortedData[19].properties[props.colorScaleKey] * 100) / sortedData[19].properties.Population,
          (sortedData[9].properties[props.colorScaleKey] * 100) / sortedData[9].properties.Population,
        ];
        break;
      case 'percentResponse':
        sortedData = props.mapShapeData.features
          .filter((a: { properties: { responses: number } }) => a.properties.responses !== -1)
          .sort((a: any, b: any) =>
            d3.descending(
              (a.properties[props.colorScaleKey] * 100) / a.properties.responses,
              (b.properties[props.colorScaleKey] * 100) / b.properties.responses,
            ),
          );
        colorDomain = [
          (sortedData[19].properties[props.colorScaleKey] * 100) / sortedData[19].properties.responses,
          (sortedData[9].properties[props.colorScaleKey] * 100) / sortedData[9].properties.responses,
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
      .attr('fill', (d: { properties: any }) => {
        if (d.properties[props.colorScaleKey] === -1) return props.defaultColor;
        switch (props.colorScaleTransform) {
          case 'percentPopulation':
            return colorScale((d.properties[props.colorScaleKey] * 100) / d.properties.Population);
          case 'percentResponse':
            return colorScale((d.properties[props.colorScaleKey] * 100) / d.properties.responses);
          default:
            return colorScale(d.properties[props.colorScaleKey]);
        }
      });
  }, [
    props.colorScaleKey,
    props.defaultColor,
    props.colorScaleTransform,
    props.colorDomain,
    props.colorRange,
    props.mapShapeData.features,
    props.svgWidth,
    props.svgHeight,
  ]);
  return (
    <div>
      <svg width={props.svgWidth} height={props.svgHeight} ref={node => (mapNode = node)} />
      <Modal isShowing={isShowing} hide={toggleModal}>
        <ModalContent content={activeCityData} />
      </Modal>
    </div>
  );
};

export default Map;
