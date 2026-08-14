export type ElementType =
  | "seat"
  | "bassinet"
  | "empty"
  | "exit_row"
  | "lavatory"
  | "galley"
  | "closet"
  | "stairs"
  | "restricted_seat_general"

export interface AvailableService {
  id: string | number
  passenger_id: string | number
  total_amount: string
  total_currency: string
}

export interface SeatElement {
  type: "seat"
  designator: string
  name?: string | null
  disclosures: string[]
  available_services: AvailableService[]
}

export interface BassinetElement {
  type: "bassinet"
}

export interface EmptyElement {
  type: "empty"
}

export interface ExitRowElement {
  type: "exit_row"
}

export interface LavatoryElement {
  type: "lavatory"
}

export interface GalleyElement {
  type: "galley"
}

export interface ClosetElement {
  type: "closet"
}

export interface StairsElement {
  type: "stairs"
}

export interface RestrictedSeatElement {
  type: "restricted_seat_general"
}

export type RowElement =
  | SeatElement
  | BassinetElement
  | EmptyElement
  | ExitRowElement
  | LavatoryElement
  | GalleyElement
  | ClosetElement
  | StairsElement
  | RestrictedSeatElement

export interface RowSection {
  elements: RowElement[]
}

export interface CabinRow {
  sections: RowSection[]
}

export interface Wings {
  first_row_index: number
  last_row_index: number
}

export type CabinClass = "first" | "business" | "premium_economy" | "economy"

export interface Cabin {
  aisles: number
  cabin_class: CabinClass
  deck: number
  rows: CabinRow[]
  wings: Wings | null
}

export interface SeatMap {
  id: string | number
  segment_id: string | number
  slice_id: string | number
  cabins: Cabin[]
}

export interface SelectedSeatChoice {
  segmentId: string | number
  passengerId: string | number
  passengerIndex: number
  seatDesignator: string
  serviceId: string | number
  totalAmount: number
  totalCurrency: string
  disclosures?: string[]
}
