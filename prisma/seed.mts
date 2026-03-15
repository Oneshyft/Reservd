import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.outreachEvent.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.triggerPhrase.deleteMany();
  await prisma.outreachTemplate.deleteMany();
  await prisma.settings.deleteMany();

  const highPhrases = [
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
  const mediumPhrases = [
    "going to my first NFL game", "going to my first Red Wings game",
    "taking the team to a game", "client entertainment", "holiday party idea",
    "team outing", "company event", "group tickets",
    "how do I get good seats", "best way to get tickets",
    "stubhub is so expensive", "ticket prices are insane",
    "can't believe what tickets cost", "is it worth getting season tickets",
    "thinking about getting season tickets", "season ticket holder",
    "PSL", "deposit on season tickets",
  ];
  const lowPhrases = [
    "anyone been to a suite before", "what's it like in a suite",
    "is a suite worth it", "suite experience",
    "Ford Field experience", "LCA experience",
  ];

  for (const text of highPhrases) {
    await prisma.triggerPhrase.create({ data: { text, tier: "HIGH", isActive: true } });
  }
  for (const text of mediumPhrases) {
    await prisma.triggerPhrase.create({ data: { text, tier: "MEDIUM", isActive: true } });
  }
  for (const text of lowPhrases) {
    await prisma.triggerPhrase.create({ data: { text, tier: "LOW", isActive: true } });
  }

  const templates = [
    {
      name: "Season Ticket Cost — Lions",
      triggerTags: JSON.stringify(["can't afford", "too expensive", "wish I could afford", "Lions season tickets"]),
      bodyText: "Lions season tickets have gotten expensive fast since they got good again — totally get it. We offer shared suite access at Ford Field, a few games a year with the full suite experience (food, drinks, great sightlines) without the full season commitment. Happy to share details if you're interested!",
    },
    {
      name: "Season Ticket Cost — Red Wings",
      triggerTags: JSON.stringify(["can't afford", "too expensive", "Red Wings season tickets"]),
      bodyText: "Red Wings tickets at LCA are no joke price-wise. We do shared suite packages — a handful of games a year in a suite for way less than season tickets. Great option if you want the premium experience without locking in a full season. DM me if you want details!",
    },
    {
      name: "Waiting List — Lions",
      triggerTags: JSON.stringify(["waitlist", "waiting list", "Lions waitlist"]),
      bodyText: "The Lions waitlist is only going to get longer with how they've been playing. While you wait, we offer shared suite packages at Ford Field — a couple games a year in a real suite. Might be the best Lions experience available right now. DM me if curious!",
    },
    {
      name: "Waiting List — Red Wings",
      triggerTags: JSON.stringify(["waitlist", "waiting list", "Red Wings waitlist"]),
      bodyText: "Red Wings waitlists have always been tough. We actually offer shared suite access at LCA as an alternative — a few games a year with the full suite setup. Happy to share more if you're interested!",
    },
    {
      name: "Suite Inquiry — Detroit",
      triggerTags: JSON.stringify(["suite", "how much does a suite cost", "rent a suite", "suite rental"]),
      bodyText: "Hey! We do exactly this — shared and full suite rentals at both Ford Field (Lions) and Little Caesars Arena (Red Wings). Way more flexible than buying a suite outright. Shoot me a DM and I'll walk you through the packages!",
    },
    {
      name: "Corporate / Group",
      triggerTags: JSON.stringify(["client entertainment", "team outing", "company event", "group tickets", "holiday party", "corporate"]),
      bodyText: "For client entertainment or a team outing in Detroit, a suite at Ford Field or LCA is honestly the move. We offer both shared and full suite packages for Lions and Wings games — private space, catering, great views. Happy to send details!",
    },
    {
      name: "Combo Upsell",
      triggerTags: JSON.stringify(["Lions", "Red Wings", "Detroit sports", "both teams"]),
      bodyText: "If you're into both Lions and Wings, we have a combo package — suite access for Lions games at Ford Field AND Red Wings games at LCA. Best of both worlds without buying into full season tickets for either. DM me!",
    },
    {
      name: "Ticket Prices Too High",
      triggerTags: JSON.stringify(["stubhub", "ticket prices are insane", "so expensive", "secondary market"]),
      bodyText: "Yeah the secondary market has been brutal. We do shared suite access for Lions and Wings games — better experience than individual seats and often comparable in price once you factor in food and parking. DM if curious!",
    },
  ];

  for (const t of templates) {
    await prisma.outreachTemplate.create({ data: t });
  }

  const now = new Date();
  const leads = [
    { platform: "REDDIT", source: "r/detroitlions", author: "lionsfan2024", content: "Does anyone know how much Lions season tickets cost now? The waitlist is insane and I can't afford season tickets at this point. Feels like Ford Field is impossible to get into without dropping a fortune.", url: "https://reddit.com/r/detroitlions/example1", postTimestamp: new Date(now.getTime() - 1000*60*30), matchedPhrases: JSON.stringify(["Lions season tickets", "can't afford season tickets", "Lions waitlist"]), score: 10, status: "NEW", team: "LIONS" },
    { platform: "REDDIT", source: "r/detroitredwings", author: "hockeymike313", content: "I've been on the Red Wings season ticket waitlist for 2 years now. Anyone know how long it actually takes? LCA is amazing but the wait is killing me.", url: "https://reddit.com/r/detroitredwings/example2", postTimestamp: new Date(now.getTime() - 1000*60*90), matchedPhrases: JSON.stringify(["Red Wings season ticket waitlist", "Red Wings waitlist"]), score: 9, status: "NEW", team: "RED_WINGS" },
    { platform: "REDDIT", source: "r/detroit", author: "detroitproud", content: "Looking to rent a suite at Ford Field for a Lions game this fall. Also want to do something at Little Caesars Arena for the Wings. Anyone know how much suites cost?", url: "https://reddit.com/r/detroit/example3", postTimestamp: new Date(now.getTime() - 1000*60*120), matchedPhrases: JSON.stringify(["rent a suite for", "how much does a suite cost", "Ford Field suite", "Little Caesars Arena suite"]), score: 10, status: "REVIEWING", team: "BOTH" },
    { platform: "REDDIT", source: "r/detroitlions", author: "gridironguru", content: "Going to Ford Field for the first time this season! Going to my first NFL game ever. Any tips on getting good seats without paying crazy prices?", url: "https://reddit.com/r/detroitlions/example4", postTimestamp: new Date(now.getTime() - 1000*60*180), matchedPhrases: JSON.stringify(["going to Ford Field", "going to my first NFL game", "how do I get good seats"]), score: 8, status: "NEW", team: "LIONS" },
    { platform: "REDDIT", source: "r/Entrepreneur", author: "startuplife22", content: "Looking for ideas for client entertainment in Detroit. We have some big clients visiting and want to take them somewhere impressive. Maybe a sporting event?", url: "https://reddit.com/r/Entrepreneur/example5", postTimestamp: new Date(now.getTime() - 1000*60*240), matchedPhrases: JSON.stringify(["client entertainment"]), score: 5, status: "NEW", team: "UNKNOWN" },
    { platform: "REDDIT", source: "r/detroitlions", author: "roarrrr", content: "Season tickets too expensive for the Lions now. I remember when you could get lower bowl for $80/game. Now it's insane. Anyone have alternatives?", url: "https://reddit.com/r/detroitlions/example6", postTimestamp: new Date(now.getTime() - 1000*60*300), matchedPhrases: JSON.stringify(["season tickets too expensive", "Lions season tickets"]), score: 9, status: "COMMENTED", team: "LIONS" },
    { platform: "REDDIT", source: "r/TicketExchange", author: "ticketseeker99", content: "Need tickets for the Lions vs Packers game in December. Stubhub is so expensive right now. Anyone selling their tickets at face value?", url: "https://reddit.com/r/TicketExchange/example7", postTimestamp: new Date(now.getTime() - 1000*60*360), matchedPhrases: JSON.stringify(["need tickets for", "stubhub is so expensive", "anyone selling their tickets"]), score: 7, status: "NEW", team: "LIONS" },
    { platform: "REDDIT", source: "r/detroitredwings", author: "wingnut42", content: "Is a suite worth it at LCA? Thinking about booking one for my birthday but not sure about the cost. What's the suite experience like?", url: "https://reddit.com/r/detroitredwings/example8", postTimestamp: new Date(now.getTime() - 1000*60*420), matchedPhrases: JSON.stringify(["is a suite worth it", "suite experience", "LCA suite"]), score: 8, status: "DMED", team: "RED_WINGS" },
    { platform: "REDDIT", source: "r/corporateevents", author: "eventplanner_mi", content: "Planning a holiday party for about 20 people in Detroit. Thinking about a suite at a Red Wings game. Anyone done corporate suite events at Little Caesars Arena?", url: "https://reddit.com/r/corporateevents/example9", postTimestamp: new Date(now.getTime() - 1000*60*480), matchedPhrases: JSON.stringify(["holiday party idea", "corporate suite", "company event"]), score: 7, status: "NEW", team: "RED_WINGS" },
    { platform: "REDDIT", source: "r/Michigan", author: "michiganmade", content: "My company wants to do a team outing in Detroit. We're between a Lions game and a Red Wings game. Group of 15 people. What are group tickets like?", url: "https://reddit.com/r/Michigan/example10", postTimestamp: new Date(now.getTime() - 1000*60*540), matchedPhrases: JSON.stringify(["team outing", "group tickets"]), score: 7, status: "REVIEWING", team: "BOTH" },
    { platform: "REDDIT", source: "r/nfl", author: "nfl_casual", content: "Ticket prices are insane this year across the league. Can't believe what Lions tickets cost on the secondary market now.", url: "https://reddit.com/r/nfl/example11", postTimestamp: new Date(now.getTime() - 1000*60*600), matchedPhrases: JSON.stringify(["ticket prices are insane"]), score: 4, status: "NEW", team: "LIONS" },
    { platform: "REDDIT", source: "r/hockey", author: "pucklover", content: "Thinking about getting season tickets for the Red Wings. Is it worth getting season tickets or should I just buy individual games?", url: "https://reddit.com/r/hockey/example12", postTimestamp: new Date(now.getTime() - 1000*60*660), matchedPhrases: JSON.stringify(["thinking about getting season tickets", "is it worth getting season tickets"]), score: 4, status: "NEW", team: "RED_WINGS" },
    { platform: "REDDIT", source: "r/detroitlions", author: "tailgateking", content: "Just got off the Lions season ticket waitlist after 3 years! Finally got my seats at Ford Field. The deposit on season tickets was steep but worth it.", url: "https://reddit.com/r/detroitlions/example13", postTimestamp: new Date(now.getTime() - 1000*60*720), matchedPhrases: JSON.stringify(["finally got off the waitlist", "deposit on season tickets", "Lions season tickets"]), score: 6, status: "NOT_A_FIT", team: "LIONS" },
    { platform: "FACEBOOK", source: "Detroit Sports Fans", author: "Sarah Mitchell", content: "Anyone know where I can get Lions suite tickets without breaking the bank? Want to take my dad for his birthday at Ford Field.", url: "https://facebook.com/groups/detroitsportsfans/post/12345", postTimestamp: new Date(now.getTime() - 1000*60*800), matchedPhrases: JSON.stringify(["Ford Field suite", "Lions game tickets"]), score: 9, status: "NEW", team: "LIONS" },
    { platform: "REDDIT", source: "r/smallbusiness", author: "bizowner_det", content: "We're a small business in Detroit looking to do more client entertainment. Suite at Ford Field or LCA seems like a great way to impress clients.", url: "https://reddit.com/r/smallbusiness/example14", postTimestamp: new Date(now.getTime() - 1000*60*900), matchedPhrases: JSON.stringify(["client entertainment", "corporate suite"]), score: 6, status: "COMMENTED", team: "BOTH" },
    { platform: "TWITTER", source: "Twitter Search", author: "@DetroitFanatic", content: "Wish I could afford season tickets for the Lions. Ford Field is electric this year but my wallet can't handle it 😭", url: "https://twitter.com/DetroitFanatic/status/12345", postTimestamp: new Date(now.getTime() - 1000*60*1000), matchedPhrases: JSON.stringify(["wish I could afford season tickets", "Lions season tickets"]), score: 8, status: "NEW", team: "LIONS" },
    { platform: "REDDIT", source: "r/Frugal", author: "savvysaver", content: "Best way to get tickets to Detroit Lions games without paying crazy Stubhub prices? The secondary market is brutal this season.", url: "https://reddit.com/r/Frugal/example15", postTimestamp: new Date(now.getTime() - 1000*60*1100), matchedPhrases: JSON.stringify(["best way to get tickets", "stubhub is so expensive"]), score: 5, status: "NEW", team: "LIONS" },
    { platform: "REDDIT", source: "r/detroitredwings", author: "octogoal", content: "What's the LCA experience like for someone who's never been? Thinking about taking a group to a Wings game. Anyone been to a suite before?", url: "https://reddit.com/r/detroitredwings/example16", postTimestamp: new Date(now.getTime() - 1000*60*1200), matchedPhrases: JSON.stringify(["LCA experience", "anyone been to a suite before", "group tickets"]), score: 6, status: "NEW", team: "RED_WINGS" },
    { platform: "REDDIT", source: "r/detroitlions", author: "dan_campbell_fan", content: "PSL prices for the Lions keep going up. Deposit on season tickets is now crazy high. Anyone know alternatives to being a season ticket holder?", url: "https://reddit.com/r/detroitlions/example17", postTimestamp: new Date(now.getTime() - 1000*60*1300), matchedPhrases: JSON.stringify(["PSL", "deposit on season tickets", "season ticket holder"]), score: 6, status: "CONVERTED", team: "LIONS" },
    { platform: "REDDIT", source: "r/motorcitykitties", author: "detroitsportsfam", content: "Detroit sports are back! Lions looking great and Red Wings rebuilding nicely. Anyone know about 313 Presents packages for both teams? Looking for tickets to multiple games.", url: "https://reddit.com/r/motorcitykitties/example18", postTimestamp: new Date(now.getTime() - 1000*60*1400), matchedPhrases: JSON.stringify(["313 Presents", "looking for tickets to"]), score: 8, status: "NEW", team: "BOTH" },
  ];

  for (const lead of leads) {
    await prisma.lead.create({ data: lead });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
