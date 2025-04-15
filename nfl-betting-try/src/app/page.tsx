'use client';
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LineElement, LinearScale, PointElement, Title, Tooltip, Legend, Filler);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
}

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const chartRef = useRef<ChartJS<"line", number[], string>>(null);

  const css = `
    .header-alignment {
      text-align: center;
      font-size: 25px;
    }
    `

  useEffect(() => {
    fetch("http://localhost:8000/ags_arr")
      .then((response) => response.json())
      .then((data) => {
        // Assume data.ags_arr is a 2D array: [ [x, y], ... ]
        const fetchedArray: any[][] = data.ags_arr;
        const labels = fetchedArray.map((row) => row[0] as string);
        const yValues = fetchedArray.map((row) => row[1] as number);

        setChartData({
          labels,
          datasets: [
            {
              label: "Year by Year analysis of Games against the Spread",
              data: yValues,
              fill: false,
              borderColor: "black",
              tension: 0.1,
            },
          ],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!chartData) return <p>No data available</p>;

  const options = {
    scales: {
      y: {
        grid: { color: "black" },
        ticks: { color: "black" },
        title: { display: true, text: "NFL Season" },
        display: true,
        min: 10,
      },
      x: {
        grid: { color: "black" },
        ticks: { color: "black" },
        title: { display: true, text: "Games Against the Spread", color: "black" },
        display: true,
      },
    },
  };

  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current;
    if (!chart) return;

    // Use Chart.js method to get elements at event
    const elements = chart.getElementsAtEventForMode(
      event.nativeEvent,
      "nearest",
      { intersect: true },
      false
    );

    if (elements.length > 0) {
      const firstElement = elements[0];
      const index = firstElement.index;
      const label = chartData.labels[index];
      router.push(`/tables?point=${encodeURIComponent(label)}`);
    }
  };

  return (
    <div style={{ width: "1500px", margin: "0 auto" }}>
      <style>{css}</style>
      <h1 className="header-alignment">NFL Betting Visualization</h1>
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        onClick={handleChartClick}
      />
    </div>
  );
}
