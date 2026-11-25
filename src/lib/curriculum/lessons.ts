import type { Lesson, Stage } from "./types";

/**
 * The Lumen Method — a 25-session program built on what reading research
 * actually supports:
 *
 *  1. Comprehension gates speed. Progress is measured as effective reading
 *     rate (WPM × comprehension), never raw WPM alone.
 *  2. Train, then transfer. Every drill is followed by real reading, because
 *     drills on their own transfer only partially.
 *  3. Small steps. Paced practice sits ~10–25% above comfort, not 3×.
 *  4. Purpose sets pace. Strategic skills (preview, skim, scan, recall)
 *     deliver more than eye tricks.
 *  5. Habit over heroics. Short daily sessions, weekly check-ins.
 */

export const stages: Stage[] = [
  {
    id: "foundations",
    index: 0,
    title: "Foundations",
    tagline: "Measure honestly, read with attention",
    description:
      "Establish a trustworthy baseline, understand how reading really works, and remove the friction — wandering attention, habitual re-reading and word-by-word processing.",
    outcomes: ["A reliable baseline", "Focused reading setup", "Pacer and preview techniques", "Reading in two-word phrases"],
  },
  {
    id: "fluency",
    index: 1,
    title: "Fluency",
    tagline: "Read in phrases, move with rhythm",
    description:
      "Build faster word recognition and phrase reading, cut unnecessary regressions, and learn to shift deliberately between study, reading, skimming and scanning.",
    outcomes: ["Four reading gears", "Three-word phrase reading", "Sprint-and-cruise intervals", "Structured skimming"],
  },
  {
    id: "mastery",
    index: 2,
    title: "Mastery",
    tagline: "Adapt, retain, sustain",
    description:
      "Turn speed into understanding that lasts: active questioning, retrieval practice, handling dense text, reading stamina and a personal reading system.",
    outcomes: ["Questions-first reading", "Retrieval practice", "Strategies for dense text", "A sustainable daily system"],
  },
];

export const lessons: Lesson[] = [
  // ─────────────────────────────── Foundations ───────────────────────────────
  {
    id: "f1",
    stage: "foundations",
    number: 1,
    title: "Your honest baseline",
    subtitle: "Measure speed and understanding together",
    focus: "Measure",
    minutes: 6,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Speed means nothing without understanding",
        body: [
          "Most speed-reading programs start with a promise. This one starts with a measurement. You'll read a short passage at your natural pace and answer five questions. Lumen turns that into two numbers: words per minute — how quickly you covered the text — and comprehension — how much of it you actually understood.",
          "Multiply them and you get your effective reading rate, the number this program cares about most. Reading at 400 WPM with 50% comprehension gives an effective rate of 200. Reading at 280 WPM with 90% gives 252. The slower reader is getting more out of the page.",
          "Read the way you normally would. Rushing the baseline only makes your future progress harder to see.",
        ],
        takeaways: [
          "Effective rate = WPM × comprehension",
          "Aim to keep comprehension at 70% or higher",
          "A baseline is a starting line, not a grade",
        ],
        evidence:
          "A 2019 review of 190 studies (Brysbaert) estimated average adult silent reading of non-fiction at about 238 WPM.",
      },
      {
        type: "read",
        mode: "timed",
        title: "Baseline read",
        intro: "Read at your natural pace. Five questions follow, and you can't look back.",
        passage: { pick: "auto", difficulty: 1 },
        quiz: true,
      },
      {
        type: "reflect",
        prompt: "How did that pace feel?",
        options: ["Comfortable", "A little rushed", "Slow and careful", "Hard to stay focused"],
      },
    ],
  },
  {
    id: "f2",
    stage: "foundations",
    number: 2,
    title: "Attention is the engine",
    subtitle: "Most slow reading is wandering attention",
    focus: "Focus",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Your eyes are fast. Your attention is the bottleneck.",
        body: [
          "Ever reached the bottom of a page and realized you can't remember any of it? Studies that interrupt people at random moments while they read find their minds have often drifted, and usually they hadn't noticed. Those pages count toward your reading time but not toward your understanding.",
          "Before any technique, set up the conditions for attention. Use one tab, put your phone in another room, and choose a fixed session length. Keep a scrap of paper nearby for stray thoughts, so you can park them instead of chasing them.",
          "Today you'll warm up with a focus grid. Keep your eyes on the center and find the numbers in order using your peripheral vision. Then you'll read with a gentle pacer.",
        ],
        takeaways: ["Remove distractions before you start", "Notice drifting, then return without judgment", "A fixed session length helps focus"],
        evidence:
          "Mind-wandering during reading is consistently linked to lower comprehension (e.g., Smallwood and colleagues' work on 'zoning out' while reading).",
      },
      {
        type: "drill",
        exercise: "grid",
        title: "Focus grid warm-up",
        intro: "Keep your eyes on the center dot and tap the numbers in order using your peripheral vision.",
        config: { sizes: [3, 4] },
      },
      {
        type: "read",
        mode: "pacer",
        title: "Guided read",
        intro: "Follow the highlight at your comfortable pace. Let it carry your attention forward.",
        passage: { pick: "auto", difficulty: 1 },
        speed: 1,
        chunk: 3,
        quiz: true,
      },
      {
        type: "reflect",
        prompt: "How focused did you feel during the read?",
        options: ["Fully focused", "Mostly focused", "Drifted a few times", "Drifted a lot"],
      },
    ],
  },
  {
    id: "f3",
    stage: "foundations",
    number: 3,
    title: "How your eyes actually read",
    subtitle: "Fixations, saccades and what can be trained",
    focus: "Eyes",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Your eyes jump. They don't glide.",
        body: [
          "When you read, your eyes don't sweep smoothly along the line. They make quick jumps called saccades, separated by brief pauses called fixations, which usually last about a quarter of a second. You take in visual information almost entirely during fixations.",
          "Around each fixation, you can only identify letters clearly within a small window, roughly a few letters to the left and about fifteen to the right. That's why claims about 'seeing a whole page at once' don't hold up. What can improve is how quickly you recognize words, how few unnecessary backward jumps you make, and how steadily you pay attention.",
          "The flash drill you're about to do shows words for a split second, too briefly for your eyes to move. It trains you to recognize words quickly from a single glance.",
        ],
        takeaways: [
          "Reading is jumps (saccades) and pauses (fixations)",
          "Clear vision covers only a small window per fixation",
          "Trainable: recognition speed, fewer regressions and focus",
        ],
        evidence:
          "Rayner, Schotter, Masson, Potter and Treiman (2016), 'So Much to Read, So Little Time', reviews the eye-movement evidence on speed reading.",
      },
      {
        type: "drill",
        exercise: "span",
        title: "Word flash",
        intro: "Fix your eyes on the center dot. Two words flash on either side, so pick both.",
        config: { difficulty: 1, trials: 12 },
      },
      {
        type: "read",
        mode: "timed",
        title: "Transfer read",
        intro: "Now read normally. Notice the rhythm of your own eyes.",
        passage: { pick: "auto", difficulty: 1 },
        quiz: true,
      },
    ],
  },
  {
    id: "f4",
    stage: "foundations",
    number: 4,
    title: "Reading with a pacer",
    subtitle: "A guide keeps your eyes moving forward",
    focus: "Pacing",
    minutes: 7,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Give your eyes something to follow",
        body: [
          "A pacer is any guide that moves steadily through the text, like a finger, a pen or a moving highlight. It gives your eyes a target, discourages habitual re-reading and helps keep attention from drifting.",
          "Set the pace about 10% above comfortable. It should feel brisk but not frantic. If you miss a phrase, keep going, because meaning often resolves in the next sentence. If comprehension drops below about 70%, slow down. The pacer is there to help, so it shouldn't feel like a race.",
        ],
        takeaways: ["Pace 10% above comfortable", "Missed a phrase? Keep moving", "Comprehension decides the speed"],
      },
      {
        type: "read",
        mode: "pacer",
        title: "Paced read at +10%",
        intro: "The highlight moves a little faster than your comfortable pace. Stay with it.",
        passage: { pick: "auto", difficulty: 1 },
        speed: 1.1,
        chunk: 3,
        quiz: true,
      },
      {
        type: "reflect",
        prompt: "How did +10% feel?",
        options: ["Easy, ready for more", "Brisk but fine", "Slightly too fast", "Too fast to follow"],
      },
    ],
  },
  {
    id: "f5",
    stage: "foundations",
    number: 5,
    title: "Preview: read the map first",
    subtitle: "Thirty seconds that make everything else faster",
    focus: "Preview",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Build the scaffold before the details",
        body: [
          "Skilled readers rarely start at the first word and plough on. With non-fiction, they first survey the text: the title, the opening paragraph, the first sentence of each paragraph and the conclusion. This preview builds a mental scaffold, so each detail you read later has somewhere to land.",
          "This is the 'Survey' step of the long-standing SQ3R study method, and it costs very little. A 30 to 60 second preview often makes the full read both faster and clearer.",
          "You'll get 45 seconds with the skeleton of a passage, then read it in full.",
        ],
        takeaways: ["Survey title, first sentences and conclusion", "Preview in 30–60 seconds", "Previewing gives details a place to land"],
        evidence: "SQ3R (Survey, Question, Read, Recite, Review) was introduced by Francis Robinson in 1946.",
      },
      {
        type: "read",
        mode: "timed",
        title: "Preview, then read",
        intro: "First a 45-second preview of the passage's skeleton. Then read the whole thing.",
        passage: { pick: "auto", difficulty: 2 },
        preview: 45,
        quiz: true,
      },
    ],
  },
  {
    id: "f6",
    stage: "foundations",
    number: 6,
    title: "Phrases, not words",
    subtitle: "Meaning lives in groups of words",
    focus: "Phrasing",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Read the way you speak: in phrases",
        body: [
          "Read this aloud: 'The old map / on the kitchen table / showed a road / that no longer existed.' You naturally group words into phrases, and so does your understanding. Fluent readers process these meaningful units smoothly. Struggling readers often stall word by word.",
          "Chunking practice helps you take in short phrases as single units of meaning. Start with two-word groups. The goal isn't seeing more letters per glance, which your eyes limit. The goal is processing meaning in larger, natural steps.",
        ],
        takeaways: ["Group words into meaningful phrases", "Start with two-word chunks", "Fluency is processing in larger units of meaning"],
      },
      {
        type: "drill",
        exercise: "chunks",
        title: "Phrase flash",
        intro: "A short phrase flashes. Pick the exact phrase you saw.",
        config: { startSize: 2, maxSize: 3, trials: 14 },
      },
      {
        type: "read",
        mode: "rsvp",
        title: "Two-word RSVP",
        intro: "Words appear two at a time at your comfortable pace.",
        passage: { pick: "auto", difficulty: 1 },
        speed: 1,
        chunk: 2,
        quiz: true,
      },
    ],
  },
  {
    id: "f7",
    stage: "foundations",
    number: 7,
    title: "Your inner voice",
    subtitle: "Why you shouldn't try to silence it",
    focus: "Inner voice",
    minutes: 7,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Subvocalization is a feature, not a bug",
        body: [
          "Many speed-reading courses tell you to eliminate the 'voice in your head'. The research disagrees. Inner speech is a normal part of skilled silent reading. It helps hold words in working memory while you put the meaning of a sentence together, especially when the text is complex. When researchers suppress inner speech, comprehension of difficult material tends to suffer.",
          "What does happen naturally at higher speeds is that the inner voice becomes lighter and more abbreviated. Don't fight it. Today you'll read with RSVP at 15% above your comfortable speed. Notice whether your understanding keeps up.",
        ],
        takeaways: ["Inner speech supports comprehension", "It naturally lightens at higher speeds", "Suppressing it tends to hurt understanding"],
        evidence:
          "See Rayner et al. (2016) for a review of subvocalization research and why eliminating it is not supported.",
      },
      {
        type: "read",
        mode: "rsvp",
        title: "RSVP at +15%",
        intro: "One word at a time, slightly faster than comfortable. Focus on the red letter.",
        passage: { pick: "auto", difficulty: 1 },
        speed: 1.15,
        chunk: 1,
        quiz: true,
      },
      {
        type: "reflect",
        prompt: "What happened to your inner voice at that speed?",
        options: ["It kept up fully", "It got lighter", "It fell behind", "I didn't notice it"],
      },
    ],
  },
  {
    id: "f8",
    stage: "foundations",
    number: 8,
    title: "Checkpoint: Foundations",
    subtitle: "Measure how far you've come",
    focus: "Checkpoint",
    minutes: 6,
    kind: "checkpoint",
    steps: [
      {
        type: "read",
        mode: "timed",
        title: "Foundations checkpoint",
        intro:
          "A standardized passage at your natural pace, then five questions. Use what you've learned: settle your attention, preview briefly, and read in phrases.",
        passage: { pick: "checkin" },
        quiz: true,
      },
    ],
  },

  // ───────────────────────────────── Fluency ─────────────────────────────────
  {
    id: "s1",
    stage: "fluency",
    number: 9,
    title: "Four reading gears",
    subtitle: "Purpose sets the pace",
    focus: "Strategy",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Study, read, skim, scan",
        body: [
          "Expert readers don't have one speed. They have gears. Study is slow and deliberate, for material you must master. Read is your natural, comfortable pace for most texts. Skim trades detail for gist, often at two or more times your reading speed. Scan isn't really reading. It's hunting for a specific word, number or name.",
          "Claims of reading thousands of words per minute with full comprehension usually describe skimming, which always involves losing detail. That's fine when you choose it on purpose. Today you'll practice scanning, then read normally.",
        ],
        takeaways: ["Choose a gear based on purpose", "Skimming always trades away detail", "Scanning is search, not reading"],
      },
      {
        type: "drill",
        exercise: "scan",
        title: "Scan hunt",
        intro: "Find each target word in the passage as fast as you can, and tap it.",
        config: { targets: 6, difficulty: 1 },
      },
      {
        type: "read",
        mode: "timed",
        title: "Back to reading gear",
        intro: "Shift back to your natural reading pace for full understanding.",
        passage: { pick: "auto", difficulty: 2 },
        quiz: true,
      },
    ],
  },
  {
    id: "s2",
    stage: "fluency",
    number: 10,
    title: "Faster word recognition",
    subtitle: "Train the glance",
    focus: "Recognition",
    minutes: 9,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Recognize words from a single glance",
        body: [
          "Fluent readers identify familiar words almost instantly, as whole units. Recognition speed improves with exposure. That's one reason why people who read a lot read faster.",
          "Flash drills show words for less time than it takes to move your eyes, so you have to take them in from a single fixation. Be honest with yourself about what these drills do. They sharpen recognition and attention, and the benefit to real reading is partial. That's why every drill in this program is followed by real reading.",
        ],
        takeaways: ["Recognition speed grows with exposure", "Flash drills train single-glance recognition", "Always transfer to real reading"],
      },
      {
        type: "drill",
        exercise: "span",
        title: "Word flash: wider",
        intro: "The words sit farther from the center and flash faster.",
        config: { difficulty: 2, trials: 14 },
      },
      {
        type: "drill",
        exercise: "chunks",
        title: "Phrase flash: three words",
        intro: "Three-word phrases. Pick the exact one you saw.",
        config: { startSize: 3, maxSize: 4, trials: 12 },
      },
      {
        type: "read",
        mode: "pacer",
        title: "Paced transfer",
        intro: "Read with the pacer at +10% and notice the phrases.",
        passage: { pick: "auto", difficulty: 2 },
        speed: 1.1,
        chunk: 3,
        quiz: true,
      },
    ],
  },
  {
    id: "s3",
    stage: "fluency",
    number: 11,
    title: "Sprint and cruise",
    subtitle: "Brief overspeed makes normal pace feel easier",
    focus: "Intervals",
    minutes: 9,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Interval training for reading",
        body: [
          "Runners use intervals, short bursts above race pace followed by recovery. You can do the same. First, read briefly well above your comfortable speed. Comprehension will drop, and that's expected, so don't worry about it. Then return to your natural pace for a real read.",
          "Many readers find their natural pace feels easier and runs a little faster after a sprint. Formal evidence for this effect is limited, so Lumen doesn't take it on faith. Your timed read after the sprint is measured, and over time your own data shows whether it works for you.",
        ],
        takeaways: ["Sprint at +50% without worrying about comprehension", "Cruise at your natural pace, measured", "Trust your data over the technique"],
      },
      {
        type: "read",
        mode: "rsvp",
        title: "Sprint at +50%",
        intro: "Fast on purpose. Just stay with the words; there's no quiz.",
        passage: { pick: "auto", difficulty: 1 },
        speed: 1.5,
        chunk: 1,
        quiz: false,
      },
      {
        type: "read",
        mode: "timed",
        title: "Cruise",
        intro: "Now read at your natural pace. It may feel easier than usual.",
        passage: { pick: "auto", difficulty: 2 },
        quiz: true,
      },
    ],
  },
  {
    id: "s4",
    stage: "fluency",
    number: 12,
    title: "Fewer regressions",
    subtitle: "Trust your first pass a little more",
    focus: "Regressions",
    minutes: 7,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Not every backward glance is necessary",
        body: [
          "Even skilled readers move their eyes backward in roughly one of every ten to fifteen eye movements. Some of these regressions are useful, because they repair a genuine misunderstanding. Experiments that block regressions have found comprehension suffers, so the goal isn't zero.",
          "Many regressions are just habit, or a sign that attention slipped. When you feel the urge to go back, try reading on to the end of the sentence first. Often the meaning resolves itself. If it doesn't, go back on purpose.",
        ],
        takeaways: ["Some regressions are useful, many are habit", "Finish the sentence before going back", "A pacer helps break the habit"],
        evidence:
          "Schotter, Tran and Rayner (2014) showed that preventing regressions impairs comprehension of some sentences.",
      },
      {
        type: "read",
        mode: "pacer",
        title: "Paced read at +20%",
        intro: "The pacer won't wait. When you feel the urge to go back, read on.",
        passage: { pick: "auto", difficulty: 2 },
        speed: 1.2,
        chunk: 3,
        quiz: true,
      },
      {
        type: "reflect",
        prompt: "How often did you want to go back?",
        options: ["Rarely", "A few times", "Often", "Constantly"],
      },
    ],
  },
  {
    id: "s5",
    stage: "fluency",
    number: 13,
    title: "Skimming with structure",
    subtitle: "Get the gist, and know what you're trading",
    focus: "Skimming",
    minutes: 7,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Skim deliberately, not desperately",
        body: [
          "Good skimming has a method. Read the title and opening paragraph closely. Then read the first sentence of each paragraph, and watch for signal words such as 'however', 'therefore', 'the key point' and numbers. Finally, read the conclusion closely.",
          "You'll get about half the time a normal read would take. Expect to catch main ideas and miss some details, because that's the trade you're making. This session is logged as a skim, so it won't distort your reading speed stats.",
        ],
        takeaways: ["Opening, first sentences, signal words, conclusion", "Expect main ideas, not details", "Skim when the purpose allows it"],
      },
      {
        type: "read",
        mode: "timed",
        title: "Timed skim",
        intro: "You have about half your usual reading time. The text will hide when time runs out.",
        passage: { pick: "auto", difficulty: 2 },
        skimFactor: 2,
        quiz: true,
      },
    ],
  },
  {
    id: "s6",
    stage: "fluency",
    number: 14,
    title: "Chunks of three",
    subtitle: "Larger, natural units of meaning",
    focus: "Phrasing",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Move through meaning in larger steps",
        body: [
          "Three-word phrases often line up with natural grammatical units: 'in the morning', 'the research team', 'had never seen'. Reading in these units keeps your attention on meaning, not on individual words.",
          "Start the drill at three words and let it adapt. Then read with three-word RSVP at +20%.",
        ],
        takeaways: ["Three-word phrases match natural grammar", "Focus on meaning per chunk", "Let accuracy decide chunk size"],
      },
      {
        type: "drill",
        exercise: "chunks",
        title: "Phrase flash",
        intro: "Three- and four-word phrases. Pick the one you saw.",
        config: { startSize: 3, maxSize: 4, trials: 14 },
      },
      {
        type: "read",
        mode: "rsvp",
        title: "Three-word RSVP at +20%",
        intro: "Phrases of up to three words, a bit faster than comfortable.",
        passage: { pick: "auto", difficulty: 2 },
        speed: 1.2,
        chunk: 3,
        quiz: true,
      },
    ],
  },
  {
    id: "s7",
    stage: "fluency",
    number: 15,
    title: "Focus under speed",
    subtitle: "As speed rises, attention must rise too",
    focus: "Focus",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "A short ritual before you read",
        body: [
          "The faster you read, the less room there is for a wandering mind. Before demanding reading, try a ten-second ritual. Take three slow breaths, then set a purpose in one sentence: 'I'm reading to find out…'. A clear purpose gives your attention something to hold on to.",
          "You'll warm up with larger focus grids, then read with the pacer at +25%.",
        ],
        takeaways: ["Three breaths, then set a purpose", "Purpose anchors attention", "Higher speed needs more focus"],
      },
      {
        type: "drill",
        exercise: "grid",
        title: "Focus grid: larger",
        intro: "Keep your eyes centered. The grids are larger this time.",
        config: { sizes: [4, 5] },
      },
      {
        type: "read",
        mode: "pacer",
        title: "Paced read at +25%",
        intro: "Set your purpose, then follow the pacer.",
        passage: { pick: "auto", difficulty: 2 },
        speed: 1.25,
        chunk: 3,
        quiz: true,
      },
    ],
  },
  {
    id: "s8",
    stage: "fluency",
    number: 16,
    title: "Checkpoint: Fluency",
    subtitle: "Measure your progress",
    focus: "Checkpoint",
    minutes: 6,
    kind: "checkpoint",
    steps: [
      {
        type: "read",
        mode: "timed",
        title: "Fluency checkpoint",
        intro: "A standardized passage at your natural pace. Read in phrases, trust your first pass, and keep your attention steady.",
        passage: { pick: "checkin" },
        quiz: true,
      },
    ],
  },

  // ───────────────────────────────── Mastery ─────────────────────────────────
  {
    id: "m1",
    stage: "mastery",
    number: 17,
    title: "Questions first",
    subtitle: "Curiosity steers the eyes",
    focus: "Active reading",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Read to answer something",
        body: [
          "Seeing questions before you read improves memory for the information those questions target. Researchers call this the pre-questioning effect. Even when no one gives you questions, you can make your own. Turn the title and headings into questions before you begin.",
          "You'll see the question stems first, without the answer options. Then read the passage and answer.",
        ],
        takeaways: ["Turn titles and headings into questions", "Questions direct attention", "Reading becomes a search for answers"],
        evidence: "Pre-questions reliably improve learning of the questioned content (e.g., Carpenter & Toftness, 2017).",
      },
      {
        type: "read",
        mode: "timed",
        title: "Questions-first read",
        intro: "Skim the questions, then read to find the answers.",
        passage: { pick: "auto", difficulty: 3 },
        preQuestions: true,
        quiz: true,
      },
    ],
  },
  {
    id: "m2",
    stage: "mastery",
    number: 18,
    title: "Recall, don't reread",
    subtitle: "Retrieval practice makes it stick",
    focus: "Retention",
    minutes: 9,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "The testing effect",
        body: [
          "Rereading feels productive because the text becomes familiar, but familiarity isn't memory. Trying to recall what you read without looking produces much stronger long-term retention. In a well-known study by Roediger and Karpicke, students who practiced recall remembered more a week later than students who spent the same time rereading.",
          "After this read, you'll close the text and write the key ideas in your own words. Then you'll compare them with the passage's key points and answer the questions.",
        ],
        takeaways: ["Recall beats rereading", "Write key ideas in your own words", "Effortful retrieval strengthens memory"],
        evidence: "Roediger & Karpicke (2006), 'Test-Enhanced Learning', Psychological Science.",
      },
      {
        type: "read",
        mode: "timed",
        title: "Read, then recall",
        intro: "Read at your natural pace. Afterwards, write what you remember.",
        passage: { pick: "auto", difficulty: 2 },
        recall: true,
        quiz: true,
      },
    ],
  },
  {
    id: "m3",
    stage: "mastery",
    number: 19,
    title: "When to slow down",
    subtitle: "Dense text deserves a lower gear",
    focus: "Dense text",
    minutes: 9,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Slowing down is a skill",
        body: [
          "Some texts pack more ideas into each sentence than others: technical explanations, arguments with several steps, unfamiliar fields. Reading them more slowly isn't a failure. It's the right gear. Even very skilled readers slow down sharply on dense or unfamiliar material.",
          "For dense reading, preview the structure first. Read section by section, pausing briefly after each paragraph to put its point in a few words. Look up the key terms you can't work out from context.",
        ],
        takeaways: ["Density, not ability, sets the right speed", "Preview, then read section by section", "Paraphrase each paragraph's point"],
      },
      {
        type: "read",
        mode: "timed",
        title: "Dense read with preview",
        intro: "A challenging passage. Preview for 45 seconds, then read in study gear.",
        passage: { pick: "auto", difficulty: 3 },
        preview: 45,
        quiz: true,
      },
      {
        type: "reflect",
        prompt: "Which strategy helped most?",
        options: ["The preview", "Paraphrasing paragraphs", "Slowing down on purpose", "None this time"],
      },
    ],
  },
  {
    id: "m4",
    stage: "mastery",
    number: 20,
    title: "Advanced recognition",
    subtitle: "Brief exposures, larger chunks",
    focus: "Recognition",
    minutes: 9,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Pushing the edge, carefully",
        body: [
          "At the advanced level, flash exposures get shorter and the words sit farther from the center. Accuracy will drop, and that means you're at the edge of your ability, where practice is most useful. The drills adapt, getting harder after successes and easier after misses.",
          "Then you'll read with four-word pacer chunks. Keep your comprehension above 70%, and if it falls below, drop the speed next time.",
        ],
        takeaways: ["Practice at the edge of ability", "Adaptive difficulty keeps you there", "Comprehension still decides"],
      },
      {
        type: "drill",
        exercise: "span",
        title: "Word flash: advanced",
        intro: "Fast exposures, wide spacing. Keep your eyes on the dot.",
        config: { difficulty: 3, trials: 16 },
      },
      {
        type: "drill",
        exercise: "chunks",
        title: "Phrase flash: four to five",
        intro: "Longer phrases. Pick the exact one.",
        config: { startSize: 4, maxSize: 5, trials: 12 },
      },
      {
        type: "read",
        mode: "pacer",
        title: "Four-word pacer at +20%",
        intro: "Larger chunks at a brisk pace.",
        passage: { pick: "auto", difficulty: 2 },
        speed: 1.2,
        chunk: 4,
        quiz: true,
      },
    ],
  },
  {
    id: "m5",
    stage: "mastery",
    number: 21,
    title: "Interval session",
    subtitle: "Sprint, settle, cruise",
    focus: "Intervals",
    minutes: 11,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "A full interval set",
        body: [
          "This is a three-part set. First, a sprint at +60% with no quiz. Then a settle at +30% with a comprehension check. Finally, a cruise at your natural pace, measured.",
          "Look at the three numbers together afterwards. If your comprehension holds at +30%, your comfortable speed is probably ready to move up.",
        ],
        takeaways: ["Sprint, settle, cruise", "Compare comprehension across speeds", "Let results set your next comfortable speed"],
      },
      {
        type: "read",
        mode: "rsvp",
        title: "Sprint at +60%",
        intro: "Very fast. Stay with it.",
        passage: { pick: "auto", difficulty: 1 },
        speed: 1.6,
        chunk: 2,
        quiz: false,
      },
      {
        type: "read",
        mode: "rsvp",
        title: "Settle at +30%",
        intro: "Fast, but this time with questions.",
        passage: { pick: "auto", difficulty: 2 },
        speed: 1.3,
        chunk: 2,
        quiz: true,
      },
      {
        type: "read",
        mode: "timed",
        title: "Cruise",
        intro: "Your natural pace, measured.",
        passage: { pick: "auto", difficulty: 2 },
        quiz: true,
      },
    ],
  },
  {
    id: "m6",
    stage: "mastery",
    number: 22,
    title: "Scanning for facts",
    subtitle: "Find it without reading it",
    focus: "Strategy",
    minutes: 8,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Let the target do the work",
        body: [
          "When you scan, hold a clear image of the target in mind: its shape, its first letter, whether it's a number or a capitalized name. Move your eyes quickly in a zigzag down the page, and don't read the text. Capitals and digits stand out, so use them.",
          "This drill uses a longer passage and more targets.",
        ],
        takeaways: ["Hold the target's shape in mind", "Zigzag down the page", "Don't read, just search"],
      },
      {
        type: "drill",
        exercise: "scan",
        title: "Scan hunt: advanced",
        intro: "Longer passage, more targets.",
        config: { targets: 8, difficulty: 3 },
      },
      {
        type: "read",
        mode: "timed",
        title: "Back to reading gear",
        intro: "Shift gears for full understanding.",
        passage: { pick: "auto", difficulty: 3 },
        quiz: true,
      },
    ],
  },
  {
    id: "m7",
    stage: "mastery",
    number: 23,
    title: "Reading stamina",
    subtitle: "Sustain attention over longer texts",
    focus: "Endurance",
    minutes: 10,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "Attention is a muscle with a battery",
        body: [
          "Focus fades over a long reading session, especially with challenging material. Plan for it. Work in blocks of 20 to 30 minutes. Pause at section breaks to recap in a sentence, and stop before you're exhausted so the habit stays pleasant.",
          "Today you'll do a longer, challenging passage with the pacer at +15%. Notice when your attention dips, then return to the highlight.",
        ],
        takeaways: ["Read in 20–30 minute blocks", "Recap at section breaks", "Stop before exhaustion"],
      },
      {
        type: "read",
        mode: "pacer",
        title: "Long paced read",
        intro: "A long, challenging passage at +15%.",
        passage: { pick: "auto", difficulty: 3 },
        speed: 1.15,
        chunk: 3,
        quiz: true,
      },
      {
        type: "reflect",
        prompt: "When did your attention dip?",
        options: ["It didn't", "Near the middle", "Toward the end", "Throughout"],
      },
    ],
  },
  {
    id: "m8",
    stage: "mastery",
    number: 24,
    title: "Your reading system",
    subtitle: "Bring it all together, for good",
    focus: "Habit",
    minutes: 10,
    kind: "lesson",
    steps: [
      {
        type: "concept",
        title: "A system you'll actually keep",
        body: [
          "The biggest long-term lever on reading speed isn't a technique. It's knowledge. Readers who know more about a subject read it faster and understand it better, and wide reading builds that knowledge and vocabulary year after year.",
          "Your system: 10 to 15 minutes a day, ideally attached to an existing habit. Choose your gear by purpose. For important texts, preview, read and then recall. Check in weekly to keep your measurements honest. Missing a day doesn't break a habit, but quitting does.",
        ],
        takeaways: ["Read widely; knowledge compounds", "Preview → read → recall for important texts", "Daily practice plus weekly check-ins"],
        evidence:
          "Background knowledge strongly predicts comprehension (e.g., Recht & Leslie, 1988); habits form through consistent repetition (Lally et al., 2010).",
      },
      {
        type: "read",
        mode: "timed",
        title: "Full-system read",
        intro: "Preview for 30 seconds, read at your natural pace, then recall.",
        passage: { pick: "auto", difficulty: 3 },
        preview: 30,
        recall: true,
        quiz: true,
      },
      {
        type: "reflect",
        prompt: "Which technique will you keep using?",
        options: ["Previewing", "Reading in phrases", "Recall after reading", "Choosing my gear"],
      },
    ],
  },
  {
    id: "m9",
    stage: "mastery",
    number: 25,
    title: "Final assessment",
    subtitle: "See the whole journey",
    focus: "Checkpoint",
    minutes: 6,
    kind: "checkpoint",
    steps: [
      {
        type: "read",
        mode: "timed",
        title: "Final assessment",
        intro: "One more standardized passage. Use everything you've learned, and read for understanding.",
        passage: { pick: "checkin" },
        quiz: true,
      },
    ],
  },
];

export const lessonById = new Map(lessons.map((l) => [l.id, l]));

export function getLesson(id: string) {
  return lessonById.get(id) ?? null;
}

export function lessonsForStage(stage: Lesson["stage"]) {
  return lessons.filter((l) => l.stage === stage);
}
