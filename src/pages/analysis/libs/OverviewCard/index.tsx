import React, { useState } from 'react';
import { Card, Divider, Select, Alert } from 'antd';
import Charts from 'echarts-for-react';
import { Properties } from '../..';
import { useDidUpdate } from '@/hooks';
import dayjs from 'dayjs';

interface OverviewCardProps {
  title: string;
  data: Properties;
  loading: boolean;
}
interface Serie {
  type: string;
  stack: string;
  barWidth: string;
  name: string;
  data: number[];
}

const OverviewCard = ({ title, data, loading }: OverviewCardProps) => {
  const allEventsSet = new Set<string>();
  data.forEach(item => {
    allEventsSet.add(item.event);
  });
  const allEvents = [...allEventsSet];

  const [filterEvents, setFilterEvents] = useState<string[]>(allEvents);
  useDidUpdate(() => {
    setFilterEvents(allEvents);
  }, [data]);

  const filterData = data.filter(item => filterEvents.includes(item.event));

  const dateMap = new Map<string, Properties>();
  const events = new Set<string>();
  filterData.forEach(item => {
    if (dateMap.has(item.date)) {
      dateMap.get(item.date)!.push(item);
    } else {
      dateMap.set(item.date, [item]);
    }
    events.add(item.event);
  });
  const dateData = Array.from(dateMap.keys());
  const series: Serie[] = [];
  events.forEach(event => {
    const data: number[] = [];
    dateMap.forEach(properties => {
      let sum = 0;
      properties.forEach(item => {
        if (event === item.event) {
          sum += item.money;
        }
      });
      data.push(sum);
    });
    series.push({
      type: 'bar',
      stack: '金额',
      barWidth: '50%',
      name: event,
      data
    });
  });

  return (
    <Card title={title} loading={loading}>
      <Select
        style={{ width: '100%', marginBottom: 10 }}
        allowClear
        mode="multiple"
        maxTagCount={3}
        value={filterEvents}
        onChange={setFilterEvents}
        options={allEvents.map(event => ({ value: event, label: event }))}
      />
      <Alert
        type="success"
        message={`总计金额：${filterData.reduce(
          (total, obj) => total + obj.money,
          0
        )}元`}
      />
      <Charts
        notMerge
        style={{ height: 400 }}
        option={{
          grid: {
            top: '10%',
            left: 0,
            right: '2%',
            bottom: '12%',
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter(arr: any) {
              let _arr = [];
              let axis = '';
              let total = 0;
              arr.forEach((row: any) => {
                if (row.value) {
                  total += row.value;
                  _arr.push(`${row.marker} ${row.seriesName}：${row.value}`);
                  axis = row.axisValue;
                }
              });
              const active = data.find(item => item.date === axis);
              if (active) {
                _arr.push('总计：' + total);
              }
              _arr.push(axis);

              _arr = _arr.reverse();
              return _arr.join('<br/>');
            }
          },
          dataZoom: [
            {
              start: Math.floor(100 - 100 * (4 / dateData.length)),
              end: 100
            }
          ],
          yAxis: {
            type: 'value',
            name: '金额'
          },
          xAxis: {
            type: 'category',
            data: dateData.map(date =>
              dayjs(date, 'YYYY-MM-DD').format('MM/DD')
            )
          },
          series
        }}
      />
      <Divider />
      <Charts
        notMerge
        option={{
          tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
          },
          series: [
            {
              type: 'pie',
              radius: '55%',
              data: series.map(item => ({
                name: item.name,
                value: item.data.reduce((total, current) => total + current, 0)
              }))
            }
          ]
        }}
      />
    </Card>
  );
};

export default React.memo(OverviewCard);
