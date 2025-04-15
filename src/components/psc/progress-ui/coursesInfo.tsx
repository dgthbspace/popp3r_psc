import { component$ } from "@builder.io/qwik";

// URL to the privacy and cybersecurity courses
const PRIVACY_URL = "https://awesome-privacy.xyz";

export default component$(() => {
  return (
    <section class="p-4 rounded-box w-full max-w-md flex-grow animate-fade-in">
      <p class="text-sm opacity-80 mb-2">
        Interested in knowing more about cybersecurity and privacy? Consider
        going through our courses.
      </p>
      <p class="text-lg">
        View our most popular courses about cybersecurity, at{" "}
        <a
          class="link link-secondary font-bold"
          href={PRIVACY_URL}
          rel="noopener noreferrer"
          target="_blank"
          title="Explore cybersecurity and privacy courses at awesome-privacy.xyz"
        >
          awesome-privacy.xyz
        </a>
      </p>
    </section>
  );
});
