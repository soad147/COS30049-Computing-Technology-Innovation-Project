import { useEffect, useMemo, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import * as d3 from "d3";
import Plotly from "plotly.js-dist-min";

ChartJS.register(ArcElement, Tooltip, Legend);

function normalizeBreakdown(b, fallbackScore) {
  if (!b || typeof b !== "object") {
    return {
      misinfo: fallbackScore,
      legit: Math.max(0, 100 - fallbackScore - 10),
      uncertain: 10,
    };
  }
  const misinfo = b.misinfo ?? b.misinformation ?? 0;
  const legit = b.legit ?? b.legitimate ?? 0;
  const uncertain = b.uncertain ?? b.unsure ?? Math.max(0, 100 - (misinfo + legit));
  if (misinfo + legit + uncertain === 0) {
    return {
      misinfo: fallbackScore,
      legit: Math.max(0, 100 - fallbackScore - 10),
      uncertain: 10,
    };
  }
  return { misinfo, legit, uncertain };
}

export default function Results() {
  const analysis = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("analysisResult") || "{}"); }
    catch { return {}; }
  }, []);

  const score = useMemo(() => {
    const s = Math.max(0, Math.min(100, Math.round(analysis?.result?.score ?? 0)));
    return Number.isFinite(s) ? s : 0;
  }, [analysis]);

  // Gauge via CSS custom property
  useEffect(() => {
    const g = document.querySelector(".gauge");
    if (g) g.style.setProperty("--pct", `${score}%`);
  }, [score]);

  const whatWasAnalyzed = useMemo(() => {
    const what = analysis?.source?.payload || "";
    if (!what) return "";
    const label = analysis?.source?.type === "url" ? "URL" : "Text";
    const short = what.length > 80 ? what.slice(0, 80) + "…" : what;
    return `Last analyzed ${label}: ${short}`;
  }, [analysis]);

  const breakdown = useMemo(
    () => normalizeBreakdown(analysis?.result?.breakdown, score),
    [analysis, score]
  );

  const donutData = useMemo(() => ({
    labels: ["Likely misinformation", "Likely legit", "Uncertain"],
    datasets: [{
      data: [breakdown.misinfo, breakdown.legit, breakdown.uncertain],
      backgroundColor: ["#e74c3c", "#2ecc71", "#f1c40f"],
      borderWidth: 0
    }]
  }), [breakdown]);

  const donutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 14, color: "#222" } },
      tooltip: { enabled: true }
    }
  }), []);

  // D3 horizontal bars
  const barsRef = useRef(null);
  useEffect(() => {
    const wrap = barsRef.current;
    if (!wrap) return;
    wrap.innerHTML = "";

    const w = wrap.clientWidth || 320, h = wrap.clientHeight || 220;
    const m = { top: 8, right: 12, bottom: 8, left: 90 };
    const innerW = w - m.left - m.right, innerH = h - m.top - m.bottom;

    const cats = analysis?.result?.categories || [];

    const svg = d3.select(wrap).append("svg").attr("width", w).attr("height", h);

    if (!cats || cats.length === 0) {
      svg.append("rect").attr("x", 0).attr("y", 0).attr("width", w).attr("height", h).attr("fill", "#f6f7fb");
      svg.append("text")
        .attr("x", w / 2).attr("y", h / 2)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("fill", "#666").style("font-size", "14px")
        .text("No category data yet");
      return;
    }

    const x = d3.scaleLinear().domain([0, 100]).range([0, innerW]);
    const y = d3.scaleBand().domain(cats.map(d => d.label)).range([0, innerH]).padding(0.25);

    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    g.selectAll(".rail").data(cats).enter().append("rect")
      .attr("x", 0).attr("y", d => y(d.label)).attr("width", innerW).attr("height", y.bandwidth())
      .attr("fill", "#eaecef");

    const colors = ["#335dff", "#e74c3c", "#f1c40f", "#335dff", "#e74c3c"];
    g.selectAll(".bar").data(cats).enter().append("rect")
      .attr("x", 0).attr("y", d => y(d.label)).attr("width", d => x(d.value)).attr("height", y.bandwidth())
      .attr("fill", (d, i) => colors[i % colors.length]);

    g.selectAll(".label").data(cats).enter().append("text")
      .attr("x", -10).attr("y", d => y(d.label) + y.bandwidth() / 2)
      .attr("text-anchor", "end").attr("dominant-baseline", "middle")
      .attr("fill", "#333").style("font-weight", 700).text(d => d.label);

    const onResize = () => {
      wrap.innerHTML = "";
      // re-run effect body to redraw with new sizes
      // (simple way: trigger state; here we just call again)
      // In small apps this is fine:
      const ev = new Event("redrawBars");
      wrap.dispatchEvent(ev);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line
  }, [analysis]);

  // Plotly scatter (third chart for HD)
  const plotRef = useRef(null);
  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;

    const pts = analysis?.result?.points || Array.from({ length: 48 }, () => ({
      risk: Math.round(30 + Math.random() * 70),
      engagement: Math.round(100 + Math.random() * 900),
    }));

    const trace = {
      x: pts.map(p => p.risk),
      y: pts.map(p => p.engagement),
      mode: "markers",
      type: "scatter",
      marker: { size: 8 },
    };

    const layout = {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 40, r: 10, t: 10, b: 40 },
      xaxis: { title: "Risk Score", color: "#eee", gridcolor: "#333" },
      yaxis: { title: "Engagement", color: "#eee", gridcolor: "#333" },
      font: { color: "#eee" },
    };

    Plotly.newPlot(el, [trace], layout, { displayModeBar: false, responsive: true });
    const onResize = () => Plotly.Plots.resize(el);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [analysis]);

  return (
    <main className="wrap">
      <section id="results-root" className="results-grid">
        <div className="results-left">
          <h1 className="results-title">
            <span>Likely</span>
            <span>Misinformation</span>
            <span id="scoreText">({score}%)</span>
          </h1>

          <p id="whatWasAnalyzed" className="results-caption">{whatWasAnalyzed}</p>

          <div className="gauge">
            <div className="gauge-inner">
              <div className="gauge-value" id="scoreValue">{score}%</div>
            </div>
          </div>
        </div>

        <div className="results-right">
          <div className="results-card">
            <div className="results-screen">
              <div className="results-screen-body">
                <div className="donut-canvas">
                  <Doughnut data={donutData} options={donutOptions} />
                </div>
                <div id="d3Bars" className="bars-wrap" ref={barsRef}></div>
              </div>
            </div>
          </div>

          <div className="results-card below">
            <div className="results-screen">
              <div className="results-screen-body single">
                <div id="plotlyChart" className="plotly-wrap" ref={plotRef}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
