const DEFAULT = {
	DAMAGE_TYPE_1: "",
	DAMAGE_TYPE_2: "",
	DAMAGE_TYPE_3: "",
	DAMAGE_SUBTYPE_1: "",
	HITPOINTS_ATTRIBUTE_1: "",
	MAX_HITPOINTS_ATTRIBUTE_1: "",
	ALT_MAX_HITPOINTS_ATTRIBUTE_1: "",
	TEMP_HITPOINTS_ATTRIBUTE_1: "",
	DAMAGE_SUBTYPE_2: "",
	HITPOINTS_ATTRIBUTE_2: "",
	MAX_HITPOINTS_ATTRIBUTE_2: "",
	MITIGATION_ATTRIBUTE_1: "",
	MITIGATION_ATTRIBUTE_2: "",
	MITIGATION_ATTRIBUTE_3: "",
	ALLOW_DAMAGE_BUYOFF: false,
	ENABLE_CONDITIONS: false,
	ADDITIVE_DAMAGE: false,
};

/**
 * Set all default settings, based on game system
 */
const setDefaults = () => {
	// Default to system values
	if (game.system.id === "dnd5e" || game.system.id === "pf1" || game.system.id === "pf2e") {
		DEFAULT.DAMAGE_SUBTYPE_1 = "Health";
		DEFAULT.HITPOINTS_ATTRIBUTE_1 = "attributes.hp.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1 = "attributes.hp.max";
		DEFAULT.ALT_MAX_HITPOINTS_ATTRIBUTE_1 = "attributes.hp.tempmax";
		DEFAULT.TEMP_HITPOINTS_ATTRIBUTE_1 = "attributes.hp.temp";
	} else if (game.system.id === "swade") {
		DEFAULT.DAMAGE_SUBTYPE_1 = "Wounds";
		DEFAULT.HITPOINTS_ATTRIBUTE_1 = "wounds.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1 = "wounds.max";
		DEFAULT.DAMAGE_SUBTYPE_2 = "Fatigue";
		DEFAULT.HITPOINTS_ATTRIBUTE_2 = "fatigue.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_2 = "fatigue.max";
		DEFAULT.ADDITIVE_DAMAGE = true;
	} else if (game.system.id === "l5r5e") {
		DEFAULT.DAMAGE_SUBTYPE_1 = "Strife";
		DEFAULT.HITPOINTS_ATTRIBUTE_1 = "strife.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1 = "strife.max";
		DEFAULT.DAMAGE_SUBTYPE_2 = "Fatigue";
		DEFAULT.HITPOINTS_ATTRIBUTE_2 = "fatigue.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_2 = "fatigue.max";
		DEFAULT.ADDITIVE_DAMAGE = true;
	} else if (game.system.id === "torgeternity") {
		DEFAULT.DAMAGE_SUBTYPE_1 = "Wounds";
		DEFAULT.HITPOINTS_ATTRIBUTE_1 = "wounds.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1 = "wounds.max";
		DEFAULT.DAMAGE_SUBTYPE_2 = "Shock";
		DEFAULT.HITPOINTS_ATTRIBUTE_2 = "shock.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_2 = "shock.max";
		DEFAULT.ADDITIVE_DAMAGE = true;
	} else if (game.system.id === "age-system") {
		DEFAULT.DAMAGE_TYPE_1 = "Impact";
		DEFAULT.DAMAGE_TYPE_2 = "Ballistic";
		DEFAULT.DAMAGE_TYPE_3 = "Penetrating";
		DEFAULT.DAMAGE_SUBTYPE_1 = "Wound";
		DEFAULT.HITPOINTS_ATTRIBUTE_1 = "health.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1 = "health.max";
		DEFAULT.DAMAGE_SUBTYPE_2 = "Stun";
		DEFAULT.HITPOINTS_ATTRIBUTE_2 = "health.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_2 = "health.max";
		DEFAULT.MITIGATION_ATTRIBUTE_1 = "armor.toughness.total";
		DEFAULT.MITIGATION_ATTRIBUTE_2 = "armor.impact";
		DEFAULT.MITIGATION_ATTRIBUTE_3 = "armor.ballistic";
		DEFAULT.ENABLE_CONDITIONS = true;
		DEFAULT.ALLOW_DAMAGE_BUYOFF = false;
	} else if (game.system.id === "expanse") {
		DEFAULT.DAMAGE_TYPE_1 = "Impact";
		DEFAULT.DAMAGE_TYPE_2 = "Ballistic";
		DEFAULT.DAMAGE_TYPE_3 = "Penetrating";
		DEFAULT.DAMAGE_SUBTYPE_1 = "Wound";
		DEFAULT.HITPOINTS_ATTRIBUTE_1 = "fortune.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1 = "fortune.max";
		DEFAULT.DAMAGE_SUBTYPE_2 = "Stun";
		DEFAULT.HITPOINTS_ATTRIBUTE_2 = "fortune.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_2 = "fortune.max";
		DEFAULT.MITIGATION_ATTRIBUTE_1 = "toughness.modified";
		DEFAULT.MITIGATION_ATTRIBUTE_2 = "armor.modified";
		DEFAULT.ENABLE_CONDITIONS = false;
		DEFAULT.ALLOW_DAMAGE_BUYOFF = false;
	} else if (game.system.id === "sfrpg") {
		DEFAULT.HITPOINTS_ATTRIBUTE_1 = "attributes.hp.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1 = "attributes.hp.max";
		DEFAULT.ALT_MAX_HITPOINTS_ATTRIBUTE_1 = "attributes.sp.max";
		DEFAULT.TEMP_HITPOINTS_ATTRIBUTE_1 = "attributes.sp.value";
	} else {
		DEFAULT.HITPOINTS_ATTRIBUTE_1 = "health.value";
		DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1 = "health.max";
	}
};

/**
 * Register settings
 */
export function registerSettings() {
	setDefaults();

	// Enable/disbale Left Hand Mode
	game.settings.register("token-health", "enableLeftHandMode", {
		name: "TOKEN_HEALTH.enableLeftHandMode",
		hint: "TOKEN_HEALTH.enableLeftHandModeHint",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});

	// Enable/disbale Dynamic Button Text
	game.settings.register("token-health", "enableDynamicButtonText", {
		name: "TOKEN_HEALTH.enableDynamicButtonText",
		hint: "TOKEN_HEALTH.enableDynamicButtonTextHint",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});

	// Enable/disable display of token thumbnail images in dialog box
	game.settings.register("token-health", "enableTokenImages", {
		name: "TOKEN_HEALTH.enableTokenImages",
		hint: "TOKEN_HEALTH.enableTokenImagesHint",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
	});
	// Enable/disable ability for players to launch Token Health
	game.settings.register("token-health", "restrictPlayerLaunch", {
		name: "TOKEN_HEALTH.restrictPlayerLaunch",
		hint: "TOKEN_HEALTH.restrictPlayerLaunchHint",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
	});

	// UI warning message sent to player if they try to launch Token Health for tokens they don't own
	game.settings.register("token-health", "access", {
		name: "TOKEN_HEALTH.access",
		hint: "TOKEN_HEALTH.accessHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.accessMsg"),
		scope: "world",
		config: true,
	});

	// Enable/disable Additive Damage (for systems like SWADE, L5R5E, and TORG)
	game.settings.register("token-health", "damageAdds", {
		name: "TOKEN_HEALTH.damageAdds",
		hint: "TOKEN_HEALTH.damageAddsHint",
		type: Boolean,
		default: DEFAULT.ADDITIVE_DAMAGE,
		scope: "world",
		config: true,
	});

	// Primary damage type (optional)
	game.settings.register("token-health", "damageType1", {
		name: "TOKEN_HEALTH.damageType1",
		hint: "TOKEN_HEALTH.damageType1Hint",
		type: String,
		default: DEFAULT.DAMAGE_TYPE_1,
		scope: "world",
		config: true,
	});

	// Secondary damage type (optional)
	game.settings.register("token-health", "damageType2", {
		name: "TOKEN_HEALTH.damageType2",
		hint: "TOKEN_HEALTH.damageType2Hint",
		type: String,
		default: DEFAULT.DAMAGE_TYPE_2,
		scope: "world",
		config: true,
	});

	// Tertiary damage type (optional)
	game.settings.register("token-health", "damageType3", {
		name: "TOKEN_HEALTH.damageType3",
		hint: "TOKEN_HEALTH.damageType3Hint",
		type: String,
		default: DEFAULT.DAMAGE_TYPE_3,
		scope: "world",
		config: true,
	});

	// Primary damage mitigation attribute (optional)
	game.settings.register("token-health", "mitigationSource1", {
		name: "TOKEN_HEALTH.mitigation1",
		hint: "TOKEN_HEALTH.mitigation1Hint",
		type: String,
		default: DEFAULT.MITIGATION_ATTRIBUTE_1,
		scope: "world",
		config: true,
	});

	// Secondary damage mitigation attribute (optional)
	game.settings.register("token-health", "mitigationSource2", {
		name: "TOKEN_HEALTH.mitigation2",
		hint: "TOKEN_HEALTH.mitigation2Hint",
		type: String,
		default: DEFAULT.MITIGATION_ATTRIBUTE_2,
		scope: "world",
		config: true,
	});

	// Tertiary damage mitigation attribute (optional)
	game.settings.register("token-health", "mitigationSource3", {
		name: "TOKEN_HEALTH.mitigation3",
		hint: "TOKEN_HEALTH.mitigation3Hint",
		type: String,
		default: DEFAULT.MITIGATION_ATTRIBUTE_3,
		scope: "world",
		config: true,
	});

	// Primary damage subtype (required)
	game.settings.register("token-health", "damageSubtype1", {
		name: "TOKEN_HEALTH.damageSubtype1",
		hint: "TOKEN_HEALTH.damageSubtype1Hint",
		type: String,
		default: DEFAULT.DAMAGE_SUBTYPE_1,
		scope: "world",
		config: true,
	});

	// Attribute recording current health (required)
	game.settings.register("token-health", "hpSource1", {
		name: "TOKEN_HEALTH.hp1",
		type: String,
		default: DEFAULT.HITPOINTS_ATTRIBUTE_1,
		scope: "world",
		config: true,
	});

	// Attribute recording max possible health (required)
	game.settings.register("token-health", "hpSourceMax1", {
		name: "TOKEN_HEALTH.hpMax1",
		type: String,
		default: DEFAULT.MAX_HITPOINTS_ATTRIBUTE_1,
		scope: "world",
		config: true,
	});

	// Attribute recording secondary max possible health pool (optional) - *** NEW! ***
	game.settings.register("token-health", "altHpSourceMax1", {
		name: "TOKEN_HEALTH.altHpMax1",
		hint: "TOKEN_HEALTH.altHpMax1Hint",
		type: String,
		default: DEFAULT.ALT_MAX_HITPOINTS_ATTRIBUTE_1,
		scope: "world",
		config: true,
	});

	// Attribute for recording/tracking temporary health (optional)
	game.settings.register("token-health", "tempHpSource1", {
		name: "TOKEN_HEALTH.tempHp1",
		hint: "TOKEN_HEALTH.tempHpHint",
		type: String,
		default: DEFAULT.TEMP_HITPOINTS_ATTRIBUTE_1,
		scope: "world",
		config: true,
	});

	// Secondary damage type (optional)
	game.settings.register("token-health", "damageSubtype2", {
		name: "TOKEN_HEALTH.damageSubtype2",
		hint: "TOKEN_HEALTH.damageSubtype2Hint",
		type: String,
		default: DEFAULT.DAMAGE_SUBTYPE_2,
		scope: "world",
		config: true,
	});

	// Attribute recording current health (optional)
	game.settings.register("token-health", "hpSource2", {
		name: "TOKEN_HEALTH.hp2",
		hint: "TOKEN_HEALTH.hpHint",
		type: String,
		default: DEFAULT.HITPOINTS_ATTRIBUTE_2,
		scope: "world",
		config: true,
	});

	// Attribute recording max possible health (optional)
	game.settings.register("token-health", "hpSourceMax2", {
		name: "TOKEN_HEALTH.hpMax2",
		hint: "TOKEN_HEALTH.hpHint",
		type: String,
		default: DEFAULT.MAX_HITPOINTS_ATTRIBUTE_2,
		scope: "world",
		config: true,
	});

	// Attribute recording secondary max possible health pool (optional) - *** NEW! ***
	game.settings.register("token-health", "altHpSourceMax2", {
		name: "TOKEN_HEALTH.altHpMax2",
		hint: "TOKEN_HEALTH.altHpMax2Hint",
		type: String,
		default: "",
		scope: "world",
		config: true,
	});

	// Attribute for recording/tracking temporary health (optional)
	game.settings.register("token-health", "tempHpSource2", {
		name: "TOKEN_HEALTH.tempHp2",
		hint: "TOKEN_HEALTH.tempHpHint",
		type: String,
		default: "",
		scope: "world",
		config: true,
	});

	// Enable/Disable allowing health to go negative
	game.settings.register("token-health", "allowNegative", {
		name: "TOKEN_HEALTH.allowNegative",
		hint: "TOKEN_HEALTH.allowNegativeHint",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});

	// Health threshold for unconsciousness (not applicable for Additivie Damage systems)
	game.settings.register("token-health", "koThreshold", {
		name: "TOKEN_HEALTH.koThreshold",
		hint: "TOKEN_HEALTH.koThresholdHint",
		type: Number,
		default: 0,
		scope: "world",
		config: true,
	});

	// Health threshold for dying (not applicable for Additivie Damage systems)
	game.settings.register("token-health", "deathThreshold", {
		name: "TOKEN_HEALTH.deathThreshold",
		hint: "TOKEN_HEALTH.deathThresholdHint",
		type: Number,
		default: 0,
		scope: "world",
		config: true,
	});

	// Enable/Disable Setting Condition s (AGE System Specific)
	game.settings.register("token-health", "enableConditions", {
		name: "TOKEN_HEALTH.enableConditions",
		hint: "TOKEN_HEALTH.enableConditionsHint",
		type: Boolean,
		default: DEFAULT.ENABLE_CONDITIONS,
		scope: "world",
		config: true,
	});

	// Permit Buyoff of Damage (AGE System Specific)
	game.settings.register("token-health", "allowDamageBuyoff", {
		name: "TOKEN_HEALTH.allowDamageBuyoff",
		hint: "TOKEN_HEALTH.allowDamageBuyoffHint",
		type: Boolean,
		default: DEFAULT.ALLOW_DAMAGE_BUYOFF,
		scope: "world",
		config: true,
	});

	// Enable/Disable token chat messages
	game.settings.register("token-health", "enableChat", {
		name: "TOKEN_HEALTH.enableTokenChat",
		hint: "TOKEN_HEALTH.enableTokenChatHint",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
	});

	// token chat if takeing damage (Players & GM)
	game.settings.register("token-health", "ouch", {
		name: "TOKEN_HEALTH.harmName",
		hint: "TOKEN_HEALTH.tokenChatHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.ouch"),
		scope: "world",
		config: true,
	});

	// token chat if takeing 1 point of damage (GM Only)
	game.settings.register("token-health", "damagePoint", {
		name: "TOKEN_HEALTH.minorDamageName",
		hint: "TOKEN_HEALTH.tokenChatHintGM",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.damagePoint"),
		scope: "world",
		config: true,
	});

	// token chat if takeing >1 points of damage (GM Only)
	game.settings.register("token-health", "damagePoints", {
		name: "TOKEN_HEALTH.damageName",
		hint: "TOKEN_HEALTH.tokenChatHintGM",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.damagePoints"),
		scope: "world",
		config: true,
	});

	// token chat if damage results in unconscious
	game.settings.register("token-health", "unconscious", {
		name: "TOKEN_HEALTH.whenUnconcious",
		hint: "TOKEN_HEALTH.whenUnconciousHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.unconscious"),
		scope: "world",
		config: true,
	});

	// token chat if damage results in death
	game.settings.register("token-health", "dying", {
		name: "TOKEN_HEALTH.whenDying",
		hint: "TOKEN_HEALTH.tokenChatHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.dying"),
		scope: "world",
		config: true,
	});

	// token chat if you apply damage to the dead
	game.settings.register("token-health", "dead", {
		name: "TOKEN_HEALTH.whenDead",
		hint: "TOKEN_HEALTH.tokenChatHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.dead"),
		scope: "world",
		config: true,
	});

	// token chat if taking healing (Players & GM)
	game.settings.register("token-health", "ty", {
		name: "TOKEN_HEALTH.healName",
		hint: "TOKEN_HEALTH.tokenChatHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.ty"),
		scope: "world",
		config: true,
	});

	// token chat if takeing 1 point of healing (GM Only)
	game.settings.register("token-health", "healingPoint", {
		name: "TOKEN_HEALTH.minorHealingName",
		hint: "TOKEN_HEALTH.tokenChatHintGM",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.healingPoint"),
		scope: "world",
		config: true,
	});

	// token chat if takeing > 1 points of healing (GM Only)
	game.settings.register("token-health", "healingPoints", {
		name: "TOKEN_HEALTH.HealingName",
		hint: "TOKEN_HEALTH.tokenChatHintGM",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.healingPoints"),
		scope: "world",
		config: true,
	});

	// token chat if no damage or healing taken (all was mitigated/none needed)
	game.settings.register("token-health", "meh", {
		name: "TOKEN_HEALTH.noEffectName",
		hint: "TOKEN_HEALTH.tokenChatHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.meh"),
		scope: "world",
		config: true,
	});

	// token chat if taking the injured condition (AGE-System Specific)
	game.settings.register("token-health", "injured", {
		name: "TOKEN_HEALTH.whenInjured",
		hint: "TOKEN_HEALTH.tokenChatHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.injured"),
		scope: "world",
		config: true,
	});

	// token chat if taking the wonded condition (AGE-System Specific)
	game.settings.register("token-health", "wounded", {
		name: "TOKEN_HEALTH.whenWounded",
		hint: "TOKEN_HEALTH.tokenChatHint",
		type: String,
		default: game.i18n.localize("TOKEN_HEALTH.wounded"),
		scope: "world",
		config: true,
	});
}
