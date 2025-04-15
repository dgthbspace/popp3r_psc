import { $, component$, useStore, useSignal, useTask$ } from "@builder.io/qwik";
import { useCSSTransition } from "qwik-transition";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import type { Priority, Section, Checklist } from "../../types/PSC";
import Icon from "~/components/core/icon";
import {  parseMarkdown } from "~/store/utils";

export default component$((props: { section: Section }) => {
  const [completed, setCompleted] = useLocalStorage("PSC_PROGRESS", {});
  const [ignored, setIgnored] = useLocalStorage("PSC_IGNORED", {});

  const showFilters = useSignal(false);
  const { stage } = useCSSTransition(showFilters, { timeout: 300 });

  const sortState = useStore({ column: "", ascending: true });
  const checklist = useSignal<Checklist[]>(props.section.checklist);
  const expandedItems = useStore<{ [key: string]: boolean }>({});

  const originalFilters = {
    show: "all", // 'all', 'remaining', 'completed'
    levels: {
      essential: true,
      optional: true,
      advanced: true,
    },
  };

  const handleSort = $((column: string) => {
    if (sortState.column === column) {
      sortState.ascending = !sortState.ascending;
    } else {
      sortState.column = column;
      sortState.ascending = true; // Default to ascending
    }
  });

  const filterState = useStore(originalFilters);

  const getBadgeClass = (priority: Priority, precedeClass: string = "") => {
    switch (priority.toLocaleLowerCase()) {
      case "essential":
        return `${precedeClass}success`;
      case "optional":
        return `${precedeClass}warning`;
      case "advanced":
        return `${precedeClass}error`;
      default:
        return `${precedeClass}neutral`;
    }
  };

  const generateId = (title: string) => {
    return title.toLowerCase().replace(/ /g, "-");
  };

  const isIgnored = (pointId: string) => {
    return ignored.value[pointId] || false;
  };

  const isChecked = (pointId: string) => {
    if (isIgnored(pointId)) return false;
    return completed.value[pointId] || false;
  };

  const filteredChecklist = checklist.value.filter((item) => {
    const itemId = generateId(item.point);
    const itemCompleted = isChecked(itemId);
    const itemIgnored = isIgnored(itemId);
    const itemLevel = item.priority;

    // Filter by completion status
    if (filterState.show === "remaining" && (itemCompleted || itemIgnored))
      return false;
    if (filterState.show === "completed" && !itemCompleted) return false;

    // Filter by level
    return filterState.levels[itemLevel.toLocaleLowerCase() as Priority];
  });

  const sortChecklist = (a: Checklist, b: Checklist) => {
    const getValue = (item: Checklist) => {
      switch (sortState.column) {
        case "done":
          if (isIgnored(generateId(item.point))) {
            return 2;
          }
          return isChecked(generateId(item.point)) ? 0 : 1;
        case "advice":
          return item.point;
        case "level":
          return ["essential", "optional", "advanced"].indexOf(
            item.priority.toLowerCase()
          );
        default:
          return 0;
      }
    };
    const valueA = getValue(a);
    const valueB = getValue(b);

    if (valueA === valueB) {
      return 0;
    } else if (sortState.ascending) {
      return valueA < valueB ? -1 : 1;
    } else {
      return valueA > valueB ? -1 : 1;
    }
  };

  const resetFilters = $(() => {
    checklist.value = props.section.checklist;
    sortState.column = "";
    sortState.ascending = true;
    filterState.levels = originalFilters.levels;
    filterState.show = originalFilters.show;
  });

  const calculateProgress = (): {
    done: number;
    total: number;
    percent: number;
    disabled: number;
  } => {
    let done = 0;
    let disabled = 0;
    let total = 0;

    props.section.checklist.forEach((item) => {
      const itemId = generateId(item.point);
      if (isIgnored(itemId)) {
        disabled += 1;
      } else if (isChecked(itemId)) {
        done += 1;
        total += 1;
      } else {
        total += 1;
      }
    });

    const percent = Math.round((done / total) * 100);
    return { done, total: props.section.checklist.length, percent, disabled };
  };

  const { done, total, percent, disabled } = calculateProgress();

  const toggleExpand = $((itemId: string) => {
    expandedItems[itemId] = !expandedItems[itemId];
  });

  useTask$(({ track }) => {
    track(() => expandedItems);
    Object.keys(expandedItems).forEach((itemId) => {
      const element = document.getElementById(`details-${itemId}`);
      if (element) {
        if (expandedItems[itemId]) {
          element.style.maxHeight = `${element.scrollHeight}px`;
        } else {
          element.style.maxHeight = "0px";
        }
      }
    });
  });

  return (
    <>
      <div class="flex skeleton flex-wrap justify-between items-center">
        <div>
          <div class="relative w-[270px] h-2 bg-gray-500 rounded">
            <div
              class={`absolute top-0 left-0 h-full rounded bg-${props.section.color}-500 transition-width duration-500`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p class="text-sm text-center mt-2">
            {done} out of {total} ({percent}%) complete, {disabled} ignored.
          </p>
        </div>
        {/* button to export checklist pdf*/}
        {/* <ExportPDF section={props.section} /> */}

        <div class="flex flex-wrap gap-2 justify-end my-4">
          {(sortState.column ||
            JSON.stringify(filterState) !==
              JSON.stringify(originalFilters)) && (
            <button
              class="btn btn-sm bg-white hover:bg-[#9b2a2a] border border-red-500 hover:text-white "
              onClick$={resetFilters}
            >
              <Icon width={18} height={16} icon="clear" />
              Reset Filters
            </button>
          )}
          <button
            class="btn btn-sm  bg-[#9b2a2a] text-white border  border-red-500 hover:bg-[#ffff] hover:text-[#000000]"
            onClick$={() => {
              showFilters.value = !showFilters.value;
            }}
          >
            <Icon width={18} height={16} icon="filters" />
            {showFilters.value ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      {showFilters.value && (
        <div
          class="flex flex-wrap justify-between bg-base-100 rounded px-4 py-1 mb-2 transition-all duration-300"
          style={{
            opacity: stage.value === "enterTo" ? 1 : 0,
            height: stage.value === "enterTo" ? "auto" : 0,
          }}
        >
          {/* Filter by completion */}
          <div class="flex justify-end items-center gap-1">
            <p class="font-bold text-sm">Show</p>
            <label
              onClick$={() => (filterState.show = "all")}
              class="p-2 rounded hover:bg-front transition-all cursor-pointer flex gap-2"
            >
              <span class="text-sm">All</span>
              <input
                type="radio"
                name="show"
                class="radio radio-sm checked:radio-info"
                checked={filterState.show === "all"}
                aria-label="Show all items"
              />
            </label>
            <label
              onClick$={() => (filterState.show = "remaining")}
              class="p-2 rounded hover:bg-front transition-all cursor-pointer flex gap-2"
            >
              <span class="text-sm">Remaining</span>
              <input
                type="radio"
                name="show"
                class="radio radio-sm checked:radio-error"
                checked={filterState.show === "remaining"}
                aria-label="Show remaining items"
              />
            </label>
            <label
              onClick$={() => (filterState.show = "completed")}
              class="p-2 rounded hover:bg-front transition-all cursor-pointer flex gap-2"
            >
              <span class="text-sm">Completed</span>
              <input
                type="radio"
                name="show"
                class="radio radio-sm checked:radio-success"
                checked={filterState.show === "completed"}
                aria-label="Show completed items"
              />
            </label>
          </div>
          {/* Filter by level */}
          <div class="flex justify-end items-center gap-1">
            <p class="font-bold text-sm">Filter</p>
            <label class="p-2 rounded hover:bg-front transition-all cursor-pointer flex gap-2">
              <span class="text-sm">Essential</span>
              <input
                type="checkbox"
                checked={filterState.levels.essential}
                onChange$={() =>
                  (filterState.levels.essential = !filterState.levels.essential)
                }
                class="checkbox checkbox-sm checked:checkbox-success"
                aria-label="Filter essential items"
              />
            </label>
            <label class="p-2 rounded hover:bg-front transition-all cursor-pointer flex gap-2">
              <span class="text-sm">Optional</span>
              <input
                type="checkbox"
                checked={filterState.levels.optional}
                onChange$={() =>
                  (filterState.levels.optional = !filterState.levels.optional)
                }
                class="checkbox checkbox-sm checked:checkbox-warning"
                aria-label="Filter optional items"
              />
            </label>
            <label class="p-2 rounded hover:bg-front transition-all cursor-pointer flex gap-2">
              <span class="text-sm">Advanced</span>
              <input
                type="checkbox"
                checked={filterState.levels.advanced}
                class="checkbox checkbox-sm checked:checkbox-error"
                onChange$={() =>
                  (filterState.levels.advanced = !filterState.levels.advanced)
                }
                aria-label="Filter advanced items"
              />
            </label>
          </div>
        </div>
      )}

      <div class="overflow-x-auto">
        <table class="table border-collapse shadow-md rounded-lg overflow-hidden">
          <thead class="sticky top-0 bg-gray-100">
            <tr>
              {[
                { id: "level", text: "Level" },
                { id: "advice", text: "Advice" },
                { id: "point", text: "Details", sortable: false }, 
                { id: "done", text: "Done ?" },
              ].map((item) => (
                <th
                  key={item.id}
                  class="cursor-pointer border-b border-t border-gray-200"
                  onClick$={() =>
                    item.sortable !== false && handleSort(item.id)
                  } 
                >
                  <span class="flex items-center text-base uppercase font-[700] gap-2 text-[#fa8484] hover:text-[#9b2a2a] transition">
                    {item.sortable !== false && (
                      <Icon
                        width={15}
                        height={15}
                        class="mb-[2px]"
                        icon={
                          sortState.column === item.id && sortState.ascending
                            ? "sort-asc"
                            : "sort-desc"
                        }
                      />
                    )}
                    {item.text}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody class="divide-y divide-neutral divide-opacity-10">
            {filteredChecklist.sort(sortChecklist).map((item, index) => {
              const badgeColor = getBadgeClass(item.priority);
              const itemId = generateId(item.point);
              const isItemCompleted = isChecked(itemId);
              const isItemIgnored = isIgnored(itemId);
              const isExpanded = expandedItems[itemId];
              return (
                <tr
                  key={index}
                  class={[
                    "rounded-sm transition-all duration-500 border border-gray-200 shadow-sm",
                    isItemCompleted ? `bg-success bg-opacity-5` : "",
                    isItemIgnored ? `bg-neutral bg-opacity-5` : "",
                    !isItemIgnored && !isItemCompleted
                      ? `hover:bg-opacity-5 hover:bg-${badgeColor}`
                      : "",
                  ]}
                >
                  <td class="max-w-[150px] p-2">
                    <div
                      class={[
                        `badge p-3 font-[500] uppercase gap-2 shadow-lg badge-${badgeColor}`,
                        isItemIgnored ? `bg-gray-300 badge-ghost` : ``,
                      ]}
                    >
                      {item.priority}
                    </div>
                  </td>
                  <td class="max-w-[300px] p-2">
                    <label
                      for={`done-${itemId}`}
                      class={` text-lg font-[500] break-words ${
                        isIgnored(itemId)
                          ? "line-through text-slate-500"
                          : "cursor-pointer"
                      }`}
                    >
                      {item.point}
                    </label>
                  </td>
                  <td class="max-w-[400px] p-4">
                    <div
                      class={`overflow-hidden max-height-transition transition-all duration-500 ease-in-out ${
                        isExpanded
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                      id={`details-${itemId}`}
                    >
                      <div
                        class={`p-2 bg-opacity-50 rounded-lg shadow-sm ${
                          isExpanded ? "bg-[#fdadad1c]" : ""
                        } `}
                        dangerouslySetInnerHTML={parseMarkdown(item.details)}
                      ></div>
                    </div>
                    <div class="W-full ">
                      <button
                        class={`flex  items-center transform transition-all duration-500 ease-in-out ${
                          isExpanded ? "text-red-500" : "text-gray-500"
                        }`}
                        onClick$={() => toggleExpand(itemId)}
                        aria-label={`Toggle details for ${item.point}`}
                      >
                        <span
                          class={`transition-transform transform ${
                            isExpanded ? "rotate-180" : "rotate-0"
                          }`}
                        >
                          ▼
                        </span>
                        <span class={`ml-2 text-sm font-[700]`}>
                          {isExpanded ? "Hide details" : "Show details"}
                        </span>
                      </button>
                    </div>
                  </td>
                  <td class="flex justify-center items-center gap-4 p-2">
                    <div class="flex flex-col items-center justify-center">
                      <label
                        for={`done-${itemId}`}
                        class={`text-sm block font-[700] ${
                          isChecked(itemId) ? "text-green-500" : "text-gray-400"
                        }`}
                      >
                        Done
                      </label>
                      <label class="relative inline-flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          class="sr-only peer"
                          id={`done-${itemId}`}
                          checked={isChecked(itemId)}
                          disabled={isItemIgnored}
                          onClick$={() => {
                            const data = completed.value;
                            data[itemId] = !data[itemId];
                            setCompleted(data);
                          }}
                          aria-label={`Mark item ${item.point} as done`}
                          aria-checked={isChecked(itemId)}
                        />
                        <div class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-green-500 transition-all duration-300 ease-in-out"></div>
                        <span class="absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-all duration-300 ease-in-out shadow peer-checked:translate-x-6 peer-checked:border-white peer-checked:shadow-lg"></span>
                      </label>
                    </div>
                    <div class="flex flex-col items-center justify-center">
                      <label
                        for={`ignore-${itemId}`}
                        class={`text-sm block font-[700] ${
                          isIgnored(itemId) ? "text-red-500" : "text-gray-400"
                        }`}
                      >
                        Ignore
                      </label>
                      <label class="relative inline-flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          id={`ignore-${itemId}`}
                          class="sr-only peer"
                          checked={isIgnored(itemId)}
                          disabled={isItemCompleted}
                          onClick$={() => {
                            const ignoredData = ignored.value;
                            ignoredData[itemId] = !ignoredData[itemId];
                            setIgnored(ignoredData);

                            const completedData = completed.value;
                            completedData[itemId] = false;
                            setCompleted(completedData);
                          }}
                          aria-label={`Ignore item ${item.point}`}
                          aria-checked={isIgnored(itemId)}
                        />
                        <div class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-red-500 transition-all duration-300 ease-in-out"></div>
                        <span class="absolute left-0.5 top-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-all duration-300 ease-in-out shadow peer-checked:translate-x-6 peer-checked:border-white peer-checked:shadow-lg"></span>
                      </label>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
});
