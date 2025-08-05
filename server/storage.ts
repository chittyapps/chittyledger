import { 
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
  type EvidenceTier,
  type EvidenceStatus
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cases
  getCase(id: string): Promise<Case | undefined>;
  getCases(): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: string, updates: Partial<Case>): Promise<Case | undefined>;

  // Evidence
  getEvidence(id: string): Promise<Evidence | undefined>;
  getEvidenceByCase(caseId: string): Promise<Evidence[]>;
  getAllEvidence(): Promise<Evidence[]>;
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  updateEvidence(id: string, updates: Partial<Evidence>): Promise<Evidence | undefined>;

  // Atomic Facts
  getFactsByEvidence(evidenceId: string): Promise<AtomicFact[]>;
  createFact(fact: InsertFact): Promise<AtomicFact>;

  // Chain of Custody
  getChainOfCustody(evidenceId: string): Promise<ChainOfCustody[]>;
  addChainOfCustodyEntry(entry: Omit<ChainOfCustody, 'id'>): Promise<ChainOfCustody>;

  // Contradictions
  getContradictions(): Promise<Contradiction[]>;
  getActiveContradictions(): Promise<Contradiction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private cases: Map<string, Case> = new Map();
  private evidence: Map<string, Evidence> = new Map();
  private atomicFacts: Map<string, AtomicFact> = new Map();
  private chainOfCustody: Map<string, ChainOfCustody> = new Map();
  private contradictions: Map<string, Contradiction> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create sample users
    const attorney1: User = {
      id: randomUUID(),
      username: "j.mitchell",
      email: "j.mitchell@lawfirm.com",
      role: "attorney",
      createdAt: new Date("2024-01-01"),
    };

    const clerk1: User = {
      id: randomUUID(),
      username: "court.clerk",
      email: "clerk@courthouse.gov",
      role: "clerk",
      createdAt: new Date("2024-01-01"),
    };

    this.users.set(attorney1.id, attorney1);
    this.users.set(clerk1.id, clerk1);

    // Create sample case
    const case1: Case = {
      id: randomUUID(),
      caseNumber: "ILLINOIS-COOK-2024-CIVIL-4721",
      title: "Mitchell v. Sterling Industries",
      description: "Civil litigation regarding contract disputes and financial discrepancies",
      caseType: "CIVIL",
      status: "active",
      parties: {
        plaintiff: "J. Mitchell",
        defendant: "Sterling Industries LLC"
      },
      nextHearing: new Date("2024-01-25T14:00:00Z"),
      courtroom: "3B",
      judge: "Judge Martinez",
      attorneyId: attorney1.id,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    };

    this.cases.set(case1.id, case1);

    // Create sample evidence
    const evidence1: Evidence = {
      id: randomUUID(),
      artifactId: "ART-000847",
      filename: "Financial_Statement.pdf",
      fileType: "application/pdf",
      fileSize: "2.4 MB",
      description: "Quarterly financial statement showing payment discrepancies",
      evidenceTier: "FINANCIAL_INSTITUTION",
      trustScore: "0.94",
      status: "MINTED",
      blockNumber: "2847291",
      hashValue: "0x4a7b8c9d2e1f3a5b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      caseId: case1.id,
      uploadedBy: attorney1.id,
      uploadedAt: new Date("2024-01-15T09:32:00Z"),
      verifiedAt: new Date("2024-01-15T11:47:00Z"),
    };

    const evidence2: Evidence = {
      id: randomUUID(),
      artifactId: "ART-000848",
      filename: "Property_Photo.jpg",
      fileType: "image/jpeg",
      fileSize: "5.1 MB",
      description: "Photographic evidence of property condition",
      evidenceTier: "INDEPENDENT_THIRD_PARTY",
      trustScore: "0.80",
      status: "PENDING",
      blockNumber: null,
      hashValue: null,
      caseId: case1.id,
      uploadedBy: attorney1.id,
      uploadedAt: new Date("2024-01-15T10:15:00Z"),
      verifiedAt: null,
    };

    const evidence3: Evidence = {
      id: randomUUID(),
      artifactId: "ART-000849",
      filename: "Witness_Statement.pdf",
      fileType: "application/pdf",
      fileSize: "1.2 MB",
      description: "Witness testimony regarding the incident",
      evidenceTier: "UNCORROBORATED_PERSON",
      trustScore: "0.20",
      status: "REQUIRES_CORROBORATION",
      blockNumber: null,
      hashValue: null,
      caseId: case1.id,
      uploadedBy: attorney1.id,
      uploadedAt: new Date("2024-01-15T14:20:00Z"),
      verifiedAt: null,
    };

    this.evidence.set(evidence1.id, evidence1);
    this.evidence.set(evidence2.id, evidence2);
    this.evidence.set(evidence3.id, evidence3);

    // Create sample atomic fact
    const fact1: AtomicFact = {
      id: randomUUID(),
      factId: "FACT-0034",
      content: "Payment of $15,000 received on January 12, 2024",
      factType: "AMOUNT",
      confidenceScore: "0.89",
      evidenceId: evidence1.id,
      extractedAt: new Date("2024-01-15T12:00:00Z"),
      verifiedAt: new Date("2024-01-15T12:15:00Z"),
    };

    this.atomicFacts.set(fact1.id, fact1);

    // Create sample contradiction
    const contradiction1: Contradiction = {
      id: randomUUID(),
      conflictId: "CONFLICT-0034",
      description: "Temporal impossibility detected between payment receipt date and bank statement entry",
      contradictionType: "TEMPORAL",
      severity: "high",
      status: "active",
      evidenceId1: evidence1.id,
      evidenceId2: evidence2.id,
      detectedAt: new Date("2024-01-15T15:30:00Z"),
      resolvedAt: null,
    };

    this.contradictions.set(contradiction1.id, contradiction1);

    // Create chain of custody entries
    const custody1: ChainOfCustody = {
      id: randomUUID(),
      evidenceId: evidence1.id,
      action: "UPLOADED",
      performedBy: attorney1.id,
      timestamp: new Date("2024-01-15T09:32:00Z"),
      location: "Law Office",
      notes: "Initial upload by attorney",
      hashBefore: null,
      hashAfter: "0x4a7b8c9d2e1f3a5b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    };

    const custody2: ChainOfCustody = {
      id: randomUUID(),
      evidenceId: evidence1.id,
      action: "VERIFIED",
      performedBy: clerk1.id,
      timestamp: new Date("2024-01-15T11:47:00Z"),
      location: "Courthouse",
      notes: "Verified by court clerk",
      hashBefore: "0x4a7b8c9d2e1f3a5b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      hashAfter: "0x4a7b8c9d2e1f3a5b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    };

    this.chainOfCustody.set(custody1.id, custody1);
    this.chainOfCustody.set(custody2.id, custody2);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Case methods
  async getCase(id: string): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async getCases(): Promise<Case[]> {
    return Array.from(this.cases.values());
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const case_: Case = {
      ...caseData,
      id: randomUUID(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cases.set(case_.id, case_);
    return case_;
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | undefined> {
    const case_ = this.cases.get(id);
    if (!case_) return undefined;
    
    const updatedCase = { ...case_, ...updates, updatedAt: new Date() };
    this.cases.set(id, updatedCase);
    return updatedCase;
  }

  // Evidence methods
  async getEvidence(id: string): Promise<Evidence | undefined> {
    return this.evidence.get(id);
  }

  async getEvidenceByCase(caseId: string): Promise<Evidence[]> {
    return Array.from(this.evidence.values()).filter(ev => ev.caseId === caseId);
  }

  async getAllEvidence(): Promise<Evidence[]> {
    return Array.from(this.evidence.values());
  }

  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const artifactCounter = this.evidence.size + 1;
    const evidence: Evidence = {
      ...evidenceData,
      id: randomUUID(),
      artifactId: `ART-${artifactCounter.toString().padStart(6, '0')}`,
      trustScore: this.calculateTrustScore(evidenceData.evidenceTier as EvidenceTier),
      status: "PENDING",
      blockNumber: null,
      hashValue: null,
      uploadedBy: evidenceData.caseId, // TODO: get from auth context
      uploadedAt: new Date(),
      verifiedAt: null,
    };
    this.evidence.set(evidence.id, evidence);
    return evidence;
  }

  async updateEvidence(id: string, updates: Partial<Evidence>): Promise<Evidence | undefined> {
    const evidence = this.evidence.get(id);
    if (!evidence) return undefined;
    
    const updatedEvidence = { ...evidence, ...updates };
    this.evidence.set(id, updatedEvidence);
    return updatedEvidence;
  }

  // Atomic Facts methods
  async getFactsByEvidence(evidenceId: string): Promise<AtomicFact[]> {
    return Array.from(this.atomicFacts.values()).filter(fact => fact.evidenceId === evidenceId);
  }

  async createFact(factData: InsertFact): Promise<AtomicFact> {
    const factCounter = this.atomicFacts.size + 1;
    const fact: AtomicFact = {
      ...factData,
      id: randomUUID(),
      factId: `FACT-${factCounter.toString().padStart(4, '0')}`,
      extractedAt: new Date(),
      verifiedAt: null,
    };
    this.atomicFacts.set(fact.id, fact);
    return fact;
  }

  // Chain of Custody methods
  async getChainOfCustody(evidenceId: string): Promise<ChainOfCustody[]> {
    return Array.from(this.chainOfCustody.values())
      .filter(entry => entry.evidenceId === evidenceId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async addChainOfCustodyEntry(entryData: Omit<ChainOfCustody, 'id'>): Promise<ChainOfCustody> {
    const entry: ChainOfCustody = {
      ...entryData,
      id: randomUUID(),
    };
    this.chainOfCustody.set(entry.id, entry);
    return entry;
  }

  // Contradictions methods
  async getContradictions(): Promise<Contradiction[]> {
    return Array.from(this.contradictions.values());
  }

  async getActiveContradictions(): Promise<Contradiction[]> {
    return Array.from(this.contradictions.values()).filter(c => c.status === 'active');
  }

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
}

export const storage = new MemStorage();
