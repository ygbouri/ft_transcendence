import Styles from "@styles/Chat/ChatMessageInput.module.css";
import React, { useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { conversations, MsgData } from "@Types/dataTypes";
import socket_notif from "config/socketNotif";
import { useDispatch } from "react-redux";
import socket_game from "config/socketGameConfig";
import { ShowErrorGameMsg } from "@store/UI-Slice";
import SettingGame from "@components/game/settingGame";
import { useRouter } from "next/router";
import { AiOutlineSend } from "react-icons/ai";
import { BiGame } from "react-icons/bi";

interface Props {
  convData: conversations;
}

export const ChatMessageInput: React.FC<Props> = ({ convData }) => {
  const [EnteredMsg, setEnteredMsg] = useState<string>("");
  const [settingGames, ShowSettingGames] = useState(false);
  const dispatch = useDispatch();
  const me = localStorage.getItem("owner");
  const router = useRouter();

  const inputStatus: string =
    convData.status === "Left"
      ? "You left this channel"
      : convData.status === "Blocker"
      ? "You blocked this user"
      : convData.status === "Kicked"
      ? "You have been kicked from this channel"
      : convData.status === "Banned"
      ? "You have been banned from this channel"
      : convData.status === "Muted"
      ? "You have been muted from this channel"
      : "";

  const inputOnChangeHandler = (event: any) => {
    setEnteredMsg(event.target.value);
  };

  const sendMsg = () => {
    if (EnteredMsg.trim().length > 0) {
      socket_notif.emit(
        "sendMsg",
        {
          convId: convData.convId,
          receiver: convData.type === "Dm" ? convData.login : undefined,
          msg: EnteredMsg,
        },
        (response: any) => {
          if (convData.convId !== response.data)
            router.push("/chat?login=" + response.data);
          setEnteredMsg("");
        }
      );
    }
  };

  const inputonKeyHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (EnteredMsg.length > 0) sendMsg();
    }
  };

  const sendInvitGame = () => {
    socket_game.emit(
      "checkLobby",
      { admin: me, login: convData.login },
      (data: boolean) => {
        if (!data) {
          ShowSettingGames(true);
        } else {
          dispatch(ShowErrorGameMsg());
        }
      }
    );
  };

  function sendGame(gameID: string) {
    let data = {
      sender: me,
      invitation: gameID,
      convId: convData.convId,
      receiver: convData.login,
    };
    socket_notif.emit("sendMsg", data, (response: any) => {});
    ShowSettingGames(false);
  }

  const HideSetting = () => {
    ShowSettingGames(false);
  };

  useLayoutEffect(() => {
    if (EnteredMsg.length > 0) setEnteredMsg("");
  }, [router.query]);

  return (
    <>
      {settingGames && (
        <SettingGame
          sendGame={sendGame}
          login={convData?.login}
          Hide={HideSetting}
        />
      )}
      {!inputStatus ? (
        <div className={Styles.ChatMsgSendBoxContainer}>
          <div className={Styles.ChatMsgSendBox}>
            <input
              type={"text"}
              placeholder="Start a new message"
              onChange={inputOnChangeHandler}
              onKeyDown={inputonKeyHandler}
              value={EnteredMsg}
            ></input>
            <div className={Styles.icons}>
              {convData.type === "Dm" ? (
                <BiGame
                  style={{
                    cursor: "pointer",
                  }}
                  size="26px"
                  color="white"
                  onClick={sendInvitGame}
                />
              ) : null}
              <motion.div
                initial={{
                  opacity: EnteredMsg.trim().length > 0 ? 0 : 1,
                  scale: EnteredMsg.trim().length > 0 ? 0 : 1,
                  pointerEvents: EnteredMsg.trim().length > 0 ? "auto" : "none",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  pointerEvents: EnteredMsg.trim().length > 0 ? "auto" : "none",
                }}
              >
                <AiOutlineSend
                  style={{
                    cursor: "pointer",
                  }}
                  size="26px"
                  color="white"
                  onClick={sendMsg}
                />
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className={Styles.ChatMsgSendBoxContainer}>
          <div className={Styles.ChatBlockedSendBox}>{inputStatus}</div>
        </div>
      )}
    </>
  );
};
