const failureLayers = {
  epistemic: [
    { code: 'F1', title: 'Provenance opacity', body: 'AI-generated or AI-mediated content appears without a reliable signal of origin, authorship, or synthetic status.' },
    { code: 'F2', title: 'Confidence masking', body: 'Uncertain, contested, speculative, or stale claims are presented with the same authority as settled facts.' },
    { code: 'F3', title: 'Temporal ambiguity', body: 'The user cannot tell whether the information is current, cutoff-limited, retrieved live, or stale.' },
    { code: 'F4', title: 'Hallucination without flagging', body: 'Fabricated facts, citations, legal rules, statistics, or events are presented as if they were real.' }
  ],
  contextual: [
    { code: 'F5', title: 'Jurisdictional generality', body: 'Legal, civic, or rights-related information is presented without the jurisdiction that makes it true or false.' },
    { code: 'F7', title: 'Aggregation distortion', body: 'Summaries misrepresent the balance, diversity, or relationship among underlying sources.' },
    { code: 'F10', title: 'Contextual stripping', body: 'A fact may be accurate in isolation but stripped of caveats, scope conditions, or source limitations.' }
  ],
  structural: [
    { code: 'F8', title: 'Cross-border provenance obfuscation', body: 'Externally generated or coordinated content is made to look domestic, local, or organic.' },
    { code: 'F9', title: 'Identity simulation', body: 'Synthetic personas, voices, testimonials, experts, or public comments imitate real democratic participation.' },
    { code: 'CF', title: 'Compound failure', body: 'Several Tier 1 failures occur together, making the harm multiplicative rather than additive.' }
  ]
};

const dimensions = [
  { code: 'D1a', name: 'Input / Training Provenance', type: 'System-level', detail: 'Discloses what the model was trained on and how the data was sourced.', maps: ['F1', 'F8'], policy: 'Training-data summaries, dataset metadata, source categories, copyright and personal-data indicators.' },
  { code: 'D1b', name: 'Output / Content Provenance', type: 'Output-level', detail: 'Marks generated or AI-mediated content so audiences and platforms can recognize it.', maps: ['F1', 'F9'], policy: 'Visible labels, latent metadata, provenance credentials, detection tools, share-path persistence.' },
  { code: 'D2', name: 'Uncertainty Communication', type: 'Claim-level', detail: 'Separates well-supported claims from contested, speculative, or unknown claims.', maps: ['F2', 'F4', 'F10'], policy: 'Claim-specific uncertainty signals, refusal behavior, calibration audits, and warnings for contested claims.' },
  { code: 'D3', name: 'Temporal Grounding', type: 'Time-level', detail: 'Signals training cutoff, retrieval date, source date, and topic-specific recency risk.', maps: ['F3'], policy: 'Response-level recency warnings for elections, breaking news, public benefits, legal rules, and crisis contexts.' },
  { code: 'D4', name: 'Jurisdictional Tagging', type: 'Scope-level', detail: 'Identifies where civic, legal, or rights-related information applies.', maps: ['F5'], policy: 'Minimum-necessary location prompts, explicit jurisdiction labels, and cross-jurisdiction variance warnings.' },
  { code: 'D5', name: 'Contestability', type: 'Accountability-level', detail: 'Gives users a visible path to flag, correct, challenge, or escalate outputs.', maps: ['F6', 'F4', 'F9'], policy: 'Factual error reporting, explanation request channels, human review, correction logs, and appeal routes.' },
  { code: 'D6', name: 'Aggregation & Context Integrity', type: 'Transformation-level', detail: 'Discloses summarization, translation, source blending, omissions, and paths back to source context.', maps: ['F7', 'F10'], policy: 'Source-context links, caveat preservation, transformation disclosure, and contested-source warnings.' },
  { code: 'D7', name: 'Data Labor & Supply-Chain Accountability', type: 'System-level module', detail: 'Reclassifies labor and supply-chain provenance as a system-level accountability profile rather than an equal-weight civic-output score.', maps: ['F1 extension'], policy: 'D7a labor conditions, D7b vendor traceability, D7c verification and auditability.' }
];

const pilotScores = [
  { system: 'ChatGPT', scores: [1, 2, 1, 1, 0, 2, 1, 0] },
  { system: 'Perplexity', scores: [1, 2, 1, 2, 0, 1, 2, 0] },
  { system: 'Doubao', scores: [1, 2, 0, 1, 2, 2, 1, 0] },
  { system: 'Ernie', scores: [1, 1, 0, 1, 2, 2, 1, 0] }
];

const dimCodes = ['D1a','D1b','D2','D3','D4','D5','D6','D7'];

function renderFailureLayer(layerKey) {
  const panel = document.getElementById('layer-panel');
  if (!panel) return;
  panel.innerHTML = failureLayers[layerKey].map(item => `
    <article class="failure-card" data-code="${item.code}">
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `).join('');
}

function renderDimensions(active = 'D1a') {
  const grid = document.getElementById('dimension-grid');
  const detail = document.getElementById('dimension-detail');
  if (!grid || !detail) return;
  grid.innerHTML = dimensions.map(d => `
    <button class="dimension-button ${d.code === active ? 'active' : ''}" data-dim="${d.code}" type="button">
      <span class="dimension-code">${d.code}</span>
      <h3>${d.name}</h3>
    </button>
  `).join('');
  renderDimensionDetail(active);
}

function renderDimensionDetail(code) {
  const detail = document.getElementById('dimension-detail');
  const d = dimensions.find(x => x.code === code) || dimensions[0];
  detail.innerHTML = `
    <h3>${d.code}: ${d.name}</h3>
    <p><strong>${d.type}.</strong> ${d.detail}</p>
    <ul>
      <li><strong>Maps to:</strong> ${d.maps.join(', ')}</li>
      <li><strong>Policy translation:</strong> ${d.policy}</li>
    </ul>
  `;
  document.querySelectorAll('.dimension-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dim === code);
  });
}

function renderHeatmap() {
  const heatmap = document.getElementById('heatmap');
  if (!heatmap) return;
  const header = [''].concat(dimCodes).map(h => `<div class="heat-head">${h}</div>`).join('');
  const rows = pilotScores.map(row => `
    <div class="heat-row-label">${row.system}</div>
    ${row.scores.map(score => `<div class="heat-cell score-${score}" title="${row.system}: score ${score}">${score}</div>`).join('')}
  `).join('');
  heatmap.innerHTML = header + rows;
}

function updateRisk() {
  const boxes = document.querySelectorAll('.risk-tool input[type="checkbox"]');
  const selected = Array.from(boxes).filter(b => b.checked).map(b => b.value);
  const result = document.getElementById('risk-result');
  if (!result) return;
  result.className = 'risk-result';
  const count = selected.length;
  const criticalSet = ['D1b', 'D2', 'D3', 'D5'];
  const critical = criticalSet.every(x => selected.includes(x));
  if (critical) {
    result.textContent = 'Critical compound risk: provenance, uncertainty, temporality, and contestability all fail.';
    result.classList.add('critical');
  } else if (count >= 3) {
    result.textContent = 'High compound risk: three or more Tier 1 failures selected.';
    result.classList.add('high');
  } else if (count >= 2) {
    result.textContent = 'Compound risk: two Tier 1 failures selected.';
    result.classList.add('medium');
  } else if (count === 1) {
    result.textContent = 'Single failure: important, but not yet compound under this rule.';
    result.classList.add('low');
  } else {
    result.textContent = 'No compound risk selected.';
  }
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  items.forEach(el => observer.observe(el));
}

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

function initCopyBib() {
  const button = document.getElementById('copy-bib');
  const bib = document.getElementById('bibtex');
  if (!button || !bib) return;
  button.addEventListener('click', async () => {
    const text = bib.innerText.trim();
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = 'Copy BibTeX'; }, 1600);
    } catch (err) {
      button.textContent = 'Select + copy';
    }
  });
}

function init() {
  renderFailureLayer('epistemic');
  renderDimensions('D1a');
  renderHeatmap();
  initReveal();
  initNav();
  initCopyBib();
  document.querySelectorAll('.layer-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.layer-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderFailureLayer(tab.dataset.layer);
    });
  });
  document.getElementById('dimension-grid')?.addEventListener('click', (event) => {
    const button = event.target.closest('.dimension-button');
    if (button) renderDimensionDetail(button.dataset.dim);
  });
  document.querySelectorAll('.risk-tool input').forEach(input => input.addEventListener('change', updateRisk));
}

document.addEventListener('DOMContentLoaded', init);
