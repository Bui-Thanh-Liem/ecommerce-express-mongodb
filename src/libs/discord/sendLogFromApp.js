import axios from "axios";
import configEnv from "../../config/config.env.js";

const WEBHOOK_URL = configEnv.discord.urlWebhook;

export async function sendDiscordLog(message) {
  console.log("send log discord");

  await axios.post(WEBHOOK_URL, {
    embeds: [
      {
        title: "🔥 Error Log",
        description: "Checkout service error",
        color: 16711680,
        fields: [
          { name: "Message", value: "Không tìm thấy sản phẩm", inline: false },
          { name: "Time", value: new Date().toISOString(), inline: false },
        ],
        message,
      },
    ],
  });
}
