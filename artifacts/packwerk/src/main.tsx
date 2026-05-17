import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Wire the stored access token into every generated API hook request
setAuthTokenGetter(() => localStorage.getItem("packwerk_access_token"));

createRoot(document.getElementById("root")!).render(<App />);
