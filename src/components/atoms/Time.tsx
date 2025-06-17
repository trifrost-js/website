import {isDate, format as dateFormatter} from '@valkyriestudios/utils/date';
import {css} from '../../css';

type TimeProps = {
  date: Date | string | number;
  tz?: string;
  format?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function Time({date, tz, format, style, ...rest}: TimeProps) {
  const n_date = isDate(date) ? date : new Date(date);
  return (
    <time {...(style && {className: css.use(style)})} dateTime={n_date.toISOString()} {...rest}>
      {dateFormatter(n_date, format || 'dddd, MMMM D, YYYY', 'en-US', tz || 'UTC')}
    </time>
  );
}
