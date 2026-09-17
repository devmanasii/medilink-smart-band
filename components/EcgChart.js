'use client';

import { useEffect, useRef, useState } from 'react';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function EcgChart({ liveData, height = 200 }) {
  const [ecgPoints, setEcgPoints] = useState(Array(100).fill(0));
  const intervalRef = useRef(null);

  // Simulate ECG waveform when liveData is available
  useEffect(() => {
    if (liveData?.ecg) {
      setEcgPoints((prev) => {
        const next = [...prev.slice(1), liveData.ecg];
        return next;
      });
    } else {
      // Simulate a realistic ECG pattern for demo
      let step = 0;
      intervalRef.current = setInterval(() => {
        step++;
        setEcgPoints((prev) => {
          const t = step % 60;
          let val = 0;
          // P wave
          if (t >= 5 && t <= 10) val = 0.15 * Math.sin(((t - 5) / 5) * Math.PI);
          // QRS complex
          else if (t === 15) val = -0.1;
          else if (t === 16) val = 1.0;
          else if (t === 17) val = -0.3;
          // T wave
          else if (t >= 22 && t <= 30) val = 0.3 * Math.sin(((t - 22) / 8) * Math.PI);
          return [...prev.slice(1), val];
        });
      }, 50);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [liveData]);

  const data = {
    labels: ecgPoints.map((_, i) => i),
    datasets: [
      {
        label: 'ECG',
        data: ecgPoints,
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: {
        display: true,
        min: -0.5,
        max: 1.5,
        grid: { color: 'rgba(100, 116, 139, 0.1)' },
        ticks: { font: { size: 10 }, color: 'rgba(100, 116, 139, 0.6)' },
      },
    },
  };

  return (
    <div style={{ height }} className="w-full">
      <Line data={data} options={options} />
    </div>
  );
}
