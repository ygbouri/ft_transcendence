import { useEffect } from "react";
import { allRanks } from "../config/baseURL";
import rank4 from "../public/Tiers/rank4.svg";
import rank3 from "../public/Tiers/rank3.svg";
import rank2 from "../public/Tiers/rank2.svg";
import rank1 from "../public/Tiers/rank1.svg";
import rank0 from "../public/Tiers/rank0.svg";
import { rankObj } from "../Types/dataTypes";

export function useOutsideAlerter(ref: any, setToggle: (t: boolean) => void) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) setToggle(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export function getRankUser(GamePoint: number): rankObj {
  if (GamePoint <= 45) return { rank: allRanks[4], tier: rank4 };
  else if (GamePoint <= 95) return { rank: allRanks[3], tier: rank3 };
  else if (GamePoint <= 200) return { rank: allRanks[2], tier: rank2 };
  else if (GamePoint < 350) return { rank: allRanks[1], tier: rank1 };
  else if (GamePoint >= 600) return { rank: allRanks[0], tier: rank0 };
  else return { rank: allRanks[4], tier: rank4 };
}

export function getImageBySize(path: string, size: number) {
  if (
    !path ||
    path.includes("cdn.intra.42.fr") ||
    path.includes("https://source.boringavatars.com") ||
    path.includes("https://api.dicebear.com")
  )
    return path;
  const tmppath = path.substring(0, path.lastIndexOf("."));
  const extenstion = path.substring(path.lastIndexOf("."), path.length);
  const newPath = tmppath + "x" + size + extenstion;
  return newPath;
}

export function eraseCookie(name: string) {
  document.cookie = name + "=; Max-Age=0;";
}

export async function validation(name: string, setError: any) {
  if (!name) setError("NickName is Required");
  else if (
    !/^(?=.{4,25}$)(?![ _.-])(?!.*[_.-]{2})[a-zA-Z0-9 ._-]+(?<![ _.-])$/g.test(
      name
    )
  )
    setError("Invalid NickName");
  else return false;
  return true;
}

export function runTimer(ref_elm: any) {
  let start = 4;
  return setInterval(() => {
    start -= 1;
    ref_elm.innerText = start.toString();
  }, 1000);
}
