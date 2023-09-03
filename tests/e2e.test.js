//@ts-check
const { chromium } = require('playwright-chromium');
const { expect } = require('chai');

const mockData = require('./mock-data.json');

function json(data) {
    return {
        status: 200,
        headers: {
            'Access-Controll-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
}

let browser;
let context;
let page;

describe('E2E tests', function () {
    this.timeout(60000);

    before(async () => {
        // browser = await chromium.launch({ headless: false, slowMo: 500 });
        browser = await chromium.launch();
    });

    after(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();

        // block intensive resources and external calls (page routes take precedence)
        await context.route('**/*.{png,jpg,jpeg}', route => route.abort());
        await context.route(url => {
            return url.hostname != 'localhost';
        }, route => route.abort());

        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });

    describe('Catalog', () => {
        it('loads and displays recipes', async () => {
            await page.route('**/data/recipes', (request) => {
                request.fulfill(json(mockData.list))
            })
            await page.goto('http://localhost:3000');

            await page.waitForSelector('article');

            const titles = await page.$$eval('h2', titles => titles.map(t => t.textContent));

            expect(titles[0]).to.contains('Easy Lasagna');
            expect(titles[1]).to.contains('Grilled Duck Fillet');
            expect(titles[2]).to.contains('Roast Trout');
        })
    });

    describe('Authentication', () => {
        it('register sends correct request', async () => {
            await page.route('**/users/register', route =>  route.fulfill(json({_id: '0001', email, accessToken: 'AAAA'})))

            const email = 'peter@abv.bg';
            const password = '123456';

            await page.goto('http://localhost:3000');
            await page.click('text=Register');

            await page.waitForSelector('form');

            await page.fill('[name="email"]', email)
            await page.fill('[name="password"]', password)
            await page.fill('[name="rePass"]', password)

            const [request] = await Promise.all([
                page.waitForRequest(request => request.url().includes('/users/register') && request.method() == 'POST'),
                page.click('[type="submit"]')
            ]) 
    
            const postData = JSON.parse(request.postData())
            expect(postData.email).to.equal(email);
            expect(postData.password).to.equal(password);
        });

        it('login sends correct request', async () => {
            await page.route('**/users/login', route =>  route.fulfill(json({_id: '0001', email, accessToken: 'AAAA'})))

            const email = 'peter@abv.bg';
            const password = '123456';

            await page.goto('http://localhost:3000');
            await page.click('text=Login');

            await page.waitForSelector('form');

            await page.fill('[name="email"]', email)
            await page.fill('[name="password"]', password)

            const [request] = await Promise.all([
                page.waitForRequest(request => request.url().includes('/users/login') && request.method() == 'POST'),
                page.click('[type="submit"]')
            ]);
    
            const postData = JSON.parse(request.postData())
            expect(postData.email).to.equal(email);
            expect(postData.password).to.equal(password);
        });
    });

});
