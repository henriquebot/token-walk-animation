import { RegionCellRef } from "../regionIndex/regionIndexManager";
import { MovementBehaviour } from "../settings/enableGrid";
import { CellRef } from "../wallIndex/wallIndexManager";

declare module "fvtt-types/configuration" {
	interface FlagConfig {
		Token: {
			"token-walk-animation": {
				visualNovelAppearance?: {
					alternateSrc?: string;
					active?: boolean;
					baseSrc?: string;
					baseScaleX?: number;
					baseScaleY?: number;
					alternateScaleX?: number;
					alternateScaleY?: number;
				};
			};
		};
		Actor: {
			"token-walk-animation": {
				distanceMoved: number;
			};
			"aeris-tokens": {
				distanceMoved: number;
			};
		};
	}

	namespace Hooks {
		interface HookConfig {
			"socketlib.ready": () => void;

			/** Hook to override travel sound effect per grid type */
			"token-walk-animation.getGridTravelSoundOverride": (
				actor: Actor | undefined,
				mode: string | undefined,
				index: number | undefined,
				unvalidated: unknown[]
			) => void;

			/** Hook to override movement value */
			"token-walk-animation.preGetMovementValue": (
				actor: Actor,
				apiOverride: UnvalidatedMovementRange[],
				mode: MovementMode
			) => void;

			/** Called to reset movement tracking for an actor */
			"token-walk-animation.resetMovement": (actor: Actor) => void;

			"token-walk-animation.getMovementModes": (
				actor: Actor,
				unvalidated: unknown[]
			) => void;

			wallIndexBuilt: () => void;

			wallIndexUpdated: (refs: CellRef[]) => void;

			regionIndexBuilt: () => void;

			regionIndexUpdated: (refs: RegionCellRef[]) => void;
		}
	}

	interface SettingConfig {
		"token-walk-animation.moduleFunctionalityScopeOutOfCombat": MovementBehaviour;
		"token-walk-animation.moduleFunctionalityScopeInCombat": MovementBehaviour;

		"token-walk-animation.uncapExploration": boolean;

		"token-walk-animation.movementDataPathSetting": string;
		"token-walk-animation.flyMovementDataPathSetting": string;
		"token-walk-animation.extendedMovementDataPathSetting": string;
		"token-walk-animation.cameraPanPadding": number;
		"token-walk-animation.moveCameraOnHold": boolean;
		"token-walk-animation.enableGridPainting": boolean;

		"token-walk-animation.gridActivePathColor": string;
		"token-walk-animation.gridAvailableTilesColor": string;
		"token-walk-animation.gridBonusTilesColor": string;
		"token-walk-animation.gridInvalidTilesColor": string;
		"token-walk-animation.gridUnreachableTilesColor": string;

		"token-walk-animation.gridStrokeColor": string;
		"token-walk-animation.gridAccentColor": string;
		"token-walk-animation.gridTextColor": string;
		"token-walk-animation.showOthersGridPaths": boolean;
		"token-walk-animation.othersGridAlphaMultiplier": number;

		// Audio
		"token-walk-animation.gridSelectSound": string;
		"token-walk-animation.enableGridSelectSound": boolean;
		"token-walk-animation.gridTravelSound": string;
		"token-walk-animation.enableGridTravelSound": boolean;

		"token-walk-animation.enableDistanceLabelToken": boolean;

		"token-walk-animation.fontImport": string;
		"token-walk-animation.fontFamily": string;
		"token-walk-animation.movementMultiplier": number;
		"token-walk-animation.baseMovementOverride": number;

		"token-walk-animation.scaleJumpFactor": number;
		"token-walk-animation.tokenMoveSpeed": number;

		"core.gridDiagonals": CONST.GRID_DIAGONALS;

		"token-walk-animation.allowPathBeyondRange": boolean;

		"token-walk-animation.enableCombatMovementHistory": boolean;

		"core.tokenAutoRotate": boolean;
		"token-walk-animation.autoPath": boolean;

		"token-walk-animation.enableOthersPreview": boolean;
		"token-walk-animation.enableTokenHudAppearanceControls": boolean;
		"token-walk-animation.tokenArtScaleStep": number;
		"token-walk-animation.tokenArtMaxScale": number;
		"token-walk-animation.animateKeyboardMovement": boolean;
	}
	interface Storage {
		"core.globalInterfaceVolume": number;

		//Audio
		"token-walk-animation.gridSelectSound": string;
		"token-walk-animation.enableGridSelectSound": boolean;
		"token-walk-animation.gridTravelSound": string;
		"token-walk-animation.enableGridTravelSound": boolean;

		"token-walk-animation.enableDistanceLabelToken": boolean;

		"token-walk-animation.movementMultiplier": number;
		"token-walk-animation.baseMovementOverride": number;

		"token-walk-animation.allowPathBeyondRange": boolean;
	}
	interface WorldSettings {
		"core.globalInterfaceVolume": number;

		//Audio
		"token-walk-animation.gridSelectSound": string;
		"token-walk-animation.enableGridSelectSound": boolean;
		"token-walk-animation.gridTravelSound": string;
		"token-walk-animation.enableGridTravelSound": boolean;

		"token-walk-animation.enableDistanceLabelToken": boolean;

		"token-walk-animation.movementMultiplier": number;
		"token-walk-animation.baseMovementOverride": number;
		"token-walk-animation.allowPathBeyondRange": boolean;
	}

	interface PlaceableObjectClassConfig {
		Token: typeof AerisToken;
	}
}

export {};
