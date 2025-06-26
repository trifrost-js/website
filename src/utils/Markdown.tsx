import {join} from '@valkyriestudios/utils/array';
import {HighLight} from '../components/atoms/HighLight';
import {Image} from '../components/atoms/Image';
import {Video} from '../components/atoms/Video';
import {Runtime, RuntimeBlock, type RuntimeName} from '../components/atoms/Runtime';
import {Link} from '../components/atoms/Link';

export type MarkdownHeader = {
  id: string;
  title: string;
  level: number;
};

type BreakNode = {type: 'br'};
type SeparatorNode = {type: 'separator'};
type TextNode = {type: 'text'; content: string};
type ParagraphNode = {type: 'paragraph'; children: MarkdownNode[]};
type HeadingNode = {type: 'heading'; level: number; children: MarkdownNode[]};
type ListNode = {type: 'list'; ordered: boolean; children: ListItemNode[]};
type ListItemNode = {type: 'listItem'; children: MarkdownNode[]};
type BlockQuoteNode = {type: 'blockquote'; children: MarkdownNode[]};
type CodeBlockNode = {type: 'codeBlock'; language: string; code: string};
type InlineCodeNode = {type: 'inlineCode'; content: string};
type StrongNode = {type: 'strong'; children: MarkdownNode[]};
type EmphasisNode = {type: 'emphasis'; children: MarkdownNode[]};
type LinkNode = {type: 'link'; href: string; children: MarkdownNode[]};
type ImageNode = {type: 'image'; src: string; alt?: string};
type VideoNode = {type: 'video'; src: string; alt?: string};
type HorizontalRuleNode = {type: 'horizontalRule'};
type RuntimeWrapperNode = {type: 'runtimeWrapper'; runtimes: RuntimeName[]; children: RuntimeBlockNode[]};
type RuntimeBlockNode = {type: 'runtimeBlock'; runtime: RuntimeName; children: MarkdownNode[]};

export type MarkdownNode =
  | BreakNode
  | SeparatorNode
  | TextNode
  | ParagraphNode
  | HeadingNode
  | ListNode
  | ListItemNode
  | BlockQuoteNode
  | CodeBlockNode
  | InlineCodeNode
  | StrongNode
  | EmphasisNode
  | LinkNode
  | ImageNode
  | VideoNode
  | HorizontalRuleNode
  | RuntimeWrapperNode
  | RuntimeBlockNode;

const RGX_INLINE_ALL = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)/g;
const RGX_NEWLINE = /\r?\n/;
const RGX_HEADER = /^#{1,6} /;
const RGX_HEADER_LEVEL = /^#+/;
const RGX_LIST = /^- /;
const RGX_BLOCKQUOTE = /^> /;
const RGX_HORIZONTAL_RULE = /^---/g;

export class Markdown {
  static parseBreaks(text: string): MarkdownNode[] {
    const parts = text.split('\\n');
    if (parts.length === 1) {
      return [{type: 'text', content: text}];
    } else {
      const nodes: MarkdownNode[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (i !== 0) nodes.push({type: 'br'});
        nodes.push({type: 'text', content: parts[i]});
      }
      return nodes;
    }
  }

  static parseInline(text: string): MarkdownNode[] {
    const nodes: MarkdownNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = RGX_INLINE_ALL.exec(text)) !== null) {
      /* Add text before match */
      if (match.index > lastIndex) {
        nodes.push(...Markdown.parseBreaks(text.slice(lastIndex, match.index)));
      }

      if (match[1]) {
        /* **strong** */
        nodes.push({type: 'strong', children: [{type: 'text', content: match[2]}]});
      } else if (match[3]) {
        /* *emphasis* */
        nodes.push({type: 'emphasis', children: [{type: 'text', content: match[4]}]});
      } else if (match[5]) {
        /* `inlineCode` */
        nodes.push({type: 'inlineCode', content: match[6]});
      } else if (match[7]) {
        /* ![alt](src) */
        if (match[8].endsWith('mp4')) {
          nodes.push({type: 'video', alt: match[7], src: match[8]});
        } else {
          nodes.push({type: 'image', alt: match[7], src: match[8]});
        }
      } else if (match[9]) {
        /* [text](href) */
        nodes.push({type: 'link', href: match[10], children: [{type: 'text', content: match[9]}]});
      }

      lastIndex = RGX_INLINE_ALL.lastIndex;
    }

    /* Add any remaining text */
    if (lastIndex < text.length) {
      nodes.push(...Markdown.parseBreaks(text.slice(lastIndex)));
    }

    return nodes;
  }

  static toTree(markdown: string): MarkdownNode[] {
    const lines = markdown.trim().split(RGX_NEWLINE);
    const tree: MarkdownNode[] = [];
    let inList = false;

    let inCode = false;
    let codeLang = '';
    let codeBuffer: string[] = [];

    /* Runtime component */
    let runtimeBlocks: RuntimeBlockNode[] = [];
    let inRuntimeBlock = false;
    let runtimeNames: RuntimeName[] = [];
    let runtimeName: RuntimeName | null = null;
    let runtimeBuffer: string[] = [];

    const pushRuntimeBlock = () => {
      if (runtimeBuffer.length && runtimeName) {
        const childTree = Markdown.toTree(runtimeBuffer.join('\n'));
        runtimeBlocks.push({
          type: 'runtimeBlock',
          runtime: runtimeName,
          children: childTree,
        });
        runtimeNames.push(runtimeName);
        runtimeName = null;
        runtimeBuffer = [];
      }
    };

    /* Block quote */
    let inBlockquote = false;
    let blockquoteBuffer: string[] = [];

    const pushBlockquote = () => {
      if (blockquoteBuffer.length) {
        const childTree = Markdown.toTree(blockquoteBuffer.map(line => line.replace(/^> /, '')).join('\n'));
        tree.push({
          type: 'blockquote',
          children: childTree,
        });
        blockquoteBuffer = [];
      }
    };

    mainLoop: for (const line of lines) {
      const line_trimmed = line.trim();

      switch (line_trimmed) {
        case '-----':
          tree.push({
            type: 'separator',
          });
          continue mainLoop;
        case '<RUNTIME>':
          continue mainLoop;
        case '</RUNTIME>':
          pushRuntimeBlock();
          tree.push({
            type: 'runtimeWrapper',
            children: runtimeBlocks,
            runtimes: runtimeNames,
          });
          inRuntimeBlock = false;
          runtimeNames = [];
          runtimeBlocks = [];
          continue mainLoop;
        case '<BUN>':
          pushRuntimeBlock();
          inRuntimeBlock = true;
          runtimeName = 'bun';
          continue mainLoop;
        case '</BUN>':
          pushRuntimeBlock();
          inRuntimeBlock = false;
          continue mainLoop;
        case '<NODE>':
          pushRuntimeBlock();
          inRuntimeBlock = true;
          runtimeName = 'node';
          continue mainLoop;
        case '</NODE>':
          pushRuntimeBlock();
          inRuntimeBlock = false;
          continue mainLoop;
        case '<WORKERD>':
          pushRuntimeBlock();
          inRuntimeBlock = true;
          runtimeName = 'workerd';
          continue mainLoop;
        case '</WORKERD>':
          pushRuntimeBlock();
          inRuntimeBlock = false;
          continue mainLoop;
        default:
          break;
      }

      if (inRuntimeBlock) {
        runtimeBuffer.push(line);
        continue;
      }

      /* Code */
      if (line.startsWith('```')) {
        if (inCode) {
          tree.push({
            type: 'codeBlock',
            language: codeLang,
            code: codeBuffer.join('\n'),
          });
          inCode = false;
          codeLang = '';
          codeBuffer = [];
        } else {
          if (inList) inList = false; // exit list before starting code block
          inCode = true;
          codeLang = line.slice(3).trim() || 'plaintext';
        }
        continue;
      }

      if (inCode) {
        codeBuffer.push(line);
        continue;
      }

      /* Header */
      if (RGX_HEADER.test(line)) {
        if (inList) inList = false;
        const level = line.match(RGX_HEADER_LEVEL)![0].length;
        const content = line.slice(level).trim();
        tree.push({
          type: 'heading',
          level,
          children: [{type: 'text', content}],
        });
        continue;
      }

      /* List */
      if (RGX_LIST.test(line)) {
        if (!inList) {
          inList = true;
          tree.push({type: 'list', ordered: false, children: []});
        }
        const list = tree[tree.length - 1];
        if (list && list.type === 'list') {
          list.children.push({
            type: 'listItem',
            children: Markdown.parseInline(line.slice(2).trim()),
          });
        }
        continue;
      }

      if (inList && line_trimmed === '') {
        inList = false;
        continue;
      }

      /* Block Quote */
      if (RGX_BLOCKQUOTE.test(line)) {
        if (!inBlockquote) inBlockquote = true;
        blockquoteBuffer.push(line);
        continue;
      }

      if (inBlockquote && line_trimmed === '') {
        inBlockquote = false;
        pushBlockquote();
        continue;
      }

      /* HR */
      if (RGX_HORIZONTAL_RULE.test(line)) {
        if (inList) inList = false;
        tree.push({type: 'horizontalRule'});
        continue;
      }

      /* Paragraph */
      if (line_trimmed) {
        if (inList) inList = false;
        tree.push({
          type: 'paragraph',
          children: Markdown.parseInline(line_trimmed),
        });
      }
    }

    if (inCode) {
      tree.push({
        type: 'codeBlock',
        language: codeLang,
        code: codeBuffer.join('\n'),
      });
      inCode = false;
    }

    if (inBlockquote) {
      pushBlockquote();
      inBlockquote = false;
    }

    return tree;
  }

  static extractTextFromNodes(nodes: MarkdownNode[]): string {
    return join(
      nodes.flatMap(node => {
        switch (node.type) {
          case 'text':
          case 'inlineCode':
            return node.content;
          case 'link':
          case 'strong':
          case 'emphasis':
            return Markdown.extractTextFromNodes(node.children);
          default:
            return '';
        }
      }),
      {innertrim: true, valtrim: true, trim: true, delim: ' '},
    );
  }

  static extractHeadersFromNodes(nodes: MarkdownNode[]): MarkdownHeader[] {
    const headers: MarkdownHeader[] = [];

    const walk = (cursor: MarkdownNode[]) => {
      for (const node of cursor) {
        if (node.type === 'heading') {
          const title = Markdown.extractTextFromNodes(node.children);
          const id = Markdown.slugify(title);
          headers.push({
            id,
            title,
            level: node.level,
          });
        } else if ('children' in node && Array.isArray(node.children)) {
          walk(node.children);
        }
      }
    };

    walk(nodes);

    return headers;
  }

  static getIntroFromTree(tree: MarkdownNode[]): string | null {
    if (tree.length === 0) return null;

    const first = tree[0];
    if (first.type !== 'paragraph') return null;

    return Markdown.extractTextFromNodes(first.children) || null;
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  static renderTree(tree: MarkdownNode[]) {
    return tree.map((node, i) => {
      switch (node.type) {
        case 'heading': {
          const H = `h${node.level}`;
          const text = Markdown.extractTextFromNodes(node.children);
          return (
            <H id={Markdown.slugify(text)} key={i}>
              {Markdown.renderTree(node.children)}
            </H>
          );
        }
        case 'paragraph':
          return <p key={i}>{Markdown.renderTree(node.children)}</p>;
        case 'blockquote':
          return <blockquote key={i}>{Markdown.renderTree(node.children)}</blockquote>;
        case 'codeBlock':
          return (
            <HighLight key={i} language={node.language}>
              {node.code}
            </HighLight>
          );
        case 'list':
          return (
            <ul key={i}>
              {node.children.map((child, j) => (
                <li key={j}>{Markdown.renderTree(child.children)}</li>
              ))}
            </ul>
          );
        case 'listItem':
          return <li key={i}>{Markdown.renderTree(node.children)}</li>;
        case 'horizontalRule':
          return <hr key={i} />;
        case 'br':
          return <br />;
        case 'separator':
          return <hr className="separator" />;
        case 'text':
          return node.content;
        case 'strong':
          return <strong key={i}>{Markdown.renderTree(node.children)}</strong>;
        case 'emphasis':
          return <em key={i}>{Markdown.renderTree(node.children)}</em>;
        case 'inlineCode':
          return <code key={i}>{node.content}</code>;
        case 'link':
          return <Link to={node.href}>{Markdown.renderTree(node.children)}</Link>;
        case 'image':
          return <Image src={node.src} alt={node.alt || ''} />;
        case 'video':
          return <Video src={node.src} />;
        case 'runtimeWrapper':
          return (
            <Runtime key={i} runtimes={node.runtimes}>
              {node.children.map((block, j) => (
                <RuntimeBlock key={j} runtime={block.runtime}>
                  {Markdown.renderTree(block.children)}
                </RuntimeBlock>
              ))}
            </Runtime>
          );
        default:
          return null;
      }
    });
  }
}
