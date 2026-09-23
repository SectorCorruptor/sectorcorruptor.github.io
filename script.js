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
     INTRO SCREEN — group name + IB intro video.
     Shows every time the site opens. The "Watch the intro"
     buttons in MYP 1–3 reopen the same video.
     --------------------------------------------------------- */
  const intro = document.getElementById('intro');
  const introVideo = document.getElementById('introVideo');
  const introEnter = document.getElementById('introEnter');
  let introReturnFocus = null;

  function openIntro(fromButton) {
    introReturnFocus = fromButton || null;
    introVideo.src = introVideo.dataset.src;
    introEnter.textContent = fromButton ? 'Back to the guide' : 'Start exploring';
    intro.classList.remove('is-closing');
    intro.hidden = false;
    document.body.classList.add('intro-open');
    introEnter.focus({ preventScroll: true });
  }

  function closeIntro() {
    intro.classList.add('is-closing');
    document.body.classList.remove('intro-open');
    setTimeout(() => {
      intro.hidden = true;
      introVideo.src = ''; // stops the video
      if (introReturnFocus) introReturnFocus.focus({ preventScroll: true });
    }, 350);
  }

  introEnter.addEventListener('click', closeIntro);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !intro.hidden) closeIntro(); });
  document.querySelectorAll('[data-open-intro]').forEach(btn => btn.addEventListener('click', () => openIntro(btn)));
  openIntro(null);

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
    'Business': { pathway: 'Balanced', note: 'Business leans on Business Studies, Economics and communication skills. Balanced keeps your humanities strong while still leaving science options open.' },
    'Art & Design': { pathway: 'Balanced', note: 'Balanced guarantees you an arts or design slot — exactly what a creative path needs, without giving up everything else.' },
    'Law': { pathway: 'Balanced', note: 'Law wants strong humanities and communication. Balanced keeps Business Studies, History, or Economics well within reach.' },
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
     Flow: intro → 4 questions → results (recommended pathway,
     with a switch to peek at the other one) → builder.
     =========================================================== */
  const subjectMeta = {
    'Biology': 'sciences', 'Chemistry': 'sciences', 'Physics': 'sciences',
    'History': 'humanities', 'Geography': 'humanities', 'Economics': 'humanities', 'Business Studies': 'humanities',
    'Visual Arts': 'arts', 'Music': 'arts', 'Drama': 'arts',
    'Digital Design': 'design', 'Integrated Design': 'design',
    'Physical & Health Education': 'phe'
  };
  const SCIENCES = ['Biology', 'Chemistry', 'Physics'];

  const sqQuestions = [
    {
      q: 'Which kind of classroom actually feels like you?',
      options: [
        { text: 'Running experiments and figuring out why things happen.', scores: { Biology: 2, Chemistry: 2, Physics: 1 } },
        { text: 'Debating or arguing about the way the world works.', scores: { History: 2, 'Business Studies': 1, Economics: 1, Geography: 1 } },
        { text: 'Creating things with your hands and ideas.', scores: { 'Visual Arts': 2, 'Digital Design': 2, 'Integrated Design': 1 } },
        { text: 'Learning by moving and building.', scores: { 'Physical & Health Education': 2, 'Integrated Design': 1 } }
      ]
    },
    {
      q: 'What do you do in your free time?',
      options: [
        { text: 'Watch documentaries or take things apart to see how they work', scores: { Physics: 2, Chemistry: 1, 'Digital Design': 1 } },
        { text: 'Follow the news, read, or argue about current events', scores: { History: 2, Economics: 1, 'Business Studies': 1 } },
        { text: 'Draw, play music, act, or make videos', scores: { Music: 2, Drama: 2, 'Visual Arts': 1 } },
        { text: 'Play sport or just move around a lot', scores: { 'Physical & Health Education': 3 } }
      ]
    },
    {
      q: 'How do you solve a hard problem?',
      options: [
        { text: 'Test a few ideas and see what actually happens', scores: { Biology: 2, Chemistry: 1, 'Integrated Design': 1 } },
        { text: 'Look at the bigger picture and who it affects', scores: { Economics: 2, Geography: 2 } },
        { text: 'Sketch it out or think visually', scores: { 'Visual Arts': 2, 'Digital Design': 2 } },
        { text: 'Just start moving and figure it out as you go', scores: { 'Physical & Health Education': 2, Drama: 1 } }
      ]
    },
    {
      q: 'Which school trip would you pick?',
      options: [
        { text: 'A science museum or a real lab tour', scores: { Physics: 2, Chemistry: 1, Biology: 1 } },
        { text: 'A parliament, a big company, or a historic site', scores: { History: 2, 'Business Studies': 1, Economics: 1 } },
        { text: 'An art gallery, a concert, or a theatre show', scores: { Drama: 2, 'Visual Arts': 1, Music: 1 } },
        { text: 'An outdoor adventure camp', scores: { 'Physical & Health Education': 2, Geography: 2 } }
      ]
    },
    {
      q: 'In a group project, which job do you grab first?',
      options: [
        { text: 'Researching the facts and checking they’re right', scores: { Biology: 1, Chemistry: 1, History: 1 } },
        { text: 'Leading the team and pitching the idea', scores: { 'Business Studies': 2, Drama: 1 } },
        { text: 'Designing the slides, poster, or logo', scores: { 'Digital Design': 2, 'Visual Arts': 1 } },
        { text: 'Building and testing the model', scores: { 'Integrated Design': 2, Physics: 1 } }
      ]
    },
    {
      q: 'Which question would you most like answered?',
      options: [
        { text: 'Why do some diseases spread faster than others?', scores: { Biology: 3 } },
        { text: 'Why are some countries richer than others?', scores: { Economics: 2, Geography: 1, 'Business Studies': 1 } },
        { text: 'How do films and songs change the way you feel?', scores: { Music: 2, Drama: 1, 'Digital Design': 1 } },
        { text: 'How do athletes train to get faster?', scores: { 'Physical & Health Education': 2, Biology: 1 } }
      ]
    },
    {
      q: 'Which of these feels the most satisfying?',
      options: [
        { text: 'Getting the right answer after a long calculation', scores: { Physics: 2, Chemistry: 2 } },
        { text: 'Winning an argument with solid evidence', scores: { History: 2, Economics: 1 } },
        { text: 'Finishing something you made from scratch', scores: { 'Integrated Design': 2, 'Visual Arts': 1 } },
        { text: 'Beating your own personal best', scores: { 'Physical & Health Education': 2 } }
      ]
    },
    {
      q: 'If you could build any app, it would be…',
      options: [
        { text: 'A tracker that measures pollution where you live', scores: { Geography: 2, Chemistry: 1, Biology: 1 } },
        { text: 'An online shop that sells something you made', scores: { 'Business Studies': 3 } },
        { text: 'A game or a music-making app', scores: { 'Digital Design': 2, Music: 2 } },
        { text: 'A fitness or sports coaching app', scores: { 'Physical & Health Education': 2, 'Digital Design': 1 } }
      ]
    },
    {
      q: 'How do you like to show what you’ve learned?',
      options: [
        { text: 'A lab report full of data and graphs', scores: { Chemistry: 2, Physics: 1, Biology: 1 } },
        { text: 'An essay or a debate', scores: { History: 2, 'Business Studies': 1 } },
        { text: 'A performance, an artwork, or a video', scores: { 'Visual Arts': 2, Drama: 1, Music: 1 } },
        { text: 'A working product or a live demo', scores: { 'Integrated Design': 2, 'Digital Design': 1 } }
      ]
    },
    {
      id: 'career',
      q: 'Picture life after the MYP. You lean toward…',
      options: [
        { text: 'A career in medicine, research, or engineering', scores: { Biology: 3, Chemistry: 2, Physics: 2 } },
        { text: 'Law, business, or something people-focused', scores: { 'Business Studies': 2, Economics: 2, History: 1 } },
        { text: 'A creative field — design, art, film, music', scores: { 'Visual Arts': 2, 'Digital Design': 2, Music: 1 } },
        { text: 'Not sure yet, but something active or hands-on', scores: { 'Physical & Health Education': 2, 'Integrated Design': 1 } }
      ]
    }
  ];

  const groupDefs = {
    balanced: [
      { key: 'sciences', label: 'Sciences', need: 2, options: ['Biology', 'Chemistry', 'Physics'] },
      { key: 'humanities', label: 'Individuals & Societies', need: 2, options: ['History', 'Geography', 'Economics', 'Business Studies'] },
      { key: 'artsPhe', label: 'Arts or PHE (pick 1)', need: 1, options: ['Visual Arts', 'Music', 'Drama', 'Physical & Health Education'] },
      { key: 'designPhe', label: 'Design or PHE (pick 1)', need: 1, options: ['Digital Design', 'Integrated Design', 'Physical & Health Education'] }
    ],
    sciences: [
      { key: 'sciences', label: 'Sciences (all three, locked in)', need: 3, options: ['Biology', 'Chemistry', 'Physics'], locked: true },
      { key: 'humanities', label: 'Individuals & Societies', need: 2, options: ['History', 'Geography', 'Economics', 'Business Studies'] },
      { key: 'artsDesign', label: 'Arts or Design (pick 1)', need: 1, options: ['Visual Arts', 'Music', 'Drama', 'Digital Design', 'Integrated Design'] }
    ]
  };

  const pathwayNames = { balanced: 'Balanced', sciences: 'Sciences' };

  const sqSteps = {
    pathway: document.getElementById('sqStepPathway'),
    questions: document.getElementById('sqStepQuestions'),
    results: document.getElementById('sqStepResults'),
    builder: document.getElementById('sqStepBuilder')
  };

  function showSqStep(name) {
    Object.entries(sqSteps).forEach(([key, el]) => el.classList.toggle('is-active', key === name));
  }

  let sqIndex = 0;
  let sqAnswers = [];          // option index per question — lets Back undo an answer properly
  let sqScores = {};
  let sqRecommended = 'balanced';
  let sqViewing = 'balanced';  // pathway currently shown on the results screen
  let sqPathway = 'balanced';  // pathway used in the builder

  function computeScores() {
    const scores = {};
    Object.keys(subjectMeta).forEach(s => { scores[s] = 0; });
    sqAnswers.forEach((optIdx, qIdx) => {
      if (optIdx == null) return;
      Object.entries(sqQuestions[qIdx].options[optIdx].scores).forEach(([subj, pts]) => {
        scores[subj] += pts;
      });
    });
    return scores;
  }

  function recommendPathway(scores) {
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const sci = SCIENCES.reduce((a, s) => a + scores[s], 0);
    const careerQ = sqQuestions.findIndex(q => q.id === 'career');
    const wantsScienceCareer = sqAnswers[careerQ] === 0;
    // Sciences if a science career is the goal, or science made up a big share of the answers
    return (wantsScienceCareer || sci / total >= 0.38) ? 'sciences' : 'balanced';
  }

  // Picks the best-scoring subjects for each slot of a pathway.
  function suggestMix(pathway, scores) {
    const taken = new Set();
    return groupDefs[pathway].map(def => {
      let picks;
      if (def.locked) {
        picks = [...def.options];
      } else {
        picks = def.options
          .filter(o => !taken.has(o))
          .map((o, i) => ({ o, i, s: scores[o] || 0 }))
          .sort((a, b) => b.s - a.s || a.i - b.i)
          .slice(0, def.need)
          .map(x => x.o);
      }
      picks.forEach(p => taken.add(p));
      return { def, picks };
    });
  }

  document.getElementById('sqStart').addEventListener('click', () => {
    sqIndex = 0;
    sqAnswers = [];
    showSqStep('questions');
    renderSqQuestion();
  });

  const sqQuestionEl = document.getElementById('sqQuestion');
  const sqProgressEl = document.getElementById('sqProgress');
  const sqBackBtn = document.getElementById('sqBack');

  function renderSqQuestion() {
    const item = sqQuestions[sqIndex];
    sqProgressEl.textContent = `Question ${sqIndex + 1} of ${sqQuestions.length}`;
    document.getElementById('sqProgressFill').style.width = `${(sqIndex / sqQuestions.length) * 100}%`;
    sqQuestionEl.innerHTML = `<h3>${item.q}</h3><div class="sq-question__options"></div>`;
    const optWrap = sqQuestionEl.querySelector('.sq-question__options');
    item.options.forEach((opt, optIdx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt.text;
      if (sqAnswers[sqIndex] === optIdx) b.classList.add('is-chosen');
      b.addEventListener('click', () => {
        sqAnswers[sqIndex] = optIdx;
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

  // Two-button switch used on the results screen and in the builder.
  function renderPathwaySwitch(container, active, onPick) {
    container.innerHTML = '';
    ['balanced', 'sciences'].forEach(key => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(key === active));
      b.className = 'pathway-switch__btn' + (key === active ? ' is-active' : '');
      b.innerHTML = `${pathwayNames[key]}${key === sqRecommended ? ' <span class="pathway-switch__tag">Recommended</span>' : ''}`;
      b.addEventListener('click', () => onPick(key));
      container.appendChild(b);
    });
  }

  const sqResultsEl = document.getElementById('sqResults');
  const sqVerdictEl = document.getElementById('sqVerdict');
  const sqSwitchEl = document.getElementById('sqPathwaySwitch');
  const sqSwitchHintEl = document.getElementById('sqSwitchHint');
  const sqMixEl = document.getElementById('sqMix');

  function renderSqResults() {
    showSqStep('results');
    sqScores = computeScores();
    sqRecommended = recommendPathway(sqScores);
    sqViewing = sqRecommended;

    sqVerdictEl.innerHTML = sqRecommended === 'sciences'
      ? 'Your answers lean toward the <strong>Sciences pathway</strong> — experiments, how things work, and science-heavy futures kept coming up.'
      : 'Your answers lean toward the <strong>Balanced pathway</strong> — you spread across different kinds of thinking, so keeping lots of doors open fits you.';

    renderResultsForPathway();

    // Overall ranking (top 7 with a score)
    const sorted = Object.entries(sqScores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    sqResultsEl.innerHTML = '';
    sorted.slice(0, 7).forEach(([subj, score]) => {
      let badge = { label: 'Worth a look', cls: 'badge--worth' };
      if (score >= 9) badge = { label: 'Strong pick', cls: 'badge--strong' };
      else if (score >= 5) badge = { label: 'Great fit', cls: 'badge--great' };
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

  function renderResultsForPathway() {
    renderPathwaySwitch(sqSwitchEl, sqViewing, (key) => { sqViewing = key; renderResultsForPathway(); });
    const other = sqViewing === 'sciences' ? 'balanced' : 'sciences';
    sqSwitchHintEl.textContent = sqViewing === sqRecommended
      ? `Curious about ${pathwayNames[other]}? Tap it above to see what your mix would look like there.`
      : `You're looking at ${pathwayNames[sqViewing]}, the one the quiz didn't pick. It's still a real option — compare it with ${pathwayNames[other]}.`;

    sqMixEl.innerHTML = '';
    suggestMix(sqViewing, sqScores).forEach(({ def, picks }) => {
      const card = document.createElement('div');
      card.className = 'sq-mix__group';
      card.innerHTML = `<p class="sq-mix__label">${def.label}</p>
        <div class="sq-mix__picks">${picks.map(p => `<span class="sq-mix__pick">${p}</span>`).join('')}</div>`;
      sqMixEl.appendChild(card);
    });
    document.getElementById('sqToBuilder').textContent = `Build my ${pathwayNames[sqViewing]} plan`;
  }

  document.getElementById('sqRetake').addEventListener('click', () => {
    sqIndex = 0; sqAnswers = []; sqScores = {};
    showSqStep('pathway');
  });

  /* ---- BUILDER ---- */
  const builderGroupsEl = document.getElementById('builderGroups');
  const builderRulesEl = document.getElementById('builderRules');
  const builderFill = document.getElementById('builderFill');
  const builderStatus = document.getElementById('builderStatus');
  const builderDownload = document.getElementById('builderDownload');
  const builderSwitchEl = document.getElementById('builderSwitch');

  document.getElementById('sqToBuilder').addEventListener('click', () => {
    sqPathway = sqViewing;
    showSqStep('builder');
    buildBuilder();
  });
  document.getElementById('builderBackResults').addEventListener('click', () => {
    sqViewing = sqPathway;
    showSqStep('results');
    renderResultsForPathway();
  });

  function buildBuilder() {
    renderPathwaySwitch(builderSwitchEl, sqPathway, (key) => { sqPathway = key; buildBuilder(); });
    const defs = groupDefs[sqPathway];
    const suggested = suggestMix(sqPathway, sqScores);
    builderRulesEl.textContent = sqPathway === 'sciences'
      ? 'Sciences pathway: all three sciences are locked in, plus two humanities and one arts/design subject. Your quiz picks are ticked — change anything you like.'
      : 'Balanced pathway: pick two sciences, two humanities, one arts-or-PHE, and one design-or-PHE subject. Your quiz picks are ticked — change anything you like.';

    builderGroupsEl.innerHTML = '';
    defs.forEach((def, gi) => {
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
      const picks = suggested[gi].picks;
      def.options.forEach(opt => {
        const id = `opt-${def.key}-${opt.replace(/[^a-z]/gi, '')}`;
        const label = document.createElement('label');
        const checked = def.locked || picks.includes(opt);
        label.innerHTML = `<input type="checkbox" id="${id}" value="${opt}" ${checked ? 'checked' : ''} ${def.locked ? 'disabled' : ''}> ${opt}`;
        optWrap.appendChild(label);
        if (!def.locked) label.querySelector('input').addEventListener('change', refreshBuilder);
      });
      builderGroupsEl.appendChild(group);
    });
    refreshBuilder();
  }

  // Enforces each group's limit, and stops one subject (like PHE) being picked in two groups.
  function refreshBuilder() {
    const defs = groupDefs[sqPathway];
    const groups = [...builderGroupsEl.querySelectorAll('.builder-group')];
    const chosenEverywhere = new Set(
      [...builderGroupsEl.querySelectorAll('input:checked')].map(i => i.value)
    );
    groups.forEach((group, gi) => {
      const def = defs[gi];
      if (def.locked) { group.classList.add('is-complete'); return; }
      const checkedCount = group.querySelectorAll('input:checked').length;
      group.classList.toggle('is-complete', checkedCount === def.need);
      group.querySelectorAll('input').forEach(inp => {
        if (inp.checked) { inp.disabled = false; return; }
        inp.disabled = checkedCount >= def.need || chosenEverywhere.has(inp.value);
      });
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

  function getBuilderSubjects() {
    return [...builderGroupsEl.querySelectorAll('input:checked')].map(i => i.value);
  }

  builderDownload.addEventListener('click', () => {
    const lines = [`My MYP 4-5 Subject Plan`, `Pathway: ${pathwayNames[sqPathway]}${sqPathway === sqRecommended ? ' (recommended by the quiz)' : ''}`, ''];
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


  /* ===========================================================
     PERSONAL STUDY PLANNER
     Inputs: subjects, assessments, struggle topics, time.
     Output: a week-by-week board of sticky notes, one per day.
     The plan rebuilds itself whenever an input changes, and
     keeps any tasks you've already ticked off.
     Saved in this browser with localStorage.
     =========================================================== */
  const PL_KEY = 'ibcompass-planner-v1';
  const MAX_WEEKS = 6;
  const CORE_SUBJECTS = ['Mathematics', 'Language & Literature', 'Language Acquisition'];
  const ALL_MYP_SUBJECTS = [...CORE_SUBJECTS, ...Object.keys(subjectMeta)];

  const plState = Object.assign({
    subjects: [], assessments: [], struggles: [],
    weekday: 60, weekend: 90, plan: null, scratch: ''
  }, loadPlanner() || {});
  let plWeek = 0; // which week of the plan is on screen

  function loadPlanner() {
    try { return JSON.parse(localStorage.getItem(PL_KEY)); } catch (e) { return null; }
  }
  function savePlanner() {
    try { localStorage.setItem(PL_KEY, JSON.stringify(plState)); } catch (e) { /* storage blocked — plan still works this session */ }
  }

  const $ = (id) => document.getElementById(id);
  const plEls = {
    subjectInput: $('plSubjectInput'), subjects: $('plSubjects'), suggestions: $('plSubjectSuggestions'),
    assessSubject: $('plAssessSubject'), assessTitle: $('plAssessTitle'), assessDate: $('plAssessDate'), assessList: $('plAssessList'),
    struggleSubject: $('plStruggleSubject'), struggleTopic: $('plStruggleTopic'), struggleList: $('plStruggleList'),
    weekday: $('plWeekday'), weekend: $('plWeekend'), weekdayOut: $('plWeekdayOut'), weekendOut: $('plWeekendOut'),
    error: $('plError'), board: $('plBoard'), upcoming: $('plUpcoming'), scratch: $('plScratch'),
    weekbar: $('plWeekbar'), weekLabel: $('plWeekLabel'), weekStats: $('plWeekStats'), weekFill: $('plWeekFill'),
    prevWeek: $('plPrevWeek'), nextWeek: $('plNextWeek'), updated: $('plUpdated')
  };

  const escapeHtml = (str) => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);

  // Dates as local YYYY-MM-DD strings, so time zones never shift a day.
  function toISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function fromISO(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
  function todayDate() { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dayDiff(a, b) { return Math.round((b - a) / 86400000); }
  function niceDate(iso) { return fromISO(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }
  function shortDate(d) { return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); }
  function mondayOf(d) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function fmtMins(m) { const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? ` ${r} min` : ''}` : `${r} min`; }

  ALL_MYP_SUBJECTS.forEach(s => {
    const o = document.createElement('option'); o.value = s; plEls.suggestions.appendChild(o);
  });

  function addSubject(name) {
    const clean = name.trim();
    if (!clean) return false;
    if (plState.subjects.some(s => s.toLowerCase() === clean.toLowerCase())) return false;
    plState.subjects.push(clean);
    return true;
  }

  // Dropdowns always have something to pick: your subjects first, then every
  // other MYP subject. Picking one you haven't added adds it for you.
  function fillSubjectSelect(sel) {
    const prev = sel.value;
    const yours = plState.subjects;
    const others = ALL_MYP_SUBJECTS.filter(s => !yours.includes(s));
    let html = '<option value="" disabled>Choose a subject</option>';
    if (yours.length) html += `<optgroup label="Your subjects">${yours.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}</optgroup>`;
    html += `<optgroup label="${yours.length ? 'Other MYP subjects' : 'MYP subjects'}">${others.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}</optgroup>`;
    sel.innerHTML = html;
    sel.value = [...sel.options].some(o => o.value === prev && prev) ? prev : (yours[0] || '');
  }

  function renderPlannerInputs() {
    plEls.subjects.innerHTML = '';
    plState.subjects.forEach(s => {
      const chip = document.createElement('span');
      chip.className = 'pl-chip';
      chip.innerHTML = `${escapeHtml(s)} <button type="button" aria-label="Remove ${escapeHtml(s)}">×</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        plState.subjects = plState.subjects.filter(x => x !== s);
        plState.assessments = plState.assessments.filter(a => a.subject !== s);
        plState.struggles = plState.struggles.filter(t => t.subject !== s);
        inputsChanged();
      });
      plEls.subjects.appendChild(chip);
    });

    fillSubjectSelect(plEls.assessSubject);
    fillSubjectSelect(plEls.struggleSubject);

    plEls.assessList.innerHTML = '';
    [...plState.assessments].sort((a, b) => a.date.localeCompare(b.date)).forEach(a => {
      const li = document.createElement('li');
      const past = fromISO(a.date) < todayDate();
      li.className = past ? 'is-past' : '';
      li.innerHTML = `<span><strong>${escapeHtml(a.subject)}</strong> — ${escapeHtml(a.title)} <em>${niceDate(a.date)}${past ? ' (done)' : ''}</em></span>
        <button type="button" aria-label="Remove assessment">×</button>`;
      li.querySelector('button').addEventListener('click', () => {
        plState.assessments = plState.assessments.filter(x => x.id !== a.id);
        inputsChanged();
      });
      plEls.assessList.appendChild(li);
    });

    plEls.struggleList.innerHTML = '';
    plState.struggles.forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `<span><strong>${escapeHtml(t.subject)}</strong> — ${escapeHtml(t.topic)}</span>
        <button type="button" aria-label="Remove topic">×</button>`;
      li.querySelector('button').addEventListener('click', () => {
        plState.struggles = plState.struggles.filter(x => x.id !== t.id);
        inputsChanged();
      });
      plEls.struggleList.appendChild(li);
    });

    plEls.weekday.value = plState.weekday;
    plEls.weekend.value = plState.weekend;
    plEls.weekdayOut.textContent = fmtMins(plState.weekday);
    plEls.weekendOut.textContent = fmtMins(plState.weekend);
  }

  // Every edit goes through here: save, redraw the form, and — if a plan
  // already exists — rebuild it straight away so it never goes stale.
  let plUpdateTimer = null;
  function inputsChanged({ redrawInputs = true } = {}) {
    if (redrawInputs) renderPlannerInputs();
    if (plState.plan) {
      plState.plan = generatePlan(plState.plan);
      renderBoard();
      plEls.updated.textContent = 'Plan updated. Ticked tasks are kept.';
      clearTimeout(plUpdateTimer);
      plUpdateTimer = setTimeout(() => { plEls.updated.textContent = ''; }, 2500);
    }
    savePlanner();
  }

  $('plSubjectAdd').addEventListener('click', () => {
    if (!plEls.subjectInput.value.trim()) { plEls.error.textContent = 'Type a subject name first.'; return; }
    plEls.error.textContent = '';
    addSubject(plEls.subjectInput.value);
    plEls.subjectInput.value = '';
    inputsChanged();
    plEls.subjectInput.focus();
  });
  plEls.subjectInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); $('plSubjectAdd').click(); }
  });
  $('plAddCore').addEventListener('click', () => {
    CORE_SUBJECTS.forEach(addSubject);
    inputsChanged();
  });

  plEls.assessDate.min = toISO(todayDate());
  $('plAssessAdd').addEventListener('click', () => {
    const subject = plEls.assessSubject.value;
    const title = plEls.assessTitle.value.trim();
    const date = plEls.assessDate.value;
    if (!subject) { plEls.error.textContent = 'Choose a subject for the assessment.'; return; }
    if (!title || !date) { plEls.error.textContent = 'Give the assessment a name and a date.'; return; }
    if (fromISO(date) < todayDate()) { plEls.error.textContent = 'That date has already passed. Pick today or later.'; return; }
    if (dayDiff(todayDate(), fromISO(date)) > MAX_WEEKS * 7) { plEls.error.textContent = `The planner looks ${MAX_WEEKS} weeks ahead. Add this one closer to the date.`; return; }
    plEls.error.textContent = '';
    addSubject(subject);
    plState.assessments.push({ id: uid(), subject, title, date });
    plEls.assessTitle.value = ''; plEls.assessDate.value = '';
    inputsChanged();
  });
  plEls.assessTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); $('plAssessAdd').click(); }
  });

  $('plStruggleAdd').addEventListener('click', () => {
    const subject = plEls.struggleSubject.value;
    const topic = plEls.struggleTopic.value.trim();
    if (!subject) { plEls.error.textContent = 'Choose a subject for the topic.'; return; }
    if (!topic) { plEls.error.textContent = 'Type the topic you find tricky.'; return; }
    plEls.error.textContent = '';
    addSubject(subject);
    plState.struggles.push({ id: uid(), subject, topic });
    plEls.struggleTopic.value = '';
    inputsChanged();
  });
  plEls.struggleTopic.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); $('plStruggleAdd').click(); }
  });

  // Sliders: update the label live, rebuild the plan when the thumb is released.
  [['weekday', 'weekdayOut'], ['weekend', 'weekendOut']].forEach(([key, out]) => {
    plEls[key].addEventListener('input', () => {
      plState[key] = +plEls[key].value;
      plEls[out].textContent = fmtMins(plState[key]);
    });
    plEls[key].addEventListener('change', () => inputsChanged({ redrawInputs: false }));
  });

  plEls.scratch.value = plState.scratch || '';
  plEls.scratch.addEventListener('input', () => { plState.scratch = plEls.scratch.value; savePlanner(); });

  /* ---- plan generation ---- */

  // Splits a day's minutes into study blocks that add up to the time you have
  // (e.g. 60 → 2 × 30, 45 → 1 × 45, 90 → 3 × 30). Blocks are 20–45 minutes.
  function splitMinutes(total) {
    if (total < 15) return [];
    let n = Math.max(1, Math.floor(total / 30));
    while (total / n > 45) n++;
    const base = Math.floor(total / n / 5) * 5;
    const blocks = Array(n).fill(base);
    let left = total - base * n;
    for (let i = 0; left >= 5; i = (i + 1) % n) { blocks[i] += 5; left -= 5; }
    return blocks;
  }

  function taskForAssessment(a, daysLeft, counters, firstToday) {
    const topics = plState.struggles.filter(t => t.subject === a.subject);
    const n = counters[a.id] = (counters[a.id] || 0) + 1;
    if (daysLeft === 1) return firstToday
      ? `Final check for ${a.title}: reread the task sheet, tick off each criterion, and pack what you need.`
      : `${a.title}: one last timed practice question, then an early night.`;
    if (daysLeft <= 3) return n % 2
      ? `${a.title}: do one timed practice question, then mark it against the criteria.`
      : `${a.title}: go through your summary sheet and cover up the answers to test yourself.`;
    if (topics.length && n % 3 !== 0) {
      const t = topics[(n - 1) % topics.length].topic;
      return n % 2
        ? `${t}: turn your notes into 5 questions, then answer them from memory.`
        : `${t}: find one worked example and redo it without looking.`;
    }
    const general = [
      `${a.title}: make a one-page summary of the key ideas.`,
      `${a.title}: write down what each criterion is asking for, in your own words.`,
      `${a.title}: explain the main idea out loud in two minutes, like you're teaching it.`
    ];
    return general[(n - 1) % general.length];
  }

  function taskForReview(subject, counters) {
    const topics = plState.struggles.filter(t => t.subject === subject);
    const n = counters[subject] = (counters[subject] || 0) + 1;
    if (topics.length) return n % 2
      ? `Keep ${topics[(n - 1) % topics.length].topic} fresh: make 10 flashcards and test yourself.`
      : `${topics[(n - 1) % topics.length].topic}: do three practice questions and check your answers.`;
    return n % 2
      ? `Tidy up this week's ${subject} notes and circle anything that still feels unclear.`
      : `Skim your latest ${subject} lesson and write three things you remember without looking.`;
  }

  // oldPlan (optional) lets ticks survive a rebuild: a task stays ticked if
  // the same day still has the same task.
  function generatePlan(oldPlan) {
    const doneKeys = new Set();
    (oldPlan || []).forEach(d => d.tasks.forEach(t => { if (t.done) doneKeys.add(`${d.date}|${t.subject}|${t.text}`); }));

    const today = todayDate();
    const upcoming = plState.assessments
      .filter(a => fromISO(a.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Always plan to the end of a full week (Sunday); stretch to the last assessment.
    const lastAssess = upcoming.length ? fromISO(upcoming[upcoming.length - 1].date) : today;
    let end = addDays(mondayOf(lastAssess), 6);
    const minEnd = addDays(mondayOf(today), 6);
    if (end < minEnd) end = minEnd;
    const horizon = Math.min(dayDiff(today, end), MAX_WEEKS * 7 - 1);

    const usage = {};
    const counters = {};
    const days = [];

    for (let d = 0; d <= horizon; d++) {
      const date = addDays(today, d);
      const iso = toISO(date);
      const weekend = date.getDay() === 0 || date.getDay() === 6;
      const available = weekend ? plState.weekend : plState.weekday;
      const tasks = [];
      const dueToday = upcoming.filter(a => a.date === iso);

      dueToday.forEach(a => tasks.push({
        id: uid(), subject: a.subject, mins: 10, due: true, done: false,
        text: `${a.title} is today. Quick look over your summary, then trust your prep.`
      }));

      // The 10-minute check on a due day comes out of that day's time.
      const blocks = splitMinutes(Math.max(0, available - dueToday.length * 10));
      const usedToday = new Set(dueToday.map(a => a.subject));
      const countToday = {}; // max 2 blocks per assessment/subject per day

      for (const mins of blocks) {
        const candidates = [];
        upcoming.forEach(a => {
          const left = dayDiff(date, fromISO(a.date));
          if (left < 1 || (countToday[a.id] || 0) >= 2) return;
          const topics = plState.struggles.filter(t => t.subject === a.subject).length;
          let w = (1 + 0.5 * topics) * (left <= 3 ? 3 : 1) / left;
          if (usedToday.has(a.subject)) w *= 0.3;
          w /= 1 + (usage[a.id] || 0) * 0.35;
          candidates.push({ w, kind: 'assess', a, left });
        });
        plState.subjects.forEach(s => {
          if ((countToday[s] || 0) >= 2) return;
          if (dueToday.some(a => a.subject === s)) return; // no extra review on its own test day
          if (upcoming.some(a => a.subject === s && dayDiff(date, fromISO(a.date)) >= 1)) return;
          let w = 0.12 + 0.05 * plState.struggles.filter(t => t.subject === s).length;
          if (usedToday.has(s)) w *= 0.3;
          w /= 1 + (usage[s] || 0) * 0.5;
          candidates.push({ w, kind: 'review', s });
        });
        if (!candidates.length) break;
        candidates.sort((x, y) => y.w - x.w);
        const pick = candidates[0];
        let subject, text;
        if (pick.kind === 'assess') {
          const firstToday = !countToday[pick.a.id];
          usage[pick.a.id] = (usage[pick.a.id] || 0) + 1;
          countToday[pick.a.id] = (countToday[pick.a.id] || 0) + 1;
          subject = pick.a.subject;
          text = taskForAssessment(pick.a, pick.left, counters, firstToday);
        } else {
          usage[pick.s] = (usage[pick.s] || 0) + 1;
          countToday[pick.s] = (countToday[pick.s] || 0) + 1;
          subject = pick.s;
          text = taskForReview(pick.s, counters);
        }
        usedToday.add(subject);
        tasks.push({ id: uid(), subject, mins, done: false, text });
      }

      tasks.forEach(t => { if (doneKeys.has(`${iso}|${t.subject}|${t.text}`)) t.done = true; });
      days.push({ date: iso, minutes: available, tasks });
    }
    return days;
  }

  const NOTE_COLORS = ['#FFE66D', '#FFB3D1', '#B8F2D8', '#BFE3FF', '#FFD0A8', '#DCCBFF'];
  const subjectColor = (s) => NOTE_COLORS[Math.max(0, plState.subjects.indexOf(s)) % NOTE_COLORS.length];

  function renderUpcoming() {
    const today = todayDate();
    const list = plState.assessments.filter(a => fromISO(a.date) >= today).sort((a, b) => a.date.localeCompare(b.date));
    if (!list.length || !plState.plan) { plEls.upcoming.innerHTML = ''; return; }
    plEls.upcoming.innerHTML = '<p class="pl-upcoming__title">Coming up</p>' + list.map(a => {
      const left = dayDiff(today, fromISO(a.date));
      const when = left === 0 ? 'today' : left === 1 ? 'tomorrow' : `in ${left} days`;
      return `<span class="pl-upcoming__item" style="--note:${subjectColor(a.subject)}"><strong>${escapeHtml(a.subject)}</strong> ${escapeHtml(a.title)} · ${when}</span>`;
    }).join('');
  }

  // Groups the plan's remaining days into Monday–Sunday weeks.
  function planWeeks() {
    const todayIso = toISO(todayDate());
    const weeks = [];
    (plState.plan || []).filter(d => d.date >= todayIso).forEach(day => {
      const key = toISO(mondayOf(fromISO(day.date)));
      let w = weeks.find(x => x.key === key);
      if (!w) { w = { key, days: [] }; weeks.push(w); }
      w.days.push(day);
    });
    return weeks;
  }

  function updateWeekStats(week) {
    const tasks = week.days.flatMap(d => d.tasks);
    const planned = tasks.reduce((a, t) => a + t.mins, 0);
    const done = tasks.filter(t => t.done);
    const doneMins = done.reduce((a, t) => a + t.mins, 0);
    plEls.weekStats.textContent = `${done.length} of ${tasks.length} tasks done · ${fmtMins(doneMins)} of ${fmtMins(planned)} studied`;
    plEls.weekFill.style.width = (planned ? Math.round(doneMins / planned * 100) : 0) + '%';
  }

  function renderBoard() {
    renderUpcoming();
    if (!plState.plan) { plEls.weekbar.hidden = true; return; }
    const weeks = planWeeks();
    if (!weeks.length) {
      plEls.weekbar.hidden = true;
      plEls.board.innerHTML = '<div class="pl-empty"><p class="pl-empty__title">This plan has run out of days.</p><p>Add your next assessments and tap Make my plan again.</p></div>';
      return;
    }
    plWeek = Math.min(Math.max(plWeek, 0), weeks.length - 1);
    const week = weeks[plWeek];
    const monday = fromISO(week.key);

    plEls.weekbar.hidden = false;
    plEls.weekLabel.textContent = `${plWeek === 0 ? 'This week' : plWeek === 1 ? 'Next week' : `Week ${plWeek + 1}`} · ${shortDate(monday)} – ${shortDate(addDays(monday, 6))}`;
    plEls.prevWeek.disabled = plWeek === 0;
    plEls.nextWeek.disabled = plWeek === weeks.length - 1;
    updateWeekStats(week);

    const todayIso = toISO(todayDate());
    const tomorrowIso = toISO(addDays(todayDate(), 1));
    plEls.board.innerHTML = '';
    week.days.forEach((day, i) => {
      const note = document.createElement('article');
      const hasDue = day.tasks.some(t => t.due);
      const rel = day.date === todayIso ? 'Today' : day.date === tomorrowIso ? 'Tomorrow' : '';
      const planned = day.tasks.reduce((a, t) => a + t.mins, 0);
      note.className = 'pl-note' + (hasDue ? ' pl-note--due' : '') + (day.date === todayIso ? ' pl-note--today' : '');
      note.style.setProperty('--tilt', `${((i * 37) % 5) - 2}deg`);
      note.style.setProperty('--note', NOTE_COLORS[fromISO(day.date).getDay() % NOTE_COLORS.length]);
      note.innerHTML = `
        <header class="pl-note__head">
          <h4>${niceDate(day.date)}</h4>
          ${rel ? `<span class="pl-note__rel">${rel}</span>` : ''}
        </header>
        ${day.tasks.length ? `<p class="pl-note__time">${fmtMins(planned)} planned</p><ul class="pl-note__tasks"></ul>
          <p class="pl-note__foot"></p>`
          : `<p class="pl-note__rest">${day.minutes ? 'Nothing to plan yet. Add a subject or assessment.' : 'Rest day. No study planned.'}</p>`}`;
      const ul = note.querySelector('.pl-note__tasks');
      const foot = note.querySelector('.pl-note__foot');
      const updateFoot = () => { if (foot) foot.textContent = `${day.tasks.filter(x => x.done).length} of ${day.tasks.length} done`; };
      updateFoot();
      day.tasks.forEach(t => {
        const li = document.createElement('li');
        li.className = t.done ? 'is-done' : '';
        const id = `pltask-${t.id}`;
        li.innerHTML = `<input type="checkbox" id="${id}" ${t.done ? 'checked' : ''}>
          <label for="${id}"><span class="pl-note__subj">${escapeHtml(t.subject)} · ${t.mins} min</span>${escapeHtml(t.text)}</label>`;
        li.querySelector('input').addEventListener('change', (e) => {
          t.done = e.target.checked;
          li.classList.toggle('is-done', t.done);
          updateFoot();
          updateWeekStats(week);
          savePlanner();
        });
        ul.appendChild(li);
      });
      plEls.board.appendChild(note);
    });
  }

  plEls.prevWeek.addEventListener('click', () => { plWeek--; renderBoard(); });
  plEls.nextWeek.addEventListener('click', () => { plWeek++; renderBoard(); });

  $('plGenerate').addEventListener('click', () => {
    if (!plState.subjects.length) { plEls.error.textContent = 'Add at least one subject in step 1.'; return; }
    if (!plState.weekday && !plState.weekend) { plEls.error.textContent = 'Set some study time in step 4 — even 15 minutes counts.'; return; }
    plEls.error.textContent = '';
    plState.plan = generatePlan(plState.plan);
    plWeek = 0;
    savePlanner();
    renderBoard();
    plEls.weekbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('plClear').addEventListener('click', () => {
    if (!confirm('Clear your subjects, assessments, topics and plan?')) return;
    Object.assign(plState, { subjects: [], assessments: [], struggles: [], weekday: 60, weekend: 90, plan: null, scratch: '' });
    plEls.scratch.value = '';
    plWeek = 0;
    savePlanner();
    renderPlannerInputs();
    plEls.upcoming.innerHTML = '';
    plEls.weekbar.hidden = true;
    plEls.board.innerHTML = `<div class="pl-empty"><p class="pl-empty__title">Your plan shows up here as sticky notes, one for each day.</p>
      <p>Add your subjects and at least one assessment, set your time, then tap Make my plan.</p></div>`;
  });

  renderPlannerInputs();
  // A saved plan from an earlier visit is rebuilt from today, keeping ticks.
  if (plState.plan) { plState.plan = generatePlan(plState.plan); savePlanner(); }
  renderBoard();

  /* ===========================================================
     SMILEY SPRINT — gets harder the higher you climb.
     Every 3 right answers moves you up a level:
       Level 1 Easy    — 3 choices, no timer, worth 1
       Level 2 Medium  — 4 choices, no timer, worth 2
       Level 3 Hard    — 4 choices, 20-second timer, worth 3
       Level 4 Expert  — 4 choices, 12-second timer, worth 4
     =========================================================== */
  const SPRINT_LEVELS = [
    { name: 'Easy', time: 0, points: 1, token: '🙂' },
    { name: 'Medium', time: 0, points: 2, token: '😊' },
    { name: 'Hard', time: 20, points: 3, token: '😎' },
    { name: 'Expert', time: 12, points: 4, token: '🤩' }
  ];
  const SPRINT_LEN = 12;
  const LEVEL_UP_EVERY = 3;
  const SPRINT_KEY = 'ibcompass-sprint-best-v2';

  // answer = index of the correct option
  const sprintPool = [
    // Level 1 — easy
    [
      { q: 'How are you graded on most MYP tasks?', options: ['One overall percentage', 'Criteria A, B, C and D', 'Only a final exam'], answer: 1 },
      { q: 'What does ATL stand for?', options: ['Approaches to Learning', 'Advanced Test Levels', 'All Topics Listed'], answer: 0 },
      { q: 'How many MYP subject groups are there?', options: ['Six', 'Eight', 'Ten'], answer: 1 },
      { q: 'Service as Action is about…', options: ['Helping your community', 'Serving lunch in the canteen', 'Extra homework'], answer: 0 },
      { q: 'Which two pathways can you pick for MYP 4–5?', options: ['Arts or Sport', 'Balanced or Sciences', 'Easy or Hard'], answer: 1 },
      { q: 'Best first move when a long task is set?', options: ['Wait until the week before', 'Split it into smaller deadlines', 'Ask a friend to do it'], answer: 1 },
      { q: 'A good length for one focused study block?', options: ['About 25–30 minutes', 'Three hours straight', 'Two minutes'], answer: 0 },
      { q: 'Rereading notes vs. quizzing yourself — which sticks better?', options: ['Rereading', 'Quizzing yourself', 'They are exactly the same'], answer: 1 },
      { q: 'What is a Statement of Inquiry?', options: ['The big idea a unit explores', 'A letter to your parents', 'Your end-of-year report'], answer: 0 }
    ],
    // Level 2 — medium
    [
      { q: 'What is the highest level you can get on one MYP criterion?', options: ['4', '7', '8', '10'], answer: 2 },
      { q: 'Final MYP subject grades run from…', options: ['A to F', '1 to 7', '0 to 100', '1 to 10'], answer: 1 },
      { q: 'In which year is the Personal Project completed?', options: ['MYP 1', 'MYP 3', 'MYP 4', 'MYP 5'], answer: 3 },
      { q: 'Which of these is one of the five ATL skill categories?', options: ['Self-management', 'Memorising', 'Speed-reading', 'Competing'], answer: 0 },
      { q: 'Which subject group does Economics belong to?', options: ['Sciences', 'Individuals & Societies', 'Mathematics', 'Design'], answer: 1 },
      { q: 'Contexts like "Identities and relationships" are called…', options: ['Key concepts', 'Global contexts', 'ATL skills', 'Criteria'], answer: 1 },
      { q: 'Which of these is an MYP key concept?', options: ['Photosynthesis', 'Aesthetics', 'Algebra', 'Punctuation'], answer: 1 },
      { q: 'In the Sciences pathway here, how many humanities do you take?', options: ['None', 'One', 'Two', 'Three'], answer: 2 }
    ],
    // Level 3 — hard (timed)
    [
      { q: 'How many global contexts does the MYP use?', options: ['4', '6', '8', '16'], answer: 1 },
      { q: 'The Personal Project is assessed on how many criteria?', options: ['2', '3', '4', '5'], answer: 1 },
      { q: '"Managing your time" belongs to which ATL category?', options: ['Communication', 'Social', 'Self-management', 'Research'], answer: 2 },
      { q: 'Max total across four criteria in one subject?', options: ['28', '30', '32', '40'], answer: 2 },
      { q: 'Which is NOT an IB learner profile attribute?', options: ['Inquirers', 'Risk-takers', 'Reflective', 'Competitive'], answer: 3 },
      { q: 'The MYP is designed for students aged roughly…', options: ['5–10', '11–16', '16–19', '18–22'], answer: 1 },
      { q: 'Which of these is an MYP global context?', options: ['Money and markets', 'Fairness and development', 'Sports and games', 'Nature and weather'], answer: 1 },
      { q: 'How many ATL skill categories are there?', options: ['3', '5', '8', '10'], answer: 1 }
    ],
    // Level 4 — expert (fast timer)
    [
      { q: 'How many IB learner profile attributes are there?', options: ['6', '8', '10', '12'], answer: 2 },
      { q: 'How many MYP key concepts are there?', options: ['8', '12', '16', '20'], answer: 2 },
      { q: 'The four IB programmes are PYP, MYP, DP and…', options: ['CP', 'SP', 'HP', 'TP'], answer: 0 },
      { q: 'The Community Project is usually done in…', options: ['MYP 1', 'MYP 2', 'MYP 3 or 4', 'MYP 5 only'], answer: 2 },
      { q: 'A criteria total of 28–32 converts to which grade?', options: ['5', '6', '7', '8'], answer: 2 },
      { q: 'A criteria total of 15–18 converts to which grade?', options: ['3', '4', '5', '6'], answer: 1 },
      { q: 'How many Service as Action learning outcomes are there?', options: ['3', '5', '7', '9'], answer: 2 },
      { q: 'Which is NOT one of the six global contexts?', options: ['Personal and cultural expression', 'Orientation in space and time', 'Globalization and sustainability', 'Science and society'], answer: 3 }
    ]
  ];

  const sprintEls = {
    face: $('sprintFace'), score: $('sprintScore'), streak: $('sprintStreak'), best: $('sprintBest'),
    jar: $('sprintJar'), count: $('sprintCount'), area: $('sprintArea'), level: $('sprintLevel'),
    timer: $('sprintTimer'), timerFill: $('sprintTimerFill'), box: $('sprint')
  };
  let sprintQNum = 0, sprintScore = 0, sprintStreak = 0, sprintCorrect = 0, sprintLevel = 0, sprintTopLevel = 0;
  let sprintUsed = [];
  let sprintTimerId = null;
  let sprintBest = 0;
  try { sprintBest = +localStorage.getItem(SPRINT_KEY) || 0; } catch (e) { sprintBest = 0; }
  sprintEls.best.textContent = sprintBest;

  const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function dropInJar(emoji, bonus) {
    const s = document.createElement('span');
    s.className = 'sprint__token' + (bonus ? ' sprint__token--bonus' : '');
    s.textContent = emoji;
    sprintEls.jar.appendChild(s);
  }

  function setFace(emoji) {
    sprintEls.face.textContent = emoji;
    sprintEls.face.classList.remove('is-bouncing');
    void sprintEls.face.offsetWidth; // restart the bounce
    sprintEls.face.classList.add('is-bouncing');
  }

  function showLevel() {
    const L = SPRINT_LEVELS[sprintLevel];
    sprintEls.level.textContent = `Level ${sprintLevel + 1} · ${L.name}`;
    sprintEls.box.dataset.level = String(sprintLevel + 1);
  }

  // Draws an unused question from the current level, with the options shuffled.
  function nextQuestion() {
    const pool = sprintPool[sprintLevel];
    let fresh = pool.filter(q => !sprintUsed.includes(q));
    if (!fresh.length) { sprintUsed = sprintUsed.filter(q => !pool.includes(q)); fresh = pool; }
    const item = fresh[Math.floor(Math.random() * fresh.length)];
    sprintUsed.push(item);
    const order = shuffle(item.options.map((_, i) => i));
    return { q: item.q, options: order.map(i => item.options[i]), answer: order.indexOf(item.answer) };
  }

  function stopTimer() {
    clearInterval(sprintTimerId);
    sprintTimerId = null;
  }

  function startSprint() {
    stopTimer();
    sprintQNum = 0; sprintScore = 0; sprintStreak = 0; sprintCorrect = 0; sprintLevel = 0; sprintTopLevel = 0;
    sprintUsed = [];
    sprintEls.jar.innerHTML = '';
    sprintEls.score.textContent = '0';
    sprintEls.streak.textContent = '0';
    setFace('🙂');
    showLevel();
    renderSprintQ();
  }

  function renderSprintQ() {
    if (sprintQNum >= SPRINT_LEN) return endSprint();
    const L = SPRINT_LEVELS[sprintLevel];
    const item = nextQuestion();
    sprintEls.count.textContent = `Question ${sprintQNum + 1} of ${SPRINT_LEN} · worth ${L.points}`;
    sprintEls.area.innerHTML = `<p class="sprint__q">${item.q}</p><div class="sprint__opts"></div><p class="sprint__feedback" aria-live="polite"></p>`;
    const opts = sprintEls.area.querySelector('.sprint__opts');
    const fb = sprintEls.area.querySelector('.sprint__feedback');
    let answered = false;

    const finish = (idx) => {
      if (answered) return;
      answered = true;
      stopTimer();
      [...opts.children].forEach(c => c.disabled = true);
      opts.children[item.answer].classList.add('is-correct');
      let msg;
      if (idx === item.answer) {
        sprintScore += L.points; sprintStreak++; sprintCorrect++;
        dropInJar(L.token);
        msg = L.points > 1 ? `Right! +${L.points} smileys.` : 'Nice! A smiley for the jar.';
        setFace(sprintLevel >= 2 ? '🤩' : '😄');
        if (sprintStreak % 3 === 0) { sprintScore += 1; dropInJar('🌟', true); msg += ' Three in a row — bonus star!'; }
        if (sprintCorrect % LEVEL_UP_EVERY === 0 && sprintLevel < SPRINT_LEVELS.length - 1) {
          sprintLevel++;
          sprintTopLevel = Math.max(sprintTopLevel, sprintLevel);
          const N = SPRINT_LEVELS[sprintLevel];
          msg += ` Level up! Next up: ${N.name}${N.time ? `, with a ${N.time}-second timer` : ', with four choices'}.`;
          showLevel();
          sprintEls.level.classList.remove('is-up'); void sprintEls.level.offsetWidth; sprintEls.level.classList.add('is-up');
        }
      } else {
        sprintStreak = 0;
        if (idx >= 0) opts.children[idx].classList.add('is-wrong');
        setFace(idx === -1 ? '⏰' : '😅');
        msg = `${idx === -1 ? "Time's up" : 'Not quite'} — it's "${item.options[item.answer]}".`;
      }
      fb.textContent = msg;
      sprintEls.score.textContent = sprintScore;
      sprintEls.streak.textContent = sprintStreak;
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'btn btn--primary sprint__next';
      next.textContent = sprintQNum === SPRINT_LEN - 1 ? 'See my jar' : 'Next question';
      next.addEventListener('click', () => { sprintQNum++; renderSprintQ(); });
      sprintEls.area.appendChild(next);
      next.focus({ preventScroll: true });
    };

    item.options.forEach((text, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sprint__opt';
      b.textContent = text;
      b.addEventListener('click', () => finish(idx));
      opts.appendChild(b);
    });

    // Timer only on Hard and Expert
    stopTimer();
    if (L.time) {
      sprintEls.timer.hidden = false;
      const endAt = Date.now() + L.time * 1000;
      const tick = () => {
        const left = Math.max(0, endAt - Date.now());
        sprintEls.timerFill.style.width = (left / (L.time * 1000) * 100) + '%';
        sprintEls.timer.classList.toggle('is-low', left < 4000);
        if (left === 0) finish(-1);
      };
      tick();
      sprintTimerId = setInterval(tick, 100);
    } else {
      sprintEls.timer.hidden = true;
    }
  }

  function endSprint() {
    stopTimer();
    sprintEls.timer.hidden = true;
    const newBest = sprintScore > sprintBest;
    if (newBest) {
      sprintBest = sprintScore;
      sprintEls.best.textContent = sprintBest;
      try { localStorage.setItem(SPRINT_KEY, String(sprintBest)); } catch (e) { /* ignore */ }
    }
    const top = SPRINT_LEVELS[sprintTopLevel].name;
    setFace(sprintTopLevel === 3 ? '🥳' : sprintTopLevel >= 1 ? '😄' : '🙂');
    sprintEls.count.textContent = 'Round done';
    const line = sprintTopLevel === 3 ? 'You made it to Expert. That is serious MYP knowledge.'
      : sprintTopLevel === 2 ? 'You reached Hard. Get three more right to unlock Expert.'
      : sprintTopLevel === 1 ? 'You reached Medium. Keep a streak going to climb higher.'
      : 'Get three right to move up a level. Go again!';
    sprintEls.area.innerHTML = `<p class="sprint__q">${sprintScore} smiley${sprintScore === 1 ? '' : 's'}, highest level ${top}${newBest ? ' — a new best!' : '.'}</p>
      <p class="sprint__feedback">${line}</p>
      <button type="button" class="btn btn--primary" id="sprintAgain">Play again</button>`;
    $('sprintAgain').addEventListener('click', startSprint);
  }

  startSprint();

});

