/**
 * Seed catalogue for Summit. Times are IST (UTC+05:30).
 * Cover images are hosted on Unsplash (free to use under the Unsplash License).
 */
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
const at = (local) => new Date(`${local}:00+05:30`);

const KIIT = { name: 'KIIT Campus 15 Auditorium', address: 'KIIT Road, Patia', city: 'Bhubaneswar', lat: 20.3537, lng: 85.8193 };
const ONLINE = { name: 'Online · Live stream', address: 'Link shared after registration', city: 'Online' };

export const events = [
  {
    title: 'HackKalinga 2026',
    tagline: '36 hours. 600 builders. One wild weekend of shipping.',
    shortDescription:
      'A 36-hour campus hackathon with tracks in AI, climate tech and fintech, mentors from top startups and ₹5 lakh in prizes.',
    description: `HackKalinga is back for its fourth edition — bigger, louder and more caffeinated than ever. Form a team of up to four, pick a track, and build something real between Saturday morning and Sunday evening.

This year's tracks are **Applied AI**, **Climate & Sustainability** and **Fintech for Bharat**. Every team gets a mentor, cloud credits and a spot in the final demo showcase. Judges include founders, VCs and senior engineers who have shipped products used by millions.

Never been to a hackathon? Perfect. We run a beginner bootcamp on Saturday morning, and our "first-timer" prize celebrates the best project from a team that has never hacked before. Meals, snacks, swag and sleeping pods are all on us.`,
    category: 'Tech',
    tags: ['hackathon', 'ai', 'prizes', 'beginner-friendly'],
    coverImage: img('1504384308090-c894fdcc538d'),
    startDate: at('2026-11-21T09:00'),
    endDate: at('2026-11-22T21:00'),
    mode: 'offline',
    venue: KIIT,
    price: 0,
    capacity: 600,
    registeredCount: 412,
    featured: true,
    organizer: { name: 'KIIT Developer Society', website: 'https://kiit.ac.in' },
    speakers: [
      { name: 'Ananya Mishra', role: 'Staff Engineer, Razor Labs' },
      { name: 'Kabir Sen', role: 'Partner, Monsoon Ventures' },
      { name: 'Ishita Rao', role: 'ML Lead, Saarthi AI' },
    ],
    agenda: [
      { time: 'Sat 09:00', title: 'Check-in & breakfast', description: 'Collect your badge, swag kit and Wi-Fi credentials.' },
      { time: 'Sat 10:00', title: 'Opening keynote', description: 'Problem statements and judging criteria revealed.' },
      { time: 'Sat 11:00', title: 'Hacking begins', description: 'Mentor office hours run every 3 hours.' },
      { time: 'Sun 12:00', title: 'Code freeze', description: 'Submit your repo and a 2-minute demo video.' },
      { time: 'Sun 17:00', title: 'Finalist demos & awards', description: 'Top 10 teams pitch live on the main stage.' },
    ],
    faqs: [
      { q: 'Who can participate?', a: 'Any college student with a valid ID. Teams of 1–4 people.' },
      { q: 'Do I need a team before registering?', a: 'No — we run a team-formation mixer at 10:30 on Saturday.' },
      { q: 'What should I bring?', a: 'Laptop, charger, student ID and a reusable water bottle.' },
    ],
  },
  {
    title: 'Neon Nights: Indie Music Festival',
    tagline: 'Twelve indie acts. Two stages. One neon-soaked night.',
    shortDescription:
      'An open-air night of indie rock, electronic and Odia fusion acts with immersive light installations and food trucks.',
    description: `Neon Nights turns Kalinga Stadium's open grounds into a glowing playground for one night only. Twelve of India's most exciting independent artists take over two stages — from dreamy synth-pop to thunderous Odia folk-fusion.

Between sets, wander through interactive neon installations built by student artists, grab a bite from 20+ food trucks and catch secret acoustic sessions in the "Glow Garden".

Gates open at 4 PM. The headline act goes on at 9:30 PM. Expect lasers, confetti cannons and a crowd that sings every word.`,
    category: 'Music',
    tags: ['festival', 'live music', 'indie', 'nightlife'],
    coverImage: img('1506157786151-b8491531f063'),
    startDate: at('2026-12-12T16:00'),
    endDate: at('2026-12-12T23:30'),
    mode: 'offline',
    venue: { name: 'Kalinga Stadium Open Grounds', address: 'Nayapalli', city: 'Bhubaneswar', lat: 20.2885, lng: 85.8215 },
    price: 799,
    capacity: 3000,
    registeredCount: 2140,
    featured: true,
    organizer: { name: 'Kalinga Music Collective' },
    speakers: [
      { name: 'The Monsoon Tapes', role: 'Headliner · Indie rock' },
      { name: 'Riya Sahoo', role: 'Odia folk-fusion' },
      { name: 'DJ Kaveri', role: 'Closing set · Electronic' },
    ],
    agenda: [
      { time: '16:00', title: 'Gates open', description: 'Food trucks, merch and the Glow Garden open.' },
      { time: '17:00', title: 'Sunset stage', description: 'Acoustic and folk-fusion sets.' },
      { time: '19:30', title: 'Main stage lights up', description: 'Indie rock and synth-pop acts.' },
      { time: '21:30', title: 'Headliner: The Monsoon Tapes' },
      { time: '23:00', title: 'Closing DJ set' },
    ],
    faqs: [
      { q: 'Is there an age limit?', a: 'The festival is 16+. Attendees under 18 must be accompanied by an adult.' },
      { q: 'Can I re-enter?', a: 'Single entry only — your QR ticket is scanned once at the gate.' },
      { q: 'Is parking available?', a: 'Limited paid parking. We recommend the free shuttle from Master Canteen.' },
    ],
  },
  {
    title: 'Applied AI Summit 2026',
    tagline: 'From prototype to production: AI that actually ships.',
    shortDescription:
      'A one-day summit on shipping AI products — agents, evals, on-device models and responsible deployment — with 20+ speakers.',
    description: `The Applied AI Summit brings together engineers, product leaders and researchers who are putting AI into real products — not just demos.

Expect deep-dive talks on agent architectures, evaluation pipelines, retrieval systems, on-device inference and AI safety in production. Afternoon workshops are hands-on: bring a laptop and leave with working code.

The day closes with a founders' panel on building AI-native companies in India, followed by a networking mixer.`,
    category: 'Tech',
    tags: ['ai', 'machine learning', 'conference', 'networking'],
    coverImage: img('1677442136019-21780ecad995'),
    startDate: at('2026-11-28T09:30'),
    endDate: at('2026-11-28T18:30'),
    mode: 'hybrid',
    venue: { name: 'Bangalore International Exhibition Centre', address: 'Tumkur Road, Madavara', city: 'Bengaluru', lat: 13.0617, lng: 77.4759 },
    price: 1499,
    capacity: 1200,
    registeredCount: 860,
    featured: true,
    organizer: { name: 'Konark Labs' },
    speakers: [
      { name: 'Meera Iyer', role: 'Head of AI Platform, Fynd-X' },
      { name: 'Arjun Mehta', role: 'Research Scientist, Lumen AI' },
      { name: 'Sana Qureshi', role: 'Founder, EvalStack' },
      { name: 'Vikram Das', role: 'Principal Engineer, Cloudnine' },
    ],
    agenda: [
      { time: '09:30', title: 'Registration & coffee' },
      { time: '10:15', title: 'Keynote: The year agents went to production' },
      { time: '11:30', title: 'Track talks', description: 'Agents · Evals · On-device · Safety' },
      { time: '14:00', title: 'Hands-on workshops' },
      { time: '16:30', title: "Founders' panel" },
      { time: '17:30', title: 'Networking mixer' },
    ],
    faqs: [
      { q: 'Is there a virtual pass?', a: 'Yes — the keynote and track talks are live-streamed to all registrants.' },
      { q: 'Will talks be recorded?', a: 'Recordings are shared with attendees within a week.' },
      { q: 'Do I need ML experience?', a: 'Talks assume basic programming knowledge; workshops list prerequisites.' },
    ],
  },
  {
    title: 'Figma to Production: Design Systems Workshop',
    tagline: 'Tokens, components and the handoff that never breaks.',
    shortDescription:
      'A live, hands-on workshop on building a design system in Figma and shipping it as a React + Tailwind component library.',
    description: `Design systems fail at the handoff. In this three-hour live workshop you'll build a small design system end-to-end: design tokens in Figma, variables and modes for dark/light themes, and a matching React component library powered by Tailwind CSS.

We'll cover naming conventions, accessible colour contrast, component APIs and how to keep design and code in sync as the system grows.

You'll leave with a starter repo and a Figma file you can reuse for your next project.`,
    category: 'Workshop',
    tags: ['design', 'figma', 'react', 'tailwind'],
    coverImage: img('1519389950473-47ba0277781c'),
    startDate: at('2026-11-15T15:00'),
    endDate: at('2026-11-15T18:00'),
    mode: 'online',
    venue: ONLINE,
    price: 0,
    capacity: 300,
    registeredCount: 287,
    featured: false,
    organizer: { name: 'Pixel & Prop Studio' },
    speakers: [
      { name: 'Tara Menon', role: 'Design Systems Lead, Northstar' },
      { name: 'Dev Malhotra', role: 'Frontend Architect' },
    ],
    agenda: [
      { time: '15:00', title: 'Tokens & variables in Figma' },
      { time: '16:00', title: 'From tokens to Tailwind theme' },
      { time: '17:00', title: 'Building accessible components' },
    ],
  },
  {
    title: "Founders' Pitch Arena",
    tagline: 'Five minutes. Five judges. One shot at seed funding.',
    shortDescription:
      'Twelve student startups pitch live to angel investors for a shot at ₹10 lakh in seed grants and incubation support.',
    description: `The Pitch Arena is where campus ideas meet real capital. Twelve shortlisted student startups get five minutes on stage and five minutes of rapid-fire questions from a panel of angels and early-stage VCs.

The audience votes for a People's Choice award, and every founder gets one-on-one office hours with an investor after the event.

Come to cheer, network and see what the next generation of founders is building.`,
    category: 'Business',
    tags: ['startups', 'pitching', 'funding', 'networking'],
    coverImage: img('1559136555-9303baea8ebd'),
    startDate: at('2026-12-05T14:00'),
    endDate: at('2026-12-05T19:00'),
    mode: 'offline',
    venue: { name: 'KIIT Technology Business Incubator', address: 'Campus 11, KIIT', city: 'Bhubaneswar', lat: 20.3587, lng: 85.8161 },
    price: 0,
    capacity: 250,
    registeredCount: 140,
    featured: false,
    organizer: { name: 'KIIT E-Cell' },
    speakers: [
      { name: 'Rohan Patnaik', role: 'Angel investor' },
      { name: 'Nisha Kapoor', role: 'Principal, Banyan Capital' },
    ],
    agenda: [
      { time: '14:00', title: 'Doors open & networking' },
      { time: '14:30', title: 'Pitches: Round 1' },
      { time: '16:30', title: 'Pitches: Round 2' },
      { time: '18:00', title: 'Results & investor office hours' },
    ],
  },
  {
    title: 'Run for Green: Campus Marathon',
    tagline: '5K, 10K and half-marathon routes through a green campus.',
    shortDescription:
      'Lace up for 5K, 10K or 21K routes. Every registration plants a tree. Finisher medals and timing chips included.',
    description: `Run for Green is our annual community marathon. Choose a 5K fun run, a 10K challenge or the full half-marathon through tree-lined campus roads.

Every ticket plants a sapling with our forest partner, and every finisher gets a medal, an e-certificate and chip-timed results.

Warm-up with a Zumba session at 5:30 AM, and stay for the post-run breakfast and awards.`,
    category: 'Sports',
    tags: ['running', 'fitness', 'charity', 'outdoors'],
    coverImage: img('1452626038306-9aae5e071dd3'),
    startDate: at('2027-01-10T05:30'),
    endDate: at('2027-01-10T10:00'),
    mode: 'offline',
    venue: { name: 'KIIT Campus Ring Road', address: 'Start: Campus 6 Gate', city: 'Bhubaneswar', lat: 20.3527, lng: 85.8195 },
    price: 199,
    capacity: 1500,
    registeredCount: 960,
    featured: false,
    organizer: { name: 'Bhubaneswar Runners Club' },
    agenda: [
      { time: '05:30', title: 'Warm-up session' },
      { time: '06:00', title: 'Half-marathon flag-off' },
      { time: '06:30', title: '10K & 5K flag-off' },
      { time: '09:00', title: 'Breakfast & awards' },
    ],
  },
  {
    title: 'Pixel Clash: Esports Championship',
    tagline: '64 teams. 3 titles. One champion.',
    shortDescription:
      'A two-day LAN esports championship across tactical shooter, battle royale and football titles with a ₹2 lakh prize pool.',
    description: `Pixel Clash is the region's largest campus LAN tournament. Sixty-four teams battle across three titles on tournament-grade rigs, with live casting and a big-screen arena for spectators.

Day one runs group stages; day two brings playoffs and the grand finals under the lights. Spectator passes include access to the retro arcade zone, VR booths and cosplay contest.

Registration is per player — teams are formed on the tournament Discord after sign-up.`,
    category: 'Gaming',
    tags: ['esports', 'lan', 'tournament', 'prizes'],
    coverImage: img('1542751371-adc38448a05e'),
    startDate: at('2026-12-19T10:00'),
    endDate: at('2026-12-20T21:00'),
    mode: 'offline',
    venue: { name: 'Campus 25 Gaming Arena', address: 'KIIT University', city: 'Bhubaneswar', lat: 20.3646, lng: 85.8173 },
    price: 299,
    capacity: 512,
    registeredCount: 388,
    featured: true,
    organizer: { name: 'Pixel Guild Esports' },
    speakers: [
      { name: 'Karan Bhatia', role: 'Lead caster' },
      { name: 'Priya Nair', role: 'Tournament director' },
    ],
    agenda: [
      { time: 'Sat 10:00', title: 'Group stages begin' },
      { time: 'Sat 18:00', title: 'Cosplay contest' },
      { time: 'Sun 12:00', title: 'Playoffs' },
      { time: 'Sun 18:30', title: 'Grand finals & trophy ceremony' },
    ],
  },
  {
    title: 'Odissi & Beyond: Classical Dance Evening',
    tagline: 'Two thousand years of movement on one stage.',
    shortDescription:
      'An evening of Odissi, Kathak and contemporary fusion performances by acclaimed dancers and rising student troupes.',
    description: `Odissi & Beyond celebrates Odisha's classical dance heritage and the artists reimagining it today. The evening opens with a traditional Mangalacharan and moves through Kathak, contemporary fusion and a world-premiere collaboration between a classical guru and a street-dance crew.

A pre-show talk at 5:45 PM explains the mudras and stories behind each piece — perfect if you are new to classical dance.`,
    category: 'Arts',
    tags: ['dance', 'culture', 'odissi', 'performance'],
    coverImage: img('1503095396549-807759245b35'),
    startDate: at('2027-01-23T18:00'),
    endDate: at('2027-01-23T21:00'),
    mode: 'offline',
    venue: { name: 'Rabindra Mandap', address: 'Sachivalaya Marg', city: 'Bhubaneswar', lat: 20.2709, lng: 85.8378 },
    price: 0,
    capacity: 800,
    registeredCount: 512,
    featured: false,
    organizer: { name: 'Odisha Arts Council' },
  },
  {
    title: 'Street Food Carnival',
    tagline: '60 stalls, 12 cuisines and the city’s best chaat.',
    shortDescription:
      'A three-evening street-food carnival with 60 stalls, live cooking battles, local bands and a dessert-only lane.',
    description: `From dahibara-aloodum to momos, kathi rolls and Korean corn dogs — the Street Food Carnival brings sixty of the city's favourite vendors to one open-air ground.

Catch live "chef vs chef" cooking battles, vote for the best stall, and save room for the dessert lane. Entry is free; food is pay-as-you-go with UPI at every stall.`,
    category: 'Food',
    tags: ['food', 'carnival', 'family', 'free entry'],
    coverImage: img('1555939594-58d7cb561ad1'),
    startDate: at('2026-12-26T16:00'),
    endDate: at('2026-12-28T22:00'),
    mode: 'offline',
    venue: { name: 'Ekamra Haat', address: 'Madhusudan Nagar', city: 'Bhubaneswar', lat: 20.2848, lng: 85.8337 },
    price: 0,
    capacity: 5000,
    registeredCount: 2900,
    featured: false,
    organizer: { name: 'Foodies of Odisha' },
  },
  {
    title: 'Open Source Contribution Sprint',
    tagline: 'Your first merged pull request, guaranteed.',
    shortDescription:
      'A guided online sprint where maintainers pair you with beginner-friendly issues across 15 popular open-source projects.',
    description: `Open source can feel intimidating. This sprint fixes that. Maintainers from fifteen projects curate "good first issues", and mentors pair with you on Discord until your pull request is merged.

We'll start with a 30-minute crash course on forking, branching, writing good commit messages and opening a clean PR. Everyone who lands a PR gets a digital badge and a limited-edition sticker pack.`,
    category: 'Tech',
    tags: ['open source', 'git', 'github', 'beginner-friendly'],
    coverImage: img('1488590528505-98d2b5aba04b'),
    startDate: at('2026-11-29T11:00'),
    endDate: at('2026-11-29T19:00'),
    mode: 'online',
    venue: ONLINE,
    price: 0,
    capacity: 400,
    registeredCount: 231,
    featured: false,
    organizer: { name: 'OpenSauce Society' },
  },
  {
    title: 'Hardware Hacking: Build Your First IoT Device',
    tagline: 'Solder, flash and ship a Wi-Fi sensor in one day.',
    shortDescription:
      'A beginner hardware lab: solder a sensor board, flash firmware to an ESP32 and stream live data to a web dashboard.',
    description: `No hardware experience? No problem. In this full-day lab you'll assemble a Wi-Fi environmental sensor from a kit, learn safe soldering, flash firmware to an ESP32 and stream readings to a live dashboard.

The kit (worth ₹1,200) is yours to keep. Seats are limited to keep the mentor ratio at 1:6.`,
    category: 'Workshop',
    tags: ['iot', 'hardware', 'esp32', 'hands-on'],
    coverImage: img('1558618666-fcd25c85cd64'),
    startDate: at('2026-12-06T10:00'),
    endDate: at('2026-12-06T17:00'),
    mode: 'offline',
    venue: { name: 'School of Electronics Lab', address: 'Campus 12, KIIT', city: 'Bhubaneswar', lat: 20.3555, lng: 85.8217 },
    price: 499,
    capacity: 60,
    registeredCount: 54,
    featured: false,
    organizer: { name: 'Circuit Breakers Club' },
  },
  {
    title: 'Shutter Walk: Old Town Photography',
    tagline: 'Golden hour among thousand-year-old temples.',
    shortDescription:
      'A sunrise photo walk through Old Town’s temple lanes with pro photographers, followed by an editing session over chai.',
    description: `Join a small group of photographers for a sunrise walk through Bhubaneswar's Old Town — temple spires, ghats, bustling lanes and morning rituals.

Two professional photographers lead the walk with tips on composition, light and street portraiture. We finish with a mobile and Lightroom editing session over chai. Any camera works, including your phone.`,
    category: 'Arts',
    tags: ['photography', 'heritage', 'walk', 'outdoors'],
    coverImage: img('1452587925148-ce544e77e70d'),
    startDate: at('2026-12-13T06:00'),
    endDate: at('2026-12-13T09:30'),
    mode: 'offline',
    venue: { name: 'Bindusagar Lake, Old Town', address: 'Near Lingaraj Temple', city: 'Bhubaneswar', lat: 20.2395, lng: 85.8352 },
    price: 0,
    capacity: 80,
    registeredCount: 47,
    featured: false,
    organizer: { name: 'Lens & Light Collective' },
  },
  {
    title: 'CyberSec CTF Night',
    tagline: 'Twelve hours. Forty challenges. Zero sleep.',
    shortDescription:
      'An overnight jeopardy-style capture-the-flag with web, crypto, forensics and reversing challenges for every skill level.',
    description: `Test your skills in an overnight capture-the-flag. Forty challenges span web exploitation, cryptography, forensics, OSINT and reverse engineering — from "first flag in 5 minutes" warm-ups to brain-melting finals.

Play solo or in teams of three. A live scoreboard, hint system and post-event write-ups make it a great place to learn.`,
    category: 'Tech',
    tags: ['security', 'ctf', 'competition', 'online'],
    coverImage: img('1550751827-4bd374c3f58b'),
    startDate: at('2027-01-16T20:00'),
    endDate: at('2027-01-17T08:00'),
    mode: 'online',
    venue: ONLINE,
    price: 0,
    capacity: 1000,
    registeredCount: 523,
    featured: false,
    organizer: { name: 'SecOps Guild' },
  },
  {
    title: 'Inter-College Basketball Finals',
    tagline: 'Eight colleges. One court. Championship night.',
    shortDescription:
      'Semi-finals and the championship game of the inter-college basketball league, with live DJ, halftime contests and food stalls.',
    description: `After eight weeks of league play, the top four colleges meet for championship night. Expect packed stands, a live DJ, halftime three-point contests and a dunk showcase.

Wear your college colours — the loudest section wins a pizza party.`,
    category: 'Sports',
    tags: ['basketball', 'league', 'finals'],
    coverImage: img('1546519638-68e109498ffc'),
    startDate: at('2027-02-06T16:00'),
    endDate: at('2027-02-06T21:00'),
    mode: 'offline',
    venue: { name: 'KIIT Indoor Stadium', address: 'Campus 3, KIIT', city: 'Bhubaneswar', lat: 20.3501, lng: 85.8183 },
    price: 99,
    capacity: 2000,
    registeredCount: 740,
    featured: false,
    organizer: { name: 'Hoopers Association' },
  },
  {
    title: 'Holi Hues: Colours & Beats',
    tagline: 'Organic colours, rain dance and a live dhol line-up.',
    shortDescription:
      'Celebrate Holi with organic colours, a rain-dance zone, live dhol and DJ sets, thandai bar and festive street food.',
    description: `Holi Hues is a celebration of colour, music and community. Every ticket includes a pack of skin-safe organic colours, entry to the rain-dance zone and unlimited thandai.

Live dhol players kick things off, followed by Bollywood, bhangra and electronic DJ sets. Lockers and changing rooms are available on site.`,
    category: 'Music',
    tags: ['holi', 'festival', 'dance', 'outdoors'],
    coverImage: img('1496024840928-4c417adf211d'),
    startDate: at('2027-03-22T10:00'),
    endDate: at('2027-03-22T16:00'),
    mode: 'offline',
    venue: { name: 'Janata Maidan', address: 'Unit 4', city: 'Bhubaneswar', lat: 20.2851, lng: 85.8228 },
    price: 349,
    capacity: 4000,
    registeredCount: 1320,
    featured: true,
    organizer: { name: 'Hues Collective' },
  },
  {
    title: 'Product Management Bootcamp',
    tagline: 'From user problem to roadmap in a weekend.',
    shortDescription:
      'A two-day intensive on discovery, prioritisation, metrics and roadmapping, taught by PMs from India’s fastest-growing startups.',
    description: `Thinking about a career in product? This weekend bootcamp covers the full PM loop: user interviews, problem framing, prioritisation frameworks, writing PRDs, defining metrics and presenting a roadmap.

You'll work in small groups on a real case study and present to a panel of product leaders on Sunday afternoon. Includes lunch, templates and a certificate.`,
    category: 'Business',
    tags: ['product', 'career', 'bootcamp'],
    coverImage: img('1542744173-8e7e53415bb0'),
    startDate: at('2027-02-13T10:00'),
    endDate: at('2027-02-14T17:00'),
    mode: 'offline',
    venue: { name: 'Residency Road Co-working Hub', address: 'Residency Road', city: 'Bengaluru', lat: 12.9667, lng: 77.606 },
    price: 2499,
    capacity: 120,
    registeredCount: 76,
    featured: false,
    organizer: { name: 'ProductCraft India' },
  },
  {
    title: 'Literature & Ideas Fest',
    tagline: 'Three days of books, debates and big ideas.',
    shortDescription:
      'Author conversations, poetry slams, debate finals and a book fair with 40 publishers across three days.',
    description: `The Literature & Ideas Fest brings together novelists, poets, journalists and thinkers for three days of conversation. Highlights include an Odia poetry slam, an inter-college debate final and a translators' roundtable.

Browse a forty-publisher book fair, get your books signed and join writing workshops for every level.`,
    category: 'Arts',
    tags: ['books', 'literature', 'debate', 'poetry'],
    coverImage: img('1532012197267-da84d127e765'),
    startDate: at('2027-02-19T10:00'),
    endDate: at('2027-02-21T19:00'),
    mode: 'offline',
    venue: { name: 'KIIT Convention Centre', address: 'Campus 6, KIIT', city: 'Bhubaneswar', lat: 20.3534, lng: 85.8199 },
    price: 0,
    capacity: 1500,
    registeredCount: 615,
    featured: false,
    organizer: { name: 'Ink & Ideas Society' },
  },
  {
    title: 'Immersive Tech Expo: VR & AR',
    tagline: 'Step inside the next computing platform.',
    shortDescription:
      'Try 50+ VR, AR and mixed-reality demos, from medical training sims to multiplayer games, plus talks from XR studios.',
    description: `The Immersive Tech Expo is a playground for the future of computing. Try more than fifty headset demos, explore mixed-reality art installations and see how XR is being used in healthcare, education and manufacturing.

Developer talks cover building for spatial computing, performance on mobile headsets and designing comfortable experiences.`,
    category: 'Tech',
    tags: ['vr', 'ar', 'expo', 'xr'],
    coverImage: img('1593508512255-86ab42a8e620'),
    startDate: at('2027-03-06T10:00'),
    endDate: at('2027-03-07T18:00'),
    mode: 'offline',
    venue: { name: 'HITEX Exhibition Centre', address: 'Izzat Nagar, Madhapur', city: 'Hyderabad', lat: 17.4706, lng: 78.3776 },
    price: 599,
    capacity: 2500,
    registeredCount: 980,
    featured: false,
    organizer: { name: 'Immersive India' },
  },
  {
    title: 'Stand-up Night: Campus Edition',
    tagline: 'Six comics. Zero chill. All the hostel stories.',
    shortDescription:
      'A night of stand-up comedy with six comedians riffing on hostel life, exams and everything in between.',
    description: `Six of the funniest comics on the circuit take over the auditorium for a night of stand-up built for campus life — hostel food, attendance shortages, group projects and the eternal placement season.

Open mic slots are available for students: tick "organization" with "Open mic" when you register and we'll get in touch.`,
    category: 'Arts',
    tags: ['comedy', 'stand-up', 'night out'],
    coverImage: img('1475721027785-f74eccf877e2'),
    startDate: at('2027-01-30T19:00'),
    endDate: at('2027-01-30T21:30'),
    mode: 'offline',
    venue: KIIT,
    price: 249,
    capacity: 900,
    registeredCount: 433,
    featured: false,
    organizer: { name: 'Laugh Riot Collective' },
  },
  {
    title: 'Data Science Meetup: Analytics in Production',
    tagline: 'Dashboards are easy. Trustworthy data is not.',
    shortDescription:
      'An evening meetup with talks on data pipelines, experimentation and analytics engineering, plus pizza and networking.',
    description: `Join the city's data community for three lightning-fast talks on building analytics that people actually trust: modern data pipelines, A/B testing done right and analytics engineering with dbt.

Stay for pizza, job board shout-outs and networking with data folks from startups and enterprises.`,
    category: 'Tech',
    tags: ['data science', 'analytics', 'meetup'],
    coverImage: img('1551288049-bebda4e38f71'),
    startDate: at('2026-12-03T18:00'),
    endDate: at('2026-12-03T21:00'),
    mode: 'offline',
    venue: { name: 'Infocity Co-working Hub', address: 'Infocity, Patia', city: 'Bhubaneswar', lat: 20.3444, lng: 85.8063 },
    price: 0,
    capacity: 150,
    registeredCount: 98,
    featured: false,
    organizer: { name: 'DataNerds Bhubaneswar' },
  },
  {
    title: 'Plating & Food Photography Masterclass',
    tagline: 'Make every plate look like a magazine cover.',
    shortDescription:
      'Learn restaurant-style plating and food photography with a chef and a food stylist — tasting session included.',
    description: `Learn the secrets behind magazine-worthy food. A professional chef teaches plating techniques with sauces, textures and colour, while a food stylist shows how to light and shoot your creations with just a phone.

Includes all ingredients, a tasting session and a printed recipe booklet. Limited to 40 participants.`,
    category: 'Food',
    tags: ['cooking', 'photography', 'masterclass'],
    coverImage: img('1504674900247-0877df9cc836'),
    startDate: at('2027-01-09T11:00'),
    endDate: at('2027-01-09T15:00'),
    mode: 'offline',
    venue: { name: 'The Studio Kitchen', address: 'Saheed Nagar', city: 'Bhubaneswar', lat: 20.2915, lng: 85.8456 },
    price: 899,
    capacity: 40,
    registeredCount: 40,
    featured: false,
    organizer: { name: 'Foodies of Odisha' },
  },
  {
    title: 'Community Volunteering Day',
    tagline: 'Spend a Sunday making your city better.',
    shortDescription:
      'Join 300 volunteers for beach clean-ups, school mural painting and a food drive — breakfast and t-shirts provided.',
    description: `Pick a project and spend a morning giving back: a beach clean-up at Chandrabhaga, a mural-painting day at a government school, or sorting donations for a city food bank.

Transport from campus, breakfast, gloves and a volunteer t-shirt are provided. Volunteers receive a certificate of service.`,
    category: 'Community',
    tags: ['volunteering', 'social impact', 'outdoors'],
    coverImage: img('1529156069898-49953e39b3ac'),
    startDate: at('2027-01-17T07:00'),
    endDate: at('2027-01-17T13:00'),
    mode: 'offline',
    venue: { name: 'Chandrabhaga Beach', address: 'Konark', city: 'Puri', lat: 19.8655, lng: 86.1014 },
    price: 0,
    capacity: 300,
    registeredCount: 164,
    featured: false,
    organizer: { name: 'Summit Community' },
  },
  // ── Past events (shown under the "Past" filter) ───────────────────────────
  {
    title: "Freshers' Welcome Bash 2026",
    tagline: 'Welcome to the best four years of your life.',
    shortDescription:
      'The official welcome party for the class of 2030 — live band, DJ night, club stalls and a fireworks finale.',
    description: `The Freshers' Welcome Bash kicked off the academic year with club showcases, a live band, a DJ night and a fireworks finale. Thanks to everyone who came — see you next year!`,
    category: 'Community',
    tags: ['party', 'freshers', 'campus'],
    coverImage: img('1492684223066-81342ee5ff30'),
    startDate: at('2026-10-10T17:00'),
    endDate: at('2026-10-10T23:00'),
    mode: 'offline',
    venue: { name: 'Campus 6 Open Air Theatre', address: 'KIIT University', city: 'Bhubaneswar', lat: 20.3534, lng: 85.8199 },
    price: 0,
    capacity: 2000,
    registeredCount: 2000,
    featured: false,
    organizer: { name: 'KIIT Student Activity Centre' },
  },
  {
    title: 'Cloud Native Day',
    tagline: 'Kubernetes, platform engineering and everything in between.',
    shortDescription:
      'A one-day conference on containers, Kubernetes, observability and platform engineering with hands-on labs.',
    description: `Cloud Native Day brought together platform engineers and SREs for talks on Kubernetes at scale, observability, GitOps and developer platforms. Slides and recordings are available to registered attendees.`,
    category: 'Tech',
    tags: ['cloud', 'kubernetes', 'devops'],
    coverImage: img('1540575467063-178a50c2df87'),
    startDate: at('2026-10-24T09:30'),
    endDate: at('2026-10-24T17:30'),
    mode: 'offline',
    venue: { name: 'Hotel Mayfair Convention', address: 'Jayadev Vihar', city: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
    price: 499,
    capacity: 500,
    registeredCount: 468,
    featured: false,
    organizer: { name: 'Cloud Native Odisha' },
  },
];

/** FAQs appended to any event that doesn't define its own. */
export const defaultFaqs = [
  { q: 'How do I receive my ticket?', a: 'Your QR ticket is generated instantly after registration and saved under My Tickets on this device.' },
  { q: 'Can I cancel my registration?', a: 'Yes. Open My Tickets and cancel any time before the event — your seat is released for someone else.' },
  { q: 'Do I need to print my ticket?', a: 'No. Show the QR code on your phone at the entrance, or download it as an image.' },
];
