import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, Link as LinkIcon } from "lucide-react";
import TrustTimeline from "@/components/trust-timeline";
import MintingEligibility from "@/components/minting-eligibility";
import ErrorBoundary from "@/components/error-boundary";
import type { Evidence, ChainOfCustody } from "@shared/schema";

export default function Chain() {
  const { data: evidence, isLoading, error } = useQuery<Evidence[]>({
    queryKey: ["/api/evidence"],
  });

  const activeEvidence = useMemo(() => {
    if (!Array.isArray(evidence) || evidence.length === 0) {
      return null;
    }

    return evidence.find((item) => item.status === "MINTED") ?? evidence[0];
  }, [evidence]);

  const timelineEvidence = useMemo(() => {
    if (!activeEvidence) {
      return null;
    }

    const toIsoString = (value: Date | string | null | undefined) => {
      if (!value) return null;
      if (value instanceof Date) {
        return value.toISOString();
      }
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    };

    return {
      originalTrustScore: activeEvidence.originalTrustScore ?? "0.00",
      trustScore: activeEvidence.trustScore ?? "0.00",
      status: activeEvidence.status ?? "PENDING",
      verifiedAt: toIsoString(activeEvidence.verifiedAt),
      mintedAt: toIsoString(activeEvidence.mintedAt),
      uploadedAt: toIsoString(activeEvidence.uploadedAt) ?? new Date().toISOString(),
    };
  }, [activeEvidence]);

  const { data: custodyEntries = [] } = useQuery<ChainOfCustody[]>({
    queryKey: activeEvidence ? [`/api/evidence/${activeEvidence.id}/custody`] : ["chain/empty"],
    enabled: Boolean(activeEvidence),
  });

  return (
    <section className="py-24 bg-slate-950 min-h-screen">
      <div className="container mx-auto px-8 space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-50 mb-3">Chain of Custody</h2>
            <p className="text-slate-400 max-w-2xl">
              Monitor ledger-qualified evidence as it progresses from verification to permanent ChittyChain storage.
            </p>
          </div>
          <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/40 uppercase tracking-wide">
            Real-time ledger feed
          </Badge>
        </div>

        {error && (
          <Alert className="bg-red-900/20 border-red-500/40 text-red-200">
            <AlertDescription>
              Unable to load chain of custody data. Please refresh the page to try again.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 rounded-2xl bg-slate-900/70 border border-slate-800 animate-pulse" />
            <div className="h-80 rounded-2xl bg-slate-900/70 border border-slate-800 animate-pulse" />
          </div>
        )}

        {!isLoading && !activeEvidence && (
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100 text-xl">No evidence available</CardTitle>
              <CardDescription className="text-slate-400">
                Upload evidence to begin tracking the immutable chain of custody lifecycle.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {activeEvidence && timelineEvidence && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ErrorBoundary>
              <TrustTimeline evidence={timelineEvidence} />
            </ErrorBoundary>
            <ErrorBoundary>
              <MintingEligibility evidenceId={activeEvidence.id} />
            </ErrorBoundary>
          </div>
        )}

        {activeEvidence && (
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-slate-100 text-2xl flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-emerald-300" />
                  Ledger Events
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Custody trail for <span className="font-medium text-slate-200">{activeEvidence.filename}</span>
                </CardDescription>
              </div>
              <Badge className="bg-slate-800 text-slate-300 border-slate-700">{custodyEntries.length} events</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {custodyEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between border-b border-slate-800 pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <div className="flex items-center text-slate-200">
                        <LinkIcon className="w-4 h-4 mr-2 text-emerald-300" />
                        {entry.action}
                      </div>
                      {entry.notes && <p className="text-sm text-slate-400 mt-1">{entry.notes}</p>}
                    </div>
                    <div className="text-right text-sm text-slate-400">
                      <div>{new Date(entry.timestamp).toLocaleString()}</div>
                      {entry.location && <div className="text-slate-500">{entry.location}</div>}
                    </div>
                  </div>
                ))}

                {custodyEntries.length === 0 && (
                  <p className="text-slate-400">
                    No custody events recorded yet. Verification or minting activity will appear here automatically.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
