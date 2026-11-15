import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Users,
  Zap,
  Bot,
  Play,
  Sparkles,
  Shield,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Activity,
  FileCode2,
  Bug,
  HelpCircle
} from 'lucide-react';
import './Landing.css';

const CODE_SNIPPETS = {
  python: {
    filename: 'solution.py',
    language: 'Python 3.12 (Docker Sandbox)',
    code: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Hash map lookup for O(n) linear performance
    seen = {}
    for idx, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], idx]
        seen[num] = idx
    return []

# Run test case
print("Result:", two_sum([2, 7, 11, 15], 9))  # -> [0, 1]`,
    output: `[Docker Runner] Compiling & running in sandbox...
Result: [0, 1]
✓ Execution time: 18ms | Memory: 14.2MB | Exit code: 0`,
    aiReview: {
      action: 'REVIEW',
      title: 'Gemini 3.8 Flash • Architecture Review',
      summary: 'Optimal O(n) single-pass hash table implementation. Clean type hinting and pythonic style.',
      metrics: 'Time Complexity: O(n) | Space: O(n)',
      badge: 'Score: 10/10'
    },
    aiBugs: {
      action: 'BUGS',
      title: 'Gemini 3.8 Flash • Bug Detector',
      summary: 'No edge-case vulnerabilities found. Handles duplicate values properly due to sequential lookup.',
      metrics: 'Vulnerabilities: 0 | Memory Leaks: 0',
      badge: 'Zero Defects'
    },
    aiComplexity: {
      action: 'COMPLEXITY',
      title: 'Gemini 3.8 Flash • Big-O Complexity',
      summary: 'Time: O(n) — single pass with O(1) average dictionary lookups.\nSpace: O(n) — worst-case stores n-1 elements in hash map.',
      metrics: 'Time: O(n) • Space: O(n)',
      badge: 'Optimal Tier'
    },
    aiHint: {
      action: 'HINT',
      title: 'Gemini 3.8 Flash • Algorithmic Hint',
      summary: 'Try pre-allocating dictionary capacity if dealing with 10^7+ inputs, or use two-pointer technique if input is sorted.',
      metrics: 'Next Optimization Step',
      badge: 'Senior Pro-Tip'
    }
  },
  java: {
    filename: 'Solution.java',
    language: 'Java 21 (Temurin Sandbox)',
    code: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] result = twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println("Result: " + Arrays.toString(result));
    }
}`,
    output: `[Docker Runner] javac Solution.java && java Solution
Result: [0, 1]
✓ Execution time: 82ms | Memory: 28.5MB | Exit code: 0`,
    aiReview: {
      action: 'REVIEW',
      title: 'Gemini 3.8 Flash • Java 21 Review',
      summary: 'Excellent HashMap utilization. Safe boundary handling with empty array return fallback.',
      metrics: 'Time Complexity: O(n) | Space: O(n)',
      badge: 'Production Grade'
    },
    aiBugs: {
      action: 'BUGS',
      title: 'Gemini 3.8 Flash • Bug Detector',
      summary: 'Null-pointer safe if input arrays are validated. Thread-confined local variables prevent concurrency races.',
      metrics: 'Concurrency Safe',
      badge: 'Clean Audit'
    },
    aiComplexity: {
      action: 'COMPLEXITY',
      title: 'Gemini 3.8 Flash • Big-O Complexity',
      summary: 'Time: O(n) — Linear array iteration.\nSpace: O(n) — HashMap overhead with initial bucket capacity.',
      metrics: 'Time: O(n) • Space: O(n)',
      badge: 'High Efficiency'
    },
    aiHint: {
      action: 'HINT',
      title: 'Gemini 3.8 Flash • Algorithmic Hint',
      summary: 'Specify HashMap initial capacity `new HashMap<>((int)(nums.length / 0.75f) + 1)` to avoid dynamic rehash resizing.',
      metrics: 'JVM Heap Tuning',
      badge: 'JVM Pro-Tip'
    }
  },
  cpp: {
    filename: 'solution.cpp',
    language: 'C++20 (GCC Sandbox)',
    code: `#include <iostream>
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
        int complement = target - nums[i];
        auto it = seen.find(complement);
        if (it != seen.end()) {
            return {it->second, i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    auto res = twoSum({2, 7, 11, 15}, 9);
    std::cout << "Result: [" << res[0] << ", " << res[1] << "]" << std::endl;
    return 0;
}`,
    output: `[Docker Runner] g++ -O3 solution.cpp -o solution && ./solution
Result: [0, 1]
✓ Execution time: 12ms | Memory: 8.1MB | Exit code: 0`,
    aiReview: {
      action: 'REVIEW',
      title: 'Gemini 3.8 Flash • Modern C++ Review',
      summary: 'Pass-by-const-reference prevents vector copying. auto iterators adhere to modern C++ best practices.',
      metrics: 'Zero-Cost Abstractions',
      badge: 'Blazing Fast'
    },
    aiBugs: {
      action: 'BUGS',
      title: 'Gemini 3.8 Flash • Bug Detector',
      summary: 'No buffer overflows or memory leaks. Uses stack-allocated standard library containers cleanly.',
      metrics: 'Memory Safe',
      badge: 'Verified'
    },
    aiComplexity: {
      action: 'COMPLEXITY',
      title: 'Gemini 3.8 Flash • Big-O Complexity',
      summary: 'Time: O(n) average with std::unordered_map bucket hashing.\nSpace: O(n) allocation.',
      metrics: 'Time: O(n) • Space: O(n)',
      badge: 'Sub-millisecond'
    },
    aiHint: {
      action: 'HINT',
      title: 'Gemini 3.8 Flash • Algorithmic Hint',
      summary: 'Call `seen.reserve(nums.size())` to preallocate hash buckets and eliminate rehashing latency.',
      metrics: 'Memory Preallocation',
      badge: 'Optimization'
    }
  }
};

export default function Landing() {
  const [activeLang, setActiveLang] = useState('python');
  const [activeAiTab, setActiveAiTab] = useState('aiReview');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConsole, setShowConsole] = useState(false);

  const snippet = CODE_SNIPPETS[activeLang];
  const currentAi = snippet[activeAiTab];

  const handleSimulateRun = () => {
    setIsExecuting(true);
    setShowConsole(true);
    setTimeout(() => {
      setIsExecuting(false);
    }, 450);
  };

  return (
    <div className="landing-root">
      {/* Ambient background glows */}
      <div className="ambient-orb orb-primary" />
      <div className="ambient-orb orb-emerald" />
      <div className="ambient-orb orb-purple" />
      <div className="ambient-grid-overlay" />

      {/* Modern Floating Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="brand-logo" aria-label="CodeSync">
            <div className="logo-icon-wrapper">
              <Code2 size={22} className="logo-svg" />
            </div>
            <span className="brand-name">Code<span className="brand-accent">Sync</span></span>
            <span className="version-pill">v2.5 AI</span>
          </Link>

          <div className="header-status-pill">
            <span className="status-dot-pulse" />
            <span className="status-text">Gemini 3.8 Flash & Docker Sandbox Live</span>
          </div>

          <div className="header-nav-buttons">
            <Link to="/login" className="btn-glass">Sign In</Link>
            <Link to="/register" className="btn-glow-emerald">
              <span>Start Free</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-announcement">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Real-time Collaborative Coding with Google Gemini AI Co-Pilot</span>
          <span className="announcement-tag">New</span>
        </div>

        <h1 className="hero-headline">
          Code Together.<br />
          <span className="gradient-glow-text">Supercharged by Gemini AI.</span>
        </h1>

        <p className="hero-lead">
          The high-performance collaborative coding platform. Write code concurrently with conflict-free CRDT synchronization, execute in isolated Docker sandboxes, and inspect Big-O complexity with Gemini AI Co-Pilot.
        </p>

        <div className="hero-cta-group">
          <Link to="/register" className="btn-hero-primary">
            <Sparkles size={18} />
            <span>Launch CodeSync Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-hero-secondary">
            <span>Explore Demo Room</span>
          </Link>
        </div>

        {/* Live Interactive IDE & AI Co-Pilot Showcase */}
        <div className="ide-showcase-wrapper">
          <div className="ide-showcase-frame">
            {/* Window titlebar */}
            <div className="ide-window-bar">
              <div className="window-controls">
                <span className="control-dot dot-close" />
                <span className="control-dot dot-min" />
                <span className="control-dot dot-max" />
              </div>

              {/* Language Switcher Tabs */}
              <div className="ide-tabs">
                <button
                  type="button"
                  className={`ide-tab ${activeLang === 'python' ? 'active' : ''}`}
                  onClick={() => setActiveLang('python')}
                >
                  <FileCode2 size={14} className="tab-icon python-icon" />
                  <span>solution.py</span>
                </button>
                <button
                  type="button"
                  className={`ide-tab ${activeLang === 'java' ? 'active' : ''}`}
                  onClick={() => setActiveLang('java')}
                >
                  <FileCode2 size={14} className="tab-icon java-icon" />
                  <span>Solution.java</span>
                </button>
                <button
                  type="button"
                  className={`ide-tab ${activeLang === 'cpp' ? 'active' : ''}`}
                  onClick={() => setActiveLang('cpp')}
                >
                  <FileCode2 size={14} className="tab-icon cpp-icon" />
                  <span>solution.cpp</span>
                </button>
              </div>

              {/* Actions on Titlebar */}
              <div className="ide-bar-actions">
                <span className="active-collaborators">
                  <span className="avatar-chip alice">A</span>
                  <span className="avatar-chip bob">B</span>
                  <span className="collab-count">+2 online</span>
                </span>
                <button
                  type="button"
                  className={`btn-ide-run ${isExecuting ? 'running' : ''}`}
                  onClick={handleSimulateRun}
                >
                  <Play size={13} fill="currentColor" />
                  <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
                </button>
              </div>
            </div>

            {/* Main IDE Workspace: Editor + AI Co-Pilot Drawer */}
            <div className="ide-workspace-split">
              {/* Left Column: Monaco Code Editor Mock */}
              <div className="ide-editor-pane">
                <div className="editor-line-numbers">
                  {snippet.code.split('\n').map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>
                <div className="editor-code-container">
                  <pre className="code-text"><code>{snippet.code}</code></pre>
                  {/* Floating Collaborator Cursors */}
                  <div className="floating-cursor cursor-alice" style={{ top: '35%', left: '42%' }}>
                    <span className="cursor-caret caret-blue" />
                    <span className="cursor-tag tag-blue">Alice (editing)</span>
                  </div>
                  <div className="floating-cursor cursor-bob" style={{ top: '65%', left: '30%' }}>
                    <span className="cursor-caret caret-purple" />
                    <span className="cursor-tag tag-purple">Bob (active)</span>
                  </div>
                </div>

                {/* Console Output Drawer */}
                {showConsole && (
                  <div className="ide-console-drawer">
                    <div className="console-header">
                      <Terminal size={13} />
                      <span>Docker Sandbox Output</span>
                      <span className="sandbox-badge">network: none | 256MB RAM</span>
                      <button
                        type="button"
                        className="btn-console-close"
                        onClick={() => setShowConsole(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <pre className="console-content"><code>{snippet.output}</code></pre>
                  </div>
                )}
              </div>

              {/* Right Column: Gemini AI Co-Pilot Live Drawer */}
              <div className="ide-ai-drawer">
                <div className="ai-drawer-header">
                  <div className="ai-brand-badge">
                    <Sparkles size={14} className="gemini-star" />
                    <span>Gemini AI Co-Pilot</span>
                  </div>
                  <span className="ai-model-tag">gemini-3.8-flash</span>
                </div>

                {/* AI Action Switcher Chips */}
                <div className="ai-action-chips">
                  <button
                    type="button"
                    className={`ai-chip ${activeAiTab === 'aiReview' ? 'active' : ''}`}
                    onClick={() => setActiveAiTab('aiReview')}
                  >
                    <Bot size={13} />
                    <span>Code Review</span>
                  </button>
                  <button
                    type="button"
                    className={`ai-chip ${activeAiTab === 'aiBugs' ? 'active' : ''}`}
                    onClick={() => setActiveAiTab('aiBugs')}
                  >
                    <Bug size={13} />
                    <span>Bug Hunter</span>
                  </button>
                  <button
                    type="button"
                    className={`ai-chip ${activeAiTab === 'aiComplexity' ? 'active' : ''}`}
                    onClick={() => setActiveAiTab('aiComplexity')}
                  >
                    <Cpu size={13} />
                    <span>Big-O</span>
                  </button>
                  <button
                    type="button"
                    className={`ai-chip ${activeAiTab === 'aiHint' ? 'active' : ''}`}
                    onClick={() => setActiveAiTab('aiHint')}
                  >
                    <HelpCircle size={13} />
                    <span>Hint</span>
                  </button>
                </div>

                {/* AI Response Card */}
                <div className="ai-card-body">
                  <div className="ai-card-title-row">
                    <span className="ai-card-title">{currentAi.title}</span>
                    <span className="ai-badge-emerald">{currentAi.badge}</span>
                  </div>
                  <p className="ai-summary-text">{currentAi.summary}</p>
                  <div className="ai-metrics-footer">
                    <Activity size={13} className="metrics-icon" />
                    <span>{currentAi.metrics}</span>
                  </div>
                </div>

                {/* Prompt input field demo */}
                <div className="ai-input-preview">
                  <input
                    type="text"
                    disabled
                    placeholder="Ask Gemini: 'How can I optimize memory allocation?'"
                    className="ai-preview-input"
                  />
                  <button type="button" disabled className="btn-ai-send">
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="stats-strip">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">&lt; 20ms</span>
            <span className="stat-label">Execution Latency</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Isolated Docker Sandboxes</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">CRDT</span>
            <span className="stat-label">Conflict-Free RGA Sync</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">AWS Cloud</span>
            <span className="stat-label">ECS Fargate & S3 Native</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Architecture Features */}
      <section className="features-bento-section">
        <div className="section-header">
          <div className="pill-badge">Cloud-Native Architecture</div>
          <h2 className="section-title">Engineered for <span className="gradient-text">Speed, Security, and Intelligence</span></h2>
          <p className="section-subtitle">
            Every layer of CodeSync is built with modern distributed systems principles.
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Gemini AI */}
          <div className="bento-card bento-card-large">
            <div className="bento-card-icon emerald-icon-box">
              <Bot size={26} />
            </div>
            <div className="bento-card-content">
              <div className="bento-tag">Spring AI + Google Gemini</div>
              <h3>Intelligent Code Co-Pilot</h3>
              <p>
                Integrated with Google Gemini 3.8 Flash via OpenAI-compatible endpoints. Instant architectural reviews, memory leak audits, and algorithmic hint generation tailored specifically to the active programming language.
              </p>
              <ul className="bento-feature-list">
                <li><CheckCircle2 size={15} /> Line-by-line syntax & algorithmic review</li>
                <li><CheckCircle2 size={15} /> Automated Big-O time and space complexity audits</li>
                <li><CheckCircle2 size={15} /> Non-spoiler progressive hint progression</li>
              </ul>
            </div>
          </div>

          {/* Card 2: Docker Sandboxing */}
          <div className="bento-card">
            <div className="bento-card-icon blue-icon-box">
              <Shield size={24} />
            </div>
            <div className="bento-card-content">
              <div className="bento-tag">Security & Isolation</div>
              <h3>Docker Sandboxed Execution</h3>
              <p>
                Untrusted user code executes in dedicated, non-root Alpine containers with strict resource governance: zero network access (`--network none`), 256MB memory caps, and 10-second watchdog limits.
              </p>
            </div>
          </div>

          {/* Card 3: Real-Time CRDT */}
          <div className="bento-card">
            <div className="bento-card-icon purple-icon-box">
              <Zap size={24} />
            </div>
            <div className="bento-card-content">
              <div className="bento-tag">Real-Time Synchronization</div>
              <h3>Conflict-Free RGA CRDT</h3>
              <p>
                Never lose a keystroke. CodeSync utilizes Replicated Growable Array (RGA) CRDT mechanics combined with Redis Pub/Sub to synchronize edits seamlessly across distributed ECS Fargate nodes.
              </p>
            </div>
          </div>

          {/* Card 4: Multi-Language */}
          <div className="bento-card">
            <div className="bento-card-icon amber-icon-box">
              <Layers size={24} />
            </div>
            <div className="bento-card-content">
              <div className="bento-tag">Multi-Language Ecosystem</div>
              <h3>Python 3, Java 21 & C++20</h3>
              <p>
                Switch between Python 3.12, Eclipse Temurin Java 21, and GCC C++20 with a single click. Monaco Editor dynamically switches language syntax highlighting, linting, and runners.
              </p>
            </div>
          </div>

          {/* Card 5: Cloud Native */}
          <div className="bento-card bento-card-large">
            <div className="bento-card-icon cyan-icon-box">
              <Cpu size={26} />
            </div>
            <div className="bento-card-content">
              <div className="bento-tag">Serverless Cloud Infrastructure</div>
              <h3>AWS ECS Fargate & S3 Deployment</h3>
              <p>
                Deployed natively to AWS in the ap-south-1 region. S3 delivers static assets with edge-tier caching, while ECS Fargate orchestrates the Spring Boot backend, Redis cache, and PostgreSQL database with CloudWatch observability.
              </p>
              <ul className="bento-feature-list">
                <li><CheckCircle2 size={15} /> Zero EC2 maintenance with serverless Fargate</li>
                <li><CheckCircle2 size={15} /> S3 static website hosting with sub-second asset delivery</li>
                <li><CheckCircle2 size={15} /> CloudWatch multi-stream logs and IAM least-privilege roles</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2 className="cta-title">Ready to Elevate Your Coding Sessions?</h2>
          <p className="cta-subtitle">
            Join developers collaborating and preparing for technical interviews on CodeSync.
          </p>
          <div className="cta-actions">
            <Link to="/register" className="btn-hero-primary">
              <span>Start Coding Now — It&apos;s Free</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Code2 size={20} className="brand-icon" />
            <span className="brand-text">CodeSync</span>
            <span className="footer-tagline">— Built with Spring Boot, React 19, Docker & Google Gemini</span>
          </div>
          <p className="footer-copy">© 2026 CodeSync. Deployed to AWS ap-south-1.</p>
        </div>
      </footer>
    </div>
  );
}
