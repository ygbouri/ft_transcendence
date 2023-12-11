import { AppProps } from "next/app";
import { AnimatePresence } from "framer-motion";
import "../styles/globals.css";
import { store } from "@store/store";
import { Provider } from "react-redux";
import { useRouter } from "next/router";
import ContentWrapper from "../components/wrapper/appWrapper";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const path = router.asPath;

  if (
    path === "/" ||
    (path.includes("game/") && !path.includes("game/lobby")) ||
    path.includes("?_2fa=true")
  ) {
    return (
      <AnimatePresence exitBeforeEnter>
        {typeof window === "undefined" ? null : (
          <>
            <Component {...pageProps} />
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence exitBeforeEnter>
      <Provider store={store}>
        {typeof window === "undefined" ? null : (
          <>
            <ContentWrapper>
              <Component {...pageProps} />
            </ContentWrapper>
          </>
        )}
      </Provider>
    </AnimatePresence>
  );
}

export default MyApp;
