import { component$, useContext } from "@builder.io/qwik";

import { ChecklistContext } from '~/store/checklist-context';
import { useChecklist } from '~/store/local-checklist-store';
import SectionLinkGrid from "~/components/psc/section-link-grid";

export default component$(() => {
  const checklists = useContext(ChecklistContext);
  const localChecklist = useChecklist();


  return (
    <main class="p-8">
      <SectionLinkGrid sections={localChecklist.checklist.checklist || checklists.value} />
    </main>
  );
});
