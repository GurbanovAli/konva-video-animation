(() => {
  const width = 3840;
  const height = 800;
  const fps = 25;
  const scaleWidth = width / 2.6;
  const scaleHeight = height / 1.5;
  const scaleX = 0.35;
  const scaleY = 0.6;
  const teamColors = [
    'rgba(0, 0, 0, 0)',
    'rgba(255, 255, 255, 0.4)',
    'rgba(255, 0, 0, 0.4)',
  ];

  const main = () => {
    const getTeams = (players) => {
      const teamasObj = players.reduce((acc, player) => {
        const teams = player.reduce((acc, currentPl) => {
          if(typeof currentPl === 'object'){
            acc[currentPl.team] = currentPl.team;
          }
          return acc;
        }, {});
        acc = { ...acc, ...teams };

        return acc;
      }, {});
  
      return Object.values(teamasObj);
    }

    const createRectangle = (teamColor) => {
      const rectangle = new Konva.Shape({
        fill: teamColor,
      });
  
      return rectangle;
    }
  
    const updateRectangle = (index, positions) => {
      rectangleData[index] = positions;
      rectangles[index].sceneFunc(function (context, shape) {
        const [x1, y1, x2, y2] = positions;
  
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y1);
        context.lineTo(x2, y2);
        context.lineTo(x1, y2);
        context.lineTo(x1, y1);
        context.closePath();
        context.fillStrokeShape(shape);
      });
  
      layer.batchDraw();
    }

    const createAnim = (players) => {
      return new Konva.Animation(function (frame) {
        for (let p = 0; p < players.length - 1; p++) {
          const player = players[p][1].tracks_data;
  
          for (let i = 0; i < player.length; i++) {
            const trackId = player[i].track_id;
            const time = frame.time;
            const frameIndex = Math.floor(time / (1000 / fps));
  
            if (frameIndex in data.tracks[trackId]) {
              const frameData = data.tracks[trackId][frameIndex];
              updateRectangle(p, frameData);
            }
          }
        }
      }, layer);
    }

    return { getTeams, createRectangle, createAnim };
  }

  const stage = new Konva.Stage({
    container: 'container',
    width: scaleWidth,
    height: scaleHeight,
    scaleX: scaleX,
    scaleY: scaleY,
  });

  const layer = new Konva.Layer();
  const video = document.createElement('video');
  video.src = 'data/video.mp4';

  const image = new Konva.Image({
    image: video,
    x: 0,
    y: 0,
    width: width,
    height: height,
  });

  const text = new Konva.Text({
    text: 'Loading video...',
    width: width,
    height: height,
    align: 'center',
    verticalAlign: 'middle',
  });

  stage.add(layer);
  layer.add(image);
  layer.add(text);

  const players = Object.entries(data.supertracks);
  const rectangles = [];
  const rectangleData = [];
  
  const { getTeams, createRectangle, createAnim } = main();
  const teams = getTeams(players);
  const anim = createAnim(players);

  for (let i = 0; i < players.length; i++) {
    const teamNumber = teamColors[teams.indexOf(players[i][1].team)];

    rectangleData.push([]);
    rectangles.push(createRectangle(teamNumber));
  }

  for (let i = 0; i < rectangles.length; i++) {
    layer.add(rectangles[i]);
  }

  video.addEventListener('loadedmetadata', function () {
    text.text('Press PLAY...');
    image.width(video.videoWidth);
    image.height(video.videoHeight);
  });

  document.getElementById('play').addEventListener('click', function () {
    text.destroy();
    video.play();
    anim.start();
  });
  document.getElementById('pause').addEventListener('click', function () {
    video.pause();
    anim.stop();
  });
})()
