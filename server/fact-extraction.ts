import { logger } from "./logger";
import type { Evidence, InsertFact } from "@shared/schema";

export interface ExtractedFact {
  content: string;
  factType: string;
  confidenceScore: number;
  context?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface ExtractionConfig {
  enableAmountExtraction: boolean;
  enableDateExtraction: boolean;
  enablePersonExtraction: boolean;
  enableLocationExtraction: boolean;
  enableStatementExtraction: boolean;
  minimumConfidence: number;
}

export class FactExtractionEngine {
  private defaultConfig: ExtractionConfig = {
    enableAmountExtraction: true,
    enableDateExtraction: true,
    enablePersonExtraction: true,
    enableLocationExtraction: true,
    enableStatementExtraction: true,
    minimumConfidence: 0.6
  };

  async extractFacts(evidence: Evidence, content: string, config?: Partial<ExtractionConfig>): Promise<ExtractedFact[]> {
    const extractionConfig = { ...this.defaultConfig, ...config };
    const facts: ExtractedFact[] = [];

    logger.info('Starting fact extraction', {
      evidenceId: evidence.id,
      contentLength: content.length,
      fileType: evidence.fileType
    });

    try {
      // Extract different types of facts based on configuration
      if (extractionConfig.enableAmountExtraction) {
        facts.push(...this.extractAmounts(content));
      }

      if (extractionConfig.enableDateExtraction) {
        facts.push(...this.extractDates(content));
      }

      if (extractionConfig.enablePersonExtraction) {
        facts.push(...this.extractPersons(content));
      }

      if (extractionConfig.enableLocationExtraction) {
        facts.push(...this.extractLocations(content));
      }

      if (extractionConfig.enableStatementExtraction) {
        facts.push(...this.extractStatements(content));
      }

      // Additional specialized extraction based on evidence type
      facts.push(...this.extractSpecializedFacts(evidence, content));

      // Filter by minimum confidence
      const filteredFacts = facts.filter(fact => fact.confidenceScore >= extractionConfig.minimumConfidence);

      logger.info('Fact extraction completed', {
        evidenceId: evidence.id,
        totalFacts: facts.length,
        filteredFacts: filteredFacts.length,
        averageConfidence: facts.reduce((sum, f) => sum + f.confidenceScore, 0) / facts.length
      });

      return filteredFacts;
    } catch (error) {
      logger.error('Fact extraction failed', {
        evidenceId: evidence.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private extractAmounts(content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    // Currency patterns
    const currencyPatterns = [
      /\$([0-9,]+(?:\.[0-9]{2})?)/g,
      /USD?\s*([0-9,]+(?:\.[0-9]{2})?)/gi,
      /([0-9,]+(?:\.[0-9]{2})?\s*(?:dollars?|usd))/gi,
      /€([0-9,]+(?:\.[0-9]{2})?)/g,
      /£([0-9,]+(?:\.[0-9]{2})?)/g
    ];

    currencyPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const amount = match[1] || match[0];
        const context = this.getContext(content, match.index, 50);

        facts.push({
          content: `Amount: ${amount}`,
          factType: 'AMOUNT',
          confidenceScore: this.calculateAmountConfidence(amount, context),
          context: context,
          source: 'currency_pattern',
          metadata: {
            rawMatch: match[0],
            position: match.index
          }
        });
      }
    });

    // Percentage patterns
    const percentagePattern = /([0-9]+(?:\.[0-9]+)?\s*%)/g;
    let match;
    while ((match = percentagePattern.exec(content)) !== null) {
      const percentage = match[1];
      const context = this.getContext(content, match.index, 50);

      facts.push({
        content: `Percentage: ${percentage}`,
        factType: 'PERCENTAGE',
        confidenceScore: 0.85,
        context: context,
        source: 'percentage_pattern',
        metadata: {
          rawMatch: match[0],
          position: match.index
        }
      });
    }

    return facts;
  }

  private extractDates(content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    const datePatterns = [
      // MM/DD/YYYY, MM-DD-YYYY
      /\b([0-1]?[0-9])[\/\-]([0-3]?[0-9])[\/\-]([0-9]{4})\b/g,
      // January 1, 2024
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+([0-3]?[0-9]),?\s+([0-9]{4})\b/gi,
      // Jan 1, 2024
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+([0-3]?[0-9]),?\s+([0-9]{4})\b/gi,
      // 2024-01-01 (ISO format)
      /\b([0-9]{4})-([0-1][0-9])-([0-3][0-9])\b/g
    ];

    datePatterns.forEach((pattern, patternIndex) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const dateStr = match[0];
        const context = this.getContext(content, match.index, 50);

        facts.push({
          content: `Date: ${dateStr}`,
          factType: 'DATE',
          confidenceScore: this.calculateDateConfidence(dateStr, context),
          context: context,
          source: `date_pattern_${patternIndex}`,
          metadata: {
            rawMatch: match[0],
            position: match.index,
            patternType: patternIndex
          }
        });
      }
    });

    return facts;
  }

  private extractPersons(content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    // Common person patterns
    const personPatterns = [
      // Mr./Mrs./Dr. Title patterns
      /\b(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      // Full name patterns (First Last, First Middle Last)
      /\b([A-Z][a-z]+)\s+([A-Z]\.?\s+)?([A-Z][a-z]+)\b/g,
      // Professional titles
      /\b(Attorney|Lawyer|Judge|Clerk|Officer|Detective|Agent)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
    ];

    personPatterns.forEach((pattern, patternIndex) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const personName = match[0];
        const context = this.getContext(content, match.index, 50);

        // Skip common false positives
        if (this.isLikelyPersonName(personName)) {
          facts.push({
            content: `Person: ${personName}`,
            factType: 'PERSON',
            confidenceScore: this.calculatePersonConfidence(personName, context),
            context: context,
            source: `person_pattern_${patternIndex}`,
            metadata: {
              rawMatch: match[0],
              position: match.index,
              patternType: patternIndex
            }
          });
        }
      }
    });

    return facts;
  }

  private extractLocations(content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    // Address patterns
    const addressPattern = /\b([0-9]+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Boulevard|Blvd\.?)/gi;
    let match;
    while ((match = addressPattern.exec(content)) !== null) {
      const address = match[0];
      const context = this.getContext(content, match.index, 50);

      facts.push({
        content: `Address: ${address}`,
        factType: 'LOCATION',
        confidenceScore: 0.9,
        context: context,
        source: 'address_pattern',
        metadata: {
          rawMatch: match[0],
          position: match.index,
          streetNumber: match[1],
          streetName: match[2],
          streetType: match[3]
        }
      });
    }

    // City, State pattern
    const cityStatePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z]{2})\b/g;
    while ((match = cityStatePattern.exec(content)) !== null) {
      const location = match[0];
      const context = this.getContext(content, match.index, 50);

      facts.push({
        content: `Location: ${location}`,
        factType: 'LOCATION',
        confidenceScore: 0.85,
        context: context,
        source: 'city_state_pattern',
        metadata: {
          rawMatch: match[0],
          position: match.index,
          city: match[1],
          state: match[2]
        }
      });
    }

    return facts;
  }

  private extractStatements(content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    // Statement patterns (sentences with high factual content)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);

    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      if (this.isFactualStatement(trimmedSentence)) {
        facts.push({
          content: trimmedSentence,
          factType: 'STATEMENT',
          confidenceScore: this.calculateStatementConfidence(trimmedSentence),
          context: this.getSentenceContext(sentences, index),
          source: 'statement_analysis',
          metadata: {
            sentenceIndex: index,
            length: trimmedSentence.length
          }
        });
      }
    });

    return facts;
  }

  private extractSpecializedFacts(evidence: Evidence, content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    // Financial document patterns
    if (evidence.fileType === 'application/pdf' && evidence.evidenceTier === 'FINANCIAL_INSTITUTION') {
      facts.push(...this.extractFinancialFacts(content));
    }

    // Government document patterns
    if (evidence.evidenceTier === 'GOVERNMENT') {
      facts.push(...this.extractGovernmentFacts(content));
    }

    // Contract patterns
    if (content.toLowerCase().includes('contract') || content.toLowerCase().includes('agreement')) {
      facts.push(...this.extractContractFacts(content));
    }

    return facts;
  }

  private extractFinancialFacts(content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    // Account numbers
    const accountPattern = /\b(?:Account|Acct)\.?\s*(?:Number|No\.?|#)?\s*:?\s*([0-9\-]{8,20})\b/gi;
    let match;
    while ((match = accountPattern.exec(content)) !== null) {
      const accountNumber = match[1];
      const context = this.getContext(content, match.index, 50);

      facts.push({
        content: `Account Number: ${accountNumber}`,
        factType: 'ACCOUNT',
        confidenceScore: 0.95,
        context: context,
        source: 'financial_account',
        metadata: {
          rawMatch: match[0],
          position: match.index
        }
      });
    }

    // Transaction amounts
    const transactionPattern = /\b(?:payment|transaction|transfer|deposit|withdrawal)\s*(?:of|for)?\s*\$([0-9,]+(?:\.[0-9]{2})?)/gi;
    while ((match = transactionPattern.exec(content)) !== null) {
      const amount = match[1];
      const context = this.getContext(content, match.index, 50);

      facts.push({
        content: `Transaction Amount: $${amount}`,
        factType: 'TRANSACTION',
        confidenceScore: 0.9,
        context: context,
        source: 'financial_transaction',
        metadata: {
          rawMatch: match[0],
          position: match.index
        }
      });
    }

    return facts;
  }

  private extractGovernmentFacts(content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    // Case numbers
    const caseNumberPattern = /\b(?:Case|Docket|File)\s*(?:Number|No\.?|#)?\s*:?\s*([A-Z0-9\-]+)\b/gi;
    let match;
    while ((match = caseNumberPattern.exec(content)) !== null) {
      const caseNumber = match[1];
      const context = this.getContext(content, match.index, 50);

      facts.push({
        content: `Case Number: ${caseNumber}`,
        factType: 'CASE_NUMBER',
        confidenceScore: 0.95,
        context: context,
        source: 'government_case',
        metadata: {
          rawMatch: match[0],
          position: match.index
        }
      });
    }

    return facts;
  }

  private extractContractFacts(content: string): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    // Contract terms
    const termPattern = /\b(?:term|duration|period)\s*(?:of|is)?\s*([0-9]+)\s*(days?|months?|years?)/gi;
    let match;
    while ((match = termPattern.exec(content)) !== null) {
      const term = `${match[1]} ${match[2]}`;
      const context = this.getContext(content, match.index, 50);

      facts.push({
        content: `Contract Term: ${term}`,
        factType: 'CONTRACT_TERM',
        confidenceScore: 0.85,
        context: context,
        source: 'contract_term',
        metadata: {
          rawMatch: match[0],
          position: match.index,
          duration: match[1],
          unit: match[2]
        }
      });
    }

    return facts;
  }

  // Helper methods
  private getContext(content: string, position: number, length: number = 50): string {
    const start = Math.max(0, position - length);
    const end = Math.min(content.length, position + length);
    return content.substring(start, end).trim();
  }

  private getSentenceContext(sentences: string[], index: number): string {
    const start = Math.max(0, index - 1);
    const end = Math.min(sentences.length, index + 2);
    return sentences.slice(start, end).join('. ').trim();
  }

  private calculateAmountConfidence(amount: string, context: string): number {
    let confidence = 0.7;

    // Increase confidence for structured contexts
    if (context.toLowerCase().includes('payment') ||
        context.toLowerCase().includes('invoice') ||
        context.toLowerCase().includes('bill')) {
      confidence += 0.2;
    }

    // Decrease confidence for amounts that seem too round
    if (amount.endsWith('00.00') || amount.endsWith('000')) {
      confidence -= 0.1;
    }

    return Math.min(1.0, Math.max(0.1, confidence));
  }

  private calculateDateConfidence(dateStr: string, context: string): number {
    let confidence = 0.75;

    // Increase confidence for date contexts
    if (context.toLowerCase().includes('on') ||
        context.toLowerCase().includes('date') ||
        context.toLowerCase().includes('signed') ||
        context.toLowerCase().includes('occurred')) {
      confidence += 0.15;
    }

    return Math.min(1.0, confidence);
  }

  private calculatePersonConfidence(name: string, context: string): number {
    let confidence = 0.6;

    // Increase confidence for professional contexts
    if (context.toLowerCase().includes('attorney') ||
        context.toLowerCase().includes('judge') ||
        context.toLowerCase().includes('witness') ||
        context.toLowerCase().includes('defendant') ||
        context.toLowerCase().includes('plaintiff')) {
      confidence += 0.3;
    }

    // Increase confidence for proper name formatting
    if (/^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(name.trim())) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  private calculateStatementConfidence(statement: string): number {
    let confidence = 0.5;

    // Increase confidence for statements with factual indicators
    const factualIndicators = ['occurred', 'happened', 'stated', 'testified', 'witnessed', 'observed', 'documented'];
    factualIndicators.forEach(indicator => {
      if (statement.toLowerCase().includes(indicator)) {
        confidence += 0.1;
      }
    });

    // Increase confidence for specific details
    if (/\b[0-9]{1,2}:[0-9]{2}\b/.test(statement)) { // Time
      confidence += 0.1;
    }
    if (/\$[0-9,]+/.test(statement)) { // Money
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  private isLikelyPersonName(name: string): boolean {
    const commonFalsePositives = ['United States', 'New York', 'Los Angeles', 'Social Security'];
    return !commonFalsePositives.some(fp => name.includes(fp));
  }

  private isFactualStatement(statement: string): boolean {
    // Filter out statements that are likely questions, opinions, or procedural text
    if (statement.includes('?') ||
        statement.toLowerCase().startsWith('i think') ||
        statement.toLowerCase().startsWith('in my opinion') ||
        statement.toLowerCase().includes('page ') ||
        statement.length < 20) {
      return false;
    }

    // Look for factual indicators
    const factualIndicators = ['occurred', 'happened', 'was', 'were', 'did', 'stated', 'said', 'received', 'paid', 'signed'];
    return factualIndicators.some(indicator => statement.toLowerCase().includes(indicator));
  }
}

export const factExtractor = new FactExtractionEngine();