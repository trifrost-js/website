import {type MarkdownNode, Markdown} from '../../utils/Markdown';
import {css} from '../../css';

type MarkdownLinksPanelOptions = {
  tree: MarkdownNode[];
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function MarkdownLinks({tree, style, ...rest}: MarkdownLinksPanelOptions) {
  const cls = css.use(
    'f',
    'fv',
    {
      a: css.mix('text_body', 'sp_xs', {
        cursor: 'pointer',
        userSelect: 'none',
        border: 'none',
        overflow: 'hidden',
        color: css.$t.body_fg,
        fontSize: css.$v.font_s_small,
        letterSpacing: '.1rem',
        lineHeight: 1.4,
        textDecoration: 'none',
        marginLeft: 0,
        [css.attr('data-level', '5')]: {
          marginLeft: css.$v.space_m,
        },
        [css.hover]: {
          textDecoration: 'underline',
        },
        [css.not(css.lastChild)]: {
          borderBottom: '1px solid ' + css.$t.panel_border,
        },
      }),
    },
    style || {},
  );

  return (
    <div className={cls} {...rest}>
      {Markdown.extractHeadersFromNodes(tree).map(el => (
        <a href={`#${el.id}`} key={el.id} data-level={el.level}>
          {el.title}
        </a>
      ))}
    </div>
  );
}
