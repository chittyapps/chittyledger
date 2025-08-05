import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EvidenceCard from "./evidence-card";

export default function HeroSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return (
      <section className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="text-2xl font-tech text-legal-gold-500">Loading...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 parchment-texture opacity-20"></div>
      
      {/* Floating Evidence Blocks */}
      <div className="absolute top-20 right-32 evidence-block animate-float" style={{ animationDelay: "0s" }}>
        <div className="w-32 h-24 bg-gradient-to-br from-legal-gold-500/20 to-institutional-800/30 rounded-lg shadow-evidence opacity-30"></div>
      </div>
      
      <div className="absolute top-64 right-96 evidence-block animate-float" style={{ animationDelay: "2s" }}>
        <div className="w-28 h-20 bg-gradient-to-br from-institutional-600/20 to-institutional-900/30 rounded-lg shadow-evidence opacity-25"></div>
      </div>
      
      <div className="absolute top-96 right-64 evidence-block animate-float" style={{ animationDelay: "4s" }}>
        <div className="w-36 h-28 bg-gradient-to-br from-forensic-red-500/20 to-institutional-800/30 rounded-lg shadow-evidence opacity-20"></div>
      </div>

      {/* Main Hero Content */}
      <div className="container mx-auto px-8 pt-32 relative z-20">
        <div className="grid grid-cols-12 gap-8 items-center min-h-screen">
          
          {/* Left Column - Main Content */}
          <div className="col-span-7 space-y-8">
            <div className="space-y-4">
              <Badge 
                variant="outline" 
                className="inline-flex items-center space-x-2 bg-institutional-900/50 px-4 py-2 border-legal-gold-500/20 text-legal-gold-500"
                data-testid="blockchain-verified-badge"
              >
                <div className="w-2 h-2 bg-legal-gold-500 rounded-full animate-pulse"></div>
                <span className="font-tech text-xs tracking-wider">BLOCKCHAIN-VERIFIED EVIDENCE</span>
              </Badge>
              
              <h1 className="font-legal text-7xl leading-none text-institutional-50">
                ChittyChain
                <span className="block text-legal-gold-500 italic">Evidence Ledger</span>
              </h1>
              
              <p className="text-xl text-institutional-300 leading-relaxed max-w-2xl">
                Immutable forensic evidence management with blockchain verification, 
                automated contradiction detection, and court-admissible chain of custody tracking.
              </p>
            </div>
            
            {/* Evidence Stats */}
            <div className="grid grid-cols-3 gap-6 py-8">
              <div className="evidence-card p-6 rounded-xl" data-testid="stat-evidence-artifacts">
                <div className="font-tech text-3xl font-bold text-institutional-900">
                  {stats?.evidenceArtifacts?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-institutional-600 mt-1">Evidence Artifacts</div>
                <div className="text-xs text-legal-gold-600 mt-2 font-tech">+15% this week</div>
              </div>
              <div className="evidence-card p-6 rounded-xl" data-testid="stat-verification-rate">
                <div className="font-tech text-3xl font-bold text-institutional-900">
                  {stats?.verificationRate ? `${stats.verificationRate}%` : '0%'}
                </div>
                <div className="text-sm text-institutional-600 mt-1">Verification Rate</div>
                <div className="text-xs text-legal-gold-600 mt-2 font-tech">Court Admissible</div>
              </div>
              <div className="evidence-card p-6 rounded-xl" data-testid="stat-active-cases">
                <div className="font-tech text-3xl font-bold text-institutional-900">
                  {stats?.activeCases || '0'}
                </div>
                <div className="text-sm text-institutional-600 mt-1">Active Cases</div>
                <div className="text-xs text-forensic-red-500 mt-2 font-tech">
                  {stats?.criticalContradictions || '0'} Critical
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                className="bg-legal-gold-500 hover:bg-legal-gold-600 text-institutional-950 px-8 py-4 rounded-xl font-semibold shadow-floating hover:shadow-legal"
                data-testid="button-upload-evidence"
              >
                Upload Evidence
              </Button>
              <Button 
                variant="outline"
                className="border-legal-gold-500/30 hover:border-legal-gold-500 text-legal-gold-500 hover:text-legal-gold-500 px-8 py-4 rounded-xl font-semibold"
                data-testid="button-view-documentation"
              >
                View Documentation
              </Button>
            </div>
          </div>
          
          {/* Right Column - Evidence Visualization */}
          <div className="col-span-5 relative">
            <div className="evidence-visualization relative">
              <EvidenceCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
