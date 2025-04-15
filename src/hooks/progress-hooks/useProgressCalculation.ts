import { $, useSignal } from "@builder.io/qwik";
import type { Sections, Section, Priority } from "~/types/PSC";
import { useLocalStorage } from "~/hooks/useLocalStorage";

export const useProgressCalculation = () => {
  const [checkedItems] = useLocalStorage("PSC_PROGRESS", {});
  const [ignoredItems] = useLocalStorage("PSC_IGNORED", {});
  const totalProgress = useSignal({ completed: 0, outOf: 0 });
  const sectionCompletion = useSignal<number[]>([]);

  const calculateProgress = $(
    (sections: Sections): { completed: number; outOf: number } => {
      if (!checkedItems.value || !sections.length) {
        return { completed: 0, outOf: 0 };
      }
      let totalItems = sections.reduce(
        (total: number, section: Section) => total + section.checklist.length,
        0
      );
      let totalComplete = 0;
      sections.forEach((section: Section) => {
        section.checklist.forEach((item) => {
          const id = item.point.toLowerCase().replace(/ /g, "-");
          const isComplete = checkedItems.value[id];
          const isIgnored = ignoredItems.value[id];
          if (isComplete) {
            totalComplete++;
          }
          if (isIgnored) {
            totalItems--;
          }
        });
      });
      return { completed: totalComplete, outOf: totalItems };
    }
  );

  const filterByPriority = $(
    (sections: Sections, priority: Priority): Sections => {
      const normalize = (pri: string) => pri.toLowerCase().replace(/ /g, "-");
      return sections.map((section) => ({
        ...section,
        checklist: section.checklist.filter(
          (item) => normalize(item.priority) === normalize(priority)
        ),
      }));
    }
  );

  return {
    calculateProgress,
    filterByPriority,
    totalProgress,
    sectionCompletion,
  };
};
