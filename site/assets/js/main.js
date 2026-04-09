const numberFormat = new Intl.NumberFormat("en-US");

function updateSummary(summary) {
  document.querySelectorAll("[data-summary]").forEach((el) => {
    const key = el.dataset.summary;
    if (summary[key] !== undefined) {
      const v = summary[key];
      el.textContent = typeof v === "number" ? numberFormat.format(v) : v;
    }
  });
}

function renderBenchmarkTable(benchmarks) {
  const tbody = document.querySelector("#benchmark-table");
  if (!tbody) return;
  tbody.innerHTML = benchmarks
    .map((b) => {
      const cls = b.dedupRate > 60 ? "rate-high" : b.dedupRate > 20 ? "rate-mid" : "rate-low";
      return `<tr>
        <td><strong>${b.name}</strong></td>
        <td class="number">${numberFormat.format(b.raw)}</td>
        <td class="number">${numberFormat.format(b.dedup)}</td>
        <td><span class="rate-badge ${cls}">${b.dedupRate.toFixed(1)}%</span></td>
        <td class="col-notes">${b.notes}</td>
      </tr>`;
    })
    .join("");
}

function renderDomainBars(domains) {
  const root = document.querySelector("#domain-bars");
  if (!root) return;
  const max = Math.max(...domains.map((d) => d.pct));
  root.innerHTML = domains
    .map(
      (d) => `
      <div class="domain-row">
        <span class="domain-label">${d.domain}</span>
        <div class="domain-bar-wrap">
          <div class="domain-bar" style="width:${(d.pct / max) * 100}%"></div>
        </div>
        <span class="domain-pct">${d.pct}%</span>
        <span class="domain-count">${numberFormat.format(d.count)}</span>
      </div>`
    )
    .join("");
}

function render10kBuckets(buckets) {
  const root = document.querySelector("#bucket-bars-10k");
  if (!root) return;
  root.innerHTML = buckets
    .map((b) => {
      const fusedPct = (b.hasFusion / b.count) * 100;
      const noPct = (b.noFusion / b.count) * 100;
      return `
        <div class="bucket-row">
          <div class="bucket-id-col">
            <strong>${b.id}</strong>
            <span class="bucket-range">${b.range}</span>
          </div>
          <div class="bar" title="${b.hasFusion} fused, ${b.noFusion} no-fusion">
            <span class="fused" style="width:${fusedPct}%"></span>
            <span class="none"  style="width:${noPct}%"></span>
          </div>
          <span class="bucket-count">${numberFormat.format(b.count)}</span>
        </div>`;
    })
    .join("");
}

function renderFusionSizeBars(sizes) {
  const root = document.querySelector("#fusion-size-bars");
  if (!root) return;
  const palette = ["var(--blue)", "var(--teal)", "var(--gold)", "var(--muted)"];
  root.innerHTML = sizes
    .map(
      (s, i) => `
      <div class="fusion-row" title="${s.source}">
        <span class="fusion-label">${s.label}</span>
        <div class="fusion-bar-wrap">
          <div class="fusion-bar" style="width:${s.pct}%;background:${palette[i]}"></div>
        </div>
        <span class="fusion-pct">${s.pct}%</span>
      </div>`
    )
    .join("");
}

function renderBucketBars(buckets) {
  const root = document.querySelector("#bucket-bars");
  if (!root) return;
  root.innerHTML = buckets
    .map((b) => {
      const fusedPct = b.selected ? (b.fused / b.selected) * 100 : 0;
      const nonePct = b.selected ? (b.noFusion / b.selected) * 100 : 0;
      return `
        <div class="bucket-row">
          <strong>${b.bucket}</strong>
          <div class="bar" title="${b.fused} fused, ${b.noFusion} no-fusion">
            <span class="fused" style="width:${fusedPct}%"></span>
            <span class="none"  style="width:${nonePct}%"></span>
          </div>
          <span>${numberFormat.format(b.selected)}</span>
        </div>`;
    })
    .join("");
}

function renderFtSplit(ftSplit) {
  if (!ftSplit) return;
  const { sft, rl } = ftSplit;

  // Summary cards
  const sftTotal = document.querySelector("[data-ft='sftTotal']");
  const rlTotal  = document.querySelector("[data-ft='rlTotal']");
  const sftFused = document.querySelector("[data-ft='sftFused']");
  const rlFused  = document.querySelector("[data-ft='rlFused']");
  if (sftTotal) sftTotal.textContent = numberFormat.format(sft.total);
  if (rlTotal)  rlTotal.textContent  = numberFormat.format(rl.total);
  if (sftFused) sftFused.textContent = `${numberFormat.format(sft.hasFusion)} (${(sft.hasFusion/sft.total*100).toFixed(1)}%)`;
  if (rlFused)  rlFused.textContent  = `${numberFormat.format(rl.hasFusion)} (${(rl.hasFusion/rl.total*100).toFixed(1)}%)`;

  // SFT bucket bars
  const root = document.querySelector("#sft-bucket-bars");
  if (root && sft.buckets) {
    root.innerHTML = sft.buckets.map((b) => {
      const fusedPct = (b.hasFusion / b.count) * 100;
      const nonePct  = (b.noFusion  / b.count) * 100;
      return `
        <div class="bucket-row">
          <div class="bucket-id-col">
            <strong>${b.id}</strong>
            <span class="bucket-range">${b.range}</span>
          </div>
          <div class="bar" title="${b.hasFusion} fused, ${b.noFusion} no-fusion">
            <span class="fused" style="width:${fusedPct}%"></span>
            <span class="none"  style="width:${nonePct}%"></span>
          </div>
          <span class="bucket-count">${numberFormat.format(b.count)}</span>
        </div>`;
    }).join("");
  }
}

async function loadStats() {
  try {
    const res = await fetch("data/stats.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    updateSummary(data.summary || {});
    renderBenchmarkTable(data.benchmarks || []);
    renderDomainBars(data.domainCoverage || []);
    const b10k = data.graphfusionbench10k || {};
    render10kBuckets(b10k.buckets || []);
    renderFusionSizeBars(b10k.fusionGroupSizes || []);
    renderFtSplit(data.ftSplit || null);
    renderBucketBars(data.sftBuckets || []);
  } catch (err) {
    console.warn("stats load failed:", err);
  }
}

loadStats();
