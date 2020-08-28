const message_csv_file = 'messages.csv';
const template_file = 'index.handlebars';
const output_file = 'index.html';

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

            if (country) {
                country = country.replace("-", " ");

                let lookup = country_lookup.byCountry(country);
                if (lookup) {
                    country_code = lookup.iso2.toLowerCase();
                }
            }

            message_row = {
                timestamp: record[0],
                username: record[1],
                twitter: record[2],
                country: country,
                country_code: country_code,
                message: record[4],
                message_jp: record[6]
            };
            message_data.push(message_row);
        }
    );

    template_data = {
        messages: message_data
    };

    var template = handlebars.compile(template_source);

    output_html = template(template_data);
    await fs.writeFile(output_file, output_html);
})()
