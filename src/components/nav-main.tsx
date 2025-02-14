"use client";

import { 
  CreditCard,
  Frame,
  Image,
  Images,
  Layers,
  Settings2,
  SquareTerminal,
 } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems =  [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: SquareTerminal,
  },{
    title: "Image Generation",
    url: "/image-generation",
    icon: Image,
  },
  {
    title: "My models",
    url: "/models",
    icon: Frame 
  },
  {
    title: "Train model",
    url: "/model-training",
    icon: Layers
  },
  {
    title: "My Images",
    url: "/gallery",
    icon: Images
  },{
    title: "Billing",
    url: "/billing",
    icon: CreditCard
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2
  }
]


export function NavMain() {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <Link key={item.title} href={item.url} className={cn("rounded-none",
          pathname === item.url ? 'text-primary bg-primary/5' : 'text-muted-foreground' ) }>
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton tooltip={item.title}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
