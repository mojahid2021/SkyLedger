"use client"

import React from "react"
import { Users, Award, Mail, ChevronRight } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

interface TeamMember {
  name: string
  role: string
  initials: string
  gradient: string
  bio: string
  email: string
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Sarah Jenkins",
    role: "Chief Executive Officer (CEO)",
    initials: "SJ",
    gradient: "from-delta-navy to-delta-navy-mid",
    bio: "Over 18 years of aviation logistics and corporate management experience. Former Director of Network Operations at global commercial carriers.",
    email: "s.jenkins@skyledger.io",
  },
  {
    name: "David Miller",
    role: "Chief Technology Officer (CTO)",
    initials: "DM",
    gradient: "from-delta-red to-delta-red-hover",
    bio: "Ex-aerospace systems engineer. Specializes in real-time booking algorithms, microservices scaling, and distributed airline database ledgers.",
    email: "d.miller@skyledger.io",
  },
  {
    name: "Elena Rodriguez",
    role: "VP of Engineering",
    initials: "ER",
    gradient: "from-emerald-600 to-emerald-500",
    bio: "Leads database integrity and core payment Gateway integrations. Dedicated to security audits, performance indexing, and code quality controls.",
    email: "e.rodriguez@skyledger.io",
  },
  {
    name: "James Coleman",
    role: "Head of Product Design",
    initials: "JC",
    gradient: "from-amber-600 to-amber-500",
    bio: "Crafts premium travel interfaces and user experiences. Focused on responsive component libraries, travel accessibility, and simplified checkout flows.",
    email: "j.coleman@skyledger.io",
  },
]

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-10">
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
              <span>Project Leadership</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-tight leading-none mt-2 text-shadow-md">
              Meet Our Core Team
            </h1>
            <p className="text-[15px] text-white/80 max-w-[580px] mt-2 font-normal leading-[22px] text-shadow-sm">
              We combine deep airline business knowledge with top-tier technology experience to make modern flight booking and travel loyalty rewarding.
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-[800] uppercase tracking-wider text-delta-red">Executive & Engineering Directors</p>
            <h2 className="text-[22px] sm:text-[26px] font-[850] text-delta-navy tracking-tight leading-none">
              SkyLedger Officers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {TEAM_MEMBERS.map((member, idx) => (
              <div 
                key={idx}
                className="group flex flex-col rounded-[6px] border border-delta-hairline-light bg-white p-6 shadow-2xs hover:shadow-md hover:border-delta-navy transition-all duration-300 items-center text-center"
              >
                {/* Custom Initials Avatar with Gradient Ring */}
                <div className="relative mb-5 p-1 rounded-full border border-delta-hairline-light group-hover:border-delta-navy transition-all duration-300">
                  <div className={`h-20 w-20 rounded-full bg-gradient-to-tr ${member.gradient} text-white flex items-center justify-center text-[24px] font-[800] tracking-wider shadow-sm uppercase`}>
                    {member.initials}
                  </div>
                </div>

                {/* Info details */}
                <h3 className="text-[17px] font-[800] text-delta-navy group-hover:text-delta-red transition-colors duration-200">
                  {member.name}
                </h3>
                <span className="text-[12px] font-[750] text-delta-red/90 uppercase tracking-wide mt-1">
                  {member.role}
                </span>

                <p className="mt-4 text-[13px] text-delta-ink-muted leading-[20px] font-normal flex-1">
                  {member.bio}
                </p>

                {/* Email link trigger */}
                <a 
                  href={`mailto:${member.email}`}
                  className="mt-6 flex items-center gap-1.5 text-[11px] font-[850] uppercase tracking-widest text-delta-navy hover:text-delta-red transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Contact</span>
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
