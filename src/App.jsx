import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  Download,
  FileText,
  Languages,
  MessageSquareText,
  PanelRightOpen,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

const metrics = [
  { label: "완료율", value: "74%", detail: "142 / 192 segments" },
  { label: "검수 대기", value: "18", detail: "legal, naming 포함" },
  { label: "일관성 점수", value: "92", detail: "용어집 기준" },
  { label: "예상 마감", value: "D-3", detail: "2026.07.27" },
];

const segments = [
  {
    id: "01",
    title: "Executive Summary",
    status: "검수중",
    score: 96,
    owner: "Editorial",
  },
  {
    id: "02",
    title: "Product Architecture",
    status: "번역완료",
    score: 91,
    owner: "Tech",
  },
  {
    id: "03",
    title: "Legal Notice",
    status: "주의",
    score: 78,
    owner: "Legal",
  },
  {
    id: "04",
    title: "Launch Timeline",
    status: "초안",
    score: 66,
    owner: "PMO",
  },
];

const checks = [
  "Sapphire 고유명사 유지",
  "계약 문구 모달 동사 검토",
  "미국식 날짜 표기 통일",
  "CTA tone: concise & assured",
];

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <Languages size={22} />
          </div>
          <div>
            <p className="eyebrow">Project Sapphire</p>
            <h1>English Translation Desk</h1>
          </div>
        </div>

        <div className="topbar-actions" aria-label="프로젝트 작업">
          <button className="icon-button" aria-label="검색">
            <Search size={18} />
          </button>
          <button className="icon-button" aria-label="검수 패널 열기">
            <PanelRightOpen size={18} />
          </button>
          <button className="primary-button">
            <Send size={18} />
            전달
          </button>
        </div>
      </header>

      <section className="overview">
        <div className="hero-panel">
          <img
            src="/images/sapphire-translation-workspace.png"
            alt="Project Sapphire 영어 번역 작업 데스크"
          />
          <div className="hero-copy">
            <p>Active sprint</p>
            <h2>Sapphire 번역본 최종 검수</h2>
            <span>톤, 용어, 법무 문구를 한 화면에서 정리합니다.</span>
          </div>
        </div>

        <div className="metric-grid">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workbench">
        <aside className="segment-list" aria-label="번역 구간">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Segments</p>
              <h2>번역 구간</h2>
            </div>
            <button className="ghost-button">
              전체
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="tabs" role="tablist" aria-label="구간 상태">
            <button className="tab active">전체</button>
            <button className="tab">주의</button>
            <button className="tab">완료</button>
          </div>

          <div className="segment-stack">
            {segments.map((segment) => (
              <button className="segment-row" key={segment.id}>
                <span className="segment-id">{segment.id}</span>
                <span className="segment-main">
                  <strong>{segment.title}</strong>
                  <small>{segment.owner}</small>
                </span>
                <span className={`status ${statusClass(segment.status)}`}>
                  {segment.status}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="editor-panel" aria-label="원문과 번역문">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Editor</p>
              <h2>Executive Summary</h2>
            </div>
            <div className="editor-actions">
              <button className="icon-button" aria-label="내보내기">
                <Download size={18} />
              </button>
              <button className="secondary-button">
                <Sparkles size={18} />
                톤 점검
              </button>
            </div>
          </div>

          <div className="language-grid">
            <article className="document-pane">
              <div className="pane-title">
                <FileText size={17} />
                <span>원문</span>
              </div>
              <p>
                Project Sapphire establishes a resilient operating model for
                regional launch teams, balancing speed, governance, and partner
                readiness across every market.
              </p>
              <p>
                The program prioritizes clear ownership, measurable adoption
                signals, and a repeatable review rhythm before public release.
              </p>
            </article>

            <article className="document-pane translated">
              <div className="pane-title">
                <MessageSquareText size={17} />
                <span>영문 검수본</span>
              </div>
              <p>
                Project Sapphire defines a resilient operating model for
                regional launch teams, balancing execution speed, governance,
                and partner readiness in every market.
              </p>
              <p>
                The program emphasizes clear ownership, measurable adoption
                signals, and a repeatable review cadence before public release.
              </p>
            </article>
          </div>
        </section>

        <aside className="quality-panel" aria-label="품질 검수">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Quality</p>
              <h2>검수 체크</h2>
            </div>
            <ShieldCheck size={21} />
          </div>

          <div className="score-card">
            <span>Quality score</span>
            <strong>96</strong>
            <div className="score-bar">
              <i style={{ width: "96%" }} />
            </div>
          </div>

          <div className="checklist">
            {checks.map((check, index) => (
              <label key={check} className="check-row">
                <input type="checkbox" defaultChecked={index < 3} />
                <span>
                  <Check size={14} />
                </span>
                {check}
              </label>
            ))}
          </div>

          <div className="timeline">
            <div className="timeline-item complete">
              <ClipboardCheck size={17} />
              <span>초안 번역 완료</span>
              <b>09:20</b>
            </div>
            <div className="timeline-item active">
              <TimerReset size={17} />
              <span>법무 표현 확인</span>
              <b>진행중</b>
            </div>
            <div className="timeline-item">
              <ArrowUpRight size={17} />
              <span>클라이언트 전달</span>
              <b>16:00</b>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function statusClass(status) {
  return {
    검수중: "review",
    번역완료: "done",
    주의: "risk",
    초안: "draft",
  }[status];
}

export default App;
