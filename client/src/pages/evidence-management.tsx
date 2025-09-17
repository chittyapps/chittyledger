import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Filter, Plus, AlertTriangle } from "lucide-react";
import EvidenceTable from "@/components/evidence-table";
import CaseSidebar from "@/components/case-sidebar";
import TrustTimeline from "@/components/trust-timeline";
import MintingEligibility from "@/components/minting-eligibility";
import { EvidenceCardSkeleton, MintingEligibilitySkeleton, CaseSidebarSkeleton, EmptyState } from "@/components/loading-states";
import ErrorBoundary from "@/components/error-boundary";

import { useQuery } from "@tanstack/react-query";

function EvidenceUploadForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-900/20 border-blue-500/50">
        <AlertTriangle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          Evidence upload form will be implemented here. This would include file upload, case selection, evidence tier classification, and metadata entry.
        </AlertDescription>
      </Alert>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button disabled>Upload Evidence</Button>
      </div>
    </div>
  );
}

export default function EvidenceManagement() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: evidence, isLoading, error } = useQuery({
    queryKey: ['/api/evidence']
  });

  const sampleEvidence = evidence && Array.isArray(evidence) && evidence.length > 0 ? evidence[0] : null;

  return (
    <section className="py-24 bg-institutional-900/30 min-h-screen">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-12 gap-8">

          {/* Dashboard Header */}
          <div className="col-span-12 mb-12">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-legal text-4xl text-institutional-50 mb-2">Evidence Management</h2>
                <p className="text-institutional-400">Comprehensive forensic evidence tracking and analysis</p>
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="bg-institutional-800 hover:bg-institutional-700 text-institutional-300 border-institutional-700"
                  data-testid="button-filter"
                >
                  <Filter className="mr-2 w-4 h-4" />
                  Filter
                </Button>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-legal-gold-500 hover:bg-legal-gold-600 text-institutional-950"
                      data-testid="button-add-evidence"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Add Evidence
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-slate-50">Upload New Evidence</DialogTitle>
                    </DialogHeader>
                    <EvidenceUploadForm onClose={() => setIsUploadOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="col-span-12 mb-8">
              <Alert className="bg-red-900/20 border-red-500/50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  Failed to load evidence data. Please refresh the page or try again later.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Trust Systems Demo */}
          {isLoading ? (
            <div className="col-span-12 mb-8">
              <div className="grid grid-cols-2 gap-8">
                <EvidenceCardSkeleton />
                <MintingEligibilitySkeleton />
              </div>
            </div>
          ) : sampleEvidence ? (
            <div className="col-span-12 mb-8">
              <div className="grid grid-cols-2 gap-8">
                <ErrorBoundary>
                  <TrustTimeline evidence={sampleEvidence} />
                </ErrorBoundary>
                <ErrorBoundary>
                  <MintingEligibility evidenceId={sampleEvidence.id} />
                </ErrorBoundary>
              </div>
            </div>
          ) : !isLoading && (!evidence || (Array.isArray(evidence) && evidence.length === 0)) ? (
            <div className="col-span-12 mb-8">
              <EmptyState
                title="No Evidence Found"
                description="Start by uploading your first piece of evidence to begin building your case."
                action={
                  <Button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-legal-gold-500 hover:bg-legal-gold-600 text-institutional-950"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Upload Evidence
                  </Button>
                }
              />
            </div>
          ) : null}

          {/* Evidence Grid */}
          <div className="col-span-8">
            <ErrorBoundary>
              <EvidenceTable />
            </ErrorBoundary>
          </div>

          {/* Sidebar - Case Information */}
          <div className="col-span-4">
            <ErrorBoundary fallback={<CaseSidebarSkeleton />}>
              <CaseSidebar />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}
