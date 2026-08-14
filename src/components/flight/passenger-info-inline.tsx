"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react"

export interface PassengerDetail {
  passengerIndex: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  passportNumber: string
  passengerType: "adult" | "child" | "infant"
  outboundSeat?: string
  returnSeat?: string
  outboundSeatPrice?: number
  returnSeatPrice?: number
}

interface PassengerInfoInlineProps {
  passengersCount: number
  defaultUserEmail?: string
  defaultUserName?: string
  initialData?: PassengerDetail[]
  onConfirm: (passengers: PassengerDetail[]) => void
  onBack?: () => void
}

const PAX_COLORS = [
  { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300",    dot: "#e31837" },
  { bg: "bg-sky-100",    text: "text-sky-700",    border: "border-sky-300",    dot: "#005480" },
  { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300",  dot: "#2e7d32" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", dot: "#e65100" },
]


function getInitials(first: string, last: string) {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase() || ""
}

interface FieldDef {
  key: keyof PassengerDetail
  label: string
  placeholder: string
  type: string
  icon: React.ElementType
  required: boolean
}

const FIELDS: FieldDef[] = [
  { key: "firstName",      label: "First Name",      placeholder: "Alexander",        type: "text",  icon: User,     required: true  },
  { key: "lastName",       label: "Last Name",        placeholder: "Vance",            type: "text",  icon: User,     required: true  },
  { key: "email",          label: "Email Address",    placeholder: "you@email.com",    type: "email", icon: Mail,     required: false },
  { key: "phone",          label: "Phone Number",     placeholder: "+1 555 000 0000",  type: "tel",   icon: Phone,    required: false },
  { key: "dateOfBirth",    label: "Date of Birth",    placeholder: "",                 type: "date",  icon: Calendar, required: false },
  { key: "passportNumber", label: "Passport Number",  placeholder: "A98234102",        type: "text",  icon: Shield,   required: false },
]

export function PassengerInfoInline({
  passengersCount = 1,
  defaultUserEmail = "",
  defaultUserName = "",
  initialData = [],
  onConfirm,
  onBack,
}: PassengerInfoInlineProps) {
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0)
  const [passengers, setPassengers] = useState<PassengerDetail[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [direction, setDirection] = useState<number>(1)

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setPassengers(initialData)
    } else {
      const names = defaultUserName.split(" ")
      const initial: PassengerDetail[] = Array.from({ length: passengersCount }, (_, idx) => ({
        passengerIndex:  idx,
        firstName:       idx === 0 ? (names[0] || "") : "",
        lastName:        idx === 0 ? (names.slice(1).join(" ") || "") : "",
        email:           idx === 0 ? defaultUserEmail : "",
        phone:           "",
        dateOfBirth:     "",
        passportNumber:  "",
        passengerType:   "adult",
      }))
      setPassengers(initial)
    }
  }, [passengersCount, defaultUserEmail, defaultUserName, initialData])

  const updateField = (idx: number, field: keyof PassengerDetail, value: any) => {
    setPassengers((prev) => prev.map((p) => (p.passengerIndex === idx ? { ...p, [field]: value } : p)))
  }

  const isValid = (p: PassengerDetail) => p.firstName.trim().length > 0 && p.lastName.trim().length > 0
  const allValid = passengers.length > 0 && passengers.every(isValid)
  const completedCount = passengers.filter(isValid).length

  const goTo = (idx: number) => {
    setDirection(idx > activePassengerIndex ? 1 : -1)
    setActivePassengerIndex(idx)
  }

  const current = passengers[activePassengerIndex]

  const slideVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d * 24 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d * -24 }),
  }

  return (
    <div className="bg-delta-canvas border border-delta-hairline rounded-sm overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="bg-delta-navy px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="bg-delta-red p-1.5 rounded-sm">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Passenger Information</h3>
            <p className="text-xs text-white/60 mt-0.5">Enter details for each traveler</p>
          </div>
        </div>
        <div className="bg-delta-navy-mid border border-white/15 rounded-sm px-3 py-1.5 text-center">
          <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Progress</p>
          <p className="text-xs font-bold text-white">{completedCount}/{passengersCount}</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Progress bar */}
        <div className="h-1 rounded-sm bg-delta-hairline overflow-hidden">
          <motion.div
            className="h-full bg-delta-red rounded-sm"
            initial={false}
            animate={{ width: `${(completedCount / passengersCount) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Passenger tabs — multiple passengers only */}
        {passengersCount > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {passengers.map((p, idx) => {
              const isActive = activePassengerIndex === idx
              const valid = isValid(p)
              const initials = getInitials(p.firstName, p.lastName)
              const colors = PAX_COLORS[idx % PAX_COLORS.length]

              return (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-delta-navy text-white border-delta-navy"
                      : valid
                      ? "bg-delta-success/10 text-delta-success border-delta-success/30"
                      : "bg-delta-canvas text-delta-ink border-delta-hairline hover:bg-delta-surface-1"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? "bg-white/20 text-white" : valid ? "bg-delta-success/15 text-delta-success" : `${colors.bg} ${colors.text}`
                    }`}
                  >
                    {initials || (idx + 1)}
                  </div>
                  <span className="truncate">
                    {p.firstName ? p.firstName : `Pax ${idx + 1}`}
                  </span>
                  {valid && !isActive && <Check className="h-3 w-3 text-delta-success shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        {/* Form */}
        <AnimatePresence mode="wait" custom={direction}>
          {current && (
            <motion.div
              key={activePassengerIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <div className="bg-delta-surface-1/50 border border-delta-hairline rounded-sm p-4 space-y-4">
                {/* Passenger label */}
                <div className="flex items-center justify-between border-b border-delta-hairline pb-3 select-none">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-delta-red" />
                    <span className="text-xs font-bold uppercase tracking-wider text-delta-navy">
                      Passenger {activePassengerIndex + 1} Details
                    </span>
                  </div>
                  {isValid(current) && (
                    <div className="flex items-center gap-1 bg-delta-success/10 border border-delta-success/25 text-delta-success px-2 py-0.5 rounded-sm">
                      <Check className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Complete</span>
                    </div>
                  )}
                </div>

                {/* Field grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FIELDS.map((field) => {
                    const Icon = field.icon
                    const value = (current[field.key] as string) || ""
                    const touchedKey = `${activePassengerIndex}_${field.key}`
                    const hasError = field.required && touched[touchedKey] && !value.trim()

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-delta-navy select-none">
                          <Icon className="h-3 w-3 text-delta-ink-muted" />
                          {field.label}
                          {field.required && <span className="text-delta-red">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) => updateField(activePassengerIndex, field.key, e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, [touchedKey]: true }))}
                            className={`w-full h-11 rounded-sm border px-3 text-sm font-medium bg-delta-canvas text-delta-ink placeholder:text-delta-ink-muted/50 outline-none transition-colors ${
                              hasError
                                ? "border-delta-error focus:border-delta-error ring-1 ring-delta-error/30"
                                : "border-delta-hairline hover:border-delta-navy-mid focus:border-delta-navy focus:ring-1 focus:ring-delta-navy/20"
                            }`}
                          />
                          {hasError && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-error" />
                          )}
                        </div>
                        {hasError && (
                          <p className="text-[10px] text-delta-error font-medium">This field is required</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Passenger type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy select-none">
                    Passenger Type
                  </label>
                  <div className="flex gap-2">
                    {(["adult", "child", "infant"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => updateField(activePassengerIndex, "passengerType", type)}
                        className={`flex-1 h-9 rounded-sm border text-xs font-bold capitalize transition-colors cursor-pointer ${
                          current.passengerType === type
                            ? "bg-delta-navy text-white border-delta-navy"
                            : "bg-delta-canvas text-delta-ink border-delta-hairline hover:bg-delta-surface-1 hover:border-delta-navy-mid"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prev/Next within passengers */}
                {passengersCount > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-delta-hairline">
                    <button
                      onClick={() => goTo(Math.max(0, activePassengerIndex - 1))}
                      disabled={activePassengerIndex === 0}
                      className="flex items-center gap-1.5 text-xs text-delta-navy hover:text-delta-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer font-bold"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </button>
                    <span className="text-[10px] text-delta-ink-muted font-mono">
                      {activePassengerIndex + 1} / {passengersCount}
                    </span>
                    <button
                      onClick={() => goTo(Math.min(passengersCount - 1, activePassengerIndex + 1))}
                      disabled={activePassengerIndex === passengersCount - 1}
                      className="flex items-center gap-1.5 text-xs text-delta-navy hover:text-delta-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer font-bold"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-delta-hairline">
          <span className="text-xs text-delta-ink-muted">
            {completedCount} of {passengersCount} completed
          </span>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="h-10 px-4 rounded-sm border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              onClick={() => allValid && onConfirm(passengers)}
              disabled={!allValid}
              className="h-10 px-6 rounded-sm bg-delta-red hover:bg-delta-red-hover text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proceed to Checkout <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
