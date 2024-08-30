"use client";

import { modifyLyrics } from "@/actions/sanity";
import { useState } from "react";
import { LyricType } from "@/lib/sanity";

export default function DisplayLyrics({ song, songId }: { song: LyricType, songId: string }) {
  const [edit, setEdit] = useState(false);
  const [lyrics, setLyrics] = useState(song.lyrics);

  return <div className={"justify-center items-center flex flex-col my-4"}>
    <h1 className={"flex text-lg tracking-widest font-bold text-rosePine-text"}>{song.artist} - {song.title}</h1>
    {!edit &&
      <div className={"text-rosePine-text mt-4 mx-4 whitespace-pre-line"}>
        {lyrics || "No lyrics found"}
      </div>
    }
    {edit &&
      <div className="flew flex-col">
        <textarea
          value={lyrics ?? ""}
          onChange={(e) => setLyrics(e.target.value)}
          cols={50}
          rows={30}
        />
        <div>
          <button
            className={"mx-auto bg-rosePine-gold text-rosePine-base rounded-md p-1 px-2 mt-2"}
            onClick={async () => {
              await modifyLyrics(songId, lyrics);
              setEdit(false)
            }}>Save</button>
        </div>
      </div>
    }
    <button
      className={"mx-auto bg-rosePine-rose text-rosePine-base rounded-md p-1 px-2 mt-2"}
      onClick={() => setEdit(!edit)}>{edit ? "Cancel" : "Edit"}</button>
  </div >
}
