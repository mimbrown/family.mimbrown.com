import { measurements, unconvert } from './measurement';
import { Fraction } from './fraction';

const fractionRegEx = /(\d+)\/(\d+)(?!\d*" data-)/g;
const boldItRegEx = /\*\*\*(.+?)\*\*\*/g;
const boldRegEx = /\*\*(.+?)\*\*/g;
const itRegEx = /\*(.+?)\*/g;
const linkRegEx = /\[(.+?)\]\((.+?)\)/g;
const parseMeasurement = /((?:\d*\.\d+)|(?:(?:\d+\s+)?\d+\/\d+)|\d+)\s*((?:(?:°|deg(?:rees?|\.)?|fl(?:uid|\.)?)\s*)?\w+)/ig;

export default function format(str: string) {
  return str
    .replace(parseMeasurement, (match: string, num: string, unit: string) => {
      for (const category in measurements) {
        const fullUnit = measurements[category].types.find(item => item.match.test(unit));
        if (fullUnit) {
          return `<span class="measurement" data-value="${unconvert(Fraction.fromString(num), fullUnit)}" data-type="${category}">${match}</span>`;
        }
      }
      return match;
    })
    .replace(boldItRegEx, '<strong><em>$1</em></strong>')
    .replace(boldRegEx, '<strong>$1</strong>')
    .replace(itRegEx, '<em>$1</em>')
    .replace(linkRegEx, '<a href="$2" target="_blank">$1</a>')
    .replace(fractionRegEx, '$1&frasl;$2');
}