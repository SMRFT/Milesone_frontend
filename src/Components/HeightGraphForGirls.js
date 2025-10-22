import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, Colors } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const HeightGraphForGirls = () => {
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
        data: [53, 58, 62, 67, 74, 85, 95, 100, 110], // Values for the 97th percentile
        borderColor: 'red',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'red',
        pointRadius: 3,
        tension: 0, // Ensures the line is straight
      },
      {
        label: '85th percentile',
        data: [50, 55, 60, 64, 70, 82, 90, 98, 105], // Values for the 85th percentile
        borderColor: 'orange',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'orange',
        pointRadius: 3,
        tension: 0, // Ensures the line is straight
      },
      {
        label: '50th percentile',
        data: [47, 53, 58, 62, 68, 78, 87, 95, 100], // Values for the 50th percentile
        borderColor: 'green',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'green',
        pointRadius: 3,
        tension: 0, // Ensures the line is straight
      },
      {
        label: '15th percentile',
        data: [45, 50, 55, 60, 65, 73, 82, 90, 98], // Values for the 15th percentile
        borderColor: 'orange',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'orange',
        pointRadius: 3,
        tension: 0, // Ensures the line is straight
      },
      {
        label: '3rd percentile',
        data: [42, 48, 53, 57, 63, 70, 80, 85, 95], // Values for the 3rd percentile
        borderColor: 'red',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: 'red',
        pointRadius: 3,
        tension: 0, // Ensures the line is straight
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
        ticks: {
          callback: function (value, index) {
            const labels = [
              "Birth", "2", "4", "6", "8", "10", "1 year", 
              "2", "4", "6", "8", "10", "2 years", 
              "2", "4", "6", "8", "10", "3 years", 
              "2", "4", "6", "8", "10", "4 years", 
              "2", "4", "6", "8", "10", "5 years"
            ];
            return labels[index]; // Return the corresponding label for the index
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Length/Height (cm)",
        },
        min: 45,
        max: 120,
        ticks: {
          stepSize: 5,
        },
      },
    },
    elements: {
      line: {
        tension: 0, // Ensures straight lines instead of curvesc
        Colors:'#FFB6C1',
      },
    },
    onClick: (e, activeElements) => {
      if (activeElements.length > 0) {
        const datasetIndex = activeElements[0].datasetIndex;
        const dataIndex = activeElements[0].index;
        const selectedPoint = data.datasets[datasetIndex].data[dataIndex];
        alert(`You selected: ${selectedPoint} cm`);
      }
    },
  };

  
  // Custom plugin for background
  const backgroundPlugin = {
    id: 'customBackground',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      ctx.save();
      ctx.fillStyle = '#FFB6C1'; // Light blue background
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.restore();
    },
  };
  
  return (
    <div>
      <h3>Length/Height-for-Age Girls (Birth to 5 years)</h3>
      <Line data={data} options={options} plugins={[backgroundPlugin]}/>
    </div>
  );
};

export default HeightGraphForGirls;
