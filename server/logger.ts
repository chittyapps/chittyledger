import { randomUUID } from "crypto";

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  requestId?: string;
  evidenceId?: string;
  caseId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 10000;

  private createLog(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      level,
      message,
      metadata,
    };

    this.logs.push(entry);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const logMessage = `[${entry.timestamp.toISOString()}] ${level}: ${message}`;
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, metadata);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, metadata);
        break;
      case LogLevel.INFO:
        console.info(logMessage, metadata);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, metadata);
        break;
    }

    return entry;
  }

  error(message: string, metadata?: Record<string, any>): LogEntry {
    return this.createLog(LogLevel.ERROR, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): LogEntry {
    return this.createLog(LogLevel.WARN, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): LogEntry {
    return this.createLog(LogLevel.INFO, message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): LogEntry {
    return this.createLog(LogLevel.DEBUG, message, metadata);
  }

  // Specialized logging methods for legal evidence
  evidenceCreated(evidenceId: string, caseId?: string, userId?: string): LogEntry {
    return this.info('Evidence created', {
      evidenceId,
      caseId,
      userId,
      action: 'EVIDENCE_CREATED'
    });
  }

  evidenceVerified(evidenceId: string, userId?: string): LogEntry {
    return this.info('Evidence verified', {
      evidenceId,
      userId,
      action: 'EVIDENCE_VERIFIED'
    });
  }

  evidenceMinted(evidenceId: string, blockNumber: string, userId?: string): LogEntry {
    return this.info('Evidence minted to blockchain', {
      evidenceId,
      blockNumber,
      userId,
      action: 'EVIDENCE_MINTED'
    });
  }

  contradictionDetected(evidenceId1: string, evidenceId2: string, type: string): LogEntry {
    return this.warn('Contradiction detected', {
      evidenceId1,
      evidenceId2,
      contradictionType: type,
      action: 'CONTRADICTION_DETECTED'
    });
  }

  trustScoreCalculated(evidenceId: string, score: string, method: string): LogEntry {
    return this.debug('Trust score calculated', {
      evidenceId,
      score,
      method,
      action: 'TRUST_SCORE_CALCULATED'
    });
  }

  chainOfCustodyUpdated(evidenceId: string, action: string, userId?: string): LogEntry {
    return this.info('Chain of custody updated', {
      evidenceId,
      custodyAction: action,
      userId,
      action: 'CUSTODY_UPDATED'
    });
  }

  factExtracted(evidenceId: string, factId: string, confidence: string): LogEntry {
    return this.info('Atomic fact extracted', {
      evidenceId,
      factId,
      confidence,
      action: 'FACT_EXTRACTED'
    });
  }

  getLogs(limit?: number, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    const result = filteredLogs.slice().reverse(); // Most recent first

    if (limit) {
      return result.slice(0, limit);
    }

    return result;
  }

  getLogsByEvidence(evidenceId: string): LogEntry[] {
    return this.logs
      .filter(log => log.evidenceId === evidenceId)
      .slice()
      .reverse();
  }

  getLogsByCase(caseId: string): LogEntry[] {
    return this.logs
      .filter(log => log.caseId === caseId)
      .slice()
      .reverse();
  }

  getErrorLogs(): LogEntry[] {
    return this.getLogs(undefined, LogLevel.ERROR);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();

// Error handling middleware
export class ChittyChainError extends Error {
  public statusCode: number;
  public code: string;
  public metadata?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'ChittyChainError';
    this.statusCode = statusCode;
    this.code = code;
    this.metadata = metadata;
  }
}

export class ValidationError extends ChittyChainError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR', { field });
  }
}

export class NotFoundError extends ChittyChainError {
  constructor(resource: string, id?: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND', { resource, id });
  }
}

export class UnauthorizedError extends ChittyChainError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ConflictError extends ChittyChainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class TrustScoreError extends ChittyChainError {
  constructor(message: string, evidenceId?: string) {
    super(message, 422, 'TRUST_SCORE_ERROR', { evidenceId });
  }
}

export class BlockchainError extends ChittyChainError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 503, 'BLOCKCHAIN_ERROR', details);
  }
}