import { registerSettings } from "./settings.js";
import { TokenHealthDialog } from "./token-health-dialog.js";

Hooks.once("i18nInit", async function () {
	registerSettings();
	game.keybindings.register("token-health", "damageSelectedTokens", {
		hint: "TOKEN_HEALTH.toggleKeyHint",
		name: "TOKEN_HEALTH.toggleKeyName",
		editable: [
			{
				key: "Enter",
			},
		],
		onDown: ({ event, isAlt: isTarget }) => {
			// Cull the array of targeted/selected tokens to only include those owned by the user
			const allTokens = isTarget ? Array.from(game.user.targets) : canvas.tokens.controlled;
			if (!allTokens.length) return;
			const tokens = allTokens.filter((t) => t.isOwner);
			if (tokens.some((t) => t.hasActiveHUD)) return;
			event.preventDefault();

			// If there are no owned tokens then no need to launch the dialog
			if (!tokens.length) return ui.notifications.info(game.i18n.localize("TOKEN_HEALTH.accessMsg"));

			new TokenHealthDialog({
				isDamage: true,
				isTarget,
				tokens,
			}).render(true);
		},
		restricted: game.settings.get("token-health", "restrictPlayerLaunch"),
		reservedModifiers: ["Alt"],
	});
});
