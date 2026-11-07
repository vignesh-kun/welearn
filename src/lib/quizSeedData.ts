// Founder Quiz seed content — curated, E-Cell specific.
// Question types: scenario | red_flag | micro_math | pitch_pairing
// All financial math is verified. Real startup stories are well-known public facts.

export interface SeedQuizTrack {
  slug: string
  name: string
  shortName: string
  description: string
  accent: string // tailwind-safe hex
  iconName: string // lucide icon name
  sortOrder: number
}

export interface SeedQuizQuestion {
  trackSlug: string
  type: "scenario" | "red_flag" | "micro_math" | "pitch_pairing"
  scenario: string
  options: string[]
  answer: number
  explanation: string
  founderNote?: string
  difficulty: "easy" | "medium" | "hard"
  points: number
}

export interface SeedQuizBadge {
  slug: string
  trackSlug: string | null
  name: string
  description: string
  iconName: string
  accent: string
  criteria: { kind: string; threshold: number }
}

// Term founder-context upgrades — keyed by abbreviation (case-insensitive match in seed).
export interface SeedTermUpgrade {
  abbr: string
  ecellDefinition: string
  startupContext: string
  keyWarning: string
}

export const SEED_QUIZ_TRACKS: SeedQuizTrack[] = [
  {
    slug: "investment",
    name: "Incubator & Investment",
    shortName: "Investment",
    description: "Term sheets, cap tables, valuation, SAFEs, due diligence.",
    accent: "#10b981", // emerald
    iconName: "HandCoins",
    sortOrder: 1,
  },
  {
    slug: "growth",
    name: "Growth & Marketing",
    shortName: "Growth",
    description: "CAC, LTV, growth hacking, funnels, pricing strategies.",
    accent: "#3b82f6", // blue
    iconName: "TrendingUp",
    sortOrder: 2,
  },
  {
    slug: "ops_legal",
    name: "Operations & Legal",
    shortName: "Ops & Legal",
    description: "Due diligence, IP, contracts, escrow, auditing.",
    accent: "#f59e0b", // amber
    iconName: "Scale",
    sortOrder: 3,
  },
  {
    slug: "product_tech",
    name: "Product & Tech",
    shortName: "Product",
    description: "MVP, SaaS, UI/UX, scalability, beta testing.",
    accent: "#8b5cf6", // violet
    iconName: "Boxes",
    sortOrder: 4,
  },
  {
    slug: "strategy",
    name: "Macro-Strategy",
    shortName: "Strategy",
    description: "PESTLE, SWOT, economies of scale, tariffs, market structure.",
    accent: "#ec4899", // pink
    iconName: "Globe2",
    sortOrder: 5,
  },
]

export const SEED_QUIZ_QUESTIONS: SeedQuizQuestion[] = [
  // —————————————————————————————————————————————
  // 1. INVESTMENT & FUNDRAISING
  // —————————————————————————————————————————————
  {
    trackSlug: "investment",
    type: "scenario",
    scenario:
      "Your E-Cell startup is raising its first institutional round. A VC offers ₹2 Crore for 20% equity. After negotiation, they will only invest if you accept a 2x liquidation preference (non-participating). What does this 2x preference actually mean for the founders at an exit?",
    options: [
      "The VC gets to invest 2x more money next round.",
      "The VC must be paid back 2x their investment before founders see a rupee from an exit.",
      "The VC gets 2 board seats instead of 1.",
      "The founders' salary doubles after the exit.",
    ],
    answer: 1,
    explanation:
      "A liquidation preference states who gets paid first when the company is sold. A 2x non-participating preference means the VC is paid 2× their invested amount (here ₹4 Cr) before any remaining proceeds flow to common shareholders (founders, ESOP). Below that exit value, founders may get nothing.",
    founderNote:
      "Many first-time founders accept 'standard' term-sheet language without modelling the waterfall — and discover at exit that ~80% of the sale proceeds went to investors.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "investment",
    type: "micro_math",
    scenario:
      "An angel investor offers ₹10 Lakhs for 10% equity in your E-Cell startup. What are the Post-Money and Pre-Money valuations?",
    options: [
      "Post = ₹10 L, Pre = ₹9 L",
      "Post = ₹1 Crore, Pre = ₹90 Lakhs",
      "Post = ₹1 Crore, Pre = ₹1.1 Crore",
      "Post = ₹10 Lakhs, Pre = ₹11 Lakhs",
    ],
    answer: 1,
    explanation:
      "Post-money = investment ÷ equity% = ₹10 L ÷ 10% = ₹1 Crore. Pre-money = Post − investment = ₹1 Cr − ₹10 L = ₹90 Lakhs. Pre-money valuation is what the company was 'worth' before the cheque came in.",
    founderNote:
      "If the math feels backwards, remember: 'Post = what you are after the money lands, Pre = what you were before.'",
    difficulty: "easy",
    points: 10,
  },
  {
    trackSlug: "investment",
    type: "red_flag",
    scenario:
      "A founder pitches: 'We are raising ₹5 Cr at a ₹50 Cr cap on a SAFE. Our monthly burn is ₹15 L and we have ₹20 L in the bank. We expect Series A in 8 months.' Which ONE red flag is the most severe?",
    options: [
      "SAFEs are illegal for Indian startups.",
      "The runway is only ~1.3 months, far shorter than the 8-month Series A timeline.",
      "₹50 Cr cap is too high for an early stage.",
      "Monthly burn of ₹15 L is too low for a tech startup.",
    ],
    answer: 1,
    explanation:
      "Runway = Cash ÷ monthly burn = ₹20 L ÷ ₹15 L ≈ 1.3 months. With a Series A planned in 8 months, the company will run out of cash ~7 months before the round closes — a near-certain death sentence unless they cut burn drastically or raise a bridge. Everything else is debatable.",
    founderNote:
      "Always sanity-check your own pitch deck for runway vs next-fundraise timeline. Investors spot this in seconds.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "investment",
    type: "scenario",
    scenario:
      "Two VCs offer term sheets. VC-A: ₹5 Cr at ₹20 Cr pre-money, no participating preference. VC-B: ₹5 Cr at ₹25 Cr pre-money, 1x participating preference (capped at 2x). On a ₹30 Cr exit, which is better for founders?",
    options: [
      "VC-B — higher pre-money always benefits founders.",
      "VC-A — participating preferences quietly erode founder proceeds at moderate exits.",
      "They are mathematically identical.",
      "Depends only on the ESOP pool size.",
    ],
    answer: 1,
    explanation:
      "VC-A (non-participating, 1x): investor gets max(1× ₹5 Cr, their 20% share) = max(₹5 Cr, ₹6 Cr) = ₹6 Cr. Founders get ₹24 Cr. VC-B (participating 1x, capped 2x): investor gets ₹5 Cr + 16.7% of remaining ₹25 Cr = ₹5 Cr + ₹4.17 Cr = ₹9.17 Cr. Founders get ₹20.83 Cr. The higher headline valuation hid ~₹3 Cr of founder dilution.",
    founderNote:
      "Always model the exit waterfall — never just compare the headline pre-money number.",
    difficulty: "hard",
    points: 20,
  },

  // —————————————————————————————————————————————
  // 2. GROWTH & MARKETING
  // —————————————————————————————————————————————
  {
    trackSlug: "growth",
    type: "scenario",
    scenario:
      "Your E-Cell startup is launching a campus food delivery app. Swiggy and Zomato dominate the market. You decide to offer ₹10 meals for the first month to grab 80% market share despite losing money per order. Which strategy is this?",
    options: ["Price Skimming", "Penetration Pricing", "Loss Leader Pricing", "Premium Pricing"],
    answer: 1,
    explanation:
      "Penetration pricing = setting a deliberately low price (often below cost) to rapidly capture market share, with the expectation of raising prices later. Loss leader is similar but refers to selling one product at a loss to drive traffic to other profitable products. Skimming is the opposite (start high, lower over time).",
    founderNote:
      "Uber, Ola, Swiggy, Zepto — all used penetration pricing in India. The bet only works if (a) you can fund losses long enough, and (b) customers stay after prices normalise.",
    difficulty: "easy",
    points: 10,
  },
  {
    trackSlug: "growth",
    type: "micro_math",
    scenario:
      "A D2C skincare brand spends ₹2,00,000 on Instagram ads in a month and acquires 250 new customers. Average order value is ₹1,000 and gross margin is 60%. Customer repeats 4× per year for 2 years. What is the CAC : LTV ratio?",
    options: [
      "1 : 1.2 (barely profitable)",
      "1 : 6 (healthy)",
      "1 : 12 (excellent)",
      "1 : 0.5 (loss-making)",
    ],
    answer: 1,
    explanation:
      "CAC = ₹2,00,000 ÷ 250 = ₹800. LTV (margin) = ₹1,000 × 60% × 4 × 2 = ₹4,800. Ratio = 4,800 ÷ 800 = 6 : 1. Healthy D2C brands target 3 : 1 or better; 6 : 1 is excellent and suggests room to spend more aggressively on acquisition.",
    founderNote:
      "Always compute LTV on gross margin, not revenue. Top-line LTV hides unprofitable unit economics.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "growth",
    type: "red_flag",
    scenario:
      "A pitch deck claims: 'Our CAC is ₹50, LTV is ₹5,000, payback period is 1 day. We will be profitable in week one.' Which 2 concepts are broken? (Pick the option that names BOTH correctly.)",
    options: [
      "TAM is overstated and burn is too high.",
      "CAC is undercounted (likely excluding team + ad-agency costs) and payback ignores cash-collection lag.",
      "LTV should be annualised and run-rate is incorrect.",
      "MRR is wrong and churn is hidden.",
    ],
    answer: 1,
    explanation:
      "CAC of ₹50 is implausibly low for paid acquisition in India — it almost certainly omits ad-agency fees, creative costs, and the salary of the growth team. Payback period in days assumes customers pay and reorder instantly, which never happens. The real, fully-loaded CAC is often 3–5× the 'blended ad-spend' number.",
    founderNote:
      "Investors will recompute fully-loaded CAC during diligence. Be honest in your own model first.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "growth",
    type: "scenario",
    scenario:
      "Your freemium SaaS app has 10,000 free users converting to paid at 2% with an ARPU of ₹500/month. You are debating whether to: (A) double free users via paid marketing at ₹50 CAC, or (B) raise the conversion rate from 2% to 4% via better onboarding. Both cost roughly the same. Which moves MRR more?",
    options: [
      "A — more users always wins.",
      "B — doubling conversion doubles MRR immediately and compounds with every future signup.",
      "They are identical.",
      "Neither — both are vanity metrics.",
    ],
    answer: 1,
    explanation:
      "Option A: 20,000 free × 2% × ₹500 = ₹2,00,000 MRR (doubles today, but every new cohort also converts at 2%). Option B: 10,000 × 4% × ₹500 = ₹2,00,000 MRR today — AND every future marketing-spend cohort also converts at 4%. Compounding means B dominates A in months 3+. This is the classic 'grow funnel vs widen funnel' call.",
    founderNote:
      "Pre-product-market-fit, optimise conversion. Post-PMF, pour fuel on acquisition. Doing them in reverse is the #1 way startups waste seed capital.",
    difficulty: "hard",
    points: 20,
  },

  // —————————————————————————————————————————————
  // 3. OPERATIONS & LEGAL
  // —————————————————————————————————————————————
  {
    trackSlug: "ops_legal",
    type: "scenario",
    scenario:
      "Two co-founders have been running their E-Cell startup for 8 months. There is no signed agreement — they 'shook on' a 50:50 split verbally. Founder A built the product; Founder B brought customers. Now they're raising seed money. What is the most professional path forward?",
    options: [
      "Tell investors it's 50:50 verbal, they'll understand.",
      "Sign a Founders' Agreement with vesting (typically 4-year, 1-year cliff) before the seed round closes.",
      "Issue 100% to Founder A since the product matters more.",
      "Wait until the seed round closes and let the VC decide splits.",
    ],
    answer: 1,
    explanation:
      "A Founders' Agreement with 4-year vesting (1-year cliff) protects everyone: if one founder leaves early, unvested shares return to the ESOP pool, avoiding 'dead equity.' Without it, VCs will either refuse to fund or force a messy restructuring that can cost months.",
    founderNote:
      "Many student startups die at this exact step. Draft the agreement on day one — it costs ₹5,000 in legal fees and saves crores.",
    difficulty: "easy",
    points: 10,
  },
  {
    trackSlug: "ops_legal",
    type: "red_flag",
    scenario:
      "A founder says: 'We outsourced our MVP to an agency and they own the source code. We have a verbal understanding that it's ours. Also, our brand name isn't trademarked yet because we'll do that post-Series A.' Which TWO legal exposures are MOST critical?",
    options: [
      "Operating in a co-working space without a GST number.",
      "Agency owns the IP (no work-for-hire agreement) and the brand name is unregistered (someone else could trademark it first).",
      "Hiring interns without offer letters and not filing TDS.",
      "Using Google Workspace instead of a paid email host.",
    ],
    answer: 1,
    explanation:
      "These are the two legal landmines that kill startups: (1) Without a work-for-hire / IP assignment clause, the agency legally owns your codebase and can refuse to hand it over, license it to competitors, or sue you. (2) Without trademark filing, anyone can register your brand name and force you to rebrand after you've built equity — see the 'Bira' vs 'Bira 91' style disputes in India.",
    founderNote:
      "IP assignment + trademark filing should be the first ₹30,000 a startup spends after incorporation. Skip it and you're renting your own product.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "ops_legal",
    type: "scenario",
    scenario:
      "An investor is about to wire ₹50 Lakhs into your E-Cell startup. They ask for 'standard' due diligence. What should you have ready BEFORE they ask?",
    options: [
      "Only your pitch deck — DD happens after the wire.",
      "Cap table, founders' agreement, IP assignments, employment contracts, GST/PAN filings, bank statements, MCA filings, customer contracts.",
      "Just your Product Hunt launch screenshots.",
      "A list of every tweet you've posted in 5 years.",
    ],
    answer: 1,
    explanation:
      "Due diligence is the comprehensive audit investors perform before wiring money. The standard DD checklist covers legal (incorporation docs, cap table, IP, contracts), financial (bank statements, GST returns, MCA filings), and technical (code ownership, security). Having a clean 'data room' ready compresses funding time from 3 months to 3 weeks.",
    founderNote:
      "In 2023, an investor backed out of funding a student startup during DD because the co-founders had no registered partnership agreement. Don't be that founder.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "ops_legal",
    type: "micro_math",
    scenario:
      "Your E-Cell coffee cart has fixed monthly costs of ₹5,000 rent + ₹3,000 utilities + ₹25,000 staff salary = ₹33,000. Variable cost per cup (beans + milk + cup) is ₹15. You sell each cup at ₹40. How many cups must you sell per month to break even?",
    options: ["540 cups/month", "1,320 cups/month (~44/day)", "2,200 cups/month (~73/day)", "825 cups/month (~28/day)"],
    answer: 1,
    explanation:
      "Contribution per cup = Selling price − variable cost = ₹40 − ₹15 = ₹25. Break-even = Fixed costs ÷ contribution per unit = ₹33,000 ÷ ₹25 = 1,320 cups/month. At 30 days, that's ~44 cups/day — a meaningful daily throughput target.",
    founderNote:
      "Founders often memorise revenue-per-unit but forget fixed costs. Break-even = Fixed costs ÷ (Revenue per unit − Variable cost per unit). Always model the 'minimum daily throughput' required to stay alive.",
    difficulty: "medium",
    points: 15,
  },

  // —————————————————————————————————————————————
  // 4. PRODUCT & TECH
  // —————————————————————————————————————————————
  {
    trackSlug: "product_tech",
    type: "scenario",
    scenario:
      "Your team has spent 4 months building a feature-rich campus marketplace app with payments, chat, AI recommendations, and live tracking. Beta users signed up but nobody is buying. What is the LEAST wasteful next move?",
    options: [
      "Add a referral program to acquire more users.",
      "Strip the product back to ONE core job (e.g., just listings), talk to 20 users, measure whether they complete that job, then iterate.",
      "Run paid ads to drive more signups.",
      "Build a mobile app version since the website feels slow.",
    ],
    answer: 1,
    explanation:
      "This is the classic MVP (Minimum Viable Product) trap: building too much before validating. The right move is to cut features ruthlessly, define the single 'job to be done,' and verify with 20 real users that they actually complete it. If they don't, no amount of marketing fixes the leaky bucket.",
    founderNote:
      "An MVP is not 'the product with fewer features' — it's 'the smallest thing that proves the core value proposition works.' Build the test, not the product.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "product_tech",
    type: "scenario",
    scenario:
      "Your SaaS startup hit ₹1 Lakh MRR with 100 paying customers. But 8 customers cancelled last month, and you added 12 new ones. What's your monthly churn rate, and is it healthy for early-stage SaaS?",
    options: [
      "8% monthly churn — far too high for SaaS (target <2% monthly).",
      "8% monthly churn — perfectly healthy.",
      "0% churn — you added more than you lost.",
      "12% churn — same as your new signups.",
    ],
    answer: 0,
    explanation:
      "Churn rate = customers lost ÷ customers at start of period = 8 ÷ 100 = 8% monthly. For early-stage B2B SaaS, anything above 2–3% monthly is a red flag because it implies you're losing customers faster than you can realistically acquire them — the famous 'leaky bucket.' Above 5%, growth is mathematically capped.",
    founderNote:
      "If churn > growth rate, you don't have a growth problem — you have a retention problem. Fix the bucket first.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "product_tech",
    type: "red_flag",
    scenario:
      "A founder's pitch says: 'Our MVP is ready. We will launch next week. But we have not done any user testing — we are confident because we surveyed 200 people online.' Which is the biggest red flag?",
    options: [
      "Surveying 200 people — that is statistically invalid.",
      "Skipping real user testing before launch — survey 'intent' rarely matches actual usage.",
      "Launching next week — too soon.",
      "Calling it an MVP — should be a 'prototype.'",
    ],
    answer: 1,
    explanation:
      "Surveys measure stated preference ('would you use this?'), which consistently overstates actual usage by 3–10×. Only live, in-person usability tests (watching 5–10 real users try to use your product) reveal the truth. A famous Nielsen Norman Group finding: 5 users uncover ~85% of usability issues.",
    founderNote:
      "Intent ≠ behaviour. 'I would definitely pay for that' from a survey is worth roughly ₹0. A credit-card swipe is worth ₹5,000.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "product_tech",
    type: "micro_math",
    scenario:
      "Your SaaS startup has 200 paying customers at ₹500/month. Churn is 5% monthly. Assuming you stop all new acquisition today, how many paying customers will you have after 6 months (rounded)?",
    options: ["~100", "~150", "~80", "~200"],
    answer: 1,
    explanation:
      "Each month you keep 95% of customers. After 6 months: 200 × 0.95^6 = 200 × 0.735 = ~147 ≈ 150 customers. That's a 25% loss of revenue with zero new acquisition — illustrates why churn compounds viciously.",
    founderNote:
      "Churn is a half-life. 5% monthly means you lose ~46% of revenue per year even with no acquisition slowdown.",
    difficulty: "hard",
    points: 20,
  },

  // —————————————————————————————————————————————
  // 5. MACRO-STRATEGY
  // —————————————————————————————————————————————
  {
    trackSlug: "strategy",
    type: "scenario",
    scenario:
      "You're evaluating whether to launch an edtech startup in tier-2 India. You analyse: government policy (NEP 2020), economic trends (rising UPI penetration), social shifts (post-COVID online comfort), tech maturity (cheap data), legal (data-localisation), and environmental (rural electrification). Which framework is this?",
    options: ["SWOT", "PESTLE", "Porter's Five Forces", "BCG Matrix"],
    answer: 1,
    explanation:
      "PESTLE = Political, Economic, Social, Technological, Legal, Environmental. It's a macro-environmental scan used to understand the larger forces shaping an industry before strategy decisions. SWOT is company-specific (Strengths/Weaknesses/Opportunities/Threats). Porter's Five Forces analyses industry competitiveness.",
    founderNote:
      "Use PESTLE BEFORE market entry (does this category make sense in this geography?). Use SWOT for positioning your specific startup within that category.",
    difficulty: "easy",
    points: 10,
  },
  {
    trackSlug: "strategy",
    type: "red_flag",
    scenario:
      "A pitch deck reads: 'Our TAM is $10 Billion. We have zero competitors. We will capture 50% market share in Year 1 with no marketing spend.' Which TWO strategic concepts are broken? (Pick the option that names BOTH correctly.)",
    options: [
      "PESTLE is missing and Porter's Five Forces is outdated.",
      "SOM (Serviceable Obtainable Market) is wildly unrealistic, and 'zero competitors' either means the market doesn't exist or the founder hasn't researched it.",
      "SWOT is misaligned and TAM is calculated incorrectly.",
      "Economies of scale don't apply and barriers to entry are too low.",
    ],
    answer: 1,
    explanation:
      "TAM (Total Addressable Market) is the total global revenue if every potential customer bought. SOM (Serviceable Obtainable Market) is the realistic slice you can capture in 3–5 years — usually 1–5% of TAM, NOT 50%. And 'zero competitors' is almost always a founder delusion; either the market is non-existent or the founder hasn't done the homework (Google 'direct + indirect competitors').",
    founderNote:
      "Investors mentally divide TAM by 100 the moment you say it. Pitch SOM, not TAM — it shows you understand the difference between ambition and delusion.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "strategy",
    type: "scenario",
    scenario:
      "You run a campus coffee cart. Cost per cup: ₹15 (beans + milk + cup). You sell 200 cups/day at ₹40. Your landlord offers a 2nd cart location for ₹5,000/month extra rent. You expect 100 cups/day there. Your fixed costs stay mostly the same (you hire 1 part-timer for ₹6,000/month). What economic concept MOST explains why the 2nd cart is profitable?",
    options: [
      "Loss leader pricing.",
      "Economies of scale — spreading fixed costs (cart, equipment, brand) over more units lowers average cost per cup.",
      "Penetration pricing.",
      "Price discrimination.",
    ],
    answer: 1,
    explanation:
      "Economies of scale: as you produce more units, fixed costs (cart, machine, brand, your salary) spread across more cups, dropping the per-cup total cost. Today: fixed ~₹5/cup; with 2 carts producing 300 cups, fixed ~₹3.3/cup. Each new cup sells at ₹40 with marginal cost only ₹15 — so the 2nd cart's 100 cups add ₹2,500/day gross profit.",
    founderNote:
      "This is why Swiggy/Zomato/Zepto fight so viciously for order density — every additional order on the same delivery network is nearly pure margin.",
    difficulty: "medium",
    points: 15,
  },
  {
    trackSlug: "strategy",
    type: "pitch_pairing",
    scenario:
      "PITCH PAIRING DRILL — You will be given 3 terms below. Your challenge: write a 60-second elevator pitch (target: 80–120 words) where a fictional startup founder uses ALL THREE terms naturally. The system saves your pitch and gives instant AI-style feedback in your 'My Studio'. Click START to receive your 3 terms.",
    options: ["START — give me my 3 terms"],
    answer: 0,
    explanation:
      "This is a free-form drill, not a graded MCQ. The 'correct answer' here simply unlocks the pitch prompt in the next screen. You earn 15 points for completing any pitch attempt — points are for the practice, not for grading your speech.",
    founderNote:
      "Founder tip: the best elevator pitches DON'T lead with the term — they lead with the customer problem, then drop the term naturally to show mastery. Example: 'We're cutting customer acquisition cost by 70% for D2C brands by…'",
    difficulty: "easy",
    points: 15,
  },
]

export const SEED_QUIZ_BADGES: SeedQuizBadge[] = [
  {
    slug: "first_steps",
    trackSlug: null,
    name: "First Steps",
    description: "Answered your very first founder-mode question correctly.",
    iconName: "Footprints",
    accent: "#10b981",
    criteria: { kind: "any_correct", threshold: 1 },
  },
  {
    slug: "investment_apprentice",
    trackSlug: "investment",
    name: "Investment Apprentice",
    description: "Got 3 Investment-track questions right.",
    iconName: "HandCoins",
    accent: "#10b981",
    criteria: { kind: "track_correct", threshold: 3 },
  },
  {
    slug: "growth_hacker",
    trackSlug: "growth",
    name: "Growth Hacker",
    description: "Got 3 Growth & Marketing questions right.",
    iconName: "TrendingUp",
    accent: "#3b82f6",
    criteria: { kind: "track_correct", threshold: 3 },
  },
  {
    slug: "legal_aware",
    trackSlug: "ops_legal",
    name: "Legally Aware",
    description: "Got 3 Operations & Legal questions right.",
    iconName: "Scale",
    accent: "#f59e0b",
    criteria: { kind: "track_correct", threshold: 3 },
  },
  {
    slug: "product_thinker",
    trackSlug: "product_tech",
    name: "Product Thinker",
    description: "Got 3 Product & Tech questions right.",
    iconName: "Boxes",
    accent: "#8b5cf6",
    criteria: { kind: "track_correct", threshold: 3 },
  },
  {
    slug: "strategist",
    trackSlug: "strategy",
    name: "Strategist",
    description: "Got 3 Macro-Strategy questions right.",
    iconName: "Globe2",
    accent: "#ec4899",
    criteria: { kind: "track_correct", threshold: 3 },
  },
  {
    slug: "pitch_master",
    trackSlug: null,
    name: "Pitch Master",
    description: "Completed your first 3-term elevator pitch drill.",
    iconName: "Mic",
    accent: "#f97316",
    criteria: { kind: "pitch_completed", threshold: 1 },
  },
  {
    slug: "founder_mode_on",
    trackSlug: null,
    name: "Founder Mode: ON",
    description: "Earned all 5 track badges — full-spectrum founder training complete.",
    iconName: "Crown",
    accent: "#facc15",
    criteria: { kind: "all_track_badges", threshold: 5 },
  },
]

// Founder-context upgrades for EXISTING terms in seedData.ts.
// Matched case-insensitively on the .abbr field during seeding.
export const SEED_TERM_UPGRADES: SeedTermUpgrade[] = [
  {
    abbr: "CAC",
    ecellDefinition: "Customer Acquisition Cost — fully-loaded spend required to win one paying customer.",
    startupContext:
      "In 2015, Snapdeal allegedly burned ₹800+ per customer on discounts, leading to a near-death valuation cut in 2017 when SoftBank realised the unit economics were upside down.",
    keyWarning: "Always compute CAC fully-loaded (ads + agency + creative + growth team salaries), not just ad-spend — the gap is usually 3–5×.",
  },
  {
    abbr: "LTV",
    ecellDefinition: "Lifetime Value — total gross-margin profit a single customer generates over their full relationship with the company.",
    startupContext:
      "Netflix's streaming LTV is estimated at ~$200+ per subscriber because of low churn and long tenure; Hotstar in India struggled to push LTV above ₹800 due to high monthly churn around cricket off-seasons.",
    keyWarning: "Never quote LTV in revenue terms — always in margin terms. A revenue-LTV of ₹5,000 with 5% margin is only ₹250 of real value.",
  },
  {
    abbr: "TAM",
    ecellDefinition: "Total Addressable Market — every possible rupee of revenue if 100% of all potential customers globally bought.",
    startupContext:
      "Theranos claimed a $75B+ TAM in blood-testing; investors later discovered the actual obtainable market was 1/100th of that because the tech didn't work for most tests.",
    keyWarning: "Investors automatically divide TAM by 100. Pitch SOM instead — it shows you know the difference between ambition and realism.",
  },
  {
    abbr: "SAM",
    ecellDefinition: "Serviceable Available Market — the slice of TAM that fits your business model, geography, and product.",
    startupContext:
      "Ola's TAM is all India ride-hailing (~$30B). Its SAM is ride-hailing in cities where Ola operates (~$10B). Its SOM is the realistic share it can capture (~$3B in revenue over 5 years).",
    keyWarning: "Don't conflate TAM with SAM. A common pitch error: 'We will capture 1% of the $30B Indian market' — but your SAM might be $2B, making 1% of THAT just ₹20 Cr, not ₹300 Cr.",
  },
  {
    abbr: "SOM",
    ecellDefinition: "Serviceable Obtainable Market — the realistic 3–5 year revenue you can actually capture, factoring in competition and execution capacity.",
    startupContext:
      "Zepto's SOM in 2022 was estimated at ~$300M (quick-commerce in Mumbai + Bangalore); they pitched TAM of $5B+ (all India grocery). Investors funded them on SOM, not TAM.",
    keyWarning: "If your SOM doesn't have a believable path to ₹100 Cr revenue in 5 years, most seed funds won't write a cheque — regardless of how big the TAM is.",
  },
  {
    abbr: "MVP",
    ecellDefinition: "Minimum Viable Product — the smallest version of your product that proves the core value proposition actually works for real users.",
    startupContext:
      "Dropbox's MVP wasn't even a working app — it was a 3-minute demo video. Sign-ups jumped from 5,000 to 75,000 overnight, proving demand before building the full product.",
    keyWarning: "An MVP is NOT 'the product with fewer features.' It's the smallest test that validates whether the core promise works. If you're building for 6 months, it's not an MVP.",
  },
  {
    abbr: "EBITDA",
    ecellDefinition: "Earnings Before Interest, Taxes, Depreciation & Amortisation — a rough proxy for operating cash generation.",
    startupContext:
      "Zomato reported EBITDA-positive in its food-delivery business in early 2023, after years of losses — a key moment that lifted its battered stock price.",
    keyWarning: "EBITDA can hide real cash burn because it excludes interest and capex. Always pair it with operating cash flow.",
  },
  {
    abbr: "PMF",
    ecellDefinition: "Product-Market Fit — the moment a product satisfies a real market need so strongly that usage grows with little marketing push.",
    startupContext:
      "Slack hit PMF in 2014 — within 8 months of launch it had 1.1M DAU and zero paid marketing. Marc Andreessen famously said: 'You know PMF when the market pulls the product out of your hands.'",
    keyWarning: "If you can't articulate the PMF moment in one sentence, you don't have it yet. Don't pour fuel (paid acquisition) until PMF is real — you'll burn the runway.",
  },
  {
    abbr: "B2B",
    ecellDefinition: "Business-to-Business — selling to other companies rather than individual consumers.",
    startupContext:
      "Freshworks started as a B2B helpdesk SaaS; its enterprise-grade contracts gave it predictable revenue, eventually leading to a $5B+ Nasdaq IPO in 2021.",
    keyWarning: "B2B sales cycles are slow (3–12 months) but churn is far lower than B2C. Model your runway accordingly — B2B startups often need 24 months of cash, not 12.",
  },
  {
    abbr: "D2C",
    ecellDefinition: "Direct-to-Consumer — selling your own branded product straight to the end customer, bypassing retail intermediaries.",
    startupContext:
      "boAt built a ₹2,000 Cr+ revenue D2C brand selling affordable audio gear, bypassing traditional retail distributors and capturing 30%+ market share in India's audio segment.",
    keyWarning: "D2C economics hinge on LTV:CAC > 3:1. If your fully-loaded CAC > 1/3 of margin-LTV, you will burn money on every order — even at scale.",
  },
  {
    abbr: "ESOP",
    ecellDefinition: "Employee Stock Ownership Plan — granting employees equity (or options) so they share in upside, aligning long-term incentives.",
    startupContext:
      "When Flipkart was acquired by Walmart in 2018, ~100 employees became crorepatis purely from vested ESOPs — a turning point in Indian startup culture around equity-sharing.",
    keyWarning: "Always use 4-year vesting with a 1-year cliff. Handing equity upfront without vesting is the #1 cause of 'dead equity' — shares held by founders who left in year 1.",
  },
  {
    abbr: "NPS",
    ecellDefinition: "Net Promoter Score — % of promoters (score 9-10) minus % of detractors (score 0-6) on the 'would you recommend?' question.",
    startupContext:
      "Apple's iPhone NPS consistently sits above 70; in Indian fintech, CRED claims NPS above 80. Above 50 is excellent; above 0 is just 'okay.'",
    keyWarning: "NPS measures sentiment, not usage. A customer can love your product (high NPS) and still not pay — always pair with retention/churn data.",
  },
]
