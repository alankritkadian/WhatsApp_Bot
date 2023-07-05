const qrcode = require('qrcode-terminal');
const { createApi } = require('unsplash-js');
const fetch = require("node-fetch");
const { MessageMedia } = require('whatsapp-web.js');
const { exec } = require('child_process');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const axios = require("axios");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--unhandled-rejections=strict"
        ]
    }
});

class Unsplash {
    constructor(accessKey) {
        // Create an instance of the Unsplash API using the provided access key
        this.unsplash = createApi({ accessKey, fetch });
    }

    async getPhoto(query, page = 1, per_page = 8, orientation = 'landscape') {
        try {
            // Send a request to the Unsplash API to search for photos
            const response = await this.unsplash.search.getPhotos({
                query,
                page,
                per_page,
                orientation,
            });

            // Select a random photo from the response
            const aRandomPhoto = response.response.results[Math.floor(Math.random() * 8)];
            // Get the regular size photo url
            const photoUrl = aRandomPhoto.urls.regular;
            return photoUrl;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

const unsplash = new Unsplash('IgovPqwGqYaI3eTH6_jy0AJk-ElfpbKxdOEW3yD7k78');


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (message) => {
    try {
        const date_ = new Date();
        const month = date_.getMonth();
        const date = date_.getDate();
        const hour = date_.getHours();
        const minute = date_.getMinutes();
        const second = date_.getSeconds();
        contact_current = await message.getContact();
        chat = await message.getChat();
        message_current = message.body.split(' ');
        console.log(message_current);
        if (message_current[0].split('\n')[0] === '!ping') {
            message.reply('pong');
        }
        if (message_current[0].split('\n')[0] === '!hi') {
            // message.reply(message.from, `Hello ${contact_current.name}!`);
        }
        if (message_current[0] === '!unsplash') {
            message_url = await unsplash.getPhoto(message.body.slice(10));
            if (message_url != null) {
                const media = await MessageMedia.fromUrl(message_url, { unsafeMime: true });
                message.reply(media);
            } else {
                message.reply('No image found');
            }
        }
        if (message_current[0] === '!image') {
            const query = message.body.slice(7);
            const cx = '33ea129b4b24a499c';
            const apiKey = 'AIzaSyBax8ZeFNCZ9fFb8FYewr7eQZ5vQEkgVdk';

            const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&searchType=image`;

            var image_url = null;

            await fetch(url)
                .then(response => response.json())
                .then(data => {
                    // console.log(data);
                    const imageUrls = data.items.map(item => item.link);
                    image_url = imageUrls[Math.floor(Math.random() * imageUrls.length)];
                    // console.log(image_url);
                })
                .catch(error => console.error(error));
            if (image_url != null) {
                const media = await MessageMedia.fromUrl(image_url, { unsafeMime: true });
                message.reply(media);
            } else {
                message.reply('No image found');
            }
        }
        if (message_current[0].split('\n')[0] === '!time') {
            message.reply(`The time is ${hour}:${minute}:${second}`);
        }
        if (message_current[0].split('\n')[0] === '!python') {
            var code = message.body.slice(8);
            fs.writeFile('new.py', code, function (err) {
                if (err) throw err;
                console.log('File created!');
            });
            code = 'new.py'
            if (message_current.find(element => element === 'itertools')) {
                message.reply("Too vulnerable!!")
            } else {
                exec(`python ${code}`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        message.reply(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        message.reply(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    message.reply(`stdout: ${stdout}`);
                });
            }
        }
        if (message_current[0].split('\n')[0] === '!help') {
            message.reply('!ping - pong\n!hi - Hello\n!unsplash <query> - Get a random image from unsplash\n!image <query> - Get a random image from google\n!time - Get the time\n!python\n<code> - Run python code\n!chatGPT <text> - Chat with GPT-3');
        }
        if (message_current[0].split('\n')[0] === '!chatGPT') {
            var data = JSON.stringify({ "text": message.body.slice(9) });
            const options = {
                method: 'POST',
                url: 'https://chatgpt-ai-chat-bot.p.rapidapi.com/ask',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': '5e3c397a62msh223fd5b36845d62p167b90jsn0c85c7d17379',
                    'X-RapidAPI-Host': 'chatgpt-ai-chat-bot.p.rapidapi.com'
                },
                data: data
            };

            axios.request(options).then(function (response) {
                message.reply(response.data)
            }).catch(function (error) {
                console.error(error);
            });
        }
        if (message_current[0].split('\n')[0] === '!define') {
            var term = message.body.slice(8);
            const options = {
                method: 'GET',
                url: 'https://mashape-community-urban-dictionary.p.rapidapi.com/define',
                params: { term: term },
                headers: {
                    'X-RapidAPI-Key': '5e3c397a62msh223fd5b36845d62p167b90jsn0c85c7d17379',
                    'X-RapidAPI-Host': 'mashape-community-urban-dictionary.p.rapidapi.com'
                }
            };

            await axios.request(options).then(function async(response) {
                const randomNumInRange = Math.floor(Math.random() * (response.data.list.len + 1));
                message.reply(response.data.list[randomNumInRange].definition)
            }).catch(function (error) {
                console.error(error);
            });
        }
    } catch (error) {
        console.log(error);
    }
});

client.initialize();