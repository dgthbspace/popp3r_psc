import { $ } from "@builder.io/qwik";

export const useDrawProgress = () => {
  const drawProgress = $(
    (percentage: number, target: string, color?: string) => {
      const getCssVariableValue = (variableName: string, fallback = "") => {
        return (
          getComputedStyle(document.documentElement)
            .getPropertyValue(variableName)
            .trim() || fallback
        );
      };
      const primaryColor = color || "hsl(var(--pf, 220, 13%, 69%))";
      const foregroundColor = "hsl(var(--nc, 220, 13%, 69%))";
      const red = `hsl(${getCssVariableValue("--er", "0 91% 71%")})`;
      const green = `hsl(${getCssVariableValue("--su", "158 64% 52%")})`;
      const labelStyles = {
        color: foregroundColor,
        position: "absolute",
        right: "0.5rem",
        top: "2rem",
      };
      const stepFunction = (state: any, bar: any) => {
        const value = Math.round(bar.value() * 100);
        bar.path.setAttribute("stroke", state.color);
        bar.path.setAttribute("stroke-linecap", "round");
        bar.setText(value ? `${value}%` : "");
        bar.text.style.color = state.color;
        bar.text.style.textShadow = `0 0 5px ${state.color}`;
        if (value >= percentage) {
          bar.path.setAttribute("stroke", primaryColor);
        }
      };

      const progressConfig = {
        strokeWidth: 8,
        trailWidth: 4,
        easing: "easeInOut",
        color: primaryColor,
        trailColor: foregroundColor,
        text: {
          style: labelStyles,
        },
        animate: { duration: 2000, onStep: stepFunction },
        from: { color: red },
        to: { color: green },
        step: stepFunction,
        svgStyle: {
          strokeLinecap: "round",
        },
      };

      import("progressbar.js").then((ProgressBar) => {
        const line = new ProgressBar.SemiCircle(target, progressConfig);
        line.animate(percentage / 100);
      });
    }
  );

  return { drawProgress };
};
