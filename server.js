const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

// RENDER USA process.env.PORT
const PORT = process.env.PORT || 10000;

const app = express();
app.use(express.static(path.join(__dirname, "public")));

// IMPORTANTE: si entras a https://overlayplay.onrender.com
// te manda directo al panel
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "panel.html"));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let state = {
  overlayOn: true,

  draftText1: "TITULAR EN VIVO",
  draftText2: "Subtítulo en vivo",

  liveText1: "TITULAR EN VIVO",
  liveText2: "Subtítulo en vivo",

  text2Enabled: true,

  emoji1: "",
  emoji2: "",

  fontFamily: "Impact",
  fontSize1: 60,
  fontSize2: 40,

  textColor1: "#FFFFFF",
  textColor2: "#FFFFFF",

  bgColor1: "#C40000",
  bgColor2: "#111111",

  borderEnabled: true,
  borderColor: "#FFFFFF",
  borderWidth: 4,

  roundedMode: "rounded",

  animationMode: "fade",
  animationDuration: 500,

  offsetX: 0,
  offsetY: 0,

  width1: 1000,
  height1: 120,

  width2: 800,
  height2: 70,

  text2Attach: "bottom",
  text2Align: "center",

  logoEnabled: false,
  logoDataUrl: null
};

function broadcast() {
  const msg = JSON.stringify({ type: "state", state });
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "state", state }));

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "updateDraft") {
      state.draftText1 = msg.draftText1 ?? state.draftText1;
      state.draftText2 = msg.draftText2 ?? state.draftText2;
      state.emoji1 = msg.emoji1 ?? state.emoji1;
      state.emoji2 = msg.emoji2 ?? state.emoji2;
      broadcast();
    }

    if (msg.type === "pushLive") {
      state.liveText1 = state.draftText1;
      state.liveText2 = state.draftText2;
      broadcast();
    }

    if (msg.type === "toggleOverlay") {
      state.overlayOn = !!msg.overlayOn;
      broadcast();
    }

    if (msg.type === "toggleText2") {
      state.text2Enabled = !!msg.text2Enabled;
      broadcast();
    }

    if (msg.type === "updateStyle") {
      Object.assign(state, msg.style || {});
      broadcast();
    }

    if (msg.type === "toggleLogo") {
      state.logoEnabled = !!msg.logoEnabled;
      broadcast();
    }

    if (msg.type === "uploadLogo") {
      state.logoDataUrl = msg.logoDataUrl || null;
      broadcast();
    }
  });
});

server.listen(PORT, () => {
  console.log("=======================================");
  console.log("OverlayPLAY Lower Third corriendo (Render Ready)");
  console.log("PANEL:       /panel.html");
  console.log("PANEL CLEAN: /panel_clean.html");
  console.log("OUTPUT OBS:  /output.html");
  console.log("PORT:", PORT);
  console.log("=======================================");
});
