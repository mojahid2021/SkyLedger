"use client"

import React, { useState } from "react"
import { Mail, Phone, MapPin, MessageSquare, Send, Clock } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-8">
        {/* Header Block with Hero Banner */}
        <div 
          className="relative rounded-[8px] overflow-hidden bg-cover bg-center text-white border border-white/10 shadow-xl p-8 md:p-12"
          style={{ backgroundImage: "url('/images/hero_contact.jpg')" }}
        >
          {/* Gradients overlay to ensure legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-delta-navy-dark/95 via-delta-navy-dark/80 to-delta-navy-dark/30 pointer-events-none" />

          <div className="relative z-10 max-w-[650px] flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 bg-delta-red/35 border border-delta-red/30 text-white px-3 py-1 text-[11px] font-[800] uppercase tracking-wider w-fit rounded-full shadow-sm animate-pulse">
              <Mail className="h-3.5 w-3.5 text-white" />
              <span>Connect with SkyLedger</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-tight leading-none mt-2 text-shadow-md">
              Contact Our Support Team
            </h1>
            <p className="text-[15px] text-white/80 max-w-[580px] mt-2 font-normal leading-[22px] text-shadow-sm">
              We are available 24/7 to assist with ticket bookings, wallet refund processing, cancellations, and corporate account management.
            </p>
          </div>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form Container (Left) */}
          <div className="lg:col-span-8 bg-white border border-delta-hairline-light rounded-[6px] p-6 sm:p-8 shadow-2xs">
            <h2 className="text-[20px] font-[800] text-delta-navy tracking-tight mb-6">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-[6px] flex flex-col gap-2 items-center text-center animate-in fade-in duration-300">
                <MessageSquare className="h-10 w-10 text-emerald-600 animate-bounce" />
                <h3 className="font-[800] text-[16px] mt-2">Message Sent Successfully!</h3>
                <p className="text-[13px] text-emerald-800/80 font-normal">
                  Thank you for reaching out. A SkyLedger support representative will review and reply to your inquiry within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-[800] text-delta-navy uppercase tracking-widest">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="h-[44px] w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-1 px-4 text-[13px] font-semibold text-delta-navy outline-none transition-all focus:bg-white focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 placeholder-delta-navy/35 shadow-inner-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-[800] text-delta-navy uppercase tracking-widest">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="h-[44px] w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-1 px-4 text-[13px] font-semibold text-delta-navy outline-none transition-all focus:bg-white focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 placeholder-delta-navy/35 shadow-inner-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[800] text-delta-navy uppercase tracking-widest">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Wallet Refund Request"
                    className="h-[44px] w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-1 px-4 text-[13px] font-semibold text-delta-navy outline-none transition-all focus:bg-white focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 placeholder-delta-navy/35 shadow-inner-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[800] text-delta-navy uppercase tracking-widest">
                    Message Body
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details regarding your booking order, transaction references, or general travel policy questions..."
                    className="w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-1 p-4 text-[13px] font-semibold text-delta-navy outline-none transition-all focus:bg-white focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 placeholder-delta-navy/35 shadow-inner-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-delta-red hover:bg-delta-red-hover text-white text-[12px] font-[800] h-[46px] rounded-[4px] shadow-sm transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Details Cards (Right) */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            {/* Direct Channels */}
            <div className="bg-white border border-delta-hairline-light rounded-[6px] p-6 shadow-2xs">
              <h3 className="text-[16px] font-[800] text-delta-navy tracking-tight mb-4">
                Direct Contact Channels
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[6px] border border-delta-hairline-light">
                    <Phone className="h-5 w-5 text-delta-red" />
                  </div>
                  <div>
                    <p className="text-[10px] font-[800] text-delta-navy uppercase tracking-wider">Call Center Support</p>
                    <p className="text-[14px] font-[750] text-delta-navy mt-0.5">+1 (800) 555-0199</p>
                    <p className="text-[12px] text-delta-ink-muted">Toll-free within North America</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[6px] border border-delta-hairline-light">
                    <Mail className="h-5 w-5 text-delta-red" />
                  </div>
                  <div>
                    <p className="text-[10px] font-[800] text-delta-navy uppercase tracking-wider">Email Inquiry</p>
                    <p className="text-[14px] font-[750] text-delta-navy mt-0.5">support@skyledger.io</p>
                    <p className="text-[12px] text-delta-ink-muted">Response within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[6px] border border-delta-hairline-light">
                    <MapPin className="h-5 w-5 text-delta-red" />
                  </div>
                  <div>
                    <p className="text-[10px] font-[800] text-delta-navy uppercase tracking-wider">Headquarters Office</p>
                    <p className="text-[13px] font-[600] text-delta-navy mt-0.5">123 Aviation Way, Suite 500</p>
                    <p className="text-[12px] text-delta-ink-muted">New York, NY 10001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Alert */}
            <div className="bg-delta-navy text-white rounded-[6px] p-6 shadow-2xs border border-white/10 flex flex-col gap-3">
              <div className="inline-flex items-center gap-1 bg-emerald-600/35 border border-emerald-500/30 text-white px-2.5 py-0.5 text-[9px] font-[800] uppercase tracking-wider w-fit rounded-full">
                <Clock className="h-3 w-3 text-emerald-400" />
                <span>Online Now</span>
              </div>
              <h4 className="text-[15px] font-[800] tracking-tight">24/7 Operations Control</h4>
              <p className="text-[12.5px] text-white/80 leading-relaxed font-normal">
                Our flight monitoring desk and operations support lines operate 24 hours a day, 365 days a year. We handle active bookings and flight redirects without interruption.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
