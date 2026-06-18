import React from 'react';
import Plot from 'react-plotly.js';

const ELECTRIC = '#6ee7f7';
const CORAL = '#ff6b8a';
const NAVY3 = '#111827';
const TEXT_SEC = '#8896b3';
const TEXT_MUT = '#4a5568';

const baseLayout = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { family: 'DM Sans, sans-serif', color: TEXT_SEC, size: 12 },
  margin: { t: 10, r: 16, b: 48, l: 48 },
  showlegend: true,
  legend: {
    font: { color: TEXT_SEC, size: 11 },
    bgcolor: 'transparent',
    bordercolor: 'transparent',
  },
  xaxis: {
    gridcolor: 'rgba(110,231,247,0.06)',
    linecolor: 'rgba(110,231,247,0.12)',
    tickfont: { color: TEXT_MUT, size: 11 },
    zerolinecolor: 'rgba(110,231,247,0.08)',
  },
  yaxis: {
    gridcolor: 'rgba(110,231,247,0.06)',
    linecolor: 'rgba(110,231,247,0.12)',
    tickfont: { color: TEXT_MUT, size: 11 },
    zerolinecolor: 'rgba(110,231,247,0.08)',
  },
};

const config = { displayModeBar: false, responsive: true };

const ChartCard = ({ title, children }) => (
  <div className="chart-item">
    <div className="chart-title">{title}</div>
    {children}
  </div>
);

const SentimentChart = ({ sentimentData }) => {
  const chartData = sentimentData.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('en-GB'),
    sentiment: item.sentiment,
    confidence: item.confidence,
  }));

  const sentimentDistribution = sentimentData.reduce(
    (acc, item) => {
      if (item.sentiment === 'POSITIVE') acc.positive++;
      else if (item.sentiment === 'NEGATIVE') acc.negative++;
      return acc;
    },
    { positive: 0, negative: 0 }
  );

  const sentimentByDate = sentimentData.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString('en-GB');
    if (!acc[date]) acc[date] = { positive: 0, negative: 0 };
    if (item.sentiment === 'POSITIVE') acc[date].positive++;
    if (item.sentiment === 'NEGATIVE') acc[date].negative++;
    return acc;
  }, {});

  const dates = Object.keys(sentimentByDate).sort();
  const positiveCounts = dates.map(d => sentimentByDate[d].positive);
  const negativeCounts = dates.map(d => sentimentByDate[d].negative);

  const uniqueDates = [...new Set(chartData.map(i => i.date))].sort();

  const getAvgConf = (sentiment, date) => {
    const items = sentimentData.filter(i =>
      i.sentiment === sentiment &&
      new Date(i.timestamp).toLocaleDateString('en-GB') === date
    );
    if (items.length === 0) return null;
    return parseFloat((items.reduce((a, b) => a + b.confidence, 0) / items.length).toFixed(4));
  };

  // POSITIVE on top (index 1), NEGATIVE on bottom (index 0) — matches reference
  const negRow = uniqueDates.map(d => getAvgConf('NEGATIVE', d));
  console.log('POS row:', uniqueDates.map(d => ({ date: d, conf: getAvgConf('POSITIVE', d) })));
  console.log('NEG row:', uniqueDates.map(d => ({ date: d, conf: getAvgConf('NEGATIVE', d) })));
  const posRow = uniqueDates.map(d => getAvgConf('POSITIVE', d));

  const allVals = [...negRow, ...posRow].filter(v => v !== null);
  const minConf = allVals.length > 0 ? Math.min(...allVals) : 0.8;
  const maxConf = allVals.length > 0 ? Math.max(...allVals) : 1.0;
  const padding = (maxConf - minConf) * 0.1;

  const negRowFilled = negRow.map(v => v === null ? minConf : v);
  const posRowFilled = posRow.map(v => v === null ? minConf : v);

  return (
    <div className="chart-container">

      {/* Line Chart */}
      <ChartCard title="Distribution over time">
        <Plot
          data={[
            {
              x: dates, y: positiveCounts,
              type: 'scatter', mode: 'lines+markers',
              name: 'Positive',
              line: { color: ELECTRIC, width: 2 },
              marker: { color: ELECTRIC, size: 6 },
            },
            {
              x: dates, y: negativeCounts,
              type: 'scatter', mode: 'lines+markers',
              name: 'Negative',
              line: { color: CORAL, width: 2 },
              marker: { color: CORAL, size: 6 },
            },
          ]}
          layout={{
            ...baseLayout,
            height: 260,
            xaxis: { ...baseLayout.xaxis, title: { text: 'Date', font: { color: TEXT_MUT, size: 11 } } },
            yaxis: { ...baseLayout.yaxis, title: { text: 'Count', font: { color: TEXT_MUT, size: 11 } } },
          }}
          config={config}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* Donut Chart */}
      <ChartCard title="Sentiment proportions">
        <Plot
          data={[
            {
              labels: ['Positive', 'Negative'],
              values: [sentimentDistribution.positive, sentimentDistribution.negative],
              type: 'pie',
              hole: 0.55,
              marker: { colors: [ELECTRIC, CORAL] },
              textinfo: 'percent',
              textfont: { color: NAVY3, size: 13, family: 'DM Sans, sans-serif' },
              outsidetextfont: { color: TEXT_SEC },
            },
          ]}
          layout={{
            ...baseLayout,
            height: 260,
            margin: { t: 10, r: 16, b: 10, l: 16 },
            legend: {
              ...baseLayout.legend,
              orientation: 'h',
              x: 0.5, xanchor: 'center',
              y: -0.08,
            },
          }}
          config={config}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* Bar Chart */}
      <ChartCard title="Sentiment counts">
        <Plot
          data={[
            {
              x: ['Positive'],
              y: [sentimentDistribution.positive],
              type: 'bar',
              name: 'Positive',
              marker: { color: ELECTRIC, opacity: 0.9 },
            },
            {
              x: ['Negative'],
              y: [sentimentDistribution.negative],
              type: 'bar',
              name: 'Negative',
              marker: { color: CORAL, opacity: 0.9 },
            },
          ]}
          layout={{
            ...baseLayout,
            height: 260,
            bargap: 0.5,
            showlegend: false,
            xaxis: { ...baseLayout.xaxis, title: { text: 'Sentiment', font: { color: TEXT_MUT, size: 11 } } },
            yaxis: { ...baseLayout.yaxis, title: { text: 'Count', font: { color: TEXT_MUT, size: 11 } } },
          }}
          config={config}
          style={{ width: '100%' }}
        />
      </ChartCard>

      {/* Heatmap — POSITIVE on top, NEGATIVE on bottom, subtle professional colors */}
      <ChartCard title="Confidence heatmap">
        <Plot
          data={[
            {
              type: 'heatmap',
              x: uniqueDates,
              // Row order: index 0 = POSITIVE (bottom), index 1 = NEGATIVE (top)
              y: ['POSITIVE', 'NEGATIVE'],
              z: [posRowFilled, negRowFilled],
              colorscale: [
                [0.0,  '#0d1a2e'],   // lowest → deep navy
                [0.25, '#1e3a5f'],   // → steel blue
                [0.5,  '#2563a8'],   // → medium blue
                [0.7,  '#0e7490'],   // → teal
                [0.85, '#0d9488'],   // → medium teal
                [1.0,  '#6ee7f7'],   // highest → electric cyan
              ],
              zmin: minConf - padding,
              zmax: maxConf + padding,
              colorbar: {
                title: { text: 'Confidence', font: { color: TEXT_SEC, size: 11 }, side: 'right' },
                tickfont: { color: TEXT_MUT, size: 10 },
                thickness: 14,
                tickformat: '.0%',
                bgcolor: 'transparent',
                bordercolor: 'transparent',
                outlinecolor: 'rgba(110,231,247,0.15)',
              },
              hoverongaps: false,
              showscale: true,
              xgap: 4,
              ygap: 4,
            },
          ]}
          layout={{
            ...baseLayout,
            height: 260,
            margin: { t: 10, r: 90, b: 60, l: 90 },
            xaxis: {
              ...baseLayout.xaxis,
              title: { text: 'Date', font: { color: TEXT_MUT, size: 11 } },
            },
            yaxis: {
              ...baseLayout.yaxis,
              title: { text: 'Sentiment', font: { color: TEXT_MUT, size: 11 } },
              categoryorder: 'array',
              categoryarray: ['POSITIVE', 'NEGATIVE'],
              tickfont: { color: TEXT_SEC, size: 11 },
            },
          }}
          config={config}
          style={{ width: '100%' }}
        />
      </ChartCard>

    </div>
  );
};

export default SentimentChart;