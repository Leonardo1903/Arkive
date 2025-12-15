"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FolderOpen,
  Trash2,
  Star,
} from "lucide-react";
import Logo from "../../public/Logo.png";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
}

const navItems = [
  {
    url: "/dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    url: "/my-files",
    name: "My Files",
    icon: FolderOpen,
  },
  {
    url: "/starred",
    name: "Starred",
    icon: Star,
  },
  // {
  //   url: "/shared",
  //   name: "Shared",
  //   icon: Share2,
  // },
  {
    url: "/trash",
    name: "Trash",
    icon: Trash2,
  },
];

export default function Sidebar({ fullName, avatar, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="sidebar w-64 h-screen flex flex-col p-6">
      <div className="mb-8 h-10 flex items-center">
        <Image
          src={Logo}
          alt="Arkive Logo"
          width={100}
          height={40}
          className="object-contain"
        />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ url, name, icon: Icon }) => (
          <Button
            key={name}
            variant="ghost"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl w-full text-muted-foreground hover:text-foreground hover:bg-muted transition justify-start h-12",
              pathname === url &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium shadow-sm"
            )}
            onClick={() => router.push(url)}
          >
            <Icon size={20} />
            <span>{name}</span>
          </Button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarImage src={avatar} alt={fullName} />
            <AvatarFallback>
              {fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
