import hljs from 'highlight.js';
import {css} from '../../css';
import {Script} from '@trifrost/core/modules/JSX';

type HighLightProps = {
	code?:string;
	language?:string;
	children?:any;
	className?:string;
	copyEnabled?:boolean;
	[key:string]: unknown;
};

export function HighLight ({code, language = 'ts', copyEnabled = true, children, className = '', ...props}:HighLightProps) {
    const source = code ?? children ?? '';
    const highlighted = hljs.highlight(source.trim(), {language}).value;

    return <div className={`highlight ${css({position: 'relative'})}`}>
        {copyEnabled === true && <button type="button" className={css.use('br_s', 'badge_normal', 'outline', {
            padding: '0.2rem 0.5rem',
            fontFamily: css.$v.font_body,
            fontSize: css.$v.font_s_small,
            fontWeight: 400,
            cursor: 'pointer',
            letterSpacing: '.1rem',
            position: 'absolute',
            top: css.$v.space_s,
            right: css.$v.space_s,
            border: 'none',
            appearance: 'none',
            zIndex: 10,
        })}>
			copy
            <Script>{el => {
                el.addEventListener('click', () => {
                    navigator.clipboard.writeText(el.nextSibling!.textContent || '')
                        .then(() => el.innerText = 'copied!')
                        .then(() => setTimeout(() => el.innerText = 'copy', 1000));
                });
            }}</Script>
        </button>}
        <pre {...props}><code
            className={`language-${language} hljs${className ? ' ' + className : ''}`}
            dangerouslySetInnerHTML={{__html: highlighted}} /></pre>
    </div>;
}
