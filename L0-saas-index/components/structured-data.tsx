export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "L0 Edge Reasoning Infrastructure",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Edge reasoning infrastructure for enterprise: persistent memory, zero-latency inference, offline-first execution, and complete data privacy.",
    featureList: [
      "Persistent Edge Memory",
      "Zero-Latency Reasoning",
      "Offline-First Execution",
      "Zero Per-Inference Costs",
      "Compliance-Native Privacy",
      "Multi-Agent Orchestration",
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}
