import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { SupabaseThumbnail } from "./SupabaseThumbnail";
import { CodeEditorChaos } from "./CodeEditorChaos";
import { ZeroRevenue } from "./ZeroRevenue";
import { WillingToPay } from "./WillingToPay";
import { ClaudeSupabaseIntro } from "./ClaudeSupabaseIntro";
import { V0SupabaseIntro } from "./V0SupabaseIntro";
import { ExplainAnalyzeTerminal } from "./ExplainAnalyzeTerminal";
import { AIQueryToProduction } from "./AIQueryToProduction";
import { SelfJoinExplosion } from "./SelfJoinExplosion";
import { TableBreakdown } from "./TableBreakdown";
import { SupabaseHiring } from "./SupabaseHiring";
import { SupabaseStorageFull } from "./SupabaseStorageFull";
import { StorageNotTheProblem } from "./StorageNotTheProblem";
import { ProTierCovered } from "./ProTierCovered";
import { SupabaseCursorPlugin } from "./SupabaseCursorPlugin";
import { SupabaseCursorPluginH } from "./SupabaseCursorPluginH";
import { StorageWorkflow } from "./StorageWorkflow";
import { RawImageStorage } from "./RawImageStorage";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="SupabaseThumbnail"
        component={SupabaseThumbnail}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CodeEditorChaos"
        component={CodeEditorChaos}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ZeroRevenue"
        component={ZeroRevenue}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WillingToPay"
        component={WillingToPay}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ClaudeSupabaseIntro"
        component={ClaudeSupabaseIntro}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="V0SupabaseIntro"
        component={V0SupabaseIntro}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ExplainAnalyzeTerminal"
        component={ExplainAnalyzeTerminal}
        durationInFrames={200}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AIQueryToProduction"
        component={AIQueryToProduction}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SelfJoinExplosion"
        component={SelfJoinExplosion}
        durationInFrames={200}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TableBreakdown"
        component={TableBreakdown}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SupabaseHiring"
        component={SupabaseHiring}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SupabaseStorageFull"
        component={SupabaseStorageFull}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StorageNotTheProblem"
        component={StorageNotTheProblem}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ProTierCovered"
        component={ProTierCovered}
        durationInFrames={290}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SupabaseCursorPlugin"
        component={SupabaseCursorPlugin}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="SupabaseCursorPluginH"
        component={SupabaseCursorPluginH}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StorageWorkflow"
        component={StorageWorkflow}
        durationInFrames={320}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="RawImageStorage"
        component={RawImageStorage}
        durationInFrames={320}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
