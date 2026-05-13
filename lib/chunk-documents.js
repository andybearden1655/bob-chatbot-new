// lib/chunk-documents.js

export function chunkDocuments(
  documents,
  chunkSize = 1200,
  overlap = 200
) {

  const chunks = [];

  for (const doc of documents) {

    if (!doc.content) {
      continue;
    }

    const text = doc.content;

    let start = 0;

    while (start < text.length) {

      const end = start + chunkSize;

      const chunkText = text.slice(start, end);

      chunks.push({
        file: doc.file,
        type: doc.type,
        content: chunkText
      });

      start += chunkSize - overlap;

    }

  }

  console.log(`✅ Created ${chunks.length} chunks`);

  return chunks;

}
