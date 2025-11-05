/* HOME PAGE: validate + submit */
document.addEventListener('DOMContentLoaded', () => {
  const detectBtn = document.querySelector('.btn-detect');
  const detectField = document.querySelector('.detect-field');

  if (detectBtn && detectField) {
    detectBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const value = (detectField.value || '').trim();

      // inline error element under the field
      let err = document.getElementById('detect-error-inline');
      if (!err) {
        err = document.createElement('div');
        err.id = 'detect-error-inline';
        err.style.color = '#ffb3b3';
        err.style.fontSize = '13px';
        err.style.marginTop = '6px';
        detectField.parentElement.appendChild(err);
      }
      err.textContent = '';

      // validation: URL or ≥ 8 chars text
      const isValidURL = (v) => {
        try { const u = new URL(v); return ['http:', 'https:'].includes(u.protocol); }
        catch { return false; }
      };
      if (!(isValidURL(value) || value.length >= 8)) {
        err.textContent = 'Enter a valid http(s) URL or at least 8 characters of text.';
        return;
      }

      // build payload
      const payload = {
        type: isValidURL(value) ? 'url' : 'text',
        payload: value
      };

      // call backend (graceful fallback to mock)
      let result;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000); 
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) throw new Error('Bad response');
        result = await res.json();
        
      } catch {
        
        const score = Math.round(50 + Math.random()*50);
        result = {
          score,
          breakdown: { misinfo: score, legit: Math.max(0, 100 - score - 10), uncertain: 10 },
          categories: [],
          points: Array.from({length:48}, () => ({
            risk: Math.round(30 + Math.random()*70),
            engagement: Math.round(100 + Math.random()*900)
          }))
        };
      }

      // store for results page
      localStorage.setItem('analysisResult', JSON.stringify({
        source: payload, result
      }));

      // navigate
      window.location.href = 'results.html';
    });
  }

  //  RESULTS PAGE: render charts if present 
  const resultsRoot = document.getElementById('results-root');
  if (!resultsRoot) return; // not on results page

  // load saved result
  let analysisData;
  try {
    analysisData = JSON.parse(localStorage.getItem('analysisResult') || '{}');
  } catch { analysisData = {}; }
  window.analysisResultData = analysisData; 

  const score = Math.max(0, Math.min(100, Math.round(analysisData?.result?.score ?? 0)));
  const scoreText = document.getElementById('scoreText');
  const scoreValue = document.getElementById('scoreValue');
  const gauge = document.querySelector('.gauge');
  if (scoreText) scoreText.textContent = `(${score}%)`;
  if (scoreValue) scoreValue.textContent = `${score}%`;
  if (gauge) gauge.style.setProperty('--pct', `${score}%`);

  // What was analyzed
  const what = analysisData?.source?.payload || '';
  const whatEl = document.getElementById('whatWasAnalyzed');
  if (whatEl) {
    const label = analysisData?.source?.type === 'url' ? 'URL' : 'Text';
    const short = what.length > 80 ? what.slice(0,80) + '…' : what;
    whatEl.textContent = short ? `Last analyzed ${label}: ${short}` : '';
  }

  // --- Normalize breakdown  ---
  function normalizeBreakdown(b, fallbackScore) {
    if (!b || typeof b !== 'object') {
      return { misinfo: fallbackScore, legit: Math.max(0, 100 - fallbackScore - 10), uncertain: 10 };
    }
    const misinfo = b.misinfo ?? b.misinformation ?? 0;
    const legit = b.legit ?? b.legitimate ?? 0;
    
    const uncertain = b.uncertain ?? b.unsure ?? Math.max(0, 100 - (misinfo + legit));
    if (misinfo + legit + uncertain === 0) {
      return { misinfo: fallbackScore, legit: Math.max(0, 100 - fallbackScore - 10), uncertain: 10 };
    }
    return { misinfo, legit, uncertain };
  }

  // --- Chart.js doughnut ---
  (function renderDonut(){
    if (!window.Chart) return;
    const donutEl = document.getElementById('donutChart');
    if (!donutEl) return;

    const ctx = donutEl.getContext('2d');
    const breakdown = normalizeBreakdown(analysisData?.result?.breakdown, score);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Likely misinformation','Likely legit','Uncertain'],
        datasets: [{
          data: [breakdown.misinfo, breakdown.legit, breakdown.uncertain],
          backgroundColor: ['#e74c3c','#2ecc71','#f1c40f'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 14, color: '#222' } },
          tooltip: { enabled: true }
        }
      }
    });
  })();

  // --- D3 horizontal bars with empty state ---
  function renderBars(){
    const wrap = document.getElementById('d3Bars');
    if (!wrap || !window.d3) return;
    wrap.innerHTML = '';

    const w = wrap.clientWidth || 320, h = wrap.clientHeight || 220;
    const m = {top:8,right:12,bottom:8,left:90};
    const innerW = w - m.left - m.right, innerH = h - m.top - m.bottom;

    const cats = (window.analysisResultData?.result?.categories) || [];

    // Empty state
    if (!cats || cats.length === 0) {
      const svg = d3.select(wrap).append('svg')
        .attr('width', w).attr('height', h);

      svg.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', w).attr('height', h)
        .attr('fill', '#f6f7fb');

      svg.append('text')
        .attr('x', w/2).attr('y', h/2)
        .attr('text-anchor','middle').attr('dominant-baseline','middle')
        .attr('fill', '#666').style('font-size', '14px')
        .text('No category data yet');
      return;
    }

    // Bars
    const x = d3.scaleLinear().domain([0,100]).range([0, innerW]);
    const y = d3.scaleBand().domain(cats.map(d=>d.label)).range([0, innerH]).padding(0.25);

    const svg = d3.select(wrap).append('svg').attr('width', w).attr('height', h);
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    g.selectAll('.rail').data(cats).enter().append('rect')
      .attr('x', 0).attr('y', d=>y(d.label)).attr('width', innerW).attr('height', y.bandwidth())
      .attr('fill', '#eaecef');

    const colors = ['#335dff','#e74c3c','#f1c40f','#335dff','#e74c3c'];
    g.selectAll('.bar').data(cats).enter().append('rect')
      .attr('x', 0).attr('y', d=>y(d.label)).attr('width', d=>x(d.value)).attr('height', y.bandwidth())
      .attr('fill', (d,i)=>colors[i%colors.length]);

    g.selectAll('.label').data(cats).enter().append('text')
      .attr('x', -10).attr('y', d=>y(d.label)+y.bandwidth()/2)
      .attr('text-anchor','end').attr('dominant-baseline','middle')
      .attr('fill','#333').style('font-weight',700).text(d=>d.label);
  }
  renderBars();
  window.addEventListener('resize', renderBars);

  // --- Plotly scatter ---
  (function renderPlotly(){
    if (!window.Plotly) return;
    const el = document.getElementById('plotlyChart');
    if (!el) return;

    const pts = analysisData?.result?.points || Array.from({length:48}, () => ({
      risk: Math.round(30 + Math.random()*70),
      engagement: Math.round(100 + Math.random()*900)
    }));

    const trace = {
      x: pts.map(p=>p.risk),
      y: pts.map(p=>p.engagement),
      mode:'markers',
      type:'scatter',
      marker:{ size:8 }
    };
    const layout = {
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)',
      margin:{ l:40, r:10, t:10, b:40 },
      xaxis:{ title:'Risk Score', color:'#eee', gridcolor:'#333' },
      yaxis:{ title:'Engagement', color:'#eee', gridcolor:'#333' },
      font:{ color:'#eee' }
    };
    Plotly.newPlot(el, [trace], layout, { displayModeBar:false, responsive:true });
    window.addEventListener('resize', () => Plotly.Plots.resize(el));
  })();
});
