import logo from "../public/promo/logo_transparent.png";

export default function Header() {
    return (
        <header
            className={"z-10 border-b border-rosePine-muted/50 drop-shadow-lg backdrop-blur-lg text-center justify-center py-3 gap-2 items-center"}>
            <div className={"flex flex-row justify-between items-center mx-auto px-8 max-w-xl"}>
                <a href="/"><img src={logo.src} alt={"logo"} className={"w-12 h-12"}/></a>
                <ul className={"flex flex-row"}>
                    <a href="/"
                       className={"flex text-rosePine-text font-bold capitalize tracking-wide text-sm rounded-full px-2 py-1 hover:bg-rosePineDawn-foam"}>Home</a>
                    <a href="/gigs"
                       className={"flex text-rosePine-text font-bold capitalize tracking-wide text-sm rounded-full px-2 py-1 hover:bg-rosePineDawn-foam"}>Gigs</a>
                    <a href="/videos"
                       className={"flex text-rosePine-text font-bold capitalize tracking-wide text-sm rounded-full px-2 py-1 hover:bg-rosePineDawn-foam"}>Videos</a>
                </ul>
            </div>
        </header>
    );
}