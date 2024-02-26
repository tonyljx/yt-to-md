export function parseChapters(
  document: Document
): {
  title: string | null | undefined;
  timestamp: string | null | undefined;
}[] {
  const allElements = Array.from(
    document.querySelectorAll(
      "#panels ytd-engagement-panel-section-list-renderer:nth-child(2) #content ytd-macro-markers-list-renderer #contents ytd-macro-markers-list-item-renderer #endpoint #details"
    )
  );

  const withTitleAndTime = allElements.map((node) => ({
    title: node.querySelector(".macro-markers")?.textContent,
    timestamp: node.querySelector("#time")?.textContent,
  }));

  const filtered = withTitleAndTime.filter(
    (element) =>
      element.title !== undefined &&
      element.title !== null &&
      element.timestamp !== undefined &&
      element.timestamp !== null
  );

  const withoutDuplicates = [
    ...new Map(filtered.map((node) => [node.timestamp, node])).values(),
  ];

  return withoutDuplicates;
}
