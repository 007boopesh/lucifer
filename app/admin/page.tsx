"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  Briefcase,
  Mail,
  Settings,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function AdminPage() {
  const [activeSection, setActiveSection] =
    useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Hero Section",
      icon: User,
    },
    {
      name: "About",
      icon: User,
    },
    {
      name: "Projects",
      icon: FolderKanban,
    },
    {
      name: "Skills",
      icon: Wrench,
    },
    {
      name: "Experience",
      icon: Briefcase,
    },
    {
      name: "Contact",
      icon: Mail,
    },
    {
      name: "Settings",
      icon: Settings,
    },
  ];

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black text-white">
      <div className="flex min-h-screen">

        {/* =====================================================
            MOBILE TOP BAR
        ===================================================== */}

        <header className="fixed left-0 right-0 top-0 z-[100] flex h-16 items-center justify-between border-b border-white/10 bg-black/95 px-4 backdrop-blur-xl lg:hidden">
          <div className="min-w-0">
            <p className="text-sm font-bold">
              Portfolio Admin
            </p>

            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Control Console
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen((open) => !open)
            }
            aria-label="Toggle admin menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10"
          >
            {sidebarOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </header>

        {/* =====================================================
            MOBILE OVERLAY
        ===================================================== */}

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={`
            fixed
            bottom-0
            left-0
            top-0
            z-[95]
            w-[280px]
            border-r
            border-white/10
            bg-zinc-950
            p-5
            transition-transform
            duration-300
            lg:sticky
            lg:top-0
            lg:z-50
            lg:flex
            lg:h-screen
            lg:w-64
            lg:translate-x-0
            lg:flex-col
            lg:p-6
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          {/* Sidebar Header */}

          <div className="mb-8 hidden lg:block">
            <h1 className="text-xl font-bold">
              Portfolio Admin
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Control Console
            </p>
          </div>

          {/* Mobile Sidebar Header */}

          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div>
              <h1 className="text-lg font-bold">
                Portfolio Admin
              </h1>

              <p className="mt-1 text-xs text-zinc-500">
                Control Console
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Menu */}

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeSection === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    handleSectionChange(item.name)
                  }
                  className={`
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-left
                    text-sm
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? "text-black"
                        : "text-zinc-500 group-hover:text-white"
                    }
                  />

                  <span className="flex-1">
                    {item.name}
                  </span>

                  {isActive && (
                    <ChevronRight size={15} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}

          <div className="mt-6 border-t border-white/10 pt-5">
            <a
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ExternalLink size={17} />
              View Portfolio
            </a>
          </div>
        </aside>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="min-w-0 flex-1 pt-16 lg:pt-0">

          {/* =================================================
              DESKTOP HEADER
          ================================================= */}

          <header className="hidden items-center justify-between border-b border-white/10 bg-black/40 px-8 py-6 backdrop-blur-xl lg:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Admin Console
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {activeSection}
              </h2>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white hover:text-black"
            >
              View Portfolio
              <ExternalLink size={15} />
            </a>
          </header>

          {/* =================================================
              MOBILE HEADER
          ================================================= */}

          <div className="border-b border-white/10 px-4 py-6 lg:hidden">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Admin Console
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {activeSection}
            </h2>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="p-4 sm:p-6 lg:p-8">

            {/* =================================================
                DASHBOARD
            ================================================= */}

            {activeSection === "Dashboard" && (
              <div className="space-y-6">

                <div>
                  <p className="max-w-2xl text-sm leading-6 text-zinc-500">
                    Manage your portfolio content, projects,
                    skills, experience and contact information
                    from one place.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  {/* Status */}

                  <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Portfolio Status
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />

                      <h3 className="text-xl font-semibold">
                        Active
                      </h3>
                    </div>
                  </div>

                  {/* Projects */}

                  <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Projects
                    </p>

                    <h3 className="mt-4 text-3xl font-semibold">
                      7
                    </h3>
                  </div>

                  {/* Frames */}

                  <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Animation Frames
                    </p>

                    <h3 className="mt-4 text-3xl font-semibold">
                      192
                    </h3>
                  </div>

                  {/* System */}

                  <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      System
                    </p>

                    <h3 className="mt-4 text-xl font-semibold text-green-400">
                      Ready
                    </h3>
                  </div>
                </div>

                {/* Quick actions */}

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Quick Actions
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      "Hero Section",
                      "Projects",
                      "Skills",
                      "Contact",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          handleSectionChange(item)
                        }
                        className="rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                OTHER SECTIONS
            ================================================= */}

            {activeSection !== "Dashboard" && (
              <div className="space-y-6">

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Editing Section
                      </p>

                      <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                        {activeSection}
                      </h3>
                    </div>

                    <div className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-yellow-500">
                      Configuration Pending
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl border border-white/10 bg-black p-5">
                    <p className="text-sm leading-7 text-zinc-500">
                      This section is connected to the Admin
                      Console interface. The editing controls can
                      now be added here without changing the
                      responsive layout.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    SECTION-SPECIFIC PLACEHOLDER
                ================================================= */}

                {activeSection === "Hero Section" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Name
                      </p>

                      <p className="mt-3 font-semibold">
                        BOOPESH K
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Profession
                      </p>

                      <p className="mt-3 font-semibold">
                        Electronics / Embedded / VLSI / AI
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === "Projects" && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      "Li-Fi Video & Audio Transfer",
                      "Vehicle & License Authentication",
                      "Intelligent Speed Regulation Using Python",
                      "Smart Exam Time System",
                      "Stress Analysis and Prediction System",
                      "PCB Design",
                      "Blockchain Technology",
                    ].map((project, index) => (
                      <div
                        key={project}
                        className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
                      >
                        <span className="text-xs text-zinc-600">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <h4 className="mt-4 font-semibold leading-6">
                          {project}
                        </h4>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "Skills" && (
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Full Stack Development",
                      "Embedded Systems",
                      "IoT",
                      "PCB Design",
                      "Video Editing",
                      "Graphic Design",
                      "Arduino",
                      "Python",
                      "OpenCV",
                      "Git",
                      "GitHub",
                      "Adobe After Effects",
                      "Adobe Premiere Pro",
                      "Adobe Photoshop",
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-xs text-zinc-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {activeSection === "Contact" && (
                  <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Contact Email
                    </p>

                    <p className="mt-3 break-all font-semibold">
                      007boopesh@gmail.com
                    </p>
                  </div>
                )}

                {activeSection === "Settings" && (
                  <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      System
                    </p>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-white/10 p-4">
                        <span className="text-sm text-zinc-400">
                          Portfolio
                        </span>

                        <span className="text-sm text-green-400">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-white/10 p-4">
                        <span className="text-sm text-zinc-400">
                          Animation
                        </span>

                        <span className="text-sm text-green-400">
                          192 Frames
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}