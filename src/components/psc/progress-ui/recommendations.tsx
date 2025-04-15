import {
  component$,
  $,
  useStore,
  useOnWindow,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { ChecklistContext } from "~/store/checklist-context";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import Icon from "~/components/core/icon";
import { parseMarkdown } from "~/store/utils";
import type { Checklist, Priority } from "~/types/PSC";

interface RecommendationState {
  item: Checklist;
  icon: string;
  color: string;
  sectionSlug: string;
}

export default component$(() => {
  const checklists = useContext(ChecklistContext);
  const [checkedItems] = useLocalStorage("PSC_PROGRESS", {});
  const [ignoredItems] = useLocalStorage("PSC_IGNORED", {});

  const recommendations = useSignal<RecommendationState[]>([]);
  const expandedState = useStore<{ [key: number]: boolean }>({});
  const isLoading = useSignal(false);

  const getUncheckedItems = $(() => {
    return checklists.value.flatMap((section) =>
      section.checklist
        .filter(
          (item) =>
            !checkedItems.value[item.point.toLowerCase().replace(/ /g, "-")] &&
            !ignoredItems.value[item.point.toLowerCase().replace(/ /g, "-")]
        )
        .map((item) => ({
          item,
          icon: section.icon,
          color: section.color,
          sectionSlug: section.slug,
        }))
    );
  });

  const refreshRecommendations = $(async () => {
    isLoading.value = true;
    const allItems = await getUncheckedItems();
    if (allItems.length === 0) {
      recommendations.value = [];
    } else {
      recommendations.value = allItems
        .sort(() => 0.5 - Math.random())
        .slice(0, 9);
    }
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  });

  useOnWindow("load", refreshRecommendations);

  const toggleAccordion = $((index: number) => {
    expandedState[index] = !expandedState[index];
  });

  const getBadgeClass = (priority: Priority) => {
    switch (priority.toLowerCase()) {
      case "essential":
        return "bg-green-500 text-white";
      case "optional":
        return "bg-yellow-500 text-white";
      case "advanced":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getHoverBgClass = (color: string) => {
    return `hover:bg-opacity-30 hover:bg-${color}-500`;
  };

  const getExpandedBgClass = (color: string) => {
    return `bg-${color}-100`;
  };

  return (
    <div class="p-4 w-full max-w-2xl relative flex-1">
      <div class="flex items-center justify-center mb-2 relative">
        <h3 class="text-[#9b2a2a] font-bold text-2xl">Recommendations</h3>
        <button
          onClick$={refreshRecommendations}
          class="text-[#9b2a2a] hover:text-gray-700 transition-colors duration-300 p-2 rounded-full absolute right-0"
          aria-label="Refresh Recommendations"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-6 h-6"
          >
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0115-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 01-15 6.7L3 16"></path>
          </svg>
        </button>
      </div>
      <ul class="list-none">
        {recommendations.value.length === 0 ? (
          <li class="text-lg mb-2 border border-gray-200 shadow-sm rounded-lg p-4 text-center">
            Congratulations, you have completed all recommendations!
          </li>
        ) : (
          recommendations.value.map(
            ({ item, icon, color, sectionSlug }, index) => (
              <li
                key={index}
                class={`text-lg mb-2 border bg- border-gray-200 shadow-sm rounded-lg ${
                  expandedState[index] ? getExpandedBgClass(color) : ""
                } transition-all duration-500 ${
                  isLoading.value ? "animate-fade-in" : ""
                }`}
              >
                <div
                  class={`flex items-center gap-2 cursor-pointer p-2 ${
                    expandedState[index] ? `bg-opacity-10 bg-${color}-500` : ""
                  } ${getHoverBgClass(color)} transition-all duration-500`}
                  onClick$={() => toggleAccordion(index)}
                >
                  <div class="flex flex-col flex-1">
                    <div class="flex items-center gap-2">
                      <Icon icon={icon} width={16} color={color} />
                      <a
                        href={`/checklist/${sectionSlug}#${item.point
                          .toLowerCase()
                          .replace(/ /g, "-")}`}
                        class={`hover:text-${color}-400 transition-colors duration-500 text-ellipsis overflow-hidden`}
                      >
                        {item.point}
                      </a>
                    </div>
                    <div
                      class={`badge p-3 my-[6.5px] gap-2 shadow-lg ${getBadgeClass(
                        item.priority
                      )} rounded-full text-xs`}
                    >
                      <span class="flex font-[700] uppercase text-black items-center gap-1">
                        {item.priority.charAt(0).toUpperCase() +
                          item.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <span
                    class={`ml-auto ${
                      expandedState[index]
                        ? "rotate-180 text-red-500"
                        : "text-gray-500"
                    } transition-transform duration-500`}
                  >
                    ▼
                  </span>
                </div>
                <div
                  class={`overflow-hidden max-height-transition transition-all duration-500 ease-in-out ${
                    expandedState[index]
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    class="p-2 border-t border-gray-200 text-sm bg-[#ffcece1c]"
                    dangerouslySetInnerHTML={parseMarkdown(item.details)}
                  ></div>
                </div>
              </li>
            )
          )
        )}
      </ul>
    </div>
  );
});
