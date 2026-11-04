import { Bars3Icon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../../ui/ThemeToggle';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { usePathname } from 'next/navigation';
import { STATIC_NAV_ITEMS } from '@/data/navigation.data';

interface HeaderProps {
  activeTaskCount: number;
  onOpenMobileNav: () => void;
  onOpenMobileTasks: () => void;
}

/** Derive a human-readable page title from the current pathname */
function usePageTitle(): string {
  const pathname = usePathname();
  if (!pathname) return 'Dashboard';
  if (pathname === '/settings' || pathname.startsWith('/settings')) return 'Settings';
  const match = STATIC_NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href))
  );
  return match?.name ?? 'Dashboard';
}

export function Header({
  activeTaskCount,
  onOpenMobileNav,
  onOpenMobileTasks,
}: HeaderProps) {
  const { theme } = useThemeContext();
  const { openNewLeadModal } = useCRM();
  const pageTitle = usePageTitle();

  return (
    <header
      className={`h-16 px-4 sm:px-6 border-b ${theme.border} ${theme.bgPanel} flex items-center justify-between shrink-0 gap-3`}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onOpenMobileNav}
          className={`md:hidden p-2 ${theme.textMain} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] rounded-lg shrink-0 transition-colors`}
          aria-label="Open Navigation menu"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        {/* Mobile brand */}
        <div className="flex md:hidden items-center gap-2">
          <img src="/logo.png" alt="TeraFlow" className="w-7 h-7 object-contain shrink-0" />
          <span className={`font-bold text-base ${theme.textMain} tracking-tight leading-none`}>
            TeraFlow<span className="text-primary font-bold">.</span>
          </span>
        </div>

        {/* Desktop: current page title */}
        <h1 className={`hidden md:block text-sm font-semibold ${theme.textMain} tracking-tight`}>
          {pageTitle}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Vertical divider */}
        <span className={`hidden sm:block w-px h-5 ${theme.border} bg-current opacity-30`} />

        {/* Mobile tasks trigger — only shown when there are active tasks */}
        {activeTaskCount > 0 && (
          <button
            onClick={onOpenMobileTasks}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 ${theme.bgSubtle} hover:bg-[#F1F5F9] dark:hover:bg-[#25252D] border ${theme.border} ${theme.textMain} rounded-lg text-xs font-semibold transition-colors`}
            title="Open Tasks"
          >
            <CheckCircleIcon className="w-4 h-4 text-primary" />
            <span>Tasks</span>
            <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums">
              {activeTaskCount}
            </span>
          </button>
        )}

        {/* New Contact button */}
        <button
          type="button"
          onClick={openNewLeadModal}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-primary hover:bg-[#006bbd] text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Contact</span>
        </button>
      </div>
    </header>
  );
}
