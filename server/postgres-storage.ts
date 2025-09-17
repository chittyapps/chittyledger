import { eq, desc } from "drizzle-orm";
import { getDatabase } from "./db";
import {
  users,
  cases,
  masterEvidence,
  atomicFacts,
  chainOfCustodyLog,
  contradictions,
  type User,
  type InsertUser,
  type Case,
  type InsertCase,
  type Evidence,
  type InsertEvidence,
  type AtomicFact,
  type InsertFact,
  type ChainOfCustody,
  type Contradiction,
  type EvidenceTier
} from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

export class PostgreSQLStorage implements IStorage {
  private db;

  constructor() {
    const database = getDatabase();
    if (!database) {
      throw new Error("PostgreSQL database not initialized");
    }
    this.db = database;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      ...user,
      id: randomUUID(),
      role: user.role || 'attorney',
      createdAt: new Date(),
    };

    await this.db.insert(users).values(newUser);
    return newUser as User;
  }

  // Cases
  async getCase(id: string): Promise<Case | undefined> {
    const result = await this.db.select().from(cases).where(eq(cases.id, id)).limit(1);
    return result[0];
  }

  async getCases(): Promise<Case[]> {
    return await this.db.select().from(cases).orderBy(desc(cases.createdAt));
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const newCase = {
      ...caseData,
      description: caseData.description || null,
      parties: caseData.parties || null,
      nextHearing: caseData.nextHearing || null,
      courtroom: caseData.courtroom || null,
      judge: caseData.judge || null,
      attorneyId: caseData.attorneyId || null,
      id: randomUUID(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(cases).values(newCase);
    return newCase as Case;
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | undefined> {
    const updatedData = { ...updates, updatedAt: new Date() };
    await this.db.update(cases).set(updatedData).where(eq(cases.id, id));
    return await this.getCase(id);
  }

  // Evidence
  async getEvidence(id: string): Promise<Evidence | undefined> {
    const result = await this.db.select().from(masterEvidence).where(eq(masterEvidence.id, id)).limit(1);
    return result[0];
  }

  async getEvidenceByCase(caseId: string): Promise<Evidence[]> {
    return await this.db.select().from(masterEvidence)
      .where(eq(masterEvidence.caseId, caseId))
      .orderBy(desc(masterEvidence.uploadedAt));
  }

  async getAllEvidence(): Promise<Evidence[]> {
    return await this.db.select().from(masterEvidence).orderBy(desc(masterEvidence.uploadedAt));
  }

  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const evidenceCount = await this.db.select().from(masterEvidence);
    const artifactCounter = evidenceCount.length + 1;
    const originalTrust = this.calculateTrustScore(evidenceData.evidenceTier as EvidenceTier);

    const newEvidence = {
      ...evidenceData,
      description: evidenceData.description || null,
      fileSize: evidenceData.fileSize || null,
      caseId: evidenceData.caseId || null,
      id: randomUUID(),
      artifactId: `ART-${artifactCounter.toString().padStart(6, '0')}`,
      trustScore: originalTrust,
      originalTrustScore: originalTrust,
      status: "PENDING",
      blockNumber: null,
      hashValue: null,
      mintedAt: null,
      trustDegradationRate: "0.0001",
      lastTrustUpdate: new Date(),
      corroborationCount: 0,
      conflictCount: 0,
      mintingEligible: false,
      mintingScore: "0.00",
      chittytrustScore: "0.00",
      uploadedBy: evidenceData.caseId || null,
      uploadedAt: new Date(),
      verifiedAt: null,
    };

    await this.db.insert(masterEvidence).values(newEvidence);
    return newEvidence as Evidence;
  }

  async updateEvidence(id: string, updates: Partial<Evidence>): Promise<Evidence | undefined> {
    await this.db.update(masterEvidence).set(updates).where(eq(masterEvidence.id, id));
    return await this.getEvidence(id);
  }

  // Atomic Facts
  async getFactsByEvidence(evidenceId: string): Promise<AtomicFact[]> {
    return await this.db.select().from(atomicFacts)
      .where(eq(atomicFacts.evidenceId, evidenceId))
      .orderBy(desc(atomicFacts.extractedAt));
  }

  async createFact(factData: InsertFact): Promise<AtomicFact> {
    const factCount = await this.db.select().from(atomicFacts);
    const factCounter = factCount.length + 1;

    const newFact = {
      ...factData,
      evidenceId: factData.evidenceId || null,
      id: randomUUID(),
      factId: `FACT-${factCounter.toString().padStart(4, '0')}`,
      extractedAt: new Date(),
      verifiedAt: null,
    };

    await this.db.insert(atomicFacts).values(newFact);
    return newFact as AtomicFact;
  }

  // Chain of Custody
  async getChainOfCustody(evidenceId: string): Promise<ChainOfCustody[]> {
    return await this.db.select().from(chainOfCustodyLog)
      .where(eq(chainOfCustodyLog.evidenceId, evidenceId))
      .orderBy(chainOfCustodyLog.timestamp);
  }

  async addChainOfCustodyEntry(entryData: Omit<ChainOfCustody, 'id'>): Promise<ChainOfCustody> {
    const newEntry = {
      ...entryData,
      id: randomUUID(),
    };

    await this.db.insert(chainOfCustodyLog).values(newEntry);
    return newEntry as ChainOfCustody;
  }

  // Contradictions
  async getContradictions(): Promise<Contradiction[]> {
    return await this.db.select().from(contradictions).orderBy(desc(contradictions.detectedAt));
  }

  async getActiveContradictions(): Promise<Contradiction[]> {
    return await this.db.select().from(contradictions)
      .where(eq(contradictions.status, 'active'))
      .orderBy(desc(contradictions.detectedAt));
  }

  // Helper methods from MemStorage
  private calculateTrustScore(tier: EvidenceTier): string {
    const scores: Record<EvidenceTier, number> = {
      'SELF_AUTHENTICATING': 0.99,
      'GOVERNMENT': 0.95,
      'FINANCIAL_INSTITUTION': 0.90,
      'INDEPENDENT_THIRD_PARTY': 0.80,
      'BUSINESS_RECORDS': 0.70,
      'FIRST_PARTY_ADVERSE': 0.60,
      'FIRST_PARTY_FRIENDLY': 0.40,
      'UNCORROBORATED_PERSON': 0.20,
    };
    return scores[tier].toFixed(2);
  }

  // Trust and minting methods - simplified versions for now
  async calculateCurrentTrustScore(evidenceId: string): Promise<string> {
    const evidence = await this.getEvidence(evidenceId);
    if (!evidence) return "0.00";

    if (evidence.status === "MINTED" && evidence.mintedAt) {
      return evidence.trustScore;
    }

    const now = new Date();
    const lastUpdate = evidence.lastTrustUpdate;
    const hoursElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    const originalTrust = parseFloat(evidence.originalTrustScore);
    const degradationRate = parseFloat(evidence.trustDegradationRate || "0.0001");

    const currentTrust = Math.max(0, originalTrust - (degradationRate * hoursElapsed));
    return currentTrust.toFixed(2);
  }

  async verifyEvidence(evidenceId: string): Promise<Evidence | undefined> {
    const updates = {
      status: "VERIFIED" as const,
      verifiedAt: new Date(),
      lastTrustUpdate: new Date(),
    };

    const updatedEvidence = await this.updateEvidence(evidenceId, updates);

    if (updatedEvidence) {
      await this.addChainOfCustodyEntry({
        evidenceId,
        action: "VERIFIED",
        performedBy: updatedEvidence.uploadedBy!,
        timestamp: new Date(),
        location: "Legal Platform",
        notes: "Evidence verified - trust can begin degrading",
        hashBefore: updatedEvidence.hashValue,
        hashAfter: updatedEvidence.hashValue,
      });
    }

    return updatedEvidence;
  }

  async mintEvidence(evidenceId: string, blockNumber: string, hashValue: string): Promise<Evidence | undefined> {
    const currentTrust = await this.calculateCurrentTrustScore(evidenceId);

    const updates = {
      status: "MINTED" as const,
      blockNumber,
      hashValue,
      mintedAt: new Date(),
      trustScore: currentTrust,
      trustDegradationRate: "0.0000",
      lastTrustUpdate: new Date(),
      mintingEligible: true,
      mintingScore: "1.00",
    };

    const updatedEvidence = await this.updateEvidence(evidenceId, updates);

    if (updatedEvidence) {
      await this.addChainOfCustodyEntry({
        evidenceId,
        action: "MINTED",
        performedBy: updatedEvidence.uploadedBy!,
        timestamp: new Date(),
        location: "Blockchain",
        notes: `Minted to blockchain at block ${blockNumber}`,
        hashBefore: updatedEvidence.hashValue,
        hashAfter: hashValue,
      });
    }

    return updatedEvidence;
  }

  async calculateMintingEligibility(evidenceId: string): Promise<{ eligible: boolean; score: string; reasons: string[]; sixDScores: any }> {
    const evidence = await this.getEvidence(evidenceId);
    if (!evidence) return { eligible: false, score: "0.00", reasons: ["Evidence not found"], sixDScores: {} };

    const reasons: string[] = [];

    // 6D Trust Revolution Framework for Blockchain Eligibility
    const sixDScores = {
      source: 0,
      time: 0,
      chain: 0,
      network: 0,
      outcomes: 0,
      justice: 0
    };

    // 1. SOURCE - Evidence tier reliability (max 20 points)
    const tierScores: Record<string, number> = {
      'SELF_AUTHENTICATING': 20,
      'GOVERNMENT': 18,
      'FINANCIAL_INSTITUTION': 16,
      'INDEPENDENT_THIRD_PARTY': 12,
      'BUSINESS_RECORDS': 8,
      'FIRST_PARTY_ADVERSE': 4,
      'FIRST_PARTY_FRIENDLY': 2,
      'UNCORROBORATED_PERSON': 0
    };
    sixDScores.source = tierScores[evidence.evidenceTier] || 0;
    if (sixDScores.source >= 16) {
      reasons.push(`✓ Source: High-tier evidence (${evidence.evidenceTier})`);
    } else if (sixDScores.source >= 8) {
      reasons.push(`✓ Source: Acceptable tier (${evidence.evidenceTier})`);
    } else {
      reasons.push(`✗ Source: Low-tier evidence (${evidence.evidenceTier})`);
    }

    // 2. TIME - Recency and relevance (max 15 points)
    const ageHours = (new Date().getTime() - evidence.uploadedAt.getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) {
      sixDScores.time = 15;
      reasons.push("✓ Time: Very recent evidence (<24h)");
    } else if (ageHours < 168) { // 1 week
      sixDScores.time = 12;
      reasons.push("✓ Time: Recent evidence (<1 week)");
    } else if (ageHours < 720) { // 30 days
      sixDScores.time = 8;
      reasons.push("✓ Time: Moderately recent (<30 days)");
    } else {
      sixDScores.time = 0;
      reasons.push("✗ Time: Evidence is old (>30 days)");
    }

    // 3. CHAIN - Chain of custody integrity (max 15 points)
    const custodyRecords = await this.getChainOfCustody(evidenceId);
    if (custodyRecords.length >= 3) {
      sixDScores.chain = 15;
      reasons.push("✓ Chain: Complete custody tracking");
    } else if (custodyRecords.length >= 1) {
      sixDScores.chain = 10;
      reasons.push("✓ Chain: Basic custody tracking");
    } else {
      sixDScores.chain = 0;
      reasons.push("✗ Chain: No custody tracking");
    }

    // 4. NETWORK - Corroboration from multiple sources (max 20 points)
    const corroborationCount = evidence.corroborationCount || 0;
    if (corroborationCount >= 3) {
      sixDScores.network = 20;
      reasons.push(`✓ Network: Strong corroboration (${corroborationCount} sources)`);
    } else if (corroborationCount >= 2) {
      sixDScores.network = 15;
      reasons.push(`✓ Network: Good corroboration (${corroborationCount} sources)`);
    } else if (corroborationCount >= 1) {
      sixDScores.network = 8;
      reasons.push(`✓ Network: Some corroboration (${corroborationCount} sources)`);
    } else {
      sixDScores.network = 0;
      reasons.push("✗ Network: No corroboration");
    }

    // 5. OUTCOMES - Verification status (max 15 points)
    if (evidence.status === 'VERIFIED' || evidence.status === 'MINTED') {
      sixDScores.outcomes = 15;
      reasons.push("✓ Outcomes: Evidence verified");
    } else if (evidence.status === 'REQUIRES_CORROBORATION') {
      sixDScores.outcomes = 5;
      reasons.push("✗ Outcomes: Requires corroboration");
    } else {
      sixDScores.outcomes = 0;
      reasons.push("✗ Outcomes: Not verified");
    }

    // 6. JUSTICE - Conflict resolution (max 15 points)
    const conflictCount = evidence.conflictCount || 0;
    if (conflictCount === 0) {
      sixDScores.justice = 15;
      reasons.push("✓ Justice: No conflicts detected");
    } else if (conflictCount === 1) {
      sixDScores.justice = 8;
      reasons.push("✗ Justice: Minor conflicts present");
    } else {
      sixDScores.justice = 0;
      reasons.push(`✗ Justice: Multiple conflicts (${conflictCount})`);
    }

    const totalScore = Object.values(sixDScores).reduce((sum, score) => sum + score, 0);
    const finalScore = totalScore / 100; // Convert to 0-1 scale
    const eligible = finalScore >= 0.70; // Need 70% across all 6D metrics

    return {
      eligible,
      score: finalScore.toFixed(2),
      reasons,
      sixDScores
    };
  }

  async calculateChittyTrustScore(evidenceId: string): Promise<string> {
    const evidence = await this.getEvidence(evidenceId);
    if (!evidence) return "0.00";

    let score = parseFloat(evidence.originalTrustScore);

    // ChittyTrust evaluates based on 6D Trust Revolution metrics

    // Time factor - how current/relevant is the evidence
    const ageHours = (new Date().getTime() - evidence.uploadedAt.getTime()) / (1000 * 60 * 60);
    if (ageHours < 1) score += 0.05; // Very fresh
    else if (ageHours > 720) score -= 0.10; // Over 30 days old

    // Chain of custody integrity
    const custodyRecords = await this.getChainOfCustody(evidenceId);
    if (custodyRecords.length > 0) {
      score += 0.03; // Proper chain of custody tracking
    }

    // Network corroboration
    score += (evidence.corroborationCount || 0) * 0.02;

    // Conflict resolution
    score -= (evidence.conflictCount || 0) * 0.08;

    // Justice/fairness - evidence tier quality
    const tierMultipliers: Record<string, number> = {
      'SELF_AUTHENTICATING': 1.1,
      'GOVERNMENT': 1.08,
      'FINANCIAL_INSTITUTION': 1.05,
      'INDEPENDENT_THIRD_PARTY': 1.02,
      'BUSINESS_RECORDS': 1.0,
      'FIRST_PARTY_ADVERSE': 0.95,
      'FIRST_PARTY_FRIENDLY': 0.90,
      'UNCORROBORATED_PERSON': 0.85
    };

    score *= (tierMultipliers[evidence.evidenceTier] || 1.0);

    return Math.max(0, Math.min(1, score)).toFixed(2);
  }

  async updateMintingEligibility(evidenceId: string): Promise<Evidence | undefined> {
    const eligibility = await this.calculateMintingEligibility(evidenceId);
    const evidence = await this.getEvidence(evidenceId);
    if (!evidence) return undefined;

    const updates = {
      mintingEligible: eligibility.eligible,
      mintingScore: eligibility.score,
    };

    return await this.updateEvidence(evidenceId, updates);
  }

  async updateChittyTrustScore(evidenceId: string): Promise<Evidence | undefined> {
    const chittyScore = await this.calculateChittyTrustScore(evidenceId);
    const evidence = await this.getEvidence(evidenceId);
    if (!evidence) return undefined;

    const updates = {
      chittytrustScore: chittyScore,
    };

    return await this.updateEvidence(evidenceId, updates);
  }
}