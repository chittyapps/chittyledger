import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Evidence } from "@shared/schema";

function matchesQuery(evidence: Evidence, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    evidence.filename,
    evidence.description ?? "",
    evidence.artifactId ?? "",
    evidence.evidenceTier ?? "",
    evidence.status ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export default function Search() {
  const [query, setQuery] = useState("");
  const { data, isLoading, error } = useQuery<Evidence[]>({
    queryKey: ["/api/evidence"],
  });

  const evidenceList = Array.isArray(data) ? data : [];
  const results = useMemo(() => {
    if (!query.trim()) {
      return evidenceList.slice(0, 6);
    }

    return evidenceList.filter((item) => matchesQuery(item, query)).slice(0, 12);
  }, [evidenceList, query]);

  return (
    <section className="py-24 bg-slate-950 min-h-screen">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-slate-50 mb-3">Evidence Search</h2>
            <p className="text-slate-400 max-w-2xl">
              Instantly surface ledger-qualified evidence with tier, status, and custody context pulled directly from ChittyChain.
            </p>
          </div>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="relative mb-8">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by artifact ID, filename, or description..."
              className="pl-12 pr-4 py-6 text-lg bg-slate-950/70 border-slate-800 text-slate-100"
            />
          </div>

          {error && (
            <Card className="bg-red-900/20 border-red-500/40 text-red-200 mb-6">
              <CardHeader>
                <CardTitle className="text-red-100 text-lg">Search unavailable</CardTitle>
                <CardDescription className="text-red-200">
                  We could not load evidence data. Please refresh the page or try again later.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-32 rounded-xl bg-slate-800/60 animate-pulse" />
              ))}

            {!isLoading && results.length === 0 && (
              <Card className="bg-slate-900/70 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100 text-xl">No evidence found</CardTitle>
                  <CardDescription className="text-slate-400">
                    Try refining your search terms or removing filters to broaden the results.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {results.map((item) => (
              <Card key={item.id} className="bg-slate-900/70 border-slate-800 hover:border-emerald-400/50 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-slate-100 text-xl mb-1">{item.filename}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {item.description ?? "No description provided"}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`uppercase tracking-wide ${
                        item.status === "MINTED"
                          ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/40"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {item.status ?? "Unknown"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Artifact ID</span>
                    <span className="font-mono text-slate-200">{item.artifactId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Evidence Tier</span>
                    <span>{item.evidenceTier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Trust Score</span>
                    <span>{item.trustScore}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
