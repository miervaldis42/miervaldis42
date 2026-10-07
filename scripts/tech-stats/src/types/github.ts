/*
 * 🏷️ Type Definitions
 */

type GitHubOwner = {
  login: string;
};

type GitHubRepository = {
  full_name: string;
  owner: GitHubOwner;
  fork: boolean;
  archived: boolean;
  private: boolean;
  default_branch: string;
  size: number;
};

type GitTreeEntry = {
  path: string;
  type: "blob" | "tree" | "commit";
  mode: string;
  sha: string;
  size?: number;
};

type GitTreeResponse = {
  sha: string;
  truncated: boolean;
  tree: GitTreeEntry[];
};

type GitBlobResponse = {
  encoding: string;
  size: number;
  content: string;
};

type GitHubLanguages = Record<string, number>;

type GitHubRequestOptions = {
  paginate?: boolean;
  emptyAllowed?: boolean;
};

type GitHubClient = <T>(endpoint: string, options?: GitHubRequestOptions) => T;

export type {
  GitHubOwner,
  GitHubRepository,
  GitTreeEntry,
  GitTreeResponse,
  GitBlobResponse,
  GitHubLanguages,
  GitHubRequestOptions,
  GitHubClient,
};
