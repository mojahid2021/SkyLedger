import { NextResponse } from "next/server"

const FALLBACK_SEAT_MAPS = [
  {
    id: "sea_00003hthlsHZ8W4LxXjkzo",
    segment_id: "seg_00009htYpSCXrwaB9Dn456",
    slice_id: "sli_00009htYpSCXrwaB9Dn123",
    cabins: [
      {
        aisles: 2,
        cabin_class: "economy",
        deck: 0,
        wings: { first_row_index: 1, last_row_index: 2 },
        rows: [
          {
            sections: [
              {
                elements: [
                  {
                    type: "seat",
                    designator: "1A",
                    name: "Premium Window",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA1A",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "30.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "1B",
                    name: "Premium Middle",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA1B",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "30.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "1C",
                    name: "Premium Aisle",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA1C",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "30.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                ],
              },
              {
                elements: [
                  {
                    type: "seat",
                    designator: "1D",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA1D",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "30.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "1E",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA1E",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "30.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "1F",
                    name: "",
                    disclosures: [],
                    available_services: [],
                  },
                  {
                    type: "seat",
                    designator: "1G",
                    name: "",
                    disclosures: [],
                    available_services: [],
                  },
                ],
              },
              {
                elements: [
                  {
                    type: "seat",
                    designator: "1H",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA1H",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "30.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "1J",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA1J",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "30.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "1K",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA1K",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "30.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            sections: [
              { elements: [{ type: "exit_row" }] },
              { elements: [] },
              { elements: [{ type: "exit_row" }] },
            ],
          },
          {
            sections: [
              {
                elements: [
                  {
                    type: "seat",
                    designator: "2A",
                    name: "Exit Row Seat",
                    disclosures: [
                      "Do not seat children in exit row seats",
                      "Do not seat passengers with special needs in exit row seats",
                    ],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA2A",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "20.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "2B",
                    name: "Exit Row Seat",
                    disclosures: ["Do not seat children in exit row seats"],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA2B",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "20.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "2C",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA2C",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "20.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                ],
              },
              {
                elements: [
                  {
                    type: "seat",
                    designator: "2D",
                    name: "",
                    disclosures: [],
                    available_services: [],
                  },
                  {
                    type: "seat",
                    designator: "2E",
                    name: "",
                    disclosures: [],
                    available_services: [],
                  },
                  {
                    type: "seat",
                    designator: "2F",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA2F",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "20.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "2G",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA2G",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "20.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                ],
              },
              {
                elements: [
                  {
                    type: "seat",
                    designator: "2H",
                    name: "",
                    disclosures: [],
                    available_services: [],
                  },
                  {
                    type: "seat",
                    designator: "2J",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA2J",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "20.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "2K",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA2K",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "20.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            sections: [
              {
                elements: [
                  {
                    type: "seat",
                    designator: "3A",
                    name: "Economy Standard",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA3A",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "10.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "3B",
                    name: "",
                    disclosures: [],
                    available_services: [],
                  },
                  {
                    type: "seat",
                    designator: "3C",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA3C",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "10.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                ],
              },
              {
                elements: [
                  {
                    type: "seat",
                    designator: "3D",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA3D",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "10.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "3E",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA3E",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "10.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "3F",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA3F",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "10.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "3G",
                    name: "",
                    disclosures: [],
                    available_services: [],
                  },
                ],
              },
              {
                elements: [
                  {
                    type: "seat",
                    designator: "3H",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA3H",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "10.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "3J",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA3J",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "10.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                  {
                    type: "seat",
                    designator: "3K",
                    name: "",
                    disclosures: [],
                    available_services: [
                      {
                        id: "ase_00009UhD4ongolulWAAA3K",
                        passenger_id: "pas_00009hj8USM7Ncg31cAAA",
                        total_amount: "10.00",
                        total_currency: "USD",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            sections: [
              { elements: [{ type: "lavatory" }] },
              { elements: [] },
              { elements: [{ type: "lavatory" }] },
            ],
          },
          {
            sections: [
              { elements: [{ type: "galley" }] },
              { elements: [{ type: "galley" }] },
              { elements: [{ type: "galley" }] },
            ],
          },
        ],
      },
    ],
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get("offer_id")

    if (!offerId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: offer_id" },
        { status: 400 }
      )
    }

    const DUFFEL_API_KEY =
      process.env.DUFFEL_API_KEY ||
      process.env.TRAVELPAYOUTS_API_KEY ||
      "duffel_test_key"

    const res = await fetch(
      `https://api.duffel.com/air/seat_maps?offer_id=${encodeURIComponent(offerId)}`,
      {
        method: "GET",
        headers: {
          "Accept-Encoding": "gzip",
          Accept: "application/json",
          "Duffel-Version": "v2",
          Authorization: `Bearer ${DUFFEL_API_KEY}`,
        },
      }
    )

    const duffelData = await res.json()

    if (!duffelData.data || !Array.isArray(duffelData.data) || duffelData.data.length === 0) {
      console.warn(
        "Duffel Seat Maps API returned no data or error. Returning sample seat map layout:",
        JSON.stringify(duffelData, null, 2)
      )
      return NextResponse.json({
        success: true,
        data: FALLBACK_SEAT_MAPS,
        isFallback: true,
        fallbackNotice: "Live seat map is unavailable for this carrier/offer. Displaying interactive sample aircraft layout.",
      })
    }

    return NextResponse.json({
      success: true,
      data: duffelData.data,
      isFallback: false,
    })
  } catch (error) {
    console.error("Seat maps route error:", error)
    return NextResponse.json({
      success: true,
      data: FALLBACK_SEAT_MAPS,
      isFallback: true,
      fallbackNotice: "Live seat map request failed. Displaying interactive sample aircraft layout.",
    })
  }
}
