# anki-apkg

anki-apkg is highly inspired by [anki-apkg-export](https://github.com/repeat-space/anki-apkg-export/) and works almost the same, then why a new package?

Because I'm not satisfied with only creating `{{front}}` and `{{back}}` field for a card, this package is created to make it possible to customize fields (and any other variables of a deck or card in the future).

```
npm install anki-apkg
```

```js
const { APKG } = require('anki-apkg')

const apkg = new APKG({
    name: 'VocabularyBuilder',
    card: {
        fields: ['word', 'meaning', 'usage'],
        template: {
            question: '{{word}}',
            answer: `
              <div class="word">{{word}}</div>
              <div class="meaning">{{meaning}}</div>
              <div class="usage">{{usage}}</div>
            `
        },
        styleText: '.card { text-align: center; }'
    }
})
apkg.addCard({
    timestamp: +new Date(), // create time
    content: ['sample word', 'sample meaning', 'sample usage'] // keep the order same as `fields` defined above
})
apkg.save(__dirname)
```

## TODO
- [ ] media
