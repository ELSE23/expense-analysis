import React, { useState, useEffect } from 'react';
import { useRequest } from '@/hooks';
import ChartsCard from './libs/ChartsCard';
import styles from './style.module.scss';

export interface Propertie {
  date: string;
  text: string;
  tags: string[];
  money: number;
  event: string;
}
export type Properties = Propertie[];

const Analysis = () => {
  const [propertieData, setPropertieData] = useState<Propertie[]>([]);
  const [request, loading] = useRequest();
  useEffect(() => {
    (async () => {
      const [err, res] = await request('/getExpenseData');
      if (!err) {
        setPropertieData(
          res.data.results
            .map(({ properties }: any) => {
              const date: string = properties.Date.date.start;
              const text: string = properties.Name.title.find(
                (item: any) => item.type === 'text'
              )?.plain_text;
              const tags = properties.Tags.multi_select.map(
                (item: any) => item.name
              );
              let money: number = +(text.match(/[\d\.]+/)?.[0] || 0);
              let event: string = text.replace(/[\d\.]+/, '').trim();

              return {
                date,
                text,
                tags,
                money,
                event
              };
            })
            .sort(
              (a: Propertie, b: Propertie) =>
                Date.parse(a.date) - Date.parse(b.date)
            )
        );
      }
    })();
  }, []);

  const multipleTags =
    propertieData.find(item => item.tags.length > 1)?.tags || [];

  return (
    <div className={styles.container}>
      <ChartsCard title="总览" data={propertieData} loading={loading} />
      {multipleTags.map(tag => (
        <ChartsCard
          key={tag}
          title={`${tag}的支出`}
          data={propertieData.filter(item => item.tags[0] === tag)}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default Analysis;
