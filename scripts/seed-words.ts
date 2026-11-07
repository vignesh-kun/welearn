// Seed the CROSSFORGE word bank — curated business/E-Cell terms.
// Idempotent: existing terms are updated, new ones created.
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const WORDS: { term: string; definition: string; keyDefinition: string; category: string }[] = [
  { term: "BOOTSTRAP", definition: "Building a company using personal savings and revenue instead of outside investors.", keyDefinition: "Self-funded startup growth without investors", category: "finance" },
  { term: "RUNWAY", definition: "How many months a startup can survive before cash runs out at the current burn rate.", keyDefinition: "Months of survival left before cash hits zero", category: "finance" },
  { term: "BURNRATE", definition: "The speed at which a startup spends its cash reserves every month.", keyDefinition: "Monthly cash the startup consumes", category: "finance" },
  { term: "VALUATION", definition: "The estimated worth of a company, set by funding rounds or market multiples.", keyDefinition: "Estimated worth of the company", category: "finance" },
  { term: "EQUITY", definition: "Ownership share in a company, usually exchanged for money or work.", keyDefinition: "Ownership slice of the company", category: "finance" },
  { term: "CAPTABLE", definition: "The ledger of who owns what percentage of a startup after every round.", keyDefinition: "Ledger of company ownership stakes", category: "legal" },
  { term: "UNICORN", definition: "A privately held startup valued at one billion dollars or more.", keyDefinition: "Startup valued over one billion", category: "finance" },
  { term: "ARR", definition: "Annual Recurring Revenue — predictable yearly income from subscriptions.", keyDefinition: "Predictable yearly subscription income", category: "finance" },
  { term: "CAC", definition: "Customer Acquisition Cost — total spend to win one paying customer.", keyDefinition: "Cost to acquire one customer", category: "growth" },
  { term: "LTV", definition: "Lifetime Value — total revenue a single customer generates over the relationship.", keyDefinition: "Total revenue per customer lifetime", category: "growth" },
  { term: "CHURN", definition: "The percentage of customers who stop paying or leave in a period.", keyDefinition: "Rate customers quit per period", category: "growth" },
  { term: "PMF", definition: "Product-Market Fit — the moment your product satisfies a strong market demand.", keyDefinition: "Product satisfies strong market demand", category: "strategy" },
  { term: "MVP", definition: "Minimum Viable Product — the smallest buildable version that tests the core idea.", keyDefinition: "Smallest testable product version", category: "product" },
  { term: "PIVOT", definition: "A structured course correction when the original startup idea is not working.", keyDefinition: "Structured startup direction change", category: "strategy" },
  { term: "SCALING", definition: "Growing revenue faster than costs by making systems repeatable.", keyDefinition: "Revenue growth exceeding cost growth", category: "strategy" },
  { term: "MOAT", definition: "A durable competitive advantage that stops rivals from copying you.", keyDefinition: "Defensible competitive advantage", category: "strategy" },
  { term: "INCUBATOR", definition: "An organisation that nurtures early startups with mentorship, space and network.", keyDefinition: "Nursery for early-stage startups", category: "ecell" },
  { term: "ACCELERATOR", definition: "A fixed-term program that scales startups fast in exchange for small equity.", keyDefinition: "Fast-growth bootcamp taking equity", category: "ecell" },
  { term: "PITCHDECK", definition: "A 10-15 slide story of the problem, solution, market and ask, shown to investors.", keyDefinition: "Slide story shown to investors", category: "ecell" },
  { term: "ESUMMIT", definition: "A summit of founders, investors and students celebrating entrepreneurship.", keyDefinition: "Entrepreneurship festival and summit", category: "ecell" },
  { term: "STARTUP", definition: "A temporary organisation searching for a repeatable, scalable business model.", keyDefinition: "Search for a scalable business model", category: "ecell" },
  { term: "FOUNDER", definition: "The person who starts the company and owns the original vision.", keyDefinition: "Person who starts the company", category: "ecell" },
  { term: "DISRUPT", definition: "To overturn an existing market with a radically simpler or cheaper solution.", keyDefinition: "Overturn market with radical simplicity", category: "strategy" },
  { term: "NICHE", definition: "A small, sharply-defined customer segment you can dominate first.", keyDefinition: "Small segment you dominate first", category: "strategy" },
  { term: "TRACTION", definition: "Evidence that customers want your product — revenue, users, or growth rate.", keyDefinition: "Proof customers want the product", category: "growth" },
  { term: "FUNNEL", definition: "The journey from stranger to customer, measured stage by stage.", keyDefinition: "Stranger-to-customer journey stages", category: "growth" },
  { term: "VIRAL", definition: "Growth where every user brings more than one new user.", keyDefinition: "Users who recruit more users", category: "growth" },
  { term: "GROWTHHACK", definition: "A cheap, clever experiment that unlocks disproportionate user growth.", keyDefinition: "Clever low-cost growth experiment", category: "growth" },
  { term: "RETENTION", definition: "The share of users who keep coming back after their first visit.", keyDefinition: "Users who keep returning", category: "growth" },
  { term: "ENGAGEMENT", definition: "How deeply and often users interact with the product.", keyDefinition: "Depth of user interaction", category: "growth" },
  { term: "BRAND", definition: "The promise and personality customers remember beyond the product.", keyDefinition: "Promise remembered beyond product", category: "marketing" },
  { term: "POSITIONING", definition: "The slot your product owns in the customer's mind versus rivals.", keyDefinition: "Slot owned in customer mind", category: "marketing" },
  { term: "IDEATION", definition: "The disciplined process of generating and filtering startup ideas.", keyDefinition: "Generating and filtering ideas", category: "ecell" },
  { term: "LEAN", definition: "A build-measure-learn method that kills waste and tests assumptions fast.", keyDefinition: "Build-measure-learn loop method", category: "product" },
  { term: "ROADMAP", definition: "A timeline of what the product team will build and when.", keyDefinition: "Product build timeline plan", category: "product" },
  { term: "PROTOTYPE", definition: "A quick, throwaway model used to learn before building the real thing.", keyDefinition: "Quick throwaway model to learn", category: "product" },
  { term: "WIREFRAME", definition: "A low-detail sketch of an app screen's layout and flow.", keyDefinition: "Low-detail screen layout sketch", category: "product" },
  { term: "BACKLOG", definition: "The prioritised queue of everything the product team could build next.", keyDefinition: "Prioritised queue of build tasks", category: "product" },
  { term: "SPRINT", definition: "A short fixed cycle where a team ships one focused chunk of work.", keyDefinition: "Short fixed team work cycle", category: "product" },
  { term: "天使", definition: "", keyDefinition: "", category: "skip" }, // guard row filtered below
  { term: "TERMSEL", definition: "", keyDefinition: "", category: "skip" },
]

// filter guard rows
const FINAL = WORDS.filter((w) => w.category !== "skip")

const EXTRA: { term: string; definition: string; keyDefinition: string; category: string }[] = [
  { term: "DILUTION", definition: "The shrinkage of your ownership percentage as new shares are issued to investors.", keyDefinition: "Ownership shrinkage on new shares", category: "finance" },
  { term: "TERMSHEET", definition: "The non-binding offer sheet spelling out a deal's valuation, control and liquidation terms.", keyDefinition: "Non-binding investment offer sheet", category: "legal" },
  { term: "VESTING", definition: "Earning your shares over time so founders and staff stay committed.", keyDefinition: "Earning shares gradually over time", category: "legal" },
  { term: "IPR", definition: "Intellectual Property Rights — legal ownership of ideas, brands and inventions.", keyDefinition: "Legal ownership of ideas and brands", category: "legal" },
  { term: "COMPLIANCE", definition: "Operating within every law, rule and regulation that touches the business.", keyDefinition: "Operating within all laws and rules", category: "legal" },
  { term: "GST", definition: "India's Goods and Services Tax — one unified tax replacing many indirect taxes.", keyDefinition: "India's unified indirect tax", category: "legal" },
  { term: "LLP", definition: "Limited Liability Partnership — a flexible structure where partners' personal assets stay safe.", keyDefinition: "Partnership with protected personal assets", category: "legal" },
  { term: "IPO", definition: "Initial Public Offering — the day a private company sells shares to everyone on the stock market.", keyDefinition: "First public share sale day", category: "finance" },
  { term: "MERGER", definition: "Two companies combining into one stronger entity.", keyDefinition: "Two companies combine into one", category: "strategy" },
  { term: "ACQUIRER", definition: "The company that buys another company or its assets.", keyDefinition: "Company that buys another company", category: "strategy" },
  { term: "EXIT", definition: "The event where founders and investors convert equity into cash — sale or IPO.", keyDefinition: "Event converting equity into cash", category: "finance" },
  { term: "CAPX", definition: "Capital Expenditure — money spent on long-lived assets like machines or servers.", keyDefinition: "Spend on long-lived assets", category: "finance" },
  { term: "OPEX", definition: "Operating Expenditure — the day-to-day running costs of the business.", keyDefinition: "Day-to-day running costs", category: "finance" },
  { term: "MARGIN", definition: "The gap between what you sell for and what it costs you.", keyDefinition: "Gap between price and cost", category: "finance" },
  { term: "BREAKEVEN", definition: "The sales point where total revenue exactly covers total costs.", keyDefinition: "Sales point where costs are covered", category: "finance" },
  { term: "FORECAST", definition: "A data-based estimate of future revenue, costs and cash.", keyDefinition: "Data-based estimate of the future", category: "finance" },
  { term: "SEO", definition: "Search Engine Optimisation — tuning content to rank higher on Google.", keyDefinition: "Tuning content to rank on Google", category: "marketing" },
  { term: "B2B", definition: "Business-to-Business — selling your product to other companies.", keyDefinition: "Selling products to companies", category: "marketing" },
  { term: "B2C", definition: "Business-to-Consumer — selling directly to end users.", keyDefinition: "Selling directly to end users", category: "marketing" },
  { term: "D2C", definition: "Direct-to-Consumer — brands selling their own product without middlemen.", keyDefinition: "Brand sells without middlemen", category: "marketing" },
  { term: "GUERRILLA", definition: "Marketing that wins attention with surprise and creativity instead of budget.", keyDefinition: "Attention via surprise not budget", category: "marketing" },
  { term: "INFLUENCER", definition: "A creator whose recommendation moves their audience's buying decisions.", keyDefinition: "Creator who moves buying decisions", category: "marketing" },
  { term: "LEADGEN", definition: "Lead Generation — attracting and capturing potential customers' interest.", keyDefinition: "Capturing potential customer interest", category: "marketing" },
  { term: "CONVERSION", definition: "The percentage of visitors who take the action you wanted.", keyDefinition: "Visitors who take the wanted action", category: "growth" },
  { term: "COHORT", definition: "A group of users who started in the same period, tracked together over time.", keyDefinition: "Users grouped by start period", category: "growth" },
  { term: "NPS", definition: "Net Promoter Score — one question measures if customers would recommend you.", keyDefinition: "Would customers recommend you score", category: "growth" },
  { term: "AHA", definition: "The moment a new user first feels the product's core value.", keyDefinition: "First moment of core product value", category: "product" },
  { term: "ONBOARDING", definition: "The first-run experience that turns a signup into an active user.", keyDefinition: "First-run experience to activation", category: "product" },
  { term: "UX", definition: "User Experience — how easy, smooth and satisfying the product feels to use.", keyDefinition: "How satisfying the product feels", category: "product" },
  { term: "API", definition: "Application Programming Interface — the contract that lets two softwares talk.", keyDefinition: "Contract letting softwares talk", category: "product" },
  { term: "CLOUD", definition: "Renting computing power and storage over the internet instead of owning servers.", keyDefinition: "Renting computers over the internet", category: "product" },
  { term: "AUTOMATE", definition: "Replacing repetitive manual work with software or machines.", keyDefinition: "Replacing manual work with software", category: "ops" },
  { term: "LOGISTICS", definition: "The choreography of moving goods from factory to customer efficiently.", keyDefinition: "Moving goods efficiently to customers", category: "ops" },
  { term: "SUPPLYCHAIN", definition: "The full network of suppliers, makers and carriers behind a product.", keyDefinition: "Network behind every product", category: "ops" },
  { term: "INVENTORY", definition: "The stock of goods a company holds before they are sold.", keyDefinition: "Stock held before being sold", category: "ops" },
  { term: "QC", definition: "Quality Control — checking output so defects never reach customers.", keyDefinition: "Checking output for zero defects", category: "ops" },
  { term: "SOP", definition: "Standard Operating Procedure — the written best way to do a repeated task.", keyDefinition: "Written best way to do a task", category: "ops" },
  { term: "OUTSOURCE", definition: "Hiring an outside firm to handle work your team used to do internally.", keyDefinition: "Hiring outside firm for internal work", category: "ops" },
  { term: "FRANCHISE", definition: "Licencing your proven business model to independent operators.", keyDefinition: "Licencing model to independent operators", category: "strategy" },
  { term: "B2B2C", definition: "Selling to businesses who then serve the end consumer with your product.", keyDefinition: "Sell via business to consumers", category: "strategy" },
  { term: "BLUEOCEAN", definition: "Creating a new uncontested market instead of fighting in a crowded one.", keyDefinition: "Creating uncontested new market", category: "strategy" },
  { term: "MOCKSTUDY", definition: "A practice business case analysed before facing real competition rounds.", keyDefinition: "Practice case before real competition", category: "ecell" },
  { term: "ECELL", definition: "Entrepreneurship Cell — the campus club that builds student founders.", keyDefinition: "Campus club building student founders", category: "ecell" },
]

const ALL = [...FINAL, ...EXTRA].filter((w) => w.definition.length > 4)

async function main() {
  let created = 0
  let updated = 0
  for (const w of ALL) {
    const existing = await db.word.findUnique({ where: { term: w.term } })
    if (existing) {
      await db.word.update({
        where: { id: existing.id },
        data: { definition: w.definition, keyDefinition: w.keyDefinition, category: w.category },
      })
      updated++
    } else {
      await db.word.create({ data: { ...w, source: "curated" } })
      created++
    }
  }
  console.log(`Word bank seeded: ${created} created, ${updated} updated (total ${ALL.length})`)
  const count = await db.word.count()
  console.log(`Word table now holds ${count} terms`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
