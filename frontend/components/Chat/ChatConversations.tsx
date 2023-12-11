import Styles from "@styles/Chat/ChatConversations.module.css";
import { useState } from "react";
import { ChannelData, conversations } from "@Types/dataTypes";
import { Conversation } from "./Conversation";
import { CreateChannel } from "./CreateChannel";
import { FiEdit } from "react-icons/fi";

const initialChnlState: ChannelData = {
  // avatar: "",
  name: "",
  type: "Public",
  password: "",
  members: [],
};

interface Props {
  isMobile: boolean;
  convs: conversations[];
  selectedConv: string | string[];
  updateConversations: (msgConvId: string) => void;
}

export const ChatConversations: React.FC<Props> = ({
  isMobile,
  convs,
  selectedConv,
  updateConversations,
}) => {
  const [showAddChannel, setshowAddChannel] = useState<boolean>(false);
  const [searchConv, setsearchConv] = useState<string>("");

  const AddChannelClickHandler = () => {
    setshowAddChannel(true);
  };

  const CloseChannelHandler = () => {
    setshowAddChannel(false);
  };

  return (
    <>
      {showAddChannel && (
        <CreateChannel
          isUpdate={false}
          initialChnlState={initialChnlState}
          CloseChannelHandler={CloseChannelHandler}
          updateConversations={updateConversations}
        />
      )}
      <div
        className={Styles.ChatConversations}
        style={
          isMobile
            ? selectedConv === "0"
              ? { width: "100%" }
              : { width: "0" }
            : {}
        }
      >
        <div className={Styles.ChatConvHeader}>
          <div>Direct Messages</div>
          <div
            className={Styles.AddChannelicn}
            onClick={AddChannelClickHandler}
          >
            {(!showAddChannel && <FiEdit size="22px" color="white" />) || (
              <FiEdit size="22px" color="white" />
            )}
          </div>
        </div>
        {convs.length > 0 ? (
          <div className={Styles.Conversationlist}>
            {convs.map((conv: conversations) => {
              if (conv.name.toUpperCase().includes(searchConv.toUpperCase()))
                return (
                  <Conversation
                    key={conv.convId}
                    convId={conv.convId}
                    avatar={conv.avatar}
                    name={conv.login}
                    membersNum={conv.membersNum}
                    status={""}
                    unread={conv.unread}
                    type={conv.type}
                    selected={
                      selectedConv === conv.convId ||
                      selectedConv === conv.login
                    }
                  />
                );
            })}
          </div>
        ) : (
          <p>Empty list</p>
        )}
      </div>
    </>
  );
};
