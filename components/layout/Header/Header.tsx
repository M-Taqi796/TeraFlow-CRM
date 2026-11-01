import { Bars3Icon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../../ui/ThemeToggle';
import { useThemeContext } from '@/context/ThemeContext';

interface HeaderProps {
  activeTaskCount: number;
  onOpenMobileNav: () => void;
  onOpenMobileTasks: () => void;
}

export function Header({
  activeTaskCount,
  onOpenMobileNav,
  onOpenMobileTasks,
}: HeaderProps) {
  const { theme } = useThemeContext();

  return (
    <header
      className={`h-16 px-4 sm:px-6 border-b ${theme.border} ${theme.bgPanel} flex items-center justify-between shrink-0 gap-3`}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onOpenMobileNav}
          className={`md:hidden p-2 ${theme.textMain} ${theme.hoverBg} rounded-lg shrink-0`}
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
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Mobile tasks trigger */}
        <button
          onClick={onOpenMobileTasks}
          className={`lg:hidden flex items-center gap-1.5 px-3 py-2 ${theme.inputBg} ${theme.hoverBg} border ${theme.border} ${theme.textMain} rounded-lg text-xs font-semibold transition-colors`}
          title="Open Tasks"
        >
          <CheckCircleIcon className="w-4 h-4 text-primary" />
          <span>Tasks</span>
          <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {activeTaskCount}
          </span>
        </button>

        <ThemeToggle />

        {/* New Lead button */}
        <button className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm">
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Lead</span>
        </button>
      </div>
    </header>
  );
}
