// components/psc/progress-ui/radarChartProgress.tsx
import { component$, useOnWindow } from "@builder.io/qwik";
import { useRadarChart } from "~/hooks/progress-hooks/useRadarChart";

export default component$(() => {
  const { radarChart, initializeRadarChart } = useRadarChart();

  useOnWindow("load", initializeRadarChart);

  return (
    <div class="rounded-box w-full max-w-lg p-4 m-auto animate-fade-in shadow-sm border border-gray-200">
      <h3 class="text-[#9b2a2a] text-center font-[700] text-2xl mb-2">
        Radar Chart
      </h3>
      <canvas ref={radarChart} id="myChart" class="min-w-96 min-h-96"></canvas>
    </div>
  );
});
