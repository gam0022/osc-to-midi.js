# osc-to-midi.js

[Sound2Light](https://github.com/ETCLabs/Sound2Light)のBPMのOSCのメッセージをMIDIのCCにリアルタイムに変換するツールです。

Sound2Light to [Sh4derJockey](https://github.com/slerpyyy/sh4der-jockey) の通信を実現するためのワークアラウンドとして開発しました。

MIDI信号は7bit（0～127）しか送れないので、下位7bitと上位7bitの2チャンネルのMIDIのCCに分割して送信します。

## 初回セットアップ

### node.js側のセットアップ

```
git clone git@github.com:gam0022/osc-to-midi.js.git
cd osc-to-midi.js
npm install
```

### Sh4derJockeyのセットアップ

#### `pipeline.yaml` に `loopMIDI` を追記。

```yaml
midi_devices:
  - "loopMIDI"
  - "nanoKONTROL2" # 任意
```

#### CC#24とCC#25に、スライダーの24と25を割り当て

Sh4derJockeyは最後に変更があったCCにbindされるので、 `osc-to-midi.js` のCC送信を片方ずつコメントアウトして行う必要があります。

もしくは `midi-config.dat` を直接編集することもできそうです（未検証）。

```
  ? - 0
    - 24
  : 24
  ? - 0
    - 25
  : 25
```

#### GLSLでBPMをエンコード

```glsl
// 7bitずつ分けてBPMを受け取る
float msb = sliders[24];
float lsb = sliders[25];

float bpm = (lsb * 127) + (msb * 127) * 128;
```

## 使い方

初回セットアップの完了後は以下の手順になります。

- [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)を起動
- Sound2Lightを起動
- `npm run start` で本スクリプトを起動


## メモ

- DJ音源をヘッドセットで聞きながらSound2Lightを使うために、VBCableとVB-Audio VoiceMeeter Bananaを使いました
    - Windowsの音声出力を `CABLE In 16ch (VB-Audio Virtual Cable)` に変更
    - VB-Audio VoiceMeeter Banana を起動
        - Stereo Input 1を `CABLE Output` に設定
        - HARDWARE OUTのA1を音を出力したいヘッドセットやスピーカーに設定
- osc-to-midi.js がMIDI信号を送り続けるので、Sh4derJockeyのbindするときはosc-to-midi.jsを終了させる必要がある

## License

MIT