// components/psc/progress-ui/checklistsProgress.tsx

// import the necessary hooks and components
import { component$, useContext, useOnWindow, $ } from "@builder.io/qwik";
import { ChecklistContext } from "~/store/checklist-context"; // import the ChecklistContext from the store
import { useProgressCalculation } from "~/hooks/progress-hooks/useProgressCalculation"; // import the useProgressCalculation hook
import Icon from "~/components/core/icon"; // import the Icon component

// define the main component
export default component$(() => {
  // get the checklists from the context
  const checklists = useContext(ChecklistContext);
  // get the calculateProgress and sectionCompletion functions from the useProgressCalculation hook
  const { calculateProgress, sectionCompletion } = useProgressCalculation();

  // on window load, calculate the progress for each checklist and update the sectionCompletion
  useOnWindow(
    "load",
    $(() => {
      // map over the checklists and calculate the progress for each one
      Promise.all(
        checklists.value.map((section) => calculateProgress([section]))
      ).then((progressArray) => {
        // calculate the completion percentage for each checklist and update the sectionCompletion array
        sectionCompletion.value = progressArray.map((progress) =>
          Math.round((progress.completed / progress.outOf) * 100)
        );
      });
    })
  );

  // return the component JSX
  return (
    // main container with padding and rounded corners
    <div class="p-4 rounded-box w-full max-w-2xl animate-fade-in flex-1">
      <h3 class="text-[#9b2a2a] text-center font-[700] text-2xl mb-2">
        Checklists
      </h3>
      <ul class="flex flex-col">
        {// map over the checklists and render a list item for each one
        checklists.value.map((section, index) => (
          <li key={index} class="mb-2 animate-fade-in">
            {// link to the individual checklist page
            }<a
              href={`/checklist/${section.slug}`}
              class={[
                "block p-2 border border-gray-200 rounded-lg shadow-sm transition-transform duration-300",
                `hover:bg-${section.color}-200  hover:text-white`,
                `hover:transform hover:scale-103`,
              ]}
              // display the completion percentage in a tooltip
              data-tip={`Completed ${sectionCompletion.value[index] || 0}% of ${
                section.checklist.length
              } items.`}
            >
              <div class="flex items-center gap-2">
                {// render the icon for the checklist
                }<Icon icon={section.icon} width={16} color={section.color} />
                <div class="flex-1">
                  <h4 class="text-md font-semibold text-gray-700">
                    {section.title} {/* render the title of the checklist */}
                  </h4>
                  {// render the progress bar for the checklist
                  }<div class="relative w-full h-4 bg-gray-500 rounded-full overflow-hidden mt-1">
                    <span
                      class={`absolute left-0 top-0 h-full bg-${section.color}-500`}
                      style={`width: ${sectionCompletion.value[index] || 0}%;`}
                    ></span>
                    <span class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white font-semibold">
                      {sectionCompletion.value[index] || 0}% {/* render the completion percentage */}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
