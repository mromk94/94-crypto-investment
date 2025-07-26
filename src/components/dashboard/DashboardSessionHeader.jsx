import React from "react";

/**
 * DashboardSessionHeader: Reusable header bar for dashboard session pages
 * Props:
 *   - title: string (main heading, e.g. "Profile", "Deposit")
 *   - subtitle: string (optional, smaller text)
 *   - logo: React node or string (optional, defaults to site logo or icon)
 *   - children: React node (optional, for extra controls)
 */
export default function DashboardSessionHeader({ title, subtitle, logo, children }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-primary/90 to-sui/60 rounded-2xl shadow-lg mb-6">
      {logo ? (
        typeof logo === "string" ? (
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-full shadow border-2 border-accent bg-white" />
        ) : (
          <span className="h-10 w-10 flex items-center justify-center text-2xl">{logo}</span>
        )
      ) : (
        <span className="h-10 w-10 flex items-center justify-center text-2xl bg-accent rounded-full shadow">🚀</span>
      )}
      <div className="flex flex-col">
        <span className="text-xl font-bold text-accent drop-shadow-sm">{title}</span>
        {subtitle && <span className="text-sm text-gray-300">{subtitle}</span>}
      </div>
      <div className="flex-1" />
      {children}
    </div>
  );
}
