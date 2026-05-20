import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  Title,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  Title,
);

Chart.defaults.font.family =
  '"Google Sans Flex", -apple-system, BlinkMacSystemFont, sans-serif';
Chart.defaults.color = '#66736a';
Chart.defaults.borderColor = 'rgba(16, 32, 23, 0.08)';
