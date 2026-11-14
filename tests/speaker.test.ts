import assert from "node:assert/strict";
import test from "node:test";
import { BaseSpeaker } from "../src/services/speaker/base";
import { StreamResponse } from "../src/services/speaker/stream";

function createSpeaker(model: string, streamResponse = true) {
  const speaker = new BaseSpeaker({
    userId: "",
    password: "",
    streamResponse,
    checkTTSStatusAfter: 0,
  });
  const spoken: string[] = [];
  const audio: string[] = [];
  speaker.MiIOT = {
    account: { device: { model } },
    doAction: async (_scope: number, _action: number, text: string) => {
      spoken.push(text);
      return true;
    },
  } as unknown as NonNullable<BaseSpeaker["MiIOT"]>;
  speaker.MiNA = {
    getStatus: async () => ({ status: "paused", media_type: 3 }),
    play: async (args: { url: string }) => {
      audio.push(args.url);
    },
  } as unknown as NonNullable<BaseSpeaker["MiNA"]>;
  return { speaker, spoken, audio };
}

function createAnswer() {
  const text = "First sentence. Second sentence.";
  const stream = new StreamResponse({ maxSentenceLength: 16 });
  stream.addResponse(text);
  stream.finish(text);
  return { text, stream };
}

test("L05C sends the complete native TTS answer despite paused media state", async () => {
  const { speaker, spoken } = createSpeaker("xiaomi.wifispeaker.l05c");
  const { text, stream } = createAnswer();
  await speaker.response({ stream });
  assert.deepEqual(spoken, [text]);
  assert.equal(speaker.responding, false);
});

test("L05C waits for the stream to finish before sending native TTS", async () => {
  const { speaker, spoken } = createSpeaker("xiaomi.wifispeaker.l05c");
  const text = "First sentence. Second sentence.";
  const stream = new StreamResponse({ maxSentenceLength: 16 });
  stream.addResponse("First sentence. ");
  const response = speaker.response({ stream });
  assert.deepEqual(spoken, []);
  stream.addResponse("Second sentence.");
  stream.finish(text);
  await response;
  assert.deepEqual(spoken, [text]);
});

test("L05C does not play a buffered answer after a new message arrives", async () => {
  const { speaker, spoken } = createSpeaker("xiaomi.wifispeaker.l05c");
  const stream = new StreamResponse();
  let hasNewMsg = false;
  const response = speaker.response({ stream, hasNewMsg: () => hasNewMsg });
  hasNewMsg = true;
  stream.finish("Old answer.");
  assert.equal(await response, "break");
  assert.deepEqual(spoken, []);
  assert.equal(speaker.responding, false);
});

test("other models retain segmented native TTS playback", async () => {
  const { speaker, spoken } = createSpeaker("xiaomi.wifispeaker.lx06");
  const { stream } = createAnswer();
  await speaker.response({ stream });
  assert.deepEqual(spoken, ["First sentence.", "Second sentence."]);
});

test("non-streaming responses still send the complete answer", async () => {
  const { speaker, spoken } = createSpeaker("xiaomi.wifispeaker.lx06", false);
  const { text, stream } = createAnswer();
  await speaker.response({ stream });
  assert.deepEqual(spoken, [text]);
});

test("L05C audio playback is unchanged", async () => {
  const { speaker, spoken, audio } = createSpeaker("xiaomi.wifispeaker.l05c");
  const url = "https://example.com/answer.mp3";
  await speaker.response({ audio: url });
  assert.deepEqual(audio, [url]);
  assert.deepEqual(spoken, []);
});

test("L05C custom TTS retains segmented playback", async () => {
  const previousTTS = process.env.TTS_BASE_URL;
  process.env.TTS_BASE_URL = "https://example.com";
  try {
    const { speaker, spoken, audio } = createSpeaker("xiaomi.wifispeaker.l05c");
    speaker.unWakeUp = async () => {};
    const { stream } = createAnswer();
    await speaker.response({ stream, tts: "custom", playSFX: false });
    assert.deepEqual(spoken, []);
    assert.deepEqual(
      audio.map((url) => new URL(url).searchParams.get("text")),
      ["First sentence.", "Second sentence."]
    );
  } finally {
    if (previousTTS === undefined) {
      delete process.env.TTS_BASE_URL;
    } else {
      process.env.TTS_BASE_URL = previousTTS;
    }
  }
});