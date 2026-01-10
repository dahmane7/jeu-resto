import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const formSchema = z.object({
  phone: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères'),
  email: z.string().email('Email invalide'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  city: z.string().optional(),
  age_range: z.string().optional(),
  gdpr_consent: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter la politique de confidentialité',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Form() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gdpr_consent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // En production, envoyer les données à l'API
      // await api.post(`/api/r/${slug}/participate`, data);
      
      // Pour l'instant, naviguer directement vers la roue
      navigate(`/r/${slug}/wheel`, { state: { formData: data } });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulaire</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Remplis ce formulaire pour jouer à la roue de la fortune !
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="0612345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="exemple@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom
            </label>
            <input
              type="text"
              {...register('first_name')}
              placeholder="Jean"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              {...register('last_name')}
              placeholder="Dupont"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <input
              type="text"
              {...register('city')}
              placeholder="Paris"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Tranche d'âge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tranche d'âge
            </label>
            <select
              {...register('age_range')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Sélectionner</option>
              <option value="-18">-18</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45+">45+</option>
            </select>
          </div>

          {/* Consentement RGPD */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              {...register('gdpr_consent')}
              id="gdpr_consent"
              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="gdpr_consent" className="text-sm text-gray-700">
              J'accepte la{' '}
              <a href="#" className="text-indigo-600 hover:underline">
                politique de confidentialité
              </a>{' '}
              <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.gdpr_consent && (
            <p className="text-sm text-red-600">{errors.gdpr_consent.message}</p>
          )}

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              'Envoi en cours...'
            ) : (
              <>
                Continuer
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
