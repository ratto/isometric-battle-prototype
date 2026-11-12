export enum WeaponSkillGroup {
  Dagger = 'dagger',
  Sword = 'sword',
  Axe = 'axe',
  Mace = 'mace',
  Staff = 'staff',
  Hammer = 'hammer',
  Flail = 'flail',
  Whip = 'whip',
  Spear = 'spear',
  Polearm = 'polearm',
  Bow = 'bow',
  Crossbow = 'crossbow',
  Thrown = 'thrown',
  Exotic = 'exotic',
}

export const WEAPON_SKILL_GROUP_DESCRIPTIONS: Record<WeaponSkillGroup, string> = {
  [WeaponSkillGroup.Dagger]:
    'Short single-handed blades used for quick, close-range stabbing and slashing (knives, daggers, stilettos).',
  [WeaponSkillGroup.Sword]:
    'Single or two-handed straight/curved blades, the most common melee weapon family in Daemon.',
  [WeaponSkillGroup.Axe]:
    'Single or two-handed chopping weapons with a blade head, melee or thrown.',
  [WeaponSkillGroup.Mace]: 'Blunt, crushing one-handed weapons without a long haft (maces, clubs).',
  [WeaponSkillGroup.Staff]:
    "Two-handed wooden poles used both as a simple melee backup weapon and as a caster's focus.",
  [WeaponSkillGroup.Hammer]:
    'Blunt, crushing weapons with a heavier head and longer haft than maces, including some two-handed variants.',
  [WeaponSkillGroup.Flail]:
    'Weapons with a striking head connected to the haft by a chain or rope.',
  [WeaponSkillGroup.Whip]:
    'Flexible, trailing weapons that trade raw damage for reach and control.',
  [WeaponSkillGroup.Spear]:
    'One or two-handed thrusting weapons with a bladed or pointed tip on a haft, some throwable.',
  [WeaponSkillGroup.Polearm]:
    'Long two-handed haft weapons built for reach, slower than spears but harder to close against.',
  [WeaponSkillGroup.Bow]:
    'Two-handed ranged weapons that fire arrows, requiring no reload between shots.',
  [WeaponSkillGroup.Crossbow]:
    'Ranged weapons that fire bolts from a mechanical lock, generally slower to ready than bows.',
  [WeaponSkillGroup.Thrown]:
    'Light weapons designed to be thrown by hand or with a simple mechanism (darts, slings, boomerangs).',
  [WeaponSkillGroup.Exotic]:
    'Weapons outside the common Western-medieval set, mostly of Eastern origin, each treated as its own skill in Daemon.',
}
