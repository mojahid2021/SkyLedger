"use client"

import React, { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AirplaneTilt,
  User,
  CheckCircle,
  XCircle,
  DownloadSimple,
  Barcode,
  ShieldCheck,
} from "@phosphor-icons/react"
import { BookingDetail } from "@/components/user/e-ticket-dialog"
import dynamic from "next/dynamic"
import { TicketPDF } from "./ticket-pdf"

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
)

interface ETicketInlineProps {
  booking: BookingDetail | null
  onDone?: () => void
}

const getCabinClassLabel = (cabin: string) => {
  switch (cabin?.toLowerCase()) {
    case "premium_economy": return "Premium Economy"
    case "first":           return "First Class"
    case "business":        return "Business Class"
    default:                return "Economy Class"
  }
}

// Canvas confetti — DESIGN.md accent colors only
const CONFETTI_COLORS = ["#e31837", "#003366", "#2e7d32", "#005480", "#e65100"]

function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const animRef   = React.useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 80,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 4 + Math.random() * 5,
      rotation: Math.random() * 360,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
    }))

    let frame = 0
    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rotation += 4; p.vy += 0.06
        const alpha = Math.max(0, 1 - p.y / canvas.height)
        ctx.save()
        ctx.globalAlpha = alpha * 0.85
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.45)
        ctx.restore()
        if (p.y > canvas.height + 20 && frame < 180) {
          p.y = -10; p.x = Math.random() * canvas.width; p.vy = 2 + Math.random() * 4
        }
      })
      if (frame < 300) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [active])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-sm"
    />
  )
}

export function ETicketInline({ booking, onDone }: ETicketInlineProps) {
  const reduceMotion = useReducedMotion()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (booking?.status === "confirmed" && !reduceMotion) {
      const t = setTimeout(() => setShowConfetti(true), 400)
      return () => clearTimeout(t)
    }
  }, [booking, reduceMotion])

  if (!booking) return null

  const isConfirmed  = booking.status === "confirmed"

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full relative"
    >
      <ConfettiCanvas active={showConfetti} />

      {/* Success banner */}
      {isConfirmed && (
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mb-4 rounded-sm bg-delta-success/10 border border-delta-success/30 p-4 flex items-center gap-3"
        >
          <div className="relative shrink-0">
            <motion.div
              animate={reduceMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-sm bg-delta-success/20"
            />
            <div className="w-10 h-10 rounded-sm bg-delta-success/15 border border-delta-success/30 flex items-center justify-center relative">
              <CheckCircle weight="fill" className="h-6 w-6 text-delta-success" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-delta-success uppercase tracking-wide">Booking Confirmed!</p>
            <p className="text-xs text-delta-ink-muted mt-0.5">Your flight has been reserved and payment settled from your wallet.</p>
          </div>
        </motion.div>
      )}

      {/* Ticket card */}
      <div className="w-full flex flex-col md:flex-row rounded-sm overflow-hidden border border-delta-hairline bg-delta-canvas shadow-[0_2px_8px_rgba(0,0,0,0.08)] print:border print:border-delta-hairline font-sans">

        {/* Left: Flight info */}
        <div className="flex-1 flex flex-col">
          {/* Navy header */}
          <div className="bg-delta-navy text-white p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <AirplaneTilt weight="fill" className="absolute -right-8 -bottom-8 h-48 w-48 text-white rotate-45" />
            </div>

            <div className="relative z-10 flex justify-between items-start mb-10 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-delta-red p-2 rounded-sm">
                  <AirplaneTilt weight="fill" className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white leading-none">SkyLedger</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-0.5">Electronic Boarding Pass</p>
                </div>
              </div>

              {isConfirmed ? (
                <div className="flex items-center gap-1.5 bg-delta-success/20 border border-delta-success/40 text-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle weight="fill" className="h-3.5 w-3.5 text-delta-success" /> Confirmed
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-delta-error/20 border border-delta-error/40 text-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                  <XCircle weight="fill" className="h-3.5 w-3.5 text-delta-red" /> Cancelled
                </div>
              )}
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Origin</p>
                <p className="text-5xl md:text-6xl font-bold tracking-[-0.04em] text-white">{booking.origin_code}</p>
              </div>
              <div className="flex-1 px-6 relative flex items-center justify-center">
                <div className="w-full border-t-2 border-white/15 border-dashed absolute top-1/2 -translate-y-1/2" />
                <div className="bg-delta-navy px-3 py-1.5 relative z-10 border border-white/15 rounded-sm">
                  <AirplaneTilt weight="fill" className="h-4 w-4 text-white/70 rotate-90" />
                </div>
                <div className="absolute -bottom-7 w-full text-center text-xs font-bold text-white/60">
                  {booking.departure_date}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Destination</p>
                <p className="text-5xl md:text-6xl font-bold tracking-[-0.04em] text-white">{booking.destination_code}</p>
              </div>
            </div>
          </div>

          {/* Passenger manifest */}
          <div className="bg-delta-canvas p-8 md:p-10 flex-1">
            <h4 className="text-[11px] font-bold text-delta-navy uppercase tracking-widest mb-5 flex items-center gap-2 select-none border-b border-delta-hairline pb-3">
              <User weight="bold" className="h-3.5 w-3.5" /> Official Passenger Manifest
            </h4>
            <div className="flex flex-col gap-3">
              {(booking.passengers || []).map((p, i) => (
                <motion.div
                  key={p.id || i}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm bg-delta-surface-1 border border-delta-hairline hover:bg-delta-surface-2 transition-colors"
                >
                  <div className="mb-3 sm:mb-0">
                    <p className="text-base font-bold tracking-tight text-delta-navy">{p.first_name} {p.last_name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-delta-surface-2 text-delta-ink px-2 py-0.5 rounded-sm border border-delta-hairline">
                        {p.passenger_type}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-delta-ink-muted">
                        {p.tickets?.[0]?.airline_name || "SkyLedger"}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-delta-navy-mid/10 text-delta-navy-mid px-2 py-0.5 rounded-sm border border-delta-navy-mid/20">
                        {getCabinClassLabel(booking.cabin_class)}
                      </span>
                    </div>
                  </div>
                  {p.tickets && p.tickets.length > 0 && (
                    <div className="flex gap-8 sm:gap-12">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-1">Flight No.</p>
                        <p className="text-lg font-mono font-bold tracking-tight text-delta-navy">{p.tickets[0].flight_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-1">Seat</p>
                        <p className="text-lg font-mono font-bold tracking-tight text-delta-navy">
                          {p.tickets[0].seat_designator || "TBA"}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Ticket stub */}
        <div className="w-full md:w-[280px] bg-delta-surface-1 border-t md:border-t-0 md:border-l border-dashed border-delta-hairline p-8 md:p-10 flex flex-col justify-between print:break-inside-avoid">
          <div className="space-y-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-2">Booking Reference</p>
              <p className="text-3xl font-mono tracking-tight font-bold text-delta-navy">{booking.booking_reference}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-2">Date Issued</p>
              <p className="text-sm font-bold text-delta-ink">
                {new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-2">Total Settled</p>
              <p className="text-3xl font-bold tracking-tight text-delta-red">
                ৳{Number(booking.total_amount).toFixed(2)}
              </p>
              <div className="flex items-center gap-1.5 text-delta-success mt-2 bg-delta-success/10 px-2.5 py-1 rounded-sm w-fit border border-delta-success/20">
                <ShieldCheck weight="fill" className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Wallet Paid</span>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {/* Barcode with scanner animation */}
            <div className="h-20 w-full flex flex-col items-center justify-center bg-delta-canvas border border-delta-hairline rounded-sm overflow-hidden relative">
              <Barcode weight="thin" className="w-[140%] h-[100px] text-delta-ink opacity-70" />
              <motion.div
                animate={reduceMotion ? {} : { top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-[1.5px] w-full bg-delta-red/50"
              />
            </div>

            <div className="flex flex-col gap-2.5 print:hidden">
              <PDFDownloadLink
                document={<TicketPDF booking={booking} />}
                fileName={`SkyLedger_Ticket_${booking.booking_reference}.pdf`}
                className="w-full h-11 rounded-sm bg-delta-red hover:bg-delta-red-hover text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {({ loading }: any) => (
                  <>
                    <DownloadSimple weight="bold" className="h-[18px] w-[18px]" />
                    {loading ? "Generating PDF..." : "Save PDF"}
                  </>
                )}
              </PDFDownloadLink>
              {onDone && (
                <button
                  onClick={onDone}
                  className="w-full h-11 rounded-sm border border-delta-navy text-delta-navy hover:bg-delta-surface-2 bg-delta-canvas font-bold text-sm transition-colors cursor-pointer"
                >
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
