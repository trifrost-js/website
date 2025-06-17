/* eslint-disable max-len */
import {css} from '../../css';
import {Badge} from '../../components/atoms/Badge';
import {Collapsible} from '../../components/atoms/Collapsible';
import {HighLight} from '../../components/atoms/HighLight';
import {HTMX, NodeJS, TriFrost} from '../../components/atoms/Icons';
import {Layout} from '../../components/layout/Layout';
import {type Router} from '../../types';
import {PreviewHeader} from './components/Preview';
import {LinkList} from './components/LinkList';
import {Back} from '../../components/atoms/Back';
import {Page} from '../../components/molecules/Page';
import {Article} from '../../components/molecules/Article';
import {Button} from '../../components/atoms/Button';
import {Picture} from '../../components/atoms/Picture';
import {Panel} from '../../components/molecules/Panel';
import {ShareThis} from '../../components/molecules/ShareThis';
import {siteMapEntry} from '../../utils/sitemap';

const RGX_EXAMPLESLUG = /^[a-zA-Z0-9_-]{1,128}$/;

export const EXAMPLES = [
    {
        slug: 'trifrost_htmx_todos',
        title: 'TriFrost + HTMX Todo App',
        desc: 'A fully interactive, stateful todo application using TriFrost with HTMX, running on the edge.',
        tags: ['HTMX', 'JSX', 'CloudFlare', 'DurableObject', 'UpTrace'],
        live: 'https://htmx-todos.trifrost.dev/',
        download: 'downloads/1f79d763-2953-40c7-ba30-9d94278d2607.zip',
        preview: () => ({
            logo1: <TriFrost width={60} />,
            logo2: <HTMX width={150} />,
        }),
        body: () => {
            const exampleCid = css.cid();
            return <>
                <PreviewHeader logo1={<TriFrost width={100} />} logo2={<HTMX width={280} />} />
                <h1>TriFrost + HTMX: Todo App</h1>
                <div className={css.use('f', 'sm_t_s', 'sm_b_l', {gap: css.$v.space_s})}>
                    <Button
                        to="https://htmx-todos.trifrost.dev/"
                        label="View Live"
                        size="s"
                        blank={true} />
                    <Button
                        to="/examples/trifrost_htmx_todos/download"
                        label="Download"
                        size="s" />
                </div>
                <p>
					This example showcases a fully interactive, stateful todo application using <strong>TriFrost</strong> and <a href="https://htmx.org/" target="_blank" rel="follow">HTMX</a>.
                </p>
                <h2>How It Works</h2>
                <p>
					This app is entirely server-rendered using TriFrost.
					Routing, HTML generation, and persistent state are all handled within a single <code>index.tsx</code> entrypoint.
					Todos are stored durably using a <code>DurableObjectCache</code> — so no database setup is needed.
					TriFrost's built-in JSX and CSS support means UI fragments are returned directly from route handlers.
                </p>
                <p>
					On the frontend, <a href="https://htmx.org/" target="_blank" rel="follow">HTMX</a> listens for form submissions and button clicks,
					then sends HTTP requests via attributes like <code>hx-post</code> and <code>hx-delete</code>.
					The server responds with fragment HTML — e.g. just the updated todo list — and <a href="https://htmx.org/" target="_blank" rel="follow">HTMX</a> swaps it seamlessly into the page.
                </p>
                <p>
					🧪 Observability is baked in. Every request is traced using OpenTelemetry and
					exported to <a href="https://uptrace.dev/" target="_blank">Uptrace</a>.
					App metadata like <code>name</code> and <code>version</code> are included automatically in every span,
					with no boilerplate required. You can inspect the performance and behavior of each route in full detail.
                </p>
                {/* Project Structure */}
                <Collapsible title="Project Structure" defaultExpanded={true} tag={'h3'} group={exampleCid}>
                    <HighLight language="bash" copyEnabled={false}>{`my-todos/
├─ public/
│  ├─ favicon.ico
│  └─ ...
├─ src/
│  ├─ components/
│  │  ├─ Footer.tsx
│  │  ├─ Layout.tsx
│  │  └─ Todos.tsx
│  ├─ index.tsx
│  └─ css.ts
│  └─ types.ts
├─ wrangler.toml`}</HighLight>
                </Collapsible>
                {/* App Logic */}
                <Collapsible title="App Logic" tag={'h3'} group={exampleCid}>
                    <>
                        <p className={css.use('sm_b_l')}>
							The main app logic lives in <code>src/index.tsx</code>, where TriFrost routes, renders, and manages state for the entire todo application using a Durable Object–backed cache.
                        </p>
                        <HighLight language="tsx">{`// src/index.tsx
import {App, DurableObjectCache, OtelHttpExporter} from '@trifrost/core';
import {Layout} from './components/Layout';
import {TodoForm, TodoList, type Todo} from './components/Todos';
import {type Env} from './types';
import {css} from './css';

export {TriFrostDurableObject} from '@trifrost/core';

const app = await new App<Env>({
	name: "TriFrost_HTMX_Todos",
	version: "1.0.0",
	cache: new DurableObjectCache({store: ({env}) => env.MAIN_DURABLE}),
	tracing: {exporters: ({env}) => [
		new OtelHttpExporter({
			logEndpoint: 'https://otlp.uptrace.dev/v1/logs',
			spanEndpoint: 'https://otlp.uptrace.dev/v1/traces',
			headers: {'uptrace-dsn': env.UPTRACE_DSN},
		}),
	]},
})
	.get('/', async ctx => {
		const todos = await ctx.cache.get<Todo[]>('todos') || [];

		return ctx.html(<Layout>
			<main className={css({
				width: '100%',
				maxWidth: '50rem',
				flexGrow: '1',
			})}>
				<h1 style={css.mix('title')}>📝 TriFrost: HTMX Todos</h1>
				<TodoForm />
				<TodoList todos={todos} />
			</main>
		</Layout>);
	})
	.post('/', async ctx => {
		let todos = await ctx.cache.get<Todo[]>('todos') || [];

		const text = String((ctx.body as {text:string}).text || '');
		if (todos.findIndex(el => el.text === text) < 0) {
			todos.push({id: crypto.randomUUID(), text});
			todos = todos.slice(0, 50);
			await ctx.cache.set('todos', todos);
		}
		return ctx.html(<TodoList todos={todos} />);
	})
	.del('/:id', async ctx => {
		let todos = await ctx.cache.get<Todo[]>('todos') || [];

		todos = todos.filter(t => t.id !== ctx.state.id);

		await ctx.cache.set('todos', todos);
		return ctx.html(<TodoList todos={todos} />);
	})
	.post('/complete', async ctx => {
		const todos = await ctx.cache.get<Todo[]>('todos') || [];

		const {done} = ctx.body as {done?: string|string[]};
		const to_complete = new Set(typeof done === 'string' ? [done] : Array.isArray(done) ? done : []);
		if (to_complete.size) {
			for (const todo of todos) {
				if (to_complete.has(todo.id)) todo.completed = true;
			}
			await ctx.cache.set('todos', todos);
		}
		return ctx.html(<TodoList todos={todos} />);
	})
	.boot();

export default app;`}</HighLight>
                    </>
                </Collapsible>
                {/* Layout */}
                <Collapsible title="Layout" tag={'h3'} group={exampleCid}>
                    <>
                        <p className={css.use('sm_b_l')}>
							The layout component wraps full-page responses, injecting meta tags, global styles, the HTMX script, and optional UI elements like footers or loading indicators.
                        </p>
                        <HighLight language="tsx">{`// src/components/Layout.tsx
import {Style} from '@trifrost/core';
import {css} from '../css';

export function Layout (props:{children:any}) {
	css.root(); /* Root style */

	return (<html lang="en">
		<head>
			<title>TriFrost & HTMX | Todos</title>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="description" content="Manage your todos with TriFrost and HTMX" />
			<script src="https://unpkg.com/htmx.org"></script>
			{/* TriFrost Style Injection */}
			<Style />
		</head>
		<body className={css.use(...)}>
			{props.children}
		</body>
	</html>);
}`}</HighLight>
                    </>
                </Collapsible>
                {/* Components */}
                <Collapsible title="Components" tag={'h3'} group={exampleCid}>
                    <>
                        <p className={css.use('sm_b_l')}>
							All UI elements like the todo form and todo list live in self-contained components under <code>src/components/</code>. Each component renders server-side JSX and uses HTMX attributes to hook into behavior as well as using the TriFrost css instance for styling.
                        </p>
                        <HighLight language="tsx">{`// src/components/Todos.tsx
import { Style } from "@trifrost/core";
import { css } from "../css";

export type Todo = {
	id:string;
	text:string;
	completed?:boolean;
};

export function TodoForm () {
	return (<form
		className={css.use('form', {gap: css.$v.space_m})}
		hx-post="/"
		hx-trigger="submit"
		hx-target="#todo-list"
		hx-swap="outerHTML"
	>
		<input
			type="text"
			name="text"
			required
			placeholder="Add new todo..."
			className={css.use('form_el', {flexGrow: 1})} />
		<button
			type="submit"
			className={css.use('button', 'button_l')}>Add</button>
	</form>);
}

export function TodoList (props:{children?:any; todos:Todo[]}) {
	const todos = props.todos || [];
	const hasTodos = todos.length > 0;

	return (<section id="todo-list">
		{!hasTodos && <p className={css({
			textAlign: 'center',
			padding: css.$v.space_l,
			backgroundColor: css.$t.empty_bg,
			borderRadius: css.$v.radius,
			color: css.$t.empty_fg,
		})}><em>No todos yet</em></p>}
		{hasTodos && (<form
			className={css.use('f', 'fv', 'form', {alignItems: 'flex-start'})}
			hx-post="/complete"
			hx-trigger="submit"
			hx-target="#todo-list"
			hx-swap="outerHTML"
		>
			<ul style={{width: '100%'}}>
				{todos.map(t => <li
					key={t.id}
					id={\`todo-\${t.id}\`}
					className={css.use('f', 'fa_c', {
						gap: css.$v.space_s,
						width: '100%',
						maxWidth: '100%',
					})}>
					<input
						type="checkbox"
						name="done"
						value={t.id}
						disabled={t.completed}
						className={css.use('form_icon')} />
					<span className={css.use({
						flexGrow: 1,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						textDecoration: t.completed ? 'line-through' : 'none'
					})}>{t.text}</span>
					<button
						type="button"
						className={css.use('button', 'button_s')}
						hx-delete={\`/\${t.id}\`}
						hx-target="#todo-list"
						hx-swap="outerHTML"
					>Remove</button>
				</li>)}
			</ul>
			<button
				type="submit"
				className={css.use('button', 'button_l', {marginTop: css.$v.space_m})}
			>Complete</button>
		</form>)}
		<Style />
	</section>);
}`}</HighLight>
                    </>
                </Collapsible>
                {/* Styling */}
                <Collapsible title="Styling" tag={'h3'} group={exampleCid}>
                    <>
                        <p className={css.use('sm_b_l')}>
							Instead of a prebuilt css file which gets included everywhere (and of which probably 10% is used per page)
							the css module automatically collects what is used on the page's components and injects it as inline styling.
                        </p>
                        <p className={css.use('sm_b_l')}>
							It does just a bit more than that, in this particular case we're also injecting a <strong>css reset</strong> as well as defining <strong>reusable definitions</strong> and <strong>theme/global variables.</strong>
                        </p>
                        <p className={css.use('sm_b_l')}>
							An important note on those <strong>definitions</strong> is that they are not included in the css if not used. They form your backbone to centralize reusable pieces of styling without bloating the page if not used.
                        </p>
                        <HighLight language="typescript">{`// src/css.ts
import {createCss} from "@trifrost/core";

export const css = createCss({
	reset: true,
	var: {
		space_s: '.5rem',
		space_m: '1rem',
		space_l: '2rem',
		radius: '.4rem',
	},
	theme: {
		body_bg: '#f6f8fa',
		body_fg: '#333333',
		empty_bg: '#ededed',
		empty_fg: '#666',
	},
	definitions: mod => ({
		f: {display: 'flex'},
		fv: {flexDirection: 'column'},
		fh: {flexDirection: 'row'},
		fa_c: {alignItems: 'center'},
		title: {
			fontSize: '1.8rem',
			fontWeight: 600,
		},
		form: {
			display: 'flex',
			margin: \`\${mod.$v.space_m} 0\`,
		},
		button: {
			appearance: 'none',
			backgroundColor: 'black',
			color: 'white',
			border: 'none',
			cursor: 'pointer',
			textAlign: 'center',
			flexShrink: 0,
			borderRadius: mod.$v.radius,
			fontWeight: 600,
			[mod.hover]: {
				backgroundColor: '#333',
			},
		},
		button_l: {
			lineHeight: '3rem',
			padding: \`0 \${mod.$v.space_m}\`,
			fontSize: '1rem',
		},
		button_s: {
			lineHeight: '2rem',
			padding: \`0 \${mod.$v.space_s}\`,
			fontSize: '.8rem',
		},
		form_el: {
			fontSize: '1rem',
			height: '3rem',
			padding: \`0 \${mod.$v.space_m}\`,
			borderRadius: mod.$v.radius,
		},
		form_icon: {
			fontSize: '1rem',
			height: '2rem',
			width: '2rem',
			display: 'inline-block',
			flexShrink: '0',
		},
	})
});`}</HighLight>
                    </>
                </Collapsible>
                {/* Environment */}
                <Collapsible title="Environment" tag={'h3'} group={exampleCid}>
                    <>
                        <p className={css.use('sm_b_l')}>
							All environment bindings expected by the app — such as the durable object, asset fetcher, and optional Uptrace DSN — are defined in <code>src/types.ts</code> for type safety and clarity.
                        </p>
                        <p className={css.use('sm_b_l')}>
							This exported <code>Env</code> type is also used as a generic for the App, this generic ensures each of the routes (as well as the app configuration itself) knows the environment.
                        </p>
                        <p className={css.use('sm_b_l')}>
                            <strong>Pro-tip</strong>: You can access the environment through <code>ctx.env</code> in any route handler.
                        </p>
                        <HighLight language="ts">{`// src/types.ts
export type Env = {
	ASSETS: Fetcher;
	MAIN_DURABLE: DurableObjectNamespace;
	UPTRACE_DSN: string; /* DSN from uptrace */
};`}</HighLight>
                    </>
                </Collapsible>
                {/* Cloudflare */}
                <Collapsible title="Cloudflare" tag={'h3'} group={exampleCid}>
                    <>
                        <p className={css.use('sm_b_l')}>
							The <code>wrangler.toml</code> config defines how your app runs on Cloudflare — including bindings for assets and durable objects, compatibility flags, and deployment metadata.
                        </p>
                        <HighLight language="toml">{`// wrangler.toml
name = "trifrost_htmx_todos"
main = "src/index.tsx"
compatibility_date = "2025-05-08"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./public/"
binding = "ASSETS"

[[durable_objects.bindings]]
name = "MAIN_DURABLE" # This is the name of our durable object (see src/types.ts)
class_name = "TriFrostDurableObject" # This is the class exported from src/index.ts

[[migrations]]
tag = "v1"
new_sqlite_classes = ["TriFrostDurableObject"] # This is a requirement by Cloudflare
`}</HighLight>
                    </>
                </Collapsible>
                <h2>Screenshots</h2>
                <div className={css.use('f', 'fh', 'fj_sb', 'fa_l', 'sp_t_m', 'sm_b_xl', {
                    [css.media.desktop]: css.mix('fh', {gap: css.$v.space_l}),
                    [css.media.tablet]: css.mix('fv', {gap: css.$v.space_l}),
                })}>
                    <Picture url="/media/htmx_todos_view.png" title="Homepage of the example" />
                    <Picture url="/media/htmx_todos_tracing.png" title="Example Uptrace Otel Logs" />
                </div>
                <h2>Resources</h2>
                <LinkList list={[
                    {label: 'HTMX', to: 'https://htmx.org/', desc: 'Add AJAX, WebSockets, and more to HTML using attributes.'},
                    {label: 'CloudFlare Durable Objects', to: 'https://developers.cloudflare.com/workers/runtime-apis/durable-objects/', desc: 'Low-latency stateful storage at the edge.'},
                    {label: 'UpTrace', to: 'https://uptrace.dev/', desc: 'OTel-powered observability backend used in this example.'},
                    {label: 'HTML Forms (MDN)', to: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form', desc: 'Useful refresher on native forms.'},
                ]} />
            </>;
        },
    }, {
        slug: 'trifrost_node_mini_site',
        title: 'Mini Site (Node + Podman)',
        desc: 'A container-ready, multi-page TriFrost example with HTMX, theming, and observability.',
        tags: ['Node.js', 'Podman', 'HTMX', 'JSX', 'SigNoz'],
        live: 'https://website-node-container.trifrost.dev/',
        download: 'downloads/599bce80-57ac-4899-ba30-c29cfff132c8.zip',
        preview: () => ({
            logo1: <TriFrost width={60} />,
            logo2: <NodeJS width={120} />,
        }),
        body: () => {
            const exampleCid = css.cid();
            return <>
                <PreviewHeader logo1={<TriFrost width={100} />} logo2={<NodeJS width={200} />} />
                <h1>TriFrost Mini Site (Node + Podman)</h1>
                <div className={css.use('f', 'sm_t_s', 'sm_b_l', {gap: css.$v.space_s})}>
                    <Button
                        to="https://website-node-container.trifrost.dev/"
                        label="View Live"
                        size="s"
                        blank={true} />
                    <Button
                        to="/examples/trifrost_node_mini_site/download"
                        label="Download"
                        size="s" />
                </div>
                <p>
					This example showcases a multi-page server-rendered <strong>TriFrost</strong> application running on <a href="https://nodejs.org/" target="_blank" rel="follow">Node.js</a>, containerized with <a href="https://podman.io/" target="_blank" rel="follow">Podman</a>.
					It demonstrates runtime-agnostic rendering, <a href="https://htmx.org/" target="_blank" rel="follow">HTMX</a>-driven interactivity (for comments), and optional observability with <a href="https://signoz.io/" target="_blank" rel="follow">SigNoz</a>.
                </p>
                <h2>How It Works</h2>
                <p>
					The app uses TriFrost’s flexible routing and JSX rendering to deliver a home page, about page, and a blog page with dynamic comments.
					HTMX handles comment posting and deletion via fragment swaps, making it lightweight and responsive without a heavy frontend framework.
                </p>
                <p>
					You can run it standalone with Node.js or containerize it with Podman and Podman Compose — a perfect showcase of TriFrost’s runtime flexibility (just compare it with our <a href="/examples/trifrost_htmx_todos" target="_blank" rel="follow">Cloudflare Example</a> and you'll not there's very little that needs to change).
                </p>
                <p>
					This example is set up to optionally send OpenTelemetry traces to <a href="https://signoz.io/" target="_blank" rel="follow">SigNoz</a>, giving you visibility into route performance, request flows, and system health.
                </p>
                <p>
					To enable it, provide your <code>SIGNOZ_API_TOKEN</code> in a <code>.env</code> file and uncomment the <code>OtelHttpExporter</code> block in <code>index.ts</code> and you're good to go.
                </p>
                <Collapsible title="Project Structure" tag={'h3'} group={exampleCid}>
                    <HighLight language="bash" copyEnabled={false}>{`trifrost-mini-site/
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ css.ts
│  ├─ index.ts
│  └─ types.ts
├─ Containerfile
├─ compose.yml
├─ package.json
├─ tsconfig.json
└─ .env`}</HighLight>
                </Collapsible>
                <Collapsible title="App Logic" tag={'h3'} group={exampleCid}>
                    <>
                        <p>
							The app is initialized in <code>index.ts</code> using TriFrost’s <code>App</code> class. Middleware like security and CORS are added, then routing groups (<code>homeRouter</code>, <code>aboutRouter</code>, <code>blogRouter</code>) are wired in. Each page uses server-rendered JSX; the blog section includes dynamic comment handling with HTMX.
                        </p>
                        <HighLight language="ts">{`// src/index.ts
import {App, Security, Cors, OtelHttpExporter} from '@trifrost/core';
import {type Env} from './types';
import {homeRouter} from './pages/home';
import {aboutRouter} from './pages/about';
import {blogRouter} from './pages/blog';
import {notFoundHandler} from './pages/notfound';

new App<Env>({
    env: process.env as Env,
    name: 'TriFrost_Website',
    version: '1.0.0',
})
    .use(Security())
    .use(Cors())
    .group('/', homeRouter)
    .group('/about', aboutRouter)
    .group('/blog', blogRouter)
    .onNotFound(notFoundHandler)
    .boot({port: Number(process.env.PORT || 3000)});`}</HighLight>
                    </>
                </Collapsible>
                <Collapsible title="Page Breakdown: Home, About, Blog" tag={'h3'} group={exampleCid}>
                    <>
                        <p>
							Each of these pages is set up as its own router group (<code>homeRouter</code>, <code>aboutRouter</code>, <code>blogRouter</code>) and connected in the main <code>index.ts</code>. They use a shared layout wrapper for consistency, pulling in navigation, headers, and theme-aware styles.
                        </p>
                        <ul className={css.use('sm_t_l')}>
                            <li><strong>Home Page (<code>/</code>)</strong> → Provides a welcoming introduction to TriFrost, explaining its mission as a runtime-agnostic, fast server framework. Uses a simple JSX layout with hero text and buttons.</li>
                            <li><strong>About Page (<code>/about</code>)</strong> → Gives background on what makes TriFrost special — its composable middleware, multi-runtime compatibility (Node, Bun, Workers), and built-in observability. This page uses bullet lists and styled sections.</li>
                            <li><strong>Blog Page (<code>/blog</code>)</strong> → The most interactive section, listing blog posts and allowing users to submit and delete comments live via HTMX. This showcases TriFrost’s ability to handle fragment rendering and dynamic state updates without a heavy frontend framework.</li>
                        </ul>
                    </>
                </Collapsible>
                <Collapsible title="CSS/Theming" tag={'h3'} group={exampleCid}>
                    <>
                        <p>
							Styling is centralized in <code>css.ts</code> using TriFrost’s <code>createCss</code> system. It defines dark/light themes, font families, spacing scales, and responsive helpers, enabling consistent component styling and easy overrides.
                        </p>
                        <p className={css.use('sm_t_l')}>
							Once a var/theme variable is defined they are respectively available at <code>css.$v.[variable name]</code> and <code>css.$t.[variable name]</code> anywhere in your app.
                        </p>
                        <HighLight language="ts">{`// src/css.ts
export const css = createCss({
	reset: true,
	var: {
		font_header: "'Fira Code', monospace",
		font_body: "'Roboto', Sans-serif",
		radius: '0.5rem',
		space_s: '0.5rem',
		space_m: '1rem',
		space_l: '2rem',
		space_xl: '4rem',
    },
    theme: {
        bg: {
            light: '#f9fafb',
            dark: '#1f2937',
        },
        fg: {
            light: '#1f2937',
            dark: '#f9fafb',
        },
        nav_bg: {
            dark: '#020810',
            light: '#c7c7c7',
        },
        nav_fg: {
            dark: '#ffffff',
            light: '#000000',
        },
        ...
    },
    definitions: (mod) => ({
        f: {display: 'flex'},
        fh: {flexDirection: 'row'},
        fv: {flexDirection: 'column'},
        fa_c: {alignItems: 'center'},
        fj_c: {justifyContent: 'center'},
        sm_v_l: {marginBottom: mod.$v.space_l, marginTop: mod.$v.space_l},
        text_header: {
            fontFamily: mod.$v.font_header,
            fontWeight: 'bold',
            [mod.media.desktop]: {
                fontSize: '2.2rem',
            },
            [mod.media.tablet]: {
                fontSize: '2rem',
            },
        },
        text_title: {
            fontFamily: mod.$v.font_header,
            fontWeight: 'bold',
            fontSize: '2rem',
        },
        ...
    }),
});`}</HighLight>
                        <p className={css.use('sm_t_l')}>
                            <strong>PS:</strong> If you want to check out the different light/dark modes, open up dev tools in Chrome (assumption, sorry ^^):
                        </p>
                        <HighLight language='bash'>{`// In the Chrome DevTools Console:
document.documentElement.setAttribute('data-theme', 'dark'); // Switch to dark mode
document.documentElement.setAttribute('data-theme', 'light'); // Switch to light mode`}</HighLight>
                    </>
                </Collapsible>
                <Collapsible title="Containerization" tag={'h3'} group={exampleCid}>
                    <>
                        <p>
							The <code>Containerfile</code> uses a multi-stage build: first compiling the TypeScript project, then packaging only production files.
                        </p>
                        <p className={css.use('sm_t_l')}>
							This is also the file that builds your source into a container ready for deployment.
                        </p>
                        <HighLight language="dockerfile">{`# Containerfile

# =============================================================================
# Development Stage
# =============================================================================

    FROM node:22-alpine AS development

    WORKDIR /app

    COPY package*.json ./
    RUN npm install

    # Copy source
    COPY . .

    # Start dev server
    CMD ["npm", "run", "dev"]

# =============================================================================
# Build Stage
# =============================================================================

    FROM development as builder
    RUN npm run build

# =============================================================================
# Production Stage
# =============================================================================

    FROM node:22-alpine AS production

    # Set NODE_ENV to production
    ENV NODE_ENV=production

    WORKDIR /app
    COPY package*.json ./
    COPY --from=builder /app/dist ./dist

    # Install dependencies and prune
    RUN npm install --omit=dev && npm prune

    # Change to 1000 user
    RUN chown 1000:1000 /app

    # Switch user
    USER 1000:1000

    # Start prod server
    CMD ["node", "./dist/index.js"]`}</HighLight>
                        <p className={css.use('sm_t_l')}>
                            <code>compose.yml</code> defines the service, port mappings, and volume mounts for <strong>local</strong> orchestration.
                        </p>
                        <HighLight language="yaml">{`# compose.yml
version: '3'

services:
  website:
    build:
      context: .
      target: development
    tty: true
    environment:
      - PORT=3000
    ports:
      - "3000:3000"
    volumes:
      - './:/app:z'
      - 'node_modules:/app/node_modules:z'
volumes:
  node_modules:`}</HighLight>
                    </>
                </Collapsible>
                <Collapsible title="Environment" tag={'h3'} group={exampleCid}>
                    <>
                        <p>
							We define an <code>Env</code> type in <code>types.ts</code> to describe environment bindings like <code>PORT</code> and optional observability tokens like <code>SIGNOZ_API_TOKEN</code>. This lets the app pull runtime config from <code>process.env</code> without hardcoding values, making it deployment-flexible.
                        </p>
                        <p className={css.use('sm_t_l')}>
							We also define our own app-specific <code>Context</code> and <code>Router</code> types here. These will automatically be aware of our Environment simply by passing it as a generic.
                        </p>
                        <p className={css.use('sm_t_l')}>
							Important to note, when working with <strong>Podman</strong>, you will need to also provide the Environment bindings in <code>compose.yml</code> for local development.
                        </p>
                        <HighLight language="ts">{`// src/types.ts
import {type TriFrostRouter, type TriFrostContext} from '@trifrost/core';

export type Env = {
    PORT: string;
    SIGNOZ_API_TOKEN: string;
};

export type Context<State extends Record<string, unknown> = {}> = TriFrostContext<Env, State>;

export type Router<State extends Record<string, unknown> = {}> = TriFrostRouter<Env, State>;`}</HighLight>
                    </>
                </Collapsible>
                <h2>Screenshots</h2>
                <div className={css.use('f', 'fh', 'fj_sb', 'fa_l', 'sp_t_m', 'sm_b_xl', {
                    [css.media.desktop]: css.mix('fh', {gap: css.$v.space_l}),
                    [css.media.tablet]: css.mix('fv', {gap: css.$v.space_l}),
                })}>
                    <Picture url="/media/trifrost_node_mini_site_dark.png" title="Dark mode version of the homepage" />
                    <Picture url="/media/trifrost_node_mini_site_light.png" title="Light mode version of the homepage" />
                </div>
                <h2>Resources</h2>
                <LinkList list={[
                    {label: 'TriFrost', to: 'https://trifrost.dev', desc: 'The runtime-agnostic server framework behind this example.'},
                    {label: 'HTMX', to: 'https://htmx.org/', desc: 'Add AJAX, WebSockets, and more to HTML using attributes.'},
                    {label: 'Podman', to: 'https://podman.io/', desc: 'Open source container engine for rootless containers.'},
                    {label: 'SigNoz', to: 'https://signoz.io/', desc: 'OpenTelemetry-compatible observability backend.'},
                ]} />
            </>;
        },
    },
];

export async function exampleSitemap () {
    const entries:string[] = [siteMapEntry('/examples')];
    for (let i = 0; i < EXAMPLES.length; i++) {
        const example = EXAMPLES[i];
        entries.push(siteMapEntry(`/examples/${example.slug}`));
    }
    return entries;
}

export async function examplesRouter <State extends Record<string, unknown>> (r:Router<State>) {
    r
        .get('', async ctx => ctx.html(<Layout title="TriFrost Examples" description="A running log of what’s new in TriFrost" section="examples">
            <Page width={'130rem'}>
                <div className={css.use('sp_v_xl', 'sm_h_s', {textAlign: 'center'})}>
                    <h1 className={css.use('text_page_title', 'sm_b_m')}>TriFrost Examples</h1>
                    <p className={css.use('text_header_thin', {lineHeight: 1.4, maxWidth: '65rem'})}>
							A growing set of real-world examples built with TriFrost. Showcasing patterns, integrations & ideas.
                    </p>
                </div>
                <div className={css.use('f', {
                    width: '100%',
                    [css.media.desktop]: css.mix('fh', 'fw', 'fg', {gap: css.$v.space_l}),
                    [css.media.tablet]: css.mix('fv', {gap: css.$v.space_s}),
                })}>
                    {EXAMPLES.map((el, idx) => <Panel
                        key={idx}
                        style={css.mix('f', 'fv', {
                            [css.media.desktop]: {width: 'calc(50% - ' + css.$v.space_l + ')'},
                            [css.media.tablet]: {width: '100%'},
                        })}
                        to={`/examples/${el.slug}`}
                        alt={el.title}
                    >
                        <PreviewHeader {...el.preview()} />
                        <div className={css.use('f', 'fv', 'fg', 'sm_t_l', {
                            gap:css.$v.space_m,
                            [css.media.mobile]: {gap: css.$v.space_s},
                        })}>
                            <h3 className={css.use('text_header')}>{el.title}</h3>
                            <p className={css.use('text_body', {lineHeight: 1.4})}>{el.desc}</p>
                            <div className={css.use('f', 'fh', 'fw', 'fa_c', 'sm_t_xs', 'fj_l', {gap: css.$v.space_xs})}>
                                {el.tags.map(tag => <Badge>{tag}</Badge>)}
                            </div>
                        </div>
                    </Panel>)}
                </div>
            </Page>
        </Layout>))
        .get('/:slugId', async ctx => {
            if (!RGX_EXAMPLESLUG.test(ctx.state.slugId)) return ctx.redirect('/examples');

            const example = EXAMPLES.find(el => el.slug === ctx.state.slugId);
            if (!example) return ctx.setStatus(404);

            return ctx.html(<Layout title={example.title} description={example.desc} section="examples">
                <Page>
                    <Article style={{
                        [css.media.desktop]: css.mix('sm_b_xl'),
                        [css.media.tablet]: css.mix('sm_t_l'),
                    }}>
                        <Back to="/examples" label="Examples" />
                        {example.body()}
                    </Article>
                    <ShareThis url={ctx.path} title={example.title}/>
                </Page>
            </Layout>);
        })
        .get('/:slugId/download', async ctx => {
            if (!RGX_EXAMPLESLUG.test(ctx.state.slugId)) return ctx.redirect('/examples');

            const example = EXAMPLES.find(el => el.slug === ctx.state.slugId);
            if (!example) return ctx.status(404);

            return ctx.file(example.download, {download: `${example.title}.zip`});
        });
}
