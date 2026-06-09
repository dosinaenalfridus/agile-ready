"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export function OrgChart({ saaf, ai }: { saaf: number, ai: number }) {
  const data = [
    { name: 'SAAF Score', score: Number(saaf.toFixed(1)) },
    { name: 'AI Readiness', score: Number(ai.toFixed(1)) },
  ];

  return (
    <div className="w-full h-64 mt-8 flex justify-center items-center">
      <ResponsiveContainer width="95%" height="100%">
        <BarChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 10 }} barCategoryGap="25%">
          <XAxis
            dataKey="name"
            tick={{ fontSize: 13, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              padding: '10px 14px'
            }}
            formatter={(value: any) => [`${value}%`, 'Score']}
            itemStyle={{ fontWeight: 600 }}
          />
          <Bar dataKey="score" radius={[8, 8, 8, 8]} maxBarSize={110} animationDuration={1500}>
            <LabelList
              dataKey="score"
              position="top"
              formatter={(val: any) => `${val}%`}
              className="fill-foreground font-semibold text-sm"
              dy={-10}
            />
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? '#f97316' : '#3b82f6'}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
