// components/psc/progress-ui/totalProgress.tsx
import { component$, useContext, useOnWindow, $ } from "@builder.io/qwik";
import { ChecklistContext } from "~/store/checklist-context";
import { useProgressCalculation } from "~/hooks/progress-hooks/useProgressCalculation";

export default component$(() => {
  const checklists = useContext(ChecklistContext);
  const { calculateProgress, totalProgress } = useProgressCalculation();

  useOnWindow(
    "load",
    $(() => {
      calculateProgress(checklists.value).then((progress) => {
        totalProgress.value = progress;
      });
    })
  );

  const items = [
    { id: "essential-container", label: "Essential" },
    { id: "optional-container", label: "Optional" },
    { id: "advanced-container", label: "Advanced" },
  ];

  return (
    <div class="rounded-box w-full max-w-lg p-4 mx-auto animate-fade-in flex flex-col items-center justify-center border border-gray-200 shadow-sm">
      <h3 class="text-[#9b2a2a] text-center font-[700] text-2xl mb-2">
        Your Progress
      </h3>
      <p class="text-lg mb-4 text-center">
        You've completed{" "}
        <b>
          {totalProgress.value.completed} out of {totalProgress.value.outOf}
        </b>{" "}
        items
      </p>
      <progress
        class="progress w-full mb-4"
        value={totalProgress.value.completed}
        max={totalProgress.value.outOf}
        data-tip={`Completed ${totalProgress.value.completed} out of ${totalProgress.value.outOf} items`}
      ></progress>
      <div class="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            class="flex flex-col items-center w-20 p-2 mx-2.5 rounded-box text-center"
          >
            <div class="relative h-10 w-20" id={item.id}></div>
            <p class="text-center">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
});
