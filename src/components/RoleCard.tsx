import { useLanguage } from '@/i18n/LanguageContext';
import type { RoleDef } from '@/data/roles';
import { useLanguage as useLang } from '@/i18n/LanguageContext';

interface RoleCardProps {
  role: RoleDef;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RoleCard({ role, title, description, size = 'md', className = '' }: RoleCardProps) {
  const { tRole, tRoleDesc } = useLang();
  const Icon = role.icon;

  const displayTitle = title || tRole(role.key);
  const displayDesc = description || tRoleDesc(role.key);

  const sizes = {
    sm: { card: 'w-20 h-28', icon: 'w-7 h-7', title: 'text-[10px]', desc: 'text-[8px]' },
    md: { card: 'w-32 h-44', icon: 'w-10 h-10', title: 'text-xs', desc: 'text-[9px]' },
    lg: { card: 'w-48 h-72', icon: 'w-16 h-16', title: 'text-sm', desc: 'text-[10px]' },
  };
  const s = sizes[size];

  return (
    <div
      className={`${s.card} relative rounded-xl overflow-hidden bg-gradient-to-br ${role.gradient} ${role.glow} border border-mystery-500/30 ${className}`}
    >
      <div className="bg-card-grain absolute inset-0" />
      <div className="relative h-full flex flex-col items-center justify-between p-3 no-select">
        <div className={`mt-2 ${s.icon} ${role.accent}`}>
          <Icon className="w-full h-full" strokeWidth={1.5} />
        </div>
        <div className="text-center px-1">
          <p className={`${s.title} font-display font-semibold text-ash-100 leading-tight`}>
            {displayTitle}
          </p>
          <p className={`${s.desc} text-ash-300 leading-snug mt-1 line-clamp-3`}>
            {displayDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
