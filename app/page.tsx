"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ScenarioFreq = { id: string; count: number; share: number };

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/dashboard.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>加载历史档案...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="error-screen">
        <h2>无法加载数据</h2>
        <p>请检查 public/data/dashboard.json 是否存在</p>
      </div>
    );
  }

  const scenarios: ScenarioFreq[] = Object.entries(data.ensemble?.scenario_frequency || {})
    .map(([id, count]) => ({
      id,
      count: count as number,
      share: (data.ensemble?.scenario_share?.[id] || 0) as number,
    }))
    .sort((a, b) => b.count - a.count);

  const totalRuns = data.ensemble?.run_count || 20;

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">反事实历史模拟</div>
          <h1 className="hero-title">
            如果清政府<br />挺过辛亥革命
          </h1>
          <p className="hero-subtitle">
            多Agent历史演化模拟：18位历史人物，10种可能结局，基于学术文献的严肃推演
          </p>
          <div className="hero-premise">
            <div className="premise-icon">📜</div>
            <div>
              <h3>核心设定</h3>
              <p>
                袁世凯与立宪派达成密室协议："保皇换立宪"——清廷交出全部军政实权，
                皇帝退居虚位，实权内阁由袁世凯组阁，张謇掌控财政，汤化龙主持地方自治立法。
                <strong>皇权被法律彻底关进笼子</strong>，这个君主立宪体制将如何演化？
              </p>
            </div>
          </div>
          <div className="hero-actions">
            <Link href="/dashboard" className="btn-primary">
              查看完整模拟结果
            </Link>
            <Link href="/simulator" className="btn-secondary">
              开始新的模拟
            </Link>
          </div>
        </div>
      </section>

      {/* Destiny Tree Preview */}
      <section className="destiny-preview">
        <div className="section-header">
          <h2>🗺️ 历史命运树</h2>
          <p>基于{totalRuns}次独立模拟运行的结果分布</p>
        </div>
        <div className="destiny-bars">
          {scenarios.slice(0, 6).map((sc) => (
            <div key={sc.id} className="destiny-bar-item">
              <div className="destiny-bar-header">
                <span className="scenario-label">{getScenarioLabel(sc.id)}</span>
                <span className="scenario-share">{(sc.share * 100).toFixed(1)}%</span>
              </div>
              <div className="destiny-bar-track">
                <div
                  className="destiny-bar-fill"
                  style={{
                    width: `${sc.share * 100}%`,
                    background: getScenarioColor(sc.id),
                  }}
                />
              </div>
              <div className="scenario-count">{sc.count}次 / {totalRuns}次运行</div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🎭</div>
          <h3>18位历史人物</h3>
          <p>袁世凯、张謇、汤化龙、孙中山、梁启超等，每个Agent基于学术文献构建真实persona</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔬</div>
          <h3>结构化裁判系统</h3>
          <p>宪政、军事、财政、外交四大裁判模块，确保模拟结果符合历史逻辑和制度约束</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>20维国家指标</h3>
          <p>合法性、军事风险、财政健康、革命压力等多维度动态追踪</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎲</div>
          <h3>不确定性建模</h3>
          <p>军队忠诚、谈判成败、暗杀风险、地方叛乱等随机事件，每次运行产生不同历史路径</p>
        </div>
      </section>

      {/* Methodology Notice */}
      <section className="methodology-notice">
        <h3>⚠️ 学术严肃性声明</h3>
        <p>{data.methodologyNotice}</p>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>基于 DeepSeek 大语言模型 · 开源于 GitHub</p>
        <p className="footer-meta">
          数据生成时间：{new Date(data.generatedAt).toLocaleString("zh-CN")}
        </p>
      </footer>
    </div>
  );
}

function getScenarioLabel(id: string): string {
  const labels: Record<string, string> = {
    A: "A · 稳定议会君主制",
    B: "B · 袁世凯威权君主立宪",
    C: "C · 袁—议会宪政危机",
    D: "D · 共和革命再次发动",
    E: "E · 事实联邦制演化",
    F: "F · 北洋军分裂军阀化",
    G: "G · 宫廷保皇派反扑",
    H: "H · 清朝最终覆灭",
    I: "I · 议会成功约束袁世凯",
    J: "J · 复合过渡路径",
  };
  return labels[id] || id;
}

function getScenarioColor(id: string): string {
  const colors: Record<string, string> = {
    A: "#4e9f8f",
    B: "#b36d42",
    C: "#d39a3d",
    D: "#c84f4f",
    E: "#629a70",
    F: "#69779c",
    G: "#8c6fa5",
    H: "#3e4653",
    I: "#398aa0",
    J: "#727980",
  };
  return colors[id] || "#666";
}
