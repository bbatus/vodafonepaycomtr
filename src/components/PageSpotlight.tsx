/**
 * Live parity: `widget_VpayOtherSpotlight` — the dark→red title banner at the
 * top of vodafonepay.com.tr/iletisim and /duyurular (17.09.2026, computed
 * styles):
 * - `max-w-[1030px] mx-auto lg:py-10`; on lg a 340px-tall stage whose slide
 *   (white) is 322px
 * - the banner is the live `footer-banner` SVG, rounded 12px, `cover`,
 *   anchored right-centre
 * - lg+: the title sits on it — VodafoneRegularBold 36/45 white, `my-20 mx-8
 *   max-w-md`; below lg the title moves under the banner on grey-100, bold
 *   30/36, centred, `my-[10px]`
 */
export function PageSpotlight({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-[1030px] subpixel-antialiased lg:py-10">
      <div className="flex w-full flex-col bg-white lg:h-[340px]">
        <div className="flex h-[322px] w-full shrink-0 flex-col justify-center rounded-[12px] bg-[url('/images/spotlight/page-banner.svg')] bg-cover bg-[position:right_center] bg-no-repeat">
          <div className="mx-8 my-20 hidden max-w-md flex-col gap-y-4 lg:flex">
            <h1 className="font-bold text-4xl leading-tight text-white [font-weight:400]">{title}</h1>
          </div>
        </div>
        <div className="flex w-full flex-col justify-center bg-gray-100 px-4 lg:hidden">
          <p className="my-[10px] text-center text-3xl leading-9 tracking-normal [font-weight:700]">{title}</p>
        </div>
      </div>
    </div>
  );
}
