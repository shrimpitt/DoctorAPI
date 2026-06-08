import { getMetadataForProduct } from "../data/peptideMetadata";

// Goal tags mapping — questionnaire goal IDs → metadata tags
const GOAL_TAG_MAP = {
  anti_aging:   ["anti_aging", "longevity"],
  energy:       ["energy", "recovery"],
  immunity:     ["immunity", "recovery"],
  sleep:        ["sleep"],
  hormones:     ["hormones"],
  joints:       ["joints"],
  skin:         ["skin", "anti_aging"],
  cardiovascular: ["cardiovascular"],
};

// Health profile tags mapping — condition IDs → metadata tags
const HEALTH_TAG_MAP = {
  fatigue:            ["energy", "recovery"],
  sleep_disorders:    ["sleep"],
  hormonal_imbalance: ["hormones"],
  weak_immunity:      ["immunity"],
  joint_pain:         ["joints"],
  skin_issues:        ["skin"],
  aging:              ["anti_aging", "longevity"],
};

// Score = 0.5 * goalMatch + 0.3 * healthMatch + 0.2 * popularity
function scoreProduct(product, userProfile) {
  const meta = getMetadataForProduct(product);

  // Goal match: fraction of desired goal tags covered
  const desiredGoalTags = (userProfile.goals ?? [])
    .flatMap((g) => GOAL_TAG_MAP[g] ?? []);
  const uniqueGoalTags = [...new Set(desiredGoalTags)];
  const goalMatch = uniqueGoalTags.length > 0
    ? uniqueGoalTags.filter((t) => meta.tags.includes(t)).length / uniqueGoalTags.length
    : 0;

  // Health match: fraction of health-profile tags covered
  const desiredHealthTags = (userProfile.healthConditions ?? [])
    .flatMap((h) => HEALTH_TAG_MAP[h] ?? []);
  const uniqueHealthTags = [...new Set(desiredHealthTags)];
  const healthMatch = uniqueHealthTags.length > 0
    ? uniqueHealthTags.filter((t) => meta.tags.includes(t)).length / uniqueHealthTags.length
    : 0;

  const score = 0.5 * goalMatch + 0.3 * healthMatch + 0.2 * meta.popularity;

  return { score, goalMatch, healthMatch, popularity: meta.popularity, meta };
}

function buildReasons(scoringResult, userProfile) {
  const reasons = [];
  const { goalMatch, healthMatch, meta } = scoringResult;

  if (goalMatch > 0) {
    const matchedGoals = (userProfile.goals ?? [])
      .filter((g) => (GOAL_TAG_MAP[g] ?? []).some((t) => meta.tags.includes(t)));
    if (matchedGoals.length > 0) {
      const GOAL_LABELS = {
        anti_aging: "антивозрастная защита",
        energy: "повышение энергии",
        immunity: "иммунитет",
        sleep: "качество сна",
        hormones: "гормональный баланс",
        joints: "здоровье суставов",
        skin: "состояние кожи",
        cardiovascular: "сердечно-сосудистая система",
      };
      reasons.push(`Соответствует целям: ${matchedGoals.map((g) => GOAL_LABELS[g] ?? g).join(", ")}`);
    }
  }

  if (healthMatch > 0) {
    const matchedConditions = (userProfile.healthConditions ?? [])
      .filter((h) => (HEALTH_TAG_MAP[h] ?? []).some((t) => meta.tags.includes(t)));
    if (matchedConditions.length > 0) {
      const CONDITION_LABELS = {
        fatigue: "хроническая усталость",
        sleep_disorders: "нарушения сна",
        hormonal_imbalance: "гормональный дисбаланс",
        weak_immunity: "сниженный иммунитет",
        joint_pain: "боли в суставах",
        skin_issues: "проблемы с кожей",
        aging: "возрастные изменения",
      };
      reasons.push(`Подходит при: ${matchedConditions.map((c) => CONDITION_LABELS[c] ?? c).join(", ")}`);
    }
  }

  if (meta.popularity >= 0.9) reasons.push("Высокая популярность среди пациентов");
  else if (meta.popularity >= 0.8) reasons.push("Проверенный клинический профиль");

  return reasons.length > 0 ? reasons : ["Общий восстановительный эффект"];
}

// Main export: filters unsafe products, scores the rest, returns top N
export function recommendProducts(userProfile, products, topN = 3) {
  const safe = products.filter((product) => {
    const meta = getMetadataForProduct(product);
    if (userProfile.isPregnant && meta.contraindications.includes("pregnancy")) return false;
    if (userProfile.isBreastfeeding && meta.contraindications.includes("breastfeeding")) return false;
    if ((userProfile.chronicConditions ?? []).includes("cancer") && meta.contraindications.includes("cancer")) return false;
    if ((userProfile.chronicConditions ?? []).includes("autoimmune") && meta.contraindications.includes("autoimmune")) return false;
    return true;
  });

  const scored = safe.map((product) => {
    const result = scoreProduct(product, userProfile);
    return {
      product,
      score: result.score,
      reasons: buildReasons(result, userProfile),
      goalMatch: result.goalMatch,
      healthMatch: result.healthMatch,
      popularity: result.popularity,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}
