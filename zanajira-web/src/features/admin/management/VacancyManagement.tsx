import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';

export default function VacancyManagement() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [employers, setEmployers] = useState<any[]>([]);
  const [form, setForm] = useState({
    employer_id: '', post_title: '', num_posts: '1', location: '',
    qualifications: '', duties: '', salary_scale: '', closing_date: '',
  });
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/admin/vacancies'), api.get('/admin/employers')])
      .then(([v, e]) => { setVacancies(v.data.data ?? []); setEmployers(e.data.data ?? []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/vacancies', { ...form, employer_id: parseInt(form.employer_id), num_posts: parseInt(form.num_posts) });
      setMsg('Nafasi imeundwa kikamilifu.'); setShowForm(false); load();
    } catch (e: any) { setMsg(e.response?.data?.error ?? 'Imeshindwa kuunda.'); }
  };

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/admin/vacancies/${id}/status`, { status });
    load();
  };

  const deleteVacancy = async (id: string) => {
    if (!confirm('Unahakika unataka kufuta nafasi hii?')) return;
    await api.delete(`/admin/vacancies/${id}`);
    load();
  };

  const filtered = vacancies.filter((v: any) => {
    const matchSearch = !search || v.post_title.toLowerCase().includes(search.toLowerCase()) || v.employer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Usimamizi wa Nafasi za Kazi</h1>
          <p className="page-subtitle">Unda, hariri, na simamia nafasi za kazi</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showForm ? 'Funga' : 'Unda Nafasi Mpya'}
        </button>
      </div>

      {msg && (
        <div className="alert-success animate-fade-in" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>{msg}</span>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card p-6 animate-fade-up">
          <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Unda Nafasi Mpya</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Mwajiri *</label>
              <select value={form.employer_id} onChange={e => setForm(f => ({ ...f, employer_id: e.target.value }))} required className="select">
                <option value="">Chagua mwajiri...</option>
                {employers.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Jina la Nafasi *</label>
              <input type="text" required value={form.post_title} onChange={e => setForm(f => ({ ...f, post_title: e.target.value }))} className="input" placeholder="Mshauri Mwandishi" />
            </div>
            <div>
              <label className="label">Namba za Nafasi</label>
              <input type="number" value={form.num_posts} onChange={e => setForm(f => ({ ...f, num_posts: e.target.value }))} className="input" min="1" />
            </div>
            <div>
              <label className="label">Eneo (Unguja/Pemba/Zote)</label>
              <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input" placeholder="Unguja" />
            </div>
            <div>
              <label className="label">Kiwango cha Mshahara</label>
              <input type="text" value={form.salary_scale} onChange={e => setForm(f => ({ ...f, salary_scale: e.target.value }))} className="input" placeholder="TGCS A 2.1" />
            </div>
            <div>
              <label className="label">Mwisho wa Maombi *</label>
              <input type="date" required value={form.closing_date} onChange={e => setForm(f => ({ ...f, closing_date: e.target.value }))} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Sifa Zinazohitajika</label>
              <textarea value={form.qualifications} onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))} rows={3} className="textarea" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Majukumu na Wajibu</label>
              <textarea value={form.duties} onChange={e => setForm(f => ({ ...f, duties: e.target.value }))} rows={3} className="textarea" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Chapisha</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost-muted">Ghaira</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9BB2C9" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tafuta nafasi..."
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="select"
        >
          <option value="">Hali zote</option>
          <option value="draft">Rasimu</option>
          <option value="published">Imechapishwa</option>
          <option value="closed">Imefungwa</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted font-body">Inapakia...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-text-muted font-body">Hakuna nafasi za kazi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Jina la Nafasi</th>
                  <th>Mwajiri</th>
                  <th>Funga</th>
                  <th>Hali</th>
                  <th className="text-right">Vitendo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v: any) => (
                  <tr key={v.id}>
                    <td className="font-medium">{v.post_title}</td>
                    <td className="text-text-secondary">{v.employer_name}</td>
                    <td className="text-text-secondary">{v.closing_date ? new Date(v.closing_date).toLocaleDateString() : '—'}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {v.status === 'draft' && (
                          <button onClick={() => updateStatus(v.id, 'published')} className="text-xs text-success font-medium hover:underline font-body">Chapisha</button>
                        )}
                        {v.status === 'published' && (
                          <button onClick={() => updateStatus(v.id, 'closed')} className="text-xs text-warning font-medium hover:underline font-body">Funga</button>
                        )}
                        <Link to={`/admin/vacancies/${v.id}/applicants`} className="text-xs text-primary font-medium hover:underline font-body">Waombaji</Link>
                        <button onClick={() => deleteVacancy(v.id)} className="text-xs text-danger font-medium hover:underline font-body">Futa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}