"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Check, ChevronsUpDown } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export default function CreateFlightPage() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const handleSidebarChange = (section: AdminSection) => {
    if (section === "create-flight") return
    if (section === "overview") {
      router.push("/admin/dashboard")
    } else if (section === "create-user") {
      router.push("/admin/users/create")
    } else {
      router.push(`/admin/${section}`)
    }
  }

  const [formData, setFormData] = useState({
    flight_number: "",
    airline_id: "",
    origin_airport_id: "",
    destination_airport_id: "",
    aircraft_id: "",
    is_direct: true,
    flight_type: "direct",
    layover_cities: "",
    departure_time: "",
    arrival_time: "",
    price: "",
  })

  // Separate states for selection lists
  const [airlines, setAirlines] = useState<any[]>([])
  const [originAirports, setOriginAirports] = useState<any[]>([])
  const [destinationAirports, setDestinationAirports] = useState<any[]>([])
  const [aircraft, setAircraft] = useState<any[]>([])

  // Separate states for search inputs
  const [airlineSearch, setAirlineSearch] = useState("")
  const [originSearch, setOriginSearch] = useState("")
  const [destinationSearch, setDestinationSearch] = useState("")
  const [fleetSearch, setFleetSearch] = useState("")

  // Caching selected labels to prevent them from disappearing when search changes
  const [selectedAirlineName, setSelectedAirlineName] = useState("")
  const [selectedOriginName, setSelectedOriginName] = useState("")
  const [selectedDestinationName, setSelectedDestinationName] = useState("")
  const [selectedAircraftName, setSelectedAircraftName] = useState("")

  // Fetch Airlines
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/admin/airlines?search=${encodeURIComponent(airlineSearch)}&limit=100`)
        .then((res) => res.json())
        .then((data) => setAirlines(data.airlines || []))
    }, 300)
    return () => clearTimeout(timer)
  }, [airlineSearch])

  // Fetch Origin Airports
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/airports?search=${encodeURIComponent(originSearch)}&limit=100`)
        .then((res) => res.json())
        .then((data) => setOriginAirports(data.data || []))
    }, 300)
    return () => clearTimeout(timer)
  }, [originSearch])

  // Fetch Destination Airports
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/airports?search=${encodeURIComponent(destinationSearch)}&limit=100`)
        .then((res) => res.json())
        .then((data) => setDestinationAirports(data.data || []))
    }, 300)
    return () => clearTimeout(timer)
  }, [destinationSearch])

  // Fetch Aircraft Fleet
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/admin/fleets?search=${encodeURIComponent(fleetSearch)}&limit=100`)
        .then((res) => res.json())
        .then((data) => setAircraft(data.aircraft || []))
    }, 300)
    return () => clearTimeout(timer)
  }, [fleetSearch])

  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="flex h-dvh items-center justify-center bg-delta-canvas text-delta-ink-muted font-delta text-sm">
        Verifying Administrative Credentials...
      </div>
    )
  }

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
      if (data.success) {
        router.push("/admin/flights")
      } else {
        setError(data.error || "Failed to schedule new flight")
      }
    } catch (err) {
      setError("Error creating flight")
    } finally {
      setCreating(false)
    }
  }

  // Prepend current selection to the rendered list if not already present
  const visibleAirlines = [...airlines]
  if (
    formData.airline_id &&
    selectedAirlineName &&
    !visibleAirlines.some((a) => String(a.id) === formData.airline_id)
  ) {
    visibleAirlines.unshift({ id: Number(formData.airline_id), name: selectedAirlineName })
  }

  const visibleOriginAirports = [...originAirports]
  if (
    formData.origin_airport_id &&
    selectedOriginName &&
    !visibleOriginAirports.some((a) => String(a.id) === formData.origin_airport_id)
  ) {
    const match = selectedOriginName.match(/^(.*?)\s*\((.*?)\)$/)
    const name = match ? match[1] : selectedOriginName
    const iata_code = match ? match[2] : ""
    visibleOriginAirports.unshift({ id: Number(formData.origin_airport_id), name, iata_code })
  }

  const visibleDestinationAirports = [...destinationAirports]
  if (
    formData.destination_airport_id &&
    selectedDestinationName &&
    !visibleDestinationAirports.some((a) => String(a.id) === formData.destination_airport_id)
  ) {
    const match = selectedDestinationName.match(/^(.*?)\s*\((.*?)\)$/)
    const name = match ? match[1] : selectedDestinationName
    const iata_code = match ? match[2] : ""
    visibleDestinationAirports.unshift({ id: Number(formData.destination_airport_id), name, iata_code })
  }

  const visibleAircraft = [...aircraft]
  if (
    formData.aircraft_id &&
    selectedAircraftName &&
    !visibleAircraft.some((a) => String(a.id) === formData.aircraft_id)
  ) {
    const parts = selectedAircraftName.split(" - ")
    const model = parts[0] || selectedAircraftName
    const reg_number = parts[1] || ""
    visibleAircraft.unshift({ id: Number(formData.aircraft_id), model, reg_number })
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-surface-1 font-delta text-delta-ink">
      <AdminNavbar />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar activeSection="create-flight" onSectionChange={handleSidebarChange} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="create-flight" onSectionChange={handleSidebarChange} />

          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header with back button */}
            <div className="flex items-center justify-between border-b border-delta-hairline pb-4">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/admin/flights")}
                  className="h-9 w-9 p-0 rounded-[4px] border-delta-hairline text-delta-navy hover:bg-delta-surface-1 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">
                    Admin Flights / Create
                  </p>
                  <h1 className="text-[20px] font-[700] leading-tight text-delta-navy flex items-center gap-2">
                    Schedule New Flight
                  </h1>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-[4px] border border-delta-error/30 bg-delta-error/10 p-3 text-xs font-[500] text-delta-error max-w-4xl">
                <span className="font-semibold">Error:</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 1. Basic Flight Information Card */}
                <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs space-y-4">
                  <div className="border-b border-delta-hairline pb-3 mb-2">
                    <h2 className="text-sm font-[700] uppercase tracking-wider text-delta-navy">Basic Details</h2>
                    <p className="text-xs text-delta-ink-muted mt-0.5">
                      Identify flight number, airline carrier, flight type, and base ticket fare.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                        Flight Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DL 1024"
                        value={formData.flight_number}
                        onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                        className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink focus:border-delta-navy focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                        Operating Airline
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-1 flex h-10 w-full items-center justify-between rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm font-normal text-left text-delta-ink hover:bg-delta-surface-1 focus:border-delta-navy"
                          >
                            <span className="truncate">
                              {formData.airline_id
                                ? selectedAirlineName || airlines.find((a) => String(a.id) === formData.airline_id)?.name || "Airline Selected"
                                : "Select Airline..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput placeholder="Search airline..." onValueChange={(v) => setAirlineSearch(v)} />
                            <CommandList>
                              <CommandEmpty>No airline found.</CommandEmpty>
                              <CommandGroup>
                                {visibleAirlines.map((a) => (
                                  <CommandItem
                                    key={a.id}
                                    onSelect={() => {
                                      setFormData({ ...formData, airline_id: String(a.id) })
                                      setSelectedAirlineName(a.name)
                                    }}
                                    className="text-sm cursor-pointer hover:bg-delta-surface-1 py-2 px-3 flex items-center"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 text-delta-navy",
                                        formData.airline_id === String(a.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {a.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                          Flight Routing Type
                        </label>
                        <select
                          value={formData.flight_type}
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, flight_type: value, is_direct: value === "direct" })
                          }}
                          className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink focus:border-delta-navy focus:outline-none"
                        >
                          <option value="direct">Direct Flight</option>
                          <option value="connecting">Connecting Flight</option>
                          <option value="multi-city">Multi-city Flight</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                          Ticket Price ($)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 350.00"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink focus:border-delta-navy focus:outline-none"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Route & Airports Card */}
                <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs space-y-4">
                  <div className="border-b border-delta-hairline pb-3 mb-2">
                    <h2 className="text-sm font-[700] uppercase tracking-wider text-delta-navy">Route Details</h2>
                    <p className="text-xs text-delta-ink-muted mt-0.5">
                      Specify origin, destination, and layover details for routing.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                        Origin Airport
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-1 flex h-10 w-full items-center justify-between rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm font-normal text-left text-delta-ink hover:bg-delta-surface-1 focus:border-delta-navy"
                          >
                            <span className="truncate">
                              {formData.origin_airport_id
                                ? selectedOriginName || originAirports.find((a) => String(a.id) === formData.origin_airport_id)?.name || "Origin Selected"
                                : "Select Origin Airport..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput placeholder="Search airport..." onValueChange={(v) => setOriginSearch(v)} />
                            <CommandList>
                              <CommandEmpty>No airport found.</CommandEmpty>
                              <CommandGroup>
                                {visibleOriginAirports.map((a) => (
                                  <CommandItem
                                    key={a.id}
                                    onSelect={() => {
                                      setFormData({ ...formData, origin_airport_id: String(a.id) })
                                      setSelectedOriginName(`${a.name} (${a.iata_code})`)
                                    }}
                                    className="text-sm cursor-pointer hover:bg-delta-surface-1 py-2 px-3 flex items-center"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 text-delta-navy",
                                        formData.origin_airport_id === String(a.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {a.name} ({a.iata_code})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                        Destination Airport
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-1 flex h-10 w-full items-center justify-between rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm font-normal text-left text-delta-ink hover:bg-delta-surface-1 focus:border-delta-navy"
                          >
                            <span className="truncate">
                              {formData.destination_airport_id
                                ? selectedDestinationName || destinationAirports.find((a) => String(a.id) === formData.destination_airport_id)?.name || "Destination Selected"
                                : "Select Destination Airport..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput placeholder="Search airport..." onValueChange={(v) => setDestinationSearch(v)} />
                            <CommandList>
                              <CommandEmpty>No airport found.</CommandEmpty>
                              <CommandGroup>
                                {visibleDestinationAirports.map((a) => (
                                  <CommandItem
                                    key={a.id}
                                    onSelect={() => {
                                      setFormData({ ...formData, destination_airport_id: String(a.id) })
                                      setSelectedDestinationName(`${a.name} (${a.iata_code})`)
                                    }}
                                    className="text-sm cursor-pointer hover:bg-delta-surface-1 py-2 px-3 flex items-center"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 text-delta-navy",
                                        formData.destination_airport_id === String(a.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {a.name} ({a.iata_code})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {formData.flight_type !== "direct" && (
                      <div>
                        <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                          Layover Cities
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Atlanta, Chicago (comma separated)"
                          value={formData.layover_cities}
                          onChange={(e) => setFormData({ ...formData, layover_cities: e.target.value })}
                          className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink focus:border-delta-navy focus:outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Aircraft & Schedule Details Card */}
              <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs space-y-4">
                <div className="border-b border-delta-hairline pb-3 mb-2">
                  <h2 className="text-sm font-[700] uppercase tracking-wider text-delta-navy">Aircraft & Schedule</h2>
                  <p className="text-xs text-delta-ink-muted mt-0.5">
                    Select aircraft model and configure departure & arrival timings.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                      Assigned Aircraft
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="mt-1 flex h-10 w-full items-center justify-between rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm font-normal text-left text-delta-ink hover:bg-delta-surface-1 focus:border-delta-navy"
                        >
                          <span className="truncate">
                            {formData.aircraft_id
                              ? selectedAircraftName || aircraft.find((a) => String(a.id) === formData.aircraft_id)?.model || "Aircraft Selected"
                              : "Select Aircraft..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput placeholder="Search aircraft..." onValueChange={(v) => setFleetSearch(v)} />
                          <CommandList>
                            <CommandEmpty>No aircraft found.</CommandEmpty>
                            <CommandGroup>
                              {visibleAircraft.map((a) => (
                                <CommandItem
                                  key={a.id}
                                  onSelect={() => {
                                    setFormData({ ...formData, aircraft_id: String(a.id) })
                                    setSelectedAircraftName(`${a.model} - ${a.reg_number}`)
                                  }}
                                  className="text-sm cursor-pointer hover:bg-delta-surface-1 py-2 px-3 flex items-center"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-delta-navy",
                                      formData.aircraft_id === String(a.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {a.model} - {a.reg_number}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                      Departure Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.departure_time}
                      onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink font-mono focus:border-delta-navy focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                      Arrival Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.arrival_time}
                      onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink font-mono focus:border-delta-navy focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer Action */}
              <div className="flex items-center justify-end gap-3 border-t border-delta-hairline pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/flights")}
                  className="h-10 rounded-[4px] border-delta-hairline text-xs font-[600]"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={creating}
                  className="h-10 gap-1.5 rounded-[4px] bg-delta-red px-6 text-xs font-[700] text-white hover:bg-delta-red-hover transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{creating ? "Scheduling..." : "Schedule Flight"}</span>
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
