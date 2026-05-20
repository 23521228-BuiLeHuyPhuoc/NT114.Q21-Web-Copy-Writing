import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

export interface LineSeries {
  key: string;
  label: string;
  color: string;
  fill?: boolean;
  dashed?: boolean;
}

export interface LineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: LineSeries[];
  height?: number;
  yMax?: number;
  yMin?: number;
}

function hexToRgba(hex: string, alpha: number) {
  const m = hex.replace('#', '');
  const v = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function LineChart({ data, xKey, series, height = 280, yMax, yMin }: LineChartProps) {
  const labels = data.map(d => d[xKey]);
  const chartData = {
    labels,
    datasets: series.map(s => ({
      label: s.label,
      data: data.map(d => d[s.key]),
      borderColor: s.color,
      backgroundColor: s.fill ? hexToRgba(s.color, 0.2) : s.color,
      fill: !!s.fill,
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 4,
      borderDash: s.dashed ? [4, 4] : undefined,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: series.length > 1, position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { color: 'rgba(16, 32, 23, 0.08)' }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(16, 32, 23, 0.08)' }, ticks: { font: { size: 11 } }, min: yMin, max: yMax },
    },
    interaction: { mode: 'nearest', intersect: false },
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
