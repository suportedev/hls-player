$(document).ready(function () {

  const root = document.documentElement;
  var pub_i = -1;
  let playing = false;
  let running = false;

  window.api.setStreamingMidia((_event, value) => {
    if (window.StreamingMidia !== undefined) {
      value.map((item, index) => {
        value[index]['PlayedAt'] = window.StreamingMidia.find(i => i.ID === item.ID).PlayedAt;
      })
    }

    if (JSON.stringify(value) === JSON.stringify(window.StreamingMidia)) return;
    if (playing) return;

    window.StreamingMidia = value;
    handleStreamingMidia();
  })

  function handleStreamingMidia() {
    const { StreamingMidia } = window;
    document.getElementById('pub').innerHTML = '';
    StreamingMidia.forEach((schedule, index) => {
      if (schedule.Type === 'video/mp4') {
        let video = document.createElement('video');
        video.muted = true;
        video.setAttribute('preload', 'auto');
        video.setAttribute('id', 'pub-player-' + schedule.ID);
        video.setAttribute('src', schedule.Src);
        video.style.display = 'none';
        document.getElementById('pub').appendChild(video);
      }
    });
    if (!running) pubChecker();
  }

  function pubChecker() {
    running = true;
    const { StreamingMidia } = window;
    const date = new Date();
    const now = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const selectedMidia = StreamingMidia.filter(schedule => schedule.Range.includes(now) && schedule.PlayedAt !== now);

    if (selectedMidia.length) {

      const pubPlayer = new Promise((resolve, reject) => {

        function play() {

          playing = true;

          let last_id = pub_i;
          pub_i++;

          if (pub_i >= selectedMidia.length) {
            pub_i = -1;
            playing = false;

            return resolve(selectedMidia[last_id]);
          }

          const midia = selectedMidia[pub_i];
          handleAnimation('out', midia.Animation);
          playPromisse(midia)
            .then((index) => {
              window.StreamingMidia[index].PlayedAt = now;
              play();
            });
        }
        play();
      });

      pubPlayer
        .then(_midia => {
          handleAnimation('in', _midia.Animation);
          StreamingMidia.forEach((schedule, index) => {
            const video = document.getElementById('pub-player-' + schedule.ID);
            video.currentTime = 0;
          });
          pubChecker();
        });
    } else {
      setTimeout(() => {
        pubChecker();
      }, 5000);
    }

  }

  const playPromisse = (midia) => new Promise((resolve, reject) => {
    const video = document.getElementById('pub-player-' + midia.ID);
    video.style.display = 'block';
    video.play();
    video.addEventListener('ended', () => {
      video.style.display = 'none';
      resolve(window.StreamingMidia.indexOf(midia));
    });
  });


  function handleAnimation(mode, animation) {
    const video = $('#video');
    const root = document.documentElement;

    const anchor = {
      1: 'top left',
      2: 'top center',
      3: 'top right',
      4: 'center left',
      5: 'center center',
      6: 'center right',
      7: 'bottom left',
      8: 'bottom center',
      9: 'bottom right',
    }

    root.style.setProperty('--transform-origin', anchor[animation]);

    if (mode === 'out') {
      video.addClass('zoom-out');
      video.removeClass('zoom-in');
      // video[0].volume = .3;
    } else {
      video.addClass('zoom-in');
      video.removeClass('zoom-out');
      // video[0].volume = 1;
    }
    return;
  }
})


