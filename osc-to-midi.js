const osc = require('osc');
const easymidi = require('easymidi');
const net = require('net');

// MIDI出力デバイス（環境に合わせて変更）
const midiOutput = new easymidi.Output('loopMIDI');

// IPアドレス（環境に合わせて変更）
const HOST = '0.0.0.0';

// ポート番号（環境に合わせて変更）
const PORT = 3032;

// TCPサーバーの作成
const server = net.createServer((socket) => {
    console.log('クライアントが接続しました:', socket.remoteAddress, socket.remotePort);

    // 生のTCPデータを処理
    let buffer = Buffer.alloc(0); // データの蓄積用バッファ
    socket.on('data', (data) => {
        console.log('生のTCPデータ:', data);
        console.log('生データ（文字列）:', data.toString());

        // データをバッファに追加
        buffer = Buffer.concat([buffer, data]);

        // OSCパケットを処理
        while (buffer.length >= 4) {
            const packetLength = buffer.readUInt32BE(0); // 先頭4バイトで長さを取得
            if (buffer.length < packetLength + 4) break; // データが足りなければ待機

            const oscPacket = buffer.slice(4, 4 + packetLength);
            buffer = buffer.slice(4 + packetLength); // 処理済みデータを削除

            try {
                const msg = osc.readMessage(oscPacket); // OSCメッセージをデコード
                console.log("OSCメッセージ:", msg);

                if (msg.address === "/s2l/out/bpm") {
                    // argsが配列か単一値かをチェック
                    const bpmValue = Array.isArray(msg.args) ? msg.args[0] : msg.args;
                    console.log("BPM値:", bpmValue);

                    // BPM値を14ビットとして扱い、7ビットずつに分割
                    const bpmInt = Math.round(bpmValue); // 小数を整数に
                    const msb = (bpmInt >> 7) & 0x7F; // 上位7ビット（Most Significant Bits）
                    const lsb = bpmInt & 0x7F;         // 下位7ビット（Least Significant Bits）
                    console.log(`分割された値 - MSB: ${msb}, LSB: ${lsb}`);

                    // MIDI CCメッセージを送信
                    // チャンネル0: MSB (CC#24)
                    midiOutput.send('cc', {
                        controller: 24,
                        value: msb,
                        channel: 0
                    });

                    // チャンネル1: LSB (CC#25)
                    midiOutput.send('cc', {
                        controller: 25,
                        value: lsb,
                        channel: 0
                    });
                }
            } catch (err) {
                console.error("OSCメッセージのデコードエラー:", err.message);
            }
        }
    });

    socket.on('end', () => {
        console.log('クライアントが切断しました');
    });

    socket.on('error', (err) => {
        console.error('ソケットエラー:', err.message);
    });
});

// サーバーを指定ポートで起動
server.listen(PORT, HOST, () => {
    console.log(`TCP OSCサーバーがポート ${PORT} で起動しました`);
});

// サーバーエラー処理
server.on('error', (err) => {
    console.error("サーバーエラー:", err.message);
});

// プログラム終了時のクリーンアップ
process.on('SIGINT', () => {
    server.close();
    midiOutput.close();
    console.log("プログラムを終了しました");
    process.exit();
});