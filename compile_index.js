const message_csv_file = 'messages.csv';
const template_file = 'index.handlebars';

const minify = require('html-minifier').minify;
const handlebars = require('handlebars');
const fs = require('fs').promises;
const parse = require('csv-parse/lib/sync');
const country_lookup = require('country-code-lookup');

(async function () {
    let message_data = []

    const content = await fs.readFile(message_csv_file);
    const records = parse(content, { from_line: 2 });

    const template_source = await (await fs.readFile(template_file)).toString();

    records.map(
        record => {
            let country = record[3];
            let country_code = '';
            let country_name = '';

            if (country) {
                country = country.replace("-", " ");

                let lookup = country_lookup.byCountry(country);
                if (lookup) {
                    country_code = lookup.iso2.toLowerCase();
                    country_name = lookup.country;
                }
            }

            // https://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi/15034560
            var jpCharacters = record[4].match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/);

            // if there isn't a match, then message is not in Japanese, pass this value to the handlebars file. 
            var isMsgInJP = !(jpCharacters === null)

            message_row = {
                timestamp: record[0],
                username: record[1],
                twitter: record[2],
                country: country,
                country_name: country_name,
                country_code: country_code,
                message: record[4],
                isMsgInJP: isMsgInJP,
                message_jp: record[6]
            };
            message_data.push(message_row);
        }
    );

    template_data = {
        messages: message_data
    };

    var template = handlebars.compile(template_source);

    output_html = minify(
        template(template_data),
        {
            minifyCSS: true,
            minifyJS: true,
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true
        }
    );
    console.log(output_html)
})()
