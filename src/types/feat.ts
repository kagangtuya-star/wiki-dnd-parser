import { ParagraphGroup } from './typography';
import { WikiData } from './wiki';

export type FeatFileEntry = {
    name: string;
    ENG_name?: string;
    source: string;
    page?: number;
    prerequisite?: FeatPrerequisite[];
    toolProficiencies?: any;
    armorProficiencies?: any;
    skillProficiencies?: any;
    weaponProficiencies?: any;
    skillToolLanguageProficiencies?: any;
    languageProficiencies?: any;
    savingThrowProficiencies?: any;
    optionalfeatureProgression?: any;
    entries: ParagraphGroup;
    freeRules2024?: any;
    category?: string;
    repeatable?: boolean;
    repeatableHidden?: boolean;
    ability?: any;
    reprintedAs?: any;
    additionalSpells?: any;
    hasFluffImages?: any;
    senses?: any;
    resist?: any;
    expertise?: any;
    srd?: boolean;
    bonusSenses?: any;
    _versions?: any;
    traitTags?: string[];
    additionalSources?: { source: string; page: number }[];
};

export type FeatPrerequisite = {
    other?: string;
    otherSummary?: {
        entry: string;
        entrySummary?: string;
    };
    level?: number | { level: number; class: { name: string; visible: boolean } };
    ability?: { [key: string]: number }[];
    feat?: string[];
    feature?: string[];
    race?: { name: string; displayEntry?: string; subrace?: string }[];
    spellcastingFeature?: any;
    proficiency?: { [key: string]: string }[];
    campaign?: string[];
    background?: { name: string; displayEntry?: string }[];
    spellcasting?: boolean;
    spellcasting2020?: boolean;
    spellcastingPrepared?: boolean;
};
export type FeatAbility = { [key: string]: number };

export type FeatFile = {
    feat: FeatFileEntry[];
};

export type WikiFeatEntry = {
    name: string;

    entries: ParagraphGroup;
    html: string;
};

export type WikiFeatData = WikiData<WikiFeatEntry, 'feat'> & {};
