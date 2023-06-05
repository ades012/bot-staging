const TelegramBot = require('node-telegram-bot-api');
// const ExcelJS = require('exceljs');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const ping = require('ping');
// const traceroute = require('traceroute');
const { exec } = require('child_process');

dotenv.config({ path: path.join(__dirname, '.env') });

const token = process.env.TELEGRAM_TOKEN;
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: process.env.DB_TIMEOUT,
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
  runTelegramBot();
});

function runTelegramBot() {
  const bot = new TelegramBot(token, { polling: true });

  bot.onText(/^(password|brader|nuhun)/i, (msg, match) => {
    const chatId = msg.chat.id;
    const command = match[0].toLowerCase();
  
    if (command === 'password') {
      handlePasswordCommand(chatId, match[1]);
    } else if (command === 'brader') {
      bot.sendMessage(chatId, 'Yoo ma nigga');
    } else if (command === 'nuhun') {
      bot.sendMessage(chatId, 'Sawangsulna Pa/Bu');
    }
  });
  
  bot.onText(/ping\s+(\S+)/i, (msg, match) => {
    const chatId = msg.chat.id;
    const host = match[1];
  
    pingHost(chatId, host);
  });
  
  bot.onText(/traceroute\s+(\S+)/i, (msg, match) => {
    const chatId = msg.chat.id;
    const host = match[1];
  
    traceRoute(chatId, host);
  });
  
  bot.onText(/nslookup\s+(\S+)/i, (msg, match) => {
    const chatId = msg.chat.id;
    const host = match[1];
  
    nsLookup(chatId, host);
  });
  
  function handlePasswordCommand(chatId, ssid) {
    bot.onText(/^password (.+)/i, (msg, match) => {
      const chatId = msg.chat.id;
      const requestedSSID = match[1].trim().toLowerCase();
  
      const query = `SELECT ssid, password FROM wifi WHERE ssid LIKE '%${requestedSSID}%'`;
  
      connection.query(query, (err, rows) => {
        if (err) {
          console.error('Error executing query:', err);
          bot.sendMessage(chatId, 'Oops! An error occurred while fetching data.');
          return;
        }
  
        if (rows.length > 0) {
          const result = rows[0]; // Assuming you want to retrieve only the first matching row
          const response = `Berikut password untuk SSID "${result.ssid}":\nSSID: ${result.ssid}\nPassword: ${result.password}`;
          bot.sendMessage(chatId, response);
        } else {
          const response = `Maaf, data untuk SSID "${requestedSSID}" tidak ditemukan.`;
          bot.sendMessage(chatId, response);
        }
      });
    });
  }
  
  function pingHost(chatId, host) {
    ping.promise.probe(host)
      .then(result => {
        const message = `Ping to ${host}:\nStatus: ${result.alive ? 'Online' : 'Offline'}\nResponse Time: ${result.time} ms`;
        bot.sendMessage(chatId, message);
      })
      .catch(error => {
        bot.sendMessage(chatId, `Failed to ping ${host}: ${error.message}`);
      });
  }
  
  function traceRoute(chatId, host) {
    exec(`tracert -d ${host}`, (error, stdout) => {
      if (error) {
        bot.sendMessage(chatId, `Failed to traceroute ${host}: ${error.message}`);
        return;
      }
  
      bot.sendMessage(chatId, `Traceroute to ${host}:\n\n${stdout}`);
    });
  }
  
  function nsLookup(chatId, host) {
    exec(`nslookup ${host}`, (error, stdout) => {
      if (error) {
        bot.sendMessage(chatId, `Failed to perform nslookup for ${host}: ${error.message}`);
        return;
      }
  
      bot.sendMessage(chatId, `NSLookup for ${host}:\n\n${stdout}`);
    });
  }
}
  
  console.log('Server Running!');