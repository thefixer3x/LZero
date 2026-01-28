import FeatureCard from "@/components/feature-card"
import {
  BotIcon,
  SparklesIcon,
  DatabaseIcon,
  ShieldIcon,
  FileTextIcon,
  ServerIcon,
  LockIcon,
  ZapIcon,
} from "@/components/feature-icons"

export default function FeaturesSection() {
  const features = [
    {
      icon: <DatabaseIcon />,
      title: "Persistent Edge Memory",
      description:
        "Advanced semantic memory that lives on your infrastructure—not the cloud. Maintains context across sessions and learns from interactions without transmitting data.",
      accentColor: "rgba(36, 101, 237, 0.5)",
    },
    {
      icon: <ZapIcon />,
      title: "Millisecond Response Times",
      description: "No waiting for cloud round-trips. L0 executes reasoning locally on edge hardware with single-digit millisecond latencies.",
      accentColor: "rgba(236, 72, 153, 0.5)",
    },
    {
      icon: <ServerIcon />,
      title: "Works Anywhere, Anytime",
      description: "Connectivity is optional. L0 reasons locally and syncs when available. Perfect for field operations and air-gapped environments.",
      accentColor: "rgba(34, 211, 238, 0.5)",
    },
    {
      icon: <ShieldIcon />,
      title: "Data Never Leaves Your Perimeter",
      description: "Bank-level encryption, zero cloud transmission, and compliance-native architecture. HIPAA, GDPR, FedRAMP ready by design.",
      accentColor: "rgba(132, 204, 22, 0.5)",
    },
    {
      icon: <BotIcon />,
      title: "Multi-Agent Orchestration",
      description: "Build sophisticated multi-step reasoning chains without cloud dependencies. Deploy teams of specialized agents that coordinate on-device.",
      accentColor: "rgba(249, 115, 22, 0.5)",
    },
    {
      icon: <SparklesIcon />,
      title: "Zero Per-Inference Costs",
      description: "No API tokens, no per-request billing, no surprise scaling costs. Compute cost is limited to your hardware—full stop.",
      accentColor: "rgba(168, 85, 247, 0.5)",
    },
    {
      icon: <FileTextIcon />,
      title: "Local Knowledge Base",
      description:
        "Ingest documents and organizational knowledge directly into L0's edge memory. All indexing and retrieval happens locally.",
      accentColor: "rgba(251, 191, 36, 0.5)",
    },
    {
      icon: <LockIcon />,
      title: "Data Sovereignty by Design",
      description: "Privacy isn't a feature—it's the foundation. No cloud data transmission, no external telemetry, no analytics.",
      accentColor: "rgba(16, 185, 129, 0.5)",
    },
  ]

  return (
    <section className="py-20 bg-muted/50 dark:bg-muted/10" id="features" aria-labelledby="features-heading">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2">
              Key Features
            </div>
            <h2 id="features-heading" className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Edge Reasoning, Enterprise Grade
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Infrastructure designed for organizations that can't compromise on latency, privacy, or control.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accentColor={feature.accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
