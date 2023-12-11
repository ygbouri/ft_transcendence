import classes from "../../styles/GameLobby.module.css";
import classesELM from "../../styles/Loading.module.css";
import { gameControleType } from "../../Types/dataTypes";
import React, { useEffect, useRef, useState } from "react";
import { render } from "../../config/game";
import socket_game from "../../config/socketGameConfig";
import { useRouter } from "next/router";
import { allTheme } from "config/gameMap";
import { runTimer } from "@hooks/Functions";
import MsgSlideUp from "@components/Settings/slideUpMsg";

class GameFriendType {
  gameID: string = "";
  admin: string = "";
  friend: string = "";
  theme: string = "";
}

const GameLobby: React.FC<{ GameID: string }> = (props) => {
  const gameData: gameControleType = new gameControleType(1500);
  const [datagame, setDataGame] = useState<GameFriendType>();
  const [startGame, setStartGame] = useState(false);
  const [ErrorMsg, setErrorMsg] = useState(false);
  const [isMounted, setisMounted] = useState(false);
  const [calledPush, setCalledPush] = useState(false);
  const ref_canvas = useRef(null);
  const ref_span = useRef(null);
  const router = useRouter();
  useEffect(() => {
    socket_game.emit("FriendGameInfo", props.GameID, (data: any) => {
      setDataGame(data);
      render(gameData, ref_canvas.current, allTheme[Number(data.Theme)]);
    });
    socket_game.on("gameStarted", (data) => {
      if (data === true) {
        let rep: NodeJS.Timer;
        setStartGame(true);
        rep = runTimer(ref_span.current);
        setTimeout(() => {
          clearInterval(rep);
          if (!calledPush) {
            router.replace("/game/" + props.GameID);
            setCalledPush(true);
          }
        }, 4000);
      } else {
        setErrorMsg(true);
      }
    });
    socket_game.emit("isGameStarted", props.GameID);
    setisMounted(true);
    return () => {
      socket_game.off("gameStarted");
    };
  }, []);
  const cancelHandler = () => {
    socket_game.emit("removeGameLobby", props.GameID);
    router.push("/game");
  };

  if (ErrorMsg) {
    const time = setTimeout(() => {
      setErrorMsg(false);
      router.push("/game");
      return () => {
        clearTimeout(time);
      };
    }, 3000);
  }
  return (
    <>
      {isMounted && (
        <div className={classes.fullPage}>
          {ErrorMsg && (
            <MsgSlideUp
              msg="game refused"
              colorCtn="#FF6482"
              colorMsg="#ECF5FF"
            />
          )}
          {!ErrorMsg && (
            <div className={classes.BackGround}>
              <div className={classes.Waiting}>
                {(startGame && (
                  <>
                    <div>
                      <span ref={ref_span}>4</span>
                    </div>
                    <span>Game will start soon</span>
                  </>
                )) || (
                  <>
                    <div
                      className={`${classesELM["pong-loader"]} ${classes.loading}`}
                    />
                    <span>Waiting for your opponent</span>
                    <div className={classes.cancelbtn} onClick={cancelHandler}>
                      Cancel
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <div className={classes.GameContainer}>
            <canvas
              width={gameData.canvasWidth}
              height={gameData.canvasHieght}
              ref={ref_canvas}
              id="pong"
            ></canvas>
          </div>
        </div>
      )}
    </>
  );
};

export default GameLobby;
