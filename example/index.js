const { APKG } = require('../')

const apkg = new APKG({
    name: 'VocabularyBuilder',
    card: {
        fields: ['word', 'meaning', 'usage'],
        template: {
            question: '{{word}}',
            answer: `
  <div class="word">{{word}}</div>
  <div class="meaning">{{meaning}}</div>
  <div class="usage">{{usage}}</div>`
        }
    }
})
apkg.addCard({
    content: ['sample word', 'sample meaning', 'sample usage']
})
apkg.save(__dirname)