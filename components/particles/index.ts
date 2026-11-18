export { ParticleStage, type ParticleStageProps } from "./ParticleStage"
export { GraphLabel, GraphLayoutSource, useGraphLayout, type GraphLabelProps } from "./GraphLabel"
export {
  StaticPortrait,
  StaticGraph,
  StaticHelix,
  StaticLeman,
  LemanLabels,
  LEMAN_LABELS,
  type StaticPortraitProps,
  type StaticLemanProps,
  type LemanLabelSpec,
  type StaticGraphProps,
  type StaticGraphNode,
  type StaticHelixProps,
} from "./static"
export {
  particleStore,
  useParticleState,
  useParticlesMode,
  useGraphNodeScreen,
  getGraphNodeScreen,
  setHoveredNode,
  setGraphFocus,
  setGraphLayout,
  registerGraphLabel,
  type ParticleState,
  type ParticleMode,
  type NodeScreen,
} from "./store"
// engine is intentionally NOT re-exported: it pulls in three and must stay behind a dynamic import
export type { ParticleAssets } from "./engine"
export {
  FORMATIONS,
  type FormationName,
  type GraphLayout,
  type GraphLayoutNode,
  type GraphLayoutEdge,
} from "@/lib/formations/types"
