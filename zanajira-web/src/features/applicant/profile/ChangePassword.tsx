import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../../lib/api';
import { useToast } from '../../../components/Toast';

const schema = z.object({
  old_password: z.string().min(8, 'Nywila ya sasa inahitajika'),
  new_password: z.string().min(8, 'Nywila mpya lazima iwe na herufi 8+'),
  confirm_password: z.string().min(1, 'Thibitisha nywila yako'),
}).refine(d => d.new_password === d.confirm_password, {
  message: 'Nywila hazilingani',
  path: ['confirm_password'],
});
type FormData = z.infer<typeof schema>;

export default function ChangePassword() {
  const toast = useToast();

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/change-password', {
        old_password: data.old_password,
        new_password: data.new_password,
      });
      toast.success('Nywila imebadilishwa kikamilifu.');
      reset();
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Imeshindwa kubadilisha nywila.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Badilisha Nywila</h1>
        <p className="page-subtitle">Sasisha nywila yako ya akaunti</p>
      </div>

      <div className="card p-6 max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label label-required">Nywila ya Sasa</label>
            <input type="password" {...register('old_password')} className="input" />
            {errors.old_password && <p className="text-xs text-danger mt-1">{errors.old_password.message}</p>}
          </div>
          <div>
            <label className="label label-required">Nywila Mpya</label>
            <input type="password" {...register('new_password')} className="input" />
            {errors.new_password && <p className="text-xs text-danger mt-1">{errors.new_password.message}</p>}
          </div>
          <div>
            <label className="label label-required">Thibitisha Nywila</label>
            <input type="password" {...register('confirm_password')} className="input" />
            {errors.confirm_password && <p className="text-xs text-danger mt-1">{errors.confirm_password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Inahifadhi...' : 'Badilisha Nywila'}
          </button>
        </form>
      </div>
    </div>
  );
}