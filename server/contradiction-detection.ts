import { logger } from "./logger";
import type { Evidence, AtomicFact, Contradiction } from "@shared/schema";
import { randomUUID } from "crypto";

export interface ContradictionResult {
  type: ContradictionType;
  severity: ContradictionSeverity;
  description: string;
  confidence: number;
  evidence1Id: string;
  evidence2Id: string;
  metadata?: Record<string, any>;
}

export enum ContradictionType {
  TEMPORAL = 'TEMPORAL',           // Time-based contradictions
  FACTUAL = 'FACTUAL',            // Direct factual conflicts
  NUMERICAL = 'NUMERICAL',         // Number discrepancies
  IDENTITY = 'IDENTITY',           // Person/entity conflicts
  LOCATION = 'LOCATION',           // Location conflicts
  LOGICAL = 'LOGICAL',             // Logical impossibilities
  CAUSAL = 'CAUSAL',              // Cause-effect conflicts
  METADATA = 'METADATA'            // File/metadata conflicts
}

export enum ContradictionSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ComparisonContext {
  evidence1: Evidence;
  evidence2: Evidence;
  facts1: AtomicFact[];
  facts2: AtomicFact[];
  content1?: string;
  content2?: string;
}

export class ContradictionDetectionEngine {
  private minimumConfidence = 0.7;
  private temporalToleranceHours = 1; // Allow 1 hour difference for temporal events

  async detectContradictions(
    evidence1: Evidence,
    evidence2: Evidence,
    facts1: AtomicFact[],
    facts2: AtomicFact[],
    content1?: string,
    content2?: string
  ): Promise<ContradictionResult[]> {
    const context: ComparisonContext = {
      evidence1,
      evidence2,
      facts1,
      facts2,
      content1,
      content2
    };

    logger.info('Starting contradiction detection', {
      evidence1Id: evidence1.id,
      evidence2Id: evidence2.id,
      facts1Count: facts1.length,
      facts2Count: facts2.length
    });

    const contradictions: ContradictionResult[] = [];

    try {
      // Temporal contradictions
      contradictions.push(...this.detectTemporalContradictions(context));

      // Factual contradictions
      contradictions.push(...this.detectFactualContradictions(context));

      // Numerical contradictions
      contradictions.push(...this.detectNumericalContradictions(context));

      // Identity contradictions
      contradictions.push(...this.detectIdentityContradictions(context));

      // Location contradictions
      contradictions.push(...this.detectLocationContradictions(context));

      // Logical contradictions
      contradictions.push(...this.detectLogicalContradictions(context));

      // Metadata contradictions
      contradictions.push(...this.detectMetadataContradictions(context));

      // Filter by confidence threshold
      const significantContradictions = contradictions.filter(
        c => c.confidence >= this.minimumConfidence
      );

      logger.info('Contradiction detection completed', {
        evidence1Id: evidence1.id,
        evidence2Id: evidence2.id,
        totalContradictions: contradictions.length,
        significantContradictions: significantContradictions.length,
        averageConfidence: contradictions.reduce((sum, c) => sum + c.confidence, 0) / contradictions.length || 0
      });

      return significantContradictions;
    } catch (error) {
      logger.error('Contradiction detection failed', {
        evidence1Id: evidence1.id,
        evidence2Id: evidence2.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private detectTemporalContradictions(context: ComparisonContext): ContradictionResult[] {
    const contradictions: ContradictionResult[] = [];

    // Extract date facts from both evidence sets
    const dates1 = context.facts1.filter(f => f.factType === 'DATE');
    const dates2 = context.facts2.filter(f => f.factType === 'DATE');

    dates1.forEach(date1 => {
      dates2.forEach(date2 => {
        const contradiction = this.compareTemporalFacts(date1, date2, context);
        if (contradiction) {
          contradictions.push(contradiction);
        }
      });
    });

    // Check for impossible temporal sequences
    contradictions.push(...this.detectImpossibleSequences(context));

    return contradictions;
  }

  private detectFactualContradictions(context: ComparisonContext): ContradictionResult[] {
    const contradictions: ContradictionResult[] = [];

    // Compare statement facts
    const statements1 = context.facts1.filter(f => f.factType === 'STATEMENT');
    const statements2 = context.facts2.filter(f => f.factType === 'STATEMENT');

    statements1.forEach(stmt1 => {
      statements2.forEach(stmt2 => {
        const contradiction = this.compareStatements(stmt1, stmt2, context);
        if (contradiction) {
          contradictions.push(contradiction);
        }
      });
    });

    return contradictions;
  }

  private detectNumericalContradictions(context: ComparisonContext): ContradictionResult[] {
    const contradictions: ContradictionResult[] = [];

    // Compare amount facts
    const amounts1 = context.facts1.filter(f => f.factType === 'AMOUNT' || f.factType === 'TRANSACTION');
    const amounts2 = context.facts2.filter(f => f.factType === 'AMOUNT' || f.factType === 'TRANSACTION');

    amounts1.forEach(amount1 => {
      amounts2.forEach(amount2 => {
        const contradiction = this.compareNumericalFacts(amount1, amount2, context);
        if (contradiction) {
          contradictions.push(contradiction);
        }
      });
    });

    return contradictions;
  }

  private detectIdentityContradictions(context: ComparisonContext): ContradictionResult[] {
    const contradictions: ContradictionResult[] = [];

    // Compare person facts
    const persons1 = context.facts1.filter(f => f.factType === 'PERSON');
    const persons2 = context.facts2.filter(f => f.factType === 'PERSON');

    // Check for conflicting identities in same role
    contradictions.push(...this.detectRoleConflicts(persons1, persons2, context));

    return contradictions;
  }

  private detectLocationContradictions(context: ComparisonContext): ContradictionResult[] {
    const contradictions: ContradictionResult[] = [];

    // Compare location facts
    const locations1 = context.facts1.filter(f => f.factType === 'LOCATION');
    const locations2 = context.facts2.filter(f => f.factType === 'LOCATION');

    locations1.forEach(loc1 => {
      locations2.forEach(loc2 => {
        const contradiction = this.compareLocations(loc1, loc2, context);
        if (contradiction) {
          contradictions.push(contradiction);
        }
      });
    });

    return contradictions;
  }

  private detectLogicalContradictions(context: ComparisonContext): ContradictionResult[] {
    const contradictions: ContradictionResult[] = [];

    // Check for logical impossibilities
    contradictions.push(...this.detectPhysicalImpossibilities(context));
    contradictions.push(...this.detectCausalImpossibilities(context));

    return contradictions;
  }

  private detectMetadataContradictions(context: ComparisonContext): ContradictionResult[] {
    const contradictions: ContradictionResult[] = [];

    const { evidence1, evidence2 } = context;

    // Check trust score inconsistencies
    if (this.shouldHaveSimilarTrustScores(evidence1, evidence2)) {
      const trust1 = parseFloat(evidence1.trustScore);
      const trust2 = parseFloat(evidence2.trustScore);
      const difference = Math.abs(trust1 - trust2);

      if (difference > 0.3) { // 30% difference threshold
        contradictions.push({
          type: ContradictionType.METADATA,
          severity: ContradictionSeverity.MEDIUM,
          description: `Significant trust score discrepancy: ${evidence1.trustScore} vs ${evidence2.trustScore}`,
          confidence: 0.8,
          evidence1Id: evidence1.id,
          evidence2Id: evidence2.id,
          metadata: {
            trustScore1: trust1,
            trustScore2: trust2,
            difference: difference
          }
        });
      }
    }

    // Check upload time inconsistencies
    const timeDiff = Math.abs(evidence1.uploadedAt.getTime() - evidence2.uploadedAt.getTime());
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 1 && evidence1.uploadedBy === evidence2.uploadedBy) {
      // Same person uploading conflicting evidence within an hour
      contradictions.push({
        type: ContradictionType.METADATA,
        severity: ContradictionSeverity.HIGH,
        description: 'Same user uploaded potentially conflicting evidence within one hour',
        confidence: 0.75,
        evidence1Id: evidence1.id,
        evidence2Id: evidence2.id,
        metadata: {
          uploadTimeDiff: hoursDiff,
          uploadedBy: evidence1.uploadedBy
        }
      });
    }

    return contradictions;
  }

  // Specific comparison methods
  private compareTemporalFacts(fact1: AtomicFact, fact2: AtomicFact, context: ComparisonContext): ContradictionResult | null {
    const date1 = this.parseDate(fact1.content);
    const date2 = this.parseDate(fact2.content);

    if (!date1 || !date2) return null;

    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Check if these facts should refer to the same event
    if (this.shouldBeSimultaneous(fact1, fact2, context) && hoursDiff > this.temporalToleranceHours) {
      return {
        type: ContradictionType.TEMPORAL,
        severity: this.calculateTemporalSeverity(hoursDiff),
        description: `Temporal impossibility: Events cannot occur at different times - ${fact1.content} vs ${fact2.content}`,
        confidence: 0.9,
        evidence1Id: context.evidence1.id,
        evidence2Id: context.evidence2.id,
        metadata: {
          fact1: fact1.content,
          fact2: fact2.content,
          timeDifferenceHours: hoursDiff
        }
      };
    }

    return null;
  }

  private compareStatements(stmt1: AtomicFact, stmt2: AtomicFact, context: ComparisonContext): ContradictionResult | null {
    const content1 = stmt1.content.toLowerCase();
    const content2 = stmt2.content.toLowerCase();

    // Check for direct negation patterns
    const negationPairs = [
      ['did', 'did not'],
      ['was', 'was not'],
      ['will', 'will not'],
      ['can', 'cannot'],
      ['present', 'absent'],
      ['guilty', 'innocent'],
      ['true', 'false']
    ];

    for (const [positive, negative] of negationPairs) {
      if ((content1.includes(positive) && content2.includes(negative)) ||
          (content1.includes(negative) && content2.includes(positive))) {
        return {
          type: ContradictionType.FACTUAL,
          severity: ContradictionSeverity.HIGH,
          description: `Direct factual contradiction detected: "${stmt1.content}" vs "${stmt2.content}"`,
          confidence: 0.85,
          evidence1Id: context.evidence1.id,
          evidence2Id: context.evidence2.id,
          metadata: {
            statement1: stmt1.content,
            statement2: stmt2.content,
            contradictionType: 'negation'
          }
        };
      }
    }

    // Semantic similarity with opposite meaning
    const similarity = this.calculateSemanticSimilarity(content1, content2);
    if (similarity > 0.7 && this.hasOppositeImplication(content1, content2)) {
      return {
        type: ContradictionType.FACTUAL,
        severity: ContradictionSeverity.MEDIUM,
        description: `Semantic contradiction detected: "${stmt1.content}" vs "${stmt2.content}"`,
        confidence: 0.75,
        evidence1Id: context.evidence1.id,
        evidence2Id: context.evidence2.id,
        metadata: {
          statement1: stmt1.content,
          statement2: stmt2.content,
          similarity: similarity
        }
      };
    }

    return null;
  }

  private compareNumericalFacts(fact1: AtomicFact, fact2: AtomicFact, context: ComparisonContext): ContradictionResult | null {
    const amount1 = this.extractNumber(fact1.content);
    const amount2 = this.extractNumber(fact2.content);

    if (amount1 === null || amount2 === null) return null;

    // Check if these amounts should be the same
    if (this.shouldBeEqualAmounts(fact1, fact2, context)) {
      const difference = Math.abs(amount1 - amount2);
      const percentDiff = (difference / Math.max(amount1, amount2)) * 100;

      if (percentDiff > 5) { // 5% difference threshold
        return {
          type: ContradictionType.NUMERICAL,
          severity: percentDiff > 50 ? ContradictionSeverity.HIGH : ContradictionSeverity.MEDIUM,
          description: `Numerical discrepancy: ${fact1.content} vs ${fact2.content} (${percentDiff.toFixed(1)}% difference)`,
          confidence: 0.9,
          evidence1Id: context.evidence1.id,
          evidence2Id: context.evidence2.id,
          metadata: {
            amount1: amount1,
            amount2: amount2,
            difference: difference,
            percentDifference: percentDiff
          }
        };
      }
    }

    return null;
  }

  private compareLocations(loc1: AtomicFact, loc2: AtomicFact, context: ComparisonContext): ContradictionResult | null {
    const location1 = loc1.content.toLowerCase();
    const location2 = loc2.content.toLowerCase();

    // Check for same event at different locations
    if (this.shouldBeSameLocation(loc1, loc2, context) && !this.areLocationsSimilar(location1, location2)) {
      return {
        type: ContradictionType.LOCATION,
        severity: ContradictionSeverity.HIGH,
        description: `Location contradiction: Same event reported at different locations - ${loc1.content} vs ${loc2.content}`,
        confidence: 0.8,
        evidence1Id: context.evidence1.id,
        evidence2Id: context.evidence2.id,
        metadata: {
          location1: loc1.content,
          location2: loc2.content
        }
      };
    }

    return null;
  }

  // Helper methods
  private parseDate(content: string): Date | null {
    // Extract date from fact content
    const dateMatch = content.match(/\b([0-9]{1,2})[\/\-]([0-9]{1,2})[\/\-]([0-9]{4})\b/);
    if (dateMatch) {
      return new Date(parseInt(dateMatch[3]), parseInt(dateMatch[1]) - 1, parseInt(dateMatch[2]));
    }

    // Try other date formats
    const isoMatch = content.match(/\b([0-9]{4})-([0-9]{2})-([0-9]{2})\b/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }

    return null;
  }

  private extractNumber(content: string): number | null {
    const numMatch = content.match(/[\$]?([0-9,]+(?:\.[0-9]{2})?)/);
    if (numMatch) {
      return parseFloat(numMatch[1].replace(/,/g, ''));
    }
    return null;
  }

  private shouldBeSimultaneous(fact1: AtomicFact, fact2: AtomicFact, context: ComparisonContext): boolean {
    // Check if facts should refer to the same temporal event
    const content1 = fact1.content.toLowerCase();
    const content2 = fact2.content.toLowerCase();

    const simultaneousIndicators = ['payment', 'signature', 'meeting', 'incident', 'accident'];
    return simultaneousIndicators.some(indicator =>
      content1.includes(indicator) && content2.includes(indicator)
    );
  }

  private shouldBeEqualAmounts(fact1: AtomicFact, fact2: AtomicFact, context: ComparisonContext): boolean {
    // Check if amounts should be the same (e.g., same transaction from different sources)
    const content1 = fact1.content.toLowerCase();
    const content2 = fact2.content.toLowerCase();

    return (content1.includes('payment') && content2.includes('payment')) ||
           (content1.includes('invoice') && content2.includes('invoice')) ||
           (content1.includes('amount') && content2.includes('amount'));
  }

  private shouldBeSameLocation(loc1: AtomicFact, loc2: AtomicFact, context: ComparisonContext): boolean {
    // Check if locations should be the same for the same event
    return true; // Simplified - would need more context analysis
  }

  private areLocationsSimilar(loc1: string, loc2: string): boolean {
    // Simple similarity check - could be enhanced with geocoding
    const normalized1 = loc1.replace(/\b(street|st|avenue|ave|road|rd)\b/gi, '').trim();
    const normalized2 = loc2.replace(/\b(street|st|avenue|ave|road|rd)\b/gi, '').trim();

    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }

  private calculateSemanticSimilarity(text1: string, text2: string): number {
    // Simplified semantic similarity - could use NLP libraries
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));

    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);

    return intersection.size / union.size;
  }

  private hasOppositeImplication(text1: string, text2: string): boolean {
    // Check for opposite implications
    const oppositeWords = [
      ['present', 'absent'],
      ['alive', 'dead'],
      ['guilty', 'innocent'],
      ['before', 'after'],
      ['inside', 'outside']
    ];

    return oppositeWords.some(([word1, word2]) =>
      (text1.includes(word1) && text2.includes(word2)) ||
      (text1.includes(word2) && text2.includes(word1))
    );
  }

  private shouldHaveSimilarTrustScores(evidence1: Evidence, evidence2: Evidence): boolean {
    return evidence1.evidenceTier === evidence2.evidenceTier &&
           evidence1.caseId === evidence2.caseId;
  }

  private calculateTemporalSeverity(hoursDiff: number): ContradictionSeverity {
    if (hoursDiff > 24 * 365) return ContradictionSeverity.CRITICAL; // More than a year
    if (hoursDiff > 24 * 30) return ContradictionSeverity.HIGH;      // More than a month
    if (hoursDiff > 24) return ContradictionSeverity.MEDIUM;         // More than a day
    return ContradictionSeverity.LOW;
  }

  private detectImpossibleSequences(context: ComparisonContext): ContradictionResult[] {
    // Detect logically impossible temporal sequences
    return [];
  }

  private detectRoleConflicts(persons1: AtomicFact[], persons2: AtomicFact[], context: ComparisonContext): ContradictionResult[] {
    // Detect conflicts in person roles
    return [];
  }

  private detectPhysicalImpossibilities(context: ComparisonContext): ContradictionResult[] {
    // Detect physical impossibilities
    return [];
  }

  private detectCausalImpossibilities(context: ComparisonContext): ContradictionResult[] {
    // Detect causal impossibilities
    return [];
  }
}

export const contradictionDetector = new ContradictionDetectionEngine();