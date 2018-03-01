// Reference:
// https://github.com/ankidroid/Anki-Android/wiki/Database-Structure
import * as sha1 from 'sha1'

export function initDatabase(database: any, config: DeckConfig) {
  const current = config.id
  const deckId = current
  const modelId = deckId + 1
  const fields = config.card.fields.map((field, ord) => ({
    size: 20,
    name: field,
    media: [],
    rtl: false,
    ord,
    font: 'Arial',
    sticky: false
  }))

  let conf = {
    nextPos: 1,
    estTimes: true,
    activeDecks: [1],
    sortType: 'noteFld',
    timeLim: 0,
    sortBackwards: false,
    addToCur: true,
    curDeck: 1,
    newBury: true,
    newSpread: 0,
    dueCounts: true,
    curModel: modelId,
    collapseTime: 1200
  }
  let models = {
    [modelId]: {
      vers: [],
      name: config.name,
      tags: [],
      did: deckId,
      usn: -1,
      req: [[0, 'all', [0]]],
      flds: fields,
      sortf: 0,
      latexPre:
        '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
      tmpls: [
        {
          afmt: config.card.template.answer,
          name: config.name,
          qfmt: config.card.template.question,
          did: null,
          ord: 0,
          bafmt: '',
          bqfmt: ''
        }
      ],
      latexPost: '\\end{document}',
      type: 0,
      id: modelId,
      css:
        config.card.styleText ||
        '.card {\n font-family: arial;\n font-size: 20px;\n text-align: center;\n color: black;\n background-color: white;\n}\n',
      mod: +new Date()
    }
  }
  let decks = {
    [deckId]: {
      mid: modelId, // model id
      name: config.name,
      extendRev: 50,
      usn: -1,
      collapsed: false,
      newToday: [1362, 0],
      timeToday: [1362, 0],
      dyn: 0,
      extendNew: 10,
      conf: 1,
      revToday: [1362, 0],
      lrnToday: [1362, 0],
      id: deckId, // deck id
      mod: +new Date(), // last modification time
      desc: ''
    }
  }
  let decksConfig = {}
  let sql = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS col (
	id	integer,
	crt	integer NOT NULL,
	mod	integer NOT NULL,
	scm	integer NOT NULL,
	ver	integer NOT NULL,
	dty	integer NOT NULL,
	usn	integer NOT NULL,
	ls	integer NOT NULL,
	conf	text NOT NULL,
	models	text NOT NULL,
	decks	text NOT NULL,
	dconf	text NOT NULL,
	tags	text NOT NULL,
	PRIMARY KEY(id)
);
INSERT INTO col VALUES (
  1,
  1401912000,
  ${current},
  ${current},
  11,
  0,
  0,
  0,
  '${JSON.stringify(conf)}',
  '${JSON.stringify(models)}',
  '${JSON.stringify(decks)}',
  '${JSON.stringify(decksConfig)}',
  '{}'
);
CREATE TABLE IF NOT EXISTS cards (
	id	integer,
	nid	integer NOT NULL,
	did	integer NOT NULL,
	ord	integer NOT NULL,
	mod	integer NOT NULL,
	usn	integer NOT NULL,
	type	integer NOT NULL,
	queue	integer NOT NULL,
	due	integer NOT NULL,
	ivl	integer NOT NULL,
	factor	integer NOT NULL,
	reps	integer NOT NULL,
	lapses	integer NOT NULL,
	left	integer NOT NULL,
	odue	integer NOT NULL,
	odid	integer NOT NULL,
	flags	integer NOT NULL,
	data	text NOT NULL,
	PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS notes (
	id	integer,
	guid	text NOT NULL,
	mid	integer NOT NULL,
	mod	integer NOT NULL,
	usn	integer NOT NULL,
	tags	text NOT NULL,
	flds	text NOT NULL,
	sfld	integer NOT NULL,
	csum	integer NOT NULL,
	flags	integer NOT NULL,
	data	text NOT NULL,
	PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS graves (
	usn	integer NOT NULL,
	oid	integer NOT NULL,
	type	integer NOT NULL
);
CREATE TABLE IF NOT EXISTS revlog (
	id	integer,
	cid	integer NOT NULL,
	usn	integer NOT NULL,
	ease	integer NOT NULL,
	ivl	integer NOT NULL,
	lastIvl	integer NOT NULL,
	factor	integer NOT NULL,
	time	integer NOT NULL,
	type	integer NOT NULL,
	PRIMARY KEY(id)
);
CREATE INDEX IF NOT EXISTS ix_revlog_usn ON revlog (
	usn
);
CREATE INDEX IF NOT EXISTS ix_revlog_cid ON revlog (
	cid
);
CREATE INDEX IF NOT EXISTS ix_notes_usn ON notes (
	usn
);
CREATE INDEX IF NOT EXISTS ix_notes_csum ON notes (
	csum
);
CREATE INDEX IF NOT EXISTS ix_cards_usn ON cards (
	usn
);
CREATE INDEX IF NOT EXISTS ix_cards_sched ON cards (
	did,
	queue,
	due
);
CREATE INDEX IF NOT EXISTS ix_cards_nid ON cards (
	nid
);
COMMIT;
`
  database.exec(sql)
}

export function insertCard(database: any, deck: DeckConfig, card: Card) {
  const createTime = card.timestamp || +new Date()
  const cardId = createTime
  const noteId = cardId + 1
  const modelId = deck.id + 1
  const fieldsContent = card.content.join('\u001F')
  const sortField = card.content[0]
  const SQL_CARD = `INSERT INTO cards (id,nid,did,ord,mod,usn,type,queue,due,ivl,factor,reps,lapses,left,odue,odid,flags,data) VALUES (?,  ?,  ?,  0,  ?,  -1,  0,  0,  86400,0,0,0,0,0,0,0,0,'')`
  database.prepare(SQL_CARD).run(cardId, noteId, deck.id, createTime)

  const SQL_NOTE = `INSERT INTO notes (id,guid,mid,mod,usn,tags,flds,sfld,csum,flags,data) VALUES (?,  ?,  ?,  ?,  -1,  '',  ?,  ?,  ?,  0,  '');`
  database
    .prepare(SQL_NOTE)
    .run(
      noteId,
      `${cardId}`,
      modelId,
      createTime,
      fieldsContent,
      sortField,
      parseInt(sha1(sortField).substr(0, 8), 16)
    )
}
