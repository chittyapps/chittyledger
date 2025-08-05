import { Link, useLocation } from "wouter";
import { Scale, Home, FileText, Search, Link as LinkIcon } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/evidence", icon: FileText, label: "Evidence" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/chain", icon: LinkIcon, label: "Chain" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-20 nav-glass z-50 flex flex-col items-center py-8">
      <Link href="/">
        <div 
          className="legal-seal w-12 h-12 rounded-full flex items-center justify-center mb-8 cursor-pointer hover:animate-seal-press transition-transform duration-300"
          data-testid="legal-seal-home"
        >
          <Scale className="text-institutional-950 text-lg" />
        </div>
      </Link>
      
      <div className="flex flex-col space-y-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div 
                className="nav-item group cursor-pointer"
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "bg-legal-gold-500 text-institutional-950" 
                      : "bg-institutional-800 text-institutional-300 hover:bg-legal-gold-500 hover:text-institutional-950"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
