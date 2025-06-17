import {format} from '@valkyriestudios/utils/date';

export function siteMapEntry (path:string, date?:Date) {
    const parts = [
        '<loc>https://www.trifrost.dev' + path + '</loc>',
    ];

    if (date instanceof Date) {
        parts.push('<lastmod>' + format(date, 'YYYY-MM-DD') + '</lastmod>');
    }

    return '<url>' + parts.join('') + '</url>';
}
