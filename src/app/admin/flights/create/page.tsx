"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Input } from "@/components/ui/input"

export default function CreateFlightPage() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    flight_number: "",
    airline_id: "",
    origin_airport_id: "",
    destination_airport_id: "",
    departure_time: "",
    arrival_time: "",
  })

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  if (isLoading || !user || role !== "admin") return <div className="p-8">Verifying...</div>

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    try {
      const res = await fetch("/api/admin/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) router.push("/admin/dashboard?tab=flights")
      else setError(data.error)
    } catch (err) {
      setError("Error creating flight")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-delta-surface-1">
      <AdminNavbar />
      <div className="flex flex-1">
        <AdminSidebar activeSection="dashboard" onSectionChange={() => {}} dbStatus="connected" />
        <main className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">Create New Flight</h1>
            <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
                <Input placeholder="Flight Number" onChange={(e) => setFormData({...formData, flight_number: e.target.value})} />
                <Input placeholder="Airline ID" onChange={(e) => setFormData({...formData, airline_id: e.target.value})} />
                <Input placeholder="Origin Airport ID" onChange={(e) => setFormData({...formData, origin_airport_id: e.target.value})} />
                <Input placeholder="Destination Airport ID" onChange={(e) => setFormData({...formData, destination_airport_id: e.target.value})} />
                <Input type="datetime-local" onChange={(e) => setFormData({...formData, departure_time: e.target.value})} />
                <Input type="datetime-local" onChange={(e) => setFormData({...formData, arrival_time: e.target.value})} />
                <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Flight"}</Button>
            </form>
        </main>
      </div>
    </div>
  )
}
