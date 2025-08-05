import { Link, useLocation } from "wouter";
import { Scale, Home, FileText, Search, Link as LinkIcon, Database, Zap } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/evidence", icon: FileText, label: "Evidence" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/chain", icon: LinkIcon, label: "Chain" },
    { path: "/notion", icon: Database, label: "Notion" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-20 bg-obsidian-900/90 backdrop-blur-sm border-r border-obsidian-700 z-50 flex flex-col items-center py-8">
      <Link href="/">
        <div 
          className="w-12 h-12 bg-gold-byzantium-500 rounded-full flex items-center justify-center mb-8 cursor-pointer hover:bg-gold-byzantium-600 transition-colors"
          data-testid="legal-seal-home"
        >
          <Scale className="text-obsidian-950 w-6 h-6" />
        </div>
      </Link>
      
      <div className="flex flex-col space-y-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div 
                className="nav-item group cursor-pointer relative"
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isActive 
                      ? "bg-gold-byzantium-500 text-obsidian-950" 
                      : "bg-obsidian-800 text-obsidian-300 hover:bg-gold-byzantium-500 hover:text-obsidian-950"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Tooltip */}
                <div className={`
                  absolute left-16 top-1/2 transform -translate-y-1/2 
                  bg-obsidian-800 rounded-lg px-3 py-1 border border-obsidian-600
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  pointer-events-none whitespace-nowrap z-50
                `}>
                  <span className="text-sm text-obsidian-200">{item.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Status Indicator */}
      <div className="mt-auto">
        <div className="bg-obsidian-800 rounded-lg p-2">
          <div className="w-2 h-2 bg-emerald-verify-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </nav>
  );
}
