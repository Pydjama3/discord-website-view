import Discord from 'discord.js';
import captureWebsite from 'capture-website';
import request from 'request';
import fs from 'fs';

// ES6 import


//  define the client
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
    retryLimit: Infinity,
  });

// dowloads a files from a URL
async function download(url, ext, name){
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream(name+'.'+ext));
    }

// "Ready !" and looks
client.on("ready", () => {
    console.log("Ready !")
    let activities = ["new websites !,WATCHING", "for css and html files...,LISTENING"] //activities
    setInterval(() => {
        const randomIndex = Math.floor(Math.random() * (activities.length - 1) + 1);
        const newActivity = activities[randomIndex];
        client.user.setActivity({name: newActivity.split(",")[0], type:newActivity.split(",")[1]});
      }, 20000);
})


// Important part
client.on("messageCreate", async(message) =>{
    
    // detect the good type of message
    if(!message.guild) return
    if(!message.attachments) return
    let attaches = message.attachments
    if(attaches.size != 2) return  

    let css = undefined;
    let html = undefined;

    // filter html and ccs files
    for (let file of attaches) { 
        if(file[1].name.toString().endsWith(".html") && html == undefined){
            html = file[1].url
        }
        else if(file[1].name.toString().endsWith(".css") && css == undefined){
            css = file[1].url
        }
    }
    if(!html || !css) return

    let date = new Date().toJSON().replace(".", "-").replace(":", "-").replace(":", "-") //file name 

    // load the files from discord
    await download(css, "css", "./files/"+date) 
    await download(html, "html", "./files/"+date)

    // screenshot the website
    await captureWebsite.file("./files/"+date+".html", "./sss/"+date+".png", {
        delay:1,
        fullPage:true,
        styles:[
            "./files/"+date+".css"
        ]
    })

    // delete html and css files
    fs.unlink("./files/"+date+".html", (err) => {
        if (err) throw err;
        fs.unlink("./files/"+date+".css", (err) => {
            if (err) throw err;
        })
      });

    // send result
    const embed = new Discord.MessageEmbed().setTitle('Your page looks like:').setImage("attachment://sss/"+date+".png");
    await message.channel.send({embeds: [embed], files: ["./sss/"+date+".png"] });

    // delet image
    fs.unlink("./sss/"+date+".png", (err) => {if (err) throw err});
})

// login
client.login('YOUR TOKEN')