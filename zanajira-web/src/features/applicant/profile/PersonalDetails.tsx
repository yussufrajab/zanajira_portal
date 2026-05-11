import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../../lib/api';
import ZanIDInput from '../../../components/ZanIDInput';
import FileUploadInput from '../../../components/FileUploadInput';
import { useToast } from '../../../components/Toast';

const schema = z.object({
  originality: z.string().optional(),
  govt_employment_status: z.string().optional(),
  marital_status: z.string().optional(),
  impairment: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface ZanIDProfile {
  zanid: string;
  first_name: string;
  last_name: string;
  sex: string;
  date_of_birth: string;
  nationality: string;
}

export default function PersonalDetails() {
  const [zanidData, setZanidData] = useState<ZanIDProfile | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingZanid, setExistingZanid] = useState('');
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const toast = useToast();

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get('/applicants/me').then(r => {
      if (r.data.zanid?.String) setExistingZanid(r.data.zanid.String);
      if (r.data.originality) setValue('originality', r.data.originality);
      if (r.data.govt_employment_status) setValue('govt_employment_status', r.data.govt_employment_status);
      if (r.data.marital_status) setValue('marital_status', r.data.marital_status);
      if (r.data.impairment) setValue('impairment', r.data.impairment);
      if (r.data.photo_url) setExistingPhoto(r.data.photo_url);
    }).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = { ...data, ...(zanidData ? { zanid: zanidData.zanid } : {}) };
      await api.put('/applicants/me/personal', payload);
      if (photo) {
        const fd = new FormData();
        fd.append('photo', photo);
        await api.post('/applicants/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success('Taarifa za kibinafsi zimehifadhiwa.');
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Imeshindwa kuhifadhi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Taarifa za Kibinafsi</h1>
        <p className="page-subtitle">Sasisha taarifa zako za kibinafsi</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ZanID */}
          <ZanIDInput
            onFetch={setZanidData}
            defaultValue={existingZanid}
          />

          {/* Auto-populated fields */}
          {zanidData && (
            <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20">
              <div className="grid grid-cols-2 gap-3 text-sm font-body">
                <div><span className="font-medium text-text-primary">Jina la Kwanza:</span> <span className="text-text-secondary">{zanidData.first_name}</span></div>
                <div><span className="font-medium text-text-primary">Jina la Mwisho:</span> <span className="text-text-secondary">{zanidData.last_name}</span></div>
                <div><span className="font-medium text-text-primary">Jinsi:</span> <span className="text-text-secondary">{zanidData.sex}</span></div>
                <div><span className="font-medium text-text-primary">Tarehe ya Kuzaliwa:</span> <span className="text-text-secondary">{zanidData.date_of_birth}</span></div>
                <div><span className="font-medium text-text-primary">Uraia:</span> <span className="text-text-secondary">{zanidData.nationality}</span></div>
              </div>
            </div>
          )}

          <div className="divider" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Asili</label>
              <select {...register('originality')} className="select">
                <option value="">Chagua...</option>
                <option>Mzanzibari</option>
                <option>Mtanzania Bara</option>
                <option>Mwingine</option>
              </select>
            </div>
            <div>
              <label className="label">Hali ya Uajiri wa Serikali</label>
              <select {...register('govt_employment_status')} className="select">
                <option value="">Chagua...</option>
                <option>Hajaajiriwa</option>
                <option>Ameajiriwa Sasa</option>
                <option>Aliwahi Kuaajiriwa</option>
              </select>
            </div>
            <div>
              <label className="label">Hali ya Ndoa</label>
              <select {...register('marital_status')} className="select">
                <option value="">Chagua...</option>
                <option>Hajaolewa</option>
                <option>Ameolewa</option>
                <option>Amefariki</option>
                <option>Ametalikiwa</option>
              </select>
            </div>
            <div>
              <label className="label">Ulemavu (kamaipo)</label>
              <input {...register('impairment')} className="input" placeholder="Kama vile: Kuona, Kusikia, Hakuna" />
            </div>
          </div>

          {/* Photo upload */}
          <FileUploadInput
            label="Picha ya Pasipoti"
            accept="image/*"
            maxSizeMB={2}
            onChange={setPhoto}
            existingFileName={existingPhoto ?? undefined}
          />

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Inahifadhi...' : 'Hifadhi Taarifa za Kibinafsi'}
          </button>
        </form>
      </div>
    </div>
  );
}