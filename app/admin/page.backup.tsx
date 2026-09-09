"use client";

import { useState } from "react";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("Dashboard");

  const menuItems = [
    "Dashboard",
    "Hero Section",
    "About",
    "Projects",
    "Skills",
    "Experience",
    "Contact",
    "Settings",
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-zinc-950 p-6">
          <div className="mb-10">
            <h1 className="text-xl font-bold">
              Portfolio Admin
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Control Console
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveSection(item)}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm transition ${
                  activeSection === item
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 p-8">
          {/* Header */}
          <header className="mb-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                ADMIN CONSOLE
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {activeSection}
              </h2>
            </div>

            <a
              href="/"
              className="rounded-lg border border-white/20 px-5 py-3 text-sm transition hover:bg-white hover:text-black"
            >
              View Portfolio
            </a>
          </header>

          {/* Dashboard */}
          {activeSection === "Dashboard" && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-500">
                  Portfolio Status
                </p>

                <h3 className="mt-3 text-2xl font-semibold">
                  Active
                </h3>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-500">
                  Projects
                </p>

                <h3 className="mt-3 text-2xl font-semibold">
                  0
                </h3>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-500">
                  Animation Frames
                </p>

                <h3 className="mt-3 text-2xl font-semibold">
                  192
                </h3>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-500">
                  System
                </p>

                <h3 className="mt-3 text-2xl font-semibold">
                  Ready
                </h3>
              </div>
            </div>
          )}

          {/* Other sections */}
          {activeSection !== "Dashboard" && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8">
              <h3 className="text-2xl font-semibold">
                {activeSection}
              </h3>

              <p className="mt-3 text-zinc-500">
                This section will be connected to your portfolio
                controls in the next stage.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}