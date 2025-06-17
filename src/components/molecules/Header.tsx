import {TriFrostEmblem} from '../atoms/Icons';
import {Theme} from '../atoms/Theme';
import {
    GitHub,
    NPM,
    Discord,
} from '../atoms/Icons';
import {css} from '../../css';
import {Script} from '@trifrost/core/modules/JSX';

enum HeaderSections {
	Home = 'home',
	Docs = 'docs',
	Examples = 'examples',
	News = 'news',
}

export type HeaderSection = `${HeaderSections}`;

const list = [
    {name: HeaderSections.Home, label: 'About', to: '/'},
    {name: HeaderSections.Docs, label: 'Docs', to: '/docs/what-is-trifrost'},
    {name: HeaderSections.Examples, label: 'Examples', to: '/examples'},
    {name: HeaderSections.News, label: 'News', to: '/news'},
];

const icons = [
    {title: 'GitHub', to: 'https://github.com/trifrost-js/core', Icon: GitHub},
    {title: 'NPM', to: 'https://www.npmjs.com/package/@trifrost/core', Icon: NPM},
    {title: 'Join the community on Discord', to: 'https://discord.gg/e9zTXmtBG8', Icon: Discord},
];

function HeaderLogo (props:{style?:Record<string, unknown>}) {
    const cls = css.use('f', 'fh', 'fa_c', {
        fontFamily: css.$v.font_header,
        fontSize: css.$v.font_s_header,
        fontWeight: 600,
        textDecoration: 'none',
        ...props.style || {},
    });

    return <a href="/" className={cls}>
 		<TriFrostEmblem width={30} />
 		<span className={css.use({marginLeft: css.$v.space_xs, color: css.$t.body_fg})}>TriFrost</span>
 	</a>;
}

function HeaderTrigger () {
    const cls = css.use('f', 'fv', 'fa_c', 'fj_c', 'sm_t_s', 'sm_r_s', {
        width: '5rem',
        height: '5rem',
        appearance: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 0,
        color: css.$t.body_fg,
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        right: 0,
        span: {
            display: 'block',
            width: '3rem',
            height: '0.3rem',
            borderRadius: css.$v.rad_s,
            backgroundColor: css.$t.body_fg,
            margin: '0.2rem 0',
            transition: 'transform .2s ease',
            position: 'relative',
        },
        [css.attr('data-open')]: {
            marginTop: `calc(${css.$v.space_s} + ${css.$v.space_s})`,
            marginRight: `calc(${css.$v.space_s} + ${css.$v.space_s})`,
            span: {
                [css.nthOfType(1)]: {
                    transform: 'rotateZ(45deg)',
                    top: '.7rem',
                },
                [css.nthOfType(2)]: {opacity: 0},
                [css.nthOfType(3)]: {
                    transform: 'rotateZ(-45deg)',
                    top: '-.7rem',
                },
            },
        },
        [css.media.desktop]: css.mix('hide'),
    });

    return <button type="button"
        className={cls}
        aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <Script>{el => {
            el.addEventListener('click', () => {
                el.toggleAttribute('data-open');
				el.parentElement!.toggleAttribute('data-open');
            });
        }}</Script>
    </button>;
}

function HeaderItem (props:{key:string, active:string, el:typeof list[number]}) {
    const cls = css.use('br_l', {
        fontFamily: css.$v.font_body,
        fontSize: css.$v.font_s_form,
        fontWeight: 400,
        padding: `${css.$v.space_s} ${css.$v.space_m}`,
        textDecoration: 'none',
        letterSpacing: '.1rem',
        cursor: 'pointer',
        color: css.$t.body_fg,
        [[
            `${css.hover}${css.not(css.attr('data-disabled'))}`,
            css.attr('data-active'),
        ].join(',')]: {
            background: css.$t.navitem_bg,
            color: css.$t.navitem_fg,
        },
        [css.attr('data-disabled')]: {
            cursor: 'not-allowed',
            opacity: 0.5,
        },
    });

    return props.el.to
        ? <a
            href={props.el.to}
            key={props.key}
            rel="follow"
            className={cls}
            {...props.active === props.el.name && {'data-active': true}}
        >{props.el.label}</a>
        : <span className={cls} data-disabled>{props.el.label}</span>;
}

function HeaderIcon (props:{key:string|number, el:typeof icons[number]}) {
    const cls = css.use({
        color: css.$t.navicon_fg,
        opacity: 0.7,
        [css.hover]: {opacity: 1},
    });

    const {Icon, to, title} = props.el;

    return <a
        className={cls}
        href={to}
        key={props.key}
        title={title}
        target="_blank"
        rel="follow"
    ><Icon width={24} /></a>;
}

export function Header (props:{active:HeaderSection}) {
    const cls = css.use('f', 'fj_l', 'fa_c', 'sp_v_l', {
        position: 'relative',
        textAlign: 'center',
        width: '100%',
        [css.media.desktop]: css.mix('fh', 'sp_h_m'),
        [css.media.tablet]: css.mix('sp_h_s', {
            ' #docsearch > button': css.mix('fs0', {
                position: 'absolute',
                top: '1.7rem',
                left: '15rem',
            }),
            [css.not(css.attr('data-open'))]: {
                nav: {
                    [`> *${css.not('#docsearch')}`]: css.mix('hide'),
                },
            },
            [css.is(css.attr('data-open'))]: css.mix('fv', 'fa_l', {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                zIndex: 10000,
                overflow: 'hidden',
                background: css.$t.body_bg,
                paddingTop: `calc(${css.$v.space_s} + ${css.$v.space_l})`,
                paddingBottom: `calc(${css.$v.space_s} + ${css.$v.space_l})`,
                paddingLeft: `calc(${css.$v.space_s} + ${css.$v.space_s})`,
                paddingRight: `calc(${css.$v.space_s} + ${css.$v.space_s})`,
                ' #docsearch': css.mix('hide'),
            }),
        }),
    });

    return <header className={cls}>
        <HeaderLogo />
        <nav className={css.use('f', 'fg', 'fh', {
            [css.media.desktop]: css.mix('fa_c', 'fj_sb', 'sm_l_xl'),
            [css.media.tablet]: css.mix('fv', 'fa_l', 'fj_l', 'sm_t_l', {width: '100%'}),
        })}>
            <div className={css.use('f', 'fa_c', {
                gap: css.$v.space_s,
                [css.media.desktop]: css.mix('fh', 'sm_r_xl'),
                [css.media.tablet]: css.mix('fv', 'fg', {
                    width: '100%',
                    [` ${css.is('a, span')}`]: {
                        width: '100%',
                        height: '5rem',
                        lineHeight: '5rem',
                        marginRight: 0,
                        padding: 0,
                    },
                }),
            })}>
                {list.map(el => <HeaderItem el={el} key={el.name} active={props.active} />)}
            </div>
            <div id="docsearch"></div>
            <div className={css.use('fg', {[css.media.desktop]: css.mix('hide')})}></div>
            <aside className={css.use('f', 'fg', 'fj_r', 'fa_c', {
                [css.media.tablet]: css.mix('fj_sb', 'fg0', 'fs0', {width: '100%'}),
            })}>
                <div className={css.use('f', 'fa_c', 'fj_c', {
                    gap: css.$v.space_m,
                    [css.media.desktop]: css.mix('fh', 'sm_r_l'),
                    [css.media.tablet]: {
                        ' svg': {
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '30px',
                            maxHeight: '30px',
                        },
                    },
                })}>
                    {icons.map((el, idx) => <HeaderIcon el={el} key={idx} />)}
                </div>
                <Theme />
            </aside>
        </nav>
        <HeaderTrigger />
    </header>;
}
