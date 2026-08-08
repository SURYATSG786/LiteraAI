/** Persistent animated sky background (sun, clouds, rising bubbles).
 *  Rendered once at the app root so it shows behind every page. */
export default function SkyBackdrop() {
  return (
    <div className="sky-scene" aria-hidden="true">
      <div className="sky-sun" />
      <div className="sky-cloud sky-cloud-2" />
      <div className="sky-cloud sky-cloud-3" />
      <div className="sky-bubble sky-bubble-1" />
      <div className="sky-bubble sky-bubble-2" />
      <div className="sky-bubble sky-bubble-3" />
      <div className="sky-bubble sky-bubble-4" />
      <div className="sky-bubble sky-bubble-5" />
    </div>
  );
}
