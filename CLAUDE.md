# 家事ルーレット(kaji-roulette)

家事を週1・隔週・月1に分類し、ルーレットで1つ選んで実施を記録する、夫婦向けのスマホ用Webアプリ。
非エンジニアのオーナーが、Claude Codeとの会話だけで作って運用している。社内発表では「家事カジノ」と呼んでいるが、**アプリ内の表記は「家事ルーレット」のまま**(変更不要)。

- 公開URL: https://kaji-roulette.vercel.app
- リポジトリ: https://github.com/junya-morita/kaji-roulette (`main`にpushするとVercelが自動デプロイ)

## コマンド

```bash
npm install
npm run dev     # 開発サーバー (http://localhost:5173)
npm test        # Vitest (期間判定・提案ロジックの単体テスト)
npm run build   # 型チェック + 本番ビルド
```

## 技術構成

- Vite + React + TypeScript、プレーンCSS(モバイルファースト)
- `vite-plugin-pwa`でPWA化(スマホの「ホーム画面に追加」で使う)
- **バックエンド・DBなし**。データは各端末のブラウザの`localStorage`(キー: `kaji-roulette:tasks`)だけに保存する
- 夫婦間のデータ同期はしない仕様(それぞれのスマホで独立して動く)

## ソース構成

- `src/types.ts` — `Task` / `Schedule` / `Category`(`weekly` | `biweekly` | `monthly`)
- `src/lib/period.ts` — 期間(週・隔週・月)の判定、優先タイミング(`isPriorityDue`)の計算
- `src/lib/suggestion.ts` — 「まとめて提案」(優先タスクを先に詰め、残り時間をランダムに埋める)
- `src/lib/storage.ts` — localStorage読み書き。旧形式データは`normalizeTask`で補完(マイグレーション)
- `src/lib/defaultTasks.ts` — 初期タスク33件(オーナーが用意したスプレッドシート由来)
- `src/lib/scheduleLabel.ts` / `mascotMessages.ts` — 表示ラベル、マスコットのセリフ
- `src/hooks/useTasks.ts` — タスクの状態管理(追加・編集・完了・削除)
- `src/components/` — `RouletteScreen`(ルーレット画面)、`TaskListScreen`(一覧・管理)、`TaskForm`(追加/編集の共通フォーム)ほか

## 仕様の要点

- **ルーレットは1つ**。週1・隔週・月1を区別せず、今の期間で未完了かつ有効なタスクの合算プールから抽選する
- 完了状態は保存せず`lastCompletedAt`から都度計算する。週(月曜始まり)・月が変わると自動で未完了に戻る
- **隔週**は全タスク共通の固定サイクル(2024/1/1の月曜を基準に2週間ごと)。タスクごとの起点指定はない
- **優先タイミング**: 週1・隔週は曜日、月1は日付または「第N週の曜日」(月内での出現回数)。指定日を過ぎても未完了なら、その期間中は優先で出し続ける。隔週の曜日指定はサイクル1週目の曜日を指す
- 「今日使える時間」を設定すると、想定時間が超えるタスクは抽選対象から外れる(優先タスクも例外なし)。未設定なら制限なし
- 「全部終わった」と「時間内に収まるタスクがない」は別の状態として扱い、メッセージも分けている
- 無効化したタスクは削除せず一覧に残り、ルーレットと残り件数から除外される
- カテゴリ変更は編集フォームから行う。月1と週1・隔週の境界を跨ぐときだけ優先タイミングがリセットされる

## 注意点

- `defaultTasks.ts`を変えても、**すでにlocalStorageにデータがある端末には反映されない**(空のときだけ初期投入される)。反映したい場合は、各端末でブラウザの「サイトデータを削除」が必要
- 保存データのスキーマを変えるときは、`storage.ts`の`normalizeTask`で旧データを壊さず補完すること(運用中の端末に実データがある)
- iPhoneのSafariは、しばらく開かないとlocalStorageを自動削除することがある(アプリの不具合ではない)
- Vercelの「Deployment Protection」(Vercel Authentication)はオフにしてある。オンにすると奥さんのスマホからログインなしで開けなくなる
- コミットはユーザーの依頼があってからpushする(pushで本番に即反映されるため)
