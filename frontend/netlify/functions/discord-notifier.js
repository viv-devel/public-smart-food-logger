import fetch from "node-fetch";

export async function handler(event) {
  // NetlifyからのPOSTリクエスト以外は無視
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  // 環境変数からDiscordのWebhook URLを取得
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) {
    return {
      statusCode: 500,
      body: "Discord Webhook URL is not configured.",
    };
  }

  try {
    const payload = JSON.parse(event.body);

    // デプロイ状態に応じて色とメッセージを決定
    const deployState = payload.state;
    let title;
    let color;

    // Netlifyのstateを判定
    // https://docs.netlify.com/site-deploys/notifications/#deploy-notification-payload
    switch (deployState) {
      case "ready": // Production deploy succeeded
        title = "Deploy Succeeded";
        color = 3066993; // Green
        break;
      case "building":
        title = "Deploy Building";
        color = 16776960; // Yellow
        break;
      case "failed":
        title = "Deploy Failed";
        color = 15158332; // Red
        break;
      default:
        title = `Deploy ${deployState}`;
        color = 10070709; // Grey
        break;
    }

    // Discordに送信するメッセージを組み立てる (embeds形式)
    const discordMessage = {
      username: "Netlify",
      avatar_url: "https://www.netlify.com/v3/img/components/logomark.png",
      embeds: [
        {
          title: `[${payload.name}] ${title}`,
          url: payload.deploy_ssl_url || payload.url,
          color: color,
          fields: [
            {
              name: "Context",
              value: payload.context,
              inline: true,
            },
            {
              name: "Branch",
              value: payload.branch,
              inline: true,
            },
          ],
          timestamp: payload.created_at,
        },
      ],
    };

    // コミット情報があればメッセージに追加
    if (payload.commit_ref && payload.commit_url) {
      const commitUrl = payload.commit_url.startsWith("http")
        ? payload.commit_url
        : `https://github.com/${payload.repository}/commit/${payload.commit_ref}`;
      discordMessage.embeds[0].description = `Commit [${payload.commit_ref.substring(0, 7)}](${commitUrl}) by ${payload.committer}`;
    }

    // Discordにメッセージを送信
    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage),
    });

    if (!response.ok) {
      console.error(
        `Discord API Error: ${response.status} ${response.statusText}`,
      );
      const errorBody = await response.text();
      console.error("Discord Response Body:", errorBody);
      return {
        statusCode: 500,
        body: `Failed to send notification to Discord. Status: ${response.status}`,
      };
    }

    return {
      statusCode: 200,
      body: "Notification sent to Discord.",
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      statusCode: 500,
      body: "An internal error occurred.",
    };
  }
}
