const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()
const fs = require('fs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}))

const baseUrl = 'https://www.sabic.com'
const productSearchUrl = 'https://www.sabic.com/en/search/products-search?q='
const documentSearchUrl = 'https://www.sabic.com/en/search/product-documents?q='

async function extractDataFromSearchUrl (searchString) {
    try {
        const response = await axios.get(productSearchUrl + encodeURIComponent(searchString));
        const html = response.data;
        const $ = cheerio.load(html);
        const products = [];

        $('.block.search.result.prod').each((index, element) => {
            const product = {};
            const regionArray = [];
            $(element).find('.result-compare ul li a').each((i, el) => {
                regionArray.push($(el).text());
            });
            product.region = regionArray;
            product.name = $(element).find('h3 a').text();
            product.description = $(element).find('p').text();
            product.url = baseUrl + $(element).find('h3 a').attr('href')
            products.push(product);
        });

        return products
    } catch (error) {
        console.error(`Error fetching ${productSearchUrl}: ${error}`);
    }
}

app.get('/sabic-product-search/api/search/:searchString', async function (req, res) {
    const searchString = req.params.searchString;
    // const filter1 = req.query.filter1;
    // const filter2 = req.query.filter2;
    // console.log(`searchString: ${searchString}, filter1: ${filter1}, filter2: ${filter2}`)
    const searchResult = await extractDataFromSearchUrl(searchString)
    res.json(searchResult).send();
    // res.send('Hello World')
})

app.listen(8691)
