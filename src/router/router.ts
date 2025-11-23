type ViewName = "pantry" | "import" | "history" | "preferences";

const viewContainer = document.getElementById("app-view") as HTMLElement;

export function initRouter() {
  document.querySelectorAll<HTMLAnchorElement>(".sidebar a").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      const view = link.getAttribute("data-view") as ViewName | null;
      if (!view) return;

      document
        .querySelectorAll(".sidebar a")
        .forEach((a) => a.classList.remove("active"));
      link.classList.add("active");

      await loadView(view);
    });
  });

  loadView("pantry");
}

async function loadView(view: ViewName) {
  const htmlModule = await import(`../views/${view}/${view}.html?raw`);
  viewContainer.innerHTML = htmlModule.default;

  const controller = await import(`../views/${view}/${view}.ts`);
  controller.initView?.();
}
