import { achievementType } from "../Types/dataTypes";
import king from "../public/Achievements/King.svg";
import boss from "../public/Achievements/boss.svg";
import Fly_higher from "../public/Achievements/Fly_higher.svg";
import Invincible from "../public/Achievements/Invincible.svg";
import Welcome_winner from "../public/Achievements/Welcome_winner.svg";
import Thought_leader from "../public/Achievements/Thought_leader.svg";

export const AllAchievement: achievementType[] = [
  {
    id: 1,
    logo: Welcome_winner,
    title: "Superfan",
    disc: "your first win in the game",
  },
  {
    id: 2,
    logo: king,
    title: "Real Live Person",
    disc: "won 10 matchs consecutively",
  },
  {
    id: 3,
    logo: Invincible,
    title: "Invincible",
    disc: "won 20 games successively",
  },
  {
    id: 4,
    logo: Fly_higher,
    title: "Speed Reader",
    disc: "reaching the level 5",
  },
  {
    id: 5,
    logo: Thought_leader,
    title: "Thought Leader",
    disc: "Reaching the gold tier",
  },
  {
    id: 6,
    logo: boss,
    title: "Founding Member",
    disc: "Taking the first place in rank",
  },
];
