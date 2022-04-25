const Telegraf = require("telegraf");
const axios = require("axios");
const fs = require("fs");
const bot = new Telegraf("5327918173:AAFMsqSU3tReWbX-7qowk6rTl406zHaPVF8");

const helpMessage = `
  *Oddiy Api Bot*
  /omad - omadli narsalarni oling,
  /mushuk - mushuk rasmlarini oling,
  /mushuk \`<text>\` - Mushuk rasmiga text yozing,
  /ItZotlari - It zotlari bilan tanishish,
  /It \`<Zot Nomi>\` - It zoti rasmini oling.,

`;

// Command start and help
bot.command(["start", "help"], (msg) => {
  msg.telegram.sendMessage(msg.from.id, helpMessage, {
    parse_mode: "markdown",
  });
});

// command mushuk
bot.command("omad", (msg) => {
  axios
    .get("http://yerkee.com/api/fortune")
    .then((res) => {
      msg.reply(res.data.fortune);
    })
    .catch((err) => {
      console.log(err);
    });
});

// command mushuk - text
bot.command("mushuk", async (msg) => {
  let input = msg.message.text;
  let inputArray = input.split(" ");
  if (inputArray.length == 1) {
    try {
      let res = await axios.get("https://aws.random.cat/meow");

      msg.replyWithPhoto(res.data.file);
    } catch (err) {
      msg.reply("Serverda Katta xatoliklar bor");
      msg.telegram.sendAnimation(
        msg.chat.id,
        "https://i.gifer.com/origin/3a/3ad09d4905511990cccc98d904bd1e94.gif"
      );
    }
  } else {
    inputArray.shift();
    input = inputArray.join(" ");
    try {
      msg.replyWithPhoto(`https://cataas.com/cat/says/${input}`);
    } catch (err) {
      msg.reply("Serverda Katta xatoliklar bor");
      msg.telegram.sendAnimation(
        msg.chat.id,
        "https://i.gifer.com/origin/3a/3ad09d4905511990cccc98d904bd1e94.gif"
      );
    }
  }
});

// It zotlari lest text
bot.command("ItZotlari", (msg) => {
  let itText = fs.readFileSync("./itZoti.json", "utf8");
  let itZoti = JSON.parse(itText);

  let message = "Jenis Anjing: \n";
  itZoti.forEach((item) => {
    message += `- ${item} \n`;
  });
  msg.reply(message);
});

// It zotlari texti orqali rasmi
bot.command("It", (msg) => {
  let input = msg.message.text.split(" ");
  if (input.length != 2) {
    msg.reply("It zotlari bilan tanishish uchun /It zotNomini kiriting");
    return;
  }
  let breedInput = input[1];
  let rawData = fs.readFileSync("./itZoti.json", "utf8");
  let data = JSON.parse(rawData);

  if (data.includes(breedInput)) {
    axios
      .get(`https://dog.ceo/api/breed/${breedInput}/images/random`)
      .then((res) => {
        msg.replyWithPhoto(res.data.message);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let suggestions = data.filter((item) => {
      return item.startsWith(breedInput);
    });
    let message =
      "*Siz qaysi it zoti rasmini qidirmoqdasiz iltimos to'liq kiriting! \n Quyidagi It zotlari mavjud*: \n";
    suggestions.forEach((item) => {
      message += `- \`${item}\` \n`;
    });
    if (suggestions.length == 0) {
      msg.telegram.sendMessage(
        msg.chat.id,
        "*Bu texti yozib bo'lgan it zotlar yo'q*",
        {
          parse_mode: "markdown",
        }
      );
    } else {
      msg.telegram.sendMessage(msg.chat.id, message, {
        parse_mode: "markdown",
      });
    }
  }
});

bot.launch();
