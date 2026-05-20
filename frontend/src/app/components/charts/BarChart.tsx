import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

export interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: BarSeries[];
  height?: number;
  yMax?: number;
  yMin?: number;
  valueSuffix?: string;
}

export function BarChart({ data, xKey, series, height = 280, yMax, yMin, valueSuffix }: BarChartProps) {
  const labels = data.map(d => d[xKey]);
  const chartData = {
    labels,
    datasets: series.map(s => ({
      label: s.label,
      data: data.map(d => d[s.key]),
      backgroundColor: s.color,
      borderColor: s.color,
      borderRadius: 6,
      borderSkipped: false as const,
    })),
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: series.length > 1, position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: valueSuffix
          ? { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}${valueSuffix}` }
          : undefined,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(16, 32, 23, 0.08)' }, ticks: { font: { size: 11 } }, min: yMin, max: yMax },
    },
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
