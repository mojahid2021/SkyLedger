"use client"

import React from "react"
import { Users, Mail, ChevronRight, Terminal, ShieldCheck, Palette, BookOpen, FileSpreadsheet } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { motion } from "framer-motion"

interface TeamMember {
  name: string
  id: string
  role: string
  roleDescription: string
  initials: string
  gradient: string
  bio: string
  email: string
  icon: any
  responsibilities: string[]
  image?: string
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Mojahid",
    id: "242-15-005",
    role: "Development",
    roleDescription: "Core Developer",
    initials: "MO",
    gradient: "from-delta-navy via-delta-navy-mid to-sky-600",
    bio: "Manages full-stack development, database integrations, and ledger deployment pipelines.",
    responsibilities: ["Feature Development", "System Architecture", "Bug Fixing & Reviews"],
    email: "mojahid@example.com",
    icon: Terminal,
    image: "/mojahid.jpg",
  },
  {
    name: "Mishad",
    id: "242-15-261",
    role: "Tester",
    roleDescription: "Quality Assurance",
    initials: "MI",
    gradient: "from-delta-red to-rose-600",
    bio: "Focuses on test-driven development, automated validation, and user flow integration testing.",
    responsibilities: ["Testing & QA", "Bug Detection", "Performance Auditing"],
    email: "mishad@example.com",
    icon: ShieldCheck,
    image: "/mishad.jpeg",
  },
  {
    name: "Mitul",
    id: "242-15-100",
    role: "UI Design",
    roleDescription: "Frontend & Layout",
    initials: "MT",
    gradient: "from-emerald-600 to-teal-500",
    bio: "Creates responsive user interfaces, layout grids, components styling, and premium interactive animations.",
    responsibilities: ["UI/UX Layouts", "Component Design", "Responsive Interfaces"],
    email: "mitul@example.com",
    icon: Palette,
  },
  {
    name: "Afrin",
    id: "242-15-011",
    role: "Doc & Resource Collect",
    roleDescription: "Research & Documentation",
    initials: "AF",
    gradient: "from-amber-600 to-orange-500",
    bio: "Gathers system requirements, handles data seeding preparation, and documents microservices endpoints.",
    responsibilities: ["Research & Planning", "API Documentation", "Data Seeding Configs"],
    email: "afrin@example.com",
    icon: BookOpen,
    image: "/afrin.jpeg",
  },
  {
    name: "Rony",
    id: "242-15-266",
    role: "Project Report",
    roleDescription: "Technical Writer",
    initials: "RO",
    gradient: "from-purple-600 to-indigo-500",
    bio: "Compiles system overview logs, creates final layout reports, and manages overall project formatting standards.",
    responsibilities: ["Report Writing", "Formatting Standards", "Log Aggregation"],
    email: "rony@example.com",
    icon: FileSpreadsheet,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14,
    },
  },
}

export default function TeamPage() {
  const leader = TEAM_MEMBERS[0]
  const mates = TEAM_MEMBERS.slice(1)

  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-12 flex flex-col gap-12">
        {/* Header Block with Hero Banner */}
        <div 
          className="relative rounded-[8px] overflow-hidden bg-cover bg-center text-white border border-white/10 shadow-xl p-8 md:p-12"
          style={{ backgroundImage: "url('/images/hero_team.jpg')" }}
        >
          {/* Gradients overlay to ensure legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-delta-navy-dark/95 via-delta-navy-dark/80 to-delta-navy-dark/30 pointer-events-none" />

          <div className="relative z-10 max-w-[650px] flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 bg-delta-red/35 border border-delta-red/30 text-white px-3 py-1 text-[11px] font-[800] uppercase tracking-wider w-fit rounded-full shadow-sm animate-pulse">
              <Users className="h-3.5 w-3.5 text-white" />
              <span>Engineering Team</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-tight leading-none mt-2 text-shadow-md">
              Meet Our Development Team
            </h1>
            <p className="text-[15px] text-white/80 max-w-[580px] mt-2 font-normal leading-[22px] text-shadow-sm">
              The software engineering, UI design, QA testing, and technical documentation team behind SkyLedger.
            </p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex flex-col gap-2 items-center text-center">
          <span className="text-[12px] font-[800] uppercase tracking-widest text-delta-red px-3 py-1 bg-delta-red/5 rounded-full border border-delta-red/10">
            Software Development Team
          </span>
          <h2 className="text-[26px] sm:text-[32px] font-[850] text-delta-navy tracking-tight mt-1">
            Core Developers & Team Members
          </h2>
          <div className="h-1 w-12 bg-delta-red mt-2 rounded-full" />
        </div>

        {/* Motion Container */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-10"
        >
          {/* Team Leader - Mojahid */}
          <motion.div 
            variants={itemVariants}
            className="relative bg-white border border-delta-hairline/60 rounded-[8px] shadow-sm hover:shadow-md hover:border-delta-navy/40 transition-all duration-300 flex flex-col md:flex-row items-stretch overflow-hidden group"
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-delta-navy/5 rounded-bl-full pointer-events-none group-hover:bg-delta-navy/8 transition-colors duration-300" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-delta-red/5 rounded-full blur-xl pointer-events-none" />

            {/* Custom Full-Width/Height ID Badge Image */}
            <div className="relative shrink-0 w-full md:w-[280px] lg:w-[320px] aspect-square md:aspect-auto h-[320px] md:h-auto min-h-[300px] overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${leader.gradient} text-white flex flex-col items-center justify-center relative overflow-hidden`}>
                {leader.image ? (
                  <img 
                    src={leader.image} 
                    alt={leader.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-[64px] font-[900] tracking-tight">{leader.initials}</span>
                )}
                <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2.5 py-0.5 rounded font-mono font-[700] tracking-wider select-all uppercase backdrop-blur-xs shadow-xs">
                  ID: {leader.id}
                </span>
                <div className="absolute top-3 left-3 flex items-center gap-1.5 text-delta-red font-[800] text-[10px] uppercase tracking-wider bg-black/60 border border-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-delta-red animate-ping" />
                  Team Leader
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 text-center md:text-left z-10 w-full">
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h3 className="text-[24px] font-[900] text-delta-navy tracking-tight">
                    {leader.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 bg-delta-navy/5 text-delta-navy border border-delta-navy/15 text-[11px] font-[850] px-3 py-1 rounded w-fit self-center md:self-auto uppercase tracking-wide">
                    <leader.icon className="h-3.5 w-3.5 text-delta-navy" />
                    <span>{leader.role}</span>
                  </div>
                </div>
                <p className="text-[14px] text-delta-red font-[700] uppercase tracking-wider mt-1">
                  {leader.roleDescription}
                </p>
              </div>

              <p className="text-[14px] text-delta-ink-muted leading-[22px] font-normal my-3">
                {leader.bio}
              </p>

              {/* Responsibilities list */}
              <div className="flex flex-col gap-2 border-t border-delta-hairline/60 pt-4">
                <span className="text-[11px] font-[850] text-delta-navy uppercase tracking-wider block">
                  Core Responsibilities
                </span>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {leader.responsibilities.map((resp, i) => (
                    <span key={i} className="text-[12px] font-semibold bg-delta-surface-2 text-delta-ink px-3 py-1 rounded-[4px] border border-delta-hairline-light">
                      {resp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Button */}
              <a 
                href={`mailto:${leader.email}`}
                className="mt-4 self-center md:self-start inline-flex items-center gap-2 text-[12px] font-[850] uppercase tracking-widest text-white bg-delta-navy hover:bg-delta-red transition-all px-5 py-2.5 rounded-[4px] shadow-sm hover:scale-[1.02] duration-200"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Leader</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Subheading for teammates */}
          <motion.div variants={itemVariants} className="border-t border-delta-hairline/60 pt-6">
            <h3 className="text-[18px] font-[850] text-delta-navy tracking-tight mb-2">
              Engineering & Project Team Members
            </h3>
          </motion.div>

          {/* Teammates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mates.map((member, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative bg-white border border-delta-hairline/60 rounded-[8px] shadow-2xs hover:shadow-md hover:border-delta-navy/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-delta-navy/3 rounded-bl-full pointer-events-none group-hover:bg-delta-navy/5 transition-colors duration-300" />

                {/* Header Full-Width Image Container */}
                <div className={`relative w-full aspect-square bg-gradient-to-br ${member.gradient} text-white flex flex-col items-center justify-center overflow-hidden`}>
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-[52px] font-[900] tracking-tight">{member.initials}</span>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[9.5px] px-2.5 py-0.5 rounded font-mono font-[700] tracking-wider select-all uppercase backdrop-blur-xs shadow-xs">
                    ID: {member.id}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  {/* Top Section */}
                  <div className="flex flex-col items-center text-center">
                    {/* Name and Role */}
                    <h4 className="text-[18px] font-[900] text-delta-navy group-hover:text-delta-red transition-colors duration-200">
                      {member.name}
                    </h4>
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-delta-navy/5 text-delta-navy border border-delta-navy/10 text-[10px] font-[850] px-2.5 py-0.5 rounded uppercase tracking-wide">
                      <member.icon className="h-3 w-3 text-delta-navy" />
                      <span>{member.role}</span>
                    </div>
                    <span className="text-[11px] font-[700] text-delta-red/90 uppercase tracking-wider mt-1 block">
                      {member.roleDescription}
                    </span>

                    <p className="mt-3 text-[13px] text-delta-ink-muted leading-[19px] font-normal">
                      {member.bio}
                    </p>
                  </div>

                  {/* Middle - Responsibilities list */}
                  <div className="border-t border-delta-hairline-light pt-3 mt-4 flex flex-col gap-1.5 w-full text-left">
                    <span className="text-[10px] font-[850] text-delta-navy uppercase tracking-wider">
                      Responsibilities
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {member.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[12px] text-delta-ink font-medium leading-[16px]">
                          <div className="h-1.5 w-1.5 bg-delta-red rounded-full mt-1.5 shrink-0" />
                          <span>{resp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom - Contact Link */}
                  <div className="border-t border-delta-hairline-light pt-4 mt-4 w-full">
                    <a 
                      href={`mailto:${member.email}`}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] font-[850] uppercase tracking-widest text-delta-navy hover:text-delta-red transition-colors py-1.5 hover:bg-delta-surface-2 rounded"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Send Message</span>
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
