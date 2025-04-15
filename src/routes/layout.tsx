import { component$, useContextProvider, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import jsyaml from "js-yaml";
import { readFile } from "fs/promises";
import { resolve } from "path";

import Navbar from "~/components/furniture/nav";
import Footer from "~/components/furniture/footer";
import { ChecklistContext } from "~/store/checklist-context";
import type { Sections } from "~/types/PSC";

// Function to read YAML file from the local filesystem
const readYamlFile = async (filePath: string): Promise<Sections> => {
  try {
    const fileContent = await readFile(filePath, "utf8");
    return jsyaml.load(fileContent) as Sections;
  } catch (error) {
    console.error("Error reading YAML file:", error);
    return [];
  }
};

export const useChecklists = routeLoader$(async () => {
  const localFilePath = resolve("data", "personal-security-checklist.yml");
  return readYamlFile(localFilePath);
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export default component$(() => {
  const checklists = useChecklists();
  useContextProvider(ChecklistContext, checklists);

  return (
    <>
      <Navbar />
      <main class="bg-base-100 min-h-full">
        <Slot />
      </main>
      <Footer />
    </>
  );
});
