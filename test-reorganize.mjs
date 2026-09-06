import fs from 'fs/promises';
import path from 'path';

const KEY_TO_DIR = {
    'action': 'action', 'adventure': 'adventure', 'adventureData': 'adventure',
    'background': 'background', 'backgroundFluff': 'background', 'baseitem': 'baseitem',
    'book': 'book', 'bookData': 'book', 'boon': 'boon', 'charoption': 'charoption',
    'class': 'class', 'classFeature': 'class', 'classFluff': 'class',
    'condition': 'condition', 'conditionFluff': 'condition', 'cult': 'cult',
    'deck': 'deck', 'deity': 'deity', 'disease': 'disease', 'diseaseFluff': 'disease',
    'feat': 'feat', 'featFluff': 'feat', 'hazard': 'hazard', 'item': 'item',
    'itemEntry': 'item', 'itemFluff': 'item', 'itemGroup': 'item', 'itemMastery': 'item',
    'itemProperty': 'item', 'itemType': 'item', 'itemTypeAdditionalEntries': 'item',
    'language': 'language', 'languageFluff': 'language', 'legendaryGroup': 'creature',
    'magicvariant': 'magicvariant', 'makebrewCreatureTrait': 'makebrew',
    'monster': 'creature', 'monsterFluff': 'creature', 'object': 'object',
    'objectFluff': 'object', 'optionalfeature': 'optionalfeature',
    'optionalfeatureFluff': 'optionalfeature', 'race': 'race', 'raceFluff': 'race',
    'recipe': 'recipe', 'recipeFluff': 'recipe', 'reward': 'reward',
    'rewardFluff': 'reward', 'spell': 'spell', 'spellFluff': 'spell',
    'subclass': 'subclass', 'subclassFeature': 'subclass', 'subclassFluff': 'subclass',
    'subrace': 'subrace', 'table': 'table', 'trap': 'trap', 'variantrule': 'variantrule',
    'vehicle': 'vehicle', 'vehicleFluff': 'vehicle', 'vehicleUpgrade': 'vehicle',
};

const getTimestamp = () => new Date().toTimeString().split(' ')[0];

const reorganizeHomebrewData = async (homebrewDir) => {
    const collectionDir = path.join(homebrewDir, 'collection');
    let files;
    try { files = await fs.readdir(collectionDir); }
    catch { console.log(`[${getTimestamp()}] collection 目录不存在: ${collectionDir}`); return; }

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    console.log(`[${getTimestamp()}] 开始重组 collection 数据 (${jsonFiles.length} 个文件)...`);

    let movedCount = 0, processedFiles = 0;
    const dirStats = {};

    for (const file of jsonFiles) {
        const filePath = path.join(collectionDir, file);
        let data;
        try { data = JSON.parse(await fs.readFile(filePath, 'utf-8')); }
        catch { continue; }

        const keysToMove = [];
        const keysByDir = new Map();

        for (const key of Object.keys(data)) {
            if (key.startsWith('_') || key.startsWith('$') || key.startsWith('foundry')) continue;
            if (!Array.isArray(data[key]) || data[key].length === 0) continue;
            const dir = KEY_TO_DIR[key];
            if (!dir) continue;
            keysToMove.push(key);
            if (!keysByDir.has(dir)) keysByDir.set(dir, []);
            keysByDir.get(dir).push(key);
        }

        if (keysToMove.length === 0) continue;
        processedFiles++;

        for (const [dir, dirKeys] of keysByDir) {
            const targetDir = path.join(homebrewDir, dir);
            await fs.mkdir(targetDir, { recursive: true });
            const targetFilePath = path.join(targetDir, file);
            let targetData = {};
            try { targetData = JSON.parse(await fs.readFile(targetFilePath, 'utf-8')); } catch {}

            for (const key of dirKeys) {
                const arr = data[key];
                if (Array.isArray(targetData[key])) targetData[key].push(...arr);
                else targetData[key] = arr;
                movedCount += arr.length;
                dirStats[dir] = (dirStats[dir] || 0) + arr.length;
            }
            await fs.writeFile(targetFilePath, JSON.stringify(targetData, null, 2), 'utf-8');
        }

        for (const key of keysToMove) delete data[key];
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    console.log(`[${getTimestamp()}] 重组完成: 处理 ${processedFiles} 个文件，移动 ${movedCount} 条数据`);
    console.log('各目录移动数量:', dirStats);
};

const zhDir = 'c:/Users/rukee/Documents/ai用/ai/wiki-dnd-parser/input/5e-cn/homebrew';
const enDir = 'c:/Users/rukee/Documents/ai用/ai/wiki-dnd-parser/input/5e-en/homebrew';

await Promise.all([
    reorganizeHomebrewData(zhDir),
    reorganizeHomebrewData(enDir),
]);
console.log('完成');
