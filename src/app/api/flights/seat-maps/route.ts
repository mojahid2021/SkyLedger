import { NextResponse } from "next/server"
import { query } from "@/lib/db"

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

function generateSeatMapForFlight(
  flightId: number,
  aircraftModel: string,
  aircraftIata: string,
  aircraftIcao: string,
  segmentId: string,
  sliceId: string,
  bookedSeats: Set<string>
) {
  const modelUpper = (aircraftModel || "").toUpperCase();
  const icaoUpper = (aircraftIcao || "").toUpperCase();
  
  let type: "widebody" | "narrowbody" | "regional" | "private" = "narrowbody";
  
  if (
    /A33|A34|A35|A38|B77|B78|B74/i.test(icaoUpper) || 
    modelUpper.includes("330") || modelUpper.includes("340") || modelUpper.includes("350") || modelUpper.includes("380") || modelUpper.includes("777") || modelUpper.includes("787") || modelUpper.includes("747")
  ) {
    type = "widebody";
  } else if (
    /CRJ|ERJ|E145|E120|E170|E175|E190|E195|CRA|CR2|B712/i.test(icaoUpper) ||
    modelUpper.includes("CRJ") || modelUpper.includes("EMBRAER") || modelUpper.includes("BRASILIA") || modelUpper.includes("BOMBARDIER") || modelUpper.includes("717")
  ) {
    type = "regional";
  } else if (
    /BE20|C208|C680|B190|B350|GLEX|PA44|PC12|LJ60|E55P/i.test(icaoUpper) ||
    modelUpper.includes("KING AIR") || modelUpper.includes("CARAVAN") || modelUpper.includes("SOVEREIGN") || modelUpper.includes("GLOBAL EXPRESS") || modelUpper.includes("PILATUS") || modelUpper.includes("LEARJET") || modelUpper.includes("PHENOM")
  ) {
    type = "private";
  }

  // Seat occupancy checker based on local bookings database
  const isOccupied = (designator: string) => {
    return bookedSeats.has(designator.trim().toUpperCase());
  };

  const buildSeat = (designator: string, name: string, disclosures: string[], amount: string) => {
    const occupied = isOccupied(designator);
    return {
      type: "seat" as const,
      designator,
      name,
      disclosures,
      available_services: occupied
        ? []
        : [
            {
              id: `ase_${flightId}_${designator}`,
              passenger_id: `pas_1`,
              total_amount: amount,
              total_currency: "USD",
            },
          ],
    };
  };

  const cabins: any[] = [];

  if (type === "widebody") {
    // WIDEBODY: 2 aisles, 3 sections (Left, Middle, Right)
    
    // Business Class Cabin
    const businessRows: any[] = [];
    for (let r = 1; r <= 6; r++) {
      businessRows.push({
        sections: [
          {
            elements: [buildSeat(`${r}A`, "Business Window", [], "150.00")]
          },
          {
            elements: [
              buildSeat(`${r}D`, "Business Aisle", [], "125.00"),
              buildSeat(`${r}G`, "Business Aisle", [], "125.00")
            ]
          },
          {
            elements: [buildSeat(`${r}K`, "Business Window", [], "150.00")]
          }
        ]
      });
    }
    cabins.push({
      aisles: 2,
      cabin_class: "business",
      deck: 0,
      wings: null,
      rows: businessRows,
    });

    // Premium Economy Cabin
    const premiumRows: any[] = [];
    for (let r = 7; r <= 12; r++) {
      premiumRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, "Premium Window", [], "50.00"),
              buildSeat(`${r}C`, "Premium Aisle", [], "45.00")
            ]
          },
          {
            elements: [
              buildSeat(`${r}D`, "Premium Middle", [], "40.00"),
              { type: "empty" },
              buildSeat(`${r}G`, "Premium Middle", [], "40.00")
            ]
          },
          {
            elements: [
              buildSeat(`${r}H`, "Premium Aisle", [], "45.00"),
              buildSeat(`${r}K`, "Premium Window", [], "50.00")
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 2,
      cabin_class: "premium_economy",
      deck: 0,
      wings: null,
      rows: premiumRows,
    });

    // Economy Cabin (3-3-3)
    const economyRows: any[] = [];
    const wingStart = 15;
    const wingEnd = 30;
    for (let r = 14; r <= 45; r++) {
      const isExit = r === 14;
      const price = isExit ? "60.00" : "20.00";
      const name = isExit ? "Exit Row Seat" : "Economy Standard";
      const disclosures = isExit
        ? ["Do not seat children in exit row seats", "Do not seat passengers with special needs in exit row seats"]
        : [];

      economyRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, name, disclosures, price),
              buildSeat(`${r}B`, name, disclosures, price),
              buildSeat(`${r}C`, name, disclosures, price)
            ]
          },
          {
            elements: [
              buildSeat(`${r}D`, name, disclosures, price),
              buildSeat(`${r}E`, name, disclosures, price),
              buildSeat(`${r}F`, name, disclosures, price)
            ]
          },
          {
            elements: [
              buildSeat(`${r}G`, name, disclosures, price),
              buildSeat(`${r}H`, name, disclosures, price),
              buildSeat(`${r}K`, name, disclosures, price)
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 2,
      cabin_class: "economy",
      deck: 0,
      wings: { first_row_index: wingStart, last_row_index: wingEnd },
      rows: economyRows,
    });

  } else if (type === "regional") {
    // REGIONAL: 1 aisle, 2 sections (2-2 configuration)
    // Business Class (2-2) Rows 1-3
    const businessRows: any[] = [];
    for (let r = 1; r <= 3; r++) {
      businessRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, "Business Window", [], "40.00"),
              buildSeat(`${r}B`, "Business Aisle", [], "35.00")
            ]
          },
          {
            elements: [
              buildSeat(`${r}C`, "Business Aisle", [], "35.00"),
              buildSeat(`${r}D`, "Business Window", [], "40.00")
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "business",
      deck: 0,
      wings: null,
      rows: businessRows,
    });

    // Economy Class (2-2) Rows 4-20
    const economyRows: any[] = [];
    const wingStart = 8;
    const wingEnd = 14;
    for (let r = 4; r <= 20; r++) {
      const isExit = r === 10;
      const price = isExit ? "25.00" : "10.00";
      const name = isExit ? "Exit Row Seat" : "Economy Standard";
      const disclosures = isExit ? ["Do not seat children in exit row seats"] : [];

      economyRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, name, disclosures, price),
              buildSeat(`${r}B`, name, disclosures, price)
            ]
          },
          {
            elements: [
              buildSeat(`${r}C`, name, disclosures, price),
              buildSeat(`${r}D`, name, disclosures, price)
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "economy",
      deck: 0,
      wings: { first_row_index: wingStart, last_row_index: wingEnd },
      rows: economyRows,
    });

  } else if (type === "private") {
    // PRIVATE: 1 aisle, 2 sections (1-1 configuration)
    const rows: any[] = [];
    for (let r = 1; r <= 6; r++) {
      rows.push({
        sections: [
          {
            elements: [buildSeat(`${r}A`, "VIP Executive", [], "250.00")]
          },
          {
            elements: [buildSeat(`${r}C`, "VIP Executive", [], "250.00")]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "business",
      deck: 0,
      wings: null,
      rows,
    });

  } else {
    // NARROWBODY (Standard): 1 aisle, 2 sections (3-3 configuration)
    const businessRows: any[] = [];
    for (let r = 1; r <= 4; r++) {
      businessRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, "First Window", [], "75.00"),
              buildSeat(`${r}C`, "First Aisle", [], "70.00")
            ]
          },
          {
            elements: [
              buildSeat(`${r}D`, "First Aisle", [], "70.00"),
              buildSeat(`${r}F`, "First Window", [], "75.00")
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "business",
      deck: 0,
      wings: null,
      rows: businessRows,
    });

    // Economy Cabin (3-3) Rows 5-30
    const economyRows: any[] = [];
    const wingStart = 11;
    const wingEnd = 20;
    for (let r = 5; r <= 30; r++) {
      const isExit = r === 12;
      const isPreferred = r >= 5 && r <= 10;
      const price = isExit ? "35.00" : isPreferred ? "25.00" : "15.00";
      const name = isExit ? "Exit Row Seat" : isPreferred ? "Preferred Seat" : "Economy Standard";
      const disclosures = isExit ? ["Do not seat children in exit row seats", "Do not seat passengers with special needs in exit row seats"] : [];

      economyRows.push({
        sections: [
          {
            elements: [
              buildSeat(`${r}A`, name, disclosures, price),
              buildSeat(`${r}B`, name, disclosures, price),
              buildSeat(`${r}C`, name, disclosures, price)
            ]
          },
          {
            elements: [
              buildSeat(`${r}D`, name, disclosures, price),
              buildSeat(`${r}E`, name, disclosures, price),
              buildSeat(`${r}F`, name, disclosures, price)
            ]
          }
        ]
      });
    }
    cabins.push({
      aisles: 1,
      cabin_class: "economy",
      deck: 0,
      wings: { first_row_index: wingStart, last_row_index: wingEnd },
      rows: economyRows,
    });
  }

  return {
    id: `sea_local_${flightId}`,
    segment_id: segmentId,
    slice_id: sliceId,
    cabins,
  };
}

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

    const flightIdStr = offerId.replace("local_off_", "").replace("local_slice_", "").replace("local_seg_", "")
    let flightId = parseInt(flightIdStr, 10)
    if (isNaN(flightId)) {
      const match = offerId.match(/\d+/)
      flightId = match ? parseInt(match[0], 10) : 1
    }
    
    let aircraftModel = "Boeing 737-800"
    let aircraftIata = "73H"
    let aircraftIcao = "B738"
    let flightNumber = ""
    let departureDate = ""
    
    try {
      const flights = await query<any[]>(`
        SELECT f.id, f.flight_number, DATE_FORMAT(f.departure_time, '%Y-%m-%d') as departure_date,
               ac.model, ac.iata, ac.icao
        FROM flights f
        LEFT JOIN aircraft ac ON f.aircraft_id = ac.id
        WHERE f.id = ?
      `, [flightId])
      
      if (flights && flights.length > 0) {
        if (flights[0].model) aircraftModel = flights[0].model
        if (flights[0].iata) aircraftIata = flights[0].iata
        if (flights[0].icao) aircraftIcao = flights[0].icao
        flightNumber = flights[0].flight_number
        departureDate = flights[0].departure_date
      }
    } catch (dbError) {
      console.error("Failed to query aircraft info for flight:", dbError)
    }

    const bookedSeats = new Set<string>()
    if (flightNumber && departureDate) {
      try {
        const tickets = await query<any[]>(`
          SELECT bt.seat_designator
          FROM booking_tickets bt
          INNER JOIN bookings b ON bt.booking_id = b.id
          WHERE bt.flight_number = ?
            AND b.departure_date = ?
            AND b.status = 'confirmed'
            AND bt.seat_designator IS NOT NULL
        `, [flightNumber, departureDate])
        
        tickets.forEach(ticket => {
          if (ticket.seat_designator) {
            bookedSeats.add(ticket.seat_designator.trim().toUpperCase())
          }
        })
      } catch (ticketError) {
        console.error("Failed to query booked seats for flight:", ticketError)
      }
    }
    
    const segmentId = `local_seg_${flightId}`
    const sliceId = `local_slice_${flightId}`
    const seatMap = generateSeatMapForFlight(
      flightId,
      aircraftModel,
      aircraftIata,
      aircraftIcao,
      segmentId,
      sliceId,
      bookedSeats
    )

    return NextResponse.json({
      success: true,
      data: [seatMap],
      isFallback: false,
    })
  } catch (error) {
    console.error("Seat maps route error:", error)
    return NextResponse.json({
      success: false,
      error: "Seat map request failed: " + (error as Error).message,
    }, { status: 500 })
  }
}
