import { useState } from "react";
import { useNavigate } from "react-router-dom";

const isValidURL = (v) => {
  try {
    const u = new URL(v);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
};

export default function Home() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onDetect = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    setError("");

    if (!(isValidURL(trimmed) || trimmed.length >= 8)) {
      setError("Enter a valid http(s) URL or at least 8 characters of text.");
      return;
    }

    const payload = {
      type: isValidURL(trimmed) ? "url" : "text",
      payload: trimmed,
    };

    let result;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("Bad response");
      result = await res.json();
    } catch {
      // Graceful mock (no fake categories)
      const score = Math.round(50 + Math.random() * 50);
      result = {
        score,
        breakdown: {
          misinfo: score,
          legit: Math.max(0, 100 - score - 10),
          uncertain: 10,
        },
        categories: [],
        points: Array.from({ length: 48 }, () => ({
          risk: Math.round(30 + Math.random() * 70),
          engagement: Math.round(100 + Math.random() * 900),
        })),
      };
    }

    localStorage.setItem(
      "analysisResult",
      JSON.stringify({ source: payload, result })
    );
    navigate("/results");
  };

  return (
    <main className="wrap">
      <section className="hero">
        <div className="left">
          <h1 className="stacked-title">
            <span>MISINFORMATION</span>
            <span>DETECTION</span>
          </h1>

          <form className="detect-row" onSubmit={onDetect}>
            <input
              className="detect-field"
              placeholder="Paste a link or text to analyze..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button className="btn-detect" type="submit">Detect</button>
          </form>
          {error && (
            <div style={{ color: "#ffb3b3", fontSize: 13, marginTop: 6 }}>
              {error}
            </div>
          )}

          <div className="search-wide">
            <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20 L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input placeholder="Search" />
            <svg className="arrow" width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 12 h14 M13 5 l7 7 -7 7" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="socials">
            <img src="/images/facebook.png" alt="Facebook" className="icon-social" />
            <img src="/images/instagram.png" alt="Instagram" className="icon-social" />
            <img src="/images/verified.png" alt="Verified" className="icon-social" />
            <img src="/images/tumblr.png" alt="Tumblr" className="icon-social" />
          </div>

          <div className="dots">✶ ✶ ✶ ✶ ✶</div>
        </div>

        <div className="right art">
          <img src="/images/phone.png" alt="" className="art-img img-phone" />
          <img src="/images/hand.png" alt="" className="art-img img-hand" />
          <img src="/images/x.png" alt="" className="art-img img-x" />
          <img src="/images/camera.png" alt="" className="art-img img-camera" />
        </div>
      </section>
    </main>
  );
}
