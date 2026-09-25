import { RegionCellRef } from "../regionIndex/regionIndexManager";
import { MovementBehaviour } from "../settings/enableGrid";
import { CellRef } from "../wallIndex/wallIndexManager";

declare module "fvtt-types/configuration" {
	interface FlagConfig {
		Actor: {
			"aeris-tokens": {
				distanceMoved: number;
			};
		};
	}

	namespace Hooks {
		interface HookConfig {
			"socketlib.ready": () => void;

			/** Hook to override travel sound effect per grid type */
			"aeris-tokens.getGridTravelSoundOverride": (
				actor: Actor | undefined,
				mode: string | undefined,
				index: number | undefined,
				unvalidated: unknown[]
			) => void;

			/** Hook to override movement value */
			"aeris-tokens.preGetMovementValue": (
				actor: Actor,
				apiOverride: UnvalidatedMovementRange[],
				mode: MovementMode
			) => void;

			/** Called to reset movement tracking for an actor */
			"aeris-tokens.resetMovement": (actor: Actor) => void;

			"aeris-tokens.getMovementModes": (
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
		"aeris-tokens.moduleFunctionalityScopeOutOfCombat": MovementBehaviour;
		"aeris-tokens.moduleFunctionalityScopeInCombat": MovementBehaviour;

		"aeris-tokens.uncapExploration": boolean;

		"aeris-tokens.movementDataPathSetting": string;
		"aeris-tokens.flyMovementDataPathSetting": string;
		"aeris-tokens.extendedMovementDataPathSetting": string;
		"aeris-tokens.cameraPanPadding": number;
		"aeris-tokens.moveCameraOnHold": boolean;
		"aeris-tokens.enableGridPainting": boolean;

		"aeris-tokens.gridActivePathColor": string;
		"aeris-tokens.gridAvailableTilesColor": string;
		"aeris-tokens.gridBonusTilesColor": string;
		"aeris-tokens.gridInvalidTilesColor": string;
		"aeris-tokens.gridUnreachableTilesColor": string;

		"aeris-tokens.gridStrokeColor": string;
		"aeris-tokens.gridAccentColor": string;
		"aeris-tokens.gridTextColor": string;
		"aeris-tokens.showOthersGridPaths": boolean;
		"aeris-tokens.othersGridAlphaMultiplier": number;

		// Audio
		"aeris-tokens.gridSelectSound": string;
		"aeris-tokens.enableGridSelectSound": boolean;
		"aeris-tokens.gridTravelSound": string;
		"aeris-tokens.enableGridTravelSound": boolean;

		"aeris-tokens.enableDistanceLabelToken": boolean;

		"aeris-tokens.fontImport": string;
		"aeris-tokens.fontFamily": string;
		"aeris-tokens.movementMultiplier": number;
		"aeris-tokens.baseMovementOverride": number;

		"aeris-tokens.scaleJumpFactor": number;
		"aeris-tokens.tokenMoveSpeed": number;

		"core.gridDiagonals": CONST.GRID_DIAGONALS;

		"aeris-tokens.allowPathBeyondRange": boolean;

		"aeris-tokens.enableCombatMovementHistory": boolean;

		"core.tokenAutoRotate": boolean;
		"aeris-tokens.autoPath": boolean;

		"aeris-tokens.enableOthersPreview": boolean;
	}
	interface Storage {
		"core.globalInterfaceVolume": number;

		//Audio
		"aeris-tokens.gridSelectSound": string;
		"aeris-tokens.enableGridSelectSound": boolean;
		"aeris-tokens.gridTravelSound": string;
		"aeris-tokens.enableGridTravelSound": boolean;

		"aeris-tokens.enableDistanceLabelToken": boolean;

		"aeris-tokens.movementMultiplier": number;
		"aeris-tokens.baseMovementOverride": number;

		"aeris-tokens.allowPathBeyondRange": boolean;
	}
	interface WorldSettings {
		"core.globalInterfaceVolume": number;

		//Audio
		"aeris-tokens.gridSelectSound": string;
		"aeris-tokens.enableGridSelectSound": boolean;
		"aeris-tokens.gridTravelSound": string;
		"aeris-tokens.enableGridTravelSound": boolean;

		"aeris-tokens.enableDistanceLabelToken": boolean;

		"aeris-tokens.movementMultiplier": number;
		"aeris-tokens.baseMovementOverride": number;
		"aeris-tokens.allowPathBeyondRange": boolean;
	}

	interface PlaceableObjectClassConfig {
		Token: typeof AerisToken;
	}
}

export {};
