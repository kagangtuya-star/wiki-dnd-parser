import fs from 'fs/promises';
import { ItemBaseFile, ItemFile } from './types/items';
import { strCodec } from './config';

(async () => {
    // 物品部分
    const itemBaseFile = {
        en: JSON.parse(await fs.readFile('./input/5e-en/item-base.json', 'utf-8')) as ItemBaseFile,
        cn: JSON.parse(await fs.readFile('./input/5e-cn/item-base.json', 'utf-8')) as ItemBaseFile,
    };
    const itemFile = {
        en: JSON.parse(await fs.readFile('./input/5e-en/items.json', 'utf-8')) as ItemFile,
        cn: JSON.parse(await fs.readFile('./input/5e-cn/items.json', 'utf-8')) as ItemFile,
    };



})();
