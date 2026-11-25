import type { PassageInput } from "./types";

/** Original passages written for Lumen. Science, technology and business. */
export const libraryA: PassageInput[] = [
  {
    slug: "why-we-sleep-in-cycles",
    title: "Why We Sleep in Cycles",
    category: "science",
    difficulty: 1,
    summary: "Your brain moves through repeating stages every night — and each one has a job.",
    body: `Sleep feels like a single, continuous stretch of darkness, but your brain is surprisingly busy through the night. Instead of switching off, it moves through a repeating sequence of stages, each with its own pattern of activity and its own job to do.

Scientists divide sleep into two broad types. Non-rapid eye movement sleep, usually called non-REM sleep, includes the lighter stages that begin the night and the deep, slow-wave sleep that follows. During deep sleep, brain waves become slow and large, breathing steadies, and the body turns its attention to repair. It is hardest to wake someone from this stage, and if you do, they often feel groggy and confused for a few minutes.

The second type is rapid eye movement, or REM, sleep. Here the brain becomes highly active, almost as active as when you are awake. The eyes dart beneath closed lids, and most vivid dreaming happens. At the same time, the muscles of the arms and legs are temporarily relaxed to the point of near paralysis, which is why we do not usually act out our dreams.

A full cycle through these stages lasts roughly ninety minutes, though it can range from about seventy to more than one hundred minutes. Most adults complete four to six cycles in a night. The cycles are not identical. Early in the night, deep sleep takes up a large share of each cycle. Toward morning, deep sleep shrinks and REM periods grow longer. This is one reason why cutting sleep short by waking very early tends to steal REM sleep in particular.

Both types of sleep appear to matter for learning. Research suggests that deep sleep helps stabilize new memories of facts and events, while REM sleep seems to support emotional processing and the linking of ideas in new ways. People who sleep after studying often remember more than those who stay awake for the same amount of time.

The practical lesson is simple. Most adults need at least seven hours of sleep for good health, and a regular schedule helps the cycles run smoothly. If you want to remember what you read today, the night ahead is part of the work.`,
    questions: [
      {
        q: "About how long does a typical sleep cycle last?",
        options: ["About 30 minutes", "About 90 minutes", "About 3 hours", "About 5 hours"],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Which kind of sleep grows longer toward the morning?",
        options: ["Deep, slow-wave sleep", "The lightest non-REM stage", "REM sleep", "All stages stay equal"],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Why do people rarely act out their dreams?",
        options: [
          "The muscles of the arms and legs are temporarily relaxed",
          "Dreams only happen during deep sleep",
          "The brain is almost inactive while dreaming",
          "The eyes stay completely still",
        ],
        answer: 0,
        kind: "detail",
      },
      {
        q: "What would the author most likely say about waking up very early after a late night?",
        options: [
          "It mostly reduces deep sleep",
          "It adds an extra cycle",
          "It improves memory of the previous day",
          "It tends to cut into REM sleep",
        ],
        answer: 3,
        kind: "inference",
      },
      {
        q: "What is the main idea of the passage?",
        options: [
          "Dreams are the most important part of sleep",
          "Sleep is an active, cyclical process that supports health and learning",
          "Most adults should sleep less than seven hours",
          "Deep sleep and REM sleep are the same thing",
        ],
        answer: 1,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Sleep repeats in cycles of roughly 90 minutes.",
      "Deep sleep dominates early in the night; REM grows toward morning.",
      "Deep sleep stabilizes memories; REM supports emotional processing and linking ideas.",
      "Most adults need at least seven hours on a regular schedule.",
    ],
  },
  {
    slug: "the-octopus-mind",
    title: "The Octopus Mind",
    category: "science",
    difficulty: 2,
    summary: "An animal with most of its neurons in its arms challenges what we think a mind looks like.",
    body: `If you wanted to design an intelligent animal from scratch, you probably would not start with a soft body, eight arms and no bones. Yet the octopus, a close relative of snails and clams, is one of the most capable problem solvers in the ocean. Studying it has forced scientists to rethink what intelligence requires.

A common octopus has around five hundred million neurons, a number closer to that of a dog than to that of most invertebrates. What makes the octopus unusual is not only how many neurons it has but where they are. Roughly two-thirds of them sit in the arms rather than in the central brain. Each arm can taste, touch and make decisions about what it is holding. An arm that has been separated from the body can still reach for food and pass it toward where the mouth would be. The central brain seems to set goals, while the arms work out many of the details on their own.

This distributed design suits an animal whose body can take almost any shape. Controlling a rigid skeleton is a matter of steering a few joints. Controlling a flexible arm with no joints at all is a far harder problem, and handing much of the work to local networks of neurons appears to be the octopus's solution.

The behavior that results is striking. In laboratories, octopuses have learned to unscrew jar lids, navigate mazes and recognize individual human keepers, sometimes squirting water at the ones they dislike. In the wild, some carry coconut shell halves across the sea floor and assemble them into shelters when threatened, a rare example of an invertebrate using a tool it has transported for later use.

Their skin adds another layer. It is packed with cells called chromatophores that can expand or contract within a fraction of a second, allowing an octopus to change color and pattern to match a rock, a patch of algae or a passing shadow. Remarkably, many octopuses are thought to be color-blind in the usual sense, and researchers are still investigating how they match colors so well.

Perhaps the deepest puzzle is that this intelligence evolved along a branch of life entirely separate from ours. The last common ancestor of humans and octopuses was likely a small, worm-like creature living more than five hundred million years ago. Whatever an octopus experiences, it reached that point by a different road. Most octopuses live only one or two years, which makes their abilities even more surprising: they learn a great deal in very little time.`,
    questions: [
      {
        q: "Where are most of an octopus's neurons located?",
        options: ["In its central brain", "In its arms", "In its skin", "Evenly spread across its body"],
        answer: 1,
        kind: "detail",
      },
      {
        q: "According to the passage, why might a distributed nervous system suit the octopus?",
        options: [
          "It helps the octopus live much longer",
          "It allows the octopus to see in color",
          "Controlling flexible, jointless arms is a hard problem best shared with local networks",
          "It lets the octopus grow a skeleton",
        ],
        answer: 2,
        kind: "inference",
      },
      {
        q: "Why is the coconut shell behavior notable?",
        options: [
          "It is a rare case of an invertebrate carrying a tool for later use",
          "It shows octopuses can eat coconuts",
          "It proves octopuses are related to snails",
          "It only happens in laboratories",
        ],
        answer: 0,
        kind: "detail",
      },
      {
        q: "In the passage, the word \"distributed\" most nearly means:",
        options: ["Hidden", "Spread out across many places", "Shrinking", "Inherited"],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "What is the author's central point?",
        options: [
          "Octopuses are dangerous to humans",
          "Octopuses are color-blind, so their camouflage is an illusion",
          "Intelligence can take very different forms and evolve along separate paths",
          "Invertebrates cannot learn quickly",
        ],
        answer: 2,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Octopuses have about 500 million neurons, two-thirds of them in their arms.",
      "Arms make many local decisions while the brain sets goals.",
      "They solve puzzles, recognize people and carry shells as shelters.",
      "Their intelligence evolved separately from ours over 500 million years.",
    ],
  },
  {
    slug: "how-immune-memory-works",
    title: "How Immune Memory Works",
    category: "science",
    difficulty: 3,
    summary: "Why the second encounter with a germ is usually so much easier than the first.",
    body: `The first time your body meets a new virus or bacterium, it is, in an important sense, unprepared. It has the raw materials to fight back, but it has not yet learned the specific shape of the invader. That learning takes time, often a week or more, and during that window a person can become quite sick. The second encounter is usually very different. The response is faster, larger and more precise, and frequently the infection is cleared before any symptoms appear. This difference is the work of immunological memory.

The process begins with antigens, the distinctive molecular fragments on the surface of a pathogen. The immune system contains an enormous population of lymphocytes, white blood cells that each carry receptors able to recognize one particular antigen shape. Because these receptors are generated by shuffling gene segments, the body produces millions of variations in advance, before it has ever encountered the threats they will match. When a pathogen arrives, the few cells whose receptors happen to fit its antigens are activated and begin to multiply rapidly, a process called clonal expansion.

Two families of lymphocytes lead the response. B cells, once activated and supported by helper T cells, mature into plasma cells that release antibodies, proteins that bind to antigens and either neutralize the pathogen directly or mark it for destruction. Killer T cells take a different approach: they identify the body's own cells that have been infected and destroy them, removing the factories in which a virus reproduces.

When the infection is defeated, most of these expanded cells die off. A minority, however, persist as memory B cells and memory T cells. They can survive for years, sometimes for decades, circulating through the blood and lymph. Because they already carry the right receptors and exist in far greater numbers than before, a second exposure triggers a response that skips much of the slow search of the first.

Vaccines exploit this system by providing the lesson without the illness. They present the immune system with antigens, whether as weakened or inactivated pathogens, purified proteins, or genetic instructions such as messenger RNA that prompt the body's own cells to briefly produce a harmless antigen. The immune system responds as if to a real threat and leaves behind memory cells.

Memory is not always permanent. Some pathogens, such as influenza viruses, change their surface antigens frequently, so memory formed against one version may only partly recognize the next. For other diseases, protection gradually wanes and booster doses restore it. Understanding how long memory lasts, and why it differs between diseases, remains an active area of research.`,
    questions: [
      {
        q: "Why is the first encounter with a pathogen often slower to resolve?",
        options: [
          "The body has no white blood cells at birth",
          "Antibodies only work on bacteria",
          "The immune system has not yet expanded cells matched to that pathogen",
          "Memory cells actively slow the response",
        ],
        answer: 2,
        kind: "main-idea",
      },
      {
        q: "What does \"clonal expansion\" describe?",
        options: [
          "Matched lymphocytes multiplying rapidly after activation",
          "A virus copying itself inside a cell",
          "Antibodies splitting into smaller proteins",
          "Vaccines being manufactured in bulk",
        ],
        answer: 0,
        kind: "vocabulary",
      },
      {
        q: "What is the main role of killer T cells?",
        options: [
          "Producing antibodies",
          "Destroying the body's own infected cells",
          "Generating new receptor genes",
          "Carrying oxygen to the lymph nodes",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "According to the passage, how do messenger RNA vaccines work?",
        options: [
          "They contain a weakened live virus",
          "They replace the body's memory cells",
          "They prompt the body's cells to briefly make a harmless antigen",
          "They deliver antibodies taken from other people",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Why might immunity to influenza be less durable than immunity to some other diseases?",
        options: [
          "Influenza has no antigens",
          "Influenza viruses frequently change their surface antigens",
          "Memory cells cannot form after a fever",
          "Booster doses weaken memory",
        ],
        answer: 1,
        kind: "inference",
      },
    ],
    keyPoints: [
      "Lymphocytes with matching receptors expand when they meet an antigen.",
      "B cells make antibodies; killer T cells destroy infected cells.",
      "Memory cells persist and make the second response faster and stronger.",
      "Vaccines teach this lesson without the illness; some immunity wanes or is evaded.",
    ],
  },
  {
    slug: "a-short-history-of-the-password",
    title: "A Short History of the Password",
    category: "technology",
    difficulty: 1,
    summary: "From shared mainframes to passkeys — how we came to guard our digital doors.",
    body: `Long before computers, people used secret words to prove who they were. Guards at city gates asked travelers for a watchword, and soldiers used passwords to tell friends from enemies in the dark. The idea was simple: if you know the secret, you must belong.

The computer password arrived in the early 1960s at the Massachusetts Institute of Technology. Researchers there had built one of the first time-sharing systems, a machine that many people could use at once from separate terminals. Sharing created a new problem. Each person had private files and a limited budget of computer time, so the system needed a way to keep users apart. The answer was to give everyone a private password. It worked, but not perfectly. Within a few years, at least one researcher found a way to print out the file of passwords so he could get more computer time.

That early story contained the two lessons that would follow passwords for the next sixty years. First, passwords are only as safe as the place they are stored. Second, people will find shortcuts when security gets in their way.

Over time, engineers learned to store passwords more carefully. Instead of keeping the actual words, systems began saving a scrambled version produced by a one-way mathematical function called a hash. When you log in, the system scrambles what you type and compares the results. If attackers steal the file, they get the scrambled versions rather than the passwords themselves.

People, however, kept choosing passwords that were easy to guess, like names, birthdays and simple number sequences. They also reused the same password on many websites, so one leak could open many doors. Security experts responded with new advice. Long passphrases made of several random words are both easier to remember and harder to crack than short, complicated strings. Password managers can create and remember a different strong password for every account.

Today, many services add a second step, such as a code from a phone, which means a stolen password alone is not enough. Newer systems called passkeys go further by replacing the password with a pair of cryptographic keys stored on your device. The secret word that once guarded city gates may slowly be retiring, but the questions it raised about trust and convenience are here to stay.`,
    questions: [
      {
        q: "Why did early time-sharing computers need passwords?",
        options: [
          "To connect to the internet",
          "To keep many users' files and computer time separate",
          "To speed up calculations",
          "To protect against computer viruses",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "What does it mean that systems store a \"hash\" of a password?",
        options: [
          "They store a scrambled, one-way version instead of the password itself",
          "They store the password twice for safety",
          "They store the password on paper",
          "They delete the password after each login",
        ],
        answer: 0,
        kind: "vocabulary",
      },
      {
        q: "According to the passage, why is reusing a password risky?",
        options: [
          "It makes typing slower",
          "Websites ban reused passwords",
          "A single leak can unlock many accounts",
          "It makes the password shorter",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "What does the early MIT story suggest about security?",
        options: [
          "Early computers had no security at all",
          "Only experts can break passwords",
          "Passwords were never useful",
          "People look for shortcuts when security gets in their way",
        ],
        answer: 3,
        kind: "inference",
      },
      {
        q: "Which statement best summarizes the passage?",
        options: [
          "Passwords have evolved, but the tension between security and convenience remains",
          "Passkeys were invented in the 1960s",
          "Complicated short passwords are the safest option",
          "Two-step logins make passwords unnecessary today",
        ],
        answer: 0,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Computer passwords began on shared time-sharing systems at MIT in the early 1960s.",
      "Systems store hashes rather than the passwords themselves.",
      "Weak and reused passwords are the main human problem; passphrases and managers help.",
      "Second factors and passkeys reduce reliance on a single secret.",
    ],
  },
  {
    slug: "how-gps-knows-where-you-are",
    title: "How GPS Knows Where You Are",
    category: "technology",
    difficulty: 2,
    summary: "A constellation of clocks in orbit — and a correction from Einstein — put the blue dot on your map.",
    body: `When the blue dot on your phone's map settles onto the right street corner, it is easy to forget that the answer came from space. The Global Positioning System, operated by the United States, relies on a constellation of about thirty satellites orbiting roughly twenty thousand kilometers above the Earth. At least twenty-four are needed to guarantee coverage, and the extras add accuracy and resilience.

Each satellite does something surprisingly simple: it continuously broadcasts a signal that says, in effect, "this is who I am, this is where I am, and this is exactly what time it is." Your receiver does not send anything back. It simply listens.

Because radio signals travel at the speed of light, the receiver can work out how far away a satellite is by measuring how long its signal took to arrive. A signal that took seven hundredths of a second, for example, has traveled about twenty-one thousand kilometers. One distance places you somewhere on a giant imaginary sphere around that satellite. A second satellite narrows the possibilities to the circle where two spheres meet, and a third reduces them to just two points, one of which is usually far out in space and can be discarded. This method is called trilateration.

There is a catch. Light is so fast that an error of one millionth of a second in timing becomes an error of about three hundred meters in distance. The satellites carry atomic clocks that are extraordinarily precise, but your phone does not. The solution is to use a fourth satellite. With four measurements, the receiver can solve for its three position coordinates and for the error in its own clock at the same time. In practice, receivers often track many more than four satellites, sometimes from several different national systems, to improve accuracy.

Timing is so central that GPS must account for Albert Einstein's theories of relativity. Because the satellites move quickly, their clocks tick slightly slower from our point of view. Because they sit higher in Earth's gravitational field, their clocks tick slightly faster. The two effects do not cancel: the net result is that satellite clocks would gain about thirty-eight microseconds per day. That sounds tiny, but left uncorrected it would cause position errors to grow by kilometers each day. Engineers therefore adjust the satellite clocks to compensate.

The same precise timing has quietly become infrastructure. Financial networks, power grids and mobile phone towers all use GPS time signals to stay synchronized, which is one reason engineers are increasingly concerned about protecting these signals from interference.`,
    questions: [
      {
        q: "How does a GPS receiver measure its distance from a satellite?",
        options: [
          "By sending a signal and waiting for a reply",
          "By measuring how long the satellite's signal took to arrive",
          "By measuring the satellite's brightness",
          "By reading a map stored in the satellite",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Why is a fourth satellite necessary?",
        options: [
          "To provide a backup if one fails",
          "To show the time on your phone",
          "To solve for the error in the receiver's own clock",
          "To measure altitude above sea level",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "What would happen if relativity were ignored?",
        options: [
          "Position errors would grow by kilometers each day",
          "Satellites would fall out of orbit",
          "Signals would travel slower than light",
          "Nothing noticeable",
        ],
        answer: 0,
        kind: "detail",
      },
      {
        q: "The term \"trilateration\" in the passage refers to:",
        options: [
          "Measuring angles to three landmarks",
          "Combining distances from several known points to find a position",
          "Using three different national systems",
          "Correcting clocks three times a day",
        ],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "Why does the author mention financial networks and power grids?",
        options: [
          "To argue GPS is too expensive",
          "To show GPS was designed for banks",
          "To explain how satellites are powered",
          "To show that GPS timing has become critical infrastructure beyond navigation",
        ],
        answer: 3,
        kind: "inference",
      },
    ],
    keyPoints: [
      "Satellites broadcast identity, position and precise time; receivers only listen.",
      "Signal travel time gives distance; several distances give position (trilateration).",
      "A fourth satellite lets the receiver correct its own clock error.",
      "Relativity makes satellite clocks gain ~38 microseconds a day, which must be corrected.",
    ],
  },
  {
    slug: "why-batteries-wear-out",
    title: "Why Batteries Wear Out",
    category: "technology",
    difficulty: 3,
    summary: "The slow chemistry behind a phone that no longer lasts the day — and what actually helps.",
    body: `Almost every rechargeable device you own, from a phone to an electric car, relies on lithium-ion batteries. They are popular because they store a great deal of energy for their weight and can be recharged hundreds or thousands of times. Yet anyone who has kept a phone for a few years knows that the battery slowly fades. Understanding why reveals that battery aging is less a single failure than an accumulation of small, mostly irreversible side reactions.

A lithium-ion cell has two electrodes separated by an electrolyte. When the battery charges, lithium ions travel from the positive electrode, typically a metal oxide, and settle between layers of graphite in the negative electrode. When the battery discharges, the ions travel back, and electrons flow through the device to power it. In an ideal battery, this shuttle would continue indefinitely. In a real one, every trip carries a small cost.

The most important cost comes from a thin film called the solid electrolyte interphase. It forms on the graphite surface during the first charges, when some electrolyte reacts and decomposes. In moderation the film is helpful: it protects the electrode from further reactions. But it never stops growing entirely. Each cycle consumes a little more lithium and electrolyte to thicken the layer, and lithium locked into the film can no longer carry charge. The battery's capacity shrinks, and the thickening layer also increases internal resistance, which is why an aging phone may shut down suddenly when a demanding app draws a burst of power.

Mechanical stress adds to the damage. Electrode materials swell and shrink slightly as ions enter and leave, and over thousands of cycles this repeated flexing can crack particles and break electrical contacts. Under certain conditions, especially fast charging in the cold, lithium can also deposit as metal on the electrode surface instead of slipping into the graphite. This process, known as lithium plating, both removes usable lithium and, in severe cases, poses safety risks.

Two conditions accelerate nearly all of these reactions: heat and extreme states of charge. High temperatures speed up chemical side reactions, which is why leaving a phone on a hot car dashboard is harmful. Keeping a cell at a very high charge for long periods stresses the positive electrode, while draining it completely stresses the negative one. For this reason, many devices now offer settings that pause charging around eighty percent, and electric car makers often recommend daily charging limits below full capacity.

None of this means you should obsess over every charge. Modern battery management software already protects cells from the worst abuses. But the chemistry explains the general advice: avoid heat, avoid keeping the battery at either extreme for long periods, and accept that some gradual decline is the price of storing so much energy in so little space.`,
    questions: [
      {
        q: "What happens when a lithium-ion battery charges?",
        options: [
          "Electrons are stored in the electrolyte",
          "Lithium ions move from the positive electrode into the graphite of the negative electrode",
          "The graphite turns into metal oxide",
          "Lithium leaves the battery entirely",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Why is the solid electrolyte interphase described as both helpful and harmful?",
        options: [
          "It protects the electrode, but its continued growth consumes lithium and raises resistance",
          "It speeds charging but makes the battery heavier",
          "It cools the battery but causes swelling",
          "It stores extra energy but only in cold weather",
        ],
        answer: 0,
        kind: "inference",
      },
      {
        q: "Why might an old phone shut down suddenly during a demanding task?",
        options: [
          "The software deliberately turns it off to save data",
          "Its electrolyte has frozen",
          "Higher internal resistance makes it struggle with bursts of power",
          "Lithium plating makes the screen draw less power",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Under which conditions is lithium plating especially likely?",
        options: [
          "Slow charging in warm rooms",
          "Storing the battery half charged",
          "Fast charging in the cold",
          "Leaving the device switched off",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "What is the author's overall advice?",
        options: [
          "Always charge to 100% to maximize lifespan",
          "Replace batteries every year",
          "Track every charge carefully to prevent any decline",
          "Avoid heat and long periods at extreme charge, and accept some gradual decline",
        ],
        answer: 3,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Charging shuttles lithium ions into graphite; each cycle has a small cost.",
      "The growing SEI layer consumes lithium and raises internal resistance.",
      "Mechanical stress and lithium plating add further damage.",
      "Heat and extreme charge levels accelerate aging; moderate habits help.",
    ],
  },
  {
    slug: "revenue-is-not-profit",
    title: "Revenue Is Not Profit",
    category: "business",
    difficulty: 1,
    summary: "A busy summer at a lemonade stand teaches the difference between selling more and earning more.",
    body: `Maya opened a lemonade stand on the first warm Saturday of summer. By the end of the day, she had sold eighty cups at one dollar each. She counted eighty dollars in her cash box and felt rich. Then her older brother asked a simple question: "How much did you actually make?"

The eighty dollars was her revenue, the total money that came in from sales. But she had spent money too. The lemons, sugar and cups for eighty drinks had cost her about thirty dollars. These are called variable costs, because they rise and fall with how much you sell. Every extra cup sold meant a little more lemon, a little more sugar and one more cup.

There were other costs that did not depend on sales. Maya had bought a folding table and a painted sign for forty dollars, and she paid her friend ten dollars to help for the afternoon. The table and sign are fixed costs. Whether she sold one cup or one hundred, she still had to buy them.

So what was her profit? Revenue of eighty dollars, minus thirty in variable costs, minus fifty in fixed costs, left her with zero. She had worked all day and broken even.

At first that felt discouraging, but her brother pointed out something important. The table and sign would last all summer. Next Saturday, if she sold another eighty cups, she would only need to pay for the ingredients and her helper. Her profit would jump to forty dollars. The more weekends she worked, the more those early fixed costs would be spread out.

Maya also noticed that each cup cost her about thirty-eight cents in ingredients and sold for a dollar. That left sixty-two cents per cup to cover her fixed costs and then become profit. Business people call this the contribution margin. It helped her think clearly about decisions. If she lowered her price to seventy-five cents to attract more customers, each cup would contribute far less, and she would need to sell many more cups just to earn the same amount.

Large companies face the same arithmetic on a bigger scale. A business can report enormous sales and still lose money if its costs grow faster than its revenue. That is why investors look past the headline sales number and ask Maya's brother's question: how much do you actually make?`,
    questions: [
      {
        q: "What was Maya's revenue on her first day?",
        options: ["Zero dollars", "Thirty dollars", "Fifty dollars", "Eighty dollars"],
        answer: 3,
        kind: "detail",
      },
      {
        q: "Which of these is a fixed cost in the story?",
        options: ["Lemons", "Cups", "The folding table and sign", "Sugar"],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Why would Maya's profit rise on the second Saturday even with the same sales?",
        options: [
          "She would not need to buy the table and sign again",
          "Lemons would become cheaper",
          "She would raise her price",
          "Her helper would work for free",
        ],
        answer: 0,
        kind: "inference",
      },
      {
        q: "The \"contribution margin\" in the story refers to:",
        options: [
          "The total money in the cash box",
          "The amount each cup leaves after its ingredient cost",
          "The cost of the table divided by the summer",
          "The tip given to her helper",
        ],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "What is the main lesson of the passage?",
        options: [
          "Lemonade stands are not profitable",
          "Lower prices always increase profit",
          "Large sales do not guarantee profit; costs determine what you actually earn",
          "Fixed costs should be avoided completely",
        ],
        answer: 2,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Revenue is money in; profit is what remains after all costs.",
      "Variable costs scale with sales; fixed costs don't.",
      "Fixed costs are spread out as you sell more over time.",
      "Contribution margin per unit shows how pricing changes affect profit.",
    ],
  },
  {
    slug: "the-innovators-dilemma",
    title: "The Innovator's Dilemma",
    category: "business",
    difficulty: 2,
    summary: "Why excellent companies, doing everything right, can still be overtaken by inferior products.",
    body: `It is easy to explain why badly run companies fail. It is much harder to explain why well-run ones do. In 1997, the Harvard professor Clayton Christensen published a book that tried to answer that second question. His conclusion was unsettling: sometimes companies fail not because they ignore their customers, but precisely because they listen to them so carefully.

Christensen studied the computer disk drive industry, where generations of technology arrived quickly and the leading firms changed again and again. He distinguished between two kinds of innovation. Sustaining innovations make good products better in the ways existing customers already value: more storage, more speed, more reliability. Established companies are usually excellent at these improvements, and they tend to win the race.

Disruptive innovations work differently. They often begin as products that are worse by the standards of the main market but have other advantages, such as being smaller, simpler, cheaper or more convenient. Early on, they appeal only to a small or new group of customers whom the leaders consider unimportant. Smaller disk drives, for example, initially stored less than the large drives that mainframe and minicomputer makers demanded, so leading suppliers had little reason to pursue them. But the small drives suited new markets, such as desktop computers, and they improved steadily.

This is the dilemma. For a successful company, the disruptive product looks unattractive by every sensible measure. Its profit margins are lower, its market is smaller, and its best customers say they do not want it. Managers who allocate resources rationally will keep investing in the sustaining improvements their customers request. Meanwhile, the disruptive technology keeps getting better until it becomes good enough for the mainstream market, at which point the newcomers arrive with lower costs and the incumbents struggle to respond.

Christensen's recommendation was not that companies should chase every new idea. Instead, he argued that firms facing a potentially disruptive technology could create separate, smaller units whose size and cost structure allowed them to get excited about small markets and modest margins. Such a unit could learn alongside the new customers without being judged by the standards of the core business.

The theory has been widely influential, and also widely misused. The word "disruption" is often applied to any new product that succeeds, even when it is simply better and more expensive. Critics have also questioned how well the theory predicts which companies will fail. Still, its central insight remains useful: the habits that make a company successful today can blind it to the very changes that will matter most tomorrow.`,
    questions: [
      {
        q: "Which industry did Christensen study to develop his theory?",
        options: ["Automobiles", "Computer disk drives", "Steel", "Mobile phones"],
        answer: 1,
        kind: "detail",
      },
      {
        q: "How do disruptive innovations typically begin?",
        options: [
          "As better and more expensive versions of existing products",
          "As government-funded research projects",
          "As products that are worse by mainstream standards but cheaper, simpler or more convenient",
          "As products demanded by a company's best customers",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Why is it rational for successful companies to ignore disruptive products at first?",
        options: [
          "Those products offer lower margins and a smaller market, and key customers don't want them",
          "Disruptive products are illegal in established markets",
          "Managers never listen to customers",
          "Disruptive products never improve",
        ],
        answer: 0,
        kind: "inference",
      },
      {
        q: "What did Christensen recommend?",
        options: [
          "Chasing every new idea immediately",
          "Lowering prices on all products",
          "Ignoring customers entirely",
          "Creating separate, smaller units that can value small markets",
        ],
        answer: 3,
        kind: "detail",
      },
      {
        q: "What is the passage's main point?",
        options: [
          "Badly run companies are the only ones that fail",
          "The practices that create success can blind companies to disruptive change",
          "All successful products are disruptive",
          "Disk drives are no longer important",
        ],
        answer: 1,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Sustaining innovations improve products for existing customers; incumbents excel at them.",
      "Disruptive innovations start worse but cheaper or simpler, serving overlooked customers.",
      "Rational resource allocation leads incumbents to ignore disruption until it's too late.",
      "Separate small units can pursue disruptive markets; the term is often misused.",
    ],
  },
  {
    slug: "interests-not-positions",
    title: "Interests, Not Positions",
    category: "business",
    difficulty: 2,
    summary: "The simple shift that turns negotiations from tug-of-war into problem solving.",
    body: `Two people are arguing over a single orange. Each insists on having it, and after some back and forth they settle on the obvious compromise: they cut it in half. One person eats the fruit and throws away the peel. The other throws away the fruit and uses the peel to bake a cake. Both could have had everything they wanted, but neither asked why the other wanted the orange.

This small story, popularized by Roger Fisher and William Ury in their 1981 book Getting to Yes, captures one of the most useful ideas in negotiation. A position is what someone says they want: the orange, a higher salary, a lower price. An interest is the reason behind the position: a cake, financial security, staying within a budget. Positions often conflict directly. Interests frequently do not.

Fisher and Ury argued that most negotiations go wrong because people bargain over positions. Each side stakes out a demand and then concedes as little as possible. This approach tends to produce unwise agreements, because the final deal reflects stubbornness more than real needs. It is also inefficient, because each side starts with an extreme position and moves slowly, and it can damage relationships, because negotiation becomes a contest of wills.

Focusing on interests changes the conversation. Instead of asking "What do you want?", a skilled negotiator asks "Why does that matter to you?" and "What would a good outcome look like?" A job candidate who asks for a higher salary may care most about paying off a loan, having flexibility for family, or feeling valued. An employer with a fixed salary budget might still offer a signing bonus, remote work days or a clearer path to promotion. Once interests are on the table, the two sides can invent options that give each of them more.

The authors also proposed a concept that has since become standard vocabulary: the BATNA, or best alternative to a negotiated agreement. Your BATNA is what you will do if this negotiation fails, such as accepting another job offer. Knowing it protects you from accepting a deal that is worse than your alternative, and improving it is often the most effective way to strengthen your position.

None of this means negotiations are always friendly or that every conflict can be dissolved. Sometimes interests truly collide. But a surprising number of disputes involve oranges and cakes, and they are resolved not by splitting the difference but by asking one more question.`,
    questions: [
      {
        q: "In the orange story, why was cutting the orange in half a poor outcome?",
        options: [
          "One person received a larger half",
          "Both could have had everything they needed if they had shared their reasons",
          "The orange was spoiled",
          "Neither person wanted the orange",
        ],
        answer: 1,
        kind: "inference",
      },
      {
        q: "What is the difference between a position and an interest?",
        options: [
          "A position is a demand; an interest is the reason behind it",
          "A position is private; an interest is public",
          "A position is always fair; an interest is selfish",
          "There is no real difference",
        ],
        answer: 0,
        kind: "main-idea",
      },
      {
        q: "Which is NOT listed as a problem with positional bargaining?",
        options: [
          "It produces unwise agreements",
          "It is inefficient",
          "It can damage relationships",
          "It is illegal in many countries",
        ],
        answer: 3,
        kind: "detail",
      },
      {
        q: "What does BATNA stand for?",
        options: [
          "Bargain at the negotiated amount",
          "Best alternative to a negotiated agreement",
          "Balanced approach to new arrangements",
          "Basic agreement terms and notes",
        ],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "According to the passage, what is often the most effective way to strengthen your negotiating position?",
        options: [
          "Starting with an extreme demand",
          "Refusing to share any information",
          "Improving your alternative if the deal fails",
          "Splitting every difference equally",
        ],
        answer: 2,
        kind: "detail",
      },
    ],
    keyPoints: [
      "Positions are demands; interests are the reasons behind them.",
      "Positional bargaining is unwise, inefficient and damages relationships.",
      "Asking why uncovers options that give both sides more.",
      "Know and improve your BATNA — your best alternative if talks fail.",
    ],
  },
];
