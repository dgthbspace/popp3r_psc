import { $, component$, useOnWindow, useSignal } from "@builder.io/qwik";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import type { Checklist, Section, Priority } from "../../types/PSC";
import Icon from "~/components/core/icon";
import styles from "./psc.module.css";

export default component$((props: { sections: Section[] }) => {
  const completions = useSignal<number[]>([]);
  const done = useSignal<number[]>([]);

  const [checked] = useLocalStorage("PSC_PROGRESS", {});
  const [ignored] = useLocalStorage("PSC_IGNORED", {});

  const getPercentCompletion = $(async (section: Section): Promise<number> => {
    const id = (item: Checklist) => item.point.toLowerCase().replace(/ /g, "-");
    const total = section.checklist.filter(
      (item) => !ignored.value[id(item)]
    ).length;
    const completed = section.checklist.filter(
      (item) => checked.value[id(item)]
    ).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  const getPriorityCompletion = $(
    async (section: Section, priority: Priority): Promise<number> => {
      const id = (item: Checklist) =>
        item.point.toLowerCase().replace(/ /g, "-");
      const total = section.checklist.filter(
        (item) => item.priority === priority && !ignored.value[id(item)]
      ).length;
      const completed = section.checklist.filter(
        (item) => item.priority === priority && checked.value[id(item)]
      ).length;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }
  );

  useOnWindow(
    "load",
    $(async () => {
      completions.value = await Promise.all(
        props.sections.map((section) => getPercentCompletion(section))
      );
      done.value = await Promise.all(
        props.sections.map(
          (section) =>
            section.checklist.filter(
              (item) =>
                checked.value[item.point.toLowerCase().replace(/ /g, "-")]
            ).length
        )
      );
    })
  );

  const items = [
    { id: "essential-container", label: "Essential" },
    { id: "optional-container", label: "Optional" },
    { id: "advanced-container", label: "Advanced" },
  ];

  return (
    <div
      class={[
        styles.container,
        "grid mx-auto mt-8 px-4 gap-7 xl:px-10 xl:max-w-7xl transition-all max-w-6xl w-full",
      ]}
    >
      {props.sections.map((section: Section, index: number) => (
        <a
          key={section.slug}
          href={`/checklist/${section.slug}`}
          class={[
            "card items-center bg-back bg-opacity-25 shadow-md transition-all p-6",
            `outline-offset-2 outline-${section.color}-400`,
            "hover:outline hover:outline-10 hover:outline-offset-4 hover:bg-opacity-15",
            `hover:bg-${section.color}-600`,
          ]}
        >
          <div class="card flex-shrink-0 flex flex-col pt-6 h-auto items-stretch justify-evenly">
            <div class="grid grid-cols-1 items-center justify-items-center gap-2">
              <Icon icon={section.icon || "star"} color={section.color} />
              <h2
                class={`card-title text-2xl text-${section.color}-400 hover:text-${section.color}-500`}
              >
                {section.title}
              </h2>
            </div>
            {/* Progression count for items completed */}
            <p class={`text-${section.color}-400 text-center pt-2`}>
              {done.value[index] > 0 ? (
                <>
                  {done.value[index]}/{section.checklist.length} Done
                </>
              ) : (
                <>{section.checklist.length} Items</>
              )}
            </p>
          </div>
          <div class="card-body items-center flex-grow">
            <p class="p-0">{section.description}</p>
            {/* Progress bar for priorities completion */}
            {items.map(async (priority) => {
              const completion = await getPriorityCompletion(
                section,
                priority.label as Priority
              );
              return (
                <div key={priority.id} class="my-2 w-full">
                  <div class="flex justify-between items-center">
                    <p class="text-sm">{priority.label}</p>
                    <span class="p-0 m-0">{completion}%</span>
                  </div>
                  <div class="relative bg-gray-700 h-[10px] rounded-full overflow-hidden">
                    <div
                      class={`absolute left-0 top-0 h-full
                       rounded-full text-white text-xs ${
                         styles[
                           priority.id === "optional-container"
                             ? "bg-optional"
                             : priority.id === "essential-container"
                             ? "bg-essential"
                             : "bg-advanced"
                         ]
                       }`}
                      style={`width: ${completion}%`}
                      aria-label={`${section.title} ${priority.label} completion`}
                      aria-valuenow={completion}
                      role="progressbar"
                    >
                      <div class="flex justify-center items-center h-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {completions.value && completions.value[index] !== undefined ? (
              <div
                class={`radial-progress absolute right-2 top-2 scale-75 text-${section.color}-400`}
                style={`--value:${completions.value[index]}; --size: 3.5rem;`}
                role="progressbar"
              >
                <span class="text-sm">{completions.value[index]}%</span>
              </div>
            ) : (
              <span class="absolute right-2 top-2 opacity-30 text-xs">
                Not yet started
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
});
