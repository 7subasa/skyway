const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;

// token作成
const token = new SkyWayAuthToken({
  jti: uuidV4(),
  iat: nowInSec(),
  exp: nowInSec() + 60 * 60 * 24,
  scope: {
    app: {
      id: "a2b2c06f-e0d3-4503-b55b-338ef326509b",  //APPID
      turn: true,
      actions: ['read'],
      channels: [
        {
          id: '*',
          name: '*',
          actions: ['write'],
          members: [
            {
              id: '*',
              name: '*',
              actions: ['write'],
              publication: {
                actions: ['write'],
              },
              subscription: {
                actions: ['write'],
              },
            },
          ],
          sfuBots: [
            {
              actions: ['write'],
              forwardings: [
                {
                  actions: ['write'],
                },
              ],
            },
          ],
        },
      ],
    },
  },
}).encode("vhJTg00u+YT/zkr80CBFVJUyNevpn7FCfuxEaGWu3EA=");  //secretKey

// 通信処理
(async () => {
  // 変数
  const localVideo = document.getElementById('local-video');
  console.log(localVideo);
  const localDispCapture = document.getElementById('disp-capture');
  console.log(localDispCapture);
  const buttonArea = document.getElementById('button-area');
  const remoteMediaArea = document.getElementById('remote-media-area');
  const roomNameInput = document.getElementById('room-name');
  const myId = document.getElementById('my-id');
  const joinButton = document.getElementById('join');
  let dispVideo;

  // 画面共有のビデオ取得
  try {
    const disp = await SkyWayStreamFactory.createDisplayStreams();
    dispVideo = disp["video"];

    dispVideo.attach(localDispCapture);
  } catch (error) {
    console.log('画面共有許可なし');
    
    // ダミー画像
    const dummyDisp = document.createElement('canvas');
    const ctx = dummyDisp.getContext('2d');

    dummyDisp.width = 500;
    dummyDisp.height = 300;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, dummyDisp.width, dummyDisp.height);
    console.log(dummyDisp);

    dispVideo = dummyDisp.captureStream(30);
    localDispCapture.srcObject = dispVideo;
  }

  // 画面共有画面表示
  await localDispCapture.play();


  // 音声+動画の取得 どちらか片方選択可能
  const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();

  // 映像表示(anonymous) 
  // video.attach(localVideo);
  // await localVideo.play();

  // 複数人で通信を行うための処理
  joinButton.onclick = async () => {

    // roomの作成と入室
    // roomNameが空なら何もしない
    if (roomNameInput.value === '') return;

    // tokenを用いてcontext作成(情報生成)
    const context = await SkyWayContext.Create(token);

    // room作成
    const room = await SkyWayRoom.FindOrCreate(context, {
      type: 'p2p',
      name: roomNameInput.value,
    });

    const me = await room.join();

    myId.textContent = me.id;

    // roomに公開
    await me.publish(audio);
    // await me.publish(video);
    await me.publish(dispVideo);

    const subscribeAndAttach = (publication) => {
      if (publication.publisher.id === me.id) return;

      // 各ボタン生成
      const subscribeButton = document.createElement('button');
      subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
      buttonArea.appendChild(subscribeButton);

      subscribeButton.onclick = async () => {
        // 公開しているデータ取得
        const { stream } = await me.subscribe(publication.id);

        let newMedia;
        switch (stream.track.kind) {
          case 'video':
            newMedia = document.createElement('video');
            newMedia.playsInline = true;
            newMedia.autoplay = true;
            break;
          case 'audio':
            newMedia = document.createElement('audio');
            newMedia.controls = true;
            newMedia.autoplay = true;
            break;
          case 'dispVideo':
            newMedia = document.createElement('dispVideo');
            newMedia.controls = true;
            newMedia.autoplay = true;
            break;
          default:
            return;
        }
        stream.attach(newMedia);
        remoteMediaArea.appendChild(newMedia);
      };
    };

    // 公開される音声+動画
    room.publications.forEach(subscribeAndAttach);

    room.onStreamPublished.add((e) => subscribeAndAttach(e.publication));
  };
})();

