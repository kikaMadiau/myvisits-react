import { ChevronRight, Bell, Moon, Globe, HelpCircle, Info } from "lucide-react";

const settingsGroups = [
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", desc: "Manage your alerts" },
      { icon: Moon, label: "Appearance", desc: "Theme & display" },
      { icon: Globe, label: "Language", desc: "English" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", desc: "FAQs & guides" },
      { icon: Info, label: "About", desc: "Version 1.0.0" },
    ],
  },
];

export default function AppSettings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="px-5 py-5 space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{group.title}</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}