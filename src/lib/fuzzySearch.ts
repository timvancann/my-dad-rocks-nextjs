export const fuzzyIncludes = (content: string, search: string) => {
  const normalizedContent = content.toLowerCase();
  const normalizedSearch = search.toLowerCase().trim();
  if (!normalizedSearch) return true;
  if (normalizedContent.includes(normalizedSearch)) return true;

  const condensedContent = normalizedContent.replace(/[\s\W_]+/g, '');
  const condensedQuery = normalizedSearch.replace(/[\s\W_]+/g, '');

  // Loose sequential match so users can type partial fragments (e.g. "vhntlb" for Van Halen - Not Talkin' 'Bout Love)
  let pointer = 0;
  for (const char of condensedQuery) {
    pointer = condensedContent.indexOf(char, pointer);
    if (pointer === -1) return false;
    pointer += 1;
  }
  return true;
};

