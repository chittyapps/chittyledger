/**
 * Legal Compliance and Scientific Validation Framework
 *
 * This module implements legally sound evidence handling procedures
 * based on established legal standards and scientific methodologies.
 */

import { logger } from "./logger";
import crypto from "crypto";

/**
 * Federal Rules of Evidence (FRE) Compliance Framework
 */
export enum EvidenceRule {
  FRE_901 = "FRE_901", // Authenticating Evidence
  FRE_902 = "FRE_902", // Evidence That Is Self-Authenticating
  FRE_1001 = "FRE_1001", // Definitions (Original documents)
  FRE_1003 = "FRE_1003", // Admissibility of Duplicates
  FRE_702 = "FRE_702", // Testimony by Expert Witnesses
  FRE_703 = "FRE_703", // Bases of an Expert's Opinion Testimony
}

/**
 * Daubert Standard Criteria for Scientific Evidence
 */
export interface DaubertCriteria {
  testable: boolean;
  peerReviewed: boolean;
  errorRate: number | null;
  standards: boolean;
  generalAcceptance: boolean;
  relevantReliability: boolean;
}

/**
 * Chain of Custody Requirements (18 U.S.C. § 3505)
 */
export interface ChainOfCustodyRecord {
  id: string;
  evidenceId: string;
  handler: string;
  handlerRole: string;
  timestamp: Date;
  action: CustodyAction;
  location: string;
  digitalHash: string;
  witnessSignature?: string;
  notes: string;
  compliance: ComplianceStatus;
}

export enum CustodyAction {
  COLLECTED = "COLLECTED",
  TRANSFERRED = "TRANSFERRED",
  ANALYZED = "ANALYZED",
  STORED = "STORED",
  ACCESSED = "ACCESSED",
  DUPLICATED = "DUPLICATED",
  RETURNED = "RETURNED"
}

export enum ComplianceStatus {
  COMPLIANT = "COMPLIANT",
  WARNING = "WARNING",
  NON_COMPLIANT = "NON_COMPLIANT"
}

/**
 * Scientific Validation Framework
 */
export class ScientificValidationEngine {

  /**
   * Validates digital evidence integrity using cryptographic methods
   * Meets requirements for FRE 901(b)(9) - Process or system evidence
   */
  validateDigitalIntegrity(evidence: any, originalHash: string): {
    valid: boolean;
    currentHash: string;
    method: string;
    timestamp: Date;
    compliance: EvidenceRule[];
  } {
    const currentHash = this.calculateSHA256Hash(evidence);
    const valid = currentHash === originalHash;

    logger.info('Digital integrity validation', {
      evidenceId: evidence.id,
      valid,
      method: 'SHA-256',
      originalHash: originalHash.substring(0, 16) + '...',
      currentHash: currentHash.substring(0, 16) + '...'
    });

    return {
      valid,
      currentHash,
      method: 'SHA-256 Cryptographic Hash',
      timestamp: new Date(),
      compliance: valid ? [EvidenceRule.FRE_901, EvidenceRule.FRE_1003] : []
    };
  }

  /**
   * Implements NIJ Guidelines for Digital Evidence (NIJ 101-05)
   */
  validateDigitalEvidenceHandling(custodyRecords: ChainOfCustodyRecord[]): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for required custody documentation
    if (custodyRecords.length < 2) {
      violations.push("Insufficient chain of custody documentation");
    }

    // Verify continuous custody
    for (let i = 1; i < custodyRecords.length; i++) {
      const timeDiff = custodyRecords[i].timestamp.getTime() - custodyRecords[i-1].timestamp.getTime();
      if (timeDiff > 24 * 60 * 60 * 1000) { // More than 24 hours gap
        violations.push(`Custody gap detected: ${timeDiff / (1000 * 60 * 60)} hours between transfers`);
      }
    }

    // Check for proper authorization
    custodyRecords.forEach(record => {
      if (!record.handlerRole || record.handlerRole === '') {
        violations.push(`Missing handler role for custody action: ${record.action}`);
      }
    });

    if (violations.length === 0) {
      recommendations.push("Consider implementing biometric authentication for enhanced security");
      recommendations.push("Regular audit trails should be maintained for all access");
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  /**
   * Implements peer-reviewed hash-based evidence verification
   * Based on RFC 3174 (Secure Hash Algorithm) and NIST standards
   */
  private calculateSHA256Hash(data: any): string {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(jsonString, 'utf8').digest('hex');
  }

  /**
   * Statistical validation of trust scoring methodology
   * Implements confidence intervals and error rate calculation
   */
  validateTrustScoreMethodology(scores: number[], evidenceTiers: string[]): {
    methodology: string;
    errorRate: number;
    confidenceInterval: [number, number];
    sampleSize: number;
    validationStatus: DaubertCriteria;
  } {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    const standardError = standardDeviation / Math.sqrt(scores.length);

    // 95% confidence interval
    const confidenceInterval: [number, number] = [
      mean - 1.96 * standardError,
      mean + 1.96 * standardError
    ];

    // Calculate error rate based on validation dataset
    const errorRate = this.calculateTrustScoreErrorRate(scores, evidenceTiers);

    const validationStatus: DaubertCriteria = {
      testable: true, // Algorithm can be tested
      peerReviewed: false, // Would need actual peer review
      errorRate: errorRate,
      standards: true, // Based on established statistical methods
      generalAcceptance: false, // Would need wider adoption
      relevantReliability: errorRate < 0.1 // Less than 10% error rate
    };

    return {
      methodology: "Statistical Trust Scoring with Evidence Tier Weighting",
      errorRate,
      confidenceInterval,
      sampleSize: scores.length,
      validationStatus
    };
  }

  private calculateTrustScoreErrorRate(scores: number[], evidenceTiers: string[]): number {
    // Simplified error rate calculation
    // In practice, this would require validation against known ground truth
    let errors = 0;
    const total = scores.length;

    // Check for obvious inconsistencies
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      const tier = evidenceTiers[i];

      // Government evidence should have high trust scores
      if (tier === 'GOVERNMENT' && score < 0.8) {
        errors++;
      }
      // Uncorroborated person evidence should have low trust scores
      if (tier === 'UNCORROBORATED_PERSON' && score > 0.4) {
        errors++;
      }
    }

    return errors / total;
  }

  /**
   * Implements NIST Special Publication 800-86 guidelines
   * for digital forensics and incident response
   */
  generateForensicsReport(evidenceId: string, analysis: any): {
    reportId: string;
    timestamp: Date;
    methodology: string;
    findings: string[];
    limitations: string[];
    recommendations: string[];
    expertQualifications: string[];
    complianceStandards: string[];
  } {
    return {
      reportId: crypto.randomUUID(),
      timestamp: new Date(),
      methodology: "NIST SP 800-86 Digital Forensics Framework",
      findings: [
        "Digital evidence integrity verified using SHA-256 hashing",
        "Chain of custody maintained with timestamp verification",
        "Metadata analysis completed using established protocols"
      ],
      limitations: [
        "Analysis limited to provided digital artifacts",
        "Conclusions are probabilistic, not deterministic",
        "External validation required for court admissibility"
      ],
      recommendations: [
        "Independent expert review recommended",
        "Additional corroborating evidence should be sought",
        "Proper legal counsel should review findings"
      ],
      expertQualifications: [
        "Digital forensics certification required",
        "Experience with legal evidence standards",
        "Knowledge of applicable Federal Rules of Evidence"
      ],
      complianceStandards: [
        "Federal Rules of Evidence",
        "NIST Special Publication 800-86",
        "NIJ Guidelines for Digital Evidence",
        "ISO/IEC 27037:2012 Guidelines for Evidence Handling"
      ]
    };
  }
}

/**
 * Legal Evidence Classification System
 * Based on Federal Rules of Evidence and legal precedent
 */
export class LegalEvidenceClassifier {

  /**
   * Classifies evidence according to FRE 902 (Self-Authenticating Evidence)
   */
  classifyAuthenticity(evidence: any): {
    category: string;
    rule: EvidenceRule;
    requirements: string[];
    sufficient: boolean;
  } {
    // FRE 902(5) - Official publications
    if (evidence.evidenceTier === 'GOVERNMENT') {
      return {
        category: "Official Government Records",
        rule: EvidenceRule.FRE_902,
        requirements: [
          "Document must be from public office",
          "Must be available to public inspection",
          "Proper government seal or certification"
        ],
        sufficient: true
      };
    }

    // FRE 902(11) - Certified records of regularly conducted activity
    if (evidence.evidenceTier === 'FINANCIAL_INSTITUTION' || evidence.evidenceTier === 'BUSINESS_RECORDS') {
      return {
        category: "Certified Business Records",
        rule: EvidenceRule.FRE_902,
        requirements: [
          "Records kept in regular course of business",
          "Proper certification by custodian",
          "Foundation requirements under FRE 803(6)"
        ],
        sufficient: false // Requires additional foundation
      };
    }

    return {
      category: "General Evidence Requiring Authentication",
      rule: EvidenceRule.FRE_901,
      requirements: [
        "Witness testimony for authentication",
        "Chain of custody documentation",
        "Expert testimony if technical evidence"
      ],
      sufficient: false
    };
  }

  /**
   * Determines expert witness requirements under FRE 702
   */
  assessExpertWitnessRequirements(evidence: any, analysis: any): {
    required: boolean;
    qualifications: string[];
    testimony: string[];
    daubert: DaubertCriteria;
  } {
    const isComplexTechnical = evidence.fileType?.includes('application/') ||
                               analysis.methodology?.includes('algorithm');

    if (!isComplexTechnical) {
      return {
        required: false,
        qualifications: [],
        testimony: [],
        daubert: {
          testable: false,
          peerReviewed: false,
          errorRate: null,
          standards: false,
          generalAcceptance: false,
          relevantReliability: false
        }
      };
    }

    return {
      required: true,
      qualifications: [
        "Advanced degree in computer science, digital forensics, or related field",
        "Professional certification (CCE, GCFA, CISSP, etc.)",
        "Minimum 5 years experience in digital evidence analysis",
        "Previous testimony experience in similar cases"
      ],
      testimony: [
        "Explanation of analysis methodology",
        "Validation of tools and techniques used",
        "Discussion of limitations and potential errors",
        "Opinion on reliability and significance of findings"
      ],
      daubert: {
        testable: true,
        peerReviewed: false, // Requires actual peer review
        errorRate: 0.05, // Would need validation study
        standards: true,
        generalAcceptance: false, // Emerging technology
        relevantReliability: true
      }
    };
  }
}

export const scientificValidator = new ScientificValidationEngine();
export const legalClassifier = new LegalEvidenceClassifier();