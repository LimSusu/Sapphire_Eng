import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Database,
  Edit3,
  Languages,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { hasSupabaseConfig, supabase } from "./lib/supabaseClient";

const emptyForm = {
  korean: "",
  english: "",
  category: "",
  memo: "",
};

function App() {
  const [terms, setTerms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState("");

  const selectedTerm = useMemo(
    () => terms.find((term) => term.id === editingId) || terms[0],
    [editingId, terms]
  );

  const categories = useMemo(() => {
    const unique = terms
      .map((term) => term.category)
      .filter(Boolean)
      .filter((category, index, list) => list.indexOf(category) === index);
    return ["전체", ...unique];
  }, [terms]);

  const filteredTerms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return terms.filter((term) => {
      const matchesCategory =
        activeCategory === "전체" || term.category === activeCategory;
      const searchable = [term.korean, term.english, term.category, term.memo]
        .join(" ")
        .toLowerCase();
      return matchesCategory && searchable.includes(normalizedQuery);
    });
  }, [activeCategory, query, terms]);

  useEffect(() => {
    fetchTerms();
  }, []);

  async function fetchTerms() {
    if (!hasSupabaseConfig) {
      setNotice("Supabase 환경변수가 없어 데이터베이스에 연결하지 못했습니다.");
      return;
    }

    setStatus("loading");
    const { data, error } = await supabase
      .from("glossary_terms")
      .select("*")
      .order("korean", { ascending: true });

    if (error) {
      setNotice(error.message);
      setStatus("error");
      return;
    }

    setTerms(data || []);
    setStatus("idle");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!hasSupabaseConfig || !supabase) {
      setNotice("Supabase 연결 정보를 먼저 설정하세요.");
      return;
    }
    if (!form.korean.trim() || !form.english.trim()) {
      setNotice("한글 단어와 영어 번역은 반드시 입력해야 합니다.");
      return;
    }

    setStatus("saving");
    const payload = {
      korean: form.korean.trim(),
      english: form.english.trim(),
      category: form.category.trim(),
      memo: form.memo.trim(),
    };

    const request = editingId
      ? supabase
          .from("glossary_terms")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single()
      : supabase.from("glossary_terms").insert(payload).select().single();

    const { data, error } = await request;

    if (error) {
      setNotice(error.message);
      setStatus("error");
      return;
    }

    setTerms((current) =>
      editingId
        ? current.map((term) => (term.id === editingId ? data : term))
        : [...current, data].sort((a, b) => a.korean.localeCompare(b.korean))
    );
    setEditingId(null);
    setForm(emptyForm);
    setNotice(editingId ? "번역본을 수정했습니다." : "새 단어를 추가했습니다.");
    setStatus("idle");
  }

  function startEdit(term) {
    setEditingId(term.id);
    setForm({
      korean: term.korean,
      english: term.english,
      category: term.category || "",
      memo: term.memo || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function deleteTerm(termId) {
    if (!hasSupabaseConfig || !supabase) {
      setNotice("Supabase 연결 정보를 먼저 설정하세요.");
      return;
    }

    setStatus("saving");
    const { error } = await supabase
      .from("glossary_terms")
      .delete()
      .eq("id", termId);

    if (error) {
      setNotice(error.message);
      setStatus("error");
      return;
    }

    setTerms((current) => current.filter((term) => term.id !== termId));
    if (editingId === termId) {
      cancelEdit();
    }
    setNotice("단어를 삭제했습니다.");
    setStatus("idle");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <Languages size={22} />
          </div>
          <div>
            <p className="eyebrow">Project Sapphire</p>
            <h1>Glossary Translation Desk</h1>
          </div>
        </div>

        <div className="connection-pill">
          <Database size={17} />
          {hasSupabaseConfig ? "Supabase 연결 준비" : "환경변수 필요"}
        </div>
      </header>

      {!hasSupabaseConfig && (
        <section className="notice warning">
          <AlertCircle size={18} />
          <span>
            `.env` 또는 Vercel 환경변수에 `VITE_SUPABASE_URL`과
            `VITE_SUPABASE_ANON_KEY`를 추가하세요.
          </span>
        </section>
      )}

      {notice && (
        <section className="notice">
          <Check size={18} />
          <span>{notice}</span>
          <button className="icon-button compact" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </section>
      )}

      <section className="overview">
        <div className="hero-panel">
          <img
            src="/images/sapphire-translation-workspace.png"
            alt="Project Sapphire 영어 번역 작업 데스크"
          />
          <div className="hero-copy">
            <p>Live glossary</p>
            <h2>한글 단어별 영어 번역본 관리</h2>
            <span>검색, 추가, 수정, 삭제를 Supabase와 바로 동기화합니다.</span>
          </div>
        </div>

        <div className="summary-panel">
          <article className="metric-card">
            <span>등록 단어</span>
            <strong>{terms.length}</strong>
            <p>Supabase `glossary_terms` 기준</p>
          </article>
          <article className="metric-card">
            <span>현재 목록</span>
            <strong>{filteredTerms.length}</strong>
            <p>검색어와 카테고리 필터 반영</p>
          </article>
          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="한글, 영어, 메모 검색"
            />
          </div>
          <button className="secondary-button" onClick={fetchTerms}>
            <RefreshCw size={18} />
            새로고침
          </button>
        </div>
      </section>

      <section className="glossary-workbench">
        <aside className="term-list" aria-label="용어 목록">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Terms</p>
              <h2>용어 목록</h2>
            </div>
            {status === "loading" && <Loader2 className="spin" size={19} />}
          </div>

          <div className="tabs" role="tablist" aria-label="카테고리">
            {categories.slice(0, 4).map((category) => (
              <button
                className={`tab ${activeCategory === category ? "active" : ""}`}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="term-stack">
            {filteredTerms.map((term) => (
              <article
                className={`term-row ${selectedTerm?.id === term.id ? "selected" : ""}`}
                key={term.id}
              >
                <button onClick={() => startEdit(term)}>
                  <span className="term-main">
                    <strong>{term.korean}</strong>
                    <small>{term.english}</small>
                  </span>
                  {term.category && <span className="status">{term.category}</span>}
                </button>
              </article>
            ))}
            {!filteredTerms.length && (
              <div className="empty-state">표시할 단어가 없습니다.</div>
            )}
          </div>
        </aside>

        <section className="editor-panel" aria-label="단어 추가 및 수정">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Editor</p>
              <h2>{editingId ? "번역본 수정" : "새 단어 추가"}</h2>
            </div>
          </div>

          <form className="term-form" onSubmit={handleSubmit}>
            <label>
              <span>한글 단어</span>
              <input
                value={form.korean}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    korean: event.target.value,
                  }))
                }
                placeholder="예: 검수"
              />
            </label>

            <label>
              <span>영어 번역</span>
              <input
                value={form.english}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    english: event.target.value,
                  }))
                }
                placeholder="예: review"
              />
            </label>

            <label>
              <span>카테고리</span>
              <input
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                placeholder="예: Legal, UI, Marketing"
              />
            </label>

            <label>
              <span>메모</span>
              <textarea
                value={form.memo}
                onChange={(event) =>
                  setForm((current) => ({ ...current, memo: event.target.value }))
                }
                placeholder="사용 맥락이나 금지 표현을 적어두세요."
              />
            </label>

            <div className="form-actions">
              {editingId && (
                <button className="ghost-button" type="button" onClick={cancelEdit}>
                  <X size={18} />
                  취소
                </button>
              )}
              <button
                className="primary-button"
                type="submit"
                disabled={!hasSupabaseConfig || status === "saving"}
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? "수정 저장" : "단어 추가"}
              </button>
            </div>
          </form>
        </section>

        <aside className="detail-panel" aria-label="선택된 용어 상세">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Preview</p>
              <h2>번역 상세</h2>
            </div>
          </div>

          {selectedTerm ? (
            <article className="term-detail">
              <span className="detail-label">한글</span>
              <strong>{selectedTerm.korean}</strong>
              <span className="detail-label">영어</span>
              <p>{selectedTerm.english}</p>
              {selectedTerm.category && (
                <>
                  <span className="detail-label">카테고리</span>
                  <p>{selectedTerm.category}</p>
                </>
              )}
              {selectedTerm.memo && (
                <>
                  <span className="detail-label">메모</span>
                  <p>{selectedTerm.memo}</p>
                </>
              )}
              <div className="detail-actions">
                <button
                  className="secondary-button"
                  onClick={() => startEdit(selectedTerm)}
                >
                  <Edit3 size={18} />
                  수정
                </button>
                <button
                  className="danger-button"
                  onClick={() => deleteTerm(selectedTerm.id)}
                  disabled={status === "saving"}
                >
                  <Trash2 size={18} />
                  삭제
                </button>
              </div>
            </article>
          ) : (
            <div className="empty-state">단어를 선택하거나 새로 추가하세요.</div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default App;
