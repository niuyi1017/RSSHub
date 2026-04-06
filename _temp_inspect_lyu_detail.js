const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('_temp_lyu_detail.html', 'utf8');
const $ = cheerio.load(html);

const selectors = [
    '.wp_articlecontent',
    '#wp_articlecontent',
    '.Article_Content',
    '.arti_content',
    '.info',
    'article',
    '.news-content',
    '.content',
    '.infobox',
    '.article',
    '.article-content',
    '.wp_article_detail',
    '.wp_articlecontent p',
];

for (const selector of selectors) {
    const el = $(selector);
    console.log(selector, 'count=', el.length, 'text=', JSON.stringify((el.first().text() || '').trim().slice(0, 160)));
}

console.log('title=', JSON.stringify($('title').text().trim()));
console.log('h1=', JSON.stringify($('h1').first().text().trim()));
console.log('h2=', JSON.stringify($('h2').first().text().trim()));
console.log('top classes=', $('div,section,article').slice(0, 80).map((_, e) => $(e).attr('class')).get().filter(Boolean));
