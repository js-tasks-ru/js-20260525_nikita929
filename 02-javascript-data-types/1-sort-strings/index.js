/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const collator = new Intl.Collator(["ru", "en"], { caseFirst: "upper" });

  return [...arr].sort(
    param === "desc" ? (a, b) => collator.compare(b, a) : collator.compare,
  );
}
