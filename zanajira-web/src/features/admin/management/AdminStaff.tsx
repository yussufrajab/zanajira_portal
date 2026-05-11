import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../../lib/api';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';

const schema = z.object({
  email: z.string().email('Barua pepe halali inahitajika'),
  password: z.string().min(8, 'Nywila lazima iwe na herufi 8+'),
  role: z.string().min(1, 'Jukumu linahitajika'),
});
type FormData = z.infer<typeof schema>;

export default function AdminStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', role: 'staff' },
  });

  const load = () => {
    setLoading(true);
    api.get('/admin/staff')
      .then(r => setStaff(r.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data: FormData) => {
    setSaving(true);
    setErrorMsg('');
    try {
      await api.post('/admin/staff', data);
      setShowForm(false);
      reset();
      load();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error ?? 'Imeshindwa kuunda.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Usimamizi wa Wafanyakazi</h1>
          <p className="page-subtitle">Unda na dhibiti akaunti za wafanyakazi</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
          {showForm ? 'Ghairi' : '+ Ongeza Mfanyakazi'}
        </button>
      </div>

      {errorMsg && <div className="alert-danger">{errorMsg}</div>}

      {showForm && (
        <div className="card p-6">
          <h2 className="section-heading mb-4">Ongeza Mfanyakazi Mpya</h2>
          <form onSubmit={handleSubmit(handleCreate)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label label-required">Barua Pepe</label>
              <input type="email" {...register('email')} className="input" />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label label-required">Nywila</label>
              <input type="password" {...register('password')} className="input" />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label label-required">Jukumu</label>
              <select {...register('role')} className="select">
                <option value="staff">Mfanyakazi</option>
                <option value="admin">Msimamizi</option>
                <option value="employer">Mwajiri</option>
              </select>
              {errors.role && <p className="text-xs text-danger mt-1">{errors.role.message}</p>}
            </div>
            <div>
              <button type="submit" disabled={saving} className="btn-primary btn-sm">
                {saving ? 'Inahifadhi...' : 'Unda'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Barua Pepe</th><th>Jukumu</th><th>Hali</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonCard variant="table-row" count={5} />
            </tbody>
          </table>
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          illustration="no-data"
          title="Hakuna wafanyakazi"
          description="Wafanyakazi wataonekana hapa wakati waundwa."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Barua Pepe</th>
                <th>Jukumu</th>
                <th>Hali</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s: any) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.email}</td>
                  <td className="text-text-secondary">{s.role}</td>
                  <td>
                    {s.is_active
                      ? <span className="badge-green">Amo</span>
                      : <span className="badge-red">Hajamo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}