/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) return "";
  if (size === undefined) return string;
  let result = "";
  let consecutiveCount = 0;
  for (let i = 0; i < string.length; i++) {
    if (string[i] === string[i - 1]) consecutiveCount++;
    else consecutiveCount = 1;
    if (consecutiveCount <= size) result += string[i];
  }
  return result;
}
