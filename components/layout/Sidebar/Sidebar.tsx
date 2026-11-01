import { ChevronLeftIcon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { NavItem } from '../../navigation/NavItem';
import { useThemeContext } from '@/context/ThemeContext';
import { STATIC_NAV_ITEMS } from '@/data/navigation.data';

/** Derive initials from a full name, e.g. "Muhammad Taqi" → "MT" */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md';
}

function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${dim} rounded-full object-cover ring-2 ring-primary/30 shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-primary flex items-center justify-center text-white font-bold tracking-wide ring-2 ring-primary/30 shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}

interface SidebarProps {
  selectedNav: string;
  onNavChange: (name: string) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  /** Dynamic badge counts keyed by nav item name */
  navCounts?: Record<string, number>;
  onLogout: () => void;
}

export function Sidebar({
  selectedNav,
  onNavChange,
  isExpanded,
  onExpandedChange,
  isMobileOpen,
  onMobileClose,
  navCounts = {},
  onLogout,
}: SidebarProps) {
  const { theme } = useThemeContext();

  const showExpanded = isExpanded || isMobileOpen;

  const handleNavClick = (name: string) => {
    onNavChange(name);
    onMobileClose();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 md:static ${theme.bgPanel} border-r ${theme.border} flex flex-col justify-between shrink-0 h-full transition-all duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
      } ${isExpanded ? 'md:w-64' : 'md:w-16'}`}
    >
      <div>
        {/* Logo Header */}
        <div className={`h-16 px-3 border-b ${theme.border} flex items-center justify-between`}>
          {showExpanded ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="TeraFlow Logo" className="w-9 h-9 object-contain" />
              </div>
              <div className="truncate">
                <span className={`font-bold text-lg ${theme.textMain} tracking-tight leading-none block`}>
                  TeraFlow<span className="text-primary font-bold">.</span>
                </span>
                <span className={`text-[11px] ${theme.textSubtle} font-medium tracking-wide uppercase`}>
                  TeraOnic
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onExpandedChange(true)}
              title="Expand navbar"
              className="hidden md:flex mx-auto p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
            >
              <img
                src="/logo.png"
                alt="TeraFlow Logo"
                className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
              />
            </button>
          )}

          {/* Desktop collapse toggle */}
          {isExpanded && (
            <button
              onClick={() => onExpandedChange(false)}
              title="Collapse navbar"
              className={`hidden md:flex p-1.5 ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg} rounded-lg transition-colors shrink-0`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          )}

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className={`md:hidden p-1.5 ${theme.textMuted} hover:${theme.textMain}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-2 space-y-1">
          {STATIC_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              count={navCounts[item.name]}
              isActive={selectedNav === item.name}
              isExpanded={showExpanded}
              onClick={() => handleNavClick(item.name)}
            />
          ))}
        </nav>
      </div>

      {/* User Card */}
      <div className={`p-3 border-t ${theme.border}`}>
        {showExpanded ? (
          <div className={`${theme.bgSubtle} rounded-xl p-2.5 border ${theme.border} flex items-center gap-2.5`}>
            {/* Avatar — left of name */}
            <Avatar name="Muhammad Taqi" size="md" />

            <div className="overflow-hidden flex-1 min-w-0">
              <p className={`text-sm font-semibold ${theme.textMain} truncate leading-tight`}>
                Muhammad Taqi
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                ADMIN
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log out"
              className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Log out"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Collapsed — show just the avatar circle, clicking logs out */
          <div className="flex flex-col items-center py-1 gap-1">
            <button
              onClick={onLogout}
              title="Log out (Muhammad Taqi – ADMIN)"
              className="p-0.5 rounded-full transition-all hover:ring-2 hover:ring-rose-400/50 cursor-pointer"
              aria-label="Log out"
            >
              <Avatar name="Muhammad Taqi" size="sm" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
