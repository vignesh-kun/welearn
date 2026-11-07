// Curated seed content for WeLearn — E-Cell prep platform.
// All math answers verified. Videos verified via web research (Nov 2026).

export interface SeedPuzzle {
  externalId: string
  type: "math" | "logic" | "operations" | "estimation" | "strategy"
  title: string
  statement: string
  options: string[]
  answer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  points: number
}

export const SEED_PUZZLES: SeedPuzzle[] = [
  {
    externalId: "puz-001",
    type: "math",
    title: "Break-even for boAt-style headphones",
    statement:
      "Your startup sells wireless headphones at ₹1,499 each. Variable cost per unit is ₹900 and fixed costs (salaries, rent, ads) are ₹1,79,700 per month. How many units must you sell per month to break even?",
    options: ["250 units", "280 units", "300 units", "320 units"],
    answer: 2,
    explanation:
      "Contribution per unit = ₹1,499 − ₹900 = ₹599. Break-even = Fixed costs ÷ contribution = 1,79,700 ÷ 599 = 300 units.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-002",
    type: "math",
    title: "Runway check",
    statement:
      "A seed-funded startup has ₹48,00,000 in the bank and a net burn of ₹6,00,000 per month. How many months of runway does it have?",
    options: ["6 months", "7 months", "8 months", "10 months"],
    answer: 2,
    explanation: "Runway = Cash ÷ net monthly burn = 48,00,000 ÷ 6,00,000 = 8 months.",
    difficulty: "easy",
    points: 10,
  },
  {
    externalId: "puz-003",
    type: "math",
    title: "LTV of a coffee-subscriber",
    statement:
      "A D2C coffee brand's average order is ₹800 with a 25% gross margin. A loyal customer orders 6 times a year for 3 years. What is the customer's lifetime value in GROSS MARGIN terms?",
    options: ["₹14,400", "₹3,600", "₹4,800", "₹2,400"],
    answer: 1,
    explanation:
      "Revenue LTV = 800 × 6 × 3 = ₹14,400. Margin LTV = 25% × 14,400 = ₹3,600. Always judge LTV on margin, not revenue.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-004",
    type: "math",
    title: "CAC payback period",
    statement:
      "A fintech app spends ₹1,200 to acquire a customer (CAC). Each customer contributes ₹400 of gross profit per month. How many months until the customer pays back the acquisition cost?",
    options: ["2 months", "3 months", "4 months", "6 months"],
    answer: 1,
    explanation: "Payback = CAC ÷ monthly contribution = 1,200 ÷ 400 = 3 months.",
    difficulty: "easy",
    points: 10,
  },
  {
    externalId: "puz-005",
    type: "math",
    title: "Marketplace listing price",
    statement:
      "A marketplace charges a 12% commission on listed price. A seller wants to net exactly ₹5,000 per unit after commission. What listed price should they set (rounded to the nearest rupee)?",
    options: ["₹5,600", "₹5,682", "₹5,720", "₹5,800"],
    answer: 1,
    explanation:
      "Net = Listed × (1 − 0.12) → Listed = 5,000 ÷ 0.88 = ₹5,681.8 ≈ ₹5,682. A common trap is adding 12% of 5,000 (= ₹5,600), which nets only ₹4,928.",
    difficulty: "hard",
    points: 20,
  },
  {
    externalId: "puz-006",
    type: "math",
    title: "MoM growth rate",
    statement:
      "A campus marketplace grows from 4,000 users to 9,000 users in one month. What is the month-on-month growth rate?",
    options: ["105%", "115%", "125%", "225%"],
    answer: 2,
    explanation: "Growth = (9,000 − 4,000) ÷ 4,000 = 1.25 = 125%. The new total (225%) is not the growth rate.",
    difficulty: "easy",
    points: 10,
  },
  {
    externalId: "puz-007",
    type: "math",
    title: "Marketplace revenue (GMV → take)",
    statement:
      "In October, a platform processed 10,000 orders with an average order value of ₹650 and takes an 8% commission. What was the platform's revenue?",
    options: ["₹5,20,000", "₹52,00,000", "₹6,50,000", "₹4,16,000"],
    answer: 0,
    explanation: "GMV = 10,000 × 650 = ₹65,00,000. Revenue = 8% of GMV = ₹5,20,000.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-008",
    type: "math",
    title: "Net churn",
    statement:
      "A subscription app starts the month with 2,000 paying users, loses 300 to churn, but gains 500 new users. What is the NET monthly growth rate?",
    options: ["+10%", "−10%", "+25%", "+15%"],
    answer: 0,
    explanation:
      "Net change = 500 − 300 = +200 users. Growth = 200 ÷ 2,000 = +10%. Churn matters, but growth counts the net.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-009",
    type: "logic",
    title: "The notebook and the pen",
    statement:
      "At your college fest stall, a notebook and a pen together cost ₹110. The notebook costs ₹100 more than the pen. What is the price of the pen?",
    options: ["₹10", "₹5", "₹15", "₹20"],
    answer: 1,
    explanation:
      "Pen = ₹5, Notebook = ₹105 (₹100 more). If pen were ₹10, the notebook would be ₹110 and the total ₹120. Intuition is the trap; algebra wins.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-010",
    type: "logic",
    title: "Syllogism: D2C brands",
    statement:
      "All D2C brands sell online. Some D2C brands are profitable. Which conclusion MUST be true?",
    options: [
      "All online sellers are profitable",
      "At least some online sellers are D2C",
      "No online seller is profitable",
      "All D2C brands are unprofitable",
    ],
    answer: 1,
    explanation:
      "Every D2C brand sells online, and D2C brands exist — therefore some online sellers are D2C brands. The other options assert things the statements never guarantee.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-011",
    type: "estimation",
    title: "The metro chai stall",
    statement:
      "A tea stall outside a metro station sells about 2 cups/minute during 6 peak hours and about 0.5 cups/minute during the other 6 hours it stays open. Roughly how many cups does it sell per day?",
    options: ["600 cups", "750 cups", "900 cups", "1,200 cups"],
    answer: 2,
    explanation:
      "Peak: 2 × 60 × 6 = 720 cups. Off-peak: 0.5 × 60 × 6 = 180 cups. Total ≈ 900 cups — a ~₹18,000/day business at ₹20/cup.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-012",
    type: "estimation",
    title: "Assignment printing demand",
    statement:
      "A college has 2,000 students. Each submits one 20-page assignment every month. Estimate the pages printed per month on campus.",
    options: ["20,000 pages", "40,000 pages", "60,000 pages", "2,00,000 pages"],
    answer: 1,
    explanation: "2,000 students × 20 pages = 40,000 pages/month. At ₹2/page, that's an ₹80,000/month printing market on one campus.",
    difficulty: "easy",
    points: 10,
  },
  {
    externalId: "puz-013",
    type: "operations",
    title: "10-minute delivery capacity",
    statement:
      "A dark store fulfils orders in a 12-minute cycle (pick, pack, travel). With 8 riders working, roughly what is the maximum number of orders per hour?",
    options: ["32 orders", "40 orders", "48 orders", "60 orders"],
    answer: 1,
    explanation: "Each rider completes 60 ÷ 12 = 5 orders/hour. 8 riders × 5 = 40 orders/hour. This is why rider count drives quick-commerce economics.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-014",
    type: "operations",
    title: "Interview scheduling",
    statement:
      "Your E-Cell runs recruitment interviews. Each panel takes 15 minutes per candidate and you have 2 panels running in parallel. How long will 30 candidates take?",
    options: ["3 hours", "3 hours 45 minutes", "4 hours", "7 hours 30 minutes"],
    answer: 1,
    explanation:
      "Two panels handle 2 candidates per 15 min → 30 ÷ 2 = 15 rounds × 15 min = 225 minutes = 3 hours 45 minutes.",
    difficulty: "easy",
    points: 10,
  },
  {
    externalId: "puz-015",
    type: "operations",
    title: "Reorder point",
    statement:
      "A stationery startup sells 50 units/day. Supplier lead time is 4 days and they keep a safety stock of 100 units. At what inventory level should they reorder?",
    options: ["200 units", "250 units", "300 units", "400 units"],
    answer: 2,
    explanation: "Reorder point = (daily demand × lead time) + safety stock = (50 × 4) + 100 = 300 units.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-016",
    type: "strategy",
    title: "Freemium MRR",
    statement:
      "A productivity app has 50,000 free users and a 4% free-to-paid conversion rate at ₹199/month. What is its monthly recurring revenue (MRR)?",
    options: ["₹1,99,000", "₹3,98,000", "₹4,98,000", "₹9,95,000"],
    answer: 1,
    explanation: "Paying users = 50,000 × 4% = 2,000. MRR = 2,000 × ₹199 = ₹3,98,000.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-017",
    type: "strategy",
    title: "Spotting the network-effect moat",
    statement:
      "Which of these businesses has the strongest two-sided network effect?",
    options: [
      "A boutique design agency",
      "A food-delivery app (more riders → faster delivery → more users → more riders)",
      "A single-brand clothing store",
      "A freelance photographer",
    ],
    answer: 1,
    explanation:
      "Marketplaces compound: each side makes the other side better. Agencies and stores grow linearly with headcount/stock — no network flywheel.",
    difficulty: "easy",
    points: 10,
  },
  {
    externalId: "puz-018",
    type: "strategy",
    title: "Fixing unit economics",
    statement:
      "A D2C snack brand has thin contribution margins. Which single move improves contribution margin per unit the FASTEST?",
    options: [
      "Increase ad spend to grow volume",
      "Reduce packaging cost per unit",
      "Launch deep discounts for a week",
      "Expand to a new city immediately",
    ],
    answer: 1,
    explanation:
      "Cutting variable cost raises margin on every unit sold from day one. More ads raise CAC, discounts cut price, and expansion adds fixed costs first.",
    difficulty: "medium",
    points: 15,
  },
  {
    externalId: "puz-019",
    type: "math",
    title: "Equity dilution",
    statement:
      "A founder owns 100% of her startup. She raises a Series A where investors take 20%, then a Series B where investors take 25% of what remains. What does she still own?",
    options: ["55%", "60%", "65%", "75%"],
    answer: 1,
    explanation: "After A: 100% × 0.80 = 80%. After B: 80% × 0.75 = 60%. Dilution multiplies; it doesn't add.",
    difficulty: "hard",
    points: 20,
  },
  {
    externalId: "puz-020",
    type: "math",
    title: "Two-product revenue",
    statement:
      "Today a shop sold 300 units of product A at ₹499 and 200 units of product B at ₹999. What was today's total revenue?",
    options: ["₹3,49,500", "₹3,99,500", "₹2,99,500", "₹4,49,000"],
    answer: 0,
    explanation: "A: 300 × 499 = ₹1,49,700. B: 200 × 999 = ₹1,99,800. Total = ₹3,49,500.",
    difficulty: "easy",
    points: 10,
  },
]

export interface SeedCase {
  slug: string
  startup: string
  tagline: string
  sector: string
  youtubeId: string
  description: string
  keyMetrics: { label: string; value: string }[]
  discussion: string[]
}

export const SEED_CASES: SeedCase[] = [
  {
    slug: "zerodha",
    startup: "Zerodha",
    tagline: "How bootstrapped trading disruptor beat funded giants",
    sector: "Fintech · Broking",
    youtubeId: "2l66DLIHfqc",
    description:
      "Founded by Nithin and Nikhil Kamath, Zerodha took on full-service brokers with ₹0 equity delivery trades and flat ₹20 intraday fees. It stayed 100% bootstrapped, profitable every year, and became India's largest retail broker by active users — proof that you don't need VC money to win a category.",
    keyMetrics: [
      { label: "Founded", value: "2010, Bengaluru" },
      { label: "Funding", value: "₹0 — fully bootstrapped" },
      { label: "Users", value: "1+ crore active clients" },
      { label: "Model", value: "Flat fee discount broking" },
    ],
    discussion: [
      "Why did Zerodha's low-cost model beat brokers with 100× more capital?",
      "What did Zerodha gain — and risk — by never raising VC money?",
      "PPT task: Pitch 3 ways our E-Cell could help a student-founded fintech adopt the Zerodha playbook (cost leadership + trust).",
      "Design a one-slide teardown: Zerodha's revenue engine vs a funded competitor's.",
    ],
  },
  {
    slug: "boat",
    startup: "boAt",
    tagline: "Marketing-first D2C that made headphones a lifestyle",
    sector: "Consumer Electronics · D2C",
    youtubeId: "xn-9Mh7-L8Q",
    description:
      "Aman Gupta and Sameer Mehta built boAt by branding affordable audio gear as a lifestyle — celebrity collabs, cricket sponsorships and community ('boAtheads') instead of tech superiority. From cables to India's #1 wearables brand, boAt shows how distribution + branding can beat imported specs.",
    keyMetrics: [
      { label: "Founded", value: "2016" },
      { label: "Peak revenue", value: "₹3,000+ crore" },
      { label: "Playbook", value: "Brand-first, asset-light manufacturing" },
      { label: "Community", value: "boAtheads loyalty engine" },
    ],
    discussion: [
      "boAt sells nearly the same hardware as cheaper brands. What exactly are customers paying for?",
      "When does 'marketing-first' become dangerous for a hardware startup?",
      "PPT task: Our E-Cell has ₹0 media budget. Design a boAt-style launch plan for a student product using only campus channels.",
      "Map boAt's journey: cables → earphones → wearables. Why this order?",
    ],
  },
  {
    slug: "lenskart",
    startup: "Lenskart",
    tagline: "From mall kiosks to a listed ₹1-lakh-crore eyewear giant",
    sector: "D2C · Omnichannel · Eyetech",
    youtubeId: "JXMQjnJkDXU",
    description:
      "Peyush Bansal started Lenskart in 2010 to sell contact lenses online — then did what 'online-only' purists mocked: opened thousands of physical stores, built in-house lens manufacturing, and used tech (3D try-on, home eye tests) to win trust. In November 2025 Lenskart listed on Indian exchanges, becoming one of the year's biggest IPOs.",
    keyMetrics: [
      { label: "Founded", value: "2010" },
      { label: "Stores", value: "2,000+ across India" },
      { label: "Listed", value: "November 2025 (NSE/BSE)" },
      { label: "Edge", value: "In-house manufacturing + omnichannel" },
    ],
    discussion: [
      "Why did 'clicks AND bricks' work for eyewear when pure e-commerce stalled?",
      "What does the Lenskart IPO teach about timing public markets?",
      "PPT task: Pick one campus 'pain' (eyewear, books, fitness). Design a Lenskart-style omnichannel student venture for our college.",
      "Lenskart controls manufacturing → retail → home eye-checkup. Draw this value chain and mark where the margin lives.",
    ],
  },
]

export interface SeedTerm {
  abbr: string
  full: string
  category: string
  meaning: string
  usage: string
}

export const SEED_TERMS: SeedTerm[] = [
  { abbr: "CAC", full: "Customer Acquisition Cost", category: "Marketing", meaning: "Total sales + marketing spend divided by number of new customers acquired.", usage: "\"We spent ₹1L on ads and got 200 users — CAC is ₹500, but LTV is ₹2,000, so we're 4:1 healthy.\"" },
  { abbr: "LTV", full: "Lifetime Value", category: "Finance", meaning: "Total gross margin a customer generates over their entire relationship with you.", usage: "\"Investors want LTV:CAC above 3:1 — earn 3× what a customer costs to acquire.\"" },
  { abbr: "TAM", full: "Total Addressable Market", category: "Strategy", meaning: "The maximum revenue possible if you captured 100% of the market for your product.", usage: "\"India has 900M internet users — that's the TAM for our learning app.\"" },
  { abbr: "SAM", full: "Serviceable Addressable Market", category: "Strategy", meaning: "The slice of TAM you can actually serve with your product, geography and price.", usage: "\"Only English-speaking metro students — that's our SAM, about ₹500 crore.\"" },
  { abbr: "SOM", full: "Serviceable Obtainable Market", category: "Strategy", meaning: "The share of SAM you can realistically capture in the near term.", usage: "\"Year 1 goal: 1% of our SAM — that's our SOM.\"" },
  { abbr: "EBITDA", full: "Earnings Before Interest, Taxes, Depreciation & Amortisation", category: "Finance", meaning: "Operating profitability excluding financing and accounting effects — a clean view of core operations.", usage: "\"The company is loss-making but EBITDA-positive — operations work, the balance sheet doesn't.\"" },
  { abbr: "MVP", full: "Minimum Viable Product", category: "Product", meaning: "The smallest version of a product that delivers value and lets you learn from real users.", usage: "\"We launched as a WhatsApp group + Google Form MVP before writing any code.\"" },
  { abbr: "PMF", full: "Product-Market Fit", category: "Product", meaning: "The point where the market pulls your product faster than you can build it.", usage: "\"You'll know PMF when retention holds without discounts and users complain when you're down.\"" },
  { abbr: "B2B", full: "Business to Business", category: "Business Model", meaning: "Selling products/services to other companies.", usage: "\"Zoho is B2B — companies pay for its software, not consumers.\"" },
  { abbr: "B2C", full: "Business to Consumer", category: "Business Model", meaning: "Selling directly to individual end users.", usage: "\"Spotify's music subscription is classic B2C.\"" },
  { abbr: "D2C", full: "Direct to Consumer", category: "Business Model", meaning: "Brands selling their own products straight to buyers, skipping retail middlemen.", usage: "\"boAt and Mamaearth are D2C — own brand, own channel, own data.\"" },
  { abbr: "Burn Rate", full: "Net Cash Burn (per month)", category: "Finance", meaning: "How much cash the company loses each month net of revenue.", usage: "\"₹40L in bank and ₹10L/month burn = 4 months to fix things.\"" },
  { abbr: "Runway", full: "Months of Cash Remaining", category: "Finance", meaning: "Cash in bank divided by monthly burn — how long you survive at today's spend.", usage: "\"Fundraise when you have 6+ months of runway left, not 2.\"" },
  { abbr: "Bootstrapping", full: "Self-funding a Startup", category: "Funding", meaning: "Growing with your own revenue/savings instead of investor money.", usage: "\"Zerodha and Zoho are bootstrapped — profitable, and answer to no one.\"" },
  { abbr: "Angel", full: "Angel Investor", category: "Funding", meaning: "An individual who invests personal money in very early startups, usually ₹10L–₹2Cr.", usage: "\"Her former boss became an angel with ₹25L for 2% equity.\"" },
  { abbr: "VC", full: "Venture Capital(ist)", category: "Funding", meaning: "Firms investing pooled money into high-growth startups for equity.", usage: "\"We pitched 30 VCs; two offered term sheets.\"" },
  { abbr: "Seed", full: "Seed Round", category: "Funding", meaning: "The first institutional funding round, typically to prove the concept works.", usage: "\"A ₹4 crore seed round gave us 18 months of runway.\"" },
  { abbr: "Series A", full: "Series A Round", category: "Funding", meaning: "First major VC round after traction is proven — usually to scale a working model.", usage: "\"With ₹50L MRR and 20% MoM growth, our Series A was easy to justify.\"" },
  { abbr: "IPO", full: "Initial Public Offering", category: "Finance", meaning: "When a private company lists its shares on a public stock exchange.", usage: "\"Lenskart's November 2025 IPO made it one of India's biggest listings.\"" },
  { abbr: "Equity", full: "Ownership Share", category: "Finance", meaning: "Percentage of the company a founder/investor/employee owns.", usage: "\"ESOPs give early employees equity, not just salary.\"" },
  { abbr: "Valuation", full: "Company's Estimated Worth", category: "Finance", meaning: "The price tag of the whole company, set by funding rounds or markets.", usage: "\"Raised ₹100 crore at a ₹1,000 crore valuation — investors got 10%.\"" },
  { abbr: "Cap Table", full: "Capitalization Table", category: "Finance", meaning: "The spreadsheet showing who owns what % of the company after every round.", usage: "\"Check the cap table before signing — founders below 50% lose control early.\"" },
  { abbr: "Pitch Deck", full: "Investor Presentation", category: "Communication", meaning: "A 10–15 slide story: problem, solution, market, model, traction, team, ask.", usage: "\"Airbnb's 2008 deck is still the most-shared pitch deck ever.\"" },
  { abbr: "Elevator Pitch", full: "30-Second Business Summary", category: "Communication", meaning: "Your entire business explained in the time of an elevator ride.", usage: "\"'Zomato for home-cooked food' — that's an elevator pitch in 4 words.\"" },
  { abbr: "ROI", full: "Return on Investment", category: "Finance", meaning: "Profit gained relative to money spent, expressed as a percentage.", usage: "\"We spent ₹5,000 on the fest stall and got ₹35,000 of orders — 600% ROI.\"" },
  { abbr: "KPI", full: "Key Performance Indicator", category: "Analytics", meaning: "The few numbers that best measure whether you're winning.", usage: "\"For a newsletter: open rate and subscriber growth are the KPIs, not followers.\"" },
  { abbr: "GMV", full: "Gross Merchandise Value", category: "E-commerce", meaning: "Total value of everything sold through a platform — before commissions.", usage: "\"₹100 crore GMV sounds big, but our 8% take-rate revenue is ₹8 crore.\"" },
  { abbr: "ARPU", full: "Average Revenue Per User", category: "Analytics", meaning: "Revenue divided by number of users in a period.", usage: "\"1,000 users and ₹2L/month revenue = ₹200 ARPU.\"" },
  { abbr: "Churn", full: "Customer Attrition Rate", category: "Analytics", meaning: "Percentage of customers who stop using/paying in a period.", usage: "\"5% monthly churn means you replace half your base every year.\"" },
  { abbr: "USP", full: "Unique Selling Proposition", category: "Marketing", meaning: "The one thing that makes you different and worth choosing.", usage: "\"10-minute delivery was Blinkit's USP — everything else followed.\"" },
  { abbr: "Moat", full: "Competitive Advantage", category: "Strategy", meaning: "Something that stops competitors from copying you: network effects, brand, patents, cost.", usage: "\"Cheap to copy an app; impossible to copy UPI's network.\"" },
  { abbr: "Incubator", full: "Startup Incubator", category: "Ecosystem", meaning: "An organisation (often in colleges) that nurtures early ideas with space, mentors and network.", usage: "\"Our college incubator gave us free lab space and a CA for 6 months.\"" },
  { abbr: "Accelerator", full: "Startup Accelerator", category: "Ecosystem", meaning: "A fixed-term program (3–6 months) with seed money and intense mentoring, ending in a Demo Day.", usage: "\"Y Combinator's accelerator launched Airbnb, Dropbox and Stripe.\"" },
  { abbr: "Term Sheet", full: "Investment Offer Summary", category: "Funding", meaning: "A non-binding document stating the key terms of an investment before legal paperwork.", usage: "\"The term sheet said ₹5 crore for 15% with a 1× liquidation preference.\"" },
  { abbr: "DD", full: "Due Diligence", category: "Funding", meaning: "The deep verification an investor does on your numbers, legal papers and claims.", usage: "\"DD found the revenue was recognised early — the round got re-priced.\"" },
  { abbr: "Unicorn", full: "$1 Billion Valued Private Startup", category: "Ecosystem", meaning: "A privately-held startup valued at $1 billion or more.", usage: "\"India has 100+ unicorns, from Flipkart to Zepto.\"" },
  { abbr: "Break-even", full: "Zero-Profit Point", category: "Finance", meaning: "The point where total revenue equals total costs — after this, every sale profits.", usage: "\"We hit break-even in month 14 at 900 orders/month.\"" },
]

export const SEED_GD_TOPICS: string[] = [
  "Can India build 100 unicorns without copying Western business models?",
  "Is quick commerce (10-minute delivery) a revolution or a bubble?",
  "Should startups chase profitability early or growth first?",
  "Do college dropouts make better entrepreneurs?",
  "Are incubators actually useful, or just real estate with Wi-Fi?",
  "Should founders be marketers first and product builders second?",
  "Is the Indian startup ecosystem overvalued?",
  "Does AI create more founder opportunities than it destroys?",
  "Is bootstrapping underrated in the VC era?",
  "Should an E-Cell focus on service businesses or product startups?",
  "Are founder salaries justified before profitability?",
  "Will UPI kill cash in India within 10 years?",
]

export const SEED_DEBATE_TOPICS: string[] = [
  "Every student should start a business before graduating",
  "Funding is overrated; revenue is the only real validation",
  "Shark Tank India does more harm than good to real founders",
  "Advertising is a tax paid by undifferentiated products",
  "Discounting is a growth strategy, not a death spiral",
  "Remote-first startups outperform office-first startups",
  "India should regulate AI the way it regulated UPI — lightly",
  "Failure should be celebrated like success in college",
  "Traditional MBAs are obsolete for founders",
  "Indian markets need more protection from foreign Big Tech",
  "Free consumer tech is worth the data we give up",
  "College degrees don't matter for startup success",
]

export interface SeedNews {
  headline: string
  summary: string
  takeaway: string
  category: string
}

export const SEED_NEWS: SeedNews[] = [
  {
    headline: "Lenskart lists on Indian exchanges (Nov 2025)",
    summary:
      "Peyush Bansal's eyewear giant — 2,000+ stores, in-house lens manufacturing, 3D try-on tech — became one of 2025's biggest IPOs, about 15 years after starting as an online contact-lens store.",
    takeaway: "Omnichannel + owning manufacturing builds the margins that public markets reward. 'Online-only' is a strategy, not a religion.",
    category: "D2C · IPO",
  },
  {
    headline: "Zomato rebrands to 'Eternal'",
    summary:
      "After acquiring quick-commerce player Blinkit, Zomato Ltd renamed its parent entity to Eternal to reflect a house of brands rather than a single app.",
    takeaway: "When your business mix changes (food delivery → quick commerce), your identity and investor story must change too.",
    category: "Strategy · Branding",
  },
  {
    headline: "Quick commerce becomes India's fastest-growing retail format",
    summary:
      "Blinkit, Zepto and Instamart expanded into tier-2 cities, added categories from electronics to fashion, and continued raising large rounds to fund dark-store networks.",
    takeaway: "Unit economics per dark store decide winners. Watch how fast each player turns store-level profitable.",
    category: "E-commerce · Ops",
  },
  {
    headline: "boAt continues consumer-tech march toward public markets",
    summary:
      "Imagine Marketing (boAt) — which withdrew its IPO in 2022 — refiled paperwork as its wearables and audio brand kept defending #1 share against Chinese rivals.",
    takeaway: "Consumer hardware lives on branding + distribution + margin discipline. IPO timing follows profitability, not hype.",
    category: "Hardware · IPO",
  },
  {
    headline: "UPI crosses historic monthly transaction volumes",
    summary:
      "India's UPI now processes over 16 billion transactions a month — the rails under everything from street vendors to stock investing apps.",
    takeaway: "Every new startup can assume payments 'just work'. Build on public digital infrastructure instead of reinventing it.",
    category: "Fintech · Infra",
  },
  {
    headline: "Zerodha keeps proving the bootstrapped path",
    summary:
      "While funded rivals burned cash, Zerodha stayed profitable, founder-owned, and invests its profits through Rainmatter into health and climate ventures.",
    takeaway: "There is no single 'right' funding path. Cost discipline is itself a competitive weapon.",
    category: "Fintech · Funding",
  },
]
