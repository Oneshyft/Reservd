const HIGH_INTENT_PHRASES = [
  "Ford Field suite", "Little Caesars Arena suite", "LCA suite",
  "Lions season tickets", "Red Wings season tickets",
  "Lions waitlist", "Red Wings waitlist",
  "Lions season ticket waitlist", "Red Wings season ticket waitlist",
  "Detroit Lions tickets", "Detroit Red Wings tickets",
  "going to Ford Field", "going to LCA",
  "Lions game tickets", "Wings game tickets", "313 Presents",
  "season ticket waiting list", "on the season ticket waiting list",
  "finally got off the waitlist", "season tickets too expensive",
  "can't afford season tickets", "wish I could afford season tickets",
  "looking to buy a suite", "rent a suite for", "corporate suite",
  "suite for the game", "how much does a suite cost", "suite rental",
  "anyone selling their tickets", "need tickets for", "looking for tickets to",
];

const MEDIUM_INTENT_PHRASES = [
  "going to my first NFL game", "going to my first Red Wings game",
  "taking the team to a game", "client entertainment", "holiday party idea",
  "team outing", "company event", "group tickets",
  "how do I get good seats", "best way to get tickets",
  "stubhub is so expensive", "ticket prices are insane",
  "can't believe what tickets cost", "is it worth getting season tickets",
  "thinking about getting season tickets", "season ticket holder",
  "PSL", "deposit on season tickets",
];

const PRIMARY_SUBREDDITS = [
  "detroitlions", "detroitredwings", "detroit", "Michigan", "motorcitykitties",
];

const DETROIT_KEYWORDS = ["detroit", "ford field", "lca", "little caesars arena"];
const LIONS_KEYWORDS = ["lions"];
const RED_WINGS_KEYWORDS = ["red wings", "redwings"];

export function scoreLead(content: string, source: string, matchedPhrases: string[], replyCount?: number, accountAge?: number): number {
  let score = 0;
  const lowerContent = content.toLowerCase();
  const lowerSource = source.toLowerCase();

  // +3 High Intent phrase matched
  const hasHighIntent = matchedPhrases.some(p =>
    HIGH_INTENT_PHRASES.some(h => h.toLowerCase() === p.toLowerCase())
  );
  if (hasHighIntent) score += 3;

  // +2 Post is in primary Detroit subreddits
  if (PRIMARY_SUBREDDITS.some(s => lowerSource.includes(s.toLowerCase()))) {
    score += 2;
  }

  // +2 Post mentions Detroit, Ford Field, LCA
  if (DETROIT_KEYWORDS.some(k => lowerContent.includes(k))) {
    score += 2;
  }

  // +2 Post mentions Lions or Red Wings specifically
  const mentionsLions = LIONS_KEYWORDS.some(k => lowerContent.includes(k));
  const mentionsWings = RED_WINGS_KEYWORDS.some(k => lowerContent.includes(k));
  if (mentionsLions || mentionsWings) score += 2;

  // +2 Post mentions both Lions AND Red Wings
  if (mentionsLions && mentionsWings) score += 2;

  // +1 Medium Intent phrase also matched
  const hasMediumIntent = matchedPhrases.some(p =>
    MEDIUM_INTENT_PHRASES.some(m => m.toLowerCase() === p.toLowerCase())
  );
  if (hasMediumIntent) score += 1;

  // +1 Post has 5+ replies
  if (replyCount && replyCount >= 5) score += 1;

  // +1 Reddit account age > 1 year
  if (accountAge && accountAge > 365) score += 1;

  return Math.min(score, 10);
}

export function detectTeam(content: string): string {
  const lower = content.toLowerCase();
  const mentionsLions = lower.includes("lions") || lower.includes("ford field");
  const mentionsWings = lower.includes("red wings") || lower.includes("lca") || lower.includes("little caesars arena");
  if (mentionsLions && mentionsWings) return "BOTH";
  if (mentionsLions) return "LIONS";
  if (mentionsWings) return "RED_WINGS";
  return "UNKNOWN";
}

export function getScoreBadge(score: number): { label: string; color: string } {
  if (score >= 8) return { label: "Hot", color: "green" };
  if (score >= 5) return { label: "Warm", color: "amber" };
  return { label: "Cold", color: "gray" };
}
