import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Scale, Eye, Lock, Database, FileText } from "lucide-react";

export default function HeroSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return (
      <section className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="text-2xl font-tech text-gold-byzantium-500">Loading...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-obsidian-950"></div>
      
      {/* Main Content */}
      <div className="container mx-auto px-8 pt-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gold-byzantium-500 rounded-full flex items-center justify-center">
                <Scale className="w-6 h-6 text-obsidian-950" />
              </div>
              <Badge className="bg-gold-byzantium-500/10 border-gold-byzantium-500/20 text-gold-byzantium-500 px-4 py-2">
                BLOCKCHAIN VERIFIED
              </Badge>
            </div>
            
            <h1 className="font-legal text-6xl text-obsidian-50 mb-6">
              ChittyChain
              <span className="block text-gold-byzantium-500 italic">Evidence Ledger</span>
            </h1>
            
            <p className="text-xl text-obsidian-300 max-w-3xl mx-auto leading-relaxed">
              Immutable forensic evidence management with blockchain verification, 
              automated contradiction detection, and court-admissible chain of custody tracking.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-obsidian-800/50 backdrop-blur-sm border border-obsidian-700 rounded-xl p-6 text-center">
              <div className="font-tech text-3xl font-bold text-obsidian-50 mb-2">
                {stats?.evidenceArtifacts?.toLocaleString() || '2,847'}
              </div>
              <div className="text-obsidian-400">Evidence Artifacts</div>
              <div className="text-xs text-gold-byzantium-500 mt-2">+15% this week</div>
            </div>
            
            <div className="bg-obsidian-800/50 backdrop-blur-sm border border-obsidian-700 rounded-xl p-6 text-center">
              <div className="font-tech text-3xl font-bold text-obsidian-50 mb-2">
                {stats?.verificationRate || '99.7'}%
              </div>
              <div className="text-obsidian-400">Verification Rate</div>
              <div className="text-xs text-emerald-verify-500 mt-2">Court Admissible</div>
            </div>
            
            <div className="bg-obsidian-800/50 backdrop-blur-sm border border-obsidian-700 rounded-xl p-6 text-center">
              <div className="font-tech text-3xl font-bold text-obsidian-50 mb-2">
                {stats?.activeCases || '45'}
              </div>
              <div className="text-obsidian-400">Active Cases</div>
              <div className="text-xs text-crimson-evidence-500 mt-2">
                {stats?.criticalContradictions || '3'} Critical
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Shield, title: "Evidence Verification", desc: "Cryptographic validation" },
              { icon: Scale, title: "Chain of Custody", desc: "Immutable audit trail" },
              { icon: Eye, title: "Contradiction Detection", desc: "AI-powered analysis" },
              { icon: Lock, title: "Blockchain Ledger", desc: "Tamper-proof storage" }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-obsidian-800/30 backdrop-blur-sm border border-obsidian-700 rounded-xl p-6 hover:border-gold-byzantium-500/30 transition-colors">
                  <div className="w-10 h-10 bg-gold-byzantium-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gold-byzantium-500" />
                  </div>
                  <h3 className="font-legal text-lg text-obsidian-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-obsidian-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-gold-byzantium-500 hover:bg-gold-byzantium-600 text-obsidian-950 px-8 py-3 rounded-lg font-semibold"
                data-testid="button-upload-evidence"
              >
                <FileText className="w-5 h-5 mr-2" />
                Upload Evidence
              </Button>
              <Button 
                variant="outline"
                className="border-gold-byzantium-500/30 hover:border-gold-byzantium-500 text-gold-byzantium-500 hover:text-gold-byzantium-500 px-8 py-3 rounded-lg font-semibold"
                data-testid="button-view-documentation"
              >
                <Database className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </div>
            
            <p className="text-sm text-obsidian-500">
              Secure, court-admissible evidence management for legal professionals
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
