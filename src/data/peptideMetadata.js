// Enriched frontend metadata for peptides in the catalog.
// Keys are lowercase product names / substrings.
// Backend products matched via getMetadataForProduct() below.
export const PEPTIDE_METADATA = {
  // ── Classic Khavinson peptides ──────────────────────────
  "эпиталон": {
    tags: ["anti_aging", "sleep", "longevity", "recovery", "energy"],
    indications: ["sleep_disorders", "fatigue", "aging"],
    contraindications: ["pregnancy", "breastfeeding", "cancer"],
    popularity: 0.95,
  },
  "эпиталамин": {
    tags: ["anti_aging", "sleep", "longevity", "recovery"],
    indications: ["sleep_disorders", "fatigue", "aging", "hormonal_imbalance"],
    contraindications: ["pregnancy", "breastfeeding", "cancer"],
    popularity: 0.9,
  },
  "тимоген": {
    tags: ["immunity", "recovery", "energy"],
    indications: ["weak_immunity", "fatigue"],
    contraindications: ["pregnancy", "autoimmune"],
    popularity: 0.85,
  },
  "тималин": {
    tags: ["immunity", "recovery", "anti_aging"],
    indications: ["weak_immunity", "fatigue"],
    contraindications: ["pregnancy", "autoimmune"],
    popularity: 0.8,
  },
  "тимозин": {
    tags: ["immunity", "recovery"],
    indications: ["weak_immunity", "fatigue"],
    contraindications: ["pregnancy", "autoimmune"],
    popularity: 0.8,
  },
  "везуген": {
    tags: ["cardiovascular", "anti_aging", "longevity"],
    indications: ["fatigue"],
    contraindications: ["pregnancy"],
    popularity: 0.78,
  },
  "кардиоген": {
    tags: ["cardiovascular", "energy", "recovery"],
    indications: ["fatigue"],
    contraindications: ["pregnancy"],
    popularity: 0.8,
  },
  "бронхоген": {
    tags: ["immunity", "recovery"],
    indications: ["weak_immunity"],
    contraindications: ["pregnancy"],
    popularity: 0.72,
  },
  "простаген": {
    tags: ["hormones", "recovery"],
    indications: ["hormonal_imbalance"],
    contraindications: ["pregnancy", "cancer"],
    popularity: 0.75,
  },
  "овариамин": {
    tags: ["hormones", "anti_aging", "energy"],
    indications: ["hormonal_imbalance", "fatigue", "sleep_disorders"],
    contraindications: ["pregnancy", "breastfeeding", "cancer"],
    popularity: 0.82,
  },
  "тестоген": {
    tags: ["hormones", "energy", "recovery"],
    indications: ["hormonal_imbalance", "fatigue"],
    contraindications: ["pregnancy", "breastfeeding", "cancer"],
    popularity: 0.78,
  },
  "хондросамин": {
    tags: ["joints", "recovery", "anti_aging"],
    indications: ["joint_pain"],
    contraindications: ["pregnancy"],
    popularity: 0.75,
  },
  "пинеалон": {
    tags: ["sleep", "anti_aging", "energy", "recovery"],
    indications: ["sleep_disorders", "fatigue"],
    contraindications: ["pregnancy", "breastfeeding"],
    popularity: 0.82,
  },
  "церлутен": {
    tags: ["energy", "recovery", "anti_aging"],
    indications: ["fatigue"],
    contraindications: ["pregnancy"],
    popularity: 0.75,
  },
  "ренисамин": {
    tags: ["recovery", "anti_aging"],
    indications: ["fatigue"],
    contraindications: ["pregnancy"],
    popularity: 0.65,
  },
  "гепатамин": {
    tags: ["recovery", "energy"],
    indications: ["fatigue"],
    contraindications: ["pregnancy"],
    popularity: 0.7,
  },
  "панкрамин": {
    tags: ["hormones", "recovery"],
    indications: ["hormonal_imbalance"],
    contraindications: ["pregnancy"],
    popularity: 0.68,
  },
  "тималин": {
    tags: ["immunity", "recovery", "anti_aging"],
    indications: ["weak_immunity", "fatigue"],
    contraindications: ["pregnancy", "autoimmune"],
    popularity: 0.78,
  },
  "вилон": {
    tags: ["anti_aging", "immunity"],
    indications: ["weak_immunity"],
    contraindications: ["pregnancy", "cancer"],
    popularity: 0.72,
  },
  "семакс": {
    tags: ["energy", "recovery"],
    indications: ["fatigue"],
    contraindications: ["pregnancy"],
    popularity: 0.82,
  },
  // ── Collagen / skin ─────────────────────────────────────
  "коллаген": {
    tags: ["skin", "joints", "anti_aging"],
    indications: ["skin_issues", "joint_pain"],
    contraindications: [],
    popularity: 0.9,
  },
  "эластин": {
    tags: ["skin", "anti_aging"],
    indications: ["skin_issues"],
    contraindications: [],
    popularity: 0.75,
  },
  // ── Modern GLP-1 / metabolic (slugs in this DB) ─────────
  "retatrutide": {
    tags: ["hormones", "energy", "anti_aging"],
    indications: ["hormonal_imbalance", "fatigue"],
    contraindications: ["pregnancy", "breastfeeding", "cancer"],
    popularity: 0.88,
  },
  "tirzepadin": {
    tags: ["hormones", "energy"],
    indications: ["hormonal_imbalance", "fatigue"],
    contraindications: ["pregnancy", "breastfeeding"],
    popularity: 0.85,
  },
  "тирзепадин": {
    tags: ["hormones", "energy"],
    indications: ["hormonal_imbalance", "fatigue"],
    contraindications: ["pregnancy", "breastfeeding"],
    popularity: 0.85,
  },
  "ретатрутид": {
    tags: ["hormones", "energy", "anti_aging"],
    indications: ["hormonal_imbalance", "fatigue"],
    contraindications: ["pregnancy", "breastfeeding", "cancer"],
    popularity: 0.88,
  },
  // ── General peptide / complex catch-all ─────────────────
  "пептид": {
    tags: ["anti_aging", "recovery", "immunity"],
    indications: ["fatigue"],
    contraindications: ["pregnancy"],
    popularity: 0.65,
  },
};

// Returns metadata for a product from the catalog.
// Matching order: exact name → slug → substring → default.
export function getMetadataForProduct(product) {
  const nameKey = product.name?.toLowerCase().trim() ?? "";
  const slugKey = product.slug?.toLowerCase().trim() ?? "";

  // 1. Exact match on display name
  if (PEPTIDE_METADATA[nameKey]) return PEPTIDE_METADATA[nameKey];

  // 2. Exact match on slug
  if (PEPTIDE_METADATA[slugKey]) return PEPTIDE_METADATA[slugKey];

  // 3. Substring match (product name contains metadata key)
  for (const [key, meta] of Object.entries(PEPTIDE_METADATA)) {
    if (nameKey.includes(key) || slugKey.includes(key)) return meta;
  }

  // 4. Default — no specific metadata found
  return {
    tags: ["general"],
    indications: [],
    contraindications: [],
    popularity: 0.5,
  };
}
