
import * as React from "react"
import {
  NotebookTabs,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { NavUser } from "./nav-user"

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createClient();
  const {data} = await supabase.auth.getUser();
  console.log(data)

  const user = {
    username: data.user?.user_metadata.username,
    email: data.user?.email ?? ""

  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <NotebookTabs className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-md leading-tight">
                <span className="truncate font-semibold">
                  Elva
                </span>
                <span className="truncate text-xs">Study Assistant</span>
              </div>
            </SidebarMenuButton>      
            </SidebarHeader>
      <SidebarContent>
        <NavMain/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} /> 
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
