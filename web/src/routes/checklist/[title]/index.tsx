import {
  component$,
  useContext,
  useOnWindow,
  useSignal,
  $,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { marked } from "marked";
import Icon from "~/components/core/icon";
import { ChecklistContext } from "~/store/checklist-context";
import type { Section, Checklist } from "~/types/PSC";
import Table from "~/components/psc/checklist-table";
import { useLocalStorage } from "~/hooks/useLocalStorage";

export default component$(() => {
  const checklists = useContext(ChecklistContext);
  const [checkedItems] = useLocalStorage("PSC_PROGRESS", {});
  const [ignoredItems] = useLocalStorage("PSC_IGNORED", {});
  const completions = useSignal<number[]>([]);
  const done = useSignal<number[]>([]);

  const loc = useLocation();
  const slug = loc.params.title;
  const section: Section | undefined = checklists.value.find(
    (item: Section) => item.slug === slug
  );

  const parseMarkdown = (text: string | undefined): string => {
    return (marked.parse(text || "") as string) || "";
  };

  const getPercentCompletion = $(async (section: Section): Promise<number> => {
    const id = (item: Checklist) => item.point.toLowerCase().replace(/ /g, "-");
    const total = section.checklist.filter(
      (item) => !ignoredItems.value[id(item)]
    ).length;
    const completed = section.checklist.filter(
      (item) => checkedItems.value[id(item)]
    ).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  useOnWindow(
    "load",
    $(async () => {
      if (section) {
        completions.value = [await getPercentCompletion(section)];
        done.value = [
          section.checklist.filter(
            (item) =>
              checkedItems.value[item.point.toLowerCase().replace(/ /g, "-")]
          ).length,
        ];
      }
    })
  );

  return (
    <div class="md:my-8 md:px-16 sm:px-2 rounded-md">
      <article class="p-8 mx-auto w-full max-w-[1200px] rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <Icon
              height={36}
              width={36}
              icon={section?.icon || "star"}
              color={section?.color}
            />
            <h1
              class={`text-5xl font-bold capitalize text-${section?.color}-400`}
            >
              {section?.title}
            </h1>
          </div>
          <div
            class={`radial-progress text-${section?.color}-400`}
            style={`--value:${completions.value[0]}; --size: 4rem;`}
          >
            <span class=" text-lg font-[700] text-shadow-md">
              {completions.value[0]}%
            </span>
          </div>
        </div>
        <p
          class="py-2 prose"
          dangerouslySetInnerHTML={parseMarkdown(section?.intro)}
        ></p>
        <div class="overflow-x-auto">
          {section && <Table section={section} />}
        </div>
        {section && section.softwareLinks && (
          <>
            <div class="divider my-4">Useful Links</div>
            <h3 class="text-xl my-2">Recommended Software</h3>
            <ul class="list-disc pl-4">
              {section.softwareLinks.map((link, index) => (
                <li key={index}>
                  <a
                    class="link link-primary"
                    href={link.url}
                    title={link.description}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
    </div>
  );
});
