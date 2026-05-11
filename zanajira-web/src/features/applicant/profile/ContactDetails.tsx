import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import SkeletonCard from '../../../components/SkeletonCard';

const schema = z.object({
  phone: z.string().min(10, 'Nambari ya simu inahitajika'),
  email: z.string().email('Barua pepe halali inahitajika'),
  postal_address: z.string().optional(),
  physical_address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function ContactDetails() {
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get('/applicants/me/contact')
      .then(r => {
        if (r.data) reset(r.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await api.put('/applicants/me/contact', data);
      toast.success('Mawasiliano yamehifadhiwa kikamilifu.');
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Imeshindwa kuhifadhi.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Mawasiliano</h1>
        </div>
        <SkeletonCard variant="profile-section" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Mawasiliano</h1>
        <p className="page-subtitle">Sasisha taarifa zako za mawasiliano</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label label-required">Nambari ya Simu</label>
              <input {...register('phone')} className="input" placeholder="+255 777 123 456" />
              {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="label label-required">Barua Pepe</label>
              <input {...register('email')} type="email" className="input" placeholder="mfano@gmail.com" />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Anwani ya Barua</label>
            <input {...register('postal_address')} className="input" placeholder="Sanduku la Posta 123" />
          </div>

          <div>
            <label className="label">Anwani ya Kimwili</label>
            <input {...register('physical_address')} className="input" placeholder="Mtaa, Jengo, Namba" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Jiji / Mji</label>
              <input {...register('city')} className="input" placeholder="Mji Mkongwe" />
            </div>
            <div>
              <label className="label">Nchi</label>
              <select {...register('country')} className="select">
                <option value="">Chagua...</option>
                <option value="TZ">Tanzania</option>
                <option value="KE">Kenya</option>
                <option value="UG">Uganda</option>
                <option value="RW">Rwanda</option>
                <option value="BI">Burundi</option>
                <option value="ET">Ethiopia</option>
                <option value="SO">Somalia</option>
                <option value="MZ">Mozambique</option>
                <option value="Other">Nchi Nyingine</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Inahifadhi...' : 'Hifadhi Mawasiliano'}
          </button>
        </form>
      </div>
    </div>
  );
}