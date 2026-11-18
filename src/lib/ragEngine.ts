import { KNOWLEDGE_DOCUMENTS } from "./mockData";
import { KnowledgeDocument, ToolExecutionTrace } from "./types";

export function searchComplianceRAG(
  query: string,
  categoryFilter?: string
): { documents: KnowledgeDocument[]; trace: ToolExecutionTrace } {
  const start = performance.now();
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  let pool = KNOWLEDGE_DOCUMENTS;
  if (categoryFilter && categoryFilter !== "all") {
    pool = pool.filter((doc) => doc.category === categoryFilter);
  }

  // 1. Lexical Scoring (Simulating GIN / tsvector BM25 match)
  const lexicalRanked = pool
    .map((doc) => {
      let matchCount = 0;
      const fullText = (doc.title + " " + doc.content + " " + doc.subCategory).toLowerCase();
      tokens.forEach((token) => {
        if (fullText.includes(token)) matchCount += 1;
      });
      return { doc, matches: matchCount };
    })
    .filter((item) => item.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .map((item, idx) => ({ docId: item.doc.id, rank: idx + 1 }));

  // 2. Semantic Vector Scoring (Simulating HNSW Cosine Distance)
  // Higher semantic weight given to specific domain terms
  const domainKeywords = [
    "spjm",
    "red channel",
    "jalur merah",
    "demurrage",
    "detention",
    "vgm",
    "ispm",
    "fumigasi",
    "bpom",
    "dhe",
    "sda",
    "behandle",
    "dispute",
    "claim",
  ];

  const semanticRanked = pool
    .map((doc) => {
      let semanticScore = 0.05; // Base prior
      const docText = (doc.title + " " + doc.content).toLowerCase();
      domainKeywords.forEach((kw) => {
        if (query.toLowerCase().includes(kw) && docText.includes(kw)) {
          semanticScore += 0.35;
        }
      });
      return { doc, score: semanticScore };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, idx) => ({ docId: item.doc.id, rank: idx + 1 }));

  // 3. Reciprocal Rank Fusion (RRF): score = (1 / (60 + r_lexical)) + (1 / (60 + r_vector))
  const k = 60;
  const scoredDocs = pool.map((doc) => {
    const lex = lexicalRanked.find((l) => l.docId === doc.id);
    const sem = semanticRanked.find((s) => s.docId === doc.id);

    const rLex = lex ? 1.0 / (k + lex.rank) : 0;
    const rSem = sem ? 1.0 / (k + sem.rank) : 0;
    const rrfScore = Number((rLex + rSem).toFixed(5));

    return {
      ...doc,
      score: rrfScore,
    };
  });

  // Top 3 most relevant documents
  const topDocs = scoredDocs
    .filter((d) => (d.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  const latencyMs = Math.round(performance.now() - start + 3); // Sub-millisecond HNSW + GIN response

  return {
    documents: topDocs.length > 0 ? topDocs : pool.slice(0, 2),
    trace: {
      toolName: "search_compliance_knowledge",
      arguments: { query, categoryFilter: categoryFilter || "all" },
      result: {
        method: "Hybrid Search (GIN + HNSW pgvector via RRF)",
        kConstant: 60,
        retrievedCount: topDocs.length,
        topRankedArticle: topDocs[0]?.title || "None",
        topRrfScore: topDocs[0]?.score || 0,
      },
      latencyMs,
    },
  };
}
