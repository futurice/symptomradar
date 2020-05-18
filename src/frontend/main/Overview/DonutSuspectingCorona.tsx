import React, { useEffect } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

let graphNode!: SVGSVGElement | null;

const Div = styled.div`
  display: flex;
  justify-content: center;
`;

const Donut: React.FunctionComponent<{
  width: number;
  height: number;
  radius: number;
  data: [number, number];
  color: [string, string];
}> = props => {
  useEffect(() => {
    let svg = d3.select(graphNode);
    const pie = d3
      .pie()
      .value((d: number) => d)
      .sort(null);

    const arc = d3
      .arc()
      .innerRadius(props.radius - 50)
      .outerRadius(props.radius - 10);

    let g = svg.append('g').attr('transform', `translate(${props.radius},${props.radius})`);
    g.append('text')
      .attr('fill', props.color[0])
      .attr('text-anchor', 'middle')
      .attr('font-size', '30px')
      .attr('font-weight', 'bold')
      .text(props.data[0].toLocaleString('fi-FI'));
    g.append('text')
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('dy', '20px')
      .text(
        `${parseFloat(((props.data[0] * 100) / (props.data[1] + props.data[0])).toFixed(1))
          .toLocaleString('fi-FI')
          .replace('.', ',')}% of all responses`,
      );
    const path = g
      .selectAll('.arcs')
      .data(pie(props.data))
      .enter()
      .append('g')
      .attr('class', 'arcs');

    path
      .append('path')
      .attr('d', arc)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('fill', (d: any, i: number) => props.color[i]);
  });
  return (
    <Div>
      <svg width={props.width} height={props.height} ref={node => (graphNode = node)} />
    </Div>
  );
};
export default Donut;
