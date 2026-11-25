import type { PassageInput } from "./types";

/**
 * Standardised check-in passages: similar length (~380–420 words), moderate
 * difficulty and the same question mix, so results are comparable over time.
 * Used for placement, stage checkpoints and the weekly check-in.
 */
export const assessmentPassages: PassageInput[] = [
  {
    slug: "check-in-honeybee-dance",
    title: "The Language of the Honeybee",
    category: "science",
    difficulty: 2,
    summary: "How a forager tells her sisters where the flowers are.",
    body: `A honeybee colony can contain tens of thousands of workers, and keeping them fed requires a constant supply of nectar and pollen from flowers that may be several kilometers away. Searching the landscape at random would waste enormous energy. Instead, bees share information about where food can be found, using one of the most remarkable communication systems in the animal world.

The Austrian scientist Karl von Frisch spent decades decoding this system, work for which he shared a Nobel Prize in 1973. He observed that a forager returning from a rich source of food often performs a dance on the vertical surface of the honeycomb, surrounded by other workers who follow her movements closely.

For food sources close to the hive, the bee performs a round dance, circling first one way and then the other. This tells her sisters that food is nearby but gives little information about direction. For more distant sources, she performs the waggle dance. She runs forward in a straight line while vigorously shaking her abdomen from side to side, then loops back to her starting point and repeats the run, alternating between a left-hand and a right-hand return.

The waggle run carries two pieces of information. Its duration indicates distance: the longer the waggling lasts, the farther away the food. Its angle indicates direction. Inside the dark hive, the dancer uses gravity as a reference. Running straight up the comb means "fly toward the sun." A run angled forty degrees to the right of vertical means "fly at forty degrees to the right of the sun's direction." Because the sun moves across the sky during the day, dancers gradually adjust their angles to keep the message accurate.

Followers also gather other clues. They smell the scent of the flowers on the dancer's body and may receive samples of the nectar she has collected. The vigor and number of repetitions signal how rewarding the source is, so the best sites recruit the most foragers.

Later researchers confirmed von Frisch's interpretation using carefully controlled experiments, including robotic bees and radar tracking of recruits in flight. The dance does not work perfectly; recruits often need several trips to find the advertised site. But the system allows a colony to act almost like a single organism, directing its workforce toward the best opportunities in a changing landscape.`,
    questions: [
      {
        q: "What does the duration of the waggle run communicate?",
        options: ["The direction of the food", "The distance to the food", "The type of flower", "The time of day"],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Inside the hive, what does a run straight up the comb mean?",
        options: [
          "Fly directly away from the sun",
          "Food is inside the hive",
          "Fly toward the sun",
          "Return home immediately",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Why do dancers gradually change their angles during the day?",
        options: [
          "They become tired",
          "The sun's position moves across the sky",
          "Flowers close in the afternoon",
          "Other bees ask them to",
        ],
        answer: 1,
        kind: "inference",
      },
      {
        q: "The word \"vigorously\" most nearly means:",
        options: ["Slowly", "Energetically", "Quietly", "Carefully"],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "What is the main idea of the passage?",
        options: [
          "Bees search for food randomly",
          "Von Frisch built robotic bees",
          "Honeybees use dances to share precise information about food sources",
          "The round dance is more useful than the waggle dance",
        ],
        answer: 2,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Foragers dance on the comb to share food locations.",
      "Round dance = nearby; waggle dance encodes distance (duration) and direction (angle to the sun).",
      "Scent, samples and vigor add information about quality.",
      "Von Frisch decoded it; later experiments confirmed it.",
    ],
  },
  {
    slug: "check-in-cooling-cities",
    title: "How Cities Can Cool Themselves",
    category: "science",
    difficulty: 2,
    summary: "Why downtown feels hotter than the suburbs, and what planners are doing about it.",
    body: `On a summer evening, the center of a large city can be several degrees warmer than the surrounding countryside. This difference, known as the urban heat island effect, is not caused by a different climate but by the city itself. As heat waves become more frequent, planners are paying close attention to how buildings, streets and trees shape the temperatures people experience.

Several factors combine to produce the effect. Dark surfaces such as asphalt roads and tar roofs absorb a large share of incoming sunlight and release it slowly as heat, often well into the night. Concrete and brick store heat during the day in the same way. Cities also have fewer plants. In rural areas, trees and fields cool the air through evapotranspiration, the process in which water evaporates from soil and leaves, carrying heat away. In addition, tall buildings can trap warm air and block breezes, and vehicles, air conditioners and industry add their own waste heat.

The consequences are serious. Higher temperatures increase energy demand for cooling, which can strain power grids during heat waves. They worsen air quality by speeding the formation of ground-level ozone. Most importantly, extreme heat is dangerous to human health, particularly for older adults, young children, outdoor workers and people without air conditioning. Within a single city, neighborhoods with less tree cover are often noticeably hotter than leafier ones.

Fortunately, many solutions are relatively simple. Planting street trees provides shade and evaporative cooling; studies have found that shaded surfaces can be many degrees cooler than unshaded ones on a sunny afternoon. Cool roofs, coated with reflective materials, bounce sunlight back into the sky and can significantly reduce the temperature inside top-floor rooms. Green roofs, covered with plants, insulate buildings and manage rainwater as well. Some cities are experimenting with lighter-colored pavements and with parks designed to act as cooling corridors.

No single measure solves the problem, and each has costs and trade-offs. Trees need water and years to grow, and reflective surfaces must be placed carefully to avoid glare. But together, these strategies show that the heat of a city is partly a design choice, and that thoughtful design can make urban life safer and more comfortable as summers grow hotter.`,
    questions: [
      {
        q: "What is the urban heat island effect?",
        options: [
          "A city being warmer than its surrounding countryside",
          "A change in a region's overall climate",
          "Heat waves that occur only on islands",
          "Cooling caused by tall buildings",
        ],
        answer: 0,
        kind: "main-idea",
      },
      {
        q: "What is evapotranspiration?",
        options: [
          "Heat released by vehicles",
          "Water evaporating from soil and leaves, carrying heat away",
          "Sunlight reflecting off roofs",
          "Wind flowing between buildings",
        ],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "Which is NOT mentioned as a consequence of urban heat?",
        options: [
          "Higher energy demand",
          "Worse air quality",
          "Health risks",
          "More frequent earthquakes",
        ],
        answer: 3,
        kind: "detail",
      },
      {
        q: "How do cool roofs reduce heat?",
        options: [
          "By storing rainwater",
          "By growing plants",
          "By reflecting sunlight back into the sky",
          "By blocking breezes",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "What does the author mean by calling city heat \"partly a design choice\"?",
        options: [
          "Cities are deliberately made hot",
          "Decisions about surfaces, trees and buildings influence urban temperatures",
          "Designers cannot affect climate",
          "Only architects experience heat",
        ],
        answer: 1,
        kind: "inference",
      },
    ],
    keyPoints: [
      "Dark surfaces, stored heat, fewer plants, trapped air and waste heat warm cities.",
      "Effects: energy demand, air quality and health risks, unevenly distributed.",
      "Trees, cool roofs, green roofs and lighter pavements help.",
      "Each measure has trade-offs; urban heat is partly a design choice.",
    ],
  },
  {
    slug: "check-in-story-of-tea",
    title: "One Plant, Many Teas",
    category: "history",
    difficulty: 2,
    summary: "Green, black, white and oolong all come from the same shrub. The difference is what happens next.",
    body: `Walk into a tea shop and you may find hundreds of varieties: delicate white teas, grassy greens, rich blacks and complex oolongs. It is easy to assume that each comes from a different plant. In fact, nearly all true tea comes from a single species, Camellia sinensis, an evergreen shrub native to the region where southwestern China meets northern Myanmar and northeastern India. Herbal infusions such as chamomile or peppermint are not technically tea at all.

What separates the main types of tea is mostly processing, and in particular oxidation. When tea leaves are bruised, rolled or cut, enzymes inside them react with oxygen, gradually turning the leaves darker and changing their flavor, much as a cut apple turns brown. Tea makers control this reaction carefully.

For green tea, the leaves are heated soon after picking, by pan-firing in much of China or by steaming in Japan. The heat deactivates the enzymes and prevents significant oxidation, preserving a fresh, vegetal character. Black tea takes the opposite approach: the leaves are withered, rolled and allowed to oxidize fully before drying, producing darker leaves and a stronger, often malty taste. Oolong sits between the two, partially oxidized to varying degrees. White tea is the least processed, typically made from young buds and leaves that are simply withered and dried.

Tea has a long history in China, where it was consumed as a medicine and later as an everyday drink for well over a thousand years. Detailed writing about tea appeared during the Tang dynasty, including a famous treatise on its cultivation and preparation. From China, tea culture spread to Japan and Korea, and later traveled along trade routes to Central Asia and beyond.

Tea reached Europe in the seventeenth century through Dutch and Portuguese traders and became especially popular in Britain. Demand was so great that it shaped global trade and politics. In the nineteenth century, the British began large-scale cultivation in India, particularly in Assam, partly to reduce dependence on Chinese supplies. Today, tea is one of the most widely consumed beverages in the world, second only to water by many estimates.

The next time you choose between a green and a black tea, you are not choosing between plants. You are choosing between two different decisions about time, heat and air.`,
    questions: [
      {
        q: "What do green, black, white and oolong teas have in common?",
        options: [
          "They are all herbal infusions",
          "They all come from Camellia sinensis",
          "They are all fully oxidized",
          "They were all invented in Britain",
        ],
        answer: 1,
        kind: "main-idea",
      },
      {
        q: "Why are green tea leaves heated soon after picking?",
        options: [
          "To deactivate enzymes and prevent significant oxidation",
          "To make them darker",
          "To add a malty flavor",
          "To remove caffeine",
        ],
        answer: 0,
        kind: "detail",
      },
      {
        q: "How is oolong tea described?",
        options: ["Unprocessed", "Fully oxidized", "Partially oxidized", "Made from flowers"],
        answer: 2,
        kind: "detail",
      },
      {
        q: "Why did the British begin growing tea in India?",
        options: [
          "Indian tea was the only kind available",
          "China banned tea exports completely",
          "Partly to reduce dependence on Chinese supplies",
          "Tea could not grow in China",
        ],
        answer: 2,
        kind: "detail",
      },
      {
        q: "What does the final sentence suggest?",
        options: [
          "Black tea is healthier",
          "Tea types differ mainly in how leaves are processed",
          "Tea should be drunk quickly",
          "Air ruins tea",
        ],
        answer: 1,
        kind: "inference",
      },
    ],
    keyPoints: [
      "Nearly all true tea comes from Camellia sinensis.",
      "Oxidation, controlled by processing, separates the types.",
      "Green: heated early; black: fully oxidized; oolong: partial; white: minimal.",
      "Tea spread from China to Asia, then Europe; Britain grew it in India.",
    ],
  },
  {
    slug: "check-in-blue-sky",
    title: "Why the Sky Is Blue",
    category: "science",
    difficulty: 2,
    summary: "Sunlight contains every color. The air decides which one you see overhead.",
    body: `Sunlight looks white, but it is really a mixture of all the colors of the rainbow. You can see this when light passes through a prism or a raindrop and spreads into a band of red, orange, yellow, green, blue and violet. Each color corresponds to a different wavelength. Red light has the longest wavelengths of visible light, and blue and violet have the shortest.

When sunlight enters the atmosphere, it collides with gas molecules, mainly nitrogen and oxygen. These molecules are far smaller than the wavelength of visible light, and they scatter light in all directions. Crucially, they do not scatter all colors equally. Shorter wavelengths are scattered much more strongly than longer ones. This process is called Rayleigh scattering, after the British physicist Lord Rayleigh, who described it mathematically in the nineteenth century. Blue light is scattered several times more than red light.

As a result, when you look at any part of the sky away from the sun, you are seeing sunlight that has been scattered toward your eyes by the air, and that scattered light is dominated by shorter wavelengths. The sky therefore appears blue.

If violet light is scattered even more than blue, why isn't the sky violet? There are several reasons. Sunlight contains less violet than blue to begin with, some violet light is absorbed high in the atmosphere, and our eyes are less sensitive to violet. The combination that reaches our brains is perceived as sky blue.

The same physics explains red sunsets. When the sun is near the horizon, its light must travel through much more atmosphere to reach you. Along that long path, most of the blue light is scattered out of the direct beam, leaving the longer wavelengths of orange and red. Dust, smoke and other particles can intensify these colors, which is why sunsets after wildfires or volcanic eruptions can be especially vivid.

Clouds, by contrast, look white because their water droplets are much larger than gas molecules. Larger particles scatter all visible wavelengths roughly equally, so the light they send toward us remains white or gray. On other planets, different atmospheres produce different skies: on Mars, fine dust gives the daytime sky a butterscotch tint, while sunsets there can appear bluish.`,
    questions: [
      {
        q: "Which color of visible light has the longest wavelengths?",
        options: ["Blue", "Violet", "Green", "Red"],
        answer: 3,
        kind: "detail",
      },
      {
        q: "What is Rayleigh scattering?",
        options: [
          "Light being absorbed by water droplets",
          "Small molecules scattering shorter wavelengths more strongly than longer ones",
          "Light bending through a prism",
          "Dust reflecting all colors equally",
        ],
        answer: 1,
        kind: "vocabulary",
      },
      {
        q: "Which is NOT given as a reason the sky isn't violet?",
        options: [
          "Sunlight contains less violet than blue",
          "Some violet is absorbed high in the atmosphere",
          "Our eyes are less sensitive to violet",
          "Violet light cannot travel through nitrogen",
        ],
        answer: 3,
        kind: "detail",
      },
      {
        q: "Why are sunsets red?",
        options: [
          "The sun changes color in the evening",
          "Light travels through more atmosphere, so blue is scattered out of the direct beam",
          "Clouds absorb blue light at night",
          "Red light is scattered more strongly at sunset",
        ],
        answer: 1,
        kind: "inference",
      },
      {
        q: "Why do clouds look white?",
        options: [
          "Their large droplets scatter all visible wavelengths roughly equally",
          "They contain white dust",
          "They block Rayleigh scattering completely",
          "They reflect only blue light",
        ],
        answer: 0,
        kind: "detail",
      },
    ],
    keyPoints: [
      "Sunlight mixes all wavelengths; red is longest, blue/violet shortest.",
      "Air molecules scatter short wavelengths more strongly (Rayleigh scattering).",
      "Less violet in sunlight, absorption and eye sensitivity make the sky blue, not violet.",
      "Long paths at sunset leave reds; large cloud droplets scatter all colors equally.",
    ],
  },
  {
    slug: "check-in-mapping-the-ocean-floor",
    title: "Mapping the Ocean Floor",
    category: "history",
    difficulty: 2,
    summary: "How a cartographer's careful drawings revealed a crack running around the planet.",
    body: `For most of history, the deep ocean floor was imagined as a vast, flat and featureless plain. Measuring its depth was painfully slow: sailors lowered a weighted rope until it touched bottom, a process that could take hours for a single point in deep water. In the twentieth century, a new technology changed that. Echo sounders sent pulses of sound toward the sea floor and timed the returning echo. Because the speed of sound in seawater was known, the time could be converted into depth, and ships could record continuous profiles as they sailed.

In the late 1940s and 1950s, researchers at Columbia University's Lamont Geological Observatory collected large amounts of this sounding data. The geologist Marie Tharp, working with her colleague Bruce Heezen, took on the task of turning these scattered profiles into maps. At the time, women were not generally permitted on research ships, so Tharp worked mainly from the data that others brought back, plotting the measurements by hand and interpreting the landscape between the ship tracks.

As she plotted profiles across the Atlantic, Tharp noticed something unexpected. Along the crest of a great mountain range running down the middle of the ocean, there was a deep V-shaped valley. She interpreted it as a rift, a place where the Earth's crust was being pulled apart. Heezen was initially skeptical; at the time, the idea that continents could drift was still considered doubtful by many geologists. But as more data accumulated, including records of earthquakes that lined up along the valley, the evidence became difficult to dismiss.

The rift turned out to be part of a system of mid-ocean ridges that winds around the globe for tens of thousands of kilometers, the longest mountain range on Earth. Its discovery became a key piece of evidence for the theory of plate tectonics, which explains that new crust forms at these ridges and spreads outward, carrying continents along with it.

In 1977, Tharp and Heezen published, with the artist Heinrich Berann, a painted map of the entire ocean floor that showed ridges, trenches and fracture zones in vivid detail. For many people, it was the first time the hidden landscape beneath the sea became visible. Tharp received wider recognition later in her life, and today she is often celebrated as one of the scientists who helped reveal how our planet works.`,
    questions: [
      {
        q: "How did echo sounders measure depth?",
        options: [
          "By lowering weighted ropes",
          "By timing sound pulses reflected from the sea floor",
          "By photographing the bottom",
          "By measuring water temperature",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Why did Tharp work mainly from data others collected?",
        options: [
          "She preferred working in the office",
          "Women were not generally permitted on research ships at the time",
          "The ships were too small",
          "She was not trained in geology",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "What did Tharp interpret the V-shaped valley to be?",
        options: [
          "An ancient riverbed",
          "A rift where the crust was being pulled apart",
          "A shipwreck site",
          "A measuring error",
        ],
        answer: 1,
        kind: "detail",
      },
      {
        q: "Why was Heezen initially skeptical?",
        options: [
          "Continental drift was still doubted by many geologists",
          "He thought the ocean was flat",
          "He disliked hand-drawn maps",
          "The data came from the Pacific",
        ],
        answer: 0,
        kind: "inference",
      },
      {
        q: "What is the main idea of the passage?",
        options: [
          "Echo sounders were invented by Tharp",
          "The ocean floor is mostly flat",
          "Tharp's careful mapping revealed the mid-ocean rift and supported plate tectonics",
          "Painted maps are more accurate than data",
        ],
        answer: 2,
        kind: "main-idea",
      },
    ],
    keyPoints: [
      "Echo sounding turned sound travel time into continuous depth profiles.",
      "Marie Tharp mapped the data by hand with Bruce Heezen.",
      "She identified a rift valley along the Mid-Atlantic Ridge.",
      "The global ridge system became key evidence for plate tectonics.",
    ],
  },
];
