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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (filters.department.trim()) params.set('department', filters.department.trim());
    if (filters.level) params.set('level', filters.level);
    if (filters.delivery_mode) params.set('delivery_mode', filters.delivery_mode);
    if (filters.max_fee && !isNaN(Number(filters.max_fee))) params.set('max_fee', filters.max_fee);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    return params.toString();
  }, [search, filters, page, pageSize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      fetch(`/api/courses?${query}`)
        .then(r => r.json())
        .then(d => {
          setItems(d.items ?? []);
          setTotal(d.total ?? 0);
        })
        .catch(err => console.error('Error fetching courses:', err))
        .finally(() => setLoading(false));
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleAskAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const d = await r.json();
      setAiFilters(d.filters);
      setAiResults(d.items ?? []);
    } catch (err) {
      console.error('Error asking AI:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryModeIcon = (mode: string) => {
    switch (mode) {
      case 'online': return '🌐';
      case 'offline': return '🏫';
      case 'hybrid': return '🔄';
      default: return '📚';
    }
  };

  const getLevelBadge = (level: string) => {
    return level === 'PG' ? '🎓 PG' : '🎒 UG';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        minHeight: '100vh',
        padding: '0',
        width: '100%',
        maxWidth: '100vw'
      }}>
        <header style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem 0',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '3rem', 
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🎓 CourseQuest Lite
          </h1>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            fontSize: '1.2rem', 
            opacity: 0.9 
          }}>
            Discover, Compare & Explore University Courses with AI
          </p>
        </header>

        <nav style={{ 
          background: 'white',
          padding: '0 2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ 
            display: 'flex', 
            gap: 0, 
            maxWidth: 1200, 
            margin: '0 auto'
          }}>
            {[
              { id: 'search', label: '🔍 Search Courses', icon: '🔍' },
              { id: 'compare', label: '⚖️ Compare', icon: '⚖️' },
              { id: 'ask', label: '🤖 Ask AI', icon: '🤖' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#666',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <main style={{ 
          maxWidth: '100%', 
          margin: '0 auto', 
          padding: '1rem',
          minHeight: 'calc(100vh - 200px)',
          width: '100%',
          boxSizing: 'border-box'
        }}>

          {activeTab === 'search' && (
            <div>
              <div style={{ 
                background: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
              }}>
                <h2 style={{ 
                  margin: '0 0 1.5rem 0', 
                  fontSize: '2rem', 
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🔍 Search Courses
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  width: '100%'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                      Search by name/department
                    </label>
                    <input
                      placeholder="e.g., Computer Science, Machine Learning"
                      value={search}
                      onChange={e => { 
                        setSearch(e.target.value); 
                        if (page !== 1) setPage(1); 
                      }}
                      style={{ 
                        width: '100%',
                        padding: '0.75rem 1rem', 
                        border: '2px solid #e1e5e9', 
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                      Department
                    </label>
                    <input
                      placeholder="e.g., Computer Science"
                      value={filters.department}
                      onChange={e => { 
                        setFilters({ ...filters, department: e.target.value }); 
                        if (page !== 1) setPage(1); 
                      }}
                      style={{ 
                        width: '100%',
                        padding: '0.75rem 1rem', 
                        border: '2px solid #e1e5e9', 
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                      Level
                    </label>
                    <select
                      value={filters.level}
                      onChange={e => { 
                        setFilters({ ...filters, level: e.target.value }); 
                        if (page !== 1) setPage(1); 
                      }}
                      style={{ 
                        width: '100%',
                        padding: '0.75rem 1rem', 
                        border: '2px solid #e1e5e9', 
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">All Levels</option>
                      <option value="UG">Undergraduate (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                      Delivery Mode
                    </label>
                    <select
                      value={filters.delivery_mode}
                      onChange={e => { 
                        setFilters({ ...filters, delivery_mode: e.target.value }); 
                        if (page !== 1) setPage(1); 
                      }}
                      style={{ 
                        width: '100%',
                        padding: '0.75rem 1rem', 
                        border: '2px solid #e1e5e9', 
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">All Modes</option>
                      <option value="online">🌐 Online</option>
                      <option value="offline">🏫 Offline</option>
                      <option value="hybrid">🔄 Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                      Max Fee (INR)
                    </label>
                    <input
                      placeholder="e.g., 50000"
                      value={filters.max_fee}
                      onChange={e => { 
                        setFilters({ ...filters, max_fee: e.target.value }); 
                        if (page !== 1) setPage(1); 
                      }}
                      style={{ 
                        width: '100%',
                        padding: '0.75rem 1rem', 
                        border: '2px solid #e1e5e9', 
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilters({ department: '', level: '', delivery_mode: '', max_fee: '' });
                      setPage(1);
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    🗑️ Clear All Filters
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '4rem',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                  <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading courses...</div>
                </div>
              ) : (
                <div style={{ 
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    padding: '1.5rem 2rem',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <h3 style={{ margin: 0, color: '#333' }}>
                      Found {total} courses
                    </h3>
                  </div>
                  
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Course</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Department</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Level</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Mode</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Credits</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Duration</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Rating</th>
                          <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Fee</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((c, index) => (
                          <tr key={c.course_id} style={{ 
                            borderBottom: '1px solid #f1f3f4',
                            background: index % 2 === 0 ? 'white' : '#fafbfc'
                          }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: '600', color: '#333', marginBottom: '0.25rem' }}>
                                {c.course_name}
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                ID: {c.course_id}
                              </div>
                            </td>
                            <td style={{ padding: '1rem', color: '#555' }}>{c.department}</td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                background: c.level === 'PG' ? '#e3f2fd' : '#f3e5f5',
                                color: c.level === 'PG' ? '#1976d2' : '#7b1fa2'
                              }}>
                                {getLevelBadge(c.level)}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.25rem' }}>
                              {getDeliveryModeIcon(c.delivery_mode)}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#555' }}>
                              {c.credits}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center', color: '#555' }}>
                              {c.duration_weeks}w
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '0.25rem'
                              }}>
                                <span style={{ fontSize: '1.25rem' }}>⭐</span>
                                <span style={{ fontWeight: '600', color: '#333' }}>
                                  {c.rating.toFixed(1)}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#2e7d32' }}>
                              ₹{c.tuition_fee_inr.toLocaleString()}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <button
                                onClick={() => setCompare(prev => ({ ...prev, [c.course_id]: c }))}
                                style={{ 
                                  padding: '0.5rem 1rem', 
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '8px', 
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  transition: 'transform 0.2s ease',
                                  fontSize: '0.875rem'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                              >
                                ➕ Add
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div style={{ 
                    padding: '1.5rem 2rem',
                    background: '#f8f9fa',
                    display: 'flex', 
                    gap: '1rem', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderTop: '1px solid #dee2e6'
                  }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => {
                        if (page > 1) setPage(page - 1);
                      }}
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        background: page <= 1 ? '#e9ecef' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                        color: page <= 1 ? '#6c757d' : 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ← Previous
                    </button>
                    <div style={{ 
                      padding: '0.75rem 1.5rem',
                      background: 'white',
                      borderRadius: '8px',
                      fontWeight: '600',
                      color: '#333',
                      border: '2px solid #e1e5e9'
                    }}>
                      Page {page} of {totalPages}
                    </div>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => {
                        if (page < totalPages) setPage(page + 1);
                      }}
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        background: page >= totalPages ? '#e9ecef' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                        color: page >= totalPages ? '#6c757d' : 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compare' && (
            <div style={{ 
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: '2rem', 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚖️ Compare Courses ({Object.keys(compare).length} selected)
              </h2>
              {Object.keys(compare).length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '4rem',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>No courses selected</h3>
                  <p style={{ margin: 0 }}>Use "Add" button in search results to compare courses</p>
                </div>
              ) : (
                <>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                    gap: '1.5rem', 
                    marginBottom: '2rem' 
                  }}>
                    {Object.values(compare).map(c => (
                      <div key={c.course_id} style={{ 
                        border: '2px solid #e1e5e9', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}>
                        <button
                          onClick={() => setCompare(prev => { const n = { ...prev }; delete n[c.course_id]; return n; })}
                          style={{ 
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            padding: '0.5rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            width: '2rem',
                            height: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                        <h3 style={{ 
                          margin: '0 0 1rem 0', 
                          color: '#333',
                          fontSize: '1.25rem',
                          fontWeight: '700'
                        }}>
                          {c.course_name}
                        </h3>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '0.75rem',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Department</div>
                            <div style={{ fontWeight: '600', color: '#333' }}>{c.department}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Level</div>
                            <div style={{ fontWeight: '600', color: '#333' }}>{getLevelBadge(c.level)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Mode</div>
                            <div style={{ fontWeight: '600', color: '#333' }}>
                              {getDeliveryModeIcon(c.delivery_mode)} {c.delivery_mode}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Credits</div>
                            <div style={{ fontWeight: '600', color: '#333' }}>{c.credits}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Duration</div>
                            <div style={{ fontWeight: '600', color: '#333' }}>{c.duration_weeks} weeks</div>
                          </div>
      <div>
                            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Rating</div>
                            <div style={{ fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              ⭐ {c.rating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '1rem',
                          background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Tuition Fee</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2e7d32' }}>
                            ₹{c.tuition_fee_inr.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <a
                      href={`/api/compare?ids=${Object.keys(compare).join(',')}`}
                      target="_blank"
                      style={{ 
                        padding: '1rem 2rem', 
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
                        color: 'white', 
                        textDecoration: 'none', 
                        borderRadius: '8px', 
                        display: 'inline-block',
                        fontWeight: '600',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      📊 Open Compare JSON
        </a>
      </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'ask' && (
            <div style={{ 
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                margin: '0 0 1rem 0', 
                fontSize: '2rem', 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🤖 Ask AI (Rule-based Parser)
              </h2>
              <p style={{ 
                color: '#666', 
                marginBottom: '2rem',
                fontSize: '1.1rem',
                lineHeight: '1.6'
              }}>
                Try natural language queries like: "Show PG courses under 50,000 INR offered online" or "UG computer science courses with rating 4.0+"
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '2rem' 
              }}>
                <input
                  style={{ 
                    flex: 1, 
                    padding: '1rem 1.5rem', 
                    border: '2px solid #e1e5e9', 
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  placeholder="e.g., Show PG courses under 50,000 INR offered online"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAskAI()}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                />
                <button
                  onClick={handleAskAI}
                  disabled={loading || !question.trim()}
                  style={{ 
                    padding: '1rem 2rem', 
                    background: loading || !question.trim() ? '#e9ecef' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: loading || !question.trim() ? '#6c757d' : 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? '⏳ Processing...' : '🚀 Ask AI'}
        </button>
              </div>
              
              {aiFilters && (
                <div style={{ 
                  marginBottom: '2rem', 
                  padding: '1.5rem', 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)', 
                  borderRadius: '12px', 
                  fontSize: '0.95rem',
                  border: '2px solid #e1e5e9'
                }}>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                    🧠 Parsed Filters:
                  </div>
                  <pre style={{ 
                    margin: 0, 
                    color: '#555',
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '0.875rem'
                  }}>
                    {JSON.stringify(aiFilters, null, 2)}
                  </pre>
                </div>
              )}
              
              {aiResults.length > 0 ? (
                <div>
                  <h3 style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#333',
                    fontSize: '1.5rem'
                  }}>
                    🎯 Results ({aiResults.length} courses found)
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    {aiResults.map(c => (
                      <div key={c.course_id} style={{ 
                        padding: '1.5rem', 
                        border: '2px solid #e1e5e9', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '1rem'
                        }}>
                          <h4 style={{ 
                            margin: 0, 
                            color: '#333',
                            fontSize: '1.1rem',
                            fontWeight: '700'
                          }}>
                            {c.course_name}
                          </h4>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: c.level === 'PG' ? '#e3f2fd' : '#f3e5f5',
                            color: c.level === 'PG' ? '#1976d2' : '#7b1fa2'
                          }}>
                            {getLevelBadge(c.level)}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '0.5rem',
                          marginBottom: '1rem',
                          fontSize: '0.9rem'
                        }}>
                          <div><strong>Department:</strong> {c.department}</div>
                          <div><strong>Mode:</strong> {getDeliveryModeIcon(c.delivery_mode)} {c.delivery_mode}</div>
                          <div><strong>Credits:</strong> {c.credits}</div>
                          <div><strong>Duration:</strong> {c.duration_weeks}w</div>
                          <div><strong>Rating:</strong> ⭐ {c.rating.toFixed(1)}</div>
                          <div><strong>Fee:</strong> ₹{c.tuition_fee_inr.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : aiFilters && aiResults.length === 0 ? (
                <div style={{ 
                  padding: '2rem', 
                  background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)', 
                  borderRadius: '12px', 
                  border: '2px solid #ffc107',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>No matching courses found</h3>
                  <p style={{ margin: 0, color: '#856404' }}>Try adjusting your search criteria</p>
                </div>
              ) : null}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;