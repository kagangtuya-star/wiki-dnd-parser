import * as fs from 'fs/promises';
import { loadFile } from './config.js';
import {
    logger,
    bookMgr,
    featMgr,
    baseItemMgr,
    itemMgr,
    itemPropertyMgr,
    itemTypeMgr,
    createOutputFolders,
    idMgr,
    spellMgr,
} from './factory.js';
import { SpellFile, SpellFileEntry } from './types/spells.js';
import { tagParser } from './contentGen.js';
(async () => {
    await createOutputFolders();

    // 基本数据：书
    const { en: bookEn, zh: bookZh } = await loadFile('books.json');
    bookMgr.loadData(bookZh, bookEn);
    await bookMgr.generateFiles();

    // 基本数据：特性
    const { en: featEn, zh: featZh } = await loadFile('feats.json');

    featMgr.loadData(featZh, featEn);
    await featMgr.generateFiles();

    // 基本数据：基础物品
    const { en: itemEn, zh: itemZh } = await loadFile('items-base.json');
    itemPropertyMgr.loadData(itemZh, itemEn);
    await itemPropertyMgr.generateFiles();
    itemTypeMgr.loadData(itemZh, itemEn);
    await itemTypeMgr.generateFiles();
    baseItemMgr.loadData(itemZh, itemEn);
    await baseItemMgr.generateFiles();
    // 基本数据：物品
    const { en: itemFileEn, zh: itemFileZh } = await loadFile('items.json');
    itemMgr.loadData(itemFileZh, itemFileEn);
    await itemMgr.generateFiles();

    // 法术
    const { en: spellIndex } = (await loadFile('./spells/index.json')) as Record<string, string>;
    for (const [source, filePath] of Object.entries(spellIndex)) {
        const spellFilePath = './spells/' + filePath;
        const { en: spellEn, zh: spellZh } = await loadFile(spellFilePath);
        const spellFile = {
            en: spellEn as SpellFile,
            zh: spellZh as SpellFile,
        };
        spellMgr.loadData(spellFile.zh, spellFile.en);
    }
    await spellMgr.generateFiles();

    // 生成日志文件
    await logger.generateFile();
    await idMgr.generateFiles();
    await tagParser.generateFiles();
})();
