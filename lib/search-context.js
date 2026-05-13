// lib/search-context.js

export function searchContext(
  question,
  chunks,
  limit = 6
) {

  if (!question || !chunks?.length) {
    return "";
  }

  const words = question
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2);

  const scored = chunks.map(chunk => {

    const text = chunk.content.toLowerCase();

    let score = 0;

    for (const word of words) {

      // Exact word match
      if (text.includes(word)) {
        score += 2;
      }

      // Bonus for filename match
      if (chunk.file.toLowerCase().includes(word)) {
        score += 5;
      }

    }

    return {
      ...chunk,
      score
    };

  });

  const topChunks = scored
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return topChunks
    .map(chunk => {

      return `
SOURCE: ${chunk.file}

${chunk.content}
      `;

    })
    .join("\n\n-------------------\n\n");

}
