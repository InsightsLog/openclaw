import type { OAuthCredentials } from "@mariozechner/pi-ai";
import { loginAnthropic } from "@mariozechner/pi-ai";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { createVpsAwareOAuthHandlers } from "./oauth-flow.js";

export async function loginAnthropicProOAuth(params: {
  prompter: WizardPrompter;
  runtime: RuntimeEnv;
  isRemote: boolean;
  openUrl: (url: string) => Promise<void>;
  localBrowserMessage?: string;
}): Promise<OAuthCredentials | null> {
  const { prompter, runtime, isRemote, openUrl, localBrowserMessage } = params;

  await prompter.note(
    isRemote
      ? [
          "You are running in a remote/VPS environment.",
          "A URL will be shown for you to open in your LOCAL browser.",
          "After signing in, paste the authorization code back here.",
        ].join("\n")
      : [
          "Browser will open for Anthropic authentication.",
          "Sign in with your Claude Pro or Max account.",
          "If the callback doesn't auto-complete, paste the redirect URL.",
        ].join("\n"),
    "Anthropic Pro/Max OAuth",
  );

  const spin = prompter.progress("Starting OAuth flow…");
  try {
    const { onAuth, onPrompt } = createVpsAwareOAuthHandlers({
      isRemote,
      prompter,
      runtime,
      spin,
      openUrl,
      localBrowserMessage: localBrowserMessage ?? "Complete sign-in in browser…",
    });

    const creds = await loginAnthropic(
      (url) => onAuth({ url }),
      () => onPrompt({ message: "Paste the authorization code" }),
    );
    spin.stop("Anthropic OAuth complete");
    return creds ?? null;
  } catch (err) {
    spin.stop("Anthropic OAuth failed");
    runtime.error(String(err));
    await prompter.note(
      [
        "Trouble with OAuth?",
        "Make sure you have an active Claude Pro or Max subscription.",
        "See https://docs.openclaw.ai/providers/anthropic",
      ].join("\n"),
      "OAuth help",
    );
    throw err;
  }
}
