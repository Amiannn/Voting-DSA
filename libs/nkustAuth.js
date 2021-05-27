const axios  = require('axios');
const jwt    = require('jsonwebtoken');
const rp     = require('request-promise');
const cheerio= require("cheerio");
const config = require('../config.js');

require('dotenv').config({ path: '.env' });
const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_AUTHORIZE, OAUTH_TOKEN_URL, OAUTH_RESOURCE_URL, OAUTH_CALLBACK_URL, RECAPTCHA_SECRET } = process.env;

const user_agent = [
    'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.16 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2762.73 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2226.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.17 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.62 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.62 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1623.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/44.0.2403.155 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36'
]

module.exports = {
    async checkCaptcha(captcha) {
        if (captcha == "" || captcha == undefined)
            return false;
        const options = {
            method: 'POST',
            url: 'https://www.google.com/recaptcha/api/siteverify',
            form: {
                secret: RECAPTCHA_SECRET,
                response: captcha
            },
        };
        try {
            await rp(options);
        } catch (error) {
            return false;
        }
        return true;
    },

    async cawlerAPI(uid, pwd, captcha) {
        const agent_index  = Math.floor(Math.random() * user_agent.length);
        const check_result = await this.checkCaptcha(captcha);
        if (!check_result) throw Error('captcha authorize failed.');
        const options = {
            method: 'POST',
            url: OAUTH_AUTHORIZE,
            headers: {
                'cache-control': 'no-cache',
                'User-Agent'   : user_agent[agent_index],
                'Origin'       : 'https://webap.nkust.edu.tw',
                'Host'         : 'webap.nkust.edu.tw',
                'Content-Type' : 'application/x-www-form-urlencoded',
            },
            form: {
                uid, pwd
            },
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        try {
            await rp(options)
                    .then(function($) {
                        if (($($('script')[1]).html()).search('alert') >= 0)
                            throw Error('nkust authorize failed.');
                    });
        } catch(error){
            throw error;
        };
        return 'success login';
    },

    obtainServiceToken(account, user) {
        const payload = { account, ...user };
        const options = {
            'algorithm': 'HS256',
            'expiresIn': '1d',
        };
        const token = jwt.sign(payload, config.tokenSecret, options);
        return token;
    },
};
