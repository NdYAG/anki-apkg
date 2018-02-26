import * as Database from 'better-sqlite3'
import { join } from 'path'
import { genDatabaseSQL, genInsertionSQL } from './sql'
import { writeFileSync, mkdirSync, rmdirSync, unlinkSync, createWriteStream } from 'fs'
import * as archiver from 'archiver'

export class APKG {
  private db: any
  private deck: DeckConfig
  constructor(private config: DeckConfig) {
    const dest = join(__dirname, config.name)
    mkdirSync(dest)
    writeFileSync(join(dest, 'media'), '{}')
    this.db = new Database(join(dest, 'collection.anki2'))
    this.deck = {
      ...config,
      id: +new Date()
    }
    const sql = genDatabaseSQL(this.deck)
    this.db.exec(sql)
  }
  addCard(card: Card) {
    const { SQL_CARD, SQL_NOTE } = genInsertionSQL(this.deck, card)
    this.db.exec(SQL_CARD)
    this.db.exec(SQL_NOTE)
  }
  save(destination: string) {
    const directory = join(__dirname, this.config.name)
    const archive = archiver('zip')
    archive.directory(directory, false)
    archive.pipe(createWriteStream(join(destination, `${this.config.name}.apkg`)))
    archive.finalize()
    archive.on('end', () => {
      unlinkSync(join(directory, 'media'))
      unlinkSync(join(directory, 'collection.anki2'))
      rmdirSync(directory)
    })
  }
}

