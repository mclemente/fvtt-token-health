/**
 * Extend Dialog class to force focus on the input
 */
export class TokenHealthDialog extends Dialog {
	static get defaultOptions() {
		return {
			...super.defaultOptions,
			classes: [
				"dialog",
				game.settings.get("token-health", "enableLeftHandMode")
					? "token-health-left-handed-mode"
					: "token-health-right-handed-mode",
			],
		};
	}

	activateListeners(html) {
		super.activateListeners(html);

		// Focus the input
		html.find('input[type="number"][name="damageSubtype"]').eq(0).focus();

		// Add a class to dialog-buttons to be able to style them without breaking other stuff :/
		html.addClass("token-health");

		// Update UI
		html.find('input[type="number"][name="damageSubtype"]').on("input", (event) => {
			if (!game.settings.get("token-health", "enableDynamicButtonText")) return;
			let healButton = html.closest(".dialog").find('.dialog-buttons button[data-button="heal"]');
			let damageButton = html.closest(".dialog").find('.dialog-buttons button[data-button="damage"]');
			let input1 = html.find('input[type="number"][name="damageSubtype"][data-type="0"]');
			let input2 = html.find('input[type="number"][name="damageSubtype"][data-type="1"]');

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
}
