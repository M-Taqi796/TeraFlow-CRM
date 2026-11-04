import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeftIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { NavItem } from '../../navigation/NavItem';
import { useThemeContext } from '@/context/ThemeContext';
import { STATIC_NAV_ITEMS } from '@/data/navigation.data';
import { CURRENT_USER, useCRM } from '@/context/CRMContext';

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
  selectedNav?: string;
  onNavChange?: (name: string) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  /** Unread state keyed by nav item name */
  unreadNav?: Record<string, boolean>;
  /** Dynamic badge counts keyed by nav item name (deprecated) */
  navCounts?: Record<string, number>;
  onLogout: () => void;
  disableTransition?: boolean;
}

export function Sidebar({
  selectedNav,
  onNavChange,
  isExpanded,
  onExpandedChange,
  isMobileOpen,
  onMobileClose,
  unreadNav: propUnreadNav,
  navCounts = {},
  onLogout,
  disableTransition = false,
}: SidebarProps) {
  const { theme, isDarkMode } = useThemeContext();
  const crm = useCRM();
  const unreadNav = propUnreadNav ?? crm.unreadNav;
  const pathname = usePathname();

  const showExpanded = isExpanded || isMobileOpen;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (name: string) => {
    crm.markNavAsRead(name);
    onNavChange?.(name);
    onMobileClose();
  };

  // User info from CRMContext (dynamic) with fallback to central constant
  const userName = crm.currentUser?.name ?? CURRENT_USER.name;
  const userRole = crm.currentUser?.role ?? CURRENT_USER.role;
  const imageUrl = crm.currentUser?.avatarUrl ?? CURRENT_USER.imageUrl;

  return (
    <aside
      suppressHydrationWarning
      className={`fixed inset-y-0 left-0 z-50 md:static ${theme.bgPanel} border-r ${theme.border} flex flex-col justify-between shrink-0 h-full ${
        disableTransition ? '' : 'transition-all duration-300 ease-in-out'
      } ${
        isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
      } ${isExpanded ? 'md:w-64' : 'md:w-16'}`}
    >
      <div>
        {/* Logo Header */}
        <div suppressHydrationWarning className={`h-16 px-3 border-b ${theme.border} flex items-center justify-between`}>
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
              title="Expand sidebar"
              className="hidden md:flex mx-auto p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] transition-all group"
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
              title="Collapse sidebar"
              className={`hidden md:flex p-1.5 ${theme.textMuted} hover:${theme.textMain} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] rounded-lg transition-colors shrink-0`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          )}

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className={`md:hidden p-1.5 ${theme.textMuted}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-2 space-y-0.5 mt-1">
          {STATIC_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href)) ||
              selectedNav === item.name;

            return (
              <NavItem
                key={item.name}
                name={item.name}
                href={item.href}
                icon={item.icon}
                hasUnread={Boolean(unreadNav[item.name]) && !isActive}
                isActive={isActive}
                isExpanded={showExpanded}
                onClick={() => handleNavClick(item.name)}
              />
            );
          })}
        </nav>
      </div>

      {/* User Card */}
      <div suppressHydrationWarning className={`p-3 border-t ${theme.border}`} ref={userMenuRef}>
        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <div
            className={`absolute ${
              showExpanded ? 'bottom-[72px] left-3 right-3' : 'bottom-2 left-16 ml-2 w-44'
            } bg-white dark:bg-[#202026] border ${theme.border} rounded-xl shadow-xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100`}
          >
            <Link
              href="/profile"
              onClick={() => { setUserMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs ${theme.textMuted} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] hover:text-[#1E293B] dark:hover:text-[#F3F4F6] transition-colors`}
            >
              <UserCircleIcon className="w-4 h-4 shrink-0" />
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => { setUserMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs ${theme.textMuted} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] hover:text-[#1E293B] dark:hover:text-[#F3F4F6] transition-colors`}
            >
              <Cog6ToothIcon className="w-4 h-4 shrink-0" />
              Settings
            </Link>
            <div className={`border-t ${theme.border} mt-1 pt-1`}>
              <button
                onClick={() => { setUserMenuOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0" />
                Log out
              </button>
            </div>
          </div>
        )}

        {showExpanded ? (
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className={`w-full bg-[#F1F5F9] dark:bg-[#202026] rounded-xl p-2.5 border ${theme.border} flex items-center gap-2.5 hover:border-primary/30 transition-colors group`}
          >
            <Avatar name={userName} imageUrl={imageUrl} size="md" />

            <div className="overflow-hidden flex-1 min-w-0 text-left">
              <p className={`text-sm font-semibold ${theme.textMain} truncate leading-tight`}>
                {userName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {userRole}
              </div>
            </div>

            <ChevronUpIcon
              className={`w-3.5 h-3.5 shrink-0 ${theme.textMuted} transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>
        ) : (
          /* Collapsed — clicking avatar opens the user menu */
          <div className="flex flex-col items-center py-1">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              title={`${userName} — ${userRole}`}
              className={`p-0.5 rounded-full transition-all ${userMenuOpen ? 'ring-2 ring-primary/50' : 'hover:ring-2 hover:ring-primary/30'}`}
            >
              <Avatar name={userName} imageUrl={imageUrl} size="sm" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
