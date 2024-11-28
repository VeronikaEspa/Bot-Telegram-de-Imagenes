const { Telegraf } = require('telegraf')
const { v4: uuidV4 } = require('uuid')
require('dotenv').config()
let factGenerator = require('./factGenerator')


const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
    let message = ` Por favor use the /fact command to receive a new fact`
    ctx.reply(message)
})


bot.command('fact', async (ctx) => {
    try {
        ctx.reply('Generating image, Please wait !!!')
        let imagePath = `./temp/${uuidV4()}.jpg`
        await factGenerator.generateImage(imagePath)
        await ctx.replyWithPhoto({ source: imagePath })
        factGenerator.deleteImage(imagePath)
    } catch (error) {
        console.log('error', error)
        ctx.reply('error sending image')
    }
});


bot.launch()