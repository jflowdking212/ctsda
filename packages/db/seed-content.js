const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const destImages = {
  roadSafety: '/images/blog_road_safety.png',
  instructor: '/images/blog_instructor_training.png',
  inspection: '/images/blog_vehicle_inspection.png'
};

const blogs = [
  {
    title: 'Top 10 Road Safety Tips Every Commercial Driver Must Know',
    slug: 'top-10-road-safety-tips',
    excerpt: 'Road safety is not optional — it is the professional foundation of every driver\'s career. This comprehensive guide covers the ten most critical safety practices that reduce accidents, save lives, and keep commercial drivers compliant with federal regulations.',
    publishedAt: new Date('2026-07-10'),
    isPublished: true,
    featuredImg: destImages.roadSafety,
    content: `
<p class="lead">Commercial driving is one of the most safety-critical professions in the world. In the United States alone, large trucks and buses are involved in thousands of fatal crashes every year. The difference between a safe driver and a statistic is preparation, awareness, and the consistent application of proven safety practices.</p>

<p>At the CTSDA, our mission is to ensure that every professional driver is equipped with the knowledge and habits that protect not only themselves, but every person sharing the road. Here are ten essential road safety tips drawn from industry research, federal guidelines, and real-world experience.</p>

<hr class="section-divider" />

<h2>1. Always Conduct a Thorough Pre-Trip Inspection</h2>
<p>Federal Motor Carrier Safety Administration (FMCSA) regulations require commercial drivers to conduct a systematic pre-trip inspection before every journey. This is not a bureaucratic checkbox — it is your first and most powerful line of defense against mechanical failure on the road.</p>
<p>A thorough inspection should cover:</p>
<ul>
  <li><strong>Brakes</strong> — inspect brake lines, chambers, slack adjusters, and drums for wear or leaks</li>
  <li><strong>Tires</strong> — check tread depth (minimum 4/32" on steer axles), inflation pressure, and sidewall condition</li>
  <li><strong>Lights and reflectors</strong> — test all headlights, brake lights, turn signals, and emergency flashers</li>
  <li><strong>Coupling devices</strong> — ensure fifth wheel, kingpin, and safety chains are secure on tractor-trailer combinations</li>
  <li><strong>Cargo securement</strong> — verify load is balanced, within weight limits, and properly tied or chained</li>
  <li><strong>Fluid levels</strong> — engine oil, coolant, power steering, and windshield washer</li>
</ul>
<blockquote><p>"A vehicle defect found during a pre-trip inspection can be corrected. A defect found by a roadside inspector results in an out-of-service order. A defect found in a crash report is a tragedy." — FMCSA Training Manual</p></blockquote>

<h2>2. Manage Fatigue Proactively — Hours of Service Are Minimums, Not Targets</h2>
<p>Driver fatigue is one of the leading contributors to commercial vehicle crashes. FMCSA Hours of Service (HOS) rules set the maximum allowable driving hours — but every experienced professional knows that legal and safe are not always the same thing.</p>
<p>Research shows that driving after 18 consecutive hours awake is the cognitive equivalent of driving with a blood-alcohol content of 0.08%. Key practices to combat fatigue include:</p>
<ul>
  <li>Prioritise 7–8 hours of quality sleep before a shift, not just rest time in a sleeper berth</li>
  <li>Recognize early warning signs: frequent yawning, lane drift, difficulty focusing, and slowed reaction time</li>
  <li>Take 30-minute breaks before you feel tired — not after</li>
  <li>Avoid driving during your body's natural circadian low points (2–5 AM and 2–5 PM)</li>
  <li>Never use caffeine or stimulants as a substitute for sleep</li>
</ul>

<h2>3. Maintain a Safe Following Distance at All Times</h2>
<p>A fully loaded Class 8 truck traveling at 65 mph requires approximately <strong>525 feet</strong> — nearly two full football fields — to come to a complete stop. This dramatically exceeds the stopping distance of the passenger vehicles ahead of you.</p>
<p>The Commercial Vehicle Safety Alliance recommends a minimum following distance of one second for every ten feet of vehicle length, plus one additional second if travelling above 40 mph. For a 60-foot truck, that means a minimum of seven seconds of following distance.</p>

<h2>4. Eliminate Distractions — The Law and Your Life Depend On It</h2>
<p>Federal regulations prohibit commercial drivers from texting or using a handheld mobile phone while operating a CMV. Violations carry fines of up to $2,750 per offence for drivers and $11,000 per offence for employers who knowingly allow the behaviour.</p>
<p>But distraction goes beyond phones. Eating, adjusting GPS, looking at maps, and even extended conversation with passengers all divert critical attention. At 65 mph, looking away from the road for just three seconds means travelling the length of a basketball court completely blind.</p>

<h2>5. Adjust Your Driving for Adverse Weather Conditions</h2>
<p>No schedule is worth risking your life or the lives of others. When conditions are poor, the only responsible response is to slow down significantly — or stop. Recommendations by condition:</p>
<ul>
  <li><strong>Rain</strong>: Reduce speed by 1/3 and double your following distance. Watch for hydroplaning on bridges and shaded areas.</li>
  <li><strong>Snow and ice</strong>: Reduce speed by 1/2 or more. Brake gently and early; jackknifing is a constant risk on slippery surfaces.</li>
  <li><strong>Fog</strong>: Use low-beam headlights, slow down, use the fog line as a guide, and pull off at a safe area if visibility drops below 300 feet.</li>
  <li><strong>High winds</strong>: Be especially cautious when driving empty or lightly loaded — high-sided vehicles are extremely vulnerable to crosswinds on bridges and open highways.</li>
</ul>

<h2>6. Master Mirror Use and Manage Blind Spots Aggressively</h2>
<p>A standard tractor-trailer has blind spots — called "No-Zones" — that can conceal an entire passenger car. These are located directly in front of the cab, directly behind the trailer, and on both sides extending backward from the mirrors.</p>
<p>Best practices include scanning mirrors every 5–8 seconds, always checking before lane changes, and being aware that if you cannot see a driver in your mirror, they cannot see you.</p>

<h2>7. Practice Defensive Driving as a Default Mode</h2>
<p>Defensive driving means anticipating the mistakes of others and positioning your vehicle to manage those mistakes safely. Assume that every car around you might brake suddenly, change lanes without signaling, or run a red light. This mindset saves lives.</p>
<p>Key principles: maintain space cushions in all directions, position your vehicle for maximum visibility, never drive at the edge of your abilities, and be patient — no delivery schedule is worth an accident.</p>

<h2>8. Know and Respect Compliance Regulations</h2>
<p>Professional commercial drivers are subject to a complex framework of federal and state regulations including weight limits, hours of service, drug and alcohol testing (under 49 CFR Part 382), hazardous materials requirements, and vehicle maintenance standards. Staying compliant is not optional — non-compliance risks fines, licence suspensions, and criminal liability.</p>

<h2>9. Secure Every Load — Cargo Shifts Kill</h2>
<p>Unsecured or improperly secured cargo is a leading cause of both single-vehicle and multi-vehicle crashes. Under FMCSA regulations (49 CFR Part 393), all cargo must be secured to prevent shifting, falling, or leaking. Regular mid-trip checks of load securement are mandatory for many cargo types.</p>

<h2>10. Maintain Physical and Mental Wellbeing</h2>
<p>Your CDL is also a health commitment. Commercial drivers must pass DOT medical examinations and maintain the physical and mental fitness to operate safely. This means managing chronic conditions, maintaining a healthy weight (obesity significantly increases crash risk due to sleep apnoea), limiting alcohol consumption, and seeking mental health support when needed. Driving is cognitively demanding; your body and mind are your most important professional assets.</p>

<hr class="section-divider" />

<h2>Conclusion</h2>
<p>Road safety for commercial drivers is not a set of rules imposed from outside — it is a professional ethic that defines the culture of every great carrier, every accredited school, and every driver who takes pride in their work. The CTSDA exists to support, accredit, and promote organisations that embed these principles into their DNA.</p>
<p>If you operate a driver training school and want to demonstrate your commitment to the highest safety standards, <a href="/portal/register">apply for CTSDA accreditation today</a>.</p>
    `,
  },
  {
    title: 'How to Choose the Right Driving Instructor: A Complete Guide',
    slug: 'how-to-choose-driving-instructor',
    excerpt: 'The quality of your driving instructor shapes not just your test result — it shapes your driving habits for life. This guide walks you through exactly what to look for, what questions to ask, and what red flags to avoid when selecting a professional driving instructor.',
    publishedAt: new Date('2026-07-14'),
    isPublished: true,
    featuredImg: destImages.instructor,
    content: `
<p class="lead">Choosing a driving instructor is one of the most consequential decisions a new driver — or a professional seeking to advance their skills — will make. The instructor who sits beside you during your formative hours behind the wheel will either build habits that protect you for decades or embed errors that put you and others at risk.</p>

<p>This guide is written for individuals seeking quality instruction, for parents researching schools for their children, and for employers evaluating training providers. It draws on CTSDA accreditation standards and decades of industry experience to give you a clear, practical framework.</p>

<hr class="section-divider" />

<h2>Why the Right Instructor Matters More Than You Think</h2>
<p>Driving instruction is a teaching profession, not just a supervision role. Research consistently shows that driver behaviour patterns established in the first 50 hours of driving experience are extraordinarily difficult to change later. Poor technique, risk tolerance, and decision-making habits formed during training persist for years — sometimes for life.</p>
<p>This is why the professional quality of the instructor, not just the price of the course, must be the central criterion in your decision.</p>

<h2>Step 1: Verify Credentials and Licensing</h2>
<p>Before considering any other factors, confirm that the instructor holds all required licences and certifications for your jurisdiction. In the United States, requirements vary by state but typically include:</p>
<ul>
  <li>A valid, full driving licence with a clean record (typically zero points or a maximum threshold)</li>
  <li>A background check clearance, especially for instructors working with minors</li>
  <li>State-issued driving instructor certification or a professional driving instructor (PDI) credential</li>
  <li>For commercial vehicle instruction: appropriate CDL class with relevant endorsements (T, P, X, N, etc.)</li>
  <li>Affiliation with an accredited driving school</li>
</ul>
<blockquote><p>CTSDA-accredited schools are independently verified to meet rigorous standards covering instructor qualifications, curriculum quality, vehicle maintenance, and student outcomes. Always ask if a school holds CTSDA accreditation or equivalent third-party certification.</p></blockquote>

<h2>Step 2: Assess Teaching Methodology</h2>
<p>There is a profound difference between an instructor who grabs the wheel and an instructor who teaches. The best instructors use a structured, evidence-based teaching methodology known as the GDE (Goals for Driver Education) framework, which progressively develops:</p>
<ul>
  <li><strong>Vehicle handling skills</strong> — the mechanics of controlling the vehicle</li>
  <li><strong>Mastery of traffic situations</strong> — reading and responding to road environments</li>
  <li><strong>Journey planning and execution</strong> — route planning, risk assessment, and adapting to circumstances</li>
  <li><strong>Personal goals and risk awareness</strong> — understanding one's own risk attitudes and how they affect driving behaviour</li>
</ul>
<p>Ask prospective instructors to describe their teaching approach. If they cannot articulate a method beyond "I'll show you how to do it," consider that a warning sign.</p>

<h2>Step 3: Evaluate the School's Record and Reputation</h2>
<p>Data matters. When evaluating a driving school, request the following information:</p>
<ul>
  <li>First-time pass rate for practical tests</li>
  <li>Average number of hours required to reach test standard</li>
  <li>Number of students trained per year</li>
  <li>Number of complaints filed with the state licensing authority</li>
  <li>Reviews from former students on verifiable platforms (Google, Yelp, BBB)</li>
</ul>
<p>Be sceptical of schools that cannot or will not provide pass rate data. Reputable schools are proud of their outcomes and transparent about their performance.</p>

<h2>Step 4: Inspect the Training Vehicles</h2>
<p>A professional school invests in its fleet. Training vehicles should be:</p>
<ul>
  <li>Well-maintained with current MOT/inspection certificates</li>
  <li>Equipped with dual controls (instructor-side pedals) — this is mandatory for safety</li>
  <li>Clean and professional in presentation — a school's vehicles reflect its standards</li>
  <li>Appropriate to the licence class being pursued (e.g., actual CDL-eligible trucks for commercial training)</li>
</ul>

<h2>Step 5: Take a Trial Lesson</h2>
<p>Most reputable schools offer an introductory lesson at a reduced rate. This is not just a sales tactic — it is an essential opportunity to evaluate whether the instructor is patient, articulate, encouraging, and genuinely focused on your development as a driver.</p>
<p>During your trial lesson, consider:</p>
<ul>
  <li>Does the instructor explain the reasoning behind instructions, or just give commands?</li>
  <li>Do they respond calmly to mistakes, or with frustration?</li>
  <li>Do they check in on your understanding, or assume you've absorbed everything?</li>
  <li>Do they maintain professional conduct throughout?</li>
</ul>

<h2>Red Flags to Watch For</h2>
<p>The following should raise serious concerns about any school or instructor:</p>
<ul>
  <li>Reluctance to provide credentials or licence numbers</li>
  <li>No dual-control vehicle</li>
  <li>Unusually low prices with no clear explanation (quality instruction costs money to deliver)</li>
  <li>Pressure to purchase large lesson packages upfront before a trial lesson</li>
  <li>Negative reviews citing unsafe behaviour, aggression, or unprofessionalism</li>
  <li>No formal curriculum or syllabus provided</li>
</ul>

<h2>A Note on CTSDA Accreditation</h2>
<p>The CTSDA accreditation programme exists precisely to solve the problem of quality assurance in driver education. Our rigorous, independent assessment process evaluates every dimension of a training school's operation — from instructor qualifications and vehicle standards to curriculum content and student outcomes.</p>
<p>When you see the CTSDA accreditation mark, you can be confident that the school has been independently verified to meet a high professional standard. <a href="/directory">Search our directory of accredited schools</a> to find a verified training provider in your area.</p>

<hr class="section-divider" />

<h2>Conclusion</h2>
<p>The right driving instructor is worth every penny. The wrong one can create habits that put lives at risk for decades. Use the framework in this guide to make an informed, confident decision — and always choose accredited.</p>
    `,
  },
  {
    title: 'Commercial Vehicle Inspections: Why They Save Lives and What Drivers Must Know',
    slug: 'importance-of-vehicle-inspections',
    excerpt: 'Mechanical failure is responsible for a significant proportion of commercial vehicle crashes every year. This article explains the federal inspection framework, what drivers are legally required to do, and how a culture of inspection excellence differentiates the best fleets and training schools.',
    publishedAt: new Date('2026-07-18'),
    isPublished: true,
    featuredImg: destImages.inspection,
    content: `
<p class="lead">Every commercial vehicle on the road is a potential hazard if not properly maintained. A tyre blowout at 70 mph, a brake failure on a steep grade, or a lighting fault that makes a trailer invisible to following traffic — these are not rare edge cases. They are documented, recurring causes of crashes that injure and kill thousands of road users every year.</p>

<p>Vehicle inspection is the systematic practice that prevents these outcomes. For commercial drivers, it is also a legal requirement. For professional training schools, it is a core component of the curriculum. And for any driver who takes their responsibilities seriously, it is simply the right thing to do.</p>

<hr class="section-divider" />

<h2>The Legal Framework: What Federal Law Requires</h2>
<p>The Federal Motor Carrier Safety Administration (FMCSA) establishes mandatory inspection requirements for all commercial motor vehicles (CMVs) under 49 CFR Part 396. Key provisions include:</p>
<ul>
  <li><strong>Pre-trip inspection (396.13)</strong>: Drivers must satisfy themselves that the vehicle is in safe operating condition before every trip, reviewing the previous driver vehicle inspection report (DVIR)</li>
  <li><strong>Post-trip inspection (396.11)</strong>: Drivers must complete a written DVIR at the end of every day of operation, reporting any defects or deficiencies</li>
  <li><strong>Periodic inspections (396.17)</strong>: Every CMV must be inspected at least once every 12 months by a qualified inspector to a standard defined by federal regulation</li>
  <li><strong>Roadside inspections</strong>: Commercial vehicles are subject to inspection by CVSA-certified inspectors at any point. Vehicles that fail an inspection may be placed out of service until defects are corrected</li>
</ul>
<blockquote><p>In 2023, the CVSA's Operation Safe Driver Week and roadside inspection blitzes resulted in more than 15,000 out-of-service orders for vehicle defects — defects that could have caused crashes if not caught. Every one of those vehicles had been operated by a driver who either did not inspect properly, or did not act on what they found.</p></blockquote>

<h2>What a Professional Pre-Trip Inspection Covers</h2>
<p>A compliant, thorough pre-trip inspection follows a systematic walk-around of the vehicle. Drivers should approach this with the same discipline as a pilot's pre-flight checklist. The following areas must be inspected:</p>

<h3>Engine Compartment</h3>
<ul>
  <li>Engine oil level and condition</li>
  <li>Coolant level and hoses for leaks or cracks</li>
  <li>Power steering fluid</li>
  <li>Windshield washer fluid</li>
  <li>Belts for fraying, looseness, or glazing</li>
  <li>Battery terminals and fluid (where accessible)</li>
</ul>

<h3>Cab and Controls</h3>
<ul>
  <li>Horn (both city and air, where applicable)</li>
  <li>Windshield and mirrors — no cracks larger than allowable limits, properly adjusted</li>
  <li>Wipers and washers functional</li>
  <li>Gauges and warning lights — all operational, no warning lights active</li>
  <li>Seatbelt condition and retractor function</li>
  <li>Emergency equipment: fire extinguisher, warning triangles, first aid kit</li>
</ul>

<h3>Braking System</h3>
<p>Brake failure is one of the most catastrophic mechanical events a driver can experience. Inspection must include:</p>
<ul>
  <li>Air pressure build-up rate (should reach 90 psi within 3 minutes at operating RPM)</li>
  <li>Low pressure warning alarm activates above 60 psi</li>
  <li>Brake pedal feel and travel (not spongy, not low)</li>
  <li>Parking brake holds vehicle on a grade</li>
  <li>Visible brake components: drums/rotors for heat cracks, linings for wear, hoses for abrasion</li>
  <li>For combination vehicles: trailer brake supply and control lines inspected for security and condition</li>
</ul>

<h3>Tyres and Wheels</h3>
<ul>
  <li>Tread depth: minimum 4/32" on steering axle tyres; minimum 2/32" on all other tyres</li>
  <li>Tyre pressure checked with calibrated gauge</li>
  <li>No sidewall cuts, bubbles, or exposed cord</li>
  <li>No mismatched tyre sizes on same axle</li>
  <li>All lug nuts/bolts present, showing no signs of movement (rust trails, shine marks)</li>
  <li>Hub seals with no oil leaks</li>
</ul>

<h3>Lights and Signals</h3>
<ul>
  <li>All headlights (low and high beam)</li>
  <li>Brake lights and reverse lights</li>
  <li>Turn signals front and rear</li>
  <li>Hazard flashers</li>
  <li>Clearance, identification, and marker lights</li>
  <li>Reflectors clean and undamaged</li>
</ul>

<h2>Why Drivers Skip Inspections — And Why That's Dangerous</h2>
<p>The most common reasons drivers fail to conduct thorough pre-trip inspections are time pressure, fatigue, and familiarity bias ("I drove this truck yesterday, it was fine"). All three are understandable — and all three are professionally unacceptable.</p>
<p>A component can fail overnight. A tyre can lose pressure in a trailer sitting in the yard. A brake adjustment can change during the previous day's operation. The inspection exists precisely because conditions change between trips.</p>

<h2>Inspection as Part of Training Excellence</h2>
<p>The CTSDA accreditation standard requires that all accredited commercial driver training schools include systematic, practical vehicle inspection training as a core curriculum component — not an afterthought. Schools must demonstrate that students can conduct a thorough pre-trip and post-trip inspection to FMCSA standards before graduation.</p>
<p>This commitment to inspection training is one of the measurable differentiators between CTSDA-accredited schools and those operating without independent quality assurance. When employers hire graduates of CTSDA-accredited schools, they can be confident that inspection habits have been properly instilled.</p>

<h2>Building a Culture of Inspection Excellence</h2>
<p>The best fleets do not treat vehicle inspection as a compliance exercise — they treat it as a professional ethic. Safety-conscious carriers create systems that:</p>
<ul>
  <li>Allocate sufficient time in dispatch schedules for proper pre-trip inspection</li>
  <li>Reward and recognise drivers who identify and report defects</li>
  <li>Never pressure drivers to operate vehicles with known defects</li>
  <li>Maintain clear, rapid defect resolution processes so drivers are not waiting days for repairs</li>
  <li>Conduct annual refresher training on inspection procedures for experienced drivers</li>
</ul>

<hr class="section-divider" />

<h2>Conclusion</h2>
<p>Vehicle inspection is not an administrative burden — it is a professional practice that saves lives. The difference between a driver who walks around their vehicle every morning with genuine attention and one who signs a form without looking is, at some point, the difference between going home and not going home.</p>
<p>If you represent a training organisation that is serious about inspection culture and professional standards, we invite you to learn more about <a href="/accreditation-info">CTSDA accreditation</a> and the difference independent verification makes.</p>
    `,
  },
];

async function main() {
  console.log('Copying images to public directory...');
  const webPublicImagesDir = path.join(__dirname, '../../apps/web/public/images');
  if (!fs.existsSync(webPublicImagesDir)) {
    fs.mkdirSync(webPublicImagesDir, { recursive: true });
  }

  const srcImages = {
    roadSafety: 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\68e79c38-2f00-4fc1-bd45-1f3a26457ed4\\blog_road_safety_1784612704612.png',
    instructor: 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\68e79c38-2f00-4fc1-bd45-1f3a26457ed4\\blog_instructor_training_1784612724086.png',
    inspection: 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\68e79c38-2f00-4fc1-bd45-1f3a26457ed4\\blog_vehicle_inspection_1784612736963.png'
  };

  for (const [key, src] of Object.entries(srcImages)) {
    if (fs.existsSync(src)) {
      const destPath = path.join(webPublicImagesDir, path.basename(destImages[key]));
      fs.copyFileSync(src, destPath);
      console.log(`Copied ${key} image.`);
    }
  }

  console.log('Seeding blog posts...');
  const admin = await prisma.user.findFirst();
  if (!admin) { console.log('No user found.'); return; }

  await prisma.blogPost.deleteMany({});

  for (const blog of blogs) {
    await prisma.blogPost.create({ data: { ...blog, authorId: admin.id } });
    console.log(`  Created: ${blog.title}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
