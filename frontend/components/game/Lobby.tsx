import { useEffect, useRef, useState } from "react";
import classes from "../../styles/Lobby.module.css";
import down from "../../public/Game/Down.svg";
import Cross from "../../public/FriendIcons/Cross.svg";
import Image from "next/image";
import Queue from "./Queue";
import socket_game from "../../config/socketGameConfig";
import RankStar from "../../public/Game/raking-stars.svg";
import Theme1 from "../../public/GameThemes/theme1.jpeg";
import Theme2 from "../../public/GameThemes/theme2.jpeg";
import Theme3 from "../../public/GameThemes/theme3.jpeg";
import Classic from "../../public/Game/Classic.svg";
import bg from "../../public/bg-animation.jpeg";
import MsgSlideUp from "../Settings/slideUpMsg";
import { fetchDATA } from "@hooks/useFetchData";
import { useRouter } from "next/router";
import { FriendOnline } from "@Types/dataTypes";
import { getImageBySize, useOutsideAlerter } from "@hooks/Functions";
import socket_notif from "config/socketNotif";

class PropsType extends FriendOnline {
  select: any;
}

const Friend: React.FC<PropsType> = (props) => {
  const selectHandler = () => {
    props.select(props);
  };
  const avatar = getImageBySize(props.avatar, 70);
  return (
    <>
      <div className={classes.Friend}>
        <div className={classes.avatar}>
          <img src={avatar} />
        </div>
        <div className={classes.Name}>{props.login}</div>
        <div className={classes.btnSelect} onClick={selectHandler}>
          Select
        </div>
      </div>
    </>
  );
};

export const FriendGameSetting: React.FC<{
  Hide: () => void;
}> = (props) => {
  const router = useRouter();
  const owner = localStorage.getItem("owner");
  const [themeselected, setThemeselected] = useState("1");
  const [friendSelected, setFriendSelected] = useState<FriendOnline>(
    new FriendOnline()
  );
  const [ListFriends, setListFriends] = useState<FriendOnline[]>([]);
  const [isOpen, setisOpen] = useState(false);
  const ref_input = useRef<HTMLInputElement>(null);
  const ref_listSelect = useRef(null);
  const ref_Select = useRef(null);
  const ClickHandler = () => {
    if (friendSelected.login !== "") ClicktoSerachHandler();
    else setisOpen((v) => !v);
  };
  const SearchHandler = () => {
    setisOpen(true);
    const elm = ref_input?.current;
    const friend = new FriendOnline();
    friend.fullname = elm!.value;
    setFriendSelected(friend);
  };
  const selectThemehandler = (e: React.MouseEvent<HTMLImageElement>) => {
    const target = e?.target as HTMLImageElement;
    setThemeselected(target?.alt);
  };
  const StartHandler = () => {
    if (friendSelected.login) {
      socket_game.emit(
        "newFriendGame",
        {
          Theme: themeselected,
          friend: friendSelected.login,
          login: owner,
        },
        (id: any) => {
          socket_notif.emit("sendGame", {
            player: friendSelected.login,
            gameId: id,
          });
          router.push("/game/lobby?gameID=" + id);
        }
      );
    }
  };
  const ClicktoSerachHandler = () => {
    ref_input.current!.value = "";
    const emtyFriend = new FriendOnline();
    setFriendSelected(emtyFriend);
    setisOpen(true);
  };
  const FriendSelect = (friend: FriendOnline) => {
    setFriendSelected(friend);
    setisOpen(false);
  };
  const mapToFriends = (fr: FriendOnline) => {
    const name = ref_input.current!.value;
    const nameUser = fr.fullname;
    if (name.length && nameUser.toLocaleLowerCase().includes(name))
      return <Friend select={FriendSelect} key={fr.login} {...fr} />;
    else if (!name.length)
      return <Friend select={FriendSelect} key={fr.login} {...fr} />;
  };
  useOutsideAlerter(ref_Select, setisOpen);
  useEffect(() => {
    fetchDATA(setListFriends, router, "friendship/onlineFriends");
  }, []);
  return (
    <div className={classes.BackGround}>
      <div className={classes.CardSetting}>
        <span>
          Game settings{" "}
          <span onClick={props.Hide}>
            <Image src={Cross} />
          </span>
        </span>
        <h2>Game Theme</h2>
        <div className={classes.listTheme}>
          <div
            className={`${classes.Theme} ${
              themeselected === "1" && classes.selected
            }`}
          >
            <img src={Theme1.src} alt="1" onClick={selectThemehandler} />
          </div>
          <div
            className={`${classes.Theme} ${
              themeselected === "2" && classes.selected
            }`}
          >
            <img src={Theme2.src} alt="2" onClick={selectThemehandler} />
          </div>
          <div
            className={`${classes.Theme} ${
              themeselected === "3" && classes.selected
            }`}
          >
            <img src={Theme3.src} alt="3" onClick={selectThemehandler} />
          </div>
        </div>
        <h2>Invite Friend</h2>
        <div className={classes.selectContainer}>
          <div className={classes.select} ref={ref_Select}>
            <input
              onClick={ClicktoSerachHandler}
              ref={ref_input}
              value={friendSelected?.fullname}
              onChange={SearchHandler}
              className={classes.selectedFriend}
            />
            <div className={classes.icon} onClick={ClickHandler}>
              <Image src={friendSelected.login === "" ? down : Cross} />
            </div>
            {isOpen && (
              <div className={classes.ListFriend} ref={ref_listSelect}>
                {ListFriends.length !== 0 && ListFriends.map(mapToFriends)}
              </div>
            )}
          </div>
          <div className={classes.Create} onClick={StartHandler}>
            Create
          </div>
        </div>
      </div>
    </div>
  );
};

const Lobby = () => {
  const [cardisOpen, setCardisOpen] = useState(false);
  const [QueuePage, setQueuePage] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState(false);
  const ShowCardHandler = () => {
    setCardisOpen(true);
  };
  const HideCardHandler = () => setCardisOpen(false);
  const cancelHandler = (text: string) => {
    if (text === "error") {
      setErrorMsg(true);
      const id = setTimeout(() => {
        setErrorMsg(false);
        return () => {
          clearTimeout(id);
        };
      }, 3000);
    }
    setQueuePage(false);
  };
  const joinRankHandler = () => {
    setQueuePage(true);
  };
  return (
    <>
      {ErrorMsg && (
        <MsgSlideUp
          msg="in game already"
          colorCtn="#FF6482"
          colorMsg="#ECF5FF"
        />
      )}
      {QueuePage && <Queue cancel={cancelHandler} />}
      {!QueuePage && (
        <>
          {cardisOpen && <FriendGameSetting Hide={HideCardHandler} />}
          <div className={classes.LobbyContainer}>
            <span>Game Lobby</span>
            <div className={classes.pingPongContainer}>
              <div className={classes.pongManiaLogo}>
                <div className={classes.sizes}>
                  <Image src={bg} />
                </div>
              </div>
            </div>
            <div className={classes.cardContainers}>
              <div className={classes.RankContainer}>
                <span>Ranked Game</span>
                <p />
                <div className={classes.JoinQueue} onClick={joinRankHandler}>
                  Join Queue
                </div>
              </div>
              <div className={classes.RankContainer}>
                <span>Friend Game</span>
                <p />
                <div className={classes.JoinQueue} onClick={ShowCardHandler}>
                  Invite Friend
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Lobby;
