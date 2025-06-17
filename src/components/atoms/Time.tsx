import {isDate, format} from '@valkyriestudios/utils/date';
import {css} from '../../css';

export function Time (props:{date:Date|string|number, tz?:string, format?:string, style?:Record<string, unknown>}) {
    const date = isDate(props.date) ? props.date : new Date(props.date);
    return <time className={css.use(props.style || {})} dateTime={date.toISOString()}>
        {format(date, props.format || 'dddd, MMMM D, YYYY', 'en-US', props.tz || 'UTC')}
    </time>;
}
