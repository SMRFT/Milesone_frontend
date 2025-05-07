import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeightGraphForGirls = () => {
  const chartRef = useRef(null);

  const data = {
    labels: [
      "Birth",
      "2",
      "4",
      "6",
      "8",
      "10",
      "1 year",
      "2",
      "4",
      "6",
      "8",
      "10",
      "2 years",
      "2",
      "4",
      "6",
      "8",
      "10",
      "3 years",
      "2",
      "4",
      "6",
      "8",
      "10",
      "4 years",
      "2",
      "4",
      "6",
      "8",
      "10",
      "5 years",
    ],
    datasets: [
      {
        label: "97th Percentile",
        data: [
          3.5, 5.5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
          23, 24,
        ],
        borderColor: "red",
        fill: false,
        borderWidth: 2,
      },
      {
        label: "85th Percentile",
        data: [
          3, 5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5, 16.5,
        ],
        borderColor: "orange",
        fill: false,
        borderWidth: 2,
      },
      {
        label: "50th Percentile",
        data: [2.5, 4.5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        borderColor: "green",
        fill: false,
        borderWidth: 2,
      },
      {
        label: "15th Percentile",
        data: [2, 3.5, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        borderColor: "orange",
        fill: false,
        borderWidth: 2,
      },
      {
        label: "3rd Percentile",
        data: [1.5, 3, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5],
        borderColor: "red",
        fill: false,
        borderWidth: 2,
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
        text: "Weight-for-age Percentiles (Girls)",
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
          callback: function (value, index, values) {
            const labels = [
              "Birth",
              "2",
              "4",
              "6",
              "8",
              "10",
              "1 year",
              "2",
              "4",
              "6",
              "8",
              "10",
              "2 years",
              "2",
              "4",
              "6",
              "8",
              "10",
              "3 years",
              "2",
              "4",
              "6",
              "8",
              "10",
              "4 years",
              "2",
              "4",
              "6",
              "8",
              "10",
              "5 years",
            ];
            return labels[index]; // Use the custom labels for X-axis
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Weight (kg)",
        },
        min: 2,
        max: 24,
        ticks: {
          stepSize: 2,
        },
      },
    },
  };

  const handleClick = (event) => {
    const chart = chartRef.current;

    if (!chart) return;

    // Use the event directly in getElementsAtEventForMode without 'native'
    const points = chart.getElementsAtEventForMode(
      event,
      "nearest",
      { intersect: true },
      true
    );

    if (points.length) {
      const firstPoint = points[0];
      const label = data.labels[firstPoint.index];
      const datasetLabel = data.datasets[firstPoint.datasetIndex].label;
      alert(`You clicked on: ${datasetLabel} at age: ${label} months`);
    }
  };

  return (
    <div>
      <Line
        ref={chartRef}
        data={data}
        options={options}
        onClick={handleClick}
      />
    </div>
  );
};

export default WeightGraphForGirls;
