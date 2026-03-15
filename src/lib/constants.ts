export const PRIMARY_SUBREDDITS = [
  "detroitlions", "detroitredwings", "detroit", "Michigan", "motorcitykitties",
];

export const SECONDARY_SUBREDDITS = [
  "nfl", "hockey", "Tickets", "TicketExchange", "sportstickets",
  "Frugal", "Frugalsports", "Entrepreneur", "smallbusiness",
  "corporateevents", "eventplanning",
  // NFL team subs
  "eagles", "cowboys", "chiefs", "Bears", "Packers", "Patriots", "ravens",
  "steelers", "broncos", "49ers", "seahawks", "vikings", "Saints", "Falcons",
  "Texans", "Colts", "Titans", "Jaguars", "bengals", "Browns", "Raiders",
  "Chargers", "KansasCityChiefs", "AZCardinals", "Rams", "Panthers",
  "buccaneers", "washingtoncommanders", "NYGiants", "nyjets", "buffalobills",
  "miamidolphins", "newenglandpatriots",
  // NHL team subs
  "leafs", "rangers", "bruins", "penguins", "caps", "hawks", "canucks",
  "oilers", "flames", "habs", "devils", "flyers", "bluejackets", "predators",
  "blues", "coyotes", "ducks", "losangeleskings", "wildhockey", "winnipegjets",
  "ottawasenators", "sabres", "canes", "tampabaylightning", "floridapanthers",
  "stlouisblues", "coloradoavalanche", "sanjosesharks", "seattlekraken",
  "goldenknights", "nashvillepredators",
];

export const LEAD_STATUSES = [
  "NEW", "REVIEWING", "COMMENTED", "DMED", "CONVERTED", "NOT_A_FIT", "CLOSED_LOST",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  COMMENTED: "Commented",
  DMED: "DMed",
  CONVERTED: "Converted",
  NOT_A_FIT: "Not a Fit",
  CLOSED_LOST: "Closed/Lost",
};

export const KANBAN_COLUMNS = [
  { id: "NEW", label: "New Leads" },
  { id: "REVIEWING", label: "Reviewing" },
  { id: "COMMENTED", label: "Commented" },
  { id: "DMED", label: "DMed" },
  { id: "CONVERTED", label: "Converted" },
  { id: "CLOSED_LOST", label: "Closed/Lost" },
];

export const FACEBOOK_SEARCH_TERMS = [
  "Detroit Lions suite",
  "Lions tickets for sale",
  "Red Wings suite rental",
  "Little Caesars Arena tickets",
  "Ford Field tickets",
  "Detroit sports tickets",
  "Lions season tickets",
  "Red Wings season tickets",
  "Detroit corporate event tickets",
];

export const PLATFORM_ICONS: Record<string, string> = {
  REDDIT: "MessageCircle",
  FACEBOOK: "Facebook",
  TWITTER: "Twitter",
};
