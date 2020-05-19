import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';
import axios from 'axios';

let graphNode!: SVGSVGElement | null;

interface dataObj {
  breathing_difficulties: { yes: number; no: number };
  corona_suspicion: { yes: number; no: number };
  cough: { no: number; mild: number; intense: number };
  day?: string;
  fever: { no: number; slight: number; high: number };
  gender: { female: number; male: number; other: number };
  general_wellbeing: { fine: number; impaired: number; bad: number };
  headache: { yes: number; no: number };
  healthcare_contact: { yes: number; no: number };
  longterm_medication: { yes: number; no: number };
  muscle_pain: { yes: number; no: number };
  rhinitis: { yes: number; no: number };
  sensory_issues: { yes: number; no: number };
  smoking: { yes: number; no: number };
  sore_throat: { yes: number; no: number };
  stomach_issues: { yes: number; no: number };
  total: number;
}

const TimeSeries: React.FunctionComponent<{
  width: number;
  height: number;
  selectedSymptom: string;
  selectedSymptomFirstLine: string;
}> = props => {
  const [data, setData] = useState<any>('FETCHING');
  const dataEndpoint = process.env.REACT_APP_DATA_ENDPOINT;
  const [username, password] = (process.env.REACT_APP_DATA_AUTH || '').split(':');
  const { t } = useTranslation(['main']);
  useEffect(() => {
    axios(`${dataEndpoint}daily_totals.json`, { auth: { username, password } }).then(
      res => {
        let cumulative: dataObj = {
          total: 0,
          breathing_difficulties: {
            yes: 0,
            no: 0,
          },
          corona_suspicion: {
            yes: 0,
            no: 0,
          },
          cough: {
            mild: 0,
            intense: 0,
            no: 0,
          },
          fever: {
            slight: 0,
            high: 0,
            no: 0,
          },
          general_wellbeing: {
            fine: 0,
            impaired: 0,
            bad: 0,
          },
          headache: {
            yes: 0,
            no: 0,
          },
          healthcare_contact: {
            yes: 0,
            no: 0,
          },
          longterm_medication: {
            yes: 0,
            no: 0,
          },
          muscle_pain: {
            yes: 0,
            no: 0,
          },
          rhinitis: {
            yes: 0,
            no: 0,
          },
          sensory_issues: {
            yes: 0,
            no: 0,
          },
          smoking: {
            yes: 0,
            no: 0,
          },
          sore_throat: {
            yes: 0,
            no: 0,
          },
          stomach_issues: {
            yes: 0,
            no: 0,
          },
          gender: {
            male: 0,
            female: 0,
            other: 0,
          },
          day: '',
        };
        const data: dataObj[] = [];
        for (let i = 0; i < res.data.data.length; i++) {
          cumulative.day = res.data.data[i].day;
          cumulative.total += res.data.data[i].total;
          cumulative.breathing_difficulties.yes += res.data.data[i].breathing_difficulties.yes;
          cumulative.breathing_difficulties.no += res.data.data[i].breathing_difficulties.no;
          cumulative.corona_suspicion.yes += res.data.data[i].corona_suspicion.yes;
          cumulative.corona_suspicion.no += res.data.data[i].corona_suspicion.no;
          cumulative.cough.mild += res.data.data[i].cough.mild;
          cumulative.cough.intense += res.data.data[i].cough.intense;
          cumulative.cough.no += res.data.data[i].cough.no;
          cumulative.fever.high += res.data.data[i].fever.high;
          cumulative.fever.no += res.data.data[i].fever.no;
          cumulative.fever.slight += res.data.data[i].fever.slight;
          cumulative.general_wellbeing.fine += res.data.data[i].general_wellbeing.fine;
          cumulative.general_wellbeing.impaired += res.data.data[i].general_wellbeing.impaired;
          cumulative.general_wellbeing.bad += res.data.data[i].general_wellbeing.bad;
          cumulative.headache.yes += res.data.data[i].headache.yes;
          cumulative.headache.no += res.data.data[i].headache.no;
          cumulative.healthcare_contact.yes += res.data.data[i].healthcare_contact.yes;
          cumulative.healthcare_contact.no += res.data.data[i].healthcare_contact.no;
          cumulative.longterm_medication.yes += res.data.data[i].longterm_medication.yes;
          cumulative.longterm_medication.no += res.data.data[i].longterm_medication.no;
          cumulative.muscle_pain.yes += res.data.data[i].muscle_pain.yes;
          cumulative.muscle_pain.no += res.data.data[i].muscle_pain.no;
          cumulative.rhinitis.yes += res.data.data[i].rhinitis.yes;
          cumulative.rhinitis.no += res.data.data[i].rhinitis.no;
          cumulative.sensory_issues.yes += res.data.data[i].sensory_issues.yes;
          cumulative.sensory_issues.no += res.data.data[i].sensory_issues.no;
          cumulative.smoking.yes += res.data.data[i].smoking.yes;
          cumulative.smoking.no += res.data.data[i].smoking.no;
          cumulative.sore_throat.yes += res.data.data[i].sore_throat.yes;
          cumulative.sore_throat.no += res.data.data[i].sore_throat.no;
          cumulative.stomach_issues.yes += res.data.data[i].stomach_issues.yes;
          cumulative.stomach_issues.no += res.data.data[i].stomach_issues.no;
          cumulative.gender.male += res.data.data[i].gender.male;
          cumulative.gender.female += res.data.data[i].gender.female;
          cumulative.gender.other += res.data.data[i].gender.other;
          data.push(JSON.parse(JSON.stringify(cumulative)));
        }
        return setData(data);
      },
      () => setData('ERROR'),
    );
  }, [dataEndpoint, username, password]);
  useEffect(() => {
    if (data !== 'FETCHING' && data !== 'ERROR') {
      const svg = d3.select(graphNode);
      svg.selectAll('.graphG').remove();
      const g = svg.append('g').attr('class', 'graphG');

      const margin = { top: 15, right: 0, bottom: 25, left: 0 },
        width = props.width - margin.left - margin.right,
        height = props.height - margin.top - margin.bottom;
      const y = d3
        .scaleLinear()
        .domain([0, 40])
        .range([height - margin.bottom, margin.top]);
      const x = d3
        .scaleLinear()
        .domain([0, data.length])
        .range([margin.left, width - margin.right]);
      const line = d3
        .line()
        .curve(d3.curveCatmullRom)
        .x((d: dataObj, i: number) => x(i))
        .y((d: any) => y(((d.total - d[props.selectedSymptomFirstLine].no) * 100) / d.total));
      const line1 = d3
        .line()
        .curve(d3.curveCatmullRom)
        .x((d: dataObj, i: number) => x(i))
        .y((d: any) => y(((d.total - d[props.selectedSymptom].no) * 100) / d.total));
      let yAxis = g.append('g');
      for (let i = 5; i < 100; i = i + 5) {
        yAxis
          .append('line')
          .attr('stroke', '#aaa')
          .attr('stroke-width', 1)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-dasharray', '4 2')
          .attr('x1', margin.left)
          .attr('x2', width - margin.right)
          .attr('y1', y(i))
          .attr('y2', y(i));
        yAxis
          .append('text')
          .attr('fill', '#aaa')
          .attr('font-size', 12)
          .attr('x', margin.left)
          .attr('y', y(i))
          .attr('dy', -5)
          .text(`${i}%`);
      }
      let xAxis = g.append('g').attr('tranform', `translate(0,${height})`);
      xAxis
        .append('line')
        .attr('stroke', '#aaa')
        .attr('stroke-width', 1)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(0))
        .attr('y2', y(0));
      for (let i = 0; i < data.length; i = i + 10) {
        let anchor = 'middle';
        if (i === 0) anchor = 'start';
        xAxis
          .append('text')
          .attr('fill', '#aaa')
          .attr('font-size', 10)
          .attr('x', x(i))
          .attr('y', y(0))
          .attr('dy', 15)
          .attr('text-anchor', anchor)
          .text(`${data[i].day.split('-')[1]}-${data[i].day.split('-')[2]}`);
      }
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#FF5252')
        .attr('stroke-width', 2)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line);
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#241A5F')
        .attr('stroke-width', 2)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line1);
    }
  });
  return (
    <div>
      <svg
        aria-label={t('main:timeDevelopment')}
        role="graphics-datachart"
        width={props.width}
        height={props.height}
        ref={node => (graphNode = node)}
      />
    </div>
  );
};

export default TimeSeries;
