import XLSX from 'xlsx';
import path from 'path';
import { promises as fs } from 'fs';
import { isHomebrewMode, loadHomebrewByKeys } from './homebrewLoader.js';

interface SubraceFromInput {
    raceName: string;
    raceENGName: string;
    raceSource: string;
    subraceName: string;
    subraceENGName: string;
    subraceSource: string;
}

interface SubraceFromXlsx {
    母种族: string;
    母种族原名: string;
    母种族来源: string;
    子种族缀名: string;
    缀名原名: string;
    子种族来源: string;
    子种族全名: string;
    原名全文: string;
}

const XLSX_HEADER = ['母种族', '母种族原名', '母种族来源', '子种族缀名', '缀名原名', '子种族来源', '子种族全名', '原名全文'];

const loadRaceData = async (): Promise<{ race: any[]; subrace: any[] }> => {
    const filePath = path.join(process.cwd(), 'input/5e-cn/data/races.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    let race = data.race || [];
    let subrace = data.subrace || [];

    // homebrew 模式：合并 homebrew subrace 数据
    if (isHomebrewMode) {
        const zhHb = await loadHomebrewByKeys('zh', ['subrace', 'race']);
        if (zhHb.subrace) subrace = [...subrace, ...zhHb.subrace];
        if (zhHb.race) race = [...race, ...zhHb.race];
    }

    return { race, subrace };
};

const loadXlsxData = (): { workbook: XLSX.WorkBook; sheetName: string; rows: SubraceFromXlsx[] } => {
    const dictionaryPath = path.join(process.cwd(), 'config/子种族名字替换词典.xlsx');
    const workbook = XLSX.readFile(dictionaryPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet) as SubraceFromXlsx[];
    return { workbook, sheetName, rows };
};

const extractSubracesFromInput = (raceData: { race: any[]; subrace: any[] }): SubraceFromInput[] => {
    const raceMap = new Map<string, string>();
    for (const r of raceData.race) {
        if (r.name && r.ENG_name) {
            const key = r.name + '|' + (r.source || '');
            raceMap.set(key, r.ENG_name);
            raceMap.set(r.name, r.ENG_name);
        }
    }

    const subraces: SubraceFromInput[] = [];
    for (const s of raceData.subrace) {
        let raceName = s.raceName;
        let raceSource = s.raceSource;
        if (!raceName && s._copy && s._copy.raceName) raceName = s._copy.raceName;
        if (!raceSource && s._copy && s._copy.raceSource) raceSource = s._copy.raceSource;

        const raceENGName = raceMap.get(raceName + '|' + raceSource) || raceMap.get(raceName) || '';

        subraces.push({
            raceName: raceName || '',
            raceENGName,
            raceSource: raceSource || '',
            subraceName: s.name || '',
            subraceENGName: s.ENG_name || '',
            subraceSource: s.source || '',
        });
    }

    return subraces;
};

const generateFullName = (subrace: SubraceFromInput): { fullName: string; fullENGName: string } => {
    if (!subrace.subraceName) {
        return {
            fullName: subrace.raceName,
            fullENGName: subrace.raceENGName,
        };
    }

    const specialCases: Record<string, (s: SubraceFromInput) => { fullName: string; fullENGName: string }> = {
        'Amonkhet': () => ({ fullName: '人类（阿芒凯）', fullENGName: 'Human(Amonkhet)' }),
        'Joraga Nation': () => ({ fullName: '玖瑞加精灵', fullENGName: 'Joraga Elf' }),
        'Mul Daya Nation': () => ({ fullName: '慕达雅精灵', fullENGName: 'Mul Daya Elf' }),
        'Tajuru Nation': () => ({ fullName: '特裘如精灵', fullENGName: 'Tajuru Elf' }),
        'Deep/Svirfneblin': () => ({ fullName: '地底侏儒/斯涅布力', fullENGName: 'Svirfneblin' }),
        'Variant; Aquatic Elf Descent': () => ({ fullName: '水生精灵血统半精灵', fullENGName: 'Half-Elf (Aquatic Elf)' }),
        'Variant; Drow Descent': () => ({ fullName: '卓尔血统半精灵', fullENGName: 'Half-Elf (Drow)' }),
        'Variant; Mark of Detection': () => ({ fullName: '侦测龙纹半精灵', fullENGName: 'Half-Elf:Mark of Detection' }),
        'Variant; Mark of Storm': () => ({ fullName: '暴风龙纹半精灵', fullENGName: 'Half-Elf:Mark of Storm' }),
        'Variant; Moon Elf or Sun Elf Descent': () => ({ fullName: '月精灵或日精灵血统半精灵', fullENGName: 'Half-Elf (Moon/Sun Elf)' }),
        'Variant; Wood Elf Descent': () => ({ fullName: '木精灵血统半精灵', fullENGName: 'Half-Elf (Wood Elf)' }),
        'Variant; Mark of Finding': (s) => {
            if (s.raceName === '人类') return { fullName: '探索龙纹人类', fullENGName: 'Human:Mark of Finding' };
            if (s.raceName === '半兽人') return { fullName: '探索龙纹半兽人', fullENGName: 'Half-Orc:Mark of Finding' };
            return { fullName: s.subraceName, fullENGName: s.subraceENGName };
        },
        'Variant': (s) => {
            if (s.raceName === '人类') return { fullName: '变体人类', fullENGName: 'Variant Human' };
            return { fullName: s.subraceName, fullENGName: s.subraceENGName };
        },
        'Variant; Devil\'s Tongue': () => ({ fullName: '魔鬼之舌提夫林', fullENGName: 'Tiefling (Devil\'s Tongue)' }),
        'Variant; Hellfire': () => ({ fullName: '地狱火提夫林', fullENGName: 'Tiefling (Hellfire)' }),
        'Variant; Infernal Legacy': () => ({ fullName: '地狱遗赠提夫林', fullENGName: 'Tiefling (Infernal Legacy)' }),
        'Variant; Winged': () => ({ fullName: '飞翼提夫林', fullENGName: 'Tiefling (Winged)' }),
        'Zendikar; Grotag Tribe': () => ({ fullName: '葛塔部落地精', fullENGName: 'Grotag Goblin' }),
        'Zendikar; Lavastep Tribe': () => ({ fullName: '熔足部落地精', fullENGName: 'Lavastep Goblin' }),
        'Zendikar; Tuktuk Tribe': () => ({ fullName: '图图部落地精', fullENGName: 'Tuktuk Goblin' }),
        'Ixalan; Blue': () => ({ fullName: '蓝色依夏兰人鱼', fullENGName: 'Ixalan Blue Merfolk' }),
        'Ixalan; Green': () => ({ fullName: '绿色依夏兰人鱼', fullENGName: 'Ixalan Green Merfolk' }),
        'Zendikar; Cosi Creed': () => ({ fullName: '寇希信仰人鱼', fullENGName: 'Cosi Merfolk' }),
        'Zendikar; Emeria Creed': () => ({ fullName: '伊美黎信仰人鱼', fullENGName: 'Emeria Merfolk' }),
        'Zendikar; Ula Creed': () => ({ fullName: '钨拉信仰人鱼', fullENGName: 'Ula Merfolk' }),
    };

    if (specialCases[subrace.subraceENGName]) {
        return specialCases[subrace.subraceENGName](subrace);
    }

    if (subrace.subraceName.includes('变体')) {
        return {
            fullName: subrace.subraceName,
            fullENGName: subrace.subraceENGName,
        };
    }

    const markMatch = subrace.subraceName.match(/(\S+)龙纹/);
    if (markMatch) {
        return {
            fullName: `${markMatch[1]}龙纹${subrace.raceName}`,
            fullENGName: `${subrace.raceENGName}:${subrace.subraceENGName}`,
        };
    }

    const standaloneNames: Record<string, string> = {
        'Duergar': '灰矮人',
        'Drow': '卓尔精灵',
        'Eladrin': '雅灵',
        'Shadar-kai': '影灵',
        'Githyanki': '吉斯洋基人',
        'Githzerai': '吉斯泽莱人',
    };

    if (standaloneNames[subrace.subraceENGName]) {
        return {
            fullName: standaloneNames[subrace.subraceENGName],
            fullENGName: subrace.subraceENGName,
        };
    }

    return {
        fullName: `${subrace.subraceName}${subrace.raceName}`,
        fullENGName: `${subrace.subraceENGName} ${subrace.raceENGName}`,
    };
};

const main = async () => {
    console.log('正在加载数据...');

    const raceData = await loadRaceData();
    const { workbook, sheetName, rows } = loadXlsxData();

    const inputSubraces = extractSubracesFromInput(raceData);
    const xlsxKeySet = new Set<string>();

    for (const row of rows) {
        const key = `${row.母种族}|${row.母种族来源}|${row.缀名原名 || ''}|${row.子种族来源}`;
        xlsxKeySet.add(key);
    }

    const missing: SubraceFromInput[] = [];
    for (const sub of inputSubraces) {
        const key = `${sub.raceName}|${sub.raceSource}|${sub.subraceENGName}|${sub.subraceSource}`;
        if (!xlsxKeySet.has(key)) {
            missing.push(sub);
        }
    }

    if (missing.length === 0) {
        console.log('✓ XLSX 文件已包含所有子种族，无需补充');
        return;
    }

    console.log(`发现 ${missing.length} 个缺失的子种族，正在补充...`);

    for (const sub of missing) {
        const { fullName, fullENGName } = generateFullName(sub);
        console.log(`  + ${sub.raceName} | ${sub.subraceName} -> ${fullName}`);
    }

    for (const sub of missing) {
        const { fullName, fullENGName } = generateFullName(sub);
        const newRow: SubraceFromXlsx = {
            母种族: sub.raceName,
            母种族原名: sub.raceENGName,
            母种族来源: sub.raceSource,
            子种族缀名: sub.subraceName,
            缀名原名: sub.subraceENGName,
            子种族来源: sub.subraceSource,
            子种族全名: fullName,
            原名全文: fullENGName,
        };
        rows.push(newRow);
    }

    const newWorksheet = XLSX.utils.json_to_sheet(rows, { header: XLSX_HEADER });
    workbook.Sheets[sheetName] = newWorksheet;

    const outputPath = path.join(process.cwd(), 'config/子种族名字替换词典.xlsx');
    XLSX.writeFile(workbook, outputPath);

    console.log(`✓ 已补充 ${missing.length} 个子种族到 ${outputPath}`);
    console.log(`  总计：${rows.length} 个子种族`);
};

main().catch(console.error);
