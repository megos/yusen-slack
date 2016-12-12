const client  = require('cheerio-httpcli');
const request = require('request');
const CronJob = require('cron').CronJob;

const slackWebhookUrl  = 'your slack url';
const slackBotUserName = 'usen-bot';

const param = {
  npband: 'C',
  npch  : '26',
  nppage: 'yes',
  _     : ''
};

let nowPlaying = '';

const postUsenNowPlaying = () => {
  param.date = new Date().getTime();

  client.fetch('http://music.usen.com/usencms/search_nowplay1.php', param)
  .then((result) => {
    return result.$('.np-now li').text().replace(/[ａ-ｚＡ-Ｚ０-９＝！＄＋＊％＆]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).replace(/　/g, ' ');
  })
  .then((np) => {
    if (np !== nowPlaying) {
      const options = {
        url : slackWebhookUrl,
        form: 'payload={"text": "' + np + '", "username": "' + slackBotUserName + '"}',
        json: true
      };
      request.post(options, (error, res, body) => {
        console.log(body);
        nowPlaying = np;
      });
    }
  });
}

const job = new CronJob({
  cronTime: '12 */1 * * * *',
  onTick  : () => {postUsenNowPlaying()},
  start   : true,
  timeZone: 'Asia/Tokyo'
});

job.start();