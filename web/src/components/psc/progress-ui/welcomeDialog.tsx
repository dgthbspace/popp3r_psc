// components/psc/progress-ui/welcomeDialog.tsx
import { component$, useStore, useTask$ } from "@builder.io/qwik";
import { useLocalStorage } from "~/hooks/useLocalStorage";

export default component$(() => {
  const state = useStore({
    loading: true,
    ignoreDialog: false,
    checkedItems: {},
  });

  const [ignoreDialog, setIgnoreDialog] = useLocalStorage(
    "PSC_CLOSE_WELCOME",
    false
  );
  const [checkedItems] = useLocalStorage("PSC_PROGRESS", {});

  useTask$(() => {
    state.ignoreDialog = ignoreDialog.value;
    state.checkedItems = checkedItems.value;
    state.loading = false;

    if (!Object.keys(state.checkedItems).length) {
      state.ignoreDialog = false;
    }
  });

  if (state.loading) {
    return null;
  }

  return (
    !state.ignoreDialog &&
    !Object.keys(state.checkedItems).length && (
      <div class="px-16 py-8 top-1/3 z-10 max-w-lg absolute flex flex-col justify-center bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40 border border-stone-800 animate-fade-in">
        <button
          class="absolute top-1 right-1 btn btn-sm opacity-50"
          onClick$={() => {
            setIgnoreDialog(true);
            state.ignoreDialog = true;
          }}
        >
          Close
        </button>
        <p class="text-xl block text-center font-bold">No stats yet</p>
        <p class="w-md text-left my-2">
          You'll see your progress here, once you start ticking items off the
          checklists
        </p>
        <p class="w-md text-left my-2">
          Get started, by selecting a checklist below
        </p>
      </div>
    )
  );
});
