interface DeckConfig {
  id?: number
  name: string
  card: {
    fields: Array<string>
    template: {
      question: string
      answer: string
    }
    styleText?: string
  }
}

interface Card {
  timestamp?: number,
  content: Array<string>
}
