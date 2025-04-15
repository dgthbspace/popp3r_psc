import { component$ } from "@builder.io/qwik";
import logo from "../../media/icon.png";  

import Icon from "~/components/core/icon";

export default component$(() => {
  return (
    <div class="hero mb-8 mx-auto xl:max-w-7xl max-w-6xl w-full xl:px-10">
      <div class="hero-content text-center bg-front shadow-sm lg:rounded-xl w-full">
        <div class="max-w-2xl flex flex-col place-items-center">
          <h1 class="text-4xl font-bold uppercase">
            Popp3r Security Checklist
          </h1>
          <p class="subtitle py-4">
            Your guide to securing your digital life and protecting your privacy
          </p>
          <img
            class="mb-4 lazyload"
            src={logo}
            alt="Popp3r Security Checklist"
            width={120}
            height={120}
            loading="lazy"
          />
          <a href="https://github.com/lissy93/personal-security-checklist">
            <button class="btn bg-[#9b2a2a] text-white hover:bg-white hover:border-red-500 hover:text-[#000000] btn-lg">
              <Icon icon="github" width={20} height={20} />
              View on GitHub
            </button>
          </a>
        </div>
      </div>
    </div>
  );
});
