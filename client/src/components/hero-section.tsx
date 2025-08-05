import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Shield, Zap, Eye, Lock, ChevronRight, Scale, Binary, Cpu, Database } from "lucide-react";

export default function HeroSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats,
  });

  const [activeModule, setActiveModule] = useState(0);

  const modules = [
    { icon: Shield, title: "Evidence Verification", desc: "Cryptographic validation" },
    { icon: Scale, title: "Chain of Custody", desc: "Immutable audit trail" },
    { icon: Eye, title: "Contradiction Detection", desc: "AI-powered analysis" },
    { icon: Lock, title: "Blockchain Ledger", desc: "Tamper-proof storage" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModule((prev) => (prev + 1) % modules.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <section className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="glass-obsidian rounded-2xl p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 legal-seal-premium rounded-full animate-seal-constellation"></div>
            <div className="text-2xl font-tech text-gradient-byzantium">Initializing ChittyChain...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Ultra-Complex Background Architecture */}
      <div className="absolute inset-0">
        {/* Orbital Evidence Fragments */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute evidence-card-elite rounded-xl opacity-20"
            style={{
              width: `${40 + (i * 8)}px`,
              height: `${30 + (i * 6)}px`,
              top: `${10 + (i * 7)}%`,
              right: `${5 + (i * 8)}%`,
              animationDelay: `${i * 0.5}s`,
              transform: `rotate(${i * 30}deg)`,
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-gold-byzantium-500/30 to-obsidian-800/50 rounded-xl animate-evidence-materialize"></div>
          </div>
        ))}

        {/* Data Flow Streams */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-gold-byzantium-500/40 to-transparent animate-data-flow"
              style={{
                top: `${20 + (i * 12)}%`,
                width: '100%',
                animationDelay: `${i * 0.8}s`,
                animationDuration: '4s'
              }}
            ></div>
          ))}
        </div>

        {/* Constellation Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Revolutionary Hero Layout */}
      <div className="container mx-auto px-8 relative z-30">
        <div className="min-h-screen flex flex-col justify-center">
          
          {/* Elite Header Section */}
          <div className="space-y-12 max-w-7xl">
            
            {/* Status Bar */}
            <div className="flex items-center justify-between glass-obsidian rounded-2xl p-6">
              <div className="flex items-center space-x-6">
                <div className="legal-seal-premium w-16 h-16 rounded-full flex items-center justify-center animate-seal-constellation">
                  <Scale className="w-8 h-8 text-obsidian-950" />
                </div>
                <div>
                  <div className="font-legal text-2xl text-gradient-byzantium">ChittyChain Evidence Ledger</div>
                  <div className="font-tech text-sm text-obsidian-300">Active • Blockchain Verified • Court Admissible</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="font-tech text-2xl text-gold-byzantium-500">{stats?.evidenceArtifacts?.toLocaleString() || '2,847'}</div>
                  <div className="text-xs text-obsidian-400">Evidence Items</div>
                </div>
                <div className="text-center">
                  <div className="font-tech text-2xl text-emerald-verify-500">{stats?.verificationRate || '99.7'}%</div>
                  <div className="text-xs text-obsidian-400">Verified</div>
                </div>
                <div className="text-center">
                  <div className="font-tech text-2xl text-crimson-evidence-500">{stats?.criticalContradictions || '3'}</div>
                  <div className="text-xs text-obsidian-400">Critical</div>
                </div>
              </div>
            </div>

            {/* Revolutionary Title Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="glass-byzantium rounded-2xl p-4 inline-block">
                  <Badge className="bg-transparent border-none text-obsidian-950 font-tech text-xs tracking-[0.2em]">
                    LOGIC SCIENCE & EVIDENTIARY REASONING
                  </Badge>
                </div>
                
                <h1 className="font-legal text-8xl leading-none tracking-tight">
                  <span className="text-gradient-evidence">Immutable</span>
                  <br />
                  <span className="text-obsidian-100">Evidence</span>
                  <br />
                  <span className="text-gradient-byzantium italic">Architecture</span>
                </h1>
                
                <p className="text-xl text-obsidian-300 leading-relaxed max-w-3xl font-crimson">
                  Revolutionary blockchain-based evidence management with 
                  <span className="text-gold-byzantium-500"> cryptographic validation</span>, 
                  <span className="text-emerald-verify-500"> AI-powered contradiction detection</span>, and 
                  <span className="text-crimson-evidence-500"> immutable chain of custody</span> 
                  for legal proceedings of unprecedented integrity.
                </p>
              </div>
            </div>

            {/* Interactive Module Showcase */}
            <div className="grid grid-cols-12 gap-8">
              
              {/* Left: Module Navigation */}
              <div className="col-span-5 space-y-4">
                {modules.map((module, i) => {
                  const Icon = module.icon;
                  const isActive = i === activeModule;
                  
                  return (
                    <div
                      key={i}
                      className={`
                        cursor-pointer transition-all duration-700 rounded-2xl p-6
                        ${isActive ? 'glass-byzantium shadow-byzantium' : 'glass-obsidian hover:glass-byzantium/50'}
                      `}
                      onClick={() => setActiveModule(i)}
                      data-testid={`module-${module.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500
                          ${isActive ? 'bg-obsidian-950 shadow-void' : 'bg-obsidian-800'}
                        `}>
                          <Icon className={`w-6 h-6 transition-colors duration-500 ${isActive ? 'text-gold-byzantium-500' : 'text-obsidian-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-legal text-lg transition-colors duration-500 ${isActive ? 'text-obsidian-950' : 'text-obsidian-200'}`}>
                            {module.title}
                          </div>
                          <div className={`font-tech text-sm transition-colors duration-500 ${isActive ? 'text-obsidian-700' : 'text-obsidian-400'}`}>
                            {module.desc}
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-obsidian-950 transform rotate-90' : 'text-obsidian-600'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Evidence Terminal */}
              <div className="col-span-7">
                <div className="glass-obsidian rounded-2xl p-8 h-96 relative overflow-hidden">
                  <div className="font-tech text-sm text-obsidian-400 mb-4">chittychain://evidence-terminal</div>
                  
                  {/* Terminal Content */}
                  <div className="space-y-3 font-tech text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-verify-500">$</span>
                      <span className="text-obsidian-200">initiate_evidence_scan --blockchain-verify</span>
                    </div>
                    <div className="text-gold-byzantium-500">→ Scanning evidence repository...</div>
                    <div className="text-obsidian-300">→ Found 2,847 evidence artifacts</div>
                    <div className="text-emerald-verify-500">→ Cryptographic validation: PASSED</div>
                    <div className="text-obsidian-300">→ Chain of custody integrity: VERIFIED</div>
                    <div className="text-crimson-evidence-500">→ Contradiction analysis: 3 CRITICAL ALERTS</div>
                    <div className="text-gold-byzantium-500">→ Blockchain consensus: CONFIRMED</div>
                    
                    <div className="pt-4 border-t border-obsidian-700">
                      <div className="text-obsidian-400">System Status:</div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="text-emerald-verify-500">• Evidence Integrity: 99.97%</div>
                        <div className="text-gold-byzantium-500">• Blockchain Sync: Active</div>
                        <div className="text-crimson-evidence-500">• Critical Issues: 3</div>
                        <div className="text-obsidian-300">• Court Admissible: Ready</div>
                      </div>
                    </div>
                  </div>

                  {/* Terminal Cursor */}
                  <div className="absolute bottom-8 left-8">
                    <span className="text-gold-byzantium-500 animate-pulse">█</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Interface */}
            <div className="flex items-center justify-between glass-obsidian rounded-2xl p-8">
              <div className="space-y-2">
                <div className="font-legal text-xl text-obsidian-100">Ready to Process Evidence</div>
                <div className="font-tech text-sm text-obsidian-400">Upload, verify, and mint evidence to the blockchain</div>
              </div>
              
              <div className="flex space-x-4">
                <Button className="glass-byzantium border-0 text-obsidian-950 px-8 py-4 rounded-xl font-semibold shadow-byzantium hover:shadow-void transition-all duration-500" data-testid="button-upload-evidence">
                  <Database className="w-5 h-5 mr-2" />
                  Upload Evidence
                </Button>
                <Button className="glass-obsidian border border-gold-byzantium-500/30 text-gold-byzantium-500 px-8 py-4 rounded-xl font-semibold hover:glass-byzantium/20 transition-all duration-500" data-testid="button-access-terminal">
                  <Cpu className="w-5 h-5 mr-2" />
                  Access Terminal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
