import { pickOne } from "../../utils/base";
import { normalizeReplyText } from "../../utils/string";
import {
  Speaker,
  SpeakerCommand,
  SpeakerConfig,
  QueryMessage,
  SpeakerAnswer,
} from "./speaker";

/** 小爱回答不上来时的默认文案（与 docs/no-answer.md 一致） */
const kDefaultNoAnswerReplies = [
  "这可把我难住了，看来要更努力学习了",
  "这个我暂时还回答不上诶，我要再学习学习",
  "这个问题我暂时还回答不上，需要再学习一下",
  "这个问题我还在学习中，先聊点别的吧",
  "被你问住了，看来要更努力学习了",
  "这个问题把我难住了，我会继续努力的",
  "被难住了诶，看来我还要再学习一下",
  "对不起，我还在学习中!",
];

export type AISpeakerConfig = SpeakerConfig & {
  askAI?: (msg: QueryMessage) => Promise<SpeakerAnswer>;
  /**
   * AI 开始回答时的提示语
   *
   * 比如：请稍等，让我想想
   */
  onAIAsking?: string[];
  /**
   * AI 结束回答时的提示语
   *
   * 比如：我说完了，还有替他问题吗？
   */
  onAIReplied?: string[];
  /**
   * AI 回答异常时的提示语
   *
   * 比如：出错了，请稍后再试吧！
   */
  onAIError?: string[];
  /**
   * 设备名称，用来切换音色等
   *
   * 建议使用常见词语，避免使用多音字和容易混淆读音的词语
   */
  name?: string;
  /**
   * 小爱回复命中下列文案时，视为回答不上来，转交大模型
   */
  noAnswerReplies?: string[];
  /**
   * 切换音色前缀
   *
   * 比如：音色切换到（文静毛毛）
   */
  switchSpeakerKeywords?: string[];
  /**
   * AI 回答开始提示音
   */
  audioActive?: string;
  /**
   * AI 回答异常提示音
   */
  audioError?: string;
};

type AnswerStep = (
  msg: any,
  data: any
) => Promise<{ stop?: boolean; data?: any } | void>;

export class AISpeaker extends Speaker {
  askAI: AISpeakerConfig["askAI"];
  name: string;
  switchSpeakerKeywords: string[];
  noAnswerReplies: string[];
  onAIAsking: string[];
  onAIReplied: string[];
  onAIError: string[];
  audioActive?: string;
  audioError?: string;

  constructor(config: AISpeakerConfig) {
    super(config);
    const {
      askAI,
      name = "傻妞",
      switchSpeakerKeywords,
      noAnswerReplies = kDefaultNoAnswerReplies,
      onAIAsking = ["让我先想想", "请稍等"],
      onAIReplied = ["我说完了", "还有其他问题吗"],
      onAIError = ["啊哦，出错了，请稍后再试吧！"],
      audioActive = process.env.AUDIO_ACTIVE,
      audioError = process.env.AUDIO_ERROR,
    } = config;
    this.askAI = askAI;
    this.name = name;
    this.noAnswerReplies = noAnswerReplies;
    this.onAIError = onAIError;
    this.onAIAsking = onAIAsking;
    this.onAIReplied = onAIReplied;
    this.audioActive = audioActive;
    this.audioError = audioError;
    this.switchSpeakerKeywords =
      switchSpeakerKeywords ?? getDefaultSwitchSpeakerPrefix();
  }

  get commands() {
    return [
      {
        match: (msg) =>
          this.switchSpeakerKeywords.some((e) => msg.text.startsWith(e)),
        run: async (msg) => {
          await this.response({
            text: "正在切换音色，请稍等...",
          });
          const prefix = this.switchSpeakerKeywords.find((e) =>
            msg.text.startsWith(e)
          )!;
          const speaker = msg.text.replace(prefix, "");
          const success = await this.switchSpeaker(speaker);
          await this.response({
            text: success ? "音色已切换！" : "音色切换失败！",
            keepAlive: this.keepAlive,
          });
        },
      },
      // todo 考虑添加清除上下文指令
      ...this._commands,
      {
        // 不立刻 pause，等小爱无效应答播完后再播放大模型答案
        skipPause: true,
        match: (msg) => {
          if (!msg.answer) {
            return false;
          }
          // 忽略空白差异，避免「对不起， 我还在学习中!」与实际播报文案对不上
          const answer = normalizeReplyText(msg.answer);
          return this.noAnswerReplies.some(
            (e) => answer === normalizeReplyText(e)
          );
        },
        run: (msg) => this.askAIForAnswer(msg),
      },
    ] as SpeakerCommand[];
  }

  private _askAIForAnswerSteps: AnswerStep[] = [
    async (msg, data) => {
      // 并行请求大模型，与小爱播放重叠以缩短等待
      const answerPromise = this.askAI?.(msg);
      return { data: { answerPromise } };
    },
    async (msg, data) => {
      // 等小爱原句播完，再开始本项目 TTS（查不到状态时按无效应答文本估算）
      const { hasNewMsg } = this.checkIfHasNewMsg(msg);
      const waitRes = await this.waitForIdle({
        hasNewMsg,
        fallbackText: msg.answer,
      });
      if (waitRes === "break" || hasNewMsg() || this.status !== "running") {
        return { stop: true };
      }
    },
    async (msg, data) => {
      // 思考中
      const text = pickOne(this.onAIAsking);
      if (text) {
        await this.response({ text, audio: this.audioActive });
      }
    },
    async (msg, data) => {
      // 等待大模型回复（可能已在等待播放时完成）
      let answer = await data.answerPromise;
      return { data: { answer } };
    },
    async (msg, data) => {
      // 开始回复
      if (data.answer) {
        const res = await this.response({ ...data.answer });
        return { data: { ...data, res } };
      }
    },
    async (msg, data) => {
      if (
        data.answer &&
        data.res == null &&
        !this.audioBeep &&
        this.streamResponse
      ) {
        // 回复完毕
        const text = pickOne(this.onAIReplied);
        if (text) {
          await this.response({ text });
        }
      }
    },
    async (msg, data) => {
      if (data.res === "error") {
        // 回答异常
        const text = pickOne(this.onAIError);
        if (text) {
          await this.response({ text, audio: this.audioError });
        }
      }
    },
  ];

  async askAIForAnswer(msg: QueryMessage) {
    let data: { answer?: SpeakerAnswer; answerPromise?: Promise<SpeakerAnswer> } =
      {};
    const { hasNewMsg } = this.checkIfHasNewMsg(msg);
    for (const action of this._askAIForAnswerSteps) {
      const res = await action(msg, data);
      if (hasNewMsg() || this.status !== "running") {
        // 收到新的用户请求消息，终止后续操作和响应
        return;
      }
      if (res?.data) {
        data = { ...data, ...res.data };
      }
      if (res?.stop) {
        break;
      }
    }
  }
}

const getDefaultSwitchSpeakerPrefix = () => {
  const words = [
    ["把", ""],
    ["音色", "声音"],
    ["切换", "换", "调"],
    ["到", "为", "成"],
  ];

  const generateSentences = (words: string[][]) => {
    const results: string[] = [];
    const generate = (currentSentence: string[], index: number) => {
      if (index === words.length) {
        results.push(currentSentence.join(""));
        return;
      }
      for (const word of words[index]) {
        currentSentence.push(word);
        generate(currentSentence, index + 1);
        currentSentence.pop();
      }
    };
    generate([], 0);
    return results;
  };

  return generateSentences(words);
};
