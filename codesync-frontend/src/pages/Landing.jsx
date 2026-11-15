import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Users,
  Bot,
  Play,
  Terminal,
  FileCode2,
  Bug,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  Server
} from 'lucide-react';
import './Landing.css';

const PREVIEW_SNIPPETS = {
  python: {
    filename: 'solution.py',
    language: 'Python',
    code: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for idx, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], idx]
        seen[num] = idx
    return []

print(two_sum([2, 7, 11, 15], 9))`,
    output: `Result: [0, 1]
Exit code: 0`,
    ai: {
      review: 'Uses a hash map for a single-pass lookup. Input validation for empty or single-element lists is recommended.',
      bugs: 'No obvious syntax or logic errors. Ensure integer constraints are respected for very large target values.',
      complexity: 'Time Complexity: O(n)\nSpace Complexity: O(n)',
      hint: 'If the array is guaranteed to be sorted, a two-pointer approach can achieve O(1) auxiliary space.'
    }
  },
  java: {
    filename: 'Main.java',
    language: 'Java',
    code: `import java.util.*;

public class Main {
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
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));
    }
}`,
    output: `[0, 1]
Exit code: 0`,
    ai: {
      review: 'Standard HashMap implementation. Returning an empty array instead of null prevents NullPointerExceptions.',
      bugs: 'Thread-confined local variables. Check for null or empty input array in production use.',
      complexity: 'Time Complexity: O(n)\nSpace Complexity: O(n)',
      hint: 'You can pre-size the HashMap if the expected element count is known to reduce rehashing.'
    }
  },
  cpp: {
    filename: 'main.cpp',
    language: 'C++',
    code: `#include <iostream>
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    auto res = twoSum({2, 7, 11, 15}, 9);
    std::cout << "[" << res[0] << ", " << res[1] << "]" << std::endl;
    return 0;
}`,
    output: `[0, 1]
Exit code: 0`,
    ai: {
      review: 'Passes vector by const reference to avoid unnecessary copies. Clean standard library usage.',
      bugs: 'Proper static_cast on size() avoids signed/unsigned comparison warnings.',
      complexity: 'Time Complexity: O(n)\nSpace Complexity: O(n)',
      hint: 'Call seen.reserve(nums.size()) to pre-allocate hash buckets for larger inputs.'
    }
  }
};

export default function Landing() {
  const [selectedLang, setSelectedLang] = useState('python');
  const [activeTab, setActiveTab] = useState('review');
  const [showConsole, setShowConsole] = useState(false);

  const snippet = PREVIEW_SNIPPETS[selectedLang];

  return (
    <div className="landing-root">
      {/* Navigation */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="brand-logo">
            <div className="logo-icon-wrapper">
              <Code2 size={20} />
            </div>
            <span className="brand-name">Code<span className="brand-accent">Sync</span></span>
          </Link>

          <nav className="header-nav-links">
            <a href="#features">Features</a>
            <a href="#architecture">Architecture</a>
          </nav>

          <div className="header-nav-buttons">
            <Link to="/login" className="btn-secondary-nav">Sign In</Link>
            <Link to="/register" className="btn-primary-nav">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <h1 className="hero-headline">
          Real-Time Collaborative<br />
          <span className="gradient-accent-text">Code Editor</span>
        </h1>

        <p className="hero-lead">
          A full-stack collaborative editor with isolated code execution for Python, Java, and C++, paired with an AI assistant for code review and complexity analysis.
        </p>

        <div className="hero-cta-group">
          <Link to="/register" className="btn-hero-primary">
            <span>Get Started</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-hero-secondary">
            <span>Sign In</span>
          </Link>
        </div>

        {/* Realistic IDE & AI Assistant Preview */}
        <div className="ide-showcase-wrapper">
          <div className="ide-showcase-frame">
            {/* Window bar */}
            <div className="ide-window-bar">
              <div className="window-controls">
                <span className="control-dot dot-close" />
                <span className="control-dot dot-min" />
                <span className="control-dot dot-max" />
              </div>

              {/* Language switcher */}
              <div className="ide-tabs">
                <button
                  type="button"
                  className={`ide-tab ${selectedLang === 'python' ? 'active' : ''}`}
                  onClick={() => setSelectedLang('python')}
                >
                  <FileCode2 size={13} />
                  <span>solution.py</span>
                </button>
                <button
                  type="button"
                  className={`ide-tab ${selectedLang === 'java' ? 'active' : ''}`}
                  onClick={() => setSelectedLang('java')}
                >
                  <FileCode2 size={13} />
                  <span>Main.java</span>
                </button>
                <button
                  type="button"
                  className={`ide-tab ${selectedLang === 'cpp' ? 'active' : ''}`}
                  onClick={() => setSelectedLang('cpp')}
                >
                  <FileCode2 size={13} />
                  <span>main.cpp</span>
                </button>
              </div>

              {/* Run button */}
              <div className="ide-bar-actions">
                <button
                  type="button"
                  className="btn-ide-run"
                  onClick={() => setShowConsole(!showConsole)}
                >
                  <Play size={12} fill="currentColor" />
                  <span>{showConsole ? 'Hide Output' : 'Run'}</span>
                </button>
              </div>
            </div>

            {/* Split workspace */}
            <div className="ide-workspace-split">
              {/* Code Editor */}
              <div className="ide-editor-pane">
                <div className="editor-line-numbers">
                  {snippet.code.split('\n').map((_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>
                <div className="editor-code-container">
                  <pre className="code-text"><code>{snippet.code}</code></pre>
                </div>

                {showConsole && (
                  <div className="ide-console-drawer">
                    <div className="console-header">
                      <Terminal size={12} />
                      <span>Execution Output</span>
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

              {/* AI Assistant Panel */}
              <div className="ide-ai-drawer">
                <div className="ai-drawer-header">
                  <div className="ai-brand-badge">
                    <Bot size={15} />
                    <span>AI Assistant</span>
                  </div>
                  <span className="ai-model-tag">Gemini API</span>
                </div>

                <div className="ai-action-chips">
                  <button
                    type="button"
                    className={`ai-chip ${activeTab === 'review' ? 'active' : ''}`}
                    onClick={() => setActiveTab('review')}
                  >
                    <FileCode2 size={12} />
                    <span>Review</span>
                  </button>
                  <button
                    type="button"
                    className={`ai-chip ${activeTab === 'bugs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bugs')}
                  >
                    <Bug size={12} />
                    <span>Bugs</span>
                  </button>
                  <button
                    type="button"
                    className={`ai-chip ${activeTab === 'complexity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('complexity')}
                  >
                    <Cpu size={12} />
                    <span>Complexity</span>
                  </button>
                  <button
                    type="button"
                    className={`ai-chip ${activeTab === 'hint' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hint')}
                  >
                    <HelpCircle size={12} />
                    <span>Hint</span>
                  </button>
                </div>

                <div className="ai-card-body">
                  <p className="ai-summary-text">{snippet.ai[activeTab]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Core Features</h2>
          <p className="section-subtitle">
            Essential tools for real-time collaboration and code practice.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <Users size={20} />
            </div>
            <h3>Collaborative Rooms</h3>
            <p>
              Create or join rooms using a shared 8-character code. Changes are synchronized across connected members via WebSockets.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Shield size={20} />
            </div>
            <h3>Sandboxed Execution</h3>
            <p>
              Executes Python, Java, and C++ code in isolated container environments with configurable timeout and memory limits.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Bot size={20} />
            </div>
            <h3>AI Code Assistant</h3>
            <p>
              Request on-demand code reviews, bug checks, algorithmic hints, or Big-O complexity estimates via the Gemini API.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Layers size={20} />
            </div>
            <h3>Multi-Language Support</h3>
            <p>
              Switch between Python, Java, and C++ within the Monaco Editor, with syntax highlighting and language-specific compilers.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section id="architecture" className="architecture-section">
        <div className="section-header">
          <h2 className="section-title">Architecture Overview</h2>
          <p className="section-subtitle">
            How the components communicate across the stack.
          </p>
        </div>

        <div className="arch-grid">
          <div className="arch-card">
            <div className="arch-tier-label">Frontend</div>
            <h3>React + Monaco Editor</h3>
            <p>
              Single-page application hosted on Amazon S3. Handles editor state, WebSocket communication, and responsive layouts.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-tier-label">Backend</div>
            <h3>Spring Boot 3</h3>
            <p>
              Handles REST APIs, WebSocket message routing, JWT authentication, and Spring AI integration for model requests.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-tier-label">Infrastructure</div>
            <h3>AWS ECS Fargate & Docker</h3>
            <p>
              Serverless container runtime running backend, Redis for pub/sub messaging, and PostgreSQL for user and room persistence.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Code2 size={18} />
            <span>CodeSync</span>
          </div>
          <p className="footer-copy">Built with Spring Boot, React, Docker, and AWS.</p>
        </div>
      </footer>
    </div>
  );
}
