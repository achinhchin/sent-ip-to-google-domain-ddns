import * as fs from 'fs'

type TokenModel = {
    user: string,
    pass: string,
    domain: string
}[];

class Main {
    cache: string;
    homeIp: string;
    
    constructor() {
        this.cache = Cache.get();
        this.homeIp = '';
        this.getHomeIp().then(_ => this.homeIp = _);

        setInterval(() => {
            this.cache = Cache.get();
            this.getHomeIp().then(_ => this.homeIp = _);

            if (this.homeIp != this.cache) {
                this.getToken().forEach(tokenData => {
                    fetch(`https://${tokenData.user}:${tokenData.pass}@domains.google.com/nic/update?hostname=${tokenData.domain}&myip=${this.getHomeIp}`);
                });
            }
        }, 60 * 1000);
    }

    public async getHomeIp():Promise<string> {
        let ip:string = '';
        ip = await (await fetch('https://api.ipify.org')).text();
        return ip;
    }

    public getToken():TokenModel {
        let data = fs.readFileSync('./data/token.json', {encoding: 'utf8', flag: 'w+'});
        if (data != '') {
            return JSON.parse(data);
        }else {
            return [];
        }
    }
}

class Cache {
    public static get():string { 
        let data:string = fs.readFileSync('./data/cache.json', {encoding: 'utf8', flag: 'w+'});
        if (data != '') {
            return JSON.parse(data);
        }else {
            return '';
        }
    }

    public static write(data: string):void {
        fs.writeFileSync('./data/cache.json', JSON.stringify(data), {encoding: 'utf8', flag: 'w+'});
    }
}

const main = () => new Main();

main();
