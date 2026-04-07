const numberFormat = new Intl.NumberFormat("en-US");

function updateSummary(summary) {
  document.querySelectorAll("[data-summary]").forEach((element) => {
    const key = element.dataset.summary;
    if (summary[key] !== undefined) {
      element.textContent = numberFormat.format(summary[key]);
    }
  });
}

function renderBenchmarkTable(benchmarks) {
  const tbody = document.querySelector("#benchmark-table");
  if (!tbody) return;

  tbody.innerHTML = benchmarks
    .map((bench) => {
      return `
        <tr>
          <td>${bench.name}</td>
          <td>${bench.sourceScale}</td>
          <td class="number">${numberFormat.format(bench.samplePool)}</td>
          <td class="number">${numberFormat.format(bench.afterDump)}</td>
          <td class="number">${numberFormat.format(bench.latestSuccess)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderBucketBars(buckets) {
  const root = document.querySelector("#bucket-bars");
  if (!root) return;

  root.innerHTML = buckets
    .map((bucket) => {
      const fusedPct = bucket.selected ? (bucket.fused / bucket.selected) * 100 : 0;
      const nonePct = bucket.selected ? (bucket.noFusion / bucket.selected) * 100 : 0;
      return `
        <div class="bucket-row">
          <strong>${bucket.bucket}</strong>
          <div class="bar" title="${bucket.fused} fused, ${bucket.noFusion} no-fusion">
            <span class="fused" style="width: ${fusedPct}%"></span>
            <span class="none" style="width: ${nonePct}%"></span>
          </div>
          <span>${bucket.selected}</span>
        </div>
      `;
    })
    .join("");
}

async function loadStats() {
  try {
    const response = await fetch("data/stats.json");
    if (!response.ok) throw new Error(`Failed to load stats: ${response.status}`);
    const data = await response.json();
    updateSummary(data.summary || {});
    renderBenchmarkTable(data.benchmarks || []);
    renderBucketBars(data.sftBuckets || []);
  } catch (error) {
    console.warn(error);
  }
}

loadStats();
