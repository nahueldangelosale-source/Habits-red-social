import React from 'react';

interface FlowerOfLifeLogoProps {
    className?: string;
    size?: number;
    showMonogram?: boolean;
}

export const FlowerOfLifeLogo: React.FC<FlowerOfLifeLogoProps> = ({
    className = 'w-24 h-24',
    size = 120,
    showMonogram = true,
}) => {
    // Radius of inner circles in SVG coordinate space (viewBox 0 0 200 200)
    const R = 32;
    const CX = 100;
    const CY = 100;

    // Ring 1 (6 circles at distance R)
    const ring1 = [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return {
            cx: CX + R * Math.cos(rad),
            cy: CY + R * Math.sin(rad),
        };
    });

    // Ring 2 (12 circles: 6 at 2R at primary angles, 6 at sqrt(3)*R at 30 deg offsets)
    const ring2 = [
        ...[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return {
                cx: CX + 2 * R * Math.cos(rad),
                cy: CY + 2 * R * Math.sin(rad),
            };
        }),
        ...[30, 90, 150, 210, 270, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return {
                cx: CX + Math.sqrt(3) * R * Math.cos(rad),
                cy: CY + Math.sqrt(3) * R * Math.sin(rad),
            };
        }),
    ];

    return (
        <svg
            viewBox="0 0 200 200"
            width={size}
            height={size}
            className={`transition-all duration-300 ${className}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Modern chromatic palette gradients */}
                <linearGradient id="fol-grad-1" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#818CF8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#F472B6" stopOpacity="0.8" />
                </linearGradient>

                <linearGradient id="fol-grad-stroke" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0EA5E9" />
                    <stop offset="35%" stopColor="#6366F1" />
                    <stop offset="70%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>

                <linearGradient id="fol-grad-fill" x1="50" y1="50" x2="150" y2="150" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#EEF2FF" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#FCE7F3" stopOpacity="0.45" />
                </linearGradient>

                <linearGradient id="fol-monogram-grad" x1="85" y1="85" x2="115" y2="115" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0F172A" />
                    <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                <clipPath id="fol-outer-clip">
                    <circle cx={CX} cy={CY} r={2.05 * R} />
                </clipPath>
            </defs>

            {/* Subtle background container plate */}
            <circle
                cx={CX}
                cy={CY}
                r={2.2 * R}
                fill="url(#fol-grad-fill)"
                className="dark:opacity-20"
            />

            {/* Pattern Cliped inside Boundary */}
            <g clipPath="url(#fol-outer-clip)">
                {/* Center Circle */}
                <circle
                    cx={CX}
                    cy={CY}
                    r={R}
                    stroke="url(#fol-grad-stroke)"
                    strokeWidth="1.5"
                    fill="none"
                />

                {/* Ring 1 - 6 circles */}
                {ring1.map((c, i) => (
                    <circle
                        key={`r1-${i}`}
                        cx={c.cx}
                        cy={c.cy}
                        r={R}
                        stroke="url(#fol-grad-stroke)"
                        strokeWidth="1.2"
                        strokeOpacity="0.85"
                        fill="none"
                    />
                ))}

                {/* Ring 2 - 12 circles */}
                {ring2.map((c, i) => (
                    <circle
                        key={`r2-${i}`}
                        cx={c.cx}
                        cy={c.cy}
                        r={R}
                        stroke="url(#fol-grad-stroke)"
                        strokeWidth="1.0"
                        strokeOpacity="0.65"
                        fill="none"
                    />
                ))}
            </g>

            {/* Inner Sacred Perimeter Ring */}
            <circle
                cx={CX}
                cy={CY}
                r={2.05 * R}
                stroke="url(#fol-grad-stroke)"
                strokeWidth="1.5"
                strokeOpacity="0.9"
            />

            {/* Outer Sacred Perimeter Ring */}
            <circle
                cx={CX}
                cy={CY}
                r={2.18 * R}
                stroke="url(#fol-grad-stroke)"
                strokeWidth="1.0"
                strokeOpacity="0.5"
                strokeDasharray="2 3"
            />

            {/* Central Monogram Plate & Letter 'H' */}
            {showMonogram && (
                <g>
                    <circle
                        cx={CX}
                        cy={CY}
                        r="18"
                        fill="#FFFFFF"
                        className="dark:fill-zinc-900"
                        stroke="url(#fol-grad-stroke)"
                        strokeWidth="1.2"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                    />
                    <text
                        x={CX}
                        y={CY + 6.5}
                        textAnchor="middle"
                        fontFamily="Montserrat, sans-serif"
                        fontWeight="900"
                        fontSize="18"
                        fill="url(#fol-grad-stroke)"
                    >
                        H
                    </text>
                </g>
            )}
        </svg>
    );
};

export default FlowerOfLifeLogo;
