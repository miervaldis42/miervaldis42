import { execFileSync } from 'node:child_process';
import { detect, isEvidenceFile } from './rules.mjs';

export function selectRepositories(repos, config) {
  const owner = config.owner.toLowerCase();
  const include = new Set(config.include.map((name) => name.toLowerCase()));
  const exclude = new Set(config.exclude.map((name) => name.toLowerCase()));
  return repos.map((repo) => {
    const name = repo.full_name.toLowerCase();
    const reason = repo.owner.login.toLowerCase() !== owner ? 'other owner'
      : repo.fork ? 'fork' : repo.archived ? 'archived'
        : name === `${owner}/${owner}` ? 'profile repository'
          : exclude.has(name) ? 'explicit exclusion'
            : include.size && !include.has(name) ? 'outside inclusion list' : null;
    return { ...repo, reason };
  });
}

export function githubClient({ localGh = false } = {}) {
  if (localGh && process.env.GITHUB_ACTIONS) throw new Error('Local credential mode is unavailable in Actions.');
  if (!localGh && !process.env.TECH_STATS_TOKEN) throw new Error('TECH_STATS_TOKEN is required for analysis.');
  return (endpoint, { paginate = false, emptyAllowed = false } = {}) => {
    // Capture stderr: gh errors may contain private repository URLs or response bodies.
    try {
      return JSON.parse(execFileSync('gh', [
        'api', '--method', 'GET', endpoint, '-H', 'Accept: application/vnd.github+json',
        ...(paginate ? ['--paginate', '--slurp'] : []),
      ], {
        encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 120_000,
        env: localGh ? process.env : { ...process.env, GH_TOKEN: process.env.TECH_STATS_TOKEN, GITHUB_TOKEN: '' },
      }));
    } catch (error) {
      // An empty Git repository has no Git tree. Other errors must fail closed.
      if (emptyAllowed && /HTTP 409/.test(String(error.stderr))) return null;
      throw new Error('GitHub analysis request failed; private details suppressed. Check token access, rate limits, and repository availability.');
    }
  };
}

function ignored(name, config) {
  return name.split('/').some((part) => config.ignoredPathSegments.includes(part));
}

export function readTree(api, repo, config) {
  const base = `repos/${repo.full_name}/git/trees/`;
  const tree = api(`${base}${encodeURIComponent(repo.default_branch)}?recursive=1`, { emptyAllowed: repo.size === 0 });
  if (tree === null) return [];
  if (!tree.truncated) return tree.tree.filter((entry) => entry.type === 'blob' && entry.mode !== '120000' && !ignored(entry.path, config));
  // GitHub limits recursive responses. Walk subtrees rather than accepting partial evidence.
  const queue = [{ sha: tree.sha, prefix: '' }];
  const files = [];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const item = queue[cursor];
    const subtree = api(`${base}${item.sha}`);
    if (subtree.truncated) throw new Error('Git tree remains truncated; refusing partial statistics.');
    for (const entry of subtree.tree) {
      const name = `${item.prefix}${entry.path}`;
      if (ignored(name, config)) continue;
      if (entry.type === 'tree') queue.push({ sha: entry.sha, prefix: `${name}/` });
      else if (entry.type === 'blob' && entry.mode !== '120000') files.push({ ...entry, path: name });
    }
  }
  return files;
}

export function summarize(repositories, sections) {
  const bytes = {};
  for (const repo of repositories) {
    for (const [language, count] of Object.entries(repo.languages)) {
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid Linguist bytes.');
      bytes[language] = (bytes[language] ?? 0) + count;
    }
  }
  const relevant = sections.flatMap((section) => section.technologies).filter((tech) => tech.metric === 'language');
  const languageBytes = relevant.reduce((sum, tech) => sum + (bytes[tech.language] ?? 0), 0);
  if (!Number.isSafeInteger(languageBytes)) throw new Error('Language total exceeds safe precision.');
  const metrics = {};
  for (const section of sections) {
    for (const tech of section.technologies) {
      if (tech.metric === 'curated') { metrics[tech.id] = { metric: 'curated', label: tech.label }; continue; }
      const numerator = tech.metric === 'language' ? bytes[tech.language] ?? 0
        : repositories.filter((repo) => repo.evidence[tech.rule]?.length > 0).length;
      const denominator = tech.metric === 'language' ? languageBytes : repositories.length;
      const percentage = denominator ? numerator / denominator * 100 : null;
      metrics[tech.id] = { metric: tech.metric, numerator, denominator, percentage, label: percentage === null ? 'No data' : `${percentage.toFixed(1)}%` };
    }
  }
  return { analyzedRepositories: repositories.length, languageBytes, allLanguageBytes: bytes, metrics };
}

export function analyze(api, config, sections) {
  const publicRepos = api(`users/${encodeURIComponent(config.owner)}/repos?type=owner&per_page=100`, { paginate: true }).flat();
  const accessible = api('user/repos?affiliation=owner&visibility=all&per_page=100', { paginate: true }).flat();
  const unique = new Map([...publicRepos, ...accessible].map((repo) => [repo.full_name.toLowerCase(), repo]));
  const selection = selectRepositories([...unique.values()], config).sort((a, b) => a.full_name.localeCompare(b.full_name));
  // Public configuration may not name private repositories. Use an external local override or Actions variable.
  const privateNames = new Set(selection.filter((repo) => repo.private).map((repo) => repo.full_name.toLowerCase()));
  const repositories = [];
  for (const repo of selection.filter((item) => item.reason === null)) {
    const languages = api(`repos/${repo.full_name}/languages`);
    const entries = readTree(api, repo, config);
    const candidates = entries.filter((entry) => isEvidenceFile(entry.path));
    if (candidates.length > config.maxEvidenceFiles || candidates.some((entry) => entry.size > config.maxEvidenceBytes)) {
      throw new Error('Repository evidence exceeds configured bounds; refusing partial statistics.');
    }
    const files = {};
    for (const entry of candidates) {
      const blob = api(`repos/${repo.full_name}/git/blobs/${entry.sha}`);
      if (blob.encoding !== 'base64' || blob.size > config.maxEvidenceBytes) throw new Error('Unsupported or oversized evidence blob.');
      files[entry.path] = Buffer.from(blob.content, 'base64').toString('utf8');
    }
    repositories.push({
      name: repo.full_name, private: repo.private, defaultBranch: repo.default_branch,
      languages, evidence: detect(entries.map((entry) => entry.path), files),
    });
  }
  return {
    schemaVersion: 1, collectedAt: new Date().toISOString(),
    includedCount: repositories.length,
    excludedCount: selection.filter((repo) => repo.reason !== null).length,
    selection: selection.map((repo) => ({ name: repo.full_name, private: repo.private, reason: repo.reason })),
    privateNames: [...privateNames], repositories,
    summary: summarize(repositories, sections),
  };
}
