"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ArrowRightIcon, EnvelopeIcon, GroupIcon, HorizontaLDots } from "../icons/index";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
};

// Icons for sidebar modules


const navItems: NavItem[] = [
  {
    name: "Campaigns",
    icon: <EnvelopeIcon />,
    path: "/campaigns",
  },
  {
    name: "Contacts",
    icon: <UserCircleIcon />,
    path: "/contacts",
  },
  {
    name: "Audiences",
    icon: <GroupIcon />,
    path: "/audiences",
  },
  {
    name: "Logout",
    icon: <ArrowRightIcon />,
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

const handleLogout = () => {
  sessionStorage.clear();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  router.replace("/signin");
};

  const isActive = useCallback((path?: string) => path ? pathname.startsWith(path) : false, [pathname]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link href="/campaigns">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
            
             
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>

              <ul className="flex flex-col gap-3">
                {navItems.map((nav) => (
                  <li key={nav.name}>
                    {nav.name === "Logout" ? (
                      <button
                        onClick={handleLogout}
                        className="menu-item group menu-item-inactive w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-gray-500 group-hover:text-red-600 dark:text-gray-400">
                          {nav.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className="text-sm font-medium">{nav.name}</span>
                        )}
                      </button>
                    ) : (
                      nav.path && (
                        <Link
                          href={nav.path}
                          className={`menu-item group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(nav.path)
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                        >
                          <span className={isActive(nav.path) ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}>
                            {nav.icon}
                          </span>
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <span className="text-sm">{nav.name}</span>
                          )}
                        </Link>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
