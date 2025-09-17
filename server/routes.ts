import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEvidenceSchema, insertCaseSchema, insertFactSchema } from "@shared/schema";
import { z } from "zod";
import { logger, ChittyChainError, ValidationError, NotFoundError } from "./logger";
import { factExtractor } from "./fact-extraction";
import { contradictionDetector } from "./contradiction-detection";
import { scientificTrustEngine } from "./scientific-trust-scoring";
import { scientificValidator, legalClassifier } from "./legal-compliance";

export async function registerRoutes(app: Express): Promise<Server> {

  // Enhanced error handling middleware
  const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Unhandled route error', {
        method: req.method,
        path: req.path,
        error: error.message,
        stack: error.stack,
        requestId: (req as any).id
      });
      next(error);
    });
  };

  // Global error handler
  const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ChittyChainError) {
      return res.status(err.statusCode).json({
        error: err.message,
        code: err.code,
        metadata: err.metadata
      });
    }

    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors
      });
    }

    // Log unexpected errors
    logger.error('Unexpected error', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path
    });

    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  };

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    next();
  });

  // Cases endpoints
  app.get("/api/cases", asyncHandler(async (req: Request, res: Response) => {
    const cases = await storage.getCases();
    logger.info('Cases fetched', { count: cases.length });
    res.json(cases);
  }));

  app.get("/api/cases/:id", asyncHandler(async (req: Request, res: Response) => {
    const case_ = await storage.getCase(req.params.id);
    if (!case_) {
      throw new NotFoundError('Case', req.params.id);
    }
    res.json(case_);
  }));

  app.post("/api/cases", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertCaseSchema.parse(req.body);
    const newCase = await storage.createCase(validatedData);
    logger.info('Case created', { caseId: newCase.id, caseNumber: newCase.caseNumber });
    res.status(201).json(newCase);
  }));

  // Evidence endpoints
  app.get("/api/evidence", asyncHandler(async (req: Request, res: Response) => {
    const { caseId } = req.query;
    let evidence;

    if (caseId && typeof caseId === 'string') {
      evidence = await storage.getEvidenceByCase(caseId);
    } else {
      evidence = await storage.getAllEvidence();
    }

    res.json(evidence);
  }));

  app.get("/api/evidence/:id", asyncHandler(async (req: Request, res: Response) => {
    const evidence = await storage.getEvidence(req.params.id);
    if (!evidence) {
      throw new NotFoundError('Evidence', req.params.id);
    }
    res.json(evidence);
  }));

  app.post("/api/evidence", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertEvidenceSchema.parse(req.body);
    const newEvidence = await storage.createEvidence(validatedData);

    // Add chain of custody entry
    await storage.addChainOfCustodyEntry({
      evidenceId: newEvidence.id,
      action: "UPLOADED",
      performedBy: newEvidence.uploadedBy!,
      timestamp: new Date(),
      location: "Digital Upload",
      notes: "Initial evidence upload",
      hashBefore: null,
      hashAfter: newEvidence.hashValue,
    });

    res.status(201).json(newEvidence);
  }));

  app.patch("/api/evidence/:id", asyncHandler(async (req: Request, res: Response) => {
    const updates = req.body;
    const updatedEvidence = await storage.updateEvidence(req.params.id, updates);

    if (!updatedEvidence) {
      throw new NotFoundError('Evidence', req.params.id);
    }

    // Add chain of custody entry for updates
    if (updates.status || updates.blockNumber) {
      await storage.addChainOfCustodyEntry({
        evidenceId: updatedEvidence.id,
        action: updates.status === "MINTED" ? "MINTED" : "UPDATED",
        performedBy: updates.verifiedBy || updatedEvidence.uploadedBy!,
        timestamp: new Date(),
        location: "Blockchain Network",
        notes: `Evidence ${updates.status === "MINTED" ? "minted to blockchain" : "updated"}`,
        hashBefore: updatedEvidence.hashValue,
        hashAfter: updates.hashValue || updatedEvidence.hashValue,
      });
    }

    res.json(updatedEvidence);
  }));

  // Verify evidence - starts trust degradation timer
  app.post("/api/evidence/:id/verify", asyncHandler(async (req: Request, res: Response) => {
    const verifiedEvidence = await storage.verifyEvidence(req.params.id);

    if (!verifiedEvidence) {
      throw new NotFoundError('Evidence', req.params.id);
    }

    res.json(verifiedEvidence);
  }));

  // Check minting eligibility - blockchain path
  app.get("/api/evidence/:id/minting-eligibility", asyncHandler(async (req: Request, res: Response) => {
    const eligibility = await storage.calculateMintingEligibility(req.params.id);
    res.json(eligibility);
  }));

  // Get ChittyTrust score - separate scoring system
  app.get("/api/evidence/:id/chittytrust-score", asyncHandler(async (req: Request, res: Response) => {
    const score = await storage.calculateChittyTrustScore(req.params.id);
    res.json({ score });
  }));

  // Update ChittyTrust score
  app.post("/api/evidence/:id/update-chittytrust", asyncHandler(async (req: Request, res: Response) => {
    const updatedEvidence = await storage.updateChittyTrustScore(req.params.id);
    if (!updatedEvidence) {
      throw new NotFoundError('Evidence', req.params.id);
    }
    res.json(updatedEvidence);
  }));

  // Mint evidence - locks trust score permanently (only if eligible)
  app.post("/api/evidence/:id/mint", asyncHandler(async (req: Request, res: Response) => {
    const { blockNumber, hashValue } = req.body;

    if (!blockNumber || !hashValue) {
      throw new ValidationError("Block number and hash value are required");
    }

    // Check eligibility first
    const eligibility = await storage.calculateMintingEligibility(req.params.id);
    if (!eligibility.eligible) {
      throw new ValidationError("Evidence not eligible for minting");
    }

    const mintedEvidence = await storage.mintEvidence(req.params.id, blockNumber, hashValue);

    if (!mintedEvidence) {
      throw new NotFoundError('Evidence', req.params.id);
    }

    res.json(mintedEvidence);
  }));

  // Get current trust score (with degradation calculation)
  app.get("/api/evidence/:id/trust", asyncHandler(async (req: Request, res: Response) => {
    const currentTrust = await storage.calculateCurrentTrustScore(req.params.id);
    const evidence = await storage.getEvidence(req.params.id);

    if (!evidence) {
      throw new NotFoundError('Evidence', req.params.id);
    }

    res.json({
      evidenceId: req.params.id,
      currentTrustScore: currentTrust,
      originalTrustScore: evidence.originalTrustScore,
      status: evidence.status,
      mintedAt: evidence.mintedAt,
      verifiedAt: evidence.verifiedAt,
      degradationRate: evidence.trustDegradationRate,
      lastUpdate: evidence.lastTrustUpdate,
    });
  }));

  // Atomic Facts endpoints
  app.get("/api/evidence/:evidenceId/facts", asyncHandler(async (req: Request, res: Response) => {
    const facts = await storage.getFactsByEvidence(req.params.evidenceId);
    res.json(facts);
  }));

  app.post("/api/facts", asyncHandler(async (req: Request, res: Response) => {
    const validatedData = insertFactSchema.parse(req.body);
    const newFact = await storage.createFact(validatedData);
    res.status(201).json(newFact);
  }));

  // Chain of Custody endpoints
  app.get("/api/evidence/:evidenceId/custody", asyncHandler(async (req: Request, res: Response) => {
    const custody = await storage.getChainOfCustody(req.params.evidenceId);
    res.json(custody);
  }));

  // Contradictions endpoints
  app.get("/api/contradictions", asyncHandler(async (req: Request, res: Response) => {
    const { active } = req.query;
    let contradictions;

    if (active === 'true') {
      contradictions = await storage.getActiveContradictions();
    } else {
      contradictions = await storage.getContradictions();
    }

    res.json(contradictions);
  }));

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", asyncHandler(async (req: Request, res: Response) => {
    const allEvidence = await storage.getAllEvidence();
    const allCases = await storage.getCases();
    const activeContradictions = await storage.getActiveContradictions();

    const mintedEvidence = allEvidence.filter(e => e.status === 'MINTED');
    const verificationRate = allEvidence.length > 0 ?
      (mintedEvidence.length / allEvidence.length * 100).toFixed(1) : '0.0';

    const activeCases = allCases.filter(c => c.status === 'active');
    const criticalContradictions = activeContradictions.filter(c => c.severity === 'high');

    res.json({
      evidenceArtifacts: allEvidence.length,
      verificationRate: parseFloat(verificationRate),
      activeCases: activeCases.length,
      criticalContradictions: criticalContradictions.length,
    });
  }));

  // Apply error handler
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
