import { TrendingUp, Shield, Clock, Link, Users, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

interface ChittyTrustScoringProps {
  evidence: any;
}

export default function ChittyTrustScoring({ evidence }: ChittyTrustScoringProps) {
  const { data: chittyScore } = useQuery({
    queryKey: [`/api/evidence/${evidence.id}/chittytrust-score`]
  });

  const scoreValue = chittyScore?.score ? parseFloat(chittyScore.score) * 100 : parseFloat(evidence.chittytrustScore) * 100;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600";
    if (score >= 70) return "text-legal-gold-600";
    if (score >= 50) return "text-yellow-600";
    return "text-forensic-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-emerald-500 to-emerald-400";
    if (score >= 70) return "from-legal-gold-500 to-legal-gold-400";
    if (score >= 50) return "from-yellow-500 to-yellow-400";
    return "from-forensic-red-500 to-forensic-red-400";
  };

  // 6D Trust Revolution metrics
  const trustMetrics = [
    { name: "Source", icon: Shield, value: 85, description: "Evidence tier reliability" },
    { name: "Time", icon: Clock, value: 92, description: "Recency and relevance" },
    { name: "Chain", icon: Link, value: 78, description: "Custody integrity" },
    { name: "Network", icon: Users, value: evidence.corroborationCount * 20, description: "Corroboration strength" },
    { name: "Outcomes", icon: TrendingUp, value: 88, description: "Historical accuracy" },
    { name: "Justice", icon: Scale, value: 90, description: "Fairness assessment" }
  ];

  return (
    <div className="bg-institutional-50 rounded-xl p-6 shadow-sm border border-institutional-200" data-testid="chittytrust-scoring">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-legal text-lg text-institutional-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
          ChittyTrust Score
        </h3>
        <Badge className="bg-emerald-100 text-emerald-800">
          6D EVALUATION
        </Badge>
      </div>

      {/* Main Score Display */}
      <div className="text-center mb-8">
        <div className={`text-5xl font-tech font-bold mb-2 ${getScoreColor(scoreValue)}`}>
          {scoreValue.toFixed(0)}
        </div>
        <div className="text-institutional-600 text-sm mb-4">ChittyTrust Reliability Score</div>
        
        <div className="h-4 bg-institutional-200 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-1000 bg-gradient-to-r ${getScoreGradient(scoreValue)}`}
            style={{ width: `${scoreValue}%` }}
          />
        </div>
        <div className="text-xs text-institutional-500">
          Based on 6D Trust Revolution framework
        </div>
      </div>

      {/* 6D Trust Metrics */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-institutional-700 text-sm uppercase tracking-wide">
          Trust Dimensions
        </h4>
        {trustMetrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <metric.icon className="w-4 h-4 text-institutional-500" />
              <div>
                <div className="font-medium text-institutional-700 text-sm">{metric.name}</div>
                <div className="text-xs text-institutional-500">{metric.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold text-sm ${getScoreColor(metric.value)}`}>
                {Math.min(100, metric.value)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Distinction */}
      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div className="text-sm text-emerald-800">
            <strong>ChittyTrust vs Blockchain:</strong> This score evaluates evidence quality and reliability 
            using our 6D framework. It's separate from blockchain minting criteria, which focuses on 
            permanence eligibility.
          </div>
        </div>
      </div>
    </div>
  );
}