"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FrostedGlassIcon from "@/components/frosted-glass-icon"
import {
  BuildingIcon,
  GovernmentIcon,
  FinanceIcon,
  HealthcareIcon,
  LegalIcon,
  EducationIcon,
} from "@/components/use-case-icons"

export default function UseCases() {
  const useCases = [
    {
      icon: <HealthcareIcon />,
      title: "Privacy-Compliant Diagnostics",
      description:
        "Process patient data with on-device reasoning. Meet HIPAA compliance without cloud residency. Millisecond latency for real-time clinical support.",
      accentColor: "rgba(239, 68, 68, 0.5)",
    },
    {
      icon: <FinanceIcon />,
      title: "Real-Time Risk Assessment",
      description:
        "Analyze transactions and detect anomalies without transmitting financial data. Edge reasoning enables instant decisions at the point of transaction.",
      accentColor: "rgba(245, 158, 11, 0.5)",
    },
    {
      icon: <GovernmentIcon />,
      title: "Secure Government Operations",
      description:
        "Deploy reasoning workloads in classified environments and air-gapped networks. FedRAMP compliant, offline-first operation.",
      accentColor: "rgba(139, 92, 246, 0.5)",
    },
    {
      icon: <BuildingIcon />,
      title: "Field Operations & Logistics",
      description:
        "Enable field agents with AI reasoning that works offline. Real-time decisions happen locally and sync when connectivity returns.",
      accentColor: "rgba(59, 130, 246, 0.5)",
    },
    {
      icon: <LegalIcon />,
      title: "Centralized Knowledge, Distributed Reasoning",
      description:
        "Build a single source of truth that lives on your infrastructure. Instant knowledge retrieval and intelligent search across all organizational data.",
      accentColor: "rgba(132, 204, 22, 0.5)",
    },
    {
      icon: <EducationIcon />,
      title: "IoT & Edge Intelligence",
      description: "Deploy reasoning directly on IoT devices and edge nodes. Process sensor data locally with millisecond decisions. No cloud round-trips.",
      accentColor: "rgba(14, 165, 233, 0.5)",
    },
  ]

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  // Animation variants for individual items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <section
      id="use-cases"
      className="py-20 bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-muted/10"
      aria-labelledby="use-cases-heading"
    >
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground mb-2">
              Use Cases
            </div>
            <h2 id="use-cases-heading" className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              L0 in Action: Real-World Enterprise Applications
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              From healthcare to government, finance to field operations—L0 powers reasoning where it matters most.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {useCases.map((useCase, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-background/60 backdrop-blur-sm border transition-all duration-300 hover:shadow-lg dark:bg-background/80">
                <CardHeader className="pb-2">
                  <FrostedGlassIcon icon={useCase.icon} color={useCase.accentColor} className="mb-4" />
                  <CardTitle>{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{useCase.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
