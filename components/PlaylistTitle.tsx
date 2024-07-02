export const SongsTitle = ({
                             title
                           }: {
  title: string
}) => {
  return (
    <h1
      className={"flex text-left self-start uppercase tracking-widest font-light text-xl text-rosePine-gold m-2"}>{title}</h1>
  )
}
