import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RotateCw } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  percentage: number;
  color: string;
}

export default function Wheel() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Données mockées des lots
  const prizes: Prize[] = [
    { id: '1', name: 'Café offert', percentage: 30, color: '#8B5CF6' },
    { id: '2', name: 'Dessert offert', percentage: 25, color: '#EC4899' },
    { id: '3', name: '-10% commande', percentage: 25, color: '#F59E0B' },
    { id: 'lose', name: 'Perdu', percentage: 20, color: '#6B7280' },
  ];

  const totalPercentage = prizes.reduce((sum, p) => sum + p.percentage, 0);
  const anglePerPercent = 360 / totalPercentage;

  useEffect(() => {
    drawWheel();
  }, [rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    let currentAngle = -Math.PI / 2; // Start from top

    prizes.forEach((prize) => {
      const segmentAngle = (prize.percentage / totalPercentage) * 2 * Math.PI;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      const textAngle = currentAngle + segmentAngle / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(prize.name, 0, 0);
      ctx.restore();

      currentAngle += segmentAngle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);

    // Calculer le résultat (mock)
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize: Prize | null = null;

    for (const prize of prizes) {
      cumulative += prize.percentage;
      if (random < cumulative) {
        selectedPrize = prize;
        break;
      }
    }

    // Animation de rotation
    const spins = 5; // Nombre de tours complets
    const targetRotation = rotation + spins * 360 + (selectedPrize ? getPrizeAngle(selectedPrize) : 0);
    
    const startRotation = rotation;
    const duration = 3000; // 3 secondes
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Naviguer vers le résultat après l'animation
        setTimeout(() => {
          navigate(`/r/${slug}/result`, {
            state: { prize: selectedPrize, isWin: selectedPrize?.id !== 'lose' },
          });
        }, 500);
      }
    };

    animate();
  };

  const getPrizeAngle = (prize: Prize): number => {
    let currentAngle = 0;
    for (const p of prizes) {
      if (p.id === prize.id) {
        return currentAngle + (p.percentage / totalPercentage) * 360 / 2;
      }
      currentAngle += (p.percentage / totalPercentage) * 360;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Roue de la Fortune
        </h2>
        <p className="text-gray-600 mb-8">
          Lance la roue et découvre ton lot !
        </p>

        {/* Roue */}
        <div className="relative mb-8 flex justify-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="transform transition-transform duration-100"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          />
          {/* Pointeur fixe */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500"></div>
          </div>
        </div>

        {/* Bouton Lancer */}
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? (
            <>
              <RotateCw className="w-5 h-5 animate-spin" />
              La roue tourne...
            </>
          ) : (
            <>
              <RotateCw className="w-5 h-5" />
              Lancer la roue
            </>
          )}
        </button>

        {/* Légende des lots */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {prizes.map((prize) => (
            <div key={prize.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: prize.color }}
              />
              <span className="text-sm text-gray-700">{prize.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
