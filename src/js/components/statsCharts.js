import { formatShortDate } from '../utils/helpers.js';

function niceMax(value, goal) {
  return Math.max(value, goal || 0, 1) * 1.15;
}

function buildPoints(values, width, height, padX, padY, maxY) {
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const step = values.length > 1 ? innerW / (values.length - 1) : 0;

  return values.map((value, i) => {
    const x = padX + step * i;
    const y = padY + innerH - (value / maxY) * innerH;
    return { x, y, value };
  });
}

function pointsToPath(points) {
  if (!points.length) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function areaPath(linePath, points, height, padY) {
  if (!points.length) return '';
  const last = points[points.length - 1];
  const first = points[0];
  const bottom = height - padY;
  return `${linePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
}

export function renderSvgLineChart(container, {
  labels,
  values,
  color,
  goal,
  unit,
  title,
  icon,
}) {
  const width = 420;
  const height = 170;
  const padX = 28;
  const padY = 18;
  const maxVal = Math.max(...values, 0);
  const maxY = niceMax(maxVal, goal);
  const points = buildPoints(values, width, height, padX, padY, maxY);
  const linePath = pointsToPath(points);
  const fillPath = areaPath(linePath, points, height, padY);
  const goalY = padY + (height - padY * 2) - (goal / maxY) * (height - padY * 2);
  const labelStep = labels.length > 10 ? Math.ceil(labels.length / 6) : 1;

  const xLabels = labels.map((label, i) => {
    if (i % labelStep !== 0 && i !== labels.length - 1) return '';
    const x = points[i]?.x ?? padX;
    return `<text x="${x}" y="${height - 4}" text-anchor="middle" class="stats-chart-label">${label}</text>`;
  }).join('');

  const dots = points.map((p) => `
    <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#fff" stroke="${color}" stroke-width="2" />
  `).join('');

  container.innerHTML = `
    <div class="stats-chart-card">
      <div class="stats-chart-card__head">
        <span><i class="bi ${icon}"></i> ${title}</span>
        <span class="stats-chart-card__peak">макс. ${maxVal} ${unit}</span>
      </div>
      <svg class="stats-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
        <defs>
          <linearGradient id="grad-${container.id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.28" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        ${goal ? `<line x1="${padX}" y1="${goalY}" x2="${width - padX}" y2="${goalY}" class="stats-chart-goal" />` : ''}
        ${fillPath ? `<path d="${fillPath}" fill="url(#grad-${container.id})" />` : ''}
        <path d="${linePath}" class="stats-chart-line" stroke="${color}" />
        ${dots}
        ${xLabels}
      </svg>
    </div>`;
}

export function buildChartLabels(dateKeys) {
  return dateKeys.map((key) => formatShortDate(key));
}
