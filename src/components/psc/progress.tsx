// pages/index.tsx
import { component$, $ } from "@builder.io/qwik";
import { useOnWindow, useContext } from "@builder.io/qwik";
import ProgressTotal from "~/components/psc/progress-ui/totalProgress";
import ChecklistList from "~/components/psc/progress-ui/checklistsProgress";
import RadarChart from "~/components/psc/progress-ui/radarChartProgress";
import Recommendations from "~/components/psc/progress-ui/recommendations";
import WelcomeDialog from "~/components/psc/progress-ui/welcomeDialog";
import CoursesInfo from "~/components/psc/progress-ui/coursesInfo";
import { ChecklistContext } from "~/store/checklist-context";
import { useProgressCalculation } from "~/hooks/progress-hooks/useProgressCalculation";
import { useDrawProgress } from "~/hooks/progress-hooks/useDrawProgress";
import type { Priority } from "~/types/PSC";

export default component$(() => {
  const {
    calculateProgress,
    filterByPriority,
    totalProgress,
    sectionCompletion,
  } = useProgressCalculation();
  const { drawProgress } = useDrawProgress();
  const checklists = useContext(ChecklistContext);

  const makeDataAndDrawChart = $((priority: Priority, color?: string) => {
    filterByPriority(checklists.value, priority).then((sections) => {
      calculateProgress(sections).then((progress) => {
        const { completed, outOf } = progress;
        const percent = Math.round((completed / outOf) * 100);
        drawProgress(percent, `#${priority}-container`, color);
      });
    });
  });

  useOnWindow(
    "load",
    $(() => {
      calculateProgress(checklists.value).then((progress) => {
        totalProgress.value = progress;
      });

      makeDataAndDrawChart("essential", "hsl(var(--su, 158 64% 52%))");
      makeDataAndDrawChart("optional", "hsl(var(--wa, 43 96% 56%))");
      makeDataAndDrawChart("advanced", "hsl(var(--er, 0 91% 71%))");
    })
  );

  useOnWindow(
    "load",
    $(async () => {
      sectionCompletion.value = await Promise.all(
        checklists.value.map((section) => {
          return calculateProgress([section]).then((progress) =>
            Math.round((progress.completed / progress.outOf) * 100)
          );
        })
      );
    })
  );

  return (
    <div class="flex flex-col items-center gap-6 mb-4 w-full max-w-6xl mx-auto animate-fade-in">
      <WelcomeDialog />
      <div class="flex flex-wrap justify-around w-full gap-6">
        <ProgressTotal />
        <RadarChart />
      </div>
      <div class="flex flex-wrap justify-between w-full gap-6">
        <ChecklistList />
        <Recommendations />
      </div>
      <CoursesInfo />
    </div>
  );
});
