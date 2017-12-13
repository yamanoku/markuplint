import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import * as markuplint from './core';
import Rule, {
	getRuleModules,
	VerifiedResult,
} from './rule';
import {
	getRuleset,
	Ruleset,
} from './ruleset';
import osLocale from './util/osLocale';

const readFile = util.promisify(fs.readFile);

export async function verify (html: string, ruleset: Ruleset, rules: Rule[], locale?: string) {
	if (!locale) {
		locale = await osLocale();
	}
	return await markuplint.verify(html, ruleset, rules, locale);
}

export async function verifyOnWorkspace (html: string) {
	const locale = await osLocale();
	const ruleset = await getRuleset(process.cwd());
	const rules = await getRuleModules();
	return await markuplint.verify(html, ruleset, rules, locale);
}

export async function verifyFile (filePath: string, ruleset?: Ruleset, rules?: Rule[], locale?: string) {
	if (!locale) {
		locale = await osLocale();
	}
	const absFilePath = path.resolve(filePath);
	const parsedPath = path.parse(absFilePath);
	const dir = path.dirname(absFilePath);
	ruleset = ruleset || await getRuleset(dir);
	rules = rules || await getRuleModules();
	const html = await readFile(filePath, 'utf-8');
	const reports = await markuplint.verify(html, ruleset, rules, locale);
	return {
		html,
		reports,
	};
}
