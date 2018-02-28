import * as Database from 'better-sqlite3'
import { join } from 'path'
import { initDatabase, insertCard } from './sql'
import { writeFileSync, mkdirSync, rmdirSync, createWriteStream } from 'fs'
import * as rimraf from 'rimraf'
import * as archiver from 'archiver'

export class APKG {
  private db: any
  private deck: DeckConfig
  private dest: string
  constructor(private config: DeckConfig) {
    this.dest = join(__dirname, config.name)
    this.clean()
    mkdirSync(this.dest)
    writeFileSync(join(this.dest, 'media'), '{}')
    this.db = new Database(join(this.dest, 'collection.anki2'))
    this.deck = {
      ...config,
      id: +new Date()
    }
    initDatabase(this.db, this.deck)
  }
  addCard(card: Card) {
    insertCard(this.db, this.deck, card)
  }
  save(destination: string) {
    const directory = join(__dirname, this.config.name)
    const archive = archiver('zip')
    archive.directory(directory, false)
    archive.pipe(
      createWriteStream(join(destination, `${this.config.name}.apkg`))
    )
    archive.finalize()
    archive.on('end', this.clean.bind(this))
  }
  private clean() {
    rimraf(this.dest, () => {})
  }
}
