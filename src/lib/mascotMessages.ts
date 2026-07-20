export const encourageMessages = [
  "今日もいい調子だね!",
  "さあ、何が出るかな?",
  "無理せずいこう!",
  "えいっと回してみて!",
  "肩の力を抜いていこう〜",
];

export const praiseMessages = [
  "えらい!ありがとう!",
  "助かった〜!さすが!",
  "ナイス家事!",
  "その調子その調子!",
  "頼りになるなあ!",
];

export const allDoneMessages = [
  "今週のタスク、完全制覇したよ!すごい!",
  "今月のタスク、ぜんぶ終わった!お疲れさま!",
  "残りゼロ!今は思いっきり休んでいいやつ!",
];

export const timeOverMessages = [
  "今日はここまでにしとこ!",
  "時間内でできるのはここまでみたい",
  "また時間があるときにやろうね",
];

export function pickRandom(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
