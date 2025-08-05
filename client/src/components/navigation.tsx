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
    <nav className="fixed left-0 top-0 h-full w-24 nav-glass-elite z-50 flex flex-col items-center py-8">
      <Link href="/">
        <div 
          className="legal-seal-premium w-16 h-16 rounded-full flex items-center justify-center mb-12 cursor-pointer hover:scale-105 transition-all duration-500"
          data-testid="legal-seal-home"
        >
          <Scale className="text-obsidian-950 w-8 h-8" />
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
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 relative overflow-hidden ${
                    isActive 
                      ? "glass-byzantium shadow-byzantium" 
                      : "glass-obsidian hover:glass-byzantium/50"
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-colors duration-500 ${
                    isActive ? "text-obsidian-950" : "text-obsidian-300"
                  }`} />
                  
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-byzantium-500/20 to-gold-byzantium-700/30 rounded-xl animate-legal-pulse"></div>
                  )}
                </div>
                
                {/* Tooltip */}
                <div className={`
                  absolute left-20 top-1/2 transform -translate-y-1/2 
                  glass-obsidian rounded-lg px-3 py-2 
                  opacity-0 group-hover:opacity-100 transition-all duration-300
                  pointer-events-none whitespace-nowrap
                `}>
                  <span className="text-sm font-tech text-obsidian-200">{item.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Status Indicator */}
      <div className="mt-auto">
        <div className="glass-obsidian rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-verify-500 rounded-full animate-pulse"></div>
            <Zap className="w-4 h-4 text-gold-byzantium-500" />
          </div>
        </div>
      </div>
    </nav>
  );
}
