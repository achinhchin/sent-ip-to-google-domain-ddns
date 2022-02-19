import * as fs from 'fs'
import axios from 'axios'

type TokenModel = {
    user: string,
    pass: string,
    domain: string
}[];

class Main {
    cache: string = '';
    homeIp: string = '';

    constructor() {
        this.init();
    }

    async init(): Promise<void> {
        this.cache = await this.getHomeIp();
        Cache.write(this.cache);
        this.homeIp = await this.getHomeIp(); 

        this.updateIpToDdns();

        setInterval(async () => {
            this.cache = Cache.get();
            this.homeIp = await this.getHomeIp();
            
            if (this.homeIp != this.cache) {
                this.updateIpToDdns();
                Cache.write(this.homeIp);
            }
        }, 60 * 1000);
    }

    public updateIpToDdns(): void {
        this.getToken.forEach(tokenData => {
            axios.get(`https://${tokenData.user}:${tokenData.pass}@domains.google.com/nic/update?hostname=${tokenData.domain}&myip=${this.homeIp}`);
            if (!fs.existsSync('./log/')) {
                fs.mkdirSync('./log/');
            }
            fs.writeFileSync('./log/main.txt', 'ip changed from (' + this.cache + ') to (' + this.homeIp + ') at ' + tokenData.domain + ',  time : ' + new Date().toLocaleString() + '\n', {encoding: 'utf8', flag: 'a+'});
        });
    }

    public async getHomeIp(): Promise<string> {
        return (await axios.get('https://api.ipify.org')).data;
    }

    public get getToken(): TokenModel {
        let data = fs.readFileSync('./data/token.json', { encoding: 'utf8'});
        if (data != '') {
            return JSON.parse(data);
        } else {
            return [];
        }
    }
}

class Cache {
    public static get(): string {
        let data: string = fs.readFileSync('./data/cache.txt', { encoding: 'utf8', flag: 'rs+' });
        
        if (data != '') {
            return data;
        } else {
            return '';
        }
    }

    public static write(data: string): void {
        fs.writeFileSync('./data/cache.txt', data, { encoding: 'utf8', flag: 'w+' });
    }
}

const main = () => {
    console.log('system start');
    new Main();
}

main();
