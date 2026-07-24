import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Edit3,
  Loader2,
  Plus,
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
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [notice, setNotice] = useState("");

  const filteredTerms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return terms;

    return terms.filter((term) =>
      [term.korean, term.english, term.category, term.memo]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, terms]);

  useEffect(() => {
    fetchTerms();
  }, []);

  async function fetchTerms() {
    if (!hasSupabaseConfig || !supabase) {
      setNotice("Supabase 환경변수를 먼저 설정하세요.");
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

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(term) {
    setEditingId(term.id);
    setForm({
      korean: term.korean,
      english: term.english,
      category: term.category || "",
      memo: term.memo || "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasSupabaseConfig || !supabase) {
      setNotice("Supabase 연결 정보를 먼저 설정하세요.");
      return;
    }

    if (!form.korean.trim() || !form.english.trim()) {
      setNotice("한글 단어와 영어 번역을 입력하세요.");
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
    setNotice(editingId ? "단어를 수정했습니다." : "새 단어를 추가했습니다.");
    setStatus("idle");
    closeModal();
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
    setNotice("단어를 삭제했습니다.");
    setStatus("idle");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Project Sapphire</p>
          <h1>용어 목록</h1>
        </div>

        <button className="icon-button primary-icon" onClick={openCreateModal}>
          <Plus size={22} />
          <span className="sr-only">새 단어 추가</span>
        </button>
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
            <span className="sr-only">알림 닫기</span>
          </button>
        </section>
      )}

      <section className="search-panel" aria-label="용어 검색">
        <Search size={20} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="한글 단어 또는 영어 번역 검색"
          autoComplete="off"
        />
        {status === "loading" && <Loader2 className="spin" size={20} />}
      </section>

      <section className="list-header">
        <span>전체 {terms.length}개</span>
        <span>표시 {filteredTerms.length}개</span>
      </section>

      <section className="term-list" aria-label="용어 목록">
        {filteredTerms.map((term) => (
          <article className="term-row" key={term.id}>
            <div className="term-copy">
              <strong>{term.korean}</strong>
              <span>{term.english}</span>
              {(term.category || term.memo) && (
                <small>
                  {[term.category, term.memo].filter(Boolean).join(" · ")}
                </small>
              )}
            </div>

            <div className="row-actions">
              <button className="icon-button" onClick={() => openEditModal(term)}>
                <Edit3 size={18} />
                <span className="sr-only">수정</span>
              </button>
              <button
                className="icon-button danger"
                onClick={() => deleteTerm(term.id)}
                disabled={status === "saving"}
              >
                <Trash2 size={18} />
                <span className="sr-only">삭제</span>
              </button>
            </div>
          </article>
        ))}

        {!filteredTerms.length && (
          <div className="empty-state">검색 결과가 없습니다.</div>
        )}
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{editingId ? "단어 수정" : "새 단어 추가"}</h2>
              <button className="icon-button compact" onClick={closeModal}>
                <X size={17} />
                <span className="sr-only">닫기</span>
              </button>
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
                  placeholder="예: 송전망"
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
                  placeholder="예: Transmission Grid"
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
                  placeholder="선택 입력"
                />
              </label>

              <label>
                <span>메모</span>
                <textarea
                  value={form.memo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      memo: event.target.value,
                    }))
                  }
                  placeholder="선택 입력"
                />
              </label>

              <div className="form-actions">
                <button className="ghost-button" type="button" onClick={closeModal}>
                  취소
                </button>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={!hasSupabaseConfig || status === "saving"}
                >
                  <Save size={18} />
                  저장
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
