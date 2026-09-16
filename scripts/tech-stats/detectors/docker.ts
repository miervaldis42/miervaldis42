// 🏷️ Types
import type { AddEvidence } from "@customTypes/detection.js";

// 📋 Filename patterns
const DOCKER_COMPOSE_PATTERN = /(^|\/)(?:docker-)?compose(?:\.[^/]+)?\.ya?ml$/;
const DOCKER_CONFIGURATION_PATTERN =
  /(^|\/)(Dockerfile(?:\.[^/]+)?|(?:docker-)?compose(?:\.[^/]+)?\.ya?ml)$/i;

// 🧰 Check whether the file is a Docker Compose file
function isDockerEvidenceFile(filename: string): boolean {
  return DOCKER_COMPOSE_PATTERN.test(filename);
}

// Detect Docker configuration files from repository paths
function detectDockerConfiguration(
  paths: string[],
  addEvidence: AddEvidence,
): void {
  for (const repositoryPath of paths) {
    if (DOCKER_CONFIGURATION_PATTERN.test(repositoryPath)) {
      addEvidence("docker", repositoryPath, "dedicated configuration");
    }
  }
}

// Inspect Docker Compose content to detect container images that count as evidence for other supported technologies
function detectDockerImages(
  filename: string,
  source: string,
  addEvidence: AddEvidence,
): void {
  if (!isDockerEvidenceFile(filename)) {
    return;
  }

  if (
    /^\s*image:\s*["']?(?:docker\.io\/)?(?:library\/)?postgres(?:[:@\s"']|$)/m.test(
      source,
    )
  ) {
    addEvidence("postgresql", filename, "PostgreSQL container image");
  }

  if (
    /^\s*image:\s*["']?(?:docker\.io\/)?(?:library\/)?mongo(?:[:@\s"']|$)/m.test(
      source,
    )
  ) {
    addEvidence("mongodb", filename, "MongoDB container image");
  }
}

export { isDockerEvidenceFile, detectDockerConfiguration, detectDockerImages };
