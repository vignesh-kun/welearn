-- WELEARN SQLITE TO SUPABASE IDEMPOTENT DATA SEED
-- Generated automatically with full relation and ID preservation
BEGIN;

INSERT INTO "User" ("id", "name", "pin", "role", "createdAt", "gdElo", "gdsPlayed", "gdStreak", "lastGdDate", "gdContentSum", "gdDeliverySum", "gdListeningSum", "gdLeadershipSum", "gdRatingsCount")
VALUES ('cmw4f7byp0000sax4jkqhzmu0', 'E-Cell Admin', '9df604a44795d77bf96ab0f73afe9eb695c6df9754d526c4d18e5776c514c1af', 'admin', '2026-11-06T03:34:05.905Z', 1200, 0, 0, NULL, 0, 0, 0, 0, 0)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "pin" = EXCLUDED."pin", "role" = EXCLUDED."role";

INSERT INTO "User" ("id", "name", "pin", "role", "createdAt", "gdElo", "gdsPlayed", "gdStreak", "lastGdDate", "gdContentSum", "gdDeliverySum", "gdListeningSum", "gdLeadershipSum", "gdRatingsCount")
VALUES ('cmw4fc3zv0000saxoa06vq1yd', 'vvv', '256bf7a82119680948520e2c433cd665d91052cd79f1e44745a8b33bf0956d84', 'member', '2026-11-06T03:37:48.858Z', 1200, 0, 0, NULL, 0, 0, 0, 0, 0)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "pin" = EXCLUDED."pin", "role" = EXCLUDED."role";

INSERT INTO "User" ("id", "name", "pin", "role", "createdAt", "gdElo", "gdsPlayed", "gdStreak", "lastGdDate", "gdContentSum", "gdDeliverySum", "gdListeningSum", "gdLeadershipSum", "gdRatingsCount")
VALUES ('cmw5wc8lc0000saec7gxuo2y8', 'TesterOne', 'b713ad702306c9032d3d8410ddf7dc8e71a3a0af874c53600a53fb0f5b43096a', 'member', '2026-11-07T04:21:34.464Z', 1200, 0, 0, NULL, 0, 0, 0, 0, 0)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "pin" = EXCLUDED."pin", "role" = EXCLUDED."role";

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7byx0001sax42hwdg56k', 'puz-001', 'math', 'Break-even for boAt-style headphones', 'Your startup sells wireless headphones at ₹1,499 each. Variable cost per unit is ₹900 and fixed costs (salaries, rent, ads) are ₹1,79,700 per month. How many units must you sell per month to break even?', '["250 units","280 units","300 units","320 units"]', 2, 'Contribution per unit = ₹1,499 − ₹900 = ₹599. Break-even = Fixed costs ÷ contribution = 1,79,700 ÷ 599 = 300 units.', 'medium', 15, 'curated', '2026-11-06T03:34:05.913Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bz10002sax42ia8pj0s', 'puz-002', 'math', 'Runway check', 'A seed-funded startup has ₹48,00,000 in the bank and a net burn of ₹6,00,000 per month. How many months of runway does it have?', '["6 months","7 months","8 months","10 months"]', 2, 'Runway = Cash ÷ net monthly burn = 48,00,000 ÷ 6,00,000 = 8 months.', 'easy', 10, 'curated', '2026-11-06T03:34:05.917Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bz40003sax4x1p75d34', 'puz-003', 'math', 'LTV of a coffee-subscriber', 'A D2C coffee brand''s average order is ₹800 with a 25% gross margin. A loyal customer orders 6 times a year for 3 years. What is the customer''s lifetime value in GROSS MARGIN terms?', '["₹14,400","₹3,600","₹4,800","₹2,400"]', 1, 'Revenue LTV = 800 × 6 × 3 = ₹14,400. Margin LTV = 25% × 14,400 = ₹3,600. Always judge LTV on margin, not revenue.', 'medium', 15, 'curated', '2026-11-06T03:34:05.921Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bz80004sax4tujome8d', 'puz-004', 'math', 'CAC payback period', 'A fintech app spends ₹1,200 to acquire a customer (CAC). Each customer contributes ₹400 of gross profit per month. How many months until the customer pays back the acquisition cost?', '["2 months","3 months","4 months","6 months"]', 1, 'Payback = CAC ÷ monthly contribution = 1,200 ÷ 400 = 3 months.', 'easy', 10, 'curated', '2026-11-06T03:34:05.924Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bzc0005sax4cbcpor3y', 'puz-005', 'math', 'Marketplace listing price', 'A marketplace charges a 12% commission on listed price. A seller wants to net exactly ₹5,000 per unit after commission. What listed price should they set (rounded to the nearest rupee)?', '["₹5,600","₹5,682","₹5,720","₹5,800"]', 1, 'Net = Listed × (1 − 0.12) → Listed = 5,000 ÷ 0.88 = ₹5,681.8 ≈ ₹5,682. A common trap is adding 12% of 5,000 (= ₹5,600), which nets only ₹4,928.', 'hard', 20, 'curated', '2026-11-06T03:34:05.928Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bzg0006sax4qq3su06x', 'puz-006', 'math', 'MoM growth rate', 'A campus marketplace grows from 4,000 users to 9,000 users in one month. What is the month-on-month growth rate?', '["105%","115%","125%","225%"]', 2, 'Growth = (9,000 − 4,000) ÷ 4,000 = 1.25 = 125%. The new total (225%) is not the growth rate.', 'easy', 10, 'curated', '2026-11-06T03:34:05.932Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bzj0007sax4w8k0n2i5', 'puz-007', 'math', 'Marketplace revenue (GMV → take)', 'In October, a platform processed 10,000 orders with an average order value of ₹650 and takes an 8% commission. What was the platform''s revenue?', '["₹5,20,000","₹52,00,000","₹6,50,000","₹4,16,000"]', 0, 'GMV = 10,000 × 650 = ₹65,00,000. Revenue = 8% of GMV = ₹5,20,000.', 'medium', 15, 'curated', '2026-11-06T03:34:05.935Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bzn0008sax4gixygbp7', 'puz-008', 'math', 'Net churn', 'A subscription app starts the month with 2,000 paying users, loses 300 to churn, but gains 500 new users. What is the NET monthly growth rate?', '["+10%","−10%","+25%","+15%"]', 0, 'Net change = 500 − 300 = +200 users. Growth = 200 ÷ 2,000 = +10%. Churn matters, but growth counts the net.', 'medium', 15, 'curated', '2026-11-06T03:34:05.939Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bzs0009sax4ydj1lmh0', 'puz-009', 'logic', 'The notebook and the pen', 'At your college fest stall, a notebook and a pen together cost ₹110. The notebook costs ₹100 more than the pen. What is the price of the pen?', '["₹10","₹5","₹15","₹20"]', 1, 'Pen = ₹5, Notebook = ₹105 (₹100 more). If pen were ₹10, the notebook would be ₹110 and the total ₹120. Intuition is the trap; algebra wins.', 'medium', 15, 'curated', '2026-11-06T03:34:05.944Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7bzw000asax4vzyq5294', 'puz-010', 'logic', 'Syllogism: D2C brands', 'All D2C brands sell online. Some D2C brands are profitable. Which conclusion MUST be true?', '["All online sellers are profitable","At least some online sellers are D2C","No online seller is profitable","All D2C brands are unprofitable"]', 1, 'Every D2C brand sells online, and D2C brands exist — therefore some online sellers are D2C brands. The other options assert things the statements never guarantee.', 'medium', 15, 'curated', '2026-11-06T03:34:05.949Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c00000bsax4mfhkm0y2', 'puz-011', 'estimation', 'The metro chai stall', 'A tea stall outside a metro station sells about 2 cups/minute during 6 peak hours and about 0.5 cups/minute during the other 6 hours it stays open. Roughly how many cups does it sell per day?', '["600 cups","750 cups","900 cups","1,200 cups"]', 2, 'Peak: 2 × 60 × 6 = 720 cups. Off-peak: 0.5 × 60 × 6 = 180 cups. Total ≈ 900 cups — a ~₹18,000/day business at ₹20/cup.', 'medium', 15, 'curated', '2026-11-06T03:34:05.952Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c04000csax4n4hqwwve', 'puz-012', 'estimation', 'Assignment printing demand', 'A college has 2,000 students. Each submits one 20-page assignment every month. Estimate the pages printed per month on campus.', '["20,000 pages","40,000 pages","60,000 pages","2,00,000 pages"]', 1, '2,000 students × 20 pages = 40,000 pages/month. At ₹2/page, that''s an ₹80,000/month printing market on one campus.', 'easy', 10, 'curated', '2026-11-06T03:34:05.956Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c07000dsax47b6t9jtm', 'puz-013', 'operations', '10-minute delivery capacity', 'A dark store fulfils orders in a 12-minute cycle (pick, pack, travel). With 8 riders working, roughly what is the maximum number of orders per hour?', '["32 orders","40 orders","48 orders","60 orders"]', 1, 'Each rider completes 60 ÷ 12 = 5 orders/hour. 8 riders × 5 = 40 orders/hour. This is why rider count drives quick-commerce economics.', 'medium', 15, 'curated', '2026-11-06T03:34:05.960Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c0b000esax46cpwum2z', 'puz-014', 'operations', 'Interview scheduling', 'Your E-Cell runs recruitment interviews. Each panel takes 15 minutes per candidate and you have 2 panels running in parallel. How long will 30 candidates take?', '["3 hours","3 hours 45 minutes","4 hours","7 hours 30 minutes"]', 1, 'Two panels handle 2 candidates per 15 min → 30 ÷ 2 = 15 rounds × 15 min = 225 minutes = 3 hours 45 minutes.', 'easy', 10, 'curated', '2026-11-06T03:34:05.963Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c0e000fsax4i225kud6', 'puz-015', 'operations', 'Reorder point', 'A stationery startup sells 50 units/day. Supplier lead time is 4 days and they keep a safety stock of 100 units. At what inventory level should they reorder?', '["200 units","250 units","300 units","400 units"]', 2, 'Reorder point = (daily demand × lead time) + safety stock = (50 × 4) + 100 = 300 units.', 'medium', 15, 'curated', '2026-11-06T03:34:05.966Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c0i000gsax46tjq6f12', 'puz-016', 'strategy', 'Freemium MRR', 'A productivity app has 50,000 free users and a 4% free-to-paid conversion rate at ₹199/month. What is its monthly recurring revenue (MRR)?', '["₹1,99,000","₹3,98,000","₹4,98,000","₹9,95,000"]', 1, 'Paying users = 50,000 × 4% = 2,000. MRR = 2,000 × ₹199 = ₹3,98,000.', 'medium', 15, 'curated', '2026-11-06T03:34:05.970Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c0l000hsax42lyitdpc', 'puz-017', 'strategy', 'Spotting the network-effect moat', 'Which of these businesses has the strongest two-sided network effect?', '["A boutique design agency","A food-delivery app (more riders → faster delivery → more users → more riders)","A single-brand clothing store","A freelance photographer"]', 1, 'Marketplaces compound: each side makes the other side better. Agencies and stores grow linearly with headcount/stock — no network flywheel.', 'easy', 10, 'curated', '2026-11-06T03:34:05.974Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c0p000isax48u6sswwl', 'puz-018', 'strategy', 'Fixing unit economics', 'A D2C snack brand has thin contribution margins. Which single move improves contribution margin per unit the FASTEST?', '["Increase ad spend to grow volume","Reduce packaging cost per unit","Launch deep discounts for a week","Expand to a new city immediately"]', 1, 'Cutting variable cost raises margin on every unit sold from day one. More ads raise CAC, discounts cut price, and expansion adds fixed costs first.', 'medium', 15, 'curated', '2026-11-06T03:34:05.978Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c0t000jsax49y8j2du1', 'puz-019', 'math', 'Equity dilution', 'A founder owns 100% of her startup. She raises a Series A where investors take 20%, then a Series B where investors take 25% of what remains. What does she still own?', '["55%","60%","65%","75%"]', 1, 'After A: 100% × 0.80 = 80%. After B: 80% × 0.75 = 60%. Dilution multiplies; it doesn''t add.', 'hard', 20, 'curated', '2026-11-06T03:34:05.981Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Puzzle" ("id", "externalId", "type", "title", "statement", "options", "answer", "explanation", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c0w000ksax402ogcqa3', 'puz-020', 'math', 'Two-product revenue', 'Today a shop sold 300 units of product A at ₹499 and 200 units of product B at ₹999. What was today''s total revenue?', '["₹3,49,500","₹3,99,500","₹2,99,500","₹4,49,000"]', 0, 'A: 300 × 499 = ₹1,49,700. B: 200 × 999 = ₹1,99,800. Total = ₹3,49,500.', 'easy', 10, 'curated', '2026-11-06T03:34:05.985Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CaseStudy" ("id", "slug", "startup", "tagline", "sector", "youtubeId", "description", "keyMetrics", "discussion", "source", "createdAt")
VALUES ('cmw4f7c10000lsax4mvm6rvwl', 'zerodha', 'Zerodha', 'How bootstrapped trading disruptor beat funded giants', 'Fintech · Broking', '2l66DLIHfqc', 'Founded by Nithin and Nikhil Kamath, Zerodha took on full-service brokers with ₹0 equity delivery trades and flat ₹20 intraday fees. It stayed 100% bootstrapped, profitable every year, and became India''s largest retail broker by active users — proof that you don''t need VC money to win a category.', '[{"label":"Founded","value":"2010, Bengaluru"},{"label":"Funding","value":"₹0 — fully bootstrapped"},{"label":"Users","value":"1+ crore active clients"},{"label":"Model","value":"Flat fee discount broking"}]', '["Why did Zerodha''s low-cost model beat brokers with 100× more capital?","What did Zerodha gain — and risk — by never raising VC money?","PPT task: Pitch 3 ways our E-Cell could help a student-founded fintech adopt the Zerodha playbook (cost leadership + trust).","Design a one-slide teardown: Zerodha''s revenue engine vs a funded competitor''s."]', 'curated', '2026-11-06T03:34:05.988Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CaseStudy" ("id", "slug", "startup", "tagline", "sector", "youtubeId", "description", "keyMetrics", "discussion", "source", "createdAt")
VALUES ('cmw4f7c14000msax4lx0ufdjh', 'boat', 'boAt', 'Marketing-first D2C that made headphones a lifestyle', 'Consumer Electronics · D2C', 'xn-9Mh7-L8Q', 'Aman Gupta and Sameer Mehta built boAt by branding affordable audio gear as a lifestyle — celebrity collabs, cricket sponsorships and community (''boAtheads'') instead of tech superiority. From cables to India''s #1 wearables brand, boAt shows how distribution + branding can beat imported specs.', '[{"label":"Founded","value":"2016"},{"label":"Peak revenue","value":"₹3,000+ crore"},{"label":"Playbook","value":"Brand-first, asset-light manufacturing"},{"label":"Community","value":"boAtheads loyalty engine"}]', '["boAt sells nearly the same hardware as cheaper brands. What exactly are customers paying for?","When does ''marketing-first'' become dangerous for a hardware startup?","PPT task: Our E-Cell has ₹0 media budget. Design a boAt-style launch plan for a student product using only campus channels.","Map boAt''s journey: cables → earphones → wearables. Why this order?"]', 'curated', '2026-11-06T03:34:05.992Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CaseStudy" ("id", "slug", "startup", "tagline", "sector", "youtubeId", "description", "keyMetrics", "discussion", "source", "createdAt")
VALUES ('cmw4f7c18000nsax4adhtv681', 'lenskart', 'Lenskart', 'From mall kiosks to a listed ₹1-lakh-crore eyewear giant', 'D2C · Omnichannel · Eyetech', 'JXMQjnJkDXU', 'Peyush Bansal started Lenskart in 2010 to sell contact lenses online — then did what ''online-only'' purists mocked: opened thousands of physical stores, built in-house lens manufacturing, and used tech (3D try-on, home eye tests) to win trust. In November 2025 Lenskart listed on Indian exchanges, becoming one of the year''s biggest IPOs.', '[{"label":"Founded","value":"2010"},{"label":"Stores","value":"2,000+ across India"},{"label":"Listed","value":"November 2025 (NSE/BSE)"},{"label":"Edge","value":"In-house manufacturing + omnichannel"}]', '["Why did ''clicks AND bricks'' work for eyewear when pure e-commerce stalled?","What does the Lenskart IPO teach about timing public markets?","PPT task: Pick one campus ''pain'' (eyewear, books, fitness). Design a Lenskart-style omnichannel student venture for our college.","Lenskart controls manufacturing → retail → home eye-checkup. Draw this value chain and mark where the margin lives."]', 'curated', '2026-11-06T03:34:05.996Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c1c000osax4jxc7166c', 'CAC', 'Customer Acquisition Cost', 'Marketing', 'Total sales + marketing spend divided by number of new customers acquired.', '"We spent ₹1L on ads and got 200 users — CAC is ₹500, but LTV is ₹2,000, so we''re 4:1 healthy."', 'Customer Acquisition Cost — fully-loaded spend required to win one paying customer.', 'In 2015, Snapdeal allegedly burned ₹800+ per customer on discounts, leading to a near-death valuation cut in 2017 when SoftBank realised the unit economics were upside down.', 'Always compute CAC fully-loaded (ads + agency + creative + growth team salaries), not just ad-spend — the gap is usually 3–5×.', 'curated', '2026-11-06T03:34:06.001Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c1g000psax465ymgyop', 'LTV', 'Lifetime Value', 'Finance', 'Total gross margin a customer generates over their entire relationship with you.', '"Investors want LTV:CAC above 3:1 — earn 3× what a customer costs to acquire."', 'Lifetime Value — total gross-margin profit a single customer generates over their full relationship with the company.', 'Netflix''s streaming LTV is estimated at ~$200+ per subscriber because of low churn and long tenure; Hotstar in India struggled to push LTV above ₹800 due to high monthly churn around cricket off-seasons.', 'Never quote LTV in revenue terms — always in margin terms. A revenue-LTV of ₹5,000 with 5% margin is only ₹250 of real value.', 'curated', '2026-11-06T03:34:06.004Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c1j000qsax4upzpk3o1', 'TAM', 'Total Addressable Market', 'Strategy', 'The maximum revenue possible if you captured 100% of the market for your product.', '"India has 900M internet users — that''s the TAM for our learning app."', 'Total Addressable Market — every possible rupee of revenue if 100% of all potential customers globally bought.', 'Theranos claimed a $75B+ TAM in blood-testing; investors later discovered the actual obtainable market was 1/100th of that because the tech didn''t work for most tests.', 'Investors automatically divide TAM by 100. Pitch SOM instead — it shows you know the difference between ambition and realism.', 'curated', '2026-11-06T03:34:06.008Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c1n000rsax4th4j87d9', 'SAM', 'Serviceable Addressable Market', 'Strategy', 'The slice of TAM you can actually serve with your product, geography and price.', '"Only English-speaking metro students — that''s our SAM, about ₹500 crore."', 'Serviceable Available Market — the slice of TAM that fits your business model, geography, and product.', 'Ola''s TAM is all India ride-hailing (~$30B). Its SAM is ride-hailing in cities where Ola operates (~$10B). Its SOM is the realistic share it can capture (~$3B in revenue over 5 years).', 'Don''t conflate TAM with SAM. A common pitch error: ''We will capture 1% of the $30B Indian market'' — but your SAM might be $2B, making 1% of THAT just ₹20 Cr, not ₹300 Cr.', 'curated', '2026-11-06T03:34:06.012Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c1q000ssax4oarm55l4', 'SOM', 'Serviceable Obtainable Market', 'Strategy', 'The share of SAM you can realistically capture in the near term.', '"Year 1 goal: 1% of our SAM — that''s our SOM."', 'Serviceable Obtainable Market — the realistic 3–5 year revenue you can actually capture, factoring in competition and execution capacity.', 'Zepto''s SOM in 2022 was estimated at ~$300M (quick-commerce in Mumbai + Bangalore); they pitched TAM of $5B+ (all India grocery). Investors funded them on SOM, not TAM.', 'If your SOM doesn''t have a believable path to ₹100 Cr revenue in 5 years, most seed funds won''t write a cheque — regardless of how big the TAM is.', 'curated', '2026-11-06T03:34:06.015Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c1u000tsax427aai4dn', 'EBITDA', 'Earnings Before Interest, Taxes, Depreciation & Amortisation', 'Finance', 'Operating profitability excluding financing and accounting effects — a clean view of core operations.', '"The company is loss-making but EBITDA-positive — operations work, the balance sheet doesn''t."', 'Earnings Before Interest, Taxes, Depreciation & Amortisation — a rough proxy for operating cash generation.', 'Zomato reported EBITDA-positive in its food-delivery business in early 2023, after years of losses — a key moment that lifted its battered stock price.', 'EBITDA can hide real cash burn because it excludes interest and capex. Always pair it with operating cash flow.', 'curated', '2026-11-06T03:34:06.018Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c1x000usax47hq19n4d', 'MVP', 'Minimum Viable Product', 'Product', 'The smallest version of a product that delivers value and lets you learn from real users.', '"We launched as a WhatsApp group + Google Form MVP before writing any code."', 'Minimum Viable Product — the smallest version of your product that proves the core value proposition actually works for real users.', 'Dropbox''s MVP wasn''t even a working app — it was a 3-minute demo video. Sign-ups jumped from 5,000 to 75,000 overnight, proving demand before building the full product.', 'An MVP is NOT ''the product with fewer features.'' It''s the smallest test that validates whether the core promise works. If you''re building for 6 months, it''s not an MVP.', 'curated', '2026-11-06T03:34:06.022Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c21000vsax4qapzmk0o', 'PMF', 'Product-Market Fit', 'Product', 'The point where the market pulls your product faster than you can build it.', '"You''ll know PMF when retention holds without discounts and users complain when you''re down."', 'Product-Market Fit — the moment a product satisfies a real market need so strongly that usage grows with little marketing push.', 'Slack hit PMF in 2014 — within 8 months of launch it had 1.1M DAU and zero paid marketing. Marc Andreessen famously said: ''You know PMF when the market pulls the product out of your hands.''', 'If you can''t articulate the PMF moment in one sentence, you don''t have it yet. Don''t pour fuel (paid acquisition) until PMF is real — you''ll burn the runway.', 'curated', '2026-11-06T03:34:06.026Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c25000wsax4sc9azfm9', 'B2B', 'Business to Business', 'Business Model', 'Selling products/services to other companies.', '"Zoho is B2B — companies pay for its software, not consumers."', 'Business-to-Business — selling to other companies rather than individual consumers.', 'Freshworks started as a B2B helpdesk SaaS; its enterprise-grade contracts gave it predictable revenue, eventually leading to a $5B+ Nasdaq IPO in 2021.', 'B2B sales cycles are slow (3–12 months) but churn is far lower than B2C. Model your runway accordingly — B2B startups often need 24 months of cash, not 12.', 'curated', '2026-11-06T03:34:06.029Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c29000xsax4sl1ud572', 'B2C', 'Business to Consumer', 'Business Model', 'Selling directly to individual end users.', '"Spotify''s music subscription is classic B2C."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.033Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c2c000ysax441s50pjn', 'D2C', 'Direct to Consumer', 'Business Model', 'Brands selling their own products straight to buyers, skipping retail middlemen.', '"boAt and Mamaearth are D2C — own brand, own channel, own data."', 'Direct-to-Consumer — selling your own branded product straight to the end customer, bypassing retail intermediaries.', 'boAt built a ₹2,000 Cr+ revenue D2C brand selling affordable audio gear, bypassing traditional retail distributors and capturing 30%+ market share in India''s audio segment.', 'D2C economics hinge on LTV:CAC > 3:1. If your fully-loaded CAC > 1/3 of margin-LTV, you will burn money on every order — even at scale.', 'curated', '2026-11-06T03:34:06.036Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c2f000zsax4uk8661dr', 'Burn Rate', 'Net Cash Burn (per month)', 'Finance', 'How much cash the company loses each month net of revenue.', '"₹40L in bank and ₹10L/month burn = 4 months to fix things."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.040Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c2j0010sax4nlzbzf51', 'Runway', 'Months of Cash Remaining', 'Finance', 'Cash in bank divided by monthly burn — how long you survive at today''s spend.', '"Fundraise when you have 6+ months of runway left, not 2."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.044Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c2n0011sax4j9awq5rg', 'Bootstrapping', 'Self-funding a Startup', 'Funding', 'Growing with your own revenue/savings instead of investor money.', '"Zerodha and Zoho are bootstrapped — profitable, and answer to no one."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.048Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c2t0012sax4xe6gp7d8', 'Angel', 'Angel Investor', 'Funding', 'An individual who invests personal money in very early startups, usually ₹10L–₹2Cr.', '"Her former boss became an angel with ₹25L for 2% equity."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.053Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c2x0013sax427977vp3', 'VC', 'Venture Capital(ist)', 'Funding', 'Firms investing pooled money into high-growth startups for equity.', '"We pitched 30 VCs; two offered term sheets."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.057Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c310014sax4m1m1gzud', 'Seed', 'Seed Round', 'Funding', 'The first institutional funding round, typically to prove the concept works.', '"A ₹4 crore seed round gave us 18 months of runway."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.061Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c340015sax4y2quraao', 'Series A', 'Series A Round', 'Funding', 'First major VC round after traction is proven — usually to scale a working model.', '"With ₹50L MRR and 20% MoM growth, our Series A was easy to justify."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.065Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c370016sax4o2kywiy9', 'IPO', 'Initial Public Offering', 'Finance', 'When a private company lists its shares on a public stock exchange.', '"Lenskart''s November 2025 IPO made it one of India''s biggest listings."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.068Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c3b0017sax4j2r5gs01', 'Equity', 'Ownership Share', 'Finance', 'Percentage of the company a founder/investor/employee owns.', '"ESOPs give early employees equity, not just salary."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.072Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c3e0018sax4bmcffzw6', 'Valuation', 'Company''s Estimated Worth', 'Finance', 'The price tag of the whole company, set by funding rounds or markets.', '"Raised ₹100 crore at a ₹1,000 crore valuation — investors got 10%."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.075Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c3i0019sax4c4ly2cpx', 'Cap Table', 'Capitalization Table', 'Finance', 'The spreadsheet showing who owns what % of the company after every round.', '"Check the cap table before signing — founders below 50% lose control early."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.078Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c3l001asax4kfm8gc2z', 'Pitch Deck', 'Investor Presentation', 'Communication', 'A 10–15 slide story: problem, solution, market, model, traction, team, ask.', '"Airbnb''s 2008 deck is still the most-shared pitch deck ever."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.082Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c3p001bsax4tytldm44', 'Elevator Pitch', '30-Second Business Summary', 'Communication', 'Your entire business explained in the time of an elevator ride.', '"''Zomato for home-cooked food'' — that''s an elevator pitch in 4 words."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.086Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c3t001csax4wy8q3hoq', 'ROI', 'Return on Investment', 'Finance', 'Profit gained relative to money spent, expressed as a percentage.', '"We spent ₹5,000 on the fest stall and got ₹35,000 of orders — 600% ROI."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.089Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c3x001dsax4ex8j4h4w', 'KPI', 'Key Performance Indicator', 'Analytics', 'The few numbers that best measure whether you''re winning.', '"For a newsletter: open rate and subscriber growth are the KPIs, not followers."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.093Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c40001esax4y7vrlgp8', 'GMV', 'Gross Merchandise Value', 'E-commerce', 'Total value of everything sold through a platform — before commissions.', '"₹100 crore GMV sounds big, but our 8% take-rate revenue is ₹8 crore."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.097Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c44001fsax4mqyi2kot', 'ARPU', 'Average Revenue Per User', 'Analytics', 'Revenue divided by number of users in a period.', '"1,000 users and ₹2L/month revenue = ₹200 ARPU."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.100Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c47001gsax4lcflaajm', 'Churn', 'Customer Attrition Rate', 'Analytics', 'Percentage of customers who stop using/paying in a period.', '"5% monthly churn means you replace half your base every year."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.104Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c4b001hsax4pdhotwy4', 'USP', 'Unique Selling Proposition', 'Marketing', 'The one thing that makes you different and worth choosing.', '"10-minute delivery was Blinkit''s USP — everything else followed."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.107Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c4e001isax4ds0d6fpd', 'Moat', 'Competitive Advantage', 'Strategy', 'Something that stops competitors from copying you: network effects, brand, patents, cost.', '"Cheap to copy an app; impossible to copy UPI''s network."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.111Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c4i001jsax4qhx225os', 'Incubator', 'Startup Incubator', 'Ecosystem', 'An organisation (often in colleges) that nurtures early ideas with space, mentors and network.', '"Our college incubator gave us free lab space and a CA for 6 months."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.114Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c4l001ksax4vy4oodx4', 'Accelerator', 'Startup Accelerator', 'Ecosystem', 'A fixed-term program (3–6 months) with seed money and intense mentoring, ending in a Demo Day.', '"Y Combinator''s accelerator launched Airbnb, Dropbox and Stripe."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.117Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c4o001lsax4jyxshj6h', 'Term Sheet', 'Investment Offer Summary', 'Funding', 'A non-binding document stating the key terms of an investment before legal paperwork.', '"The term sheet said ₹5 crore for 15% with a 1× liquidation preference."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.121Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c4s001msax4wyhbhr72', 'DD', 'Due Diligence', 'Funding', 'The deep verification an investor does on your numbers, legal papers and claims.', '"DD found the revenue was recognised early — the round got re-priced."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.124Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c4w001nsax42fgihawm', 'Unicorn', '$1 Billion Valued Private Startup', 'Ecosystem', 'A privately-held startup valued at $1 billion or more.', '"India has 100+ unicorns, from Flipkart to Zepto."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.128Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Term" ("id", "abbr", "full", "category", "meaning", "usage", "ecellDefinition", "startupContext", "keyWarning", "source", "createdAt")
VALUES ('cmw4f7c50001osax4oc0kr7il', 'Break-even', 'Zero-Profit Point', 'Finance', 'The point where total revenue equals total costs — after this, every sale profits.', '"We hit break-even in month 14 at 900 orders/month."', NULL, NULL, NULL, 'curated', '2026-11-06T03:34:06.132Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizTrack" ("id", "slug", "name", "shortName", "description", "accent", "iconName", "sortOrder")
VALUES ('cmw4f7c54001psax4cv1q6ik1', 'investment', 'Incubator & Investment', 'Investment', 'Term sheets, cap tables, valuation, SAFEs, due diligence.', '#10b981', 'HandCoins', 1)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizTrack" ("id", "slug", "name", "shortName", "description", "accent", "iconName", "sortOrder")
VALUES ('cmw4f7c57001qsax48wm4yy4f', 'growth', 'Growth & Marketing', 'Growth', 'CAC, LTV, growth hacking, funnels, pricing strategies.', '#3b82f6', 'TrendingUp', 2)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizTrack" ("id", "slug", "name", "shortName", "description", "accent", "iconName", "sortOrder")
VALUES ('cmw4f7c5b001rsax4kmld0ka4', 'ops_legal', 'Operations & Legal', 'Ops & Legal', 'Due diligence, IP, contracts, escrow, auditing.', '#f59e0b', 'Scale', 3)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizTrack" ("id", "slug", "name", "shortName", "description", "accent", "iconName", "sortOrder")
VALUES ('cmw4f7c5e001ssax4uahpqgdr', 'product_tech', 'Product & Tech', 'Product', 'MVP, SaaS, UI/UX, scalability, beta testing.', '#8b5cf6', 'Boxes', 4)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizTrack" ("id", "slug", "name", "shortName", "description", "accent", "iconName", "sortOrder")
VALUES ('cmw4f7c5h001tsax4eb54bzxd', 'strategy', 'Macro-Strategy', 'Strategy', 'PESTLE, SWOT, economies of scale, tariffs, market structure.', '#ec4899', 'Globe2', 5)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c5l001vsax4kt5dd4y3', 'cmw4f7c54001psax4cv1q6ik1', 'scenario', 'Your E-Cell startup is raising its first institutional round. A VC offers ₹2 Crore for 20% equity. After negotiation, they will only invest if you accept a 2x liquidation preference (non-participating). What does this 2x preference actually mean for the founders at an exit?', '["The VC gets to invest 2x more money next round.","The VC must be paid back 2x their investment before founders see a rupee from an exit.","The VC gets 2 board seats instead of 1.","The founders'' salary doubles after the exit."]', 1, 'A liquidation preference states who gets paid first when the company is sold. A 2x non-participating preference means the VC is paid 2× their invested amount (here ₹4 Cr) before any remaining proceeds flow to common shareholders (founders, ESOP). Below that exit value, founders may get nothing.', 'Many first-time founders accept ''standard'' term-sheet language without modelling the waterfall — and discover at exit that ~80% of the sale proceeds went to investors.', 'medium', 15, 'curated', '2026-11-06T03:34:06.154Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c5p001xsax4k30ddnkb', 'cmw4f7c54001psax4cv1q6ik1', 'micro_math', 'An angel investor offers ₹10 Lakhs for 10% equity in your E-Cell startup. What are the Post-Money and Pre-Money valuations?', '["Post = ₹10 L, Pre = ₹9 L","Post = ₹1 Crore, Pre = ₹90 Lakhs","Post = ₹1 Crore, Pre = ₹1.1 Crore","Post = ₹10 Lakhs, Pre = ₹11 Lakhs"]', 1, 'Post-money = investment ÷ equity% = ₹10 L ÷ 10% = ₹1 Crore. Pre-money = Post − investment = ₹1 Cr − ₹10 L = ₹90 Lakhs. Pre-money valuation is what the company was ''worth'' before the cheque came in.', 'If the math feels backwards, remember: ''Post = what you are after the money lands, Pre = what you were before.''', 'easy', 10, 'curated', '2026-11-06T03:34:06.158Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c5t001zsax4ap36v3t9', 'cmw4f7c54001psax4cv1q6ik1', 'red_flag', 'A founder pitches: ''We are raising ₹5 Cr at a ₹50 Cr cap on a SAFE. Our monthly burn is ₹15 L and we have ₹20 L in the bank. We expect Series A in 8 months.'' Which ONE red flag is the most severe?', '["SAFEs are illegal for Indian startups.","The runway is only ~1.3 months, far shorter than the 8-month Series A timeline.","₹50 Cr cap is too high for an early stage.","Monthly burn of ₹15 L is too low for a tech startup."]', 1, 'Runway = Cash ÷ monthly burn = ₹20 L ÷ ₹15 L ≈ 1.3 months. With a Series A planned in 8 months, the company will run out of cash ~7 months before the round closes — a near-certain death sentence unless they cut burn drastically or raise a bridge. Everything else is debatable.', 'Always sanity-check your own pitch deck for runway vs next-fundraise timeline. Investors spot this in seconds.', 'medium', 15, 'curated', '2026-11-06T03:34:06.162Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c5x0021sax44gn2hf4j', 'cmw4f7c54001psax4cv1q6ik1', 'scenario', 'Two VCs offer term sheets. VC-A: ₹5 Cr at ₹20 Cr pre-money, no participating preference. VC-B: ₹5 Cr at ₹25 Cr pre-money, 1x participating preference (capped at 2x). On a ₹30 Cr exit, which is better for founders?', '["VC-B — higher pre-money always benefits founders.","VC-A — participating preferences quietly erode founder proceeds at moderate exits.","They are mathematically identical.","Depends only on the ESOP pool size."]', 1, 'VC-A (non-participating, 1x): investor gets max(1× ₹5 Cr, their 20% share) = max(₹5 Cr, ₹6 Cr) = ₹6 Cr. Founders get ₹24 Cr. VC-B (participating 1x, capped 2x): investor gets ₹5 Cr + 16.7% of remaining ₹25 Cr = ₹5 Cr + ₹4.17 Cr = ₹9.17 Cr. Founders get ₹20.83 Cr. The higher headline valuation hid ~₹3 Cr of founder dilution.', 'Always model the exit waterfall — never just compare the headline pre-money number.', 'hard', 20, 'curated', '2026-11-06T03:34:06.165Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c610023sax4081u0jzd', 'cmw4f7c57001qsax48wm4yy4f', 'scenario', 'Your E-Cell startup is launching a campus food delivery app. Swiggy and Zomato dominate the market. You decide to offer ₹10 meals for the first month to grab 80% market share despite losing money per order. Which strategy is this?', '["Price Skimming","Penetration Pricing","Loss Leader Pricing","Premium Pricing"]', 1, 'Penetration pricing = setting a deliberately low price (often below cost) to rapidly capture market share, with the expectation of raising prices later. Loss leader is similar but refers to selling one product at a loss to drive traffic to other profitable products. Skimming is the opposite (start high, lower over time).', 'Uber, Ola, Swiggy, Zepto — all used penetration pricing in India. The bet only works if (a) you can fund losses long enough, and (b) customers stay after prices normalise.', 'easy', 10, 'curated', '2026-11-06T03:34:06.169Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c650025sax4u92c47cq', 'cmw4f7c57001qsax48wm4yy4f', 'micro_math', 'A D2C skincare brand spends ₹2,00,000 on Instagram ads in a month and acquires 250 new customers. Average order value is ₹1,000 and gross margin is 60%. Customer repeats 4× per year for 2 years. What is the CAC : LTV ratio?', '["1 : 1.2 (barely profitable)","1 : 6 (healthy)","1 : 12 (excellent)","1 : 0.5 (loss-making)"]', 1, 'CAC = ₹2,00,000 ÷ 250 = ₹800. LTV (margin) = ₹1,000 × 60% × 4 × 2 = ₹4,800. Ratio = 4,800 ÷ 800 = 6 : 1. Healthy D2C brands target 3 : 1 or better; 6 : 1 is excellent and suggests room to spend more aggressively on acquisition.', 'Always compute LTV on gross margin, not revenue. Top-line LTV hides unprofitable unit economics.', 'medium', 15, 'curated', '2026-11-06T03:34:06.173Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c680027sax4kb8mlsed', 'cmw4f7c57001qsax48wm4yy4f', 'red_flag', 'A pitch deck claims: ''Our CAC is ₹50, LTV is ₹5,000, payback period is 1 day. We will be profitable in week one.'' Which 2 concepts are broken? (Pick the option that names BOTH correctly.)', '["TAM is overstated and burn is too high.","CAC is undercounted (likely excluding team + ad-agency costs) and payback ignores cash-collection lag.","LTV should be annualised and run-rate is incorrect.","MRR is wrong and churn is hidden."]', 1, 'CAC of ₹50 is implausibly low for paid acquisition in India — it almost certainly omits ad-agency fees, creative costs, and the salary of the growth team. Payback period in days assumes customers pay and reorder instantly, which never happens. The real, fully-loaded CAC is often 3–5× the ''blended ad-spend'' number.', 'Investors will recompute fully-loaded CAC during diligence. Be honest in your own model first.', 'medium', 15, 'curated', '2026-11-06T03:34:06.177Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c6d0029sax4hx9vblbh', 'cmw4f7c57001qsax48wm4yy4f', 'scenario', 'Your freemium SaaS app has 10,000 free users converting to paid at 2% with an ARPU of ₹500/month. You are debating whether to: (A) double free users via paid marketing at ₹50 CAC, or (B) raise the conversion rate from 2% to 4% via better onboarding. Both cost roughly the same. Which moves MRR more?', '["A — more users always wins.","B — doubling conversion doubles MRR immediately and compounds with every future signup.","They are identical.","Neither — both are vanity metrics."]', 1, 'Option A: 20,000 free × 2% × ₹500 = ₹2,00,000 MRR (doubles today, but every new cohort also converts at 2%). Option B: 10,000 × 4% × ₹500 = ₹2,00,000 MRR today — AND every future marketing-spend cohort also converts at 4%. Compounding means B dominates A in months 3+. This is the classic ''grow funnel vs widen funnel'' call.', 'Pre-product-market-fit, optimise conversion. Post-PMF, pour fuel on acquisition. Doing them in reverse is the #1 way startups waste seed capital.', 'hard', 20, 'curated', '2026-11-06T03:34:06.181Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c6h002bsax4uy17yeee', 'cmw4f7c5b001rsax4kmld0ka4', 'scenario', 'Two co-founders have been running their E-Cell startup for 8 months. There is no signed agreement — they ''shook on'' a 50:50 split verbally. Founder A built the product; Founder B brought customers. Now they''re raising seed money. What is the most professional path forward?', '["Tell investors it''s 50:50 verbal, they''ll understand.","Sign a Founders'' Agreement with vesting (typically 4-year, 1-year cliff) before the seed round closes.","Issue 100% to Founder A since the product matters more.","Wait until the seed round closes and let the VC decide splits."]', 1, 'A Founders'' Agreement with 4-year vesting (1-year cliff) protects everyone: if one founder leaves early, unvested shares return to the ESOP pool, avoiding ''dead equity.'' Without it, VCs will either refuse to fund or force a messy restructuring that can cost months.', 'Many student startups die at this exact step. Draft the agreement on day one — it costs ₹5,000 in legal fees and saves crores.', 'easy', 10, 'curated', '2026-11-06T03:34:06.185Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c6l002dsax4gdpvt094', 'cmw4f7c5b001rsax4kmld0ka4', 'red_flag', 'A founder says: ''We outsourced our MVP to an agency and they own the source code. We have a verbal understanding that it''s ours. Also, our brand name isn''t trademarked yet because we''ll do that post-Series A.'' Which TWO legal exposures are MOST critical?', '["Operating in a co-working space without a GST number.","Agency owns the IP (no work-for-hire agreement) and the brand name is unregistered (someone else could trademark it first).","Hiring interns without offer letters and not filing TDS.","Using Google Workspace instead of a paid email host."]', 1, 'These are the two legal landmines that kill startups: (1) Without a work-for-hire / IP assignment clause, the agency legally owns your codebase and can refuse to hand it over, license it to competitors, or sue you. (2) Without trademark filing, anyone can register your brand name and force you to rebrand after you''ve built equity — see the ''Bira'' vs ''Bira 91'' style disputes in India.', 'IP assignment + trademark filing should be the first ₹30,000 a startup spends after incorporation. Skip it and you''re renting your own product.', 'medium', 15, 'curated', '2026-11-06T03:34:06.190Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c6p002fsax4kw0sd8vs', 'cmw4f7c5b001rsax4kmld0ka4', 'scenario', 'An investor is about to wire ₹50 Lakhs into your E-Cell startup. They ask for ''standard'' due diligence. What should you have ready BEFORE they ask?', '["Only your pitch deck — DD happens after the wire.","Cap table, founders'' agreement, IP assignments, employment contracts, GST/PAN filings, bank statements, MCA filings, customer contracts.","Just your Product Hunt launch screenshots.","A list of every tweet you''ve posted in 5 years."]', 1, 'Due diligence is the comprehensive audit investors perform before wiring money. The standard DD checklist covers legal (incorporation docs, cap table, IP, contracts), financial (bank statements, GST returns, MCA filings), and technical (code ownership, security). Having a clean ''data room'' ready compresses funding time from 3 months to 3 weeks.', 'In 2023, an investor backed out of funding a student startup during DD because the co-founders had no registered partnership agreement. Don''t be that founder.', 'medium', 15, 'curated', '2026-11-06T03:34:06.194Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c6t002hsax4nuf8kuio', 'cmw4f7c5b001rsax4kmld0ka4', 'micro_math', 'Your E-Cell coffee cart has fixed monthly costs of ₹5,000 rent + ₹3,000 utilities + ₹25,000 staff salary = ₹33,000. Variable cost per cup (beans + milk + cup) is ₹15. You sell each cup at ₹40. How many cups must you sell per month to break even?', '["540 cups/month","1,320 cups/month (~44/day)","2,200 cups/month (~73/day)","825 cups/month (~28/day)"]', 1, 'Contribution per cup = Selling price − variable cost = ₹40 − ₹15 = ₹25. Break-even = Fixed costs ÷ contribution per unit = ₹33,000 ÷ ₹25 = 1,320 cups/month. At 30 days, that''s ~44 cups/day — a meaningful daily throughput target.', 'Founders often memorise revenue-per-unit but forget fixed costs. Break-even = Fixed costs ÷ (Revenue per unit − Variable cost per unit). Always model the ''minimum daily throughput'' required to stay alive.', 'medium', 15, 'curated', '2026-11-06T03:34:06.198Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c6x002jsax45t5najy5', 'cmw4f7c5e001ssax4uahpqgdr', 'scenario', 'Your team has spent 4 months building a feature-rich campus marketplace app with payments, chat, AI recommendations, and live tracking. Beta users signed up but nobody is buying. What is the LEAST wasteful next move?', '["Add a referral program to acquire more users.","Strip the product back to ONE core job (e.g., just listings), talk to 20 users, measure whether they complete that job, then iterate.","Run paid ads to drive more signups.","Build a mobile app version since the website feels slow."]', 1, 'This is the classic MVP (Minimum Viable Product) trap: building too much before validating. The right move is to cut features ruthlessly, define the single ''job to be done,'' and verify with 20 real users that they actually complete it. If they don''t, no amount of marketing fixes the leaky bucket.', 'An MVP is not ''the product with fewer features'' — it''s ''the smallest thing that proves the core value proposition works.'' Build the test, not the product.', 'medium', 15, 'curated', '2026-11-06T03:34:06.202Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c71002lsax4rem4gj6b', 'cmw4f7c5e001ssax4uahpqgdr', 'scenario', 'Your SaaS startup hit ₹1 Lakh MRR with 100 paying customers. But 8 customers cancelled last month, and you added 12 new ones. What''s your monthly churn rate, and is it healthy for early-stage SaaS?', '["8% monthly churn — far too high for SaaS (target <2% monthly).","8% monthly churn — perfectly healthy.","0% churn — you added more than you lost.","12% churn — same as your new signups."]', 0, 'Churn rate = customers lost ÷ customers at start of period = 8 ÷ 100 = 8% monthly. For early-stage B2B SaaS, anything above 2–3% monthly is a red flag because it implies you''re losing customers faster than you can realistically acquire them — the famous ''leaky bucket.'' Above 5%, growth is mathematically capped.', 'If churn > growth rate, you don''t have a growth problem — you have a retention problem. Fix the bucket first.', 'medium', 15, 'curated', '2026-11-06T03:34:06.205Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c75002nsax4btzqh35g', 'cmw4f7c5e001ssax4uahpqgdr', 'red_flag', 'A founder''s pitch says: ''Our MVP is ready. We will launch next week. But we have not done any user testing — we are confident because we surveyed 200 people online.'' Which is the biggest red flag?', '["Surveying 200 people — that is statistically invalid.","Skipping real user testing before launch — survey ''intent'' rarely matches actual usage.","Launching next week — too soon.","Calling it an MVP — should be a ''prototype.''"]', 1, 'Surveys measure stated preference (''would you use this?''), which consistently overstates actual usage by 3–10×. Only live, in-person usability tests (watching 5–10 real users try to use your product) reveal the truth. A famous Nielsen Norman Group finding: 5 users uncover ~85% of usability issues.', 'Intent ≠ behaviour. ''I would definitely pay for that'' from a survey is worth roughly ₹0. A credit-card swipe is worth ₹5,000.', 'medium', 15, 'curated', '2026-11-06T03:34:06.210Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c79002psax4aicri1tt', 'cmw4f7c5e001ssax4uahpqgdr', 'micro_math', 'Your SaaS startup has 200 paying customers at ₹500/month. Churn is 5% monthly. Assuming you stop all new acquisition today, how many paying customers will you have after 6 months (rounded)?', '["~100","~150","~80","~200"]', 1, 'Each month you keep 95% of customers. After 6 months: 200 × 0.95^6 = 200 × 0.735 = ~147 ≈ 150 customers. That''s a 25% loss of revenue with zero new acquisition — illustrates why churn compounds viciously.', 'Churn is a half-life. 5% monthly means you lose ~46% of revenue per year even with no acquisition slowdown.', 'hard', 20, 'curated', '2026-11-06T03:34:06.213Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c7c002rsax4o6nhqtz8', 'cmw4f7c5h001tsax4eb54bzxd', 'scenario', 'You''re evaluating whether to launch an edtech startup in tier-2 India. You analyse: government policy (NEP 2020), economic trends (rising UPI penetration), social shifts (post-COVID online comfort), tech maturity (cheap data), legal (data-localisation), and environmental (rural electrification). Which framework is this?', '["SWOT","PESTLE","Porter''s Five Forces","BCG Matrix"]', 1, 'PESTLE = Political, Economic, Social, Technological, Legal, Environmental. It''s a macro-environmental scan used to understand the larger forces shaping an industry before strategy decisions. SWOT is company-specific (Strengths/Weaknesses/Opportunities/Threats). Porter''s Five Forces analyses industry competitiveness.', 'Use PESTLE BEFORE market entry (does this category make sense in this geography?). Use SWOT for positioning your specific startup within that category.', 'easy', 10, 'curated', '2026-11-06T03:34:06.217Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c7g002tsax4bh8waw7p', 'cmw4f7c5h001tsax4eb54bzxd', 'red_flag', 'A pitch deck reads: ''Our TAM is $10 Billion. We have zero competitors. We will capture 50% market share in Year 1 with no marketing spend.'' Which TWO strategic concepts are broken? (Pick the option that names BOTH correctly.)', '["PESTLE is missing and Porter''s Five Forces is outdated.","SOM (Serviceable Obtainable Market) is wildly unrealistic, and ''zero competitors'' either means the market doesn''t exist or the founder hasn''t researched it.","SWOT is misaligned and TAM is calculated incorrectly.","Economies of scale don''t apply and barriers to entry are too low."]', 1, 'TAM (Total Addressable Market) is the total global revenue if every potential customer bought. SOM (Serviceable Obtainable Market) is the realistic slice you can capture in 3–5 years — usually 1–5% of TAM, NOT 50%. And ''zero competitors'' is almost always a founder delusion; either the market is non-existent or the founder hasn''t done the homework (Google ''direct + indirect competitors'').', 'Investors mentally divide TAM by 100 the moment you say it. Pitch SOM, not TAM — it shows you understand the difference between ambition and delusion.', 'medium', 15, 'curated', '2026-11-06T03:34:06.221Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c7k002vsax4s12rvki0', 'cmw4f7c5h001tsax4eb54bzxd', 'scenario', 'You run a campus coffee cart. Cost per cup: ₹15 (beans + milk + cup). You sell 200 cups/day at ₹40. Your landlord offers a 2nd cart location for ₹5,000/month extra rent. You expect 100 cups/day there. Your fixed costs stay mostly the same (you hire 1 part-timer for ₹6,000/month). What economic concept MOST explains why the 2nd cart is profitable?', '["Loss leader pricing.","Economies of scale — spreading fixed costs (cart, equipment, brand) over more units lowers average cost per cup.","Penetration pricing.","Price discrimination."]', 1, 'Economies of scale: as you produce more units, fixed costs (cart, machine, brand, your salary) spread across more cups, dropping the per-cup total cost. Today: fixed ~₹5/cup; with 2 carts producing 300 cups, fixed ~₹3.3/cup. Each new cup sells at ₹40 with marginal cost only ₹15 — so the 2nd cart''s 100 cups add ₹2,500/day gross profit.', 'This is why Swiggy/Zomato/Zepto fight so viciously for order density — every additional order on the same delivery network is nearly pure margin.', 'medium', 15, 'curated', '2026-11-06T03:34:06.224Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizQuestion" ("id", "trackId", "type", "scenario", "options", "answer", "explanation", "founderNote", "difficulty", "points", "source", "createdAt")
VALUES ('cmw4f7c7p002xsax44lpr6v0r', 'cmw4f7c5h001tsax4eb54bzxd', 'pitch_pairing', 'PITCH PAIRING DRILL — You will be given 3 terms below. Your challenge: write a 60-second elevator pitch (target: 80–120 words) where a fictional startup founder uses ALL THREE terms naturally. The system saves your pitch and gives instant AI-style feedback in your ''My Studio''. Click START to receive your 3 terms.', '["START — give me my 3 terms"]', 0, 'This is a free-form drill, not a graded MCQ. The ''correct answer'' here simply unlocks the pitch prompt in the next screen. You earn 15 points for completing any pitch attempt — points are for the practice, not for grading your speech.', 'Founder tip: the best elevator pitches DON''T lead with the term — they lead with the customer problem, then drop the term naturally to show mastery. Example: ''We''re cutting customer acquisition cost by 70% for D2C brands by…''', 'easy', 15, 'curated', '2026-11-06T03:34:06.229Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizBadge" ("id", "slug", "trackId", "name", "description", "iconName", "criteria", "accent")
VALUES ('cmw4f7c7t002zsax4dz8n7l9o', 'first_steps', NULL, 'First Steps', 'Answered your very first founder-mode question correctly.', 'Footprints', '{"kind":"any_correct","threshold":1}', '#10b981')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizBadge" ("id", "slug", "trackId", "name", "description", "iconName", "criteria", "accent")
VALUES ('cmw4f7c7x0031sax4of9tfotg', 'investment_apprentice', 'cmw4f7c54001psax4cv1q6ik1', 'Investment Apprentice', 'Got 3 Investment-track questions right.', 'HandCoins', '{"kind":"track_correct","threshold":3}', '#10b981')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizBadge" ("id", "slug", "trackId", "name", "description", "iconName", "criteria", "accent")
VALUES ('cmw4f7c800033sax4zjv00gbt', 'growth_hacker', 'cmw4f7c57001qsax48wm4yy4f', 'Growth Hacker', 'Got 3 Growth & Marketing questions right.', 'TrendingUp', '{"kind":"track_correct","threshold":3}', '#3b82f6')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizBadge" ("id", "slug", "trackId", "name", "description", "iconName", "criteria", "accent")
VALUES ('cmw4f7c840035sax4muqvnysn', 'legal_aware', 'cmw4f7c5b001rsax4kmld0ka4', 'Legally Aware', 'Got 3 Operations & Legal questions right.', 'Scale', '{"kind":"track_correct","threshold":3}', '#f59e0b')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizBadge" ("id", "slug", "trackId", "name", "description", "iconName", "criteria", "accent")
VALUES ('cmw4f7c870037sax4ajkjedfh', 'product_thinker', 'cmw4f7c5e001ssax4uahpqgdr', 'Product Thinker', 'Got 3 Product & Tech questions right.', 'Boxes', '{"kind":"track_correct","threshold":3}', '#8b5cf6')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizBadge" ("id", "slug", "trackId", "name", "description", "iconName", "criteria", "accent")
VALUES ('cmw4f7c8a0039sax4xmax98w7', 'strategist', 'cmw4f7c5h001tsax4eb54bzxd', 'Strategist', 'Got 3 Macro-Strategy questions right.', 'Globe2', '{"kind":"track_correct","threshold":3}', '#ec4899')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizBadge" ("id", "slug", "trackId", "name", "description", "iconName", "criteria", "accent")
VALUES ('cmw4f7c8e003bsax43spv1hue', 'pitch_master', NULL, 'Pitch Master', 'Completed your first 3-term elevator pitch drill.', 'Mic', '{"kind":"pitch_completed","threshold":1}', '#f97316')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "QuizBadge" ("id", "slug", "trackId", "name", "description", "iconName", "criteria", "accent")
VALUES ('cmw4f7c8h003dsax4g33sxz6m', 'founder_mode_on', NULL, 'Founder Mode: ON', 'Earned all 5 track badges — full-spectrum founder training complete.', 'Crown', '{"kind":"all_track_badges","threshold":5}', '#facc15')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CaseVideo" ("id", "title", "youtubeId", "description", "addedById", "source", "createdAt")
VALUES ('cmw4f7c9f003esax4ovk3wuk7', 'Zerodha — How bootstrapped trading disruptor beat funded giants', '2l66DLIHfqc', 'Founded by Nithin and Nikhil Kamath, Zerodha took on full-service brokers with ₹0 equity delivery trades and flat ₹20 intraday fees. It stayed 100% bootstrapped, profitable every year, and became India''s largest retail broker by active users — proof that you don''t need VC money to win a category.', 'cmw4f7byp0000sax4jkqhzmu0', 'curated', '2026-11-06T03:34:06.291Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CaseVideo" ("id", "title", "youtubeId", "description", "addedById", "source", "createdAt")
VALUES ('cmw4f7c9i003fsax4boulw121', 'boAt — Marketing-first D2C that made headphones a lifestyle', 'xn-9Mh7-L8Q', 'Aman Gupta and Sameer Mehta built boAt by branding affordable audio gear as a lifestyle — celebrity collabs, cricket sponsorships and community (''boAtheads'') instead of tech superiority. From cables to India''s #1 wearables brand, boAt shows how distribution + branding can beat imported specs.', 'cmw4f7byp0000sax4jkqhzmu0', 'curated', '2026-11-06T03:34:06.295Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CaseVideo" ("id", "title", "youtubeId", "description", "addedById", "source", "createdAt")
VALUES ('cmw4f7c9l003gsax4ok4cr7nb', 'Lenskart — From mall kiosks to a listed ₹1-lakh-crore eyewear giant', 'JXMQjnJkDXU', 'Peyush Bansal started Lenskart in 2010 to sell contact lenses online — then did what ''online-only'' purists mocked: opened thousands of physical stores, built in-house lens manufacturing, and used tech (3D try-on, home eye tests) to win trust. In November 2025 Lenskart listed on Indian exchanges, bec', 'cmw4f7byp0000sax4jkqhzmu0', 'curated', '2026-11-06T03:34:06.297Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7c9o003hsax4kwt78yf6', 'Your campus food-delivery startup just hit 500 orders/day, but every order loses ₹18. You have 6 months of cash left. What''s your FIRST move?', 'curated', NULL, '2026-11-06T03:34:06.301Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7c9s003isax4qu5onkrg', 'You''re the founder of a note-sharing app. A rival college copies your entire product in 2 weeks and launches it for free. How do you stay ahead?', 'curated', NULL, '2026-11-06T03:34:06.304Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7c9v003jsax4gnlfuqgj', 'Your co-founder (also your best friend) has stopped contributing for a month. The startup is gaining traction. What do you do?', 'curated', NULL, '2026-11-06T03:34:06.308Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7c9y003ksax4oep7vmx1', 'An angel investor offers ₹25 Lakhs at a ₹2 Crore valuation, but wants his cousin as ''CMO'' of your startup. Take the money or walk away?', 'curated', NULL, '2026-11-06T03:34:06.311Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7ca1003lsax4usubpron', 'Your D2C brand''s Instagram ad account gets banned overnight — 80% of your sales came from Instagram. What''s your plan for the next 7 days?', 'curated', NULL, '2026-11-06T03:34:06.314Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7ca4003msax4dzsduyip', 'You discover your star intern leaked the pitch deck to a competing E-Cell''s startup. Confront, ignore, or lawyer up — and why?', 'curated', NULL, '2026-11-06T03:34:06.317Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7ca9003nsax43j5jnyde', 'Your B2B SaaS has 3 paying clients, all friends of the founder. Should you raise or bootstrap? Defend your call.', 'curated', NULL, '2026-11-06T03:34:06.321Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7cad003osax44nv52xqm', 'A big retail chain offers to stock your product but demands 55% margin and 90-day payment terms. Your margin is 40%. Deal or no deal?', 'curated', NULL, '2026-11-06T03:34:06.325Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7cah003psax4fym5yr3y', 'Your biggest customer (60% of revenue) threatens to churn unless you cut prices 40%. What''s your play?', 'curated', NULL, '2026-11-06T03:34:06.329Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FounderCaseQuestion" ("id", "prompt", "source", "createdById", "createdAt")
VALUES ('cmw4f7cak003qsax4u10mgzzq', 'You have ₹50,000 and 3 months before E-Summit. Build the product, build the brand, or build the community — pick one and justify it.', 'curated', NULL, '2026-11-06T03:34:06.332Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "PptChallenge" ("id", "topic", "brief", "source", "createdById", "createdAt")
VALUES ('cmw4f7can003rsax4rfx3ce04', 'Campus second-hand marketplace', '5 slides: problem, solution, market size, revenue model, ask.', 'curated', NULL, '2026-11-06T03:34:06.336Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "PptChallenge" ("id", "topic", "brief", "source", "createdById", "createdAt")
VALUES ('cmw4f7car003ssax4hyewe4ye', 'AI-powered exam prep for tier-2 colleges', '6 slides: problem, product, why now, go-to-market, metrics, ask.', 'curated', NULL, '2026-11-06T03:34:06.339Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "PptChallenge" ("id", "topic", "brief", "source", "createdById", "createdAt")
VALUES ('cmw4f7cau003tsax4vmns6afo', 'EV battery-swap network for delivery riders', '5 slides: problem, solution, unit economics, competition, roadmap.', 'curated', NULL, '2026-11-06T03:34:06.342Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "PptChallenge" ("id", "topic", "brief", "source", "createdById", "createdAt")
VALUES ('cmw4f7cax003usax4n06smywx', 'Millet-based D2C snack brand', '5 slides: trend, product, brand strategy, CAC/LTV math, 12-month plan.', 'curated', NULL, '2026-11-06T03:34:06.345Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "PptChallenge" ("id", "topic", "brief", "source", "createdById", "createdAt")
VALUES ('cmw4f7cb0003vsax42oirin33', 'Waste-to-craft marketplace for artisans', '6 slides: problem, marketplace model, supply side, demand side, impact, ask.', 'curated', NULL, '2026-11-06T03:34:06.348Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "PptChallenge" ("id", "topic", "brief", "source", "createdById", "createdAt")
VALUES ('cmw4f7cb3003wsax4jccc6mhp', 'Subscription laundry for hostels', '5 slides: pain point, service model, pricing, campus GTM, unit economics.', 'curated', NULL, '2026-11-06T03:34:06.351Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4fg0jv0004saxo4myszvfd', 'RUNWAY', 'How many months a startup can survive before cash runs out at the current burn rate.', 'Months of survival left before cash hits zero', 'finance', 'new', 'member', 1, '2026-11-06T03:42:10.758Z', '2026-11-06T03:40:51.020Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4fg0k80005saxov3ollgu5', 'BURN RATE', 'The rate at which a startup spends its available cash over a specific period.', NULL, 'general', 'new', 'member', 1, '2026-11-06T03:42:10.678Z', '2026-11-06T03:40:51.032Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4fg0kh0006saxode3zt2f0', 'MVP', 'Minimum Viable Product — the smallest buildable version that tests the core idea.', 'Smallest testable product version', 'product', 'new', 'member', 1, '2026-11-06T03:42:10.669Z', '2026-11-06T03:40:51.041Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4fg0ko0007saxo4nqzyqog', 'PIVOT', 'A structured course correction when the original startup idea is not working.', 'Structured startup direction change', 'strategy', 'new', 'member', 2, '2026-11-06T04:26:37.759Z', '2026-11-06T03:40:51.048Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4fg0kx0008saxoox4rbf89', 'UNICORN', 'A privately held startup valued at one billion dollars or more.', 'Startup valued over one billion', 'finance', 'new', 'member', 1, '2026-11-06T04:26:37.763Z', '2026-11-06T03:40:51.057Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4fg0l50009saxoa2f724bl', 'PITCH DECK', 'A presentation used by startups to explain their business idea, market opportunity, product, and financial potential to investors.', NULL, 'general', 'new', 'member', 1, '2026-11-06T03:42:10.639Z', '2026-11-06T03:40:51.065Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4fg0lc000asaxobx1g8a8y', 'ANGEL INVESTOR', 'An individual who invests personal money in early-stage startups in exchange for equity or convertible debt.', NULL, 'general', 'new', 'member', 0, NULL, '2026-11-06T03:40:51.073Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4h2uqv0000sakscsttn83i', 'FAIRCAP', 'The maximum valuation a startup can sustain without excessively diluting early investors.', 'Upper valuation limit before dilution', 'finance', 'new', 'ai_daily', 1, '2026-11-06T04:26:37.767Z', '2026-11-06T04:26:36.199Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4h2ur40001saks5jmn3nz6', 'GROWTHHACK', 'A cheap, clever experiment that unlocks disproportionate user growth.', 'Clever low-cost growth experiment', 'growth', 'new', 'ai_daily', 1, '2026-11-06T04:26:37.751Z', '2026-11-06T04:26:36.208Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4h2ur90002saksr5d86e8g', 'SCALEUP', 'The phase where a startup expands its operations to serve a larger market while maintaining efficiency.', 'Phase of expanding operations efficiently', 'ops', 'new', 'ai_daily', 0, NULL, '2026-11-06T04:26:36.213Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4h2urd0003saksm0yd0q4r', 'FUNDLOCK', 'A situation where a startup cannot secure additional capital due to market or investor constraints.', 'Inability to secure new capital', 'finance', 'new', 'ai_daily', 1, '2026-11-06T04:26:37.755Z', '2026-11-06T04:26:36.218Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw4h2uri0004saksnjrybq4v', 'PATENTPOOL', 'A shared repository of patents among startups that enables cross‑licensing and collaborative protection.', 'Shared patent repository for cross‑licensing', 'legal', 'new', 'ai_daily', 0, NULL, '2026-11-06T04:26:36.222Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4960000saosnvd9ll35', 'BOOTSTRAP', 'Building a company using personal savings and revenue instead of outside investors.', 'Self-funded startup growth without investors', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.299Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua49i0001saosg3t7p9mh', 'BURNRATE', 'The speed at which a startup spends its cash reserves every month.', 'Monthly cash the startup consumes', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.310Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua49n0002saosqx0pdhdf', 'VALUATION', 'The estimated worth of a company, set by funding rounds or market multiples.', 'Estimated worth of the company', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.315Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua49s0003saosnj4jhggr', 'EQUITY', 'Ownership share in a company, usually exchanged for money or work.', 'Ownership slice of the company', 'finance', 'new', 'curated', 1, '2026-11-07T03:25:19.370Z', '2026-11-07T03:23:56.320Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua49w0004saosrkiq5q1p', 'CAPTABLE', 'The ledger of who owns what percentage of a startup after every round.', 'Ledger of company ownership stakes', 'legal', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.324Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4a80005saosalsfe6i9', 'ARR', 'Annual Recurring Revenue — predictable yearly income from subscriptions.', 'Predictable yearly subscription income', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.336Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ae0006saosqsftuftn', 'CAC', 'Customer Acquisition Cost — total spend to win one paying customer.', 'Cost to acquire one customer', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.342Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4al0007saosbz6xa4cs', 'LTV', 'Lifetime Value — total revenue a single customer generates over the relationship.', 'Total revenue per customer lifetime', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.349Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4aq0008saosparabr7o', 'CHURN', 'The percentage of customers who stop paying or leave in a period.', 'Rate customers quit per period', 'growth', 'new', 'curated', 1, '2026-11-07T03:25:19.405Z', '2026-11-07T03:23:56.355Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4aw0009saosmhmsn5so', 'PMF', 'Product-Market Fit — the moment your product satisfies a strong market demand.', 'Product satisfies strong market demand', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.361Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4bg000asaosh61z7sng', 'SCALING', 'Growing revenue faster than costs by making systems repeatable.', 'Revenue growth exceeding cost growth', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.381Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4bn000bsaos2cgzlvq0', 'MOAT', 'A durable competitive advantage that stops rivals from copying you.', 'Defensible competitive advantage', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.388Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4bt000csaosw2oibmum', 'INCUBATOR', 'An organisation that nurtures early startups with mentorship, space and network.', 'Nursery for early-stage startups', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.394Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4c0000dsaosgaes1ayf', 'ACCELERATOR', 'A fixed-term program that scales startups fast in exchange for small equity.', 'Fast-growth bootcamp taking equity', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.400Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4c6000esaos69269q5u', 'PITCHDECK', 'A 10-15 slide story of the problem, solution, market and ask, shown to investors.', 'Slide story shown to investors', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.406Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4cd000fsaos9yi0tvea', 'ESUMMIT', 'A summit of founders, investors and students celebrating entrepreneurship.', 'Entrepreneurship festival and summit', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.413Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4cl000gsaoso76lpsd4', 'STARTUP', 'A temporary organisation searching for a repeatable, scalable business model.', 'Search for a scalable business model', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.421Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4cs000hsaosqwg2850b', 'FOUNDER', 'The person who starts the company and owns the original vision.', 'Person who starts the company', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.429Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4cy000isaosz6mi6hmu', 'DISRUPT', 'To overturn an existing market with a radically simpler or cheaper solution.', 'Overturn market with radical simplicity', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.434Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4d4000jsaoshbsmhvm0', 'NICHE', 'A small, sharply-defined customer segment you can dominate first.', 'Small segment you dominate first', 'strategy', 'new', 'curated', 1, '2026-11-07T03:25:19.414Z', '2026-11-07T03:23:56.440Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4da000ksaos7couce3u', 'TRACTION', 'Evidence that customers want your product — revenue, users, or growth rate.', 'Proof customers want the product', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.447Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4dh000lsaossl93y68p', 'FUNNEL', 'The journey from stranger to customer, measured stage by stage.', 'Stranger-to-customer journey stages', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.453Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4dq000msaoshdjkknji', 'VIRAL', 'Growth where every user brings more than one new user.', 'Users who recruit more users', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.462Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4e3000nsaos0h593g1d', 'RETENTION', 'The share of users who keep coming back after their first visit.', 'Users who keep returning', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.475Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4e9000osaost22f3wfw', 'ENGAGEMENT', 'How deeply and often users interact with the product.', 'Depth of user interaction', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.482Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4eg000psaos5kup05a7', 'BRAND', 'The promise and personality customers remember beyond the product.', 'Promise remembered beyond product', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.488Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ep000qsaostw1brdyw', 'POSITIONING', 'The slot your product owns in the customer''s mind versus rivals.', 'Slot owned in customer mind', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.497Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ev000rsaos9p52eyjy', 'IDEATION', 'The disciplined process of generating and filtering startup ideas.', 'Generating and filtering ideas', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.503Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4f2000ssaosqeem4ulc', 'LEAN', 'A build-measure-learn method that kills waste and tests assumptions fast.', 'Build-measure-learn loop method', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.510Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4f9000tsaosajhoups1', 'ROADMAP', 'A timeline of what the product team will build and when.', 'Product build timeline plan', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.518Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ff000usaosn5ht40jk', 'PROTOTYPE', 'A quick, throwaway model used to learn before building the real thing.', 'Quick throwaway model to learn', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.524Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4fo000vsaosvimuytzx', 'WIREFRAME', 'A low-detail sketch of an app screen''s layout and flow.', 'Low-detail screen layout sketch', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.532Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4fu000wsaosm1rvj4hk', 'BACKLOG', 'The prioritised queue of everything the product team could build next.', 'Prioritised queue of build tasks', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.538Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4g2000xsaoshjeuteay', 'SPRINT', 'A short fixed cycle where a team ships one focused chunk of work.', 'Short fixed team work cycle', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.546Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4g8000ysaosm31vv0rs', 'DILUTION', 'The shrinkage of your ownership percentage as new shares are issued to investors.', 'Ownership shrinkage on new shares', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.552Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ge000zsaosdnom4ga3', 'TERMSHEET', 'The non-binding offer sheet spelling out a deal''s valuation, control and liquidation terms.', 'Non-binding investment offer sheet', 'legal', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.558Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4gl0010saosnd7b5a2j', 'VESTING', 'Earning your shares over time so founders and staff stay committed.', 'Earning shares gradually over time', 'legal', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.565Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4gr0011saoswti7zbtt', 'IPR', 'Intellectual Property Rights — legal ownership of ideas, brands and inventions.', 'Legal ownership of ideas and brands', 'legal', 'new', 'curated', 1, '2026-11-07T03:25:19.384Z', '2026-11-07T03:23:56.572Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4gz0012saosrxdbo3fg', 'COMPLIANCE', 'Operating within every law, rule and regulation that touches the business.', 'Operating within all laws and rules', 'legal', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.580Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4h60013saos2sc5m52g', 'GST', 'India''s Goods and Services Tax — one unified tax replacing many indirect taxes.', 'India''s unified indirect tax', 'legal', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.586Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4hd0014saosdbjwhu0f', 'LLP', 'Limited Liability Partnership — a flexible structure where partners'' personal assets stay safe.', 'Partnership with protected personal assets', 'legal', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.594Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4hk0015saosq7c4ukag', 'IPO', 'Initial Public Offering — the day a private company sells shares to everyone on the stock market.', 'First public share sale day', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.600Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4hq0016saosqorv9m91', 'MERGER', 'Two companies combining into one stronger entity.', 'Two companies combine into one', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.607Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4hv0017saoso62wb23g', 'ACQUIRER', 'The company that buys another company or its assets.', 'Company that buys another company', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.612Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4i10018saosm92aow9e', 'EXIT', 'The event where founders and investors convert equity into cash — sale or IPO.', 'Event converting equity into cash', 'finance', 'new', 'curated', 1, '2026-11-07T03:25:19.421Z', '2026-11-07T03:23:56.617Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4i50019saos8wmhbspb', 'CAPX', 'Capital Expenditure — money spent on long-lived assets like machines or servers.', 'Spend on long-lived assets', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.622Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ia001asaossjq7sdfm', 'OPEX', 'Operating Expenditure — the day-to-day running costs of the business.', 'Day-to-day running costs', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.627Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4if001bsaoshy4ou10g', 'MARGIN', 'The gap between what you sell for and what it costs you.', 'Gap between price and cost', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.631Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ik001csaosazjhkfod', 'BREAKEVEN', 'The sales point where total revenue exactly covers total costs.', 'Sales point where costs are covered', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.636Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ip001dsaosk8u2bvvw', 'FORECAST', 'A data-based estimate of future revenue, costs and cash.', 'Data-based estimate of the future', 'finance', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.642Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4iv001esaosgmj6czch', 'SEO', 'Search Engine Optimisation — tuning content to rank higher on Google.', 'Tuning content to rank on Google', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.648Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4j3001fsaosmmig3ukt', 'B2B', 'Business-to-Business — selling your product to other companies.', 'Selling products to companies', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.656Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ja001gsaosud1k0vvu', 'B2C', 'Business-to-Consumer — selling directly to end users.', 'Selling directly to end users', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.662Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4jh001hsaoskz63v10p', 'D2C', 'Direct-to-Consumer — brands selling their own product without middlemen.', 'Brand sells without middlemen', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.670Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4jo001isaosh71ce9lm', 'GUERRILLA', 'Marketing that wins attention with surprise and creativity instead of budget.', 'Attention via surprise not budget', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.676Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ju001jsaosn34xg12f', 'INFLUENCER', 'A creator whose recommendation moves their audience''s buying decisions.', 'Creator who moves buying decisions', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.682Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4jz001ksaosik3yhvwt', 'LEADGEN', 'Lead Generation — attracting and capturing potential customers'' interest.', 'Capturing potential customer interest', 'marketing', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.687Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4k5001lsaos5z1ootr2', 'CONVERSION', 'The percentage of visitors who take the action you wanted.', 'Visitors who take the wanted action', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.693Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ka001msaos912rpd1r', 'COHORT', 'A group of users who started in the same period, tracked together over time.', 'Users grouped by start period', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.699Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4ki001nsaosvypuabga', 'NPS', 'Net Promoter Score — one question measures if customers would recommend you.', 'Would customers recommend you score', 'growth', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.706Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4kn001osaos0eeh9g3f', 'AHA', 'The moment a new user first feels the product''s core value.', 'First moment of core product value', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.712Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4kr001psaosgqkte7v3', 'ONBOARDING', 'The first-run experience that turns a signup into an active user.', 'First-run experience to activation', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.716Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4kz001qsaos6rgr3z0w', 'UX', 'User Experience — how easy, smooth and satisfying the product feels to use.', 'How satisfying the product feels', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.723Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4l3001rsaosvthfdvce', 'API', 'Application Programming Interface — the contract that lets two softwares talk.', 'Contract letting softwares talk', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.728Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4l8001ssaos3m7jmdur', 'CLOUD', 'Renting computing power and storage over the internet instead of owning servers.', 'Renting computers over the internet', 'product', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.732Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4le001tsaosu8wsy1py', 'AUTOMATE', 'Replacing repetitive manual work with software or machines.', 'Replacing manual work with software', 'ops', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.738Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4lj001usaos44dxgr9w', 'LOGISTICS', 'The choreography of moving goods from factory to customer efficiently.', 'Moving goods efficiently to customers', 'ops', 'new', 'curated', 1, '2026-11-07T03:25:19.359Z', '2026-11-07T03:23:56.744Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4lp001vsaosueflvqn6', 'SUPPLYCHAIN', 'The full network of suppliers, makers and carriers behind a product.', 'Network behind every product', 'ops', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.749Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4lv001wsaos5252v8lb', 'INVENTORY', 'The stock of goods a company holds before they are sold.', 'Stock held before being sold', 'ops', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.755Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4m0001xsaos25nzlf2n', 'QC', 'Quality Control — checking output so defects never reach customers.', 'Checking output for zero defects', 'ops', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.761Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4m7001ysaos6q63s260', 'SOP', 'Standard Operating Procedure — the written best way to do a repeated task.', 'Written best way to do a task', 'ops', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.767Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4me001zsaosun2kge04', 'OUTSOURCE', 'Hiring an outside firm to handle work your team used to do internally.', 'Hiring outside firm for internal work', 'ops', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.774Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4mj0020saos3zn2knv7', 'FRANCHISE', 'Licencing your proven business model to independent operators.', 'Licencing model to independent operators', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.780Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4mq0021saoscae4sb9i', 'B2B2C', 'Selling to businesses who then serve the end consumer with your product.', 'Sell via business to consumers', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.786Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4mv0022saoszq9eyjsn', 'BLUEOCEAN', 'Creating a new uncontested market instead of fighting in a crowded one.', 'Creating uncontested new market', 'strategy', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.791Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4n00023saosybwvowk9', 'MOCKSTUDY', 'A practice business case analysed before facing real competition rounds.', 'Practice case before real competition', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.797Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ua4n60024saos01mtnw2e', 'ECELL', 'Entrepreneurship Cell — the campus club that builds student founders.', 'Campus club building student founders', 'ecell', 'new', 'curated', 0, NULL, '2026-11-07T03:23:56.802Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ubm3h0000sa4w06kkpx0a', 'SPARK', 'A concise, testable hypothesis about a market need that guides the first experiments of a nascent startup.', 'Hypothesis that ignites early experiments', 'strategy', 'new', 'ai_daily', 0, NULL, '2026-11-07T03:25:06.078Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ubm3q0001sa4wlbrdrgzz', 'PIPELINE', 'A visualized sequence of prospective customers from initial contact to closed deal, used to forecast revenue.', 'Sequence of prospects leading to revenue', 'ops', 'new', 'ai_daily', 0, NULL, '2026-11-07T03:25:06.086Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ubm3x0002sa4wvocstg96', 'PATENTSAFE', 'A structured agreement that bundles a startup''s core patents into a single enforceable asset for investors.', 'Bundled patent asset for investors', 'legal', 'new', 'ai_daily', 0, NULL, '2026-11-07T03:25:06.093Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ubm440003sa4wouxkkszp', 'GROWTHFUND', 'A financing round dedicated exclusively to scaling user acquisition and market expansion, often with performance‑based tranches.', 'Funding round for scaling user acquisition', 'finance', 'new', 'ai_daily', 0, NULL, '2026-11-07T03:25:06.100Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Word" ("id", "term", "definition", "keyDefinition", "category", "status", "source", "usedInCrosswords", "lastUsedAt", "createdAt")
VALUES ('cmw5ubm4a0004sa4w8npv5i77', 'DOWNROUND', 'A round of financing where investors purchase equity at a lower valuation than the previous round.', 'Funding round at a lower valuation', 'finance', 'new', 'ai_daily', 0, NULL, '2026-11-07T03:25:06.107Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Crossword" ("id", "title", "difficulty", "gridData", "wordIds", "mode", "isPersonal", "forUserId", "timeLimitSec", "isActive", "createdById", "createdAt")
VALUES ('cmw4fhpyz002nsaxoa0447k9j', 'Adaptive Challenge — 6 Nov', 'medium', '{"rows":11,"cols":11,"cells":[{"r":0,"c":4,"solution":"B","number":1},{"r":1,"c":2,"solution":"M","number":2},{"r":1,"c":4,"solution":"O"},{"r":2,"c":2,"solution":"V"},{"r":2,"c":4,"solution":"O"},{"r":3,"c":2,"solution":"P","number":3},{"r":3,"c":3,"solution":"I"},{"r":3,"c":4,"solution":"T"},{"r":3,"c":5,"solution":"C"},{"r":3,"c":6,"solution":"H"},{"r":3,"c":7,"solution":"D"},{"r":3,"c":8,"solution":"E"},{"r":3,"c":9,"solution":"C"},{"r":3,"c":10,"solution":"K"},{"r":4,"c":4,"solution":"S"},{"r":5,"c":1,"solution":"R","number":4},{"r":5,"c":4,"solution":"T"},{"r":6,"c":0,"solution":"B","number":5},{"r":6,"c":1,"solution":"U"},{"r":6,"c":2,"solution":"R"},{"r":6,"c":3,"solution":"N"},{"r":6,"c":4,"solution":"R"},{"r":6,"c":5,"solution":"A"},{"r":6,"c":6,"solution":"T"},{"r":6,"c":7,"solution":"E"},{"r":7,"c":1,"solution":"N"},{"r":7,"c":4,"solution":"A"},{"r":8,"c":1,"solution":"W"},{"r":8,"c":4,"solution":"P","number":6},{"r":8,"c":5,"solution":"I"},{"r":8,"c":6,"solution":"V"},{"r":8,"c":7,"solution":"O"},{"r":8,"c":8,"solution":"T"},{"r":9,"c":1,"solution":"A"},{"r":10,"c":1,"solution":"Y"}],"entries":[{"word":"PITCHDECK","clue":"A presentation used by startups to explain their business idea, market opportunity, product, and financial…","row":3,"col":2,"dir":"across","number":3,"len":9},{"word":"BOOTSTRAP","clue":"Building and growing a startup using personal savings and business revenue without external investors.","row":0,"col":4,"dir":"down","number":1,"len":9},{"word":"MVP","clue":"Minimum Viable Product — the simplest version of a product that can be launched to test an idea with real…","row":1,"col":2,"dir":"down","number":2,"len":3},{"word":"BURNRATE","clue":"The rate at which a startup spends its available cash over a specific period.","row":6,"col":0,"dir":"across","number":5,"len":8},{"word":"PIVOT","clue":"A strategic change in a startup''s business model, product, or target market based on feedback or market…","row":8,"col":4,"dir":"across","number":6,"len":5},{"word":"RUNWAY","clue":"The number of months a startup can continue operating before running out of cash.","row":5,"col":1,"dir":"down","number":4,"len":6}]}', '["cmw4fg0l50009saxoa2f724bl","cmw4fg0jb0003saxo3d3pxi88","cmw4fg0kh0006saxode3zt2f0","cmw4fg0k80005saxov3ollgu5","cmw4fg0ko0007saxo4nqzyqog","cmw4fg0jv0004saxo4myszvfd"]', 'daily', false, NULL, 360, true, 'cmw4fc3zv0000saxoa06vq1yd', '2026-11-06T03:42:10.620Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Crossword" ("id", "title", "difficulty", "gridData", "wordIds", "mode", "isPersonal", "forUserId", "timeLimitSec", "isActive", "createdById", "createdAt")
VALUES ('cmw4h2vxn0007saksxdvtd8ay', 'Daily Crossword — 6 Nov 2026', 'medium', '{"rows":8,"cols":15,"cells":[{"r":0,"c":8,"solution":"F","number":1},{"r":0,"c":9,"solution":"A"},{"r":0,"c":10,"solution":"I"},{"r":0,"c":11,"solution":"R"},{"r":0,"c":12,"solution":"C"},{"r":0,"c":13,"solution":"A"},{"r":0,"c":14,"solution":"P"},{"r":1,"c":8,"solution":"U"},{"r":2,"c":8,"solution":"N"},{"r":3,"c":2,"solution":"P","number":2},{"r":3,"c":8,"solution":"D"},{"r":4,"c":0,"solution":"U","number":3},{"r":4,"c":1,"solution":"N"},{"r":4,"c":2,"solution":"I"},{"r":4,"c":3,"solution":"C"},{"r":4,"c":4,"solution":"O"},{"r":4,"c":5,"solution":"R"},{"r":4,"c":6,"solution":"N"},{"r":4,"c":8,"solution":"L"},{"r":5,"c":2,"solution":"V"},{"r":5,"c":8,"solution":"O"},{"r":6,"c":0,"solution":"G","number":4},{"r":6,"c":1,"solution":"R"},{"r":6,"c":2,"solution":"O"},{"r":6,"c":3,"solution":"W"},{"r":6,"c":4,"solution":"T"},{"r":6,"c":5,"solution":"H"},{"r":6,"c":6,"solution":"H"},{"r":6,"c":7,"solution":"A"},{"r":6,"c":8,"solution":"C"},{"r":6,"c":9,"solution":"K"},{"r":7,"c":2,"solution":"T"},{"r":7,"c":8,"solution":"K"}],"entries":[{"word":"GROWTHHACK","clue":"Budget-friendly method to quickly boost user numbers","row":6,"col":0,"dir":"across","number":4,"len":10},{"word":"FUNDLOCK","clue":"Situation where a startup can''t attract fresh investment","row":0,"col":8,"dir":"down","number":1,"len":8},{"word":"PIVOT","clue":"Major shift in a company''s product or market direction after feedback","row":3,"col":2,"dir":"down","number":2,"len":5},{"word":"UNICORN","clue":"Privately held tech company valued at a billion dollars or more","row":4,"col":0,"dir":"across","number":3,"len":7},{"word":"FAIRCAP","clue":"Maximum pre‑money valuation a founder sets to limit future dilution","row":0,"col":8,"dir":"across","number":1,"len":7}]}', '["cmw4h2ur40001saks5jmn3nz6","cmw4h2urd0003saksm0yd0q4r","cmw4fg0ko0007saxo4nqzyqog","cmw4fg0kx0008saxoox4rbf89","cmw4h2uqv0000sakscsttn83i"]', 'daily', false, NULL, 300, true, 'cmw4f7byp0000sax4jkqhzmu0', '2026-11-06T04:26:37.740Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Crossword" ("id", "title", "difficulty", "gridData", "wordIds", "mode", "isPersonal", "forUserId", "timeLimitSec", "isActive", "createdById", "createdAt")
VALUES ('cmw5ubwby0007sa4ws6trawod', 'Daily Crossword — 7 Nov 2026', 'medium', '{"rows":9,"cols":9,"cells":[{"r":0,"c":2,"solution":"E","number":1},{"r":1,"c":2,"solution":"X"},{"r":2,"c":1,"solution":"N","number":2},{"r":2,"c":2,"solution":"I"},{"r":2,"c":3,"solution":"C"},{"r":2,"c":4,"solution":"H"},{"r":2,"c":5,"solution":"E","number":3},{"r":3,"c":2,"solution":"T"},{"r":3,"c":5,"solution":"Q"},{"r":4,"c":3,"solution":"C","number":4},{"r":4,"c":4,"solution":"H"},{"r":4,"c":5,"solution":"U"},{"r":4,"c":6,"solution":"R"},{"r":4,"c":7,"solution":"N"},{"r":5,"c":5,"solution":"I"},{"r":6,"c":0,"solution":"L","number":5},{"r":6,"c":1,"solution":"O"},{"r":6,"c":2,"solution":"G"},{"r":6,"c":3,"solution":"I","number":6},{"r":6,"c":4,"solution":"S"},{"r":6,"c":5,"solution":"T"},{"r":6,"c":6,"solution":"I"},{"r":6,"c":7,"solution":"C"},{"r":6,"c":8,"solution":"S"},{"r":7,"c":3,"solution":"P"},{"r":7,"c":5,"solution":"Y"},{"r":8,"c":3,"solution":"R"}],"entries":[{"word":"LOGISTICS","clue":"Coordinating transport so products reach buyers on time","row":6,"col":0,"dir":"across","number":5,"len":9},{"word":"EQUITY","clue":"Share of a firm''s value held by a stakeholder","row":2,"col":5,"dir":"down","number":3,"len":6},{"word":"IPR","clue":"Legal protection for inventions, designs and brand identifiers","row":6,"col":3,"dir":"down","number":6,"len":3},{"word":"CHURN","clue":"Measure of how many users stop using a service each month","row":4,"col":3,"dir":"across","number":4,"len":5},{"word":"NICHE","clue":"Specialized market slice where a startup first gains traction","row":2,"col":1,"dir":"across","number":2,"len":5},{"word":"EXIT","clue":"Liquidity event that turns founders'' shares into cash","row":0,"col":2,"dir":"down","number":1,"len":4}]}', '["cmw5ua4lj001usaos44dxgr9w","cmw5ua49s0003saosnj4jhggr","cmw5ua4gr0011saoswti7zbtt","cmw5ua4aq0008saosparabr7o","cmw5ua4d4000jsaoshbsmhvm0","cmw5ua4i10018saosm92aow9e"]', 'daily', false, NULL, 360, true, 'cmw4f7byp0000sax4jkqhzmu0', '2026-11-07T03:25:19.343Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4fhpz0002psaxoeckcc3lt', 'cmw4fhpyz002nsaxoa0447k9j', 'cmw4fg0l50009saxoa2f724bl')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4fhpz0002rsaxofv1bxtk0', 'cmw4fhpyz002nsaxoa0447k9j', 'cmw4fg0kh0006saxode3zt2f0')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4fhpz0002ssaxouuhlv7mh', 'cmw4fhpyz002nsaxoa0447k9j', 'cmw4fg0k80005saxov3ollgu5')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4fhpz0002tsaxo70oyqxcr', 'cmw4fhpyz002nsaxoa0447k9j', 'cmw4fg0ko0007saxo4nqzyqog')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4fhpz0002usaxo9fkhbvli', 'cmw4fhpyz002nsaxoa0447k9j', 'cmw4fg0jv0004saxo4myszvfd')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4h2vxo0009sakscuida6tn', 'cmw4h2vxn0007saksxdvtd8ay', 'cmw4h2ur40001saks5jmn3nz6')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4h2vxo000asakss1a8kadj', 'cmw4h2vxn0007saksxdvtd8ay', 'cmw4h2urd0003saksm0yd0q4r')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4h2vxo000bsakss6c5fgwm', 'cmw4h2vxn0007saksxdvtd8ay', 'cmw4fg0ko0007saxo4nqzyqog')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4h2vxo000csaksra8tkght', 'cmw4h2vxn0007saksxdvtd8ay', 'cmw4fg0kx0008saxoox4rbf89')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw4h2vxo000dsaks4f197994', 'cmw4h2vxn0007saksxdvtd8ay', 'cmw4h2uqv0000sakscsttn83i')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw5ubwbz0009sa4wd7ns6sgh', 'cmw5ubwby0007sa4ws6trawod', 'cmw5ua4lj001usaos44dxgr9w')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw5ubwbz000asa4wo3fsp102', 'cmw5ubwby0007sa4ws6trawod', 'cmw5ua49s0003saosnj4jhggr')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw5ubwbz000bsa4wdzs9ajk0', 'cmw5ubwby0007sa4ws6trawod', 'cmw5ua4gr0011saoswti7zbtt')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw5ubwbz000csa4w3ecruk7d', 'cmw5ubwby0007sa4ws6trawod', 'cmw5ua4aq0008saosparabr7o')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw5ubwbz000dsa4wt9clayvb', 'cmw5ubwby0007sa4ws6trawod', 'cmw5ua4d4000jsaoshbsmhvm0')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordWord" ("id", "crosswordId", "wordId")
VALUES ('cmw5ubwbz000esa4w1zf2alzr', 'cmw5ubwby0007sa4ws6trawod', 'cmw5ua4i10018saosm92aow9e')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordProgress" ("id", "userId", "wordId", "status", "intervalDays", "ease", "dueAt", "lastSeenAt", "timesSeen", "timesCorrect", "heartsLost", "updatedAt")
VALUES ('cmw4fgg4l000csaxo29pv498b', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kx0008saxoox4rbf89', 'learning', 3, 2.74, '2026-11-06T03:51:31.987Z', '2026-11-06T03:41:31.987Z', 3, 2, 1, '2026-11-06T03:41:31.989Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordProgress" ("id", "userId", "wordId", "status", "intervalDays", "ease", "dueAt", "lastSeenAt", "timesSeen", "timesCorrect", "heartsLost", "updatedAt")
VALUES ('cmw4fgiz4000gsaxoezas0aen', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0ko0007saxo4nqzyqog', 'learning', 3, 2.74, '2026-11-06T03:51:36.914Z', '2026-11-06T03:41:36.914Z', 3, 2, 1, '2026-11-06T03:41:36.916Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordProgress" ("id", "userId", "wordId", "status", "intervalDays", "ease", "dueAt", "lastSeenAt", "timesSeen", "timesCorrect", "heartsLost", "updatedAt")
VALUES ('cmw4fgk6i000ksaxo5udzuf2j', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0jv0004saxo4myszvfd', 'learning', 1, 2.4, '2026-11-06T03:51:41.045Z', '2026-11-06T03:41:41.045Z', 4, 1, 2, '2026-11-06T03:41:41.047Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordProgress" ("id", "userId", "wordId", "status", "intervalDays", "ease", "dueAt", "lastSeenAt", "timesSeen", "timesCorrect", "heartsLost", "updatedAt")
VALUES ('cmw4fgojg000ssaxov7kyy6zf', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0k80005saxov3ollgu5', 'learning', 3, 2.74, '2026-11-09T03:41:46.136Z', '2026-11-06T03:41:46.136Z', 2, 2, 0, '2026-11-06T03:41:46.138Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordProgress" ("id", "userId", "wordId", "status", "intervalDays", "ease", "dueAt", "lastSeenAt", "timesSeen", "timesCorrect", "heartsLost", "updatedAt")
VALUES ('cmw4fgp5d000wsaxouc6377dr', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kh0006saxode3zt2f0', 'done', 9, 2.86, '2026-11-15T03:41:48.135Z', '2026-11-06T03:41:48.135Z', 3, 3, 0, '2026-11-06T03:41:48.137Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordProgress" ("id", "userId", "wordId", "status", "intervalDays", "ease", "dueAt", "lastSeenAt", "timesSeen", "timesCorrect", "heartsLost", "updatedAt")
VALUES ('cmw4fgqbq0010saxoxr74iaeu', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0l50009saxoa2f724bl', 'learning', 3, 2.74, '2026-11-09T03:41:48.758Z', '2026-11-06T03:41:48.758Z', 3, 2, 1, '2026-11-06T03:41:48.760Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordProgress" ("id", "userId", "wordId", "status", "intervalDays", "ease", "dueAt", "lastSeenAt", "timesSeen", "timesCorrect", "heartsLost", "updatedAt")
VALUES ('cmw4fgtl90018saxoj4xwriqx', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0lc000asaxobx1g8a8y', 'learning', 3, 2.74, '2026-11-09T03:41:51.168Z', '2026-11-06T03:41:51.168Z', 2, 2, 0, '2026-11-06T03:41:51.170Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgg5b000esaxoixjyc1tu', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kx0008saxoox4rbf89', 'flip_known', true, 11, 0, 0, '{"status":"learning","intervalDays":1}', '2026-11-06T03:41:11.231Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgizj000isaxod9bi8sa2', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0ko0007saxo4nqzyqog', 'flip_known', true, 4, 0, 0, '{"status":"learning","intervalDays":1}', '2026-11-06T03:41:14.912Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgk6s000msaxohet2ntzk', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0jv0004saxo4myszvfd', 'flip_unknown', false, 2, 0, 0, '{"status":"learning","intervalDays":0}', '2026-11-06T03:41:16.468Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgm8x000qsaxoc1tk97ye', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0jv0004saxo4myszvfd', 'quiz_fail', false, 2, 0, 0, '{"timeout":false,"selected":"ANGEL INVESTOR"}', '2026-11-06T03:41:19.137Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgok2000usaxoflqzqv3b', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0k80005saxov3ollgu5', 'flip_known', true, 2, 0, 0, '{"status":"learning","intervalDays":1}', '2026-11-06T03:41:22.130Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgp5v000ysaxo9scpyv0l', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kh0006saxode3zt2f0', 'flip_known', true, 1, 0, 0, '{"status":"learning","intervalDays":1}', '2026-11-06T03:41:22.915Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgqc70012saxo9b8hmtuc', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0l50009saxoa2f724bl', 'flip_known', true, 1, 0, 0, '{"status":"learning","intervalDays":1}', '2026-11-06T03:41:24.439Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgrhs0016saxou9tsqyes', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0l50009saxoa2f724bl', 'quiz_fail', false, 1, 0, 0, '{"timeout":false,"selected":"ANGEL INVESTOR"}', '2026-11-06T03:41:25.936Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgtlt001asaxo3j8if2up', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0lc000asaxobx1g8a8y', 'flip_known', true, 2, 0, 0, '{"status":"learning","intervalDays":1}', '2026-11-06T03:41:28.673Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgvfr001isaxoegoxe99p', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kx0008saxoox4rbf89', 'flip_known', true, 1, 0, 0, '{"status":"learning","intervalDays":3}', '2026-11-06T03:41:31.048Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgw6d001msaxo142xndac', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kx0008saxoox4rbf89', 'quiz_fail', false, 1, 0, 0, '{"timeout":false,"selected":"ANGEL INVESTOR"}', '2026-11-06T03:41:32.005Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgyoj001qsaxo4pi4kp6s', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0ko0007saxo4nqzyqog', 'flip_known', true, 2, 0, 0, '{"status":"learning","intervalDays":3}', '2026-11-06T03:41:35.252Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fgzz7001usaxo0sfb9uko', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0ko0007saxo4nqzyqog', 'quiz_fail', false, 2, 0, 0, '{"timeout":false,"selected":"BOOTSTRAP"}', '2026-11-06T03:41:36.931Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fh2fs001ysaxo8bqgyy4n', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0jv0004saxo4myszvfd', 'flip_known', true, 2, 0, 0, '{"status":"learning","intervalDays":1}', '2026-11-06T03:41:40.121Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fh35z0022saxou6oblfbr', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0jv0004saxo4myszvfd', 'quiz_fail', false, 1, 0, 0, '{"timeout":false,"selected":"BURN RATE"}', '2026-11-06T03:41:41.064Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fh7370026saxofzgmlcww', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0k80005saxov3ollgu5', 'flip_known', true, 4, 0, 0, '{"status":"learning","intervalDays":3}', '2026-11-06T03:41:46.148Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fh7rp002asaxojvqtbrs8', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kh0006saxode3zt2f0', 'flip_known', true, 1, 0, 0, '{"status":"learning","intervalDays":3}', '2026-11-06T03:41:47.030Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fh8np002esaxoorqo2ucy', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kh0006saxode3zt2f0', 'flip_known', true, 1, 0, 0, '{"status":"done","intervalDays":9}', '2026-11-06T03:41:48.181Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fh942002isaxobklqfszv', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0l50009saxoa2f724bl', 'flip_known', true, 1, 0, 0, '{"status":"learning","intervalDays":3}', '2026-11-06T03:41:48.770Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4fhaz8002msaxondjjutsh', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0lc000asaxobx1g8a8y', 'flip_known', true, 2, 0, 0, '{"status":"learning","intervalDays":3}', '2026-11-06T03:41:51.188Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4figvl0032saxoi1ew6ibo', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0kh0006saxode3zt2f0', 'crossword_missed', false, 0, 0, 1, NULL, '2026-11-06T03:42:45.489Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4figvy0034saxo3ryx5922', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0ko0007saxo4nqzyqog', 'crossword_missed', false, 0, 0, 1, NULL, '2026-11-06T03:42:45.502Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WordLog" ("id", "userId", "wordId", "kind", "correct", "timeTakenSec", "hintsUsed", "wrongAttempts", "meta", "createdAt")
VALUES ('cmw4figw80036saxoob7m8n3d', 'cmw4fc3zv0000saxoa06vq1yd', 'cmw4fg0jv0004saxo4myszvfd', 'crossword_missed', false, 0, 0, 1, NULL, '2026-11-06T03:42:45.512Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CrosswordSolve" ("id", "crosswordId", "userId", "completed", "correctLetters", "totalLetters", "accuracy", "timeTakenSec", "hintsUsed", "wrongAttempts", "points", "createdAt")
VALUES ('cmw4figug002wsaxodtydt90c', 'cmw4fhpyz002nsaxoa0447k9j', 'cmw4fc3zv0000saxoa06vq1yd', false, 1, 40, 0.025, 30, 0, 0, 2, '2026-11-06T03:42:45.447Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "MemoryProfile" ("userId", "overallRetention", "recallVelocity", "masteryCount", "weakVault", "strongVault", "categoryScores", "swot", "hearts", "extraPoints", "dailyLearned", "dailyDate", "updatedAt")
VALUES ('cmw4fc3zv0000saxoa06vq1yd', 0.9995769075858538, 2.142857142857143, 1, '["cmw4fg0jv0004saxo4myszvfd","cmw4fg0ko0007saxo4nqzyqog","cmw4fg0kh0006saxode3zt2f0","cmw4fg0jb0003saxo3d3pxi88","cmw4fg0kx0008saxoox4rbf89","cmw4fg0l50009saxoa2f724bl"]', '["cmw4fg0lc000asaxobx1g8a8y","cmw4fg0l50009saxoa2f724bl","cmw4fg0kh0006saxode3zt2f0","cmw4fg0k80005saxov3ollgu5","cmw4fg0jv0004saxo4myszvfd","cmw4fg0ko0007saxo4nqzyqog","cmw4fg0kx0008saxoox4rbf89","cmw4fg0jb0003saxo3d3pxi88"]', '{"general":58}', '{"strengths":["1 mastered term","8 rock-solid recalls"],"weaknesses":["6 fading terms"],"opportunities":["7 words mid-learning"],"threats":["Memory decay accelerating on weak vault"]}', 0, 0, 0, '2026-11-07', '2026-11-07T03:32:31.726Z')
ON CONFLICT ("userId") DO UPDATE SET "overallRetention" = EXCLUDED."overallRetention", "hearts" = EXCLUDED."hearts";

INSERT INTO "MemoryProfile" ("userId", "overallRetention", "recallVelocity", "masteryCount", "weakVault", "strongVault", "categoryScores", "swot", "hearts", "extraPoints", "dailyLearned", "dailyDate", "updatedAt")
VALUES ('cmw4f7byp0000sax4jkqhzmu0', 0.85, 0, 0, '[]', '[]', '{}', '{"strengths":["Initial memory profile initializing"],"weaknesses":["No critical weaknesses detected — memory vault is fresh"],"opportunities":["13 unseen words ready to unlock in the vault","Daily crossword challenge available to refill hearts & boost retention"],"threats":["Retention curve stable — no active memory decay threats"]}', 5, 0, 0, '2026-11-07', '2026-11-07T03:25:19.880Z')
ON CONFLICT ("userId") DO UPDATE SET "overallRetention" = EXCLUDED."overallRetention", "hearts" = EXCLUDED."hearts";

INSERT INTO "Activity" ("id", "userId", "module", "action", "detail", "points", "createdAt")
VALUES ('cmw4fc40a0002saxotymzppjk', 'cmw4fc3zv0000saxoa06vq1yd', 'system', 'joined', 'Signed up for WeLearn', 0, '2026-11-06T03:37:48.874Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Activity" ("id", "userId", "module", "action", "detail", "points", "createdAt")
VALUES ('cmw4figuq002ysaxo8213natz', 'cmw4fc3zv0000saxoa06vq1yd', 'crosswords', 'crossword_attempt', 'Adaptive Challenge — 6 Nov — 3%', 2, '2026-11-06T03:42:45.459Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Activity" ("id", "userId", "module", "action", "detail", "points", "createdAt")
VALUES ('cmw4h2urm0006saksxxh918w3', 'cmw4f7byp0000sax4jkqhzmu0', 'crosswords', 'daily_ai_expansion', '2026-11-06', 0, '2026-11-06T04:26:36.226Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Activity" ("id", "userId", "module", "action", "detail", "points", "createdAt")
VALUES ('cmw5ubm4j0006sa4wadyo3su5', 'cmw4f7byp0000sax4jkqhzmu0', 'crosswords', 'daily_ai_expansion', '2026-11-07', 0, '2026-11-07T03:25:06.115Z')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Activity" ("id", "userId", "module", "action", "detail", "points", "createdAt")
VALUES ('cmw5wc8lw0002saecic17fn0s', 'cmw5wc8lc0000saec7gxuo2y8', 'system', 'joined', 'Signed up for WeLearn', 0, '2026-11-07T04:21:34.484Z')
ON CONFLICT ("id") DO NOTHING;
COMMIT;