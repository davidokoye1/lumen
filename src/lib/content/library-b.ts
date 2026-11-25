import type { PassageInput } from "./types";

/** Original passages written for Lumen. Psychology, history and personal growth. */
export const libraryB: PassageInput[] = [
  {
    slug: "the-spacing-effect",
    title: "The Spacing Effect",
    category: "psychology",
    difficulty: 1,
    summary: "Why studying a little, often, beats one long session — a finding older than the light bulb.",
    body: `In the 1880s, a German psychologist named Hermann Ebbinghaus ran a series of experiments with a very patient subject: himself. He memorized long lists of nonsense syllables, such as "DAX" and "BOK," and then tested how many he could remember after different delays. Because the syllables had no meaning, he could measure memory without the help of prior knowledge.

His results produced the famous forgetting curve. Memory drops quickly at first and then levels off. Much of what he learned was gone within a day, but what survived faded more slowly after that. Anyone who has crammed for an exam and forgotten most of it a week later has experienced the curve firsthand.

Ebbinghaus also discovered something more hopeful. When he spread his practice sessions out over several days, he needed less total study time to learn a list than when he crammed all the practice into one sitting. And each time he reviewed the material, the forgetting curve that followed became flatter. The memory lasted longer.

This finding, now called the spacing effect, is one of the most reliable results in the study of learning. It has been confirmed in hundreds of experiments with children and adults, with vocabulary, facts, skills and concepts. Studying the same material in several short sessions separated by time usually leads to much better long-term memory than studying it in one long session, even when the total time is identical.

Why does spacing help? One explanation is that a little forgetting is useful. When you return to material that has started to fade, your brain has to work harder to retrieve it, and that effort strengthens the memory. Cramming feels productive because the information stays fresh in your mind, but that ease is misleading. It does not build memories that last.

The spacing effect has practical uses for readers. After finishing an important article or chapter, you can briefly review its key ideas the next day, then again a few days later, and again the following week. Flashcard apps use the same principle, scheduling reviews just before you are likely to forget. A few minutes of spaced review can turn something you read once into something you truly know.`,
    questions: [
      {
        q: "Why did Ebbinghaus use nonsense syllables?",
        options: [
          "They were easier to pronounce",
          "They let him measure memory without the help of prior knowledge",
          "They were common in German",
          "His subjects preferred them",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "What does the forgetting curve show?",
        options: [
          "Memory fades quickly at first, then more slowly",
          "Memory fades at a constant rate",
          "Memory improves over time without practice",
          "Memory only fades after a week",
        ],
        answer: 0,
        kind: "detail",
      },
      {
        q: "According to the passage, why does cramming feel productive?",
        options: [
          "It takes less total time",
          "It is supported by research",
          "The information stays fresh in mind, which feels like learning",
          "It flattens the forgetting curve",
        ],
        answer: 2,
        kind: "inference",
      },
      {
        q: "Which plan best applies the spacing effect?",
        options: [
          "Reading a chapter five times in one evening",
          "Reviewing key ideas the next day, a few days later and the next week",
          "Reading only once and never reviewing",
          "Studying for three hours the night before a test",
        ],
        answer: 1,
        kind: "inference",
      },
      {
        q: "What is the passage mainly about?",
        options: [
          "The life of Hermann Ebbinghaus",
          "How flashcard apps are designed",
          "Why spreading out study sessions improves long-term memory",
          "Why nonsense syllables are hard to remember",
        ],
        answer: 2,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Ebbinghaus measured forgetting with nonsense syllables in the 1880s.",
      "Memory drops fast, then levels off (the forgetting curve).",
      "Spaced sessions beat one long session for the same total time.",
      "Effortful retrieval after some forgetting strengthens memory.",
    ],
  },
  {
    slug: "attention-residue",
    title: "Attention Residue",
    category: "psychology",
    difficulty: 2,
    summary: "When you switch tasks, part of your mind stays behind. Here's what that costs a reader.",
    body: `You close your email, open a report and begin to read. Ten minutes later you realize you have reached the bottom of the second page and cannot recall a single point it made. Part of your mind, it turns out, never left the inbox.

The organizational psychologist Sophie Leroy gave this experience a name in 2009: attention residue. In her studies, participants who were interrupted while working on one task and then moved to another performed worse on the second task than people who had been allowed to finish the first. Their thoughts kept drifting back to what they had left undone. The residue was especially strong when the first task was incomplete and when there was no time pressure to finish it, conditions that are common in everyday work.

This research fits into a broader picture of how attention works. Despite the popular idea of multitasking, the brain cannot fully perform two demanding mental activities at once. What feels like doing several things simultaneously is usually rapid switching between them, and every switch carries a cost. The mind needs time to let go of the rules and goals of the old task and to load those of the new one. Those costs are often small individually, but they add up across a day filled with notifications, messages and quick checks.

Reading is particularly vulnerable. Understanding a text requires building a mental model of what it says, connecting each new sentence to what came before. When attention is divided, the model develops gaps. Readers may keep moving their eyes across the lines, but comprehension quietly drops. Researchers who study mind wandering during reading have found that readers often fail to notice when their thoughts have drifted, which is why the realization tends to arrive pages later.

The practical response is not heroic willpower but better transitions. Leroy and others suggest that before switching tasks, people briefly note where they stopped and what the next step will be. This small act seems to reassure the mind that the unfinished task is under control, which reduces the pull of residue. Batching similar tasks, turning off nonessential notifications and setting aside uninterrupted blocks of time for demanding reading are simple ways to protect attention.

For anyone hoping to read faster, the lesson is humbling. Many apparent reading problems are really attention problems. Before trying to move your eyes more quickly, make sure your mind has fully arrived on the page.`,
    questions: [
      {
        q: "What is \"attention residue\"?",
        options: [
          "Thoughts about a previous task that persist after switching",
          "The fatigue felt after long reading sessions",
          "A technique for multitasking efficiently",
          "Notes written before switching tasks",
        ],
        answer: 0,
        kind: "vocabulary",
      },
      {
        q: "When was residue especially strong in Leroy's studies?",
        options: [
          "When the first task was complete and urgent",
          "When the second task was easy",
          "When the first task was unfinished and there was no time pressure",
          "When participants worked in groups",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Why is reading particularly vulnerable to divided attention?",
        options: [
          "Reading uses more energy than other tasks",
          "Comprehension depends on building a connected mental model that develops gaps",
          "Eyes cannot move while thinking",
          "Texts are usually too long",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "What strategy does the passage recommend before switching tasks?",
        options: [
          "Finishing every task before starting another",
          "Reading faster to make up for lost time",
          "Checking notifications one last time",
          "Briefly noting where you stopped and what comes next",
        ],
        answer: 3,
        kind: "detail",
      },
      {
        q: "What can be inferred from the final paragraph?",
        options: [
          "Eye movement training is the most important part of reading faster",
          "Improving focus may matter more than reading speed techniques",
          "Speed reading is impossible",
          "Willpower is the key to better reading",
        ],
        answer: 1,
        kind: "inference",
      },
    ],
    keyPoints: [
      "Switching tasks leaves attention residue that hurts the next task.",
      "Multitasking is rapid switching, and each switch has a cost.",
      "Divided attention leaves gaps in a reader's mental model, often unnoticed.",
      "Note your stopping point, batch tasks and protect focused blocks.",
    ],
  },
  {
    slug: "the-planning-fallacy",
    title: "The Planning Fallacy",
    category: "psychology",
    difficulty: 3,
    summary: "Why projects run late even when we know projects run late — and the outside view that helps.",
    body: `In 1979, the psychologists Daniel Kahneman and Amos Tversky described a curious pattern in human judgment. People routinely underestimate how long their own tasks will take, even when they know that similar tasks have run over in the past. They called this tendency the planning fallacy. What makes it a fallacy rather than simple ignorance is that the relevant evidence is usually available; it simply fails to influence the forecast.

A well-known study by Roger Buehler and his colleagues in 1994 illustrates the effect. Students writing an honors thesis were asked to predict when they would finish. On average, they estimated about thirty-four days. The actual average was nearly fifty-six days, and only a minority finished by their own predicted dates. Even when asked for a "worst case" estimate, many students still finished later than that.

Why do capable people make such consistent errors? One explanation is that forecasters adopt what Kahneman called the inside view. They imagine the specific steps of their own project and how it will unfold if things go according to plan. This scenario feels detailed and convincing. But it systematically neglects the many ways a project can be delayed, from illness and competing obligations to unexpected technical problems, because each individual obstacle seems unlikely. Together, however, the probability that at least one of them occurs is high.

Motivation also plays a part. Optimistic estimates are pleasant, they make ambitious plans seem feasible, and in organizations they can help win approval for a project. A team that submits a realistic but discouraging estimate may lose funding to a competitor with a rosier forecast, which rewards optimism at the system level.

The consequences reach well beyond student essays. Large public works are famous for overruns. The Sydney Opera House, for example, was expected to be completed in the early 1960s for about seven million Australian dollars; it opened in 1973 at a cost of over one hundred million. Studies of major infrastructure projects around the world have found that cost overruns are common rather than exceptional.

The most effective remedy is to take the outside view. Instead of building a forecast from the details of your own plan, you begin by asking how long similar projects have actually taken, a method known as reference class forecasting. You then adjust that baseline modestly for the specific features of your case. The approach feels less satisfying because it ignores what makes your project special, but that is exactly the point: the special features are where optimism hides.

Readers can apply the same lesson on a small scale. If you have consistently planned to finish a book in a week and needed three, the useful prediction for the next book is not your hopeful plan but your track record.`,
    questions: [
      {
        q: "Why is the planning fallacy described as a fallacy rather than ignorance?",
        options: [
          "People have no information about past tasks",
          "Relevant evidence is usually available but fails to influence forecasts",
          "It only affects experts",
          "Forecasts are deliberately false",
        ],
        answer: 1,
        kind: "inference",
      },
      {
        q: "In Buehler's study, what was the students' average predicted completion time?",
        options: ["About 14 days", "About 34 days", "About 56 days", "About 73 days"],
        answer: 1,
        kind: "detail",
      },
      {
        q: "What is the \"inside view\"?",
        options: [
          "Forecasting from the specific steps of your own plan",
          "Asking how long similar projects have taken",
          "Consulting outside experts",
          "Planning for the worst case",
        ],
        answer: 0,
        kind: "vocabulary",
      },
      {
        q: "How can organizations encourage the planning fallacy?",
        options: [
          "By banning optimistic estimates",
          "By using reference class forecasting",
          "By rewarding rosy forecasts with approval and funding",
          "By extending every deadline",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "What does the author recommend?",
        options: [
          "Ignoring all past data",
          "Doubling every estimate automatically",
          "Focusing on what makes your project unique",
          "Starting from how long similar projects took, then adjusting modestly",
        ],
        answer: 3,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "People underestimate their own task durations despite knowing past overruns.",
      "Thesis students predicted ~34 days; the average was ~56.",
      "The inside view ignores the combined probability of many small obstacles.",
      "Reference class forecasting (the outside view) corrects for optimism.",
    ],
  },
  {
    slug: "the-library-of-alexandria",
    title: "The Library of Alexandria",
    category: "history",
    difficulty: 1,
    summary: "The ancient world's great library didn't vanish in a single fire — and that's the more useful story.",
    body: `More than two thousand years ago, the Egyptian city of Alexandria was home to one of the most ambitious projects in the ancient world: a library meant to collect all the knowledge of its time. Founded in the early third century BCE under the Ptolemies, the Greek-speaking rulers of Egypt after Alexander the Great, the library became part of a larger research institution called the Mouseion, a place dedicated to the Muses, the goddesses of arts and learning.

The rulers of Alexandria were determined to fill its shelves. According to ancient accounts, ships that arrived in the harbor were searched for books, which were copied by scribes. Sometimes the library kept the originals and returned the copies. Scholars came from across the Mediterranean to study, write and debate. Estimates of the collection's size vary widely, from tens of thousands to several hundred thousand scrolls, and historians admit that no one knows the exact number.

The library supported remarkable work. Eratosthenes, one of its chief librarians, estimated the circumference of the Earth with impressive accuracy by comparing the angles of shadows in two Egyptian cities. Scholars there also worked to produce careful editions of Homer's poems, comparing many copies to remove errors.

Most people have heard that the library was destroyed in a single great fire. The real story is more gradual. A fire during Julius Caesar's war in Alexandria in 48 BCE may have damaged part of the collection or nearby warehouses. Over the following centuries, the library suffered from reduced funding, political turmoil, the expulsion of scholars and further conflicts in the city. By the time of later disasters, there may have been little of the great institution left to lose.

This slower decline is, in some ways, a more useful lesson than a dramatic fire. Knowledge rarely disappears all at once. It fades when institutions lose support, when copies stop being made and when people no longer care for what has been collected. The library of Alexandria reminds us that preserving knowledge is not a single act. It is an ongoing habit that every generation must choose to continue.`,
    questions: [
      {
        q: "Who founded the Library of Alexandria?",
        options: ["The Romans", "The Ptolemies", "Julius Caesar", "Homer"],
        answer: 1,
        kind: "detail",
      },
      {
        q: "How did the library gather books from ships?",
        options: [
          "It bought them at auction",
          "It searched ships and copied the books found aboard",
          "It traded scrolls for gold",
          "It only accepted gifts from kings",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "What did Eratosthenes estimate?",
        options: [
          "The distance to the Moon",
          "The number of scrolls in the library",
          "The circumference of the Earth",
          "The age of the pyramids",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "According to the passage, how did the library most likely decline?",
        options: [
          "Gradually, through loss of funding, turmoil and repeated conflicts",
          "In a single fire in 48 BCE",
          "Through a flood",
          "It was moved to Rome",
        ],
        answer: 0,
        kind: "main-idea",
      },
      {
        q: "What lesson does the author draw from the library's story?",
        options: [
          "Fires are the greatest danger to libraries",
          "Ancient scholars were careless",
          "Preserving knowledge requires ongoing care by every generation",
          "Large collections are impossible to maintain",
        ],
        answer: 2,
        kind: "inference",
      },
    ],
    keyPoints: [
      "Founded in the early 3rd century BCE under the Ptolemies as part of the Mouseion.",
      "Books were copied from ships; the collection's size is uncertain.",
      "Scholars like Eratosthenes did landmark work there.",
      "It declined gradually; preserving knowledge is an ongoing habit.",
    ],
  },
  {
    slug: "the-printing-press",
    title: "The Printing Press and the Flood of Books",
    category: "history",
    difficulty: 2,
    summary: "How movable type in fifteenth-century Mainz changed what — and how — Europe read.",
    body: `Before the middle of the fifteenth century, a book in Europe was usually a handmade object. Scribes copied texts letter by letter, often in monasteries, and a single volume could take months to produce. Books were costly, rare and frequently inconsistent, since each copy introduced its own errors.

Around 1440, in the German city of Mainz, a goldsmith named Johannes Gutenberg began developing a system that would change this. Printing itself was not new. In East Asia, woodblock printing had been used for centuries, and movable type made of ceramic and later metal had been developed in China and Korea. Gutenberg's contribution was to combine several technologies into a practical system suited to the European alphabet. He devised a hand mold for casting large numbers of identical metal letters, an oil-based ink that would adhere to metal type, and a press adapted from the screw presses used to make wine and olive oil.

The first major book produced with this system, the Gutenberg Bible, was completed around 1455. Printing spread with astonishing speed. Within a few decades, presses were operating in more than two hundred European towns, and by 1500 they had produced millions of books. A text that once required months of copying could be printed in hundreds of identical copies in a fraction of the time.

The effects went far beyond lower prices. Because every copy of a printed edition was the same, scholars in different cities could refer to the same page and line, correct errors in later editions and build on one another's work more reliably. Printed maps, diagrams and tables could be reproduced accurately, which mattered for fields such as astronomy, anatomy and navigation. Printers also discovered that pamphlets on current controversies could sell quickly. In the early sixteenth century, Martin Luther's writings spread across German-speaking lands with a speed that would have been impossible a century before, contributing to the rapid growth of the Protestant Reformation.

Printing also changed reading itself. As books became more common, more people learned to read, and reading gradually became a more private activity. Readers could own several books, compare them and read silently on their own rather than listening to a text read aloud.

Some contemporaries worried about the flood of material. There were complaints that there were too many books to read and that many of them were of poor quality, concerns that sound familiar in the age of the internet. Each new technology of information seems to bring both abundance and the challenge of deciding what deserves our attention.`,
    questions: [
      {
        q: "Which statement about printing before Gutenberg is supported by the passage?",
        options: [
          "Printing did not exist anywhere before 1440",
          "Woodblock printing and movable type had already been developed in East Asia",
          "Europe had used metal type for centuries",
          "Monks used presses to copy books",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Which of these was part of Gutenberg's system?",
        options: [
          "A hand mold for casting identical metal letters",
          "Paper made from bamboo",
          "Electric power",
          "A typewriter keyboard",
        ],
        answer: 0,
        kind: "detail",
      },
      {
        q: "Why did identical printed copies help scholars?",
        options: [
          "They were written in Latin",
          "They could refer to the same page and correct errors in later editions",
          "They were always free of errors",
          "They replaced the need for libraries",
        ],
        answer: 1,
        kind: "inference",
      },
      {
        q: "The word \"contemporaries\" in the last paragraph most nearly means:",
        options: [
          "Modern historians",
          "People living at the same time",
          "Printers' competitors",
          "Religious leaders",
        ],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "What broader point does the author make in the final paragraph?",
        options: [
          "Printing reduced the quality of all books",
          "The internet is less important than printing",
          "New information technologies bring abundance and the challenge of choosing what to read",
          "People should read fewer books",
        ],
        answer: 2,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Gutenberg combined metal type casting, oil-based ink and a screw press around 1440–1455.",
      "Printing spread to hundreds of towns and produced millions of books by 1500.",
      "Identical copies enabled reliable scholarship and fast spread of ideas.",
      "Abundance raised the age-old problem of what deserves attention.",
    ],
  },
  {
    slug: "the-longitude-problem",
    title: "The Longitude Problem",
    category: "history",
    difficulty: 3,
    summary: "For centuries, sailors could not tell how far east or west they were. A clockmaker solved it.",
    body: `For centuries, a ship far out at sea faced a deadly uncertainty. Sailors could determine their latitude, their position north or south of the equator, fairly easily by measuring the height of the Sun at noon or of certain stars at night. Longitude, their position east or west, was a different matter. Without it, navigators often had to rely on dead reckoning, estimating their position from speed, heading and elapsed time, and small errors accumulated over long voyages. Ships ran aground on coastlines they believed were still far away.

The underlying difficulty was a problem of time. The Earth rotates through 360 degrees in twenty-four hours, or fifteen degrees every hour. If a navigator knew the exact time at a reference location, such as the home port, and compared it with local time measured from the Sun, the difference would reveal the longitude. A ship whose local noon arrived three hours after noon at the home port was forty-five degrees to the west. The method was simple in principle. The obstacle was that no clock of the era could keep accurate time on a rolling ship through changes in temperature, humidity and pressure.

After a series of maritime disasters, the British Parliament passed the Longitude Act in 1714, offering a reward of up to twenty thousand pounds, an enormous sum, for a method that could determine longitude to within half a degree. Many leading astronomers believed the answer lay in the heavens, specifically in the "lunar distance" method, which used precise measurements of the Moon's position relative to the stars together with lengthy calculations and published tables.

John Harrison, a self-taught clockmaker from the north of England, pursued a mechanical solution. Over several decades he built a series of increasingly refined marine timekeepers. His early machines were large and intricate, but his fourth, known as H4, resembled a large pocket watch. On a voyage to Jamaica in 1761 and 1762, it lost only about five seconds over more than two months at sea, a performance that comfortably met the Act's requirements.

Recognition, however, came slowly. The board responsible for the prize demanded further trials, asked Harrison to explain and surrender his designs, and questioned whether the watch could be reproduced. Harrison, by then elderly, received substantial payments over the years and eventually an additional award from Parliament in 1773, though never the formal prize itself. The disagreement reflected genuine scientific questions as well as personal and institutional rivalries.

In the end, both approaches proved valuable. Lunar distance tables were widely used for decades, and as marine chronometers became more affordable and reliable, they became the standard tool. The longitude problem is often told as a story of a lone genius against the establishment, but it is also a story about how practical engineering, careful testing and institutional skepticism together turned a dangerous guess into a reliable measurement.`,
    questions: [
      {
        q: "Why was latitude easier to determine than longitude?",
        options: [
          "It could be found by measuring the height of the Sun or certain stars",
          "Latitude required no instruments at all",
          "Longitude changes every day",
          "Maps only showed latitude",
        ],
        answer: 0,
        kind: "detail",
      },
      {
        q: "If local noon on a ship arrives two hours after noon at the home port, how far west is the ship?",
        options: ["15 degrees", "20 degrees", "30 degrees", "45 degrees"],
        answer: 2,
        kind: "inference",
      },
      {
        q: "What was the main obstacle to the timekeeping method?",
        options: [
          "No one understood that the Earth rotates",
          "Clocks could not keep accurate time on a moving ship in changing conditions",
          "Sailors refused to use clocks",
          "The Sun could not be seen at sea",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "How did H4 perform on its trial voyage?",
        options: [
          "It stopped working halfway",
          "It lost about five seconds over more than two months",
          "It gained an hour per day",
          "It was never tested at sea",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "How does the author frame the story in the final paragraph?",
        options: [
          "As proof that astronomers were wrong",
          "As a simple tale of a lone genius defeating the establishment",
          "As a combination of engineering, testing and skepticism that produced a reliable method",
          "As a failure of British science",
        ],
        answer: 2,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Longitude depends on knowing reference time: 15 degrees per hour of difference.",
      "Clocks couldn't keep time at sea; the 1714 Longitude Act offered a large reward.",
      "Harrison's H4 lost about five seconds on the 1761–62 voyage to Jamaica.",
      "Lunar tables and chronometers both mattered; testing and skepticism played a role.",
    ],
  },
  {
    slug: "habits-are-built-in-small-loops",
    title: "Habits Are Built in Small Loops",
    category: "personal-development",
    difficulty: 1,
    summary: "What research says about how long habits take — and why missing a day is fine.",
    body: `Most of what we do each day happens without much thought. We brush our teeth, check our phones and take the same route to work, often without deciding to. These behaviors are habits: actions that have become automatic responses to familiar situations. Understanding how they form can make it much easier to build new ones, such as a daily reading practice.

Researchers often describe a habit as a loop with three parts. First comes a cue, a trigger such as a time of day, a place or a preceding action. Then comes the routine, the behavior itself. Finally there is a reward, some benefit that makes the brain more likely to repeat the loop next time. With enough repetition in the same context, the cue alone begins to prompt the behavior.

How long does this take? A popular claim says twenty-one days, but research suggests the real answer varies widely. In a well-known 2010 study, Phillippa Lally and her colleagues at University College London asked volunteers to adopt a new daily behavior, such as eating a piece of fruit with lunch or going for a short run. The time it took for the behavior to feel automatic ranged from eighteen days to more than two hundred, with a median of about sixty-six days. Simple behaviors became automatic faster than complex ones.

The same study contained an encouraging finding. Missing a single day did not seriously disrupt the process. What mattered was consistency over time, not perfection. This is useful to remember, because many people abandon a new habit after one slip, believing they have failed.

Several practical strategies follow from this research. Tie the new behavior to an existing cue, for example, "After I pour my morning coffee, I will read for ten minutes." Make the first version small enough that it is hard to refuse. Keep the context stable, such as the same chair or the same time each day. And notice the reward, whether it is the satisfaction of a finished chapter or the small pleasure of checking off a goal.

Reading faster and more effectively is a skill that improves with regular practice. A short, consistent daily session will usually do more than an occasional marathon. The goal is not to be heroic once, but to make reading something you simply do.`,
    questions: [
      {
        q: "What are the three parts of the habit loop described in the passage?",
        options: [
          "Goal, plan and result",
          "Cue, routine and reward",
          "Thought, action and habit",
          "Start, middle and end",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "What was the median time for a behavior to become automatic in Lally's study?",
        options: ["About 21 days", "About 18 days", "About 66 days", "About 254 days"],
        answer: 2,
        kind: "detail",
      },
      {
        q: "What did the study find about missing a single day?",
        options: [
          "It reset progress to zero",
          "It did not seriously disrupt habit formation",
          "It doubled the time needed",
          "It made habits form faster",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Which example best uses an existing cue?",
        options: [
          "Reading whenever you feel motivated",
          "Reading for three hours every Sunday",
          "Reading for ten minutes after pouring your morning coffee",
          "Reading only on holidays",
        ],
        answer: 2,
        kind: "inference",
      },
      {
        q: "What is the main message of the passage?",
        options: [
          "Habits form in exactly twenty-one days",
          "Consistent, small daily actions in a stable context build lasting habits",
          "Complex habits form faster than simple ones",
          "Rewards are unnecessary for habits",
        ],
        answer: 1,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Habits are cue → routine → reward loops repeated in a stable context.",
      "Automaticity took 18 to 200+ days (median ~66) in Lally's 2010 study.",
      "Missing one day didn't seriously disrupt progress.",
      "Anchor new habits to existing cues and start small.",
    ],
  },
  {
    slug: "deliberate-practice",
    title: "Deliberate Practice",
    category: "personal-development",
    difficulty: 2,
    summary: "Ten thousand hours of the wrong kind of practice won't get you there. What the research actually says.",
    body: `Many people have heard that it takes ten thousand hours of practice to become an expert. The number became famous through popular books in the late 2000s, but it grew out of research by the psychologist Anders Ericsson, who spent decades studying how top performers in music, sports, chess and medicine developed their abilities. Ericsson himself was frustrated by how the idea was simplified. The hours mattered, he argued, but the kind of practice mattered far more.

In a well-known study published in 1993, Ericsson and his colleagues examined violin students at a music academy in Berlin. The most accomplished students had, on average, accumulated far more hours of solitary, focused practice by their late teens than their less accomplished peers. But the researchers emphasized that this was not just playing the violin. It was a specific type of effort they called deliberate practice.

Deliberate practice has several features. It targets specific aspects of performance that need improvement, rather than repeating what is already comfortable. It takes place at the edge of a person's current ability, where mistakes are common. It involves immediate, informative feedback, often from a teacher or coach. And it requires full concentration, which is why even elite performers can sustain it only for limited periods each day, often around an hour at a time.

This explains why years of experience do not automatically produce expertise. A person who has played tennis casually every weekend for twenty years may be no better than they were after the first few. They have accumulated hours, but not the kind that pushes the boundaries of skill. Without challenge and feedback, performance tends to plateau at a level that feels comfortable and automatic.

Later research has added nuance. Analyses combining many studies found that the amount of deliberate practice explains a meaningful share of differences in performance, but far from all of it, and the share varies by field. Factors such as starting age, natural aptitude, quality of instruction and opportunity also matter. Practice is necessary, but it is not the whole story.

The core lessons still apply to almost any skill, including reading. Identify a specific weakness, such as losing focus in dense paragraphs or rereading lines unnecessarily. Work slightly beyond your comfort zone, measure the result honestly and adjust. Short, focused sessions with clear feedback will usually do more than long, unfocused ones.`,
    questions: [
      {
        q: "What frustrated Ericsson about the \"ten thousand hours\" idea?",
        options: [
          "The number was too low",
          "It ignored that the type of practice matters more than the hours",
          "It applied only to music",
          "It was based on someone else's research",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Which is a feature of deliberate practice?",
        options: [
          "Repeating comfortable skills",
          "Practicing for many hours without breaks",
          "Working at the edge of your ability with immediate feedback",
          "Avoiding mistakes at all costs",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Why might a weekend tennis player stop improving?",
        options: [
          "They play too often",
          "Their practice lacks challenge and feedback",
          "They started too young",
          "Tennis cannot be learned by adults",
        ],
        answer: 1,
        kind: "inference",
      },
      {
        q: "What did later research add to Ericsson's work?",
        options: [
          "That practice explains all differences in performance",
          "That practice is irrelevant",
          "That practice explains a meaningful but partial share, varying by field",
          "That only starting age matters",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "The word \"plateau\" in the passage most nearly means:",
        options: [
          "Decline sharply",
          "Stop improving and stay level",
          "Improve rapidly",
          "Become dangerous",
        ],
        answer: 1,
        kind: "vocabulary",
      },
    ],
    keyPoints: [
      "Quality of practice matters more than raw hours.",
      "Deliberate practice targets weaknesses at the edge of ability, with feedback and full focus.",
      "Experience alone leads to plateaus.",
      "Practice explains a meaningful but partial share of performance.",
    ],
  },
  {
    slug: "what-you-know-shapes-what-you-read",
    title: "What You Know Shapes What You Read",
    category: "personal-development",
    difficulty: 3,
    summary: "The biggest long-term lever for reading speed isn't your eyes. It's your knowledge.",
    body: `In 1988, two researchers, Donna Recht and Lauren Leslie, conducted a study that has been cited ever since by people who think about reading. They tested middle school students on two things: their general reading ability and their knowledge of baseball. Then they asked the students to read a passage describing half an inning of a baseball game and to explain and reenact what had happened.

The results were striking. Students who knew a lot about baseball understood and remembered the passage far better than students who knew little, and this was true regardless of their reading ability. Weak readers who knew baseball outperformed strong readers who did not. On this text, background knowledge mattered more than general reading skill.

The finding makes sense once you consider what comprehension involves. No text spells everything out. Writers constantly leave gaps that they expect readers to fill with what they already know. A sentence such as "The runner tagged up and scored on the fly ball" contains no difficult words, yet it is nearly meaningless to someone unfamiliar with baseball. Knowledge allows a reader to make those inferences instantly, freeing attention for new information. Without it, the reader must work harder simply to construct a basic understanding, and comprehension suffers.

This has important implications for anyone trying to read faster. Reading speed is not only a matter of how quickly the eyes move. Studies of eye movements show that skilled readers pause for shorter periods on familiar words and make fewer backward glances when the material is easy for them to understand. A reader who knows a field well can move through its texts quickly because each new sentence connects to an existing structure of ideas. The same reader may slow considerably in an unfamiliar subject, and that slowing is appropriate rather than a failure.

Vocabulary works in a similar way. Every unfamiliar word interrupts the flow of understanding, either forcing the reader to guess from context or to stop altogether. Because most vocabulary is learned through reading rather than direct instruction, wide reading creates a positive cycle: people who read more acquire more words and more knowledge, which makes further reading easier and more enjoyable. Researchers sometimes call this pattern, in which advantages accumulate over time, the Matthew effect.

The practical lesson is encouraging, if less dramatic than many promises about speed reading. One of the most reliable ways to become a faster, more effective reader is to read widely and regularly, especially in areas you care about. Techniques for focus and efficient eye movement can help at the margins. But over months and years, the reader who knows more will often read faster, understand more and remember better, because every page lands on prepared ground.`,
    questions: [
      {
        q: "What did Recht and Leslie's study find?",
        options: [
          "Strong readers always understood the passage best",
          "Baseball knowledge mattered more than general reading ability for this text",
          "Reading ability and knowledge were equally irrelevant",
          "Students could not reenact the inning",
        ],
        answer: 1,
        kind: "main-idea",
      },
      {
        q: "Why is the sentence about the runner \"tagging up\" used in the passage?",
        options: [
          "To show a sentence with easy words can still be hard without background knowledge",
          "To teach the rules of baseball",
          "To show that baseball writing is poorly written",
          "To provide a difficult vocabulary example",
        ],
        answer: 0,
        kind: "inference",
      },
      {
        q: "According to the passage, how do skilled readers behave on familiar material?",
        options: [
          "They read every word twice",
          "They pause for shorter periods and make fewer backward glances",
          "They skip entire paragraphs",
          "They read aloud",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "The \"Matthew effect\" refers to:",
        options: [
          "Forgetting vocabulary over time",
          "Advantages that accumulate, as readers who read more gain more",
          "Reading the same book repeatedly",
          "Slowing down in unfamiliar subjects",
        ],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "What does the author consider one of the most reliable ways to become a faster reader?",
        options: [
          "Eliminating your inner voice",
          "Training only eye movements",
          "Reading widely and regularly to build knowledge and vocabulary",
          "Reading only easy material",
        ],
        answer: 2,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Background knowledge can outweigh general reading skill for comprehension.",
      "Texts leave gaps readers fill with knowledge; without it, comprehension suffers.",
      "Familiar material produces shorter fixations and fewer regressions.",
      "Wide reading builds vocabulary and knowledge in a compounding cycle.",
    ],
  },
];
