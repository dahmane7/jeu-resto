import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Lock } from 'lucide-react';

const formSchema = z.object({
  phone: z.string()
    .min(10, 'Le téléphone doit contenir au moins 10 caractères')
    .regex(/^[0-9+\s()-]+$/, 'Format de téléphone invalide'),
  email: z.string()
    .email('Email invalide'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  city: z.string().optional(),
  age_range: z.string().optional(),
  gdpr_consent: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Form() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Naviguer vers la roue
    navigate(`/r/${slug}/wheel`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Informations
          </h2>
          <p className="text-gray-600">
            Remplis le formulaire pour jouer à la roue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tranche d'âge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tranche d'âge
            </label>
            <select
              {...register('age_range')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('gdpr_consent')}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm text-gray-700">
                J'accepte que mes données soient utilisées pour me contacter et recevoir des offres du restaurant.{' '}
                <span className="text-red-500">*</span>
                <br />
                <a href="/privacy" className="text-indigo-600 hover:text-indigo-800 underline">
                  Politique de confidentialité
                </a>
              </label>
            </div>
            {errors.gdpr_consent && (
              <p className="mt-2 text-sm text-red-600">{errors.gdpr_consent.message}</p>
            )}
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Chargement...'
            ) : (
              <>
                Lancer la roue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
