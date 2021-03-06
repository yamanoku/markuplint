import { MLASTAttr, MLASTNode, MLASTNodeType, MLToken, Walker } from './types';
import { v4 as uuid4 } from 'uuid';

export function uuid() {
	return uuid4();
}

export function tokenizer(raw: string | null, line: number, col: number, startOffset: number): MLToken {
	raw = raw || '';
	return {
		uuid: uuid(),
		raw,
		startLine: line,
		endLine: getEndLine(raw, line),
		startCol: col,
		endCol: getEndCol(raw, col),
		startOffset,
		endOffset: startOffset + raw.length,
	};
}

export function sliceFragment(rawHtml: string, start: number, end: number) {
	const raw = rawHtml.slice(start, end);
	return {
		startOffset: start,
		endOffset: end,
		startLine: getLine(rawHtml, start),
		endLine: getLine(rawHtml, end),
		startCol: getCol(rawHtml, start),
		endCol: getCol(rawHtml, end),
		raw,
	};
}

export function getLine(html: string, startOffset: number) {
	return html.slice(0, startOffset).split(/\n/g).length;
}

export function getCol(html: string, startOffset: number) {
	const lines = html.slice(0, startOffset).split(/\n/g);
	return lines[lines.length - 1].length + 1;
}

export function getEndLine(html: string, line: number) {
	return html.split(/\r?\n/).length - 1 + line;
}

export function getEndCol(html: string, col: number) {
	const lines = html.split(/\r?\n/);
	const lineCount = lines.length;
	const lastLine = lines.pop()!;
	return lineCount > 1 ? lastLine.length + 1 : col + html.length;
}

export function walk(nodeList: MLASTNode[], walker: Walker, depth = 0) {
	for (const node of nodeList) {
		walker(node, depth);
		if ('childNodes' in node) {
			if (node.type === MLASTNodeType.EndTag) {
				continue;
			}
			if (node.childNodes && node.childNodes.length) {
				walk(node.childNodes, walker, depth + 1);
			}
			if ('pearNode' in node && node.pearNode) {
				walker(node.pearNode, depth);
			}
		}
	}
}

export function nodeListToDebugMaps(nodeList: MLASTNode[]) {
	return nodeList.map(n => {
		if (!n.isGhost) {
			return tokenDebug(n);
		} else {
			return `[N/A]>[N/A](N/A)${n.nodeName}: ${visibleWhiteSpace(n.raw)}`;
		}
	});
}

export function attributesToDebugMaps(attributes: MLASTAttr[]) {
	return attributes.map(n => {
		const r = [tokenDebug(n)];
		if (n.type === 'html-attr') {
			r.push(`  ${tokenDebug(n.spacesBeforeName, 'bN')}`);
			r.push(`  ${tokenDebug(n.name, 'name')}`);
			r.push(`  ${tokenDebug(n.spacesBeforeEqual, 'bE')}`);
			r.push(`  ${tokenDebug(n.equal, 'equal')}`);
			r.push(`  ${tokenDebug(n.spacesAfterEqual, 'aE')}`);
			r.push(`  ${tokenDebug(n.startQuote, 'sQ')}`);
			r.push(`  ${tokenDebug(n.value, 'value')}`);
			r.push(`  ${tokenDebug(n.endQuote, 'eQ')}`);
			r.push(`  isDirective: ${!!n.isDirective}`);
			r.push(`  isDynamicValue: ${!!n.isDynamicValue}`);
			r.push(`  isInvalid: ${!!n.isInvalid}`);
		}
		if (n.potentialName != null) {
			r.push(`  potentialName: ${visibleWhiteSpace(n.potentialName)}`);
		}
		return r;
	});
}

function tokenDebug<
	N extends {
		startOffset: number;
		endOffset: number;
		startLine: number;
		endLine: number;
		startCol: number;
		endCol: number;
		nodeName?: string;
		potentialName?: string;
		type?: string;
		raw: string;
	}
>(n: N, type = '') {
	return `[${n.startLine}:${n.startCol}]>[${n.endLine}:${n.endCol}](${n.startOffset},${n.endOffset})${
		n.nodeName || n.potentialName || n.type || type
	}: ${visibleWhiteSpace(n.raw)}`;
}

function visibleWhiteSpace(chars: string) {
	return chars.replace(/\n/g, '⏎').replace(/\t/g, '→').replace(/\s/g, '␣');
}
