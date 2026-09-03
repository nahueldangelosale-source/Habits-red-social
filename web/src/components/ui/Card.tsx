/**
 * Card Primitive — Design System
 * Glass-morphism card with sub-components: Header, Body, Footer.
 * 
 * Usage:
 *   <Card>
 *     <Card.Header title="Revenue" badge="Live" />
 *     <Card.Body>...</Card.Body>
 *     <Card.Footer>...</Card.Footer>
 *   </Card>
 */
import React from 'react';

interface CardProps {
    dark?: boolean;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

function CardRoot({ dark, className = '', children, onClick }: CardProps) {
    const base = dark ? 'card-glass-dark' : 'card-glass';
    return (
        <div
            className={`${base} p-5 flex flex-col ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: string;
    badge?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

function CardHeader({ title, badge, icon, action }: CardHeaderProps) {
    return (
        <div className="card-header">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-meta-label">{title}</span>
                {badge && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                        {badge}
                    </span>
                )}
            </div>
            {action}
        </div>
    );
}

function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`card-body ${className}`}>{children}</div>;
}

function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`card-footer ${className}`}>{children}</div>;
}

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-lg font-bold ${className}`}>{children}</h3>
)

export const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm opacity-50 ${className}`}>{children}</p>
)

export const Card = Object.assign(CardRoot, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
});
