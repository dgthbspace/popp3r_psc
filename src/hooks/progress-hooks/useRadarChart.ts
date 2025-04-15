import { $, useSignal, useContext } from "@builder.io/qwik";
import { Chart, registerables } from "chart.js";
import { ChecklistContext } from "~/store/checklist-context";
import { useProgressCalculation } from "~/hooks/progress-hooks/useProgressCalculation";
import type { Sections, Section, Priority } from "~/types/PSC";

interface RadarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    [key: string]: any; // Anything else goes!
  }[];
}

export const useRadarChart = () => {
  const radarChart = useSignal<HTMLCanvasElement>();
  const checklists = useContext(ChecklistContext);
  const { calculateProgress, filterByPriority } = useProgressCalculation();

  const makeRadarData = $((sections: Sections): Promise<RadarChartData> => {
    const labels = sections.map((section: Section) => section.title);
    const datasetTemplate = {
      borderWidth: 1,
    };
    const calculatePercentage = async (
      section: Section,
      priority: Priority
    ) => {
      const filteredSections = await filterByPriority([section], priority);
      const progress = await calculateProgress(filteredSections);
      return progress.outOf > 0
        ? (progress.completed / progress.outOf) * 100
        : 0;
    };

    const buildDataForPriority = (priority: Priority, color: string) => {
      return Promise.all(
        sections.map((section) => calculatePercentage(section, priority))
      ).then((data) => ({
        ...datasetTemplate,
        label: priority.charAt(0).toUpperCase() + priority.slice(1),
        data: data,
        backgroundColor: color,
      }));
    };

    return Promise.all([
      buildDataForPriority("advanced", "hsl(0 91% 71%/75%)"),
      buildDataForPriority("optional", "hsl(43 96% 56%/75%)"),
      buildDataForPriority("essential", "hsl(158 64% 52%/75%)"),
    ]).then((datasets) => ({
      labels,
      datasets,
    }));
  });

  const initializeRadarChart = $(() => {
    Chart.register(...registerables);

    makeRadarData(checklists.value).then((data) => {
      if (radarChart.value) {
        new Chart(radarChart.value, {
          type: "radar",
          data,
          options: {
            responsive: true,
            scales: {
              r: {
                angleLines: {
                  display: true,
                  color: "#7d7d7da1",
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                  stepSize: 25,
                  callback: (value) => `${value}%`,
                  color: "#ffffffbf",
                  backdropColor: "#ffffff3b",
                },
                grid: {
                  display: true,
                  color: "#7d7d7dd4",
                },
                pointLabels: {
                  font: {
                    size: 14, 
                    weight: 700,
                    family: "Poppins",
                  },
                },
              },
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  font: {
                    size: 14,
                    weight: 700,
                    family: "Poppins",
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) =>
                    `Completed ${Math.round(ctx.parsed.r)}% of ${
                      ctx.dataset.label || ""
                    } items`,
                },
              },
            },
            animation: {
              duration: 1500,
              easing: "easeInCubic",
            },
          },
        });
      }
    });
  });

  return {
    radarChart,
    initializeRadarChart,
  };
};
