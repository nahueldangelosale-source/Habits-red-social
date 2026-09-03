import { useEffect, useRef } from 'react';

interface RevenueChartProps {
    data: number[];
    mode: string;
}

export function RevenueChart({ data, mode }: RevenueChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isClinical = mode === 'CLINICAL';

    // Theme Colors
    const primaryColor = isClinical ? '#10B981' : 'var(--color-action-primary)'; // Emerald vs Lime Check OKLCH 
    const gradientStart = isClinical ? 'rgba(16, 185, 129, 0.2)' : 'rgba(206, 255, 0, 0.2)';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 24;

        ctx.clearRect(0, 0, width, height);

        const min = Math.min(...data) * 0.9;
        const max = Math.max(...data) * 1.1;
        const range = max - min;

        const getX = (i: number) => padding + (i / (data.length - 1)) * (width - padding * 2);
        const getY = (v: number) => height - padding - ((v - min) / range) * (height - padding * 2);

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, gradientStart);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(getX(0), height - padding);
        data.forEach((val, i) => ctx.lineTo(getX(i), getY(val)));
        ctx.lineTo(getX(data.length - 1), height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        
        ctx.strokeStyle = isClinical ? '#10B981' : '#6366f1'; // Temporary manual resolve as Canvas strokeStyle doesn't support CSS vars directly in all envs without computed
        ctx.lineWidth = 3;
        data.forEach((val, i) => {
            if (i === 0) ctx.moveTo(getX(i), getY(val));
            else ctx.lineTo(getX(i), getY(val));
        });
        ctx.stroke();

        // End dot
        const lastX = getX(data.length - 1);
        const lastY = getY(data[data.length - 1]);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
        ctx.fillStyle = isClinical ? '#10B981' : '#6366f1';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

    }, [data, mode, primaryColor, gradientStart, isClinical]);

    return <canvas ref={canvasRef} width={400} height={160} style={{ width: '100%', height: '100%' }} aria-label="Gráfica de Ingresos" />;
}
