import {css} from '../../css';
import {Script, script} from '../../script';

export function DocSearch() {
  css.root({
    ' .DocSearch-Button': {
      marginLeft: '0 !important',
    },
    ' .DocSearch-Button-Placeholder': {
      fontSize: css.$v.font_s_small + ' !important',
      display: 'block !important',
    },
    ' .DocSearch-Label': {
      fontSize: `calc(${css.$v.font_s_small} - .2rem) !important`,
    },
    ' .DocSearch-Logo': {
      [` ${css.is('path', 'rect')}`]: {
        fill: css.$t['--docsearch-logo-color'] + ' !important',
      },
    },
  });

  return (
    <>
      <link defer async rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" />
      <Script
        data={{
          appId: script.env('ALGOLIA_DOCSEARCH_APPID'),
          apiKey: script.env('ALGOLIA_DOCSEARCH_APIKEY'),
        }}
      >
        {(_, data) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@docsearch/js@3';
          script.defer = true;
          script.async = true;
          script.onload = () => {
            /* @ts-expect-error DocSearch should be available at this point */
            docsearch({
              appId: data.appId,
              apiKey: data.apiKey,
              indexName: 'trifrost',
              insights: true,
              container: '#docsearch',
              debug: false,
            });
          };
          document.documentElement.appendChild(script);
        }}
      </Script>
    </>
  );
}
