export interface LocationResult {
  id: number
  name: string
  iata_code: string | null
  icao_code: string | null
  country_code: string | null
}

export interface Carrier {
  id?: string
  name?: string
  iata_code?: string
  logo_symbol_url?: string | null
  logo_lockup_url?: string | null
  conditions_of_carriage_url?: string | null
}

export interface Location {
  id?: string
  name?: string
  iata_code?: string
  city_name?: string | null
  iata_country_code?: string | null
  time_zone?: string | null
}

export interface Baggage {
  quantity?: number
  type?: "checked" | "carry_on" | string
}

export interface AmenityDetail {
  seat?: { pitch?: string | null; legroom?: string | null; type?: string | null }
  wifi?: { available?: boolean | null; cost?: string | null }
  power?: { available?: boolean | null }
}

export interface PassengerSegment {
  passenger_id?: string
  cabin_class?: string
  cabin_class_marketing_name?: string | null
  fare_basis_code?: string | null
  cabin?: {
    name?: string
    marketing_name?: string
    amenities?: AmenityDetail
  }
  baggages?: Baggage[]
}

export interface Segment {
  id?: string
  departing_at?: string
  arriving_at?: string
  duration?: string
  origin_terminal?: string | null
  destination_terminal?: string | null
  operating_carrier_flight_number?: string | null
  marketing_carrier_flight_number?: string | null
  distance?: string | null
  aircraft?: { id?: string; iata_code?: string | null; name?: string | null } | null
  stops?: unknown[]
  operating_carrier?: Carrier | null
  marketing_carrier?: Carrier | null
  origin?: Location | null
  destination?: Location | null
  passengers?: PassengerSegment[]
}

export interface Slice {
  id?: string
  duration?: string
  fare_brand_name?: string | null
  ngs_shelf?: number | null
  origin?: Location | null
  destination?: Location | null
  segments?: Segment[]
  conditions?: {
    change_before_departure?: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null
    priority_check_in?: boolean | null
    priority_boarding?: boolean | null
    advance_seat_selection?: boolean | null
  } | null
}

export interface Offer {
  id: string
  total_amount: string
  total_currency: string
  base_amount: string
  base_currency: string
  tax_amount: string
  tax_currency: string
  total_emissions_kg?: string | null
  created_at?: string
  expires_at?: string
  passenger_identity_documents_required?: boolean
  supported_passenger_identity_document_types?: string[]
  supported_loyalty_programmes?: string[]
  payment_requirements?: {
    requires_instant_payment?: boolean
    price_guarantee_expires_at?: string | null
    payment_required_by?: string | null
  } | null
  owner?: Carrier | null
  conditions?: {
    refund_before_departure?: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null
    change_before_departure?: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null
  } | null
  slices?: Slice[]
  passengers?: unknown[]
}
