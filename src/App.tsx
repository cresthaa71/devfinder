import { useState } from "react";
import {
  Search,
  Code2,
  Users,
  Star,
  GitFork,
  MapPin,
  Link as LinkIcon,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
};

type Repository = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
};

function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "forks">(
  "updated"
);
const sortedRepos = [...repos].sort((a, b) => {
  if (sortBy === "stars") {
    return b.stargazers_count - a.stargazers_count;
  }

  if (sortBy === "forks") {
    return b.forks_count - a.forks_count;
  }

  return 0;
});
 const searchDeveloper = async () => {
  const searchName = username.trim();

  if (!searchName) {
    setError("Please enter a GitHub username.");
    return;
  }

  setLoading(true);
  setError("");
  setLanguages({});

  try {
    const userResponse = await fetch(
      `https://api.github.com/users/${searchName}`
    );

   if (!userResponse.ok) {
  if (userResponse.status === 403) {
    throw new Error(
      "GitHub API rate limit reached. Please try again later."
    );
  }

  if (userResponse.status === 404) {
    throw new Error("GitHub user not found.");
  }

  throw new Error(`GitHub API error (${userResponse.status}).`);
}

    const userData: GitHubUser = await userResponse.json();

    const repoResponse = await fetch(
      `https://api.github.com/users/${searchName}/repos?per_page=30&sort=updated`
    );

    const repoData: Repository[] = await repoResponse.json();

    const languageTotals: Record<string, number> = {};

    for (const repo of repoData) {
      if (repo.language) {
        languageTotals[repo.language] =
          (languageTotals[repo.language] || 0) + 1;
      }
    }

    setUser(userData);
    setRepos(repoData.slice(0, 6));
    setLanguages(languageTotals);
  } catch (err) {
    setUser(null);
    setRepos([]);
    setLanguages({});
    setError(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchDeveloper();
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg shadow-blue-500/20">
              <Code2 size={22} />
            </div>

            <div>
              <span className="text-xl font-bold tracking-tight">
                DevFinder
              </span>
              <p className="hidden text-xs text-slate-500 sm:block">
                Developer Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles size={15} className="text-blue-400" />
            GitHub Explorer
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
            <Sparkles size={14} />
            Developer Analytics
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Discover{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              GitHub developers
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Search any public GitHub profile and instantly explore their
            activity, repositories, followers and developer statistics.
          </p>

          {/* Search */}
          <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row">
            <div className="flex flex-1 items-center">
              <Search className="ml-3 text-slate-500" size={21} />

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search username e.g. torvalds"
                className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              onClick={searchDeveloper}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm font-medium text-red-400">{error}</p>
          )}
        </div>
        {/* Results */}
        {user && (
          <div className="mt-20">
            {/* Profile + Stats */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Profile Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl lg:col-span-1">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative">
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="h-24 w-24 rounded-2xl border border-white/10 object-cover shadow-xl"
                  />

                  <h2 className="mt-6 text-2xl font-bold">
                    {user.name || user.login}
                  </h2>

                  <p className="mt-1 text-blue-400">@{user.login}</p>

                  {user.bio && (
                    <p className="mt-5 text-sm leading-6 text-slate-400">
                      {user.bio}
                    </p>
                  )}

                  <div className="mt-6 space-y-3">
                    {user.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin size={16} className="text-slate-500" />
                        {user.location}
                      </div>
                    )}

                    <a
                      href={user.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-fit items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-blue-400"
                    >
                      <LinkIcon size={16} />
                      github.com/{user.login}
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-7 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold transition hover:border-blue-500/30 hover:bg-blue-500/10"
                  >
                    View GitHub Profile
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                <Stat
                  icon={<Users />}
                  label="Followers"
                  value={user.followers.toLocaleString()}
                />

                <Stat
                  icon={<Users />}
                  label="Following"
                  value={user.following.toLocaleString()}
                />

                <Stat
                  icon={<Code2 />}
                  label="Repositories"
                  value={user.public_repos.toLocaleString()}
                />

                <Stat
                  icon={<Star />}
                  label="Total Stars"
                  value={repos
                    .reduce(
                      (total, repo) => total + repo.stargazers_count,
                      0
                    )
                    .toLocaleString()}
                />
              </div>
            </div>
            {/* Language Analytics */}
<div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-blue-400">
        Tech Stack
      </p>

      <h2 className="mt-1 text-2xl font-bold">
        Language Analytics
      </h2>
    </div>

    <Code2 className="text-slate-600" />
  </div>

  <div className="mt-6 space-y-5">
    {Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .map(([language, count], _, array) => {
        const total = array.reduce(
          (sum, [, value]) => sum + value,
          0
        );

        const percentage = Math.round((count / total) * 100);

        return (
          <div key={language}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-slate-300">
                {language}
              </span>

              <span className="text-slate-500">
                {percentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}

    {Object.keys(languages).length === 0 && (
      <p className="text-sm text-slate-500">
        No language data available.
      </p>
    )}
  </div>
</div>

           {/* Repository Header */}
<div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p className="text-sm font-medium text-blue-400">
      Developer Work
    </p>

    <h2 className="mt-1 text-3xl font-bold">
      Recent Repositories
    </h2>
  </div>

  <div className="flex items-center gap-3">
    <select
      value={sortBy}
      onChange={(e) =>
        setSortBy(e.target.value as "updated" | "stars" | "forks")
      }
      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-300 outline-none transition focus:border-blue-500"
    >
      <option value="updated">Recently Updated</option>
      <option value="stars">Most Stars</option>
      <option value="forks">Most Forks</option>
    </select>

    <span className="text-sm text-slate-500">
      {repos.length} repositories
    </span>
  </div>
</div>

            {/* Repositories */}
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
             {sortedRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-52 flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-blue-950/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-semibold text-blue-400 transition group-hover:text-blue-300">
                      {repo.name}
                    </h3>

                    <ExternalLink
                      size={16}
                      className="shrink-0 text-slate-600 transition group-hover:text-slate-300"
                    />
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">
                    {repo.description || "No description available."}
                  </p>

                  <div className="mt-6 flex items-center gap-5 border-t border-white/5 pt-4 text-xs text-slate-500">
                    {repo.language && (
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                        {repo.language}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {repo.stargazers_count}
                    </span>

                    <span className="flex items-center gap-1">
                      <GitFork size={14} />
                      {repo.forks_count}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.06]">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl transition group-hover:bg-blue-500/20" />

      <div className="relative">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        <p className="text-sm text-slate-500">{label}</p>

        <p className="mt-1 text-3xl font-bold tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

export default App;