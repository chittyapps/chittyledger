import { Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface MintingEligibilityProps {
  evidenceId: string;
}

export default function MintingEligibility({ evidenceId }: MintingEligibilityProps) {
  const { data: eligibility, isLoading } = useQuery({
    queryKey: [`/api/evidence/${evidenceId}/minting-eligibility`]
  });

  if (isLoading) {
    return <div className="animate-pulse bg-institutional-100 rounded-xl h-48" />;
  }

  if (!eligibility) {
    return null;
  }

  const scorePercent = parseFloat(eligibility.score) * 100;
  const isEligible = eligibility.eligible;

  return (
    <div className="bg-institutional-50 rounded-xl p-6 shadow-sm border border-institutional-200" data-testid="minting-eligibility">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-legal text-lg text-institutional-900 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-legal-gold-600" />
          Minting Eligibility
        </h3>
        <Badge className={isEligible ? 'bg-legal-gold-100 text-legal-gold-800' : 'bg-forensic-red-100 text-forensic-red-800'}>
          {isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
        </Badge>
      </div>

      {/* Score Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-institutional-600">Minting Score</span>
          <span className="font-tech text-lg font-bold text-legal-gold-600">
            {scorePercent.toFixed(0)}%
          </span>
        </div>
        <div className="h-3 bg-institutional-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              scorePercent >= 70 ? 'bg-gradient-to-r from-legal-gold-500 to-legal-gold-400' : 
              scorePercent >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
              'bg-gradient-to-r from-forensic-red-500 to-forensic-red-400'
            }`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
        <div className="text-xs text-institutional-500 mt-1">
          Minimum 70% required for minting
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-3 mb-6">
        {eligibility.reasons.map((reason: string, index: number) => {
          const isPositive = reason.startsWith('✓');
          const isNegative = reason.startsWith('✗');
          
          return (
            <div key={index} className="flex items-center space-x-3">
              {isPositive && <CheckCircle className="w-4 h-4 text-legal-gold-500" />}
              {isNegative && <XCircle className="w-4 h-4 text-forensic-red-500" />}
              {!isPositive && !isNegative && <AlertCircle className="w-4 h-4 text-institutional-400" />}
              <span className={`text-sm ${
                isPositive ? 'text-institutional-700' : 
                isNegative ? 'text-forensic-red-600' : 
                'text-institutional-500'
              }`}>
                {reason.replace(/^[✓✗]\s*/, '')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-institutional-200">
        {isEligible ? (
          <Button 
            className="w-full bg-legal-gold-500 hover:bg-legal-gold-600 text-white"
            data-testid="button-mint-evidence"
          >
            <Shield className="w-4 h-4 mr-2" />
            Mint to Blockchain
          </Button>
        ) : (
          <div className="text-center">
            <p className="text-sm text-institutional-600 mb-2">
              Evidence must meet minimum requirements before minting
            </p>
            <Button 
              variant="outline"
              className="text-institutional-500 border-institutional-300"
              disabled
            >
              Requirements Not Met
            </Button>
          </div>
        )}
      </div>

      {/* Key Insight */}
      <div className="mt-4 p-4 bg-legal-gold-50 rounded-lg border border-legal-gold-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-legal-gold-600 mt-0.5" />
          <div className="text-sm text-legal-gold-800">
            <strong>Minting Requirements:</strong> Only high-quality evidence with sufficient corroboration, 
            proper verification, and minimal conflicts can be minted to preserve blockchain integrity.
          </div>
        </div>
      </div>
    </div>
  );
}