import { registerAllowPathBeyondRangeSetting } from "./allowOutOfGrid";
import { registerAutoPathSetting } from "./autoPath";
import { registerCameraPanPaddingSetting } from "./cameraPadding";
import { registerMovementBehaviourSetting } from "./enableGrid";
import { registerEnableOthersPreviewSetting } from "./enableOthersPreview";
import { registerGridColorSettings } from "./gridColor";
import { registerEnableDistanceLabelSettings } from "./gridDistance";
import { registerEnableGridPaintingSetting } from "./gridRangeMap";
import { registerGridMovementSoundSetting } from "./gridSound";
import { registerScaleJumpFactorSetting } from "./jumpPercent";
import { registerMoveCameraOnHoldSetting } from "./moveCameraOnHold";
import { registerSmoothCameraMovementSettings } from "./smoothCameraMovement";
import { registerEnableCombatMovementHistorySetting } from "./movementHistory";
import { registerMovementMultiplier } from "./movementMultiplier";
import { registerMovementSpecificAnimationsSetting } from "./movementAnimations";
import { registerMovementDataPathSetting } from "./movementPropertyPath";
import { registerTokenMoveSpeedSetting } from "./tokenSpeed";
import { registerTokenHudAppearanceSettings } from "./tokenHudAppearance";
import { registerSystemIntegrationSettings } from "./systemIntegration";
import { registerUncapExplorationSetting } from "./uncapExploration";
import { registerWorldFont } from "./worldFont";

// TODO CLEAN UP SETTING CATEGORIES
export function registerSettings() {
	registerMovementBehaviourSetting();
	registerSystemIntegrationSettings();
	registerUncapExplorationSetting();
	registerMovementDataPathSetting();
	registerGridMovementSoundSetting();
	registerEnableDistanceLabelSettings();
	registerGridColorSettings();
	registerMovementMultiplier();
	registerScaleJumpFactorSetting();
	registerMovementSpecificAnimationsSetting();
	registerTokenMoveSpeedSetting();
	registerTokenHudAppearanceSettings();
	registerAllowPathBeyondRangeSetting();
	registerWorldFont();
	registerAutoPathSetting();
	registerMoveCameraOnHoldSetting();
	registerSmoothCameraMovementSettings();
	registerCameraPanPaddingSetting();
	registerEnableCombatMovementHistorySetting();
	registerEnableGridPaintingSetting();
	registerEnableOthersPreviewSetting();
}
