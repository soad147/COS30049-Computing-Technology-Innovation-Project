export default function About() {
  return (
    <>
      <section className="abt-hero">
        <div className="abt-hero__grid">
          <div className="abt-hero__text">
            <h1 className="abt-title">ABOUT</h1>
            <span className="abt-underline" aria-hidden="true"></span>

            <p className="abt-lede">
              A prototype to detect misinformation in social media posts using NLP/ML.
              Users submit a URL or text; we return a likelihood score and clear visual
              explanations for transparency.
            </p>

            <ul className="abt-list">
              <li>Clear probability score with three visualisations (Chart.js, D3, Plotly).</li>
              <li>Responsive, accessible UI with consistent navigation.</li>
              <li>API-ready: front end posts to <code>/api/analyze</code>.</li>
            </ul>

            <div className="abt-cta">
              <a className="abt-btn abt-btn--primary" href="/">Try It</a>
              <a className="abt-btn abt-btn--ghost" href="/results">See Results</a>
            </div>
          </div>

          <figure className="abt-hero__figure">
            <img src="/images/hero-about.jpg" alt="Team working on UI wireframes" className="abt-hero__img" />
            <span className="abt-frame" aria-hidden="true"></span>
          </figure>
        </div>
      </section>

      <main className="abt-main container">
        <section className="abt-cards">
          <article className="abt-card">
            <h3>Goals</h3>
            <p>Make misinformation detection understandable through clean visuals and a single, focused flow.</p>
          </article>
          <article className="abt-card">
            <h3>Usability</h3>
            <p>Clarity, contrast, keyboard focus, semantic HTML, and transparent status updates.</p>
          </article>
          <article className="abt-card">
            <h3>Tech Stack</h3>
            <p>React, Chart.js, D3, Plotly, Fetch API. Back end endpoint: <code>/api/analyze</code>.</p>
          </article>
        </section>

        <section className="abt-team">
          <h2>Team</h2>
          <div className="abt-team__grid">
            <div className="abt-member">
              <div className="abt-avatar" data-initials="SY"></div>
              <div>
                <div className="abt-name">Soad Yusuf</div>
                <div className="abt-role">PM & ML Pipeline</div>
              </div>
            </div>
            <div className="abt-member">
              <div className="abt-avatar" data-initials="NW"></div>
              <div>
                <div className="abt-name">Nishama Warnakulasooriya Mahalekamge</div>
                <div className="abt-role">UI/UX & Visualisations</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
