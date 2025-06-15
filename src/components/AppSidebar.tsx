
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Package, ShoppingCart, List, BarChart3, SlidersHorizontal, User } from 'lucide-react';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed';

  const menuItems = [
    { id: 'panel', label: 'Panel', icon: BarChart3 },
    { id: 'articulo', label: 'Artículo', icon: Package },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventario', icon: List },
    { id: 'users', label: 'Administración', icon: User },
    { id: 'settings', label: 'Configuración', icon: SlidersHorizontal },
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-2 justify-end hidden sm:flex">
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => handleItemClick(item.id)}
                isActive={activeTab === item.id}
                tooltip={item.label}
                size="lg"
                className="text-base [&_svg]:size-6"
              >
                <span className="flex items-center gap-2">
                  <item.icon />
                  {!collapsed && <span>{item.label}</span>}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
