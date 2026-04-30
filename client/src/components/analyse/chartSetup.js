// Centralised Chart.js registration so we only register controllers/elements once.
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);
// Default styling pulled from CSS variables so charts match the app palette.
function readVar(name, fallback) {
    if (typeof window === 'undefined')
        return fallback;
    const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    return v || fallback;
}
export function chartTheme() {
    return {
        primary: readVar('--color-primary', '#2563eb'),
        primaryLight: readVar('--color-primary-light', '#eff6ff'),
        success: readVar('--color-success', '#16a34a'),
        danger: readVar('--color-danger', '#dc2626'),
        warning: readVar('--color-warning', '#d97706'),
        text: readVar('--color-text', '#1a1d23'),
        textSecondary: readVar('--color-text-secondary', '#5f6368'),
        border: readVar('--color-border', '#e1e4e8'),
        surface: readVar('--color-surface', '#ffffff'),
    };
}
ChartJS.defaults.font.family =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = '#5f6368';
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
export { ChartJS };
//# sourceMappingURL=chartSetup.js.map