# osc-to-midi.js

[Sound2Light](https://github.com/ETCLabs/Sound2Light)のBPM情報をリアルタイムに[Sh4derJockey](https://github.com/slerpyyy/sh4der-jockey)に送信するためのツールです。

Sound2LightはOSCに、Sh4derJockeyはMIDI信号にのみ対応しているため、OSCメッセージをMIDI CCにリアルタイムで変換することでこの機能を実現しています。

MIDI信号は7bit（0～127）の範囲でしか送信できないため、BPM情報を下位7bitと上位7bitに分割し、2つのMIDI CCチャンネルを使用して送信します。

## 初回セットアップ

### node.js側のセットアップ

```
git clone git@github.com:gam0022/osc-to-midi.js.git
cd osc-to-midi.js
npm install
```

### Sound2Light側のセットアップ

- Settingsを開く
    - OSC Protocolを `TCP 1.0` に設定
    - 以下はデフォルト設定
        - OSP IP Address: `127.0.0.1`
        - OSC TCP Port: `3032`

### Sh4derJockey側のセットアップ

#### 1. `pipeline.yaml` に `loopMIDI` を追記

```yaml
midi_devices:
  - "loopMIDI"
  - "nanoKONTROL2" # 任意
```

#### 2. CC#24とCC#25に、スライダーの24と25を割り当て

Sh4derJockeyのMIDIコントローラーのバインドは最後に変更があったチャンネルにbindされるので、 `osc-to-midi.js` のCC送信を片方ずつコメントアウトして行う必要があります。

未検証ですが、 `midi-config.dat` を直接編集することもできそうな気がします。

```
  ? - 0
    - 24
  : 24
  ? - 0
    - 25
  : 25
```

#### BPMのデコード処理をGLSLで実装

```glsl
// 7bitずつ分けてBPMを受け取る
float msb = sliders[24];  // 上位7bit
float lsb = sliders[25];  // 下位7bit

float bpm = (lsb * 127) + (msb * 127) * 128;
```

## 初回セットアップ後の使い方

初回セットアップの完了後の手順です。

1. [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)を起動
2. Sound2Lightを起動
3. `npm run start` で本スクリプトを起動
4. Sh4derJockeyを起動

## メモ

- DJ音源をヘッドセットで聞きながらSound2Lightを使うために、VBCableとVB-Audio VoiceMeeter Bananaを使いました
    - Windowsの音声出力を `CABLE In 16ch (VB-Audio Virtual Cable)` に変更
    - VB-Audio VoiceMeeter Banana を起動
        - Stereo Input 1を `CABLE Output` に設定
        - HARDWARE OUTのA1を音を出力したいヘッドセットやスピーカーに設定
- osc-to-midi.js がMIDI信号を送り続けるので、Sh4derJockeyのbindするときはosc-to-midi.jsをCtrl-Cで終了させる必要があります
- Sh4derJockeyのFFTのマイクはWindows設定のデフォルトのマイクが自動参照されるようでした

## License

MIT
