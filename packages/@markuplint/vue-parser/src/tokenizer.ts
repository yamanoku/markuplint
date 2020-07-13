import { MLToken, uuid } from '@markuplint/ml-ast';
import getEndCol from './get-end-col';
import getEndLine from './get-end-line';

export default function (raw: string | null, line: number, col: number, startOffset: number): MLToken {
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
