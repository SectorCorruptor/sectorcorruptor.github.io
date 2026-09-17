 /* =========================================================
   ASCENSION ARCHIVE — script.js
   Vanilla JS. Organized by feature.
   ========================================================= */

/* =========================================================
   >>> GEMINI CHATBOT CONFIG — PUT YOUR API KEY HERE <<<
   -----------------------------------------------------------
   1. Grab a free key from https://aistudio.google.com/apikey
   2. Paste it into API_KEY below, between the quotes.
   3. IMPORTANT: this is client-side code — anyone who views
      page source can see this key. That's fine for local
      testing or a private demo, but for a real public site,
      don't ship the key in the HTML/JS at all: instead, add a
      small backend endpoint (or a serverless function) that
      holds the key server-side and forwards chat requests to
      Gemini on the browser's behalf, then point sendToGemini()
      at that endpoint instead of calling Google directly.
   ========================================================= */
const GEMINI_CONFIG = {
  API_KEY: "PASTE_YOUR_GEMINI_API_KEY_HERE",   // <-- put your key here
  MODEL: "gemini-2.5-flash",                    // change model here if needed
  ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models"
};
/* ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     NAVBAR — mobile toggle + closing on link click
     --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      navMobile.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------------------------------------------------
     TABS (Classes & Tracks) — shared switch function so
     phase cards + year picker can jump straight to a tab
     --------------------------------------------------------- */
  const tabButtons = document.querySelectorAll('.tabs__btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(name) {
    tabButtons.forEach(btn => {
      const active = btn.dataset.tab === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('is-active', panel.id === `panel-${name}`);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* ---------------------------------------------------------
     HERO — phase cards jump to the matching tab
     --------------------------------------------------------- */
  document.querySelectorAll('.phase-card').forEach(card => {
    card.addEventListener('click', () => {
      switchTab(card.dataset.target);
      document.getElementById('transitions').scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------------------------------------------------------
     HERO — "what year are you in?" picker
     --------------------------------------------------------- */
  const yearInfo = {
    '1': {
      text: "You're in MYP 1 — welcome to the biggest jump of the programme.",
      linkText: 'See The Leap',
      target: 'transitions', tab: 'leap'
    },
    '2': {
      text: "You're in MYP 2 — enjoy it. MYP 3 (The Bridge) is next, and it's worth a sneak peek.",
      linkText: 'Preview The Bridge',
      target: 'transitions', tab: 'bridge'
    },
    '3': {
      text: "You're in MYP 3 — you're mid-Bridge, and The Choice is right around the corner.",
      linkText: 'See The Bridge',
      target: 'transitions', tab: 'bridge'
    },
    '4': {
      text: "You're in MYP 4 — your pathway's picked. Time to fine-tune your subject plan.",
      linkText: 'Go to the Subject Quiz',
      target: 'subject-quiz', tab: null
    },
    '5': {
      text: "You're in MYP 5 — almost through! The Subject Quiz can still help you double check your mix.",
      linkText: 'Go to the Subject Quiz',
      target: 'subject-quiz', tab: null
    }
  };

  const yearButtons = document.querySelectorAll('#yearButtons button');
  const yearResult = document.getElementById('yearResult');

  yearButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      yearButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const info = yearInfo[btn.dataset.year];
      yearResult.innerHTML = `${info.text} <a href="#${info.target}" id="yearJumpLink">${info.linkText} →</a>`;
      document.getElementById('yearJumpLink').addEventListener('click', (e) => {
        if (info.tab) { e.preventDefault(); switchTab(info.tab); }
        document.getElementById(info.target).scrollIntoView({ behavior: 'smooth' });
      });
    });
  });

  /* ---------------------------------------------------------
     GAME: MYTH OR REALITY (MYP1)
     --------------------------------------------------------- */
  const mythData = [
    { text: "You'll have the same one teacher for every subject.", verdict: 'myth', explain: "You'll actually meet a different teacher for most subject groups — often six to eight in total." },
    { text: "Grades are now letters, like A to D, for each skill.", verdict: 'reality', explain: 'Each subject has criteria (A, B, C, D) and you get a level for every one, not just a single grade.' },
    { text: "You don't really need a planner in MYP 1.", verdict: 'myth', explain: "This is exactly when a planner helps most — more teachers means more deadlines to juggle." },
    { text: "You'll still learn through inquiry-based units, like before.", verdict: 'reality', explain: 'Inquiry-based learning — exploring a big question — continues right through the MYP.' },
    { text: "ATL skills are a brand-new subject you get graded on separately.", verdict: 'myth', explain: 'ATL — Approaches to Learning, or "learning how to learn" — is built into every subject, not a class on its own.' },
    { text: "You can skip checking your timetable most days.", verdict: 'myth', explain: "With more teachers and rooms, checking your timetable becomes a daily habit worth keeping." },
    { text: "Service as Action continues from primary school.", verdict: 'reality', explain: "Helping your community keeps going all through the MYP, just with more independence." }
  ];

  const mythGrid = document.getElementById('mythGrid');
  const mythProgressEl = document.getElementById('mythProgress');
  const mythTotalEl = document.getElementById('mythTotal');
  const mythMsgEl = document.getElementById('mythMsg');
  mythTotalEl.textContent = mythData.length;
  let mythRevealed = 0;

  function buildMythGrid() {
    mythGrid.innerHTML = '';
    mythRevealed = 0;
    mythProgressEl.textContent = '0';
    mythMsgEl.textContent = '';
    mythData.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'myth-card';
      card.innerHTML = `
        <div class="myth-card__inner">
          <button class="myth-card__face myth-card__face--front" type="button">${item.text}</button>
          <div class="myth-card__face myth-card__face--back">
            <span class="myth-card__verdict myth-card__verdict--${item.verdict}">${item.verdict === 'myth' ? 'Myth' : 'Reality'}</span>
            <span class="myth-card__explain">${item.explain}</span>
          </div>
        </div>`;
      const front = card.querySelector('.myth-card__face--front');
      front.addEventListener('click', () => {
        if (!card.classList.contains('is-flipped')) {
          card.classList.add('is-flipped');
          mythRevealed++;
          mythProgressEl.textContent = String(mythRevealed);
          if (mythRevealed === mythData.length) {
            mythMsgEl.textContent = "That's all of them — nice work sorting myth from reality.";
          }
        }
      });
      mythGrid.appendChild(card);
    });
  }
  buildMythGrid();
  document.getElementById('mythReset').addEventListener('click', buildMythGrid);

  /* ---------------------------------------------------------
     GAME: MEMORY MATCH (MYP1 terms)
     --------------------------------------------------------- */
  const memoryPairs = [
    { term: 'Criteria', meaning: 'The specific skills a subject grades you on, labelled A, B, C, D.' },
    { term: 'ATL Skills', meaning: 'Learning how to learn — skills like organizing time or teamwork.' },
    { term: 'Planner', meaning: 'Your day-by-day map of homework, tests, and due dates.' },
    { term: 'Statement of Inquiry', meaning: 'The one big idea your whole unit is exploring.' }
  ];

  const memoryGrid = document.getElementById('memoryGrid');
  const memoryMovesEl = document.getElementById('memoryMoves');
  const memoryMatchedEl = document.getElementById('memoryMatched');
  const memoryTotalEl = document.getElementById('memoryTotal');
  const memoryMsgEl = document.getElementById('memoryMsg');
  memoryTotalEl.textContent = memoryPairs.length;

  let memoryFlipped = [];
  let memoryMoves = 0;
  let memoryMatched = 0;
  let memoryLock = false;

  function buildMemoryGrid() {
    memoryGrid.innerHTML = '';
    memoryFlipped = [];
    memoryMoves = 0;
    memoryMatched = 0;
    memoryLock = false;
    memoryMovesEl.textContent = '0';
    memoryMatchedEl.textContent = '0';
    memoryMsgEl.textContent = '';

    const cards = [];
    memoryPairs.forEach((pair, i) => {
      cards.push({ pairId: i, kind: 'term', label: pair.term, glyph: '🎓' });
      cards.push({ pairId: i, kind: 'meaning', label: pair.meaning, glyph: '📖' });
    });
    // shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    cards.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.pairId = c.pairId;
      card.innerHTML = `
        <div class="memory-card__inner">
          <button class="memory-card__face memory-card__face--front" type="button">${c.glyph}</button>
          <div class="memory-card__face memory-card__face--back">${c.label}</div>
        </div>`;
      card.querySelector('.memory-card__face--front').addEventListener('click', () => handleMemoryClick(card));
      memoryGrid.appendChild(card);
    });
  }

  function handleMemoryClick(card) {
    if (memoryLock) return;
    if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
    card.classList.add('is-flipped');
    memoryFlipped.push(card);

    if (memoryFlipped.length === 2) {
      memoryMoves++;
      memoryMovesEl.textContent = String(memoryMoves);
      const [a, b] = memoryFlipped;
      if (a.dataset.pairId === b.dataset.pairId) {
        a.classList.add('is-matched');
        b.classList.add('is-matched');
        memoryMatched++;
        memoryMatchedEl.textContent = String(memoryMatched);
        memoryFlipped = [];
        if (memoryMatched === memoryPairs.length) {
          memoryMsgEl.textContent = `All matched in ${memoryMoves} moves. Nicely done.`;
        }
      } else {
        memoryLock = true;
        setTimeout(() => {
          a.classList.remove('is-flipped');
          b.classList.remove('is-flipped');
          memoryFlipped = [];
          memoryLock = false;
        }, 800);
      }
    }
  }

  buildMemoryGrid();
  document.getElementById('memoryReplay').addEventListener('click', buildMemoryGrid);

  /* ---------------------------------------------------------
     GAME: HABIT STACK (Bridge)
     --------------------------------------------------------- */
  const habits = [
    'Write every deadline down the day it is given.',
    'Skim tonight\u2019s homework before dinner so nothing surprises you.',
    'Ask one question in class you did not fully understand.',
    'Keep a folder of graded work you are proud of.',
    'Spend ten minutes reviewing notes before closing your laptop.',
    'Plan tomorrow the night before, not the morning of.'
  ];

  const habitList = document.getElementById('habitList');
  const habitFill = document.getElementById('habitFill');
  const habitMsg = document.getElementById('habitMsg');

  habits.forEach((h, i) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'habit-item';
    item.innerHTML = `<span class="habit-item__check">✓</span><span>${h}</span>`;
    item.addEventListener('click', () => {
      item.classList.toggle('is-done');
      updateHabitProgress();
    });
    habitList.appendChild(item);
  });

  function updateHabitProgress() {
    const done = habitList.querySelectorAll('.is-done').length;
    const pct = Math.round((done / habits.length) * 100);
    habitFill.style.width = pct + '%';
    habitMsg.textContent = pct === 100 ? "Bridge-ready! You've built every habit on the list." : '';
  }

  /* ---------------------------------------------------------
     GAME: BUILD THE BRIDGE (4 MCQ)
     --------------------------------------------------------- */
  const bridgeQuestions = [
    {
      q: 'In MYP 3, that practice research task is best described as…',
      options: [
        { text: 'A warm-up for the real Personal Project you do later', correct: true },
        { text: 'A graded final exam worth half your grade', correct: false },
        { text: 'Something only top students have to do', correct: false }
      ]
    },
    {
      q: 'Compared to MYP 2, tasks in MYP 3 are usually…',
      options: [
        { text: 'Shorter and easier', correct: false },
        { text: 'Longer, needing you to plan your own time', correct: true },
        { text: 'Exactly the same', correct: false }
      ]
    },
    {
      q: 'How many subject groups do you still study in MYP 3?',
      options: [
        { text: 'Four', correct: false },
        { text: 'Eight, same as before', correct: true },
        { text: 'It depends on your pathway', correct: false }
      ]
    },
    {
      q: 'What starts appearing on the horizon during MYP 3?',
      options: [
        { text: 'Your MYP 4–5 subject choices', correct: true },
        { text: 'University applications', correct: false },
        { text: 'A brand new grading scale', correct: false }
      ]
    }
  ];

  const bridgeQuizArea = document.getElementById('bridgeQuizArea');
  const planks = document.querySelectorAll('.plank');
  const plankFigure = document.getElementById('plankFigure');
  let bridgeIndex = 0;
  let bridgeLaid = 0;

  function renderBridgeQuestion() {
    if (bridgeIndex >= bridgeQuestions.length) {
      bridgeQuizArea.innerHTML = `<p class="bridge-done">You crossed the bridge! All four planks are laid. 🎉</p>
        <button class="btn btn--ghost" id="bridgeReset">Try again</button>`;
      document.getElementById('bridgeReset').addEventListener('click', resetBridge);
      return;
    }
    const item = bridgeQuestions[bridgeIndex];
    const wrap = document.createElement('div');
    wrap.className = 'bridge-q';
    wrap.innerHTML = `<p>${item.q}</p><div class="bridge-q__options"></div>`;
    const optWrap = wrap.querySelector('.bridge-q__options');
    item.options.forEach(opt => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt.text;
      b.addEventListener('click', () => {
        if (optWrap.dataset.answered) return;
        optWrap.dataset.answered = 'true';
        b.classList.add(opt.correct ? 'is-correct' : 'is-wrong');
        [...optWrap.children].forEach(c => c.disabled = true);
        if (opt.correct) {
          layPlank();
        } else {
          [...optWrap.children].find(c => c.textContent === item.options.find(o => o.correct).text)
            ?.classList.add('is-correct');
        }
        setTimeout(() => {
          bridgeIndex++;
          bridgeQuizArea.innerHTML = '';
          renderBridgeQuestion();
        }, 1100);
      });
      optWrap.appendChild(b);
    });
    bridgeQuizArea.innerHTML = '';
    bridgeQuizArea.appendChild(wrap);
  }

  function layPlank() {
    bridgeLaid++;
    const plank = document.querySelector(`.plank[data-plank="${bridgeLaid}"]`);
    if (plank) plank.classList.add('is-laid');
    plankFigure.style.left = (bridgeLaid / 4 * 92) + '%';
  }

  function resetBridge() {
    bridgeIndex = 0;
    bridgeLaid = 0;
    planks.forEach(p => p.classList.remove('is-laid'));
    plankFigure.style.left = '0%';
    renderBridgeQuestion();
  }

  renderBridgeQuestion();

  /* ---------------------------------------------------------
     GAME: WHICH DOORS STAY OPEN? (Choice)
     --------------------------------------------------------- */
  const doorsData = {
    'Medicine': { pathway: 'Sciences', note: 'Medicine leans heavily on Biology and Chemistry, so the Sciences pathway keeps this door widest open — though a strong Balanced pathway can still work with the right choices.' },
    'Engineering': { pathway: 'Sciences', note: 'Physics and Maths matter most here. Sciences gives you the deepest prep, especially for Physics-heavy DP courses later.' },
    'Business': { pathway: 'Balanced', note: 'Business leans on Economics and communication skills. Balanced keeps your humanities strong while still leaving science options open.' },
    'Art & Design': { pathway: 'Balanced', note: 'Balanced guarantees you an arts or design slot — exactly what a creative path needs, without giving up everything else.' },
    'Law': { pathway: 'Balanced', note: 'Law wants strong humanities and communication. Balanced keeps Global Politics, History, or Economics well within reach.' },
    'Computer Science': { pathway: 'Sciences', note: 'Physics and Maths are your best friends here. Sciences fits well, though Balanced can too if you pair it with Digital Design.' },
    'Psychology': { pathway: 'Balanced', note: 'Psychology mixes science and humanities. Balanced keeps both a science and a humanities door open at once.' }
  };

  const doorsGrid = document.getElementById('doorsGrid');
  const doorsResult = document.getElementById('doorsResult');

  Object.keys(doorsData).forEach(field => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = field;
    btn.addEventListener('click', () => {
      doorsGrid.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const info = doorsData[field];
      doorsResult.innerHTML = `<strong>${field} → ${info.pathway} pathway.</strong><br>${info.note}`;
    });
    doorsGrid.appendChild(btn);
  });
  doorsResult.textContent = 'Tap a field above to see which pathway keeps that door open.';

  /* ---------------------------------------------------------
     GAME: DOES IT WORK? (5 combos)
     --------------------------------------------------------- */
  const worksData = [
    { combo: '3 Sciences, 2 Humanities, 1 Arts', works: true, explain: 'Fits the Sciences pathway exactly: 3 sciences + 2 humanities + 1 arts/design slot.' },
    { combo: '2 Sciences, 3 Humanities, 1 Design', works: false, explain: "Neither pathway allows 3 humanities — Balanced needs 2, Sciences needs 2." },
    { combo: '3 Sciences, 1 Humanities, 1 Arts, 1 PHE', works: false, explain: 'Sciences needs exactly 2 humanities subjects, and this combo only has 1.' },
    { combo: '2 Sciences, 2 Humanities, 1 PHE, 1 Design', works: true, explain: 'Fits the Balanced pathway: 2 sciences + 2 humanities + 1 arts/PHE + 1 design/PHE.' },
    { combo: '3 Sciences, 2 Humanities, 1 Design', works: true, explain: 'Fits the Sciences pathway: 3 sciences + 2 humanities + 1 arts/design slot.' }
  ];

  const worksArea = document.getElementById('worksArea');
  const worksScoreEl = document.getElementById('worksScore');
  let worksAnswered = 0;
  let worksCorrect = 0;

  worksData.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'works-item';
    row.innerHTML = `
      <p class="combo">${i + 1}. ${item.combo}</p>
      <div class="works-item__btns">
        <button type="button" data-guess="true">Works</button>
        <button type="button" data-guess="false">Doesn't work</button>
      </div>
      <p class="works-item__feedback"></p>`;
    const feedback = row.querySelector('.works-item__feedback');
    row.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (row.dataset.answered) return;
        row.dataset.answered = 'true';
        const guess = btn.dataset.guess === 'true';
        const correctGuess = guess === item.works;
        worksAnswered++;
        if (correctGuess) worksCorrect++;
        row.classList.add(correctGuess ? 'is-right' : 'is-wrong');
        row.querySelectorAll('.works-item__btns button').forEach(b2 => b2.disabled = true);
        feedback.textContent = `${item.works ? 'Works.' : "Doesn't work."} ${item.explain}`;
        worksScoreEl.textContent = `Score: ${worksCorrect} / ${worksData.length}`;
      });
    });
    worksArea.appendChild(row);
  });
  worksScoreEl.textContent = `Score: 0 / ${worksData.length}`;

  /* ===========================================================
     SUBJECT QUIZ (MYP 4–5)
     =========================================================== */
  const subjectMeta = {
    'Biology': 'sciences', 'Chemistry': 'sciences', 'Physics': 'sciences',
    'History': 'humanities', 'Geography': 'humanities', 'Economics': 'humanities', 'Global Politics': 'humanities',
    'Visual Arts': 'arts', 'Music': 'arts', 'Drama': 'arts',
    'Digital Design': 'design', 'Product Design': 'design',
    'Physical & Health Education': 'phe'
  };

  const sqQuestions = [
    {
      q: 'Which classroom sounds most like you?',
      options: [
        { text: 'Running experiments and figuring out why things happen', scores: { Biology: 2, Chemistry: 2, Physics: 1 } },
        { text: 'Debating big issues and how the world works', scores: { History: 2, 'Global Politics': 2, Economics: 1 } },
        { text: 'Making something with your hands or your imagination', scores: { 'Visual Arts': 2, 'Digital Design': 2, 'Product Design': 1 } },
        { text: 'Moving, building, or being active as you learn', scores: { 'Physical & Health Education': 2, 'Product Design': 1 } }
      ]
    },
    {
      q: 'What do you do in your free time?',
      options: [
        { text: 'Watch documentaries or take things apart to see how they work', scores: { Physics: 2, Chemistry: 1, 'Digital Design': 1 } },
        { text: 'Follow the news, read, or argue about current events', scores: { 'Global Politics': 2, Economics: 1, History: 1 } },
        { text: 'Draw, play music, act, or make videos', scores: { Music: 2, Drama: 2, 'Visual Arts': 1 } },
        { text: 'Play sport or just move around a lot', scores: { 'Physical & Health Education': 3 } }
      ]
    },
    {
      q: 'How do you solve a hard problem?',
      options: [
        { text: 'Test a few ideas and see what actually happens', scores: { Biology: 2, Chemistry: 1, 'Product Design': 1 } },
        { text: 'Look at the bigger picture and who it affects', scores: { Economics: 2, Geography: 2 } },
        { text: 'Sketch it out or think visually', scores: { 'Visual Arts': 2, 'Digital Design': 2 } },
        { text: 'Just start moving and figure it out as you go', scores: { 'Physical & Health Education': 2, Drama: 1 } }
      ]
    },
    {
      q: 'Picture life after the MYP. You lean toward…',
      options: [
        { text: 'A career in medicine, research, or engineering', scores: { Biology: 3, Chemistry: 2, Physics: 2 } },
        { text: 'Law, business, or something people-focused', scores: { Economics: 2, 'Global Politics': 2, History: 1 } },
        { text: 'A creative field — design, art, film, music', scores: { 'Visual Arts': 2, 'Digital Design': 2, Music: 1 } },
        { text: 'Not sure yet, but something active or hands-on', scores: { 'Physical & Health Education': 2, 'Product Design': 1 } }
      ]
    }
  ];

  const sqSteps = {
    pathway: document.getElementById('sqStepPathway'),
    questions: document.getElementById('sqStepQuestions'),
    results: document.getElementById('sqStepResults'),
    builder: document.getElementById('sqStepBuilder')
  };

  function showSqStep(name) {
    Object.entries(sqSteps).forEach(([key, el]) => el.classList.toggle('is-active', key === name));
  }

  let sqPathway = null;
  let sqIndex = 0;
  let sqScores = {};

  document.querySelectorAll('.pathway-card').forEach(card => {
    card.addEventListener('click', () => {
      sqPathway = card.dataset.pathway;
      sqIndex = 0;
      sqScores = {};
      showSqStep('questions');
      renderSqQuestion();
    });
  });

  const sqQuestionEl = document.getElementById('sqQuestion');
  const sqProgressEl = document.getElementById('sqProgress');
  const sqBackBtn = document.getElementById('sqBack');

  function renderSqQuestion() {
    const item = sqQuestions[sqIndex];
    sqProgressEl.textContent = `Question ${sqIndex + 1} of ${sqQuestions.length}`;
    sqQuestionEl.innerHTML = `<h3>${item.q}</h3><div class="sq-question__options"></div>`;
    const optWrap = sqQuestionEl.querySelector('.sq-question__options');
    item.options.forEach(opt => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt.text;
      b.addEventListener('click', () => {
        Object.entries(opt.scores).forEach(([subj, pts]) => {
          sqScores[subj] = (sqScores[subj] || 0) + pts;
        });
        sqIndex++;
        if (sqIndex >= sqQuestions.length) {
          renderSqResults();
        } else {
          renderSqQuestion();
        }
      });
      optWrap.appendChild(b);
    });
  }

  sqBackBtn.addEventListener('click', () => {
    if (sqIndex > 0) {
      sqIndex--;
      renderSqQuestion();
    } else {
      showSqStep('pathway');
    }
  });

  const sqResultsEl = document.getElementById('sqResults');

  function renderSqResults() {
    showSqStep('results');
    const sorted = Object.entries(sqScores).sort((a, b) => b[1] - a[1]);
    sqResultsEl.innerHTML = '';
    sorted.slice(0, 7).forEach(([subj, score]) => {
      let badge = { label: 'Worth a look', cls: 'badge--worth' };
      if (score >= 6) badge = { label: 'Strong pick', cls: 'badge--strong' };
      else if (score >= 3) badge = { label: 'Great fit', cls: 'badge--great' };
      const row = document.createElement('div');
      row.className = 'sq-result-row';
      row.innerHTML = `
        <div>
          <div class="sq-result-row__name">${subj}</div>
          <div class="sq-result-row__group">${subjectMeta[subj]}</div>
        </div>
        <span class="badge ${badge.cls}">${badge.label}</span>`;
      sqResultsEl.appendChild(row);
    });
  }

  document.getElementById('sqRetake').addEventListener('click', () => {
    sqPathway = null; sqIndex = 0; sqScores = {};
    showSqStep('pathway');
  });

  /* ---- BUILDER ---- */
  const builderGroupsEl = document.getElementById('builderGroups');
  const builderRulesEl = document.getElementById('builderRules');
  const builderFill = document.getElementById('builderFill');
  const builderStatus = document.getElementById('builderStatus');
  const builderDownload = document.getElementById('builderDownload');

  const groupDefs = {
    balanced: [
      { key: 'sciences', label: 'Sciences', need: 2, options: ['Biology', 'Chemistry', 'Physics'] },
      { key: 'humanities', label: 'Individuals & Societies', need: 2, options: ['History', 'Geography', 'Economics', 'Global Politics'] },
      { key: 'artsPhe', label: 'Arts or PHE (pick 1)', need: 1, options: ['Visual Arts', 'Music', 'Drama', 'Physical & Health Education'] },
      { key: 'designPhe', label: 'Design or PHE (pick 1)', need: 1, options: ['Digital Design', 'Product Design', 'Physical & Health Education'] }
    ],
    sciences: [
      { key: 'sciences', label: 'Sciences (all three, locked in)', need: 3, options: ['Biology', 'Chemistry', 'Physics'], locked: true },
      { key: 'humanities', label: 'Individuals & Societies', need: 2, options: ['History', 'Geography', 'Economics', 'Global Politics'] },
      { key: 'artsDesign', label: 'Arts or Design (pick 1)', need: 1, options: ['Visual Arts', 'Music', 'Drama', 'Digital Design', 'Product Design'] }
    ]
  };

  document.getElementById('sqToBuilder').addEventListener('click', () => {
    showSqStep('builder');
    buildBuilder();
  });

  function buildBuilder() {
    const defs = groupDefs[sqPathway] || groupDefs.balanced;
    builderRulesEl.textContent = sqPathway === 'sciences'
      ? 'Sciences pathway: all three sciences are locked in, plus two humanities and one arts/design subject.'
      : 'Balanced pathway: pick two sciences, two humanities, one arts-or-PHE, and one design-or-PHE subject.';

    builderGroupsEl.innerHTML = '';
    defs.forEach(def => {
      const group = document.createElement('div');
      group.className = 'builder-group';
      group.dataset.key = def.key;
      group.dataset.need = def.need;
      group.innerHTML = `
        <div class="builder-group__head">
          <h4>${def.label}</h4>
          <span class="builder-group__need">Choose ${def.need}</span>
        </div>
        <div class="builder-options"></div>`;
      const optWrap = group.querySelector('.builder-options');
      def.options.forEach(opt => {
        const id = `opt-${def.key}-${opt.replace(/\s+/g, '')}`;
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" id="${id}" value="${opt}" ${def.locked ? 'checked disabled' : ''}> ${opt}`;
        optWrap.appendChild(label);
        const input = label.querySelector('input');
        if (!def.locked) {
          input.addEventListener('change', () => handleBuilderChange(group, def));
        }
      });
      builderGroupsEl.appendChild(group);
      if (def.locked) group.classList.add('is-complete');
    });
    updateBuilderProgress();
  }

  function handleBuilderChange(group, def) {
    const checkedCount = group.querySelectorAll('input:checked').length;
    group.classList.toggle('is-complete', checkedCount === def.need);
    // Re-evaluate every input in the group (not just currently-enabled ones),
    // so unchecking a box properly re-enables the others once you're back under the limit.
    group.querySelectorAll('input').forEach(inp => {
      if (!inp.checked) inp.disabled = checkedCount >= def.need;
    });
    updateBuilderProgress();
  }

  function updateBuilderProgress() {
    const groups = builderGroupsEl.querySelectorAll('.builder-group');
    const complete = builderGroupsEl.querySelectorAll('.builder-group.is-complete').length;
    const pct = Math.round((complete / groups.length) * 100);
    builderFill.style.width = pct + '%';
    builderStatus.textContent = `${complete} of ${groups.length} groups complete.`;
    builderDownload.disabled = complete !== groups.length;
  }

  builderDownload.addEventListener('click', () => {
    const lines = [`My MYP 4-5 Subject Plan`, `Pathway: ${sqPathway === 'sciences' ? 'Sciences' : 'Balanced'}`, ''];
    builderGroupsEl.querySelectorAll('.builder-group').forEach(group => {
      const label = group.querySelector('h4').textContent;
      const chosen = [...group.querySelectorAll('input:checked')].map(i => i.value);
      lines.push(`${label}: ${chosen.join(', ')}`);
    });
    lines.push('', 'Plus your fixed subjects: Language & Literature, Language Acquisition, Mathematics.');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-myp-subject-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById('builderReset').addEventListener('click', buildBuilder);

  /* ===========================================================
     FOOTER — FAQ knowledge base
     =========================================================== */
  const faqData = [
    { q: 'What is the MYP?', a: 'The MYP (Middle Years Programme) is a five-year IB course for students aged 11 to 16 that mixes traditional subjects with real-world thinking skills.' },
    { q: 'How is my work graded?', a: 'Each subject has criteria — labelled A, B, C, D — and you are scored on each one separately, then combined into a final level.' },
    { q: 'What is the Personal Project?', a: 'An independent project you complete in your final MYP year, based on something you are personally interested in.' },
    { q: 'What are ATL skills?', a: 'ATL stands for Approaches to Learning — that is "learning how to learn," things like organizing time, communicating, and thinking critically.' },
    { q: 'What is Service as Action?', a: "It's the MYP's way of getting you involved in your community — volunteering, campaigns, or projects that help others." },
    { q: 'How does subject choice affect the Diploma Programme?', a: 'Your MYP 4–5 subjects build the skills for DP subjects, but they do not lock you into specific DP choices.' },
    { q: 'How many subject groups are there?', a: 'Eight: language & literature, language acquisition, individuals & societies, sciences, maths, arts, PHE, and design.' },
    { q: 'Can I change my pathway later?', a: 'Usually yes, especially early on — talk to your counselor if you are unsure.' },
    { q: 'What is a Statement of Inquiry?', a: 'It is the one-sentence big idea that your whole unit is exploring.' },
    { q: 'Do I need a planner?', a: 'Yes — even a simple one. It is the easiest way to stop deadlines sneaking up on you.' },
    { q: 'What happens if I do badly on a criterion?', a: 'You will usually get support and another chance to improve — MYP grading measures growth, not just one attempt.' },
    { q: 'Is MYP the same as IGCSE or GCSE?', a: 'No — they are different programmes, though some schools run both alongside each other.' },
    { q: "What's the difference between Balanced and Sciences pathways?", a: 'Balanced spreads your subjects evenly across groups; Sciences loads up on all three sciences for students eyeing medicine, engineering, or research.' },
    { q: 'How many teachers will I have?', a: 'Usually one per subject group, so six to eight teachers depending on your combination.' },
    { q: 'Where can I learn more officially?', a: "The IB's own MYP framework pages at ibo.org have the full official details." }
  ];

  const faqListEl = document.getElementById('faqList');
  const faqEmptyEl = document.getElementById('faqEmpty');
  const faqSearchEl = document.getElementById('faqSearch');
  const faqChipsEl = document.getElementById('faqChips');

  function renderFaq(filter = '') {
    const term = filter.trim().toLowerCase();
    const matches = faqData.filter(item =>
      item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term)
    );
    faqListEl.innerHTML = '';
    faqEmptyEl.hidden = matches.length > 0;
    matches.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'faq__item';
      el.innerHTML = `
        <button class="faq__question" type="button">${item.q}</button>
        <div class="faq__answer">${item.a}</div>`;
      el.querySelector('.faq__question').addEventListener('click', () => {
        el.classList.toggle('is-open');
      });
      faqListEl.appendChild(el);
    });
  }
  renderFaq();

  faqSearchEl.addEventListener('input', (e) => renderFaq(e.target.value));

  const popularChips = ['How is my work graded?', 'What is the Personal Project?', 'What are ATL skills?', 'Do I need a planner?'];
  popularChips.forEach(chipText => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.textContent = chipText;
    chip.addEventListener('click', () => {
      faqSearchEl.value = chipText;
      renderFaq(chipText);
      faqListEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    faqChipsEl.appendChild(chip);
  });

  /* ---------------------------------------------------------
     FOOTER — Study Tip Shuffler
     --------------------------------------------------------- */
  const tips = [
    'Rewrite tonight\u2019s homework list in the order you dread it most — do the worst one first.',
    'Five minutes reviewing your planner before bed saves twenty minutes of panic in the morning.',
    'If a rubric confuses you, ask your teacher to show you one example of a top-level answer.',
    'Study in 25-minute chunks with a 5-minute break. Your brain will thank you.',
    'Keep a running list of vocabulary you don\u2019t know — review it once a week.',
    'Teach a concept out loud to someone (or your pet). If you can explain it, you know it.',
    'Color-code your subjects in your planner — your eyes will find things faster.',
    'Before an assessment, write down what each criterion is actually asking for.',
    'Don\u2019t just reread notes — turn them into questions and quiz yourself.',
    'If you finish early, use the extra time to check your work against the task instructions.'
  ];

  const tipTextEl = document.getElementById('tipText');
  let lastTipIndex = -1;

  function showRandomTip() {
    let idx;
    do { idx = Math.floor(Math.random() * tips.length); } while (idx === lastTipIndex && tips.length > 1);
    lastTipIndex = idx;
    tipTextEl.textContent = tips[idx];
  }
  showRandomTip();
  document.getElementById('tipShuffle').addEventListener('click', showRandomTip);

  /* ===========================================================
     CHATBOT — answers questions using this page's own content,
     sent to Google Gemini as grounding context.
     =========================================================== */
  const chatbot = document.getElementById('chatbot');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotPanel = document.getElementById('chatbotPanel');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');

  let chatHistory = [];      // [{ role: 'user' | 'model', text }]
  let chatOpened = false;
  let chatBusy = false;

  function openChat() {
    chatbot.classList.add('is-open');
    chatbotToggle.setAttribute('aria-expanded', 'true');
    chatbotPanel.setAttribute('aria-hidden', 'false');
    if (!chatOpened) {
      chatOpened = true;
      appendMessage('bot', "Hi! I'm the Ascension Archive assistant. Ask me anything about the MYP — grading, transitions, the Personal Project, subject pathways — and I'll answer using what's on this site.");
    }
    chatbotInput.focus();
  }

  function closeChat() {
    chatbot.classList.remove('is-open');
    chatbotToggle.setAttribute('aria-expanded', 'false');
    chatbotPanel.setAttribute('aria-hidden', 'true');
  }

  chatbotToggle.addEventListener('click', () => {
    chatbot.classList.contains('is-open') ? closeChat() : openChat();
  });
  chatbotClose.addEventListener('click', closeChat);

  function appendMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-msg chat-msg--${role}`;
    bubble.textContent = text;
    chatbotMessages.appendChild(bubble);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return bubble;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--bot chat-msg--typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    chatbotMessages.appendChild(el);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return el;
  }

  // Pulls the guide's own text (transition copy, fact lists, FAQ, pathway
  // rules) into one block so Gemini answers from the site, not from thin air.
  function buildSiteContext() {
    const parts = [];
    parts.push('SITE: "Ascension Archive" — an independent student guide to the IB Middle Years Programme (MYP) for ages 10-16, covering the transition into MYP 1, MYP 2 into 3, choosing a subject pathway for MYP 4-5, and MYP 4-5 subject selection.');

    document.querySelectorAll('.panel-copy p, .pull-quote').forEach(el => {
      const t = el.textContent.trim();
      if (t) parts.push(t);
    });

    document.querySelectorAll('.fact-list').forEach(list => {
      const heading = list.querySelector('h3')?.textContent.trim() || '';
      const items = [...list.querySelectorAll('li')].map(li => '- ' + li.textContent.trim());
      if (items.length) parts.push(`${heading}:\n${items.join('\n')}`);
    });

    parts.push('MYP 4-5 subject pathways: Balanced pathway = two sciences, two humanities, one arts/PHE subject, one design/PHE subject (keeps the most doors open). Sciences pathway = all three sciences, two humanities, one arts/design subject (for medicine, engineering, or pure science).');

    parts.push('Frequently asked questions on this site:');
    faqData.forEach(item => parts.push(`Q: ${item.q}\nA: ${item.a}`));

    return parts.join('\n\n').slice(0, 14000); // keep the prompt a sane size
  }

  async function sendToGemini(userText) {
    if (!GEMINI_CONFIG.API_KEY || GEMINI_CONFIG.API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
      return { error: true, text: "The chat assistant isn't connected yet — add a Gemini API key in script.js (look for GEMINI_CONFIG near the top of the file) to turn this on." };
    }

    const systemPrompt = `You are the built-in assistant for a student website called "Ascension Archive," a guide to the IB Middle Years Programme (MYP). Speak in a friendly, plain-spoken way for students aged 10-16 — short sentences, no unexplained jargon. Answer using ONLY the site content provided below. Keep answers to 2-5 sentences unless the student asks for more. If something isn't covered by the site content, say so honestly rather than guessing, and suggest which part of the site (Home, Classes & Tracks, Subject Quiz, or Helpful Tips) might help instead.\n\nSITE CONTENT:\n${buildSiteContext()}`;

    const contents = chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    contents.push({ role: 'user', parts: [{ text: userText }] });

    const url = `${GEMINI_CONFIG.ENDPOINT}/${GEMINI_CONFIG.MODEL}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.4, maxOutputTokens: 350 }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: true, text: data?.error?.message || 'Gemini returned an error. Double-check your API key and model name in GEMINI_CONFIG.' };
      }
      const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('').trim();
      return { error: false, text: text || "I couldn't find a good answer to that — try asking it a different way?" };
    } catch (err) {
      return { error: true, text: "Couldn't reach the Gemini API — check your internet connection and try again." };
    }
  }

  async function handleChatSubmit(e) {
    e.preventDefault();
    const text = chatbotInput.value.trim();
    if (!text || chatBusy) return;

    appendMessage('user', text);
    chatHistory.push({ role: 'user', text });
    chatbotInput.value = '';
    chatBusy = true;
    chatbotSend.disabled = true;

    const typingEl = showTyping();
    const result = await sendToGemini(text);
    typingEl.remove();

    if (result.error) {
      appendMessage('error', result.text);
    } else {
      appendMessage('bot', result.text);
      chatHistory.push({ role: 'model', text: result.text });
    }

    chatBusy = false;
    chatbotSend.disabled = false;
    chatbotInput.focus();
  }

  chatbotForm.addEventListener('submit', handleChatSubmit);

});

