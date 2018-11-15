const { readFileSync } = require('fs')
const { join } = require('path')

const { APKG } = require('../')

const apkg = new APKG({
    name: 'UnicornBuilder',
    card: {
        fields: ['question', 'result'],
        template: {
            question: '{{question}}',
            answer: `{{result}}`
        }
    }
})
apkg.addCard({
    content: ['What happens if you eat too many skittles?', '<img src="unicorn.gif" />']
})
apkg.addMedia('unicorn.gif', readFileSync(join(__dirname, 'media/unicorn.gif')))
apkg.save(__dirname)
