export function parseFoodoraHtml(htmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const items = Array.from(doc.querySelectorAll(".cart-product-item"));

  return items.map((item) => {
    const qty = item.querySelector("span")?.textContent?.trim() ?? "";
    const name =
      item
        .querySelector("[data-testid='cartlib-product-item'] span")
        ?.textContent?.trim() ?? "";
    const price =
      item.querySelector(".cart-product-item-price")?.textContent?.trim() ?? "";

    return { qty, name, price };
  });
}
