/**
 * Card Types
 */

export interface CardData {
  pId: string
  orgId: string
  eventId: string
  participantName: string   // Khmer name
  prefix: string            // លោក | លោកស្រី | កុមារ | កុមារី                                                                                                                                                     
                                                                                                                                                                                                                     
  photoUrl?: string
  categoryLetter: string    // A | B | D | Fo | F | V
  sportName: string         // Khmer
  cardUuid: string
  eventDateLine?: string    // Khmer date string
  subtitleKh?: string
  orgName?: string
  eventName?: string
}

export interface PaginatedCardsResponse {
  items: CardData[]
  total: number
  page: number
  page_size: number
}
