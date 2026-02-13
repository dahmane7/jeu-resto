import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { RotateCw, Dices } from 'lucide-react';
import { publicFetch } from '../../api/client';

const WHEEL_COLORS = ['#FBBF24', '#6B7280', '#EF4444', '#22D3EE', '#A78BFA', '#F472B6'];
const GOLD = '#EAB308';
const GOLD_LIGHT = '#FDE047';

interface Prize {
  id: string;
  name: string;
  percentage: number;
  message?: string;
  color: string;
}

type FormData = {
  phone: string;
  email: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  age_range?: string;
  gdpr_consent?: boolean;
};

export default function Wheel() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [wheelActive, setWheelActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinError, setSpinError] = useState<string | null>(null);

  const formData = location.state?.formData as FormData | undefined;

  useEffect(() => {
    if (!slug) return;
    publicFetch<{ wheel_active: boolean; prizes: { id: string; name: string; percentage: number; message: string }[] }>(
      `/api/public/r/${slug}`
    )
      .then((data) => {
        setWheelActive(data.wheel_active);
        setPrizes(
          (data.prizes || []).map((p, i) => ({
            ...p,
            color: WHEEL_COLORS[i % WHEEL_COLORS.length],
          }))
        );
      })
      .catch(() => setPrizes([]))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!loading && !formData) {
      navigate(`/r/${slug}/form`, { replace: true });
    }
  }, [loading, formData, navigate, slug]);

  useEffect(() => {
    if (prizes.length === 0) return;
    drawWheel();
  }, [rotation, prizes]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const totalPercentage = prizes.reduce((sum, p) => sum + p.percentage, 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 32;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let currentAngle = -Math.PI / 2;
    prizes.forEach((prize) => {
      const segmentAngle = (prize.percentage / totalPercentage) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      const textAngle = currentAngle + segmentAngle / 2;
      const textRadius = radius * 0.68;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;
      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 2;
      ctx.fillText(prize.name, 0, 0);
      ctx.restore();
      currentAngle += segmentAngle;
    });
    const outerRadius = radius + 14;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = GOLD_LIGHT;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 26, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', centerX, centerY);
  };

  const getPrizeAngleForPointer = (prize: Prize): number => {
    const totalPercentage = prizes.reduce((sum, p) => sum + p.percentage, 0);
    let currentAngleRad = -Math.PI / 2;
    for (const p of prizes) {
      const segmentAngleRad = (p.percentage / totalPercentage) * 2 * Math.PI;
      const segmentCenterRad = currentAngleRad + segmentAngleRad / 2;
      if (p.id === prize.id) {
        const centerAngleDeg = (segmentCenterRad * 180) / Math.PI;
        return ((centerAngleDeg + 90) % 360 + 360) % 360;
      }
      currentAngleRad += segmentAngleRad;
    }
    return 0;
  };

  const spinWheel = async () => {
    if (isSpinning || !slug || !formData) return;
    setSpinError(null);
    setIsSpinning(true);
    try {
      const result = await publicFetch<{
        prize: { id: string; name: string; message: string } | null;
        participation: { id: string; claim_code: string | null; expires_at: string };
        isWin: boolean;
      }>(`/api/public/r/${slug}/participate`, {
        method: 'POST',
        body: JSON.stringify({
          phone: formData.phone,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          city: formData.city,
          age_range: formData.age_range,
          gdpr_consent: formData.gdpr_consent,
        }),
      });

      const selectedPrize = result.prize
        ? prizes.find((p) => p.id === result.prize!.id) ?? prizes[0]
        : prizes.find((p) => p.name.toLowerCase().includes('perdu')) ?? prizes[prizes.length - 1];
      const prizeCenterAngle = getPrizeAngleForPointer(selectedPrize);
      const currentCenterPosition = (rotation + prizeCenterAngle) % 360;
      const angleToAlign = (360 - currentCenterPosition) % 360;
      const spins = 5;
      const targetRotation = rotation + spins * 360 + angleToAlign;
      const startRotation = rotation;
      const duration = 3000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
        setRotation(currentRotation);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          setTimeout(() => {
            navigate(`/r/${slug}/result`, {
              state: {
                prize: result.prize ? { id: result.prize.id, name: result.prize.name, message: result.prize.message } : null,
                isWin: result.isWin,
                participation: result.participation,
              },
            });
          }, 500);
        }
      };
      animate();
    } catch (err) {
      setSpinError(err instanceof Error ? err.message : 'Erreur lors du tirage');
      setIsSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-900 flex items-center justify-center p-4">
        <p className="text-white/90">Chargement de la roue...</p>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  if (!wheelActive || prizes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p className="mb-4">
            {!wheelActive ? 'La roue est actuellement désactivée.' : 'Aucun lot configuré.'}
          </p>
          <button
            onClick={() => navigate(`/r/${slug}`)}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-900 rounded-xl font-semibold shadow-lg"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 flex flex-col items-center justify-center p-4 pt-8 pb-12">
      {spinError && (
        <div className="mb-4 w-full max-w-sm p-3 bg-red-500/20 border border-red-400/50 text-red-100 rounded-xl text-sm text-center">
          {spinError}
        </div>
      )}
      <div className="relative mb-6 flex justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="transform transition-transform duration-100 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center">
          <div
            className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            style={{ filter: 'drop-shadow(0 0 6px rgba(234,179,8,0.8))' }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-0.5 shadow-md ring-2 ring-amber-200/80" />
        </div>
      </div>
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="w-full max-w-sm px-6 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-400 hover:via-red-400 hover:to-orange-500 text-white rounded-2xl font-bold uppercase tracking-wide flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed border-0"
      >
        {isSpinning ? (
          <>
            <RotateCw className="w-6 h-6 animate-spin flex-shrink-0" />
            <span>La roue tourne...</span>
          </>
        ) : (
          <>
            <Dices className="w-6 h-6 flex-shrink-0" />
            <span>Lancer la roue</span>
          </>
        )}
      </button>
      <p className="mt-4 text-white/95 text-sm">
        Tentez votre chance et gagnez des récompenses ! 🍀
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-sm">
        {prizes.map((prize) => (
          <span
            key={prize.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white/90 bg-white/10"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: prize.color }} />
            {prize.name}
          </span>
        ))}
      </div>
    </div>
  );
}
