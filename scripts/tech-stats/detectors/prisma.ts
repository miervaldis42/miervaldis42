// 🏷️ Types
import type { AddEvidence } from "@customTypes/detection.js";

// 🧰 Check whether the file is related to Prisma
export function isPrismaEvidenceFile(filename: string): boolean {
  return filename.endsWith(".prisma");
}

// Detect database usage through Prisma providers
export function detectPrismaProviders(
  filename: string,
  source: string,
  addEvidence: AddEvidence,
): void {
  if (!isPrismaEvidenceFile(filename)) {
    return;
  }

  const withoutComments = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");

  if (/\bprovider\s*=\s*["']postgresql["']/.test(withoutComments)) {
    addEvidence("postgresql", filename, "Prisma PostgreSQL provider");
  }

  if (/\bprovider\s*=\s*["']mongodb["']/.test(withoutComments)) {
    addEvidence("mongodb", filename, "Prisma MongoDB provider");
  }
}
