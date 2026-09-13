// Geometry Practice — question bank and quiz rendering.
// Each question is multiple-choice: `choices` is an array of strings and
// `correct` is the index of the right one. Progress is saved to
// localStorage so answered state survives a page refresh.

const SECTIONS = [
  {
    id: "dilations",
    title: "Dilations",
    intro:
      "A dilation resizes a figure by a scale factor k from a center point C. " +
      "For a center at the origin, a point (x, y) maps to (kx, ky). For any " +
      "other center, the image is P' = C + k(P − C). Dilations preserve " +
      "angle measure and shape (similarity) but not side length, unless " +
      "k = ±1.",
    questions: [
      {
        prompt:
          "A dilation centered at the origin has scale factor 3. Point A is at (2, 5). Where does A' land?",
        choices: ["(6, 15)", "(5, 8)", "(2, 15)", "(6, 5)"],
        correct: 0,
        explanation:
          "Dilating from the origin multiplies each coordinate by the scale factor k: (kx, ky) = (3·2, 3·5) = (6, 15).",
      },
      {
        prompt:
          "Point B(−4, 6) is dilated with center (0, 0) and scale factor 1/2. What are the coordinates of B'?",
        choices: ["(−2, 3)", "(−8, 12)", "(−2, 12)", "(2, −3)"],
        correct: 0,
        explanation:
          "(kx, ky) = (0.5 · −4, 0.5 · 6) = (−2, 3).",
      },
      {
        prompt: "Which scale factor produces a reduction (a smaller image)?",
        choices: ["k = 2", "k = 1", "k = 0.5", "k = −2"],
        correct: 2,
        explanation:
          "|k| < 1 shrinks the figure (reduction). k = 1 leaves it congruent (no size change). |k| > 1 enlarges it. A negative k also reflects the image through the center in addition to scaling it.",
      },
      {
        prompt:
          "A dilation is centered at (2, 3) with scale factor 2. Point P is at (4, 5). Where does P' land?",
        choices: ["(6, 7)", "(8, 10)", "(4, 5)", "(2, 3)"],
        correct: 0,
        explanation:
          "Use P' = C + k(P − C): P − C = (2, 2), so k(P − C) = (4, 4), and P' = (2, 3) + (4, 4) = (6, 7).",
      },
      {
        prompt: "Under a dilation, which property is NOT preserved (in general)?",
        choices: ["Angle measures", "Side-length ratios", "Side lengths", "Overall shape"],
        correct: 2,
        explanation:
          "Dilations preserve angle measure, side-length ratios, and shape (the image is similar to the original), but actual side lengths change by a factor of k unless k = ±1.",
      },
      {
        prompt:
          "Triangle ABC has AB = 6. After a dilation with scale factor 2.5, what is the length of the image A'B'?",
        choices: ["15", "12", "8.5", "2.4"],
        correct: 0,
        explanation: "Dilation scales every length by |k|: 6 × 2.5 = 15.",
      },
    ],
  },
  {
    id: "transformations",
    title: "Rigid Transformations",
    intro:
      "Translations, reflections, and rotations are rigid motions (isometries): " +
      "they preserve distance and angle measure, so the image is always " +
      "congruent to the original figure.",
    questions: [
      {
        prompt:
          "Translate (3, −2) using the rule (x, y) → (x − 5, y + 4). What's the image?",
        choices: ["(−2, 2)", "(8, −6)", "(−2, −6)", "(2, 2)"],
        correct: 0,
        explanation: "(3 − 5, −2 + 4) = (−2, 2).",
      },
      {
        prompt: "Reflect the point (4, 7) over the x-axis. What's the image?",
        choices: ["(4, −7)", "(−4, 7)", "(−4, −7)", "(7, 4)"],
        correct: 0,
        explanation:
          "Reflecting over the x-axis keeps x the same and negates y: (4, −7).",
      },
      {
        prompt: "Reflect the point (4, 7) over the y-axis. What's the image?",
        choices: ["(−4, 7)", "(4, −7)", "(−4, −7)", "(7, 4)"],
        correct: 0,
        explanation:
          "Reflecting over the y-axis negates x and keeps y the same: (−4, 7).",
      },
      {
        prompt:
          "Rotate the point (2, 5) 90° counterclockwise about the origin. What's the image?",
        choices: ["(−5, 2)", "(5, −2)", "(−2, 5)", "(5, 2)"],
        correct: 0,
        explanation: "The rule for 90° CCW about the origin is (x, y) → (−y, x): (−5, 2).",
      },
      {
        prompt: "Rotate the point (2, 5) 180° about the origin. What's the image?",
        choices: ["(−2, −5)", "(2, −5)", "(−2, 5)", "(5, 2)"],
        correct: 0,
        explanation: "The rule for 180° about the origin is (x, y) → (−x, −y): (−2, −5).",
      },
      {
        prompt:
          "Which set of transformations always produces an image congruent to the original figure?",
        choices: [
          "Translations, reflections, and rotations",
          "Dilations only",
          "Translations and dilations only",
          "Only reflections",
        ],
        correct: 0,
        explanation:
          "Translations, reflections, and rotations (and any combination of them) are rigid motions — they preserve both size and shape. Dilations preserve shape (similarity) but change size unless the scale factor is ±1, so they're not rigid motions.",
      },
    ],
  },
  {
    id: "angles",
    title: "Angle Relationships",
    intro:
      "Complementary angles sum to 90°, supplementary angles sum to 180°, " +
      "vertical angles are congruent, and a transversal crossing parallel " +
      "lines creates several other equal or supplementary angle pairs.",
    questions: [
      {
        prompt: "Two angles are complementary. One measures 37°. What's the other?",
        choices: ["53°", "143°", "63°", "37°"],
        correct: 0,
        explanation: "Complementary angles sum to 90°: 90 − 37 = 53°.",
      },
      {
        prompt: "Two angles are supplementary. One measures 112°. What's the other?",
        choices: ["68°", "78°", "248°", "112°"],
        correct: 0,
        explanation: "Supplementary angles sum to 180°: 180 − 112 = 68°.",
      },
      {
        prompt:
          "Two lines intersect. One of the angles formed measures 65°. What does its vertical angle measure?",
        choices: ["65°", "115°", "25°", "35°"],
        correct: 0,
        explanation: "Vertical angles (opposite angles formed by two intersecting lines) are always congruent: 65°.",
      },
      {
        prompt:
          "Two parallel lines are cut by a transversal. One angle measures 70°. What does its corresponding angle measure?",
        choices: ["70°", "110°", "20°", "35°"],
        correct: 0,
        explanation: "Corresponding angles are congruent when the lines are parallel: 70°.",
      },
      {
        prompt:
          "Same setup: what does the co-interior (same-side interior) angle measure?",
        choices: ["110°", "70°", "20°", "160°"],
        correct: 0,
        explanation: "Co-interior angles are supplementary when the lines are parallel: 180 − 70 = 110°.",
      },
      {
        prompt: "A triangle has angles of 48° and 76°. What's the third angle?",
        choices: ["56°", "124°", "66°", "48°"],
        correct: 0,
        explanation: "A triangle's angles sum to 180°: 180 − 48 − 76 = 56°.",
      },
    ],
  },
  {
    id: "similarity",
    title: "Triangle Similarity &amp; Congruence",
    intro:
      "Congruence criteria (SSS, SAS, ASA, AAS, HL) prove two triangles are " +
      "identical in size and shape. Similarity criteria (AA, SSS~, SAS~) prove " +
      "two triangles have the same shape with proportional sides.",
    questions: [
      {
        prompt: "Which of these is NOT a valid criterion for proving triangle congruence?",
        choices: ["AAA", "SSS", "SAS", "ASA"],
        correct: 0,
        explanation:
          "AAA only shows the triangles have the same angles — that proves similarity, not congruence, since the sides could still be different lengths (think of two different-sized equilateral triangles).",
      },
      {
        prompt:
          "△ABC ~ △DEF, and △DEF is an enlargement of △ABC with scale factor 3. If AB = 4, what is DE?",
        choices: ["12", "4/3", "7", "1.33"],
        correct: 0,
        explanation: "Corresponding sides of similar figures scale by the same factor: 4 × 3 = 12.",
      },
      {
        prompt:
          "Two similar triangles have corresponding sides in ratio 2:5. The smaller triangle's perimeter is 14. What's the larger triangle's perimeter?",
        choices: ["35", "5.6", "28", "17.5"],
        correct: 0,
        explanation: "Perimeters scale the same way sides do: 14 × (5/2) = 35.",
      },
      {
        prompt:
          "Two similar triangles have corresponding sides in ratio 3:4. What's the ratio of their areas?",
        choices: ["9:16", "3:4", "6:8", "12:16"],
        correct: 0,
        explanation: "Area ratio is the square of the side ratio: (3:4)² = 9:16.",
      },
      {
        prompt:
          "The AA similarity postulate requires how many pairs of congruent angles to prove two triangles similar?",
        choices: ["2", "3", "1", "0"],
        correct: 0,
        explanation:
          "If two angles of one triangle are congruent to two angles of another, the third pair is automatically congruent too (angles sum to 180°), so only 2 pairs need to be shown.",
      },
      {
        prompt:
          "For SAS congruence, what must the given angle be, relative to the two given sides?",
        choices: [
          "The angle included between the two sides",
          "Any angle in the triangle",
          "An angle opposite one of the sides",
          "It doesn't matter which angle",
        ],
        correct: 0,
        explanation:
          "SAS requires the angle INCLUDED between the two given sides. Two sides and a non-included angle (SSA) do not guarantee congruence — that's the ambiguous case.",
      },
    ],
  },
  {
    id: "circles",
    title: "Circles",
    intro:
      "Key circle facts: circumference = 2πr, area = πr², a central angle " +
      "equals its intercepted arc, an inscribed angle is half its intercepted " +
      "arc, and arc length = (θ/360°) · 2πr.",
    questions: [
      {
        prompt: "A circle has radius 7. What's its circumference, in terms of π?",
        choices: ["14π", "7π", "49π", "28π"],
        correct: 0,
        explanation: "Circumference = 2πr = 2π(7) = 14π.",
      },
      {
        prompt: "A circle has radius 5. What's its area, in terms of π?",
        choices: ["25π", "10π", "5π", "50π"],
        correct: 0,
        explanation: "Area = πr² = π(5²) = 25π.",
      },
      {
        prompt:
          "Arc AB measures 84°. What does the central angle AOB measure?",
        choices: ["84°", "42°", "168°", "96°"],
        correct: 0,
        explanation: "A central angle always equals the measure of the arc it intercepts: 84°.",
      },
      {
        prompt: "An inscribed angle intercepts an arc measuring 100°. What's the inscribed angle?",
        choices: ["50°", "100°", "200°", "25°"],
        correct: 0,
        explanation: "The Inscribed Angle Theorem: an inscribed angle is half its intercepted arc: 100 ÷ 2 = 50°.",
      },
      {
        prompt: "An angle is inscribed in a semicircle (it subtends the diameter). What's its measure?",
        choices: ["90°", "180°", "45°", "60°"],
        correct: 0,
        explanation:
          "A diameter subtends a 180° arc, and an inscribed angle is half its arc: 180 ÷ 2 = 90°. This is why any triangle inscribed with one side as the diameter is a right triangle.",
      },
      {
        prompt: "A circle has radius 9. What's the arc length for a 60° central angle, in terms of π?",
        choices: ["3π", "6π", "9π", "1.5π"],
        correct: 0,
        explanation: "Arc length = (θ/360)·2πr = (60/360)·18π = (1/6)·18π = 3π.",
      },
    ],
  },
  {
    id: "area-volume",
    title: "Area, Surface Area &amp; Volume",
    intro:
      "Common formulas: triangle area = ½bh, trapezoid area = ½(b₁+b₂)h, " +
      "prism volume = base area × height, cylinder volume = πr²h, cube surface " +
      "area = 6s², sphere volume = (4/3)πr³.",
    questions: [
      {
        prompt: "A triangle has base 10 and height 6. What's its area?",
        choices: ["30", "60", "16", "8"],
        correct: 0,
        explanation: "Area = ½bh = ½(10)(6) = 30.",
      },
      {
        prompt: "A trapezoid has parallel sides 8 and 12, and height 5. What's its area?",
        choices: ["50", "100", "20", "25"],
        correct: 0,
        explanation: "Area = ½(b₁+b₂)h = ½(8+12)(5) = ½(20)(5) = 50.",
      },
      {
        prompt: "A rectangular prism measures 4 × 5 × 3. What's its volume?",
        choices: ["60", "12", "47", "120"],
        correct: 0,
        explanation: "Volume = l·w·h = 4 × 5 × 3 = 60.",
      },
      {
        prompt:
          "A cylinder has radius 3 and height 10. What's its volume, in terms of π?",
        choices: ["90π", "30π", "60π", "270π"],
        correct: 0,
        explanation: "Volume = πr²h = π(9)(10) = 90π.",
      },
      {
        prompt: "A cube has side length 6. What's its surface area?",
        choices: ["216", "36", "108", "1296"],
        correct: 0,
        explanation: "Surface area = 6s² = 6(36) = 216 (six square faces, each 6×6).",
      },
      {
        prompt: "A sphere has radius 3. What's its volume, in terms of π?",
        choices: ["36π", "27π", "108π", "12π"],
        correct: 0,
        explanation: "Volume = (4/3)πr³ = (4/3)π(27) = 36π.",
      },
    ],
  },
  {
    id: "right-triangles",
    title: "Pythagorean Theorem &amp; Right Triangles",
    intro:
      "For a right triangle with legs a, b and hypotenuse c: a² + b² = c². " +
      "The special ratios 45-45-90 (leg : leg : leg√2) and 30-60-90 " +
      "(short leg : short leg·√3 : 2·short leg) come up often enough to " +
      "memorize.",
    questions: [
      {
        prompt: "A right triangle has legs 3 and 4. What's the hypotenuse?",
        choices: ["5", "7", "25", "12"],
        correct: 0,
        explanation: "c² = 3² + 4² = 9 + 16 = 25, so c = 5.",
      },
      {
        prompt: "A right triangle has hypotenuse 13 and one leg 5. What's the other leg?",
        choices: ["12", "8", "18", "144"],
        correct: 0,
        explanation: "b² = 13² − 5² = 169 − 25 = 144, so b = 12.",
      },
      {
        prompt: "A 45-45-90 triangle has legs of length 6. What's the hypotenuse?",
        choices: ["6√2", "6", "12", "3√2"],
        correct: 0,
        explanation: "In a 45-45-90 triangle, hypotenuse = leg·√2 = 6√2.",
      },
      {
        prompt:
          "A 30-60-90 triangle has its shortest leg (opposite the 30° angle) equal to 5. What's the side opposite the 60° angle?",
        choices: ["5√3", "10", "5√2", "2.5√3"],
        correct: 0,
        explanation: "In a 30-60-90 triangle, the side opposite 60° is (short leg)·√3 = 5√3.",
      },
      {
        prompt: "Same triangle (short leg 5): what's the hypotenuse?",
        choices: ["10", "5√3", "5√2", "15"],
        correct: 0,
        explanation: "In a 30-60-90 triangle, the hypotenuse is twice the short leg: 2 × 5 = 10.",
      },
      {
        prompt: "Is a triangle with sides 8, 15, 17 a right triangle?",
        choices: [
          "Yes — 8² + 15² = 17²",
          "No — 8 + 15 ≠ 17",
          "No — 8² + 15² ≠ 17²",
          "Cannot be determined",
        ],
        correct: 0,
        explanation:
          "By the Converse of the Pythagorean Theorem: 8² + 15² = 64 + 225 = 289 = 17², so yes, it's a right triangle.",
      },
    ],
  },
];

const STORAGE_KEY = "geometry-practice-progress";

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    /* localStorage unavailable — progress just won't persist */
  }
}

let progress = loadProgress();
let activeSectionId = SECTIONS[0].id;

function sectionScore(section) {
  let answered = 0;
  let correct = 0;
  for (const q of section.questions) {
    const key = section.id + ":" + q.prompt;
    const state = progress[key];
    if (state) {
      answered++;
      if (state.correct) correct++;
    }
  }
  return { answered, correct, total: section.questions.length };
}

function renderNav() {
  const nav = document.getElementById("section-nav");
  nav.innerHTML = "";
  for (const section of SECTIONS) {
    const { answered, correct, total } = sectionScore(section);
    const btn = document.createElement("button");
    btn.className = "nav-item" + (section.id === activeSectionId ? " active" : "");
    btn.innerHTML =
      `<span class="nav-title">${section.title}</span>` +
      `<span class="nav-score">${answered ? correct + "/" + answered : ""} <span class="nav-total">of ${total}</span></span>`;
    btn.addEventListener("click", () => {
      activeSectionId = section.id;
      renderNav();
      renderSection();
      document.getElementById("quiz-main").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.appendChild(btn);
  }
}

function renderSection() {
  const section = SECTIONS.find((s) => s.id === activeSectionId);
  const main = document.getElementById("quiz-main");
  main.innerHTML = "";

  const header = document.createElement("div");
  header.className = "section-header";
  header.innerHTML = `<h2>${section.title}</h2><p class="section-intro">${section.intro}</p>`;
  main.appendChild(header);

  section.questions.forEach((q, qIndex) => {
    const key = section.id + ":" + q.prompt;
    const card = document.createElement("div");
    card.className = "q-card";

    const promptEl = document.createElement("div");
    promptEl.className = "q-prompt";
    promptEl.textContent = `${qIndex + 1}. ${q.prompt}`;
    card.appendChild(promptEl);

    const choicesEl = document.createElement("div");
    choicesEl.className = "q-choices";

    const state = progress[key];

    q.choices.forEach((choiceText, cIndex) => {
      const choiceBtn = document.createElement("button");
      choiceBtn.className = "q-choice";
      choiceBtn.textContent = choiceText;

      if (state) {
        choiceBtn.disabled = true;
        if (cIndex === q.correct) choiceBtn.classList.add("is-correct");
        if (cIndex === state.chosen && cIndex !== q.correct) choiceBtn.classList.add("is-wrong");
      }

      choiceBtn.addEventListener("click", () => {
        const isCorrect = cIndex === q.correct;
        progress[key] = { chosen: cIndex, correct: isCorrect };
        saveProgress(progress);
        renderNav();
        renderSection();
      });

      choicesEl.appendChild(choiceBtn);
    });

    card.appendChild(choicesEl);

    if (state) {
      const feedback = document.createElement("div");
      feedback.className = "q-feedback " + (state.correct ? "is-correct" : "is-wrong");
      const verdict = document.createElement("div");
      verdict.className = "q-verdict";
      verdict.textContent = state.correct ? "✓ Correct" : "✗ Not quite";
      feedback.appendChild(verdict);
      const explanation = document.createElement("p");
      explanation.className = "q-explanation";
      explanation.textContent = q.explanation;
      feedback.appendChild(explanation);

      const retryBtn = document.createElement("button");
      retryBtn.className = "retry-btn";
      retryBtn.textContent = "Try again";
      retryBtn.addEventListener("click", () => {
        delete progress[key];
        saveProgress(progress);
        renderNav();
        renderSection();
      });
      feedback.appendChild(retryBtn);

      card.appendChild(feedback);
    }

    main.appendChild(card);
  });
}

document.getElementById("reset-all").addEventListener("click", () => {
  if (!confirm("Reset all progress across every section?")) return;
  progress = {};
  saveProgress(progress);
  renderNav();
  renderSection();
});

renderNav();
renderSection();
