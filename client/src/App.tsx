import { useEffect, useMemo, useState } from 'react';

type Course = {
  course_id: string;
  course_name: string;
  department: string;
  level: 'UG' | 'PG';
  delivery_mode: 'online' | 'offline' | 'hybrid';
  credits: number;
  duration_weeks: number;
  rating: number;
  tuition_fee_inr: number;
  year_offered: number;
};

function App() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', level: '', delivery_mode: '', max_fee: '' });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [compare, setCompare] = useState<Record<string, Course>>({});
  const [question, setQuestion] = useState('');
  const [aiResults, setAiResults] = useState<Course[]>([]);
  const [aiFilters, setAiFilters] = useState<any>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filters.department) params.set('department', filters.department);
    if (filters.level) params.set('level', filters.level);
    if (filters.delivery_mode) params.set('delivery_mode', filters.delivery_mode);
    if (filters.max_fee) params.set('max_fee', filters.max_fee);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    return params.toString();
  }, [search, filters, page, pageSize]);

  useEffect(() => {
    fetch(`/api/courses?${query}`).then(r => r.json()).then(d => { setItems(d.items ?? []); setTotal(d.total ?? 0); });
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>CourseQuest Lite</h1>
      <nav style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <a href="#search">Search</a>
        <a href="#compare">Compare</a>
        <a href="#ask">Ask AI</a>
      </nav>

      <section id="search" style={{ borderTop: '1px solid #ddd', paddingTop: 12 }}>
        <h2>Search</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8 }}>
          <input placeholder="Search by name/department" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <input placeholder="Department" value={filters.department} onChange={e => { setFilters({ ...filters, department: e.target.value }); setPage(1); }} />
          <select value={filters.level} onChange={e => { setFilters({ ...filters, level: e.target.value }); setPage(1); }}>
            <option value="">Level</option>
            <option value="UG">UG</option>
            <option value="PG">PG</option>
          </select>
          <select value={filters.delivery_mode} onChange={e => { setFilters({ ...filters, delivery_mode: e.target.value }); setPage(1); }}>
            <option value="">Mode</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <input placeholder="Max Fee (INR)" value={filters.max_fee} onChange={e => { setFilters({ ...filters, max_fee: e.target.value }); setPage(1); }} />
        </div>

        <div style={{ marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Dept</th>
                <th>Level</th>
                <th>Mode</th>
                <th>Credits</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Fee</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.course_id} style={{ borderTop: '1px solid #eee' }}>
                  <td>{c.course_name}</td>
                  <td>{c.department}</td>
                  <td align="center">{c.level}</td>
                  <td align="center">{c.delivery_mode}</td>
                  <td align="center">{c.credits}</td>
                  <td align="center">{c.duration_weeks}w</td>
                  <td align="center">{c.rating.toFixed(1)}</td>
                  <td align="right">₹{c.tuition_fee_inr.toLocaleString()}</td>
                  <td>
                    <button onClick={() => setCompare(prev => ({ ...prev, [c.course_id]: c }))}>Add to Compare</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</button>
          </div>
        </div>
      </section>

      <section id="compare" style={{ borderTop: '1px solid #ddd', paddingTop: 12, marginTop: 16 }}>
        <h2>Compare</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.values(compare).map(c => (
            <div key={c.course_id} style={{ border: '1px solid #ddd', padding: 8 }}>
              <strong>{c.course_name}</strong>
              <div>{c.department} • {c.level} • {c.delivery_mode}</div>
              <div>Credits: {c.credits} • Duration: {c.duration_weeks}w</div>
              <div>Rating: {c.rating} • Fee: ₹{c.tuition_fee_inr.toLocaleString()}</div>
              <button onClick={() => setCompare(prev => { const n = { ...prev }; delete n[c.course_id]; return n; })}>Remove</button>
            </div>
          ))}
        </div>
        {Object.keys(compare).length > 0 && (
          <div style={{ marginTop: 8 }}>
            <a href={`/api/compare?ids=${Object.keys(compare).join(',')}`} target="_blank">Open compare JSON</a>
          </div>
        )}
      </section>

      <section id="ask" style={{ borderTop: '1px solid #ddd', paddingTop: 12, marginTop: 16 }}>
        <h2>Ask AI (Rule-based)</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ flex: 1 }} placeholder="e.g., Show PG courses under 50,000 INR offered online" value={question} onChange={e => setQuestion(e.target.value)} />
          <button onClick={async () => {
            const r = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
            const d = await r.json();
            setAiFilters(d.filters);
            setAiResults(d.items ?? []);
          }}>Ask</button>
        </div>
        {aiFilters && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>Parsed filters: {JSON.stringify(aiFilters)}</div>
        )}
        <ul style={{ marginTop: 8 }}>
          {aiResults.map(c => (
            <li key={c.course_id}>{c.course_name} — {c.department} • {c.level} • {c.delivery_mode} • ₹{c.tuition_fee_inr.toLocaleString()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
