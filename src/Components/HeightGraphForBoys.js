import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, Filler } from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, Filler);
const HeightGraphForBoys = () => {
  const data = {
    labels: [
      "Birth", "2", "4", "6", "8", "10", "1 year",
      "2", "4", "6", "8", "10", "2 years",
      "2", "4", "6", "8", "10", "3 years",
      "2", "4", "6", "8", "10", "4 years",
      "2", "4", "6", "8", "10", "5 years"
    ],
    datasets: [
      {
        label: '97th percentile',
        data: [53, 58, 62, 67, 74, 85, 95, 100, 110],
        borderColor: 'red',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'red',
        pointRadius: 3,
        tension: 0,
      },
      {
        label: '85th percentile',
        data: [50, 55, 60, 64, 70, 82, 90, 98, 105],
        borderColor: 'orange',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'orange',
        pointRadius: 3,
        tension: 0,
      },
      {
        label: '50th percentile',
        data: [47, 53, 58, 62, 68, 78, 87, 95, 100],
        borderColor: 'green',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'green',
        pointRadius: 3,
        tension: 0,
      },
      {
        label: '15th percentile',
        data: [45, 50, 55, 60, 65, 73, 82, 90, 98],
        borderColor: 'orange',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'orange',
        pointRadius: 3,
        tension: 0,
      },
      {
        label: '3rd percentile',
        data: [42, 48, 53, 57, 63, 70, 80, 85, 95],
        borderColor: 'red',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'red',
        pointRadius: 3,
        tension: 0,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Length/Height-for-Age Percentiles (Boys)",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Age (completed months and years)",
        },
        grid: {
          color: (context) => (context.tick.label === "10" ? "#000" : "#E0E0E0"), // Bold for "10 years"
          lineWidth: (context) => (context.tick.label === "10" ? 2 : 1), // Thicker for "10 years"
        },
        ticks: {
          callback: function (value, index) {
            const labels = [
              "Birth", "2", "4", "6", "8", "10", "1 year",
              "2", "4", "6", "8", "10", "2 years",
              "2", "4", "6", "8", "10", "3 years",
              "2", "4", "6", "8", "10", "4 years",
              "2", "4", "6", "8", "10", "5 years"
            ];
            return labels[index];
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Length/Height (cm)",
        },
        grid: {
          color: "#E0E0E0",
        },
        min: 45,
        max: 120,
        ticks: {
          stepSize: 5,
        },
      },
    },
    onClick: (event, activeElements, chart) => {
      const canvasPosition = {
        x: event.native.clientX - chart.canvas.getBoundingClientRect().left,
        y: event.native.clientY - chart.canvas.getBoundingClientRect().top,
      };
      const xIndex = chart.scales.x.getValueForPixel(canvasPosition.x); // Get x-axis value for click
      const yValue = chart.scales.y.getValueForPixel(canvasPosition.y); // Get y-axis value for click
      const xLabel = data.labels[Math.round(xIndex)];
      alert(`You clicked on Age: ${xLabel}, Height: ${yValue} cm`);
    }
  }
  // Custom plugin for background
  const backgroundPlugin = {
    id: 'customBackground',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      ctx.save();
      ctx.fillStyle = '#D0E6F7'; // Light blue background
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.restore();
    },
  };
  return (
    <div>
      <h3>Length/Height-for-Age Boys (Birth to 5 years)</h3>
      <Line data={data} options={options} plugins={[backgroundPlugin]} />
    </div>
  );
};
export default HeightGraphForBoys;