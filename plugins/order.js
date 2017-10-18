const pizzapi = require('dominos')

function setUpConvo(err, convo) {
  console.log(convo);
  convo.addMessage({
    text: `Woof woof! Hello <@${convo.context.user}>! This is the best day ever! Where do you want pizza? I will find nearby pizza places for you! Squirrel!`,
    action: 'thread_2'
  }, 'thread_1')
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
  convo.addMessage(`Here you go! These are the nearby stores \r\n {{ vars.response }}`, 'thread_3')

    convo.addQuestion({text: 'Which store id do you want me to get details on? '},function(res, convo) {
        // name has been collected...
        convo.gotoThread('completed');
    },{key: 'storeId'},'thread_3');

    convo.beforeThread('completed', function(convo, next) {

        const storeId = convo.extractResponse('storeId');

        const myStore = new pizzapi.Store({ID: storeId});

        myStore.getInfo((storeData) => {
            if (storeData.success) {
                convo.setVar('results', storeData);
                next();
            } else {
                convo.gotoThread('error');
                next();
            }
        })
    });

    convo.addMessage({text: 'I saved store {{vars.storeId}} to the database'},'completed');

    convo.addMessage({text: 'Oh no I had an error!'},'error');

    convo.activate()
  convo.gotoThread('thread_1')

}

module.exports = {
  init: (controller) => {
    controller.hears([/I want a pizza/], ['direct_message', 'ambient'], (bot, message) => bot.createConversation(message, setUpConvo))
  },
  help: {
    command: 'welcome',
    text: `Say "hello bot" and I'll give ya a shout`
  }
}
