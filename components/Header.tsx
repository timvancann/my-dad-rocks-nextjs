export default function Header() {
  return (
    <header
      className={"top-0 sticky z-[999] flex border-b border-rosePine-muted/50 drop-shadow-lg w-full backdrop-blur-lg text-center justify-center py-3 gap-2"}>
      <ul className={"flex flex-row"}>
        <a href="/"
           className={"flex text-rosePine-text font-bold capitalize tracking-wide text-sm rounded-full px-2 py-1 hover:bg-rosePineDawn-foam"}>Home</a>
        <a href="/gigs"
           className={"flex text-rosePine-text font-bold capitalize tracking-wide text-sm rounded-full px-2 py-1 hover:bg-rosePineDawn-foam"}>Gigs</a>
      </ul>
    </header>
  );
}