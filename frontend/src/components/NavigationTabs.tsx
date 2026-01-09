import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Users } from 'lucide-react';

interface NavigationTabsProps {
  restaurantId: string;
}

export default function NavigationTabs({ restaurantId }: NavigationTabsProps) {
  const location = useLocation();

  const tabs = [
    {
      name: 'Dashboard',
      href: `/restaurant/${restaurantId}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: 'Paramétrage Roue',
      href: `/restaurant/${restaurantId}/prizes`,
      icon: Settings,
    },
    {
      name: 'Clients',
      href: `/restaurant/${restaurantId}/clients`,
      icon: Users,
    },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.href;
          
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
