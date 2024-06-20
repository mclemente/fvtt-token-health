const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Extend Dialog class to force focus on the input
 */
export class TokenHealthDialog extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(options) {
		super(options);
		if (game.settings.get("token-health", "enableLeftHandMode")) {
			this.options.classes.push("token-health-left-handed-mode");
		}
	}

	static DEFAULT_OPTIONS = {
		actions: {
			damage: TokenHealthDialog.damage,
			heal: TokenHealthDialog.heal,
		},
		id: "token-health",
		classes: ["form-token-health"],
		form: {
			// handler: HealthEstimateSettingsV2.#onSubmit,
			// closeOnSubmit: true,
		},
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
		},
	};

	get title() {
		const nameOfTokens = this.options.tokens
			.map((t) => t.name)
			.sort((a, b) => a.length - b.length)
			.join(", ");
		return game.i18n.format(
			`TOKEN_HEALTH.Dialog_${this.options.isDamage ? "Damage" : "Heal"}_Title${
				this.options.isTarget ? "_targeted" : ""
			}`,
			{ nameOfTokens }
		);
	}

	static PARTS = {
		form: {
			classes: ["token-health"],
			template: "modules/token-health/templates/token-health.hbs",
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	_prepareContext(options) {
		const buttons = [
			{
				type: "button",
				cssClass: ["heal"],
				icon: "fas fa-plus-circle",
				label: game.i18n.localize("TOKEN_HEALTH.Heal"),
				action: "heal",
				// condition: true,
			},
			{
				type: "button",
				cssClass: ["damage"],
				icon: "fas fa-minus-circle",
				label: game.i18n.localize("TOKEN_HEALTH.Damage"),
				action: "damage",
				// condition: true,
			},
		];

		let thumbnails = {};
		if (game.settings.get("token-health", "enableTokenImages")) {
			thumbnails = this.options.tokens
				.slice(0, 4)
				.map((t, idx) => ({ image: t.document.texture.src, opacity: 1 - 0.15 * idx }));
		}
		let damageType1 = game.settings.get("token-health", "damageType1");
		let damageType2 = game.settings.get("token-health", "damageType2");
		let damageType3 = game.settings.get("token-health", "damageType3");
		let damageTypes = [];
		if (damageType1.length > 0) damageTypes.push(damageType1);
		if (damageType2.length > 0) damageTypes.push(damageType2);
		if (damageType3.length > 0) damageTypes.push(damageType3);

		let damageSubtype1 =
			game.settings.get("token-health", "damageSubtype1") || game.settings.get("token-health", "hpSource1");

		let damageSubtype2 =
			game.settings.get("token-health", "damageSubtype2") || game.settings.get("token-health", "hpSource2");
		let damageSubtypes = [];
		if (damageSubtype1.length > 0) damageSubtypes.push(damageSubtype1);
		if (damageSubtype2.length > 0) damageSubtypes.push(damageSubtype2);

		return {
			thumbnails,
			damageTypes,
			damageSubtypes,
			buttons,
		};
	}

	_onRender(context, options) {
		super._onRender(context, options);

		// Focus the input
		this.element.querySelector('input[type="number"][name="damageSubtype"]').focus();

		// Update UI
		this.element.querySelector('input[type="number"][name="damageSubtype"]').addEventListener("input", (event) => {
			if (!game.settings.get("token-health", "enableDynamicButtonText")) return;
			let healButton = this.element
				.closest(".dialog")
				.querySelector('.dialog-buttons button[data-button="heal"]');
			let damageButton = this.element
				.closest(".dialog")
				.querySelector('.dialog-buttons button[data-button="damage"]');
			let input1 = this.element.querySelector('input[type="number"][name="damageSubtype"][data-type="0"]');
			let input2 = this.element.querySelector('input[type="number"][name="damageSubtype"][data-type="1"]');

			if (!(!(input1.val() >= 0 && input2.val() < 0) && !(input1.val() < 0 && input2.val() >= 0))) {
				healButton.toggleClass("heal", true).toggleClass("damage", false);
				healButton.html(`<i class='fas fa-plus-circle'></i> ${game.i18n.localize("TOKEN_HEALTH.Heal")}`);
				damageButton.toggleClass("heal", false).toggleClass("damage", true);
				damageButton.html(`<i class='fas fa-minus-circle'></i> ${game.i18n.localize("TOKEN_HEALTH.Damage")}`);
				return;
			}

			healButton.toggleClass("heal", input1.val() >= 0);
			healButton.toggleClass("damage", input1.val() < 0);
			damageButton.toggleClass("heal", input1.val() < 0);
			damageButton.toggleClass("damage", input1.val() >= 0);

			healButton.html(
				input1.val() >= 0
					? `<i class='fas fa-plus-circle'></i> ${game.i18n.localize("TOKEN_HEALTH.Heal")}`
					: `<i class='fas fa-minus-circle'></i> ${game.i18n.localize("TOKEN_HEALTH.Damage")}`
			);
			damageButton.html(
				input1.val() < 0
					? `<i class='fas fa-plus-circle'></i> ${game.i18n.localize("TOKEN_HEALTH.Heal")}`
					: `<i class='fas fa-minus-circle'></i> ${game.i18n.localize("TOKEN_HEALTH.Damage")}`
			);
		});
	}

	static async damage(event, form, formData) {
		this.element.querySelectorAll('input[type="number"][name="damageSubtype"]').forEach((input, index) => {
			if (!input.value) return;
			this.applyDamage(true, this.options.isTarget, $(input), {
				type: game.settings.get("token-health", `damageSubtype${index + 1}`).toLowerCase(),
				source: game.settings.get("token-health", `hpSource${index + 1}`),
				maxSource: game.settings.get("token-health", `hpSourceMax${index + 1}`),
				altMaxSource: game.settings.get("token-health", `altHpSourceMax${index + 1}`),
				tempSource: game.settings.get("token-health", `tempHpSource${index + 1}`),
			});
		});
		this.close();
	}

	static async heal(event, form, formData) {
		this.element.querySelectorAll('input[type="number"][name="damageSubtype"]').forEach((input, index) => {
			if (!input.value) return;
			this.applyDamage(false, this.options.isTarget, $(input), {
				type: game.settings.get("token-health", `damageSubtype${index + 1}`).toLowerCase(),
				source: game.settings.get("token-health", `hpSource${index + 1}`),
				maxSource: game.settings.get("token-health", `hpSourceMax${index + 1}`),
				altMaxSource: game.settings.get("token-health", `altHpSourceMax${index + 1}`),
				tempSource: game.settings.get("token-health", `tempHpSource${index + 1}`),
			});
		});
		this.close();
	}

	/**
	 * Apply damage, use the Actor5e formula
	 *
	 * @param {HTMLElement} html The html element
	 * @param {boolean} isDamage Is the amount a damage? false if it's healing
	 * @param {boolean} isTargeted Is it a targeted token?
	 * @returns {Promise<Entity|Entity[]>}
	 */
	async applyDamage(isDamage, isTargeted, input = null, damageTypeConfig = null) {
		const value = (input ?? this.element.querySelector("input[type=number]")).val();
		const damage = isDamage ? Number(value) : Number(value) * -1;

		// Set AGE-system specific things
		// AGE-System games and allow for different damage types of
		//   Impact (mitigated by any armor type and toughness)
		//   Ballisitic (only mitigated by ballistic armor and toughness)
		//   Penetraiting (bypasses all armor and toughness)
		let damageType = "normal";
		// AGE-System games allow for two damage subtypes
		//   Wound (may actually kill the character)
		//   Stun (may at most render the character unconscious)
		let damageSubtype = damageTypeConfig?.type ?? "wound";

		if (game.settings.get("token-health", "damageType1")) {
			damageType = this.element.querySelector('[name="damageType"]')[0].value;
		}
		let type1;
		let type2;

		if (game.settings.get("token-health", "damageSubtype1")) {
			type1 = this.element.querySelector('[name="damageSubtype"]')[0]?.checked ?? false;
			type2 = this.element.querySelector('[name="damageSubtype"]')[1]?.checked ?? false;
			if (type1) {
				damageSubtype = game.settings.get("token-health", "damageSubtype1").toLowerCase();
			} else {
				damageSubtype = game.settings.get("token-health", "damageSubtype2").toLowerCase();
			}
		}

		// Get the control paramater for enabling/disabling token chat
		let enableChat = game.settings.get("token-health", "enableChat");

		// Get the control parameter for enablibng/disabling the application of actor condtions
		let enableConditions = false;
		if (game.system.id === "age-system") {
			if (game.settings.get("age-system", "inUseConditions") === "expanse") {
				enableConditions = game.settings.get("token-health", "enableConditions");
			}
		}

		// Temporary setting to prevent issues in 0.8.6
		// enableConditions = false;

		// Get the thresholds for Unconscious and Death/Dying
		let koThreshold = game.settings.get("token-health", "koThreshold");
		let deathThreshold = game.settings.get("token-health", "deathThreshold");
		if (koThreshold === undefined) koThreshold = 0;
		if (deathThreshold === undefined) deathThreshold = 0;
		if (!Number.isInteger(koThreshold)) koThreshold = Math.round(koThreshold);
		if (!Number.isInteger(deathThreshold)) deathThreshold = Math.round(deathThreshold);
		if (!game.settings.get("token-health", "allowNegative")) {
			if (koThreshold !== undefined) {
				if (koThreshold < 0) koThreshold = 0;
			}
			if (deathThreshold < 0) deathThreshold = 0;
		}

		// This controls if damage buyoff is allowed (injured/wounded/dying)
		// verses going straight to dying when health gets to 0.
		const allowDamageBuyoff = game.settings.get("token-health", "allowDamageBuyoff");

		const tokens = isTargeted ? Array.from(game.user.targets) : canvas.tokens.controlled;

		// Get the control parameter for treating damage as additive (escalating from a base of 0, vs. reducing from the pool of health available)
		const dAdd = game.settings.get("token-health", "damageAdds");
		let df = 1;
		if (dAdd) df = -1;

		// SDR: It would be nice to add an async to this arrow function...
		const promises = tokens.map(async ({ actor }) => {
			// console.log(actor)
			if (actor.isOwner === false) {
				// console.log("You're not worthy!")
				return;
			}
			const data = actor.system; // is the AGE System only or all systems in V10?

			let hpSource = damageTypeConfig?.source ?? game.settings.get("token-health", "hpSource1");
			let maxSource = damageTypeConfig?.maxSource ?? game.settings.get("token-health", "hpSourceMax1");
			let altMaxSource = damageTypeConfig?.altMaxSource ?? game.settings.get("token-health", "altHpSourceMax1");
			let tempSource = damageTypeConfig?.tempSource ?? game.settings.get("token-health", "tempHpSource1"); // Handle temp hp if any

			// If damageSubtype is type 2, then overwrite with the health values for that damage type
			if (type2) {
				hpSource = game.settings.get("token-health", "hpSource2");
				maxSource = game.settings.get("token-health", "hpSourceMax2");
				altMaxSource = game.settings.get("token-health", "altHpSourceMax2");
				tempSource = game.settings.get("token-health", "tempHpSource2"); // Handle temp hp if any
			}

			// Get the health, max-health, and temp-health for this damage subtype
			const hp = foundry.utils.getProperty(data, hpSource);
			let max = foundry.utils.getProperty(data, maxSource);
			const altMax = foundry.utils.getProperty(data, altMaxSource);
			if (altMax !== undefined) {
				max += altMax;
			}
			const temp = foundry.utils.getProperty(data, tempSource);

			if (dAdd) {
				koThreshold = max; // In an additive damage system koThreshold = max health for this damage type
				deathThreshold = max; // In an additive damage system deathThreshold = max health for this damage type
			}

			let isUnconscious = false;
			let isDying = false;

			// Conditions are applied to tokens, not actors
			isUnconscious = await this.checkCondition(actor, "unconscious");
			isDying = await this.checkCondition(actor, "dying");

			// Default to full damage applied
			let dapplied = damage;

			// Handle damage mitigation if allowed
			let mit1 = 0;
			let mit2 = 0;
			let mit3 = 0;
			let mit = 0;
			if (damageType !== "Penetrating") {
				// Get the mitigation attributed
				mit1 = foundry.utils.getProperty(data, game.settings.get("token-health", "mitigationSource1"));
				mit2 = foundry.utils.getProperty(data, game.settings.get("token-health", "mitigationSource2"));
				mit3 = foundry.utils.getProperty(data, game.settings.get("token-health", "mitigationSource3"));

				// Mitigation is only applied to damange, and not healing
				if (damage > 0) {
					if (mit1 !== undefined) {
						mit = mit + mit1;
					}
					if (mit2 !== undefined && damageType === "Impact") {
						// AGE-System specific! Make general?
						mit = mit + mit2;
					}
					if (mit3 !== undefined && damageType === "Ballistic") {
						// AGE-System specific! Make General?
						mit = mit + mit3;
					}
					dapplied = Math.max(damage - mit, 0);
				}
			}

			let anounceGM = "";
			let anouncePlayer = "";
			if (dapplied > 0) {
				// Damage will be done
				// Compute damage capacity
				let damageCapacity = 0;
				if (dAdd) {
					damageCapacity = max - hp; // Max damage is the difference between max and hp
				} else {
					damageCapacity = hp; // Max damage is eual to hp
				}
				// Compute net effect (healing can't take the token above their max capacity)
				let netEffect = Math.min(dapplied, damageCapacity);

				if (dapplied > 1) {
					// multiple points of damage applied
					anouncePlayer = game.settings
						.get("token-health", "ouch")
						.replace("$DS", damageSubtype)
						.replace("$D", dapplied)
						.replace("$NE", netEffect);
					// anounceGM = dapplied + " " + TH_CONFIG.DAMAGE_POINTS + " (" + damageSubtype + ")";
					anounceGM = game.settings
						.get("token-health", "damagePoint")
						.replace("$DS", damageSubtype)
						.replace("$D", damage)
						.replace("$NE", netEffect);
				}
				if (dapplied === 1) {
					// One point of damage applied
					anouncePlayer = game.settings
						.get("token-health", "ouch")
						.replace("$DS", damageSubtype)
						.replace("$D", dapplied)
						.replace("$NE", netEffect);
					// anounceGM = TH_CONFIG.DAMAGE_POINT + " (" + damageSubtype + ")";
					anounceGM = game.settings
						.get("token-health", "damagePoint")
						.replace("$DS", damageSubtype)
						.replace("$D", damage)
						.replace("$NE", netEffect);
				}
			}
			if (dapplied === 0) {
				// No effective damage or healing applied
				anouncePlayer = game.settings.get("token-health", "meh");
				anounceGM = anouncePlayer;
			}
			if (dapplied < 0) {
				// Healing applied (negative damage done is healing)
				// Compute healing capacity
				let healingCapacity = 0;
				if (dAdd) {
					healingCapacity = hp; // Max healing is the current hp
				} else {
					healingCapacity = max - hp; // Max healing is the difference between max and hp
				}
				// Compute net effect (healing can't take the token above their max capacity)
				let netEffect = Math.min(-dapplied, healingCapacity);
				anouncePlayer = game.settings
					.get("token-health", "ty")
					.replace("$DS", damageSubtype)
					.replace("$D", -dapplied)
					.replace("$NE", netEffect);
				if (dapplied === -1 || healingCapacity === 1) {
					// anounceGM = TH_CONFIG.HEALING_POINT + " (" + damageSubtype + ")";
					anounceGM = game.settings
						.get("token-health", "healingPoint")
						.replace("$DS", damageSubtype)
						.replace("$D", -dapplied)
						.replace("$NE", netEffect);
				} else if (dapplied < -1 && healingCapacity > 1) {
					// anounceGM = Math.min(-dapplied, healingCapacity) + " " + TH_CONFIG.HEALING_POINTS + " (" + damageSubtype + ")";
					anounceGM = game.settings
						.get("token-health", "healingPoints")
						.replace("$DS", damageSubtype)
						.replace("$D", -dapplied)
						.replace("$NE", netEffect);
				} else {
					anouncePlayer = game.settings.get("token-health", "meh");
					anounceGM = anouncePlayer;
				}
			}

			if (enableChat) {
				ChatMessage.create({ content: anouncePlayer, speaker: ChatMessage.getSpeaker({ actor: actor }) });
				ChatMessage.create({
					content: anounceGM,
					speaker: ChatMessage.getSpeaker({ actor: actor }),
					whisper: ChatMessage.getWhisperRecipients("GM"),
				});
			}
			const [newHP, newTempHP] = this.getNewHP(hp, max, temp, df * dapplied, {
				allowNegative: game.settings.get("token-health", "allowNegative"),
			});

			// Deal with all cases that could result in Injured/Wounded/Dying conditions
			let damageCapacity = 0;
			if (dAdd) {
				damageCapacity = deathThreshold - hp;
			} else {
				damageCapacity = hp - deathThreshold;
			}

			if (damageSubtype === "stun") {
				if (dapplied >= damageCapacity) {
					// Set KO State
					isUnconscious = true;
					// actor.setFlag("world", "unconscious", isUnconscious);
					// Announce KO State
					anouncePlayer = game.settings.get("token-health", "unconscious");
					if (enableChat) {
						ChatMessage.create({
							content: anouncePlayer,
							speaker: ChatMessage.getSpeaker({ actor: actor }),
						});
					}
				}
			} else if (dapplied > damageCapacity) {
				if (allowDamageBuyoff) {
					// call ageDamageBuyoff to handle any excess damage
					this.ageDamageBuyoff(actor, dapplied - damageCapacity);
				} else {
					// They're going down!
					this.ageNoDamageBuyoff(actor, dapplied - damageCapacity);
				}
			} else if (dapplied >= damageCapacity) {
				if (allowDamageBuyoff) {
					// Nothing to do!
				} else {
					// Set KO State
					isUnconscious = true;
					// actor.setFlag("world", "unconscious", isUnconscious);
					// Announce KO State
					anouncePlayer = game.settings.get("token-health", "unconscious");
					if (enableChat) {
						ChatMessage.create({
							content: anouncePlayer,
							speaker: ChatMessage.getSpeaker({ actor: actor }),
						});
					}
				}
			}

			// If healing was applied
			if (dapplied < 0) {
				if (dAdd) {
					// If charcater was unconcious and this raises HP above koThreshold
					if (newHP > koThreshold && isUnconscious) isUnconscious = false;
					// If charcater was dying and this raises HP above deathThreshold
					if (newHP > deathThreshold && isDying) isDying = false;
				} else {
					// If charcater was unconcious and this lowers HP below koThreshold
					if (newHP < koThreshold && isUnconscious) isUnconscious = false;
					// If charcater was dying and this lowers HP below deathThreshold
					if (newHP < deathThreshold && isDying) isDying = false;
				}

				// Update flags and conditions]
				// actor.setFlag("world", "injured", isInjured);
				// actor.setFlag("world", "wounded", isWounded);
				// actor.setFlag("world", "unconscious", isUnconscious);
				// actor.setFlag("world", "dying", isDying);

				if (enableConditions) {
					// Control automatic vs. manual setting of conditions
					await this.removeCondition(actor, "dying");
					await this.removeCondition(actor, "helpless");
					await this.removeCondition(actor, "unconscious");
				}
			} else if (enableConditions) {
				// Control automatic vs. manual setting of conditions
				if (isUnconscious) {
					await this.applyCondition(actor, "helpless");
					await this.applyCondition(actor, "unconscious");
				} else {
					await this.removeCondition(actor, "helpless");
					await this.removeCondition(actor, "unconscious");
				}
			}

			let updates = {};

			// Handle for Shield
			if (game.system.id === "pf2e" && (damageTypeConfig?.source ?? "") === "attributes.shield.hp.value") {
				const { attributes } = actor;
				const actorShield = "shield" in attributes ? attributes.shield : null;
				const shield = (() => {
					const item = actor.items.get(actorShield?.itemId ?? "");
					return item?.isOfType("shield") ? item : null;
				})();
				if (shield) {
					await shield.update({ "system.hp.value": newHP });
				}
			}

			if (temp !== undefined) {
				updates = {
					_id: actor.id,
					isToken: actor.isToken,
					[`system.${hpSource || "attributes.hp.value"}`]: newHP,
					[`system.${tempSource || "attributes.hp.temp"}`]: newTempHP,
				};
			} else {
				updates = {
					_id: actor.id,
					isToken: actor.isToken,
					[`system.${hpSource || "attributes.hp.value"}`]: newHP,
				};
			}

			// tidx++
			// Prepare the update
			return actor.update(updates);
		});

		return Promise.all(promises);
	}

	async checkCondition(thisActor, condId) {
		// Check the Token Health relevant condition for this actor and return boolean to indicate status

		let condStatus = false;

		// Behavior depends on system
		if (game.system.id === "age-system") {
			thisActor.effects.forEach((e) => {
				const isCondition = e.flags?.["age-system"]?.isCondition;
				const isId = e.flags?.core?.statusId === condId;
				if (isCondition && isId) condStatus = true;
			});
		} else if (thisActor.getFlag("world", condId) === undefined) {
			// If the flag isn't present then set it to false
			thisActor.setFlag("world", condId, condStatus);
		} else condStatus = thisActor.getFlag("world", condId);

		return condStatus;
	}

	/**
	 * Apply a condition (AGE System Dependent)
	 *
	 * @param {actor} thisActor
	 * @param {string} condId
	 * @returns {actor} thisActor
	 */
	async applyCondition(thisActor, condId) {
		// Set the Token Health relevant condition for this actor

		// Behavior depends on system
		if (game.system.id === "age-system") {
			// For AGE System, Token Health relevant conditions are maintained as Active Effects
			const condArr = thisActor.effects.filter(
				(e) => e.flags?.["age-system"]?.isCondition && e.flags?.core?.statusId === condId
			); // creates an array with the active effects with the condId
			if (condArr.length < 1) {
				// if the array is empty, creates a new Active Effect
				const newEffect = CONFIG.statusEffects.filter((e) => e.id === condId)[0]; // search for condId inside statusEffects array
				newEffect["flags.core.statusId"] = newEffect.id; // this is not really necessary, but I opted to keep like this so all Active Effects generated for conditions (no matter how they are generated) will have the same set of flags
				return thisActor.createEmbeddedDocuments("ActiveEffect", [newEffect]);
			}
		} else {
			// For all other systems Token Health conditions are maintained as world-readable flags for the actor

			// Set this condition to true (this also creates the flag if needed)
			thisActor.setFlag("world", condId, true);
		}
	}

	/**
	 * Remove a condition (AGE System dependent)
	 *
	 * @param {actor} thisActor
	 * @param {string} condId
	 */
	async removeCondition(thisActor, condId) {
		// Clear a Token Health relevant condition for this actor

		// Behavior depends on system
		if (game.system.id === "age-system") {
			// Token Health relevant conditions are maintained in age-system as Active Effects

			let remove = [];
			thisActor.effects.forEach((e) => {
				const isCondition = !!e.flags?.["age-system"]?.isCondition;
				const isId = e.flags?.core?.statusId === condId;
				if (isCondition && isId) remove.push(e._id);
			});
			await thisActor.deleteEmbeddedDocuments("ActiveEffect", remove); // vkdolea changed this line
		} else {
			// For all other systems Token Health conditions are maintained as world-readable flags for the actor

			// Set this condition to false (this also creates the flag if needed)
			thisActor.setFlag("world", condId, false);
		}
	}

	/**
	 * Apply spillover damage (AGE system specific)
	 *
	 * @param {actor} thisActor The actor being to apply conditions to
	 * @param {number} dRemaining the damage remaing to be accounted for
	 */
	async ageDamageBuyoff(thisActor, dRemaining) {
		let abilities;
		// let speed;
		let origin;
		let flavor1 = game.settings.get("token-health", "injured");
		let flavor2 = game.settings.get("token-health", "wounded");
		let flavor3 = game.settings.get("token-health", "dying");
		let flavor4 = game.settings.get("token-health", "dead");
		let isExhausted = false;
		let isFatigued = false;
		let isInjured = false;
		let isWounded = false;
		let isDying = false;
		let isProne = false;
		let isFreefalling = false;
		let isHelpless = false;
		// let speedMod      = 0;
		// let speedTotal    = 0;

		// let thisActor = game.actors.get(thisToken.document.actorId);
		// Get the control paramater for enabling/disabling token chat
		const enableChat = game.settings.get("token-health", "enableChat");

		// Get the control parameter for enablibng/disabling the application of token condtions
		let enableConditions = game.settings.get("token-health", "enableConditions");
		// Temporary setting to prevent issues in 0.8.6
		// enableConditions = false;

		if (game.system.id === "age-system") {
			abilities = thisActor.system.abilities;
			origin = thisActor.system.ancestry;

			// Get the AGE-specific conditions and attributes needed
			// This allows other mods and macros to override this mod
			isFatigued = await this.checkCondition(thisActor, "fatigued");
			isExhausted = await this.checkCondition(thisActor, "exhausted");
			isInjured = await this.checkCondition(thisActor, "injured");
			isWounded = await this.checkCondition(thisActor, "wounded");
			isDying = await this.checkCondition(thisActor, "dying");
			isProne = await this.checkCondition(thisActor, "prone");
			isFreefalling = await this.checkCondition(thisActor, "freefalling");
			isHelpless = await this.checkCondition(thisActor, "helpless");

			// Make sure this actor has their baseConValue recorded as a flag
			if (thisActor.getFlag("world", "baseConValue") === undefined) {
				thisActor.setFlag("world", "baseConValue", abilities.cons.value);
			} else if (abilities.cons.value > thisActor.getFlag("world", "baseConValue")) {
				thisActor.setFlag("world", "baseConValue", abilities.cons.value);
			}

			// If the character is a Belter, switch flavor to Lang Belta
			if (origin === "Belter") {
				flavor1 = "Ouch! Deting hurt!"; // English: "Ouch! That hurt!"
				flavor2 = "Kaka felota! Deting REALLY hurt!"; // English: "Shit! That really hurt!"
				flavor3 = "Oyedeng. Tim fo wok wit da stars!"; // English: "Goodbye. Time to walk with the stars!"
				flavor4 = "Oye! na du beat wa det horse!"; // English: "Hey! Don't beat a dead horse!""
			}
		}

		// Get this speaker
		const this_speaker = ChatMessage.getSpeaker({ actor: thisActor });

		// If the dying condition is currently set
		if (isDying) {
			// The case in which more damage is pointless
			// More damage to a dead guy is senseless
			if (enableChat) ChatMessage.create({ speaker: this_speaker, content: flavor4 }); // Hey! Don't beat a dead horse!
		} else if (isWounded) {
			// Damage being applied to a wounded character
			// Set the dying state flag
			isDying = true;
			// thisActor.setFlag("world", "dying", isDying);

			// If not freefalling, then character will also be prone
			if (!isFreefalling) isProne = true;

			// If this is an AGE System game
			// if (game.system.id === 'age-system') {
			if (enableConditions) {
				// Control automatic vs. manual setting of conditions
				// Set the dying condition
				// Dying characters are also unconscious, and helpless
				// Helpless characters can't move.
				await this.applyCondition(thisActor, "dying");
				await this.applyCondition(thisActor, "unconscious");
				await this.applyCondition(thisActor, "helpless");
				if (isProne) await this.applyCondition(thisActor, "prone");
				else await this.removeCondition(thisActor, "prone");
			}
			// }
			if (enableChat) ChatMessage.create({ speaker: this_speaker, content: flavor3 }); // Good by cruel world!
		} else if (isInjured) {
			// Damage being applied to a injured character
			// Set the wounded state flag
			isWounded = true;
			// thisActor.setFlag("world", "wounded", isWounded);

			// Buy off 1d6 damage when taking the wounded condition
			let roll1 = await new Roll("1d6").roll({ async: true });
			// Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false to
			// evaluation options to nominate your preferred behavior.

			// Announce the roll
			roll1.toMessage({ speaker: { alias: this_speaker.alias }, flavor: flavor2 });

			// If this is an AGE System game
			// if (game.system.id === 'age-system') {
			// Configure conditions: Add the exhausted condition,
			//    if already exhausted then helpless
			if (isExhausted) {
				isHelpless = true;
				// speedMod = -speed.total;
				// speedTotal = 0;
			} else {
				isExhausted = true;
				// speedMod = -Math.ceil(speed.base/2);
				// speedTotal = speed.total + speedMod;
			}

			if (enableConditions) {
				// Control automatic vs. manual setting of conditions
				// Set the wounded condition
				await this.applyCondition(thisActor, "wounded");
				if (isExhausted) await this.applyCondition(thisActor, "exhausted");
				else await this.removeCondition(thisActor, "exhausted");
				if (isHelpless) await this.applyCondition(thisActor, "helpless");
				else await this.removeCondition(thisActor, "helpless");
			}
			// }

			if (roll1._total < dRemaining) {
				// out of options, advance to dying
				// Set the dying state flag
				isDying = true;
				// thisActor.setFlag("world", "dying", isDying);

				// Character is wounded but has more damage to account for, so now they're dying!
				// If not freefalling, then character will also be prone
				if (!isFreefalling) isProne = true;

				// If this is an AGE System game
				if (enableConditions) {
					// Control automatic vs. manual setting of conditions
					// Set the dying condition
					// Dying characters are also unconscious, and helpless

					await this.applyCondition(thisActor, "dying");
					await this.applyCondition(thisActor, "unconscious");
					await this.applyCondition(thisActor, "helpless");
					if (isProne) await this.applyCondition(thisActor, "prone");
					// else await this.removeCondition(thisActor, "prone"); don't remove Prone - they might be that way voluntarily
				}
				if (enableChat) ChatMessage.create({ speaker: this_speaker, content: flavor3 }); // Good by cruel world!
			}
		} else {
			// Damage being applied to an uninjured character
			// Set the injured state flag
			isInjured = true;
			// thisActor.setFlag("world", "injured", isInjured);

			// Buy off 1d6 damage when taking the injured condition
			let roll1 = await new Roll("1d6").roll({ async: true });
			// Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false to
			// evaluation options to nominate your preferred behavior.

			// Announce the roll
			roll1.toMessage({ speaker: { alias: this_speaker.alias }, flavor: flavor1 });

			// If this is an AGE System game
			if (enableConditions) {
				// Control automatic vs. manual setting of conditions
				// Configure conditions: Add the fatigued condition,
				//    if already fatigued then exhausted,
				//    if already exhausted then helpless
				if (isExhausted) {
					isHelpless = true;
					// speedMod = -speed.total;
					// speedTotal = 0;
				} else if (isFatigued) {
					isExhausted = true;
					// speedMod = -Math.ceil(speed.base/2);
					// speedTotal = speed.total + speedMod;
				} else isFatigued = true;

				// Set the conditions
				await this.applyCondition(thisActor, "injured");
				if (isFatigued) await this.applyCondition(thisActor, "fatigued");
				else await this.removeCondition(thisActor, "fatigued");
				if (isExhausted) await this.applyCondition(thisActor, "exhausted");
				else await this.removeCondition(thisActor, "exhausted");
				if (isProne) await this.applyCondition(thisActor, "helpless");
				else await this.removeCondition(thisActor, "helpless");
			}

			if (roll1._total < dRemaining) {
				// Set the wounded state flag
				isWounded = true;
				// thisActor.setFlag("world", "wounded", isWounded);

				// Buy off 1d6 damage when taking the wounded condition
				let roll2 = await new Roll("1d6").roll({ async: true });
				// Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false to
				// evaluation options to nominate your preferred behavior.

				// Announce the roll
				roll2.toMessage({ speaker: { alias: this_speaker.alias }, flavor: flavor2 });

				// If this is an AGE System game
				if (enableConditions) {
					// Control automatic vs. manual setting of conditions
					// Configure conditions: Add the exhausted condition,
					//    if already exhausted then helpless
					if (isExhausted) {
						isHelpless = true;
						// speedMod = -speed.total;
						// speedTotal = 0;
					} else {
						isExhausted = true;
						// speedMod = -Math.ceil(speed.base/2);
						// speedTotal = speed.total + speedMod;
					}

					// Set the conditions

					await this.applyCondition(thisActor, "wounded");
					if (isExhausted) await this.applyCondition(thisActor, "exhausted");
					else await this.removeCondition(thisActor, "exhausted");
					if (isHelpless) await this.applyCondition(thisActor, "helpless");
					else await this.removeCondition(thisActor, "helpless");
				}
				if (roll1._total + roll2._total < dRemaining) {
					// Character is wounded but has more damage to account for, so now they're dying!
					// Set the dying state flag
					isDying = true;
					// thisActor.setFlag("world", "dying", isDying);

					// If not freefalling, then character will also be prone
					if (!isFreefalling) isProne = true;

					// If this is an AGE System game

					if (enableConditions) {
						// Control automatic vs. manual setting of conditions
						// Set the dying condition
						// Dying characters are also unconscious, and helpless

						await this.applyCondition(thisActor, "dying");
						await this.applyCondition(thisActor, "unconscious");
						await this.applyCondition(thisActor, "helpless");
						if (isProne) await this.applyCondition(thisActor, "prone");
						else await this.removeCondition(thisActor, "prone");
					}
					if (enableChat) ChatMessage.create({ speaker: this_speaker, content: flavor3 }); // Good by cruel world!
				}
			}
		}
	}

	/**
	 * Deal with dying - no damage buyoff
	 *
	 * @param {actor} thisActor The actor being to apply conditions to
	 *
	 */
	async ageNoDamageBuyoff(thisActor) {
		let abilities;
		let origin;
		let flavor3 = game.settings.get("token-health", "dying");
		let flavor4 = game.settings.get("token-health", "dead");

		let isDying = false;
		let isProne = false;
		let isFreefalling = false;

		// Get the control paramater for enabling/disabling token chat
		const enableChat = game.settings.get("token-health", "enableChat");

		// Get the control paramater for enabling/disabling token chat
		let enableConditions = game.settings.get("token-health", "enableConditions");
		// Temporary setting to prevent issues in 0.8.6
		// enableConditions = false;

		// let thisActor = game.actors.get(thisToken.document.actorId);

		// Get the AGE-specific conditions and attributes needed
		// This allows other mods and macros to override this mod
		isDying = await this.checkCondition(thisActor, "dying");
		isProne = await this.checkCondition(thisActor, "prone");
		isFreefalling = await this.checkCondition(thisActor, "freefalling");

		if (game.system.id === "age-system") {
			abilities = thisActor.system.abilities;
			origin = thisActor.system.ancestry;

			// Get the AGE-specific conditions and attributes needed
			// This allows other mods and macros to override this mod
			isDying = await this.checkCondition(thisActor, "dying");
			isProne = await this.checkCondition(thisActor, "prone");
			isFreefalling = await this.checkCondition(thisActor, "freefalling");

			// Make sure this actor has their baseConValue recorded as a flag
			if (thisActor.getFlag("world", "baseConValue") === undefined) {
				thisActor.setFlag("world", "baseConValue", abilities.cons.value);
			} else if (abilities.cons.value > thisActor.getFlag("world", "baseConValue")) {
				thisActor.setFlag("world", "baseConValue", abilities.cons.value);
			}
			if (origin === "Belter") {
				// flavor1 = "Ouch! Deting hurt!";                // English: "Ouch! That hurt!"
				// flavor2 = "Kaka felota! Deting REALLY hurt!";  // English: "Shit! That really hurt!"
				flavor3 = "Oyedeng. Tim fo wok wit da stars!"; // English: "Goodbye. Time to walk with the stars!"
				flavor4 = "Oye! na du beat wa det horse!"; // English: "Hey! Don't beat a dead horse!""
			}
		}

		// Get this speaker
		const this_speaker = ChatMessage.getSpeaker({ actor: thisActor });

		// If the dying condition is currently set
		if (isDying) {
			// More damage to a dead guy is senseless
			if (enableChat) ChatMessage.create({ speaker: this_speaker, content: flavor4 }); // Hey! Don't beat a dead horse!
		} else {
			// If not freefalling, then character will also be prone
			if (!isFreefalling) isProne = true;

			// Set the dying state flag
			isDying = true;
			// thisActor.setFlag("world", "dying", isDying);

			// If this is an AGE System game
			if (enableConditions) {
				// Control automatic vs. manual setting of conditions
				// Set the dying condition
				// Dying characters are also unconscious, and helpless
				// Helpless characters can't move.
				await this.applyCondition(thisActor, "dying");
				await this.applyCondition(thisActor, "unconscious");
				await this.applyCondition(thisActor, "helpless");
				if (isProne) await this.applyCondition(thisActor, "prone");
				// else await this.removeCondition(thisActor, "prone");
			}
			if (enableChat) ChatMessage.create({ speaker: this_speaker, content: flavor3 }); // Good by cruel world!
		}
	}

	/**
	 * Get the new HP value
	 * @param {number} currentHP - Current HP value
	 * @param {number} maxHP - Max HP value
	 * @param {number} tempHP - Current Temp HP value
	 * @param {number} value - Value to apply (can be positive or negative)
	 * @param {object} [options]
	 * @param {boolean} [options.allowNegative] - Can the return HP value be negative?
	 * @returns {[number, number]} - HP value and Temp HP value
	 */
	getNewHP(currentHP, maxHP, tempHP, value, options = {}) {
		if (tempHP === undefined) {
			// Get new HP value after applying damage
			let tmpHP = currentHP - value;

			// Make sure to return a negative number if allowed
			if (!options.allowNegative) tmpHP = Math.max(tmpHP, 0);

			// Make sure the hp value is less than max
			const hp = Math.min(tmpHP, maxHP);

			return [hp, tempHP];
		}
		// Store the temp HP value
		const tmp = Number(tempHP) ?? 0;

		// Calculate value to apply on temp only
		const dt = value > 0 ? Math.min(tmp, value) : 0;

		// Apply value to temp
		const temp = tmp - dt;

		// Get new HP value after applying some of it to temp
		let tmpHP = currentHP - (value - dt);

		// Make sure to return a negative number if allowed
		if (!options.allowNegative) tmpHP = Math.max(tmpHP, 0);

		// Make sure the hp value is less than max
		const hp = Math.min(tmpHP, maxHP);
		return [hp, temp];
	}
}
