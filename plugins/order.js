const pizzapi = require('dominos')

function setUpConvo(err, convo) {
  convo.addMessage(`Woof woof! Hello <@${message.user}>! This is the best day ever! I am finding nearby pizza places for you! Squirrel!\r\nYour options are\r\n ${response}`, 'thread_1')
  convo.addQuestion('What is your address?', (responseObj, conversation) => {
    convo.setVar('address', responseObj.text)
    pizzapi.Util.findNearbyStores(convo.vars.address, 'Delivery', (storeData) => {
          convo.setVar('response', storeData.result.Stores
            .filter(el => el.IsOpen && el.IsOnlineCapable && el.IsOnlineNow)
            .sort((a, b) => a.StoreID - b.StoreID)
            .map(el => `${el.StoreID}: ${el.AddressDescription}`)
            .join('\r\n'))
          convo.gotoThread('thread_3')
      })
  }, {}, 'thread_2')
  convo.addMessage(`Here you go! These are the nearby stores \r\n ${convo.vars.response}`, 'thread_3')
  
  convo.activate()
  convo.gotoThread('thread_1')

}

module.exports = {
  init: (controller) => {
    controller.hears([/I want a pizza/], ['direct_message', 'direct_mention'], (bot, message) => bot.createConversation(message, setUpConvo))
  },
  help: {
    command: 'welcome',
    text: `Say "hello bot" and I'll give ya a shout`
  }
}
