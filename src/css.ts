import {createCss} from '@trifrost/core';

const _css = createCss({
  var: {
    /* Fonts */
    font_header: "'Fira Code', monospace",
    font_body: "'Roboto', Sans-serif",
    /* Font Size */
    font_s_giga: '7.8rem',
    font_s_title: '3.8rem',
    font_s_subtitle: '2.8rem',
    font_s_header: '2rem',
    font_s_form: '1.8rem',
    font_s_body: '1.8rem',
    font_s_small: '1.6rem',
    /* Radii */
    rad_s: '.4rem',
    rad_m: '1rem',
    rad_l: '2rem',
    /* Spacing */
    space_xs: '.5rem',
    space_s: '1rem',
    space_m: '1.5rem',
    space_l: '2rem',
    space_xl: '4rem',
  },
  theme: {
    body_bg: {
      dark: 'linear-gradient(160deg, #0A0F1C 0%, #202d44 50%, #081018 100%)',
      light: 'linear-gradient(160deg, #FFFFFF 0%, #ECF0FA 50%, #F0F2F4 100%)',
    },
    body_fg: {
      dark: '#FFFFFF',
      light: '#03111F',
    },
    border: {
      dark: '#23282E',
      light: '#D4D4D4',
    },
    outline: {
      dark: '2px solid #FFFFFF',
      light: '2px solid #03111F',
    },
    selection_bg: {
      dark: '#FFFFFF',
      light: '#03111F',
    },
    selection_fg: {
      dark: '#03111F',
      light: '#FFFFFF',
    },
    button_bg: {
      dark: 'linear-gradient(135deg, #1f9fc9, #1484B6, #53abcb)',
      light: 'linear-gradient(135deg, #1f9fc9, #1484B6, #53abcb)',
    },
    button_fg: {
      dark: '#FFFFFF',
      light: '#FFFFFF',
    },
    panel_bg: {
      dark: '#02080F',
      light: '#F9F9F9',
    },
    panel_fg: {
      dark: '#FFFFFF',
      light: '#03111F',
    },
    panel_alt_bg: {
      dark: '#1d2631',
      light: '#E9E9E9',
    },
    panel_alt_fg: {
      dark: '#FFFFFF',
      light: '#03111F',
    },
    panel_border: {
      dark: '#30343a',
      light: '#d2d3d5',
    },
    navitem_bg: {
      dark: '#3C4659',
      light: '#E1E4E8',
    },
    navitem_fg: {
      dark: '#FFFFFF',
      light: '#03111F',
    },
    navicon_fg: {
      dark: '#FFFFFF',
      light: '#03111F',
    },
    badge_bg: {
      dark: '#3C4659',
      light: '#E1E4E8',
    },
    badge_fg: {
      dark: '#FFFFFF',
      light: '#03111F',
    },
    badge_release_bg: {
      dark: '#6fbfc2',
      light: '#44b0b4',
    },
    badge_release_fg: {
      dark: '#0E1520',
      light: '#FFFFFF',
    },
    badge_blog_bg: {
      dark: '#82a7ff',
      light: '#5b83e2',
    },
    badge_blog_fg: {
      dark: '#0E1520',
      light: '#FFFFFF',
    },
    code_bg: {
      dark: '#0E1520',
      light: '#0E1124',
    },
    code_fg: {
      dark: '#e3e7eb',
      light: '#e3e7eb',
    },
    code_single_bg: {
      dark: '#212835',
      light: '#E1E4E8',
    },
    code_single_fg: {
      dark: '#FFFFFF',
      light: '#03111F',
    },
    aurora_1: {
      dark: 'linear-gradient(to bottom, rgba(31,159,201,0) 0%, #1f9fc9 70%, #00ffe0 100%)',
      light: 'linear-gradient(to bottom, rgba(181,235,255,0) 0%, #6fd9f5 70%, #26ffe6 100%)',
    },
    aurora_2: {
      dark: 'linear-gradient(to bottom, rgba(80,80,255,0) 0%, #4444ff 70%, #88e2ff 100%)',
      light: 'linear-gradient(to bottom, rgba(180,180,255,0) 0%, #6a6aff 70%, #aeefff 100%)',
    },
    aurora_3: {
      dark: 'linear-gradient(to bottom, rgba(0,180,120,0) 0%, #00b47d 70%, #50facc 100%)',
      light: 'linear-gradient(to bottom, rgba(120,240,200,0) 0%, #44e3b5 70%, #a2fff1 100%)',
    },
    shade_s: {
      dark: '0 0 6px 3px rgb(11 25 48), 0 0 2px 0 #000000',
      light: '0 0 6px 3px rgb(199 199 199 / 29%), 0 0 2px 0 #D4D4D4',
    },
    stencil_bg: {
      dark: '#212835',
      light: '#E1E4E8',
    },
    stencil_anim: {
      dark: 'linear-gradient(110deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.05) 100%)',
      light: 'linear-gradient(110deg, rgba(186, 186, 186, 0.15) 0%, rgba(186, 186, 186, 0.50) 50%, rgba(186, 186, 186, 0.15) 100%)',
    },
    synth_lines: {
      dark: 'rgba(0,255,255,0.07)',
      light: 'rgba(53, 53, 53, 0.07)',
    },
    /* Algolia */
    '--docsearch-searchbox-background': {
      dark: '#02080F !important',
      light: '#E1E4E8 !important',
    },
    '--docsearch-searchbox-focus-background': {
      dark: '#02080F !important',
      light: '#E1E4E8 !important',
    },
    '--docsearch-muted-color': {
      dark: '#FFFFFF !important',
      light: '#03111F !important',
    },
    '--docsearch-highlight-color': {
      dark: '#FFFFFF !important',
      light: '#03111F !important',
    },
    '--docsearch-hit-active-color': {
      dark: '#03111F !important',
      light: '#FFFFFF !important',
    },
    '--docsearch-searchbox-shadow': {
      dark: 'inset 0 0 0 2px #FFFFFF !important',
      light: 'inset 0 0 0 2px #03111F !important',
    },
    '--docsearch-logo-color': {
      dark: '#FFFFFF !important',
      light: '#03111F !important',
    },
  },
  reset: true,
  definitions: mod => ({
    /* Flex */
    f: () => ({display: 'flex'}),
    fi: () => ({display: 'inline-flex'}),
    fh: () => ({flexDirection: 'row'}),
    fv: () => ({flexDirection: 'column'}),
    fa_l: () => ({alignItems: 'flex-start'}),
    fa_c: () => ({alignItems: 'center'}),
    fa_r: () => ({alignItems: 'flex-end'}),
    fj_l: () => ({justifyContent: 'flex-start'}),
    fj_c: () => ({justifyContent: 'center'}),
    fj_r: () => ({justifyContent: 'flex-end'}),
    fj_sa: () => ({justifyContent: 'space-around'}),
    fj_sb: () => ({justifyContent: 'space-between'}),
    fw: () => ({flexWrap: 'wrap'}),
    fg: () => ({flexGrow: 1}),
    fg0: () => ({flexGrow: 0}),
    fs: () => ({flexShrink: 1}),
    fs0: () => ({flexShrink: 0}),
    /* Radii */
    br_s: () => ({borderRadius: mod.$v.rad_s}),
    br_m: () => ({borderRadius: mod.$v.rad_m}),
    br_l: () => ({borderRadius: mod.$v.rad_l}),
    /* Spacing */
    sp_xs: () => ({padding: mod.$v.space_xs}),
    sp_s: () => ({padding: mod.$v.space_s}),
    sp_m: () => ({padding: mod.$v.space_m}),
    sp_l: () => ({padding: mod.$v.space_l}),
    sp_xl: () => ({padding: mod.$v.space_xl}),
    /* Spacing Top */
    sp_t_xs: () => ({paddingTop: mod.$v.space_xs}),
    sp_t_s: () => ({paddingTop: mod.$v.space_s}),
    sp_t_m: () => ({paddingTop: mod.$v.space_m}),
    sp_t_l: () => ({paddingTop: mod.$v.space_l}),
    sp_t_xl: () => ({paddingTop: mod.$v.space_xl}),
    /* Spacing Right */
    sp_r_xs: () => ({paddingRight: mod.$v.space_xs}),
    sp_r_s: () => ({paddingRight: mod.$v.space_s}),
    sp_r_m: () => ({paddingRight: mod.$v.space_m}),
    sp_r_l: () => ({paddingRight: mod.$v.space_l}),
    sp_r_xl: () => ({paddingRight: mod.$v.space_xl}),
    /* Spacing Bottom */
    sp_b_xs: () => ({paddingBottom: mod.$v.space_xs}),
    sp_b_s: () => ({paddingBottom: mod.$v.space_s}),
    sp_b_m: () => ({paddingBottom: mod.$v.space_m}),
    sp_b_l: () => ({paddingBottom: mod.$v.space_l}),
    sp_b_xl: () => ({paddingBottom: mod.$v.space_xl}),
    /* Spacing Left */
    sp_l_xs: () => ({paddingLeft: mod.$v.space_xs}),
    sp_l_s: () => ({paddingLeft: mod.$v.space_s}),
    sp_l_m: () => ({paddingLeft: mod.$v.space_m}),
    sp_l_l: () => ({paddingLeft: mod.$v.space_l}),
    sp_l_xl: () => ({paddingLeft: mod.$v.space_xl}),
    /* Spacing Horizontal */
    sp_h_xs: () => ({paddingLeft: mod.$v.space_xs, paddingRight: mod.$v.space_xs}),
    sp_h_s: () => ({paddingLeft: mod.$v.space_s, paddingRight: mod.$v.space_s}),
    sp_h_m: () => ({paddingLeft: mod.$v.space_m, paddingRight: mod.$v.space_m}),
    sp_h_l: () => ({paddingLeft: mod.$v.space_l, paddingRight: mod.$v.space_l}),
    sp_h_xl: () => ({paddingLeft: mod.$v.space_xl, paddingRight: mod.$v.space_xl}),
    /* Spacing Vertical */
    sp_v_xs: () => ({paddingTop: mod.$v.space_xs, paddingBottom: mod.$v.space_xs}),
    sp_v_s: () => ({paddingTop: mod.$v.space_s, paddingBottom: mod.$v.space_s}),
    sp_v_m: () => ({paddingTop: mod.$v.space_m, paddingBottom: mod.$v.space_m}),
    sp_v_l: () => ({paddingTop: mod.$v.space_l, paddingBottom: mod.$v.space_l}),
    sp_v_xl: () => ({paddingTop: mod.$v.space_xl, paddingBottom: mod.$v.space_xl}),
    /* Margin */
    sm_xs: () => ({margin: mod.$v.space_xs}),
    sm_s: () => ({margin: mod.$v.space_s}),
    sm_m: () => ({margin: mod.$v.space_m}),
    sm_l: () => ({margin: mod.$v.space_l}),
    sm_xl: () => ({margin: mod.$v.space_xl}),
    /* Margin Top */
    sm_t_xs: () => ({marginTop: mod.$v.space_xs}),
    sm_t_s: () => ({marginTop: mod.$v.space_s}),
    sm_t_m: () => ({marginTop: mod.$v.space_m}),
    sm_t_l: () => ({marginTop: mod.$v.space_l}),
    sm_t_xl: () => ({marginTop: mod.$v.space_xl}),
    sm_t_giga: () => ({marginTop: 'calc(' + mod.$v.space_xl + ' * 2)'}),
    /* Margin Right */
    sm_r_xs: () => ({marginRight: mod.$v.space_xs}),
    sm_r_s: () => ({marginRight: mod.$v.space_s}),
    sm_r_m: () => ({marginRight: mod.$v.space_m}),
    sm_r_l: () => ({marginRight: mod.$v.space_l}),
    sm_r_xl: () => ({marginRight: mod.$v.space_xl}),
    /* Margin Bottom */
    sm_b_xs: () => ({marginBottom: mod.$v.space_xs}),
    sm_b_s: () => ({marginBottom: mod.$v.space_s}),
    sm_b_m: () => ({marginBottom: mod.$v.space_m}),
    sm_b_l: () => ({marginBottom: mod.$v.space_l}),
    sm_b_xl: () => ({marginBottom: mod.$v.space_xl}),
    /* Margin Left */
    sm_l_xs: () => ({marginLeft: mod.$v.space_xs}),
    sm_l_s: () => ({marginLeft: mod.$v.space_s}),
    sm_l_m: () => ({marginLeft: mod.$v.space_m}),
    sm_l_l: () => ({marginLeft: mod.$v.space_l}),
    sm_l_xl: () => ({marginLeft: mod.$v.space_xl}),
    /* Margin Horizontal */
    sm_h_xs: () => ({marginLeft: mod.$v.space_xs, marginRight: mod.$v.space_xs}),
    sm_h_s: () => ({marginLeft: mod.$v.space_s, marginRight: mod.$v.space_s}),
    sm_h_m: () => ({marginLeft: mod.$v.space_m, marginRight: mod.$v.space_m}),
    sm_h_l: () => ({marginLeft: mod.$v.space_l, marginRight: mod.$v.space_l}),
    sm_h_xl: () => ({marginLeft: mod.$v.space_xl, marginRight: mod.$v.space_xl}),
    sm_h_auto: () => ({marginLeft: 'auto', marginRight: 'auto'}),
    /* Margin Vertical */
    sm_v_xs: () => ({marginTop: mod.$v.space_xs, marginBottom: mod.$v.space_xs}),
    sm_v_s: () => ({marginTop: mod.$v.space_s, marginBottom: mod.$v.space_s}),
    sm_v_m: () => ({marginTop: mod.$v.space_m, marginBottom: mod.$v.space_m}),
    sm_v_l: () => ({marginTop: mod.$v.space_l, marginBottom: mod.$v.space_l}),
    sm_v_xl: () => ({marginTop: mod.$v.space_xl, marginBottom: mod.$v.space_xl}),
    sm_v_auto: () => ({marginTop: 'auto', marginBottom: 'auto'}),
    /* Typographic */
    text_giga_title: () => ({
      fontFamily: mod.$v.font_header,
      fontWeight: 'bold',
      [mod.media.desktop]: {
        fontSize: mod.$v.font_s_giga,
      },
      [mod.media.tablet]: {
        fontSize: mod.$v.font_s_title,
      },
      [mod.media.mobile]: {
        fontSize: `calc(${mod.$v.font_s_title} - .3rem)`,
      },
    }),
    text_header: () => ({
      fontFamily: mod.$v.font_header,
      fontWeight: 600,
      fontSize: mod.$v.font_s_header,
      [mod.media.mobile]: {
        fontSize: `calc(${mod.$v.font_s_header} - .3rem)`,
      },
    }),
    text_header_thin: () => ({
      fontFamily: mod.$v.font_header,
      fontWeight: 100,
      fontSize: mod.$v.font_s_header,
      [mod.media.mobile]: {
        fontSize: `calc(${mod.$v.font_s_header} - .3rem)`,
      },
    }),
    text_page_title: () => ({
      fontFamily: mod.$v.font_header,
      fontWeight: 'bold',
      [mod.media.desktop]: {
        fontSize: mod.$v.font_s_title,
      },
      [mod.media.tablet]: {
        fontSize: mod.$v.font_s_subtitle,
      },
      [mod.media.mobile]: {
        fontSize: `calc(${mod.$v.font_s_subtitle} - .2rem)`,
      },
    }),
    text_form_label: () => ({
      fontFamily: mod.$v.font_header,
      fontWeight: 600,
      fontSize: mod.$v.font_s_body,
      [mod.media.mobile]: {
        fontSize: `calc(${mod.$v.font_s_body} - .2rem)`,
      },
    }),
    text_body: () => ({
      fontFamily: mod.$v.font_body,
      fontSize: mod.$v.font_s_body,
      fontWeight: 400,
      [mod.media.mobile]: {
        fontSize: `calc(${mod.$v.font_s_body} - .2rem)`,
      },
    }),
    text_body_thin: () => ({
      fontFamily: mod.$v.font_header,
      fontSize: mod.$v.font_s_body,
      fontWeight: 400,
      [mod.media.mobile]: {
        fontSize: `calc(${mod.$v.font_s_body} - .2rem)`,
      },
    }),
    /* Theme */
    badge_release: () => ({
      background: mod.$t.badge_release_bg,
      color: mod.$t.badge_release_fg,
    }),
    badge_blog: () => ({
      background: mod.$t.badge_blog_bg,
      color: mod.$t.badge_blog_fg,
    }),
    badge_normal: () => ({
      background: mod.$t.badge_bg,
      color: mod.$t.badge_fg,
    }),
    panel: () => ({
      background: mod.$t.panel_bg,
      color: mod.$t.panel_fg,
    }),
    panel_alt: () => ({
      background: mod.$t.panel_alt_bg,
      color: mod.$t.panel_alt_fg,
    }),
    outline: () => ({
      [mod.hover]: {outline: mod.$t.outline},
    }),
    /* Blocks */
    button: () => ({
      appearance: 'none',
      border: 'none',
      fontFamily: mod.$v.font_body,
      fontWeight: 400,
      textDecoration: 'none !important',
      cursor: 'pointer',
      letterSpacing: '.1rem',
      span: {textDecoration: 'none'},
    }),
    button_s: () => ({
      paddingLeft: mod.$v.space_m,
      paddingRight: mod.$v.space_m,
      paddingTop: mod.$v.space_s,
      paddingBottom: mod.$v.space_s,
      fontSize: mod.$v.font_s_body,
      borderRadius: mod.$v.rad_s,
      [mod.media.mobile]: {
        paddingTop: `calc(${mod.$v.space_s} - 0.2rem)`,
        paddingBottom: `calc(${mod.$v.space_s} - 0.2rem)`,
        paddingLeft: mod.$v.space_s,
        paddingRight: mod.$v.space_s,
        fontSize: `calc(${mod.$v.font_s_body} - 0.2rem)`,
      },
    }),
    button_l: () => ({
      paddingLeft: mod.$v.space_l,
      paddingRight: mod.$v.space_l,
      paddingTop: mod.$v.space_m,
      paddingBottom: mod.$v.space_m,
      fontSize: mod.$v.font_s_form,
      borderRadius: mod.$v.rad_m,
      [mod.media.mobile]: {
        paddingTop: mod.$v.space_s,
        paddingBottom: mod.$v.space_s,
        paddingLeft: mod.$v.space_m,
        paddingRight: mod.$v.space_m,
        fontSize: `calc(${mod.$v.font_s_form} - 0.2rem)`,
      },
    }),
    button_t_blue: () => ({
      background: mod.$t.button_bg,
      color: `${mod.$t.button_fg} !important`,
      [mod.hover]: {filter: 'brightness(1.2)'},
    }),
    button_t_grey: () => ({
      background: mod.$t.badge_bg,
      color: mod.$t.badge_fg,
      [mod.hover]: {outline: mod.$t.outline},
    }),
    /* Generic */
    hide: () => ({display: 'none'}),
  }),
});

export const css = _css;
